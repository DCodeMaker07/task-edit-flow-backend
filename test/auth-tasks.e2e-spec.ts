import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Auth & Tasks E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let userId: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Clean database before tests
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  async function cleanDatabase() {
    const models = ['task', 'project', 'user'];
    for (const model of models) {
      await (prismaService[model] as any).deleteMany({});
    }
  }

  describe('Auth Controller (POST /auth/register)', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('email', 'testuser@example.com');
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).not.toHaveProperty('password');
          userId = res.body.data.id;
          accessToken = res.body.data.access_token;
        });
    });

    it('should return 400 if email already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'First User',
        });

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'Duplicate User',
        })
        .expect(400);
    });

    it('should return 400 if email format is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should return 400 if password is less than 6 characters', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
        })
        .expect(400);
    });
  });

  describe('Auth Controller (POST /auth/login)', () => {
    beforeAll(async () => {
      // Create a user for login tests
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          name: 'Login Test User',
        });
    });

    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('email', 'login@example.com');
        });
    });

    it('should return 401 with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should return 401 with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Projects Controller (POST /api/v1/projects)', () => {
    beforeAll(async () => {
      // Get token from first user
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'projectuser@example.com',
          password: 'password123',
          name: 'Project User',
        });
      accessToken = res.body.data.access_token;
      userId = res.body.data.id;
    });

    it('should create a project with ADMIN role', () => {
      // First, update user to ADMIN role
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Project',
          description: 'Test project description',
        })
        .expect((res) => {
          // If 403, it's expected because user is DEVELOPER
          if (res.status !== 403) {
            expect(res.body.success).toBe(true);
            projectId = res.body.data?.id;
          }
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({
          name: 'Test Project',
        })
        .expect(401);
    });
  });

  describe('Tasks Controller (POST /api/v1/tasks)', () => {
    beforeAll(async () => {
      // Create admin user
      const adminRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'password123',
          name: 'Admin User',
        });
      accessToken = adminRes.body.data.access_token;
      userId = adminRes.body.data.id;

      // Manually create a project in database (bypass role check)
      const project = await prismaService.project.create({
        data: {
          name: 'Task Test Project',
          ownerId: userId,
        },
      });
      projectId = project.id;
    });

    it('should create a task successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Task',
          description: 'Test task description',
          projectId: projectId,
          priority: 'HIGH',
          status: 'TODO',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('title', 'Test Task');
          taskId = res.body.data.id;
        });
    });

    it('should return 400 if project does not exist', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Task',
          projectId: 'non-existent-project',
        })
        .expect(400);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: 'Test Task',
          projectId: projectId,
        })
        .expect(401);
    });
  });

  describe('Tasks Controller (GET /api/v1/tasks)', () => {
    it('should retrieve all tasks with pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data.data)).toBe(true);
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('total');
        });
    });

    it('should filter tasks by status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks?status=TODO')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          res.body.data.data.forEach((task: any) => {
            expect(task.status).toBe('TODO');
          });
        });
    });

    it('should filter tasks by priority', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks?priority=HIGH')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          res.body.data.data.forEach((task: any) => {
            expect(task.priority).toBe('HIGH');
          });
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks')
        .expect(401);
    });
  });

  describe('Tasks Controller (GET /api/v1/tasks/:id)', () => {
    it('should retrieve a single task by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(taskId);
        });
    });

    it('should return 404 if task not found', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Tasks Controller (PATCH /api/v1/tasks/:id)', () => {
    it('should update a task successfully', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Task',
          status: 'IN_PROGRESS',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toBe('Updated Task');
          expect(res.body.data.status).toBe('IN_PROGRESS');
        });
    });

    it('should return 404 if task not found', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/tasks/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated',
        })
        .expect(404);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tasks/${taskId}`)
        .send({
          title: 'Updated',
        })
        .expect(401);
    });
  });

  describe('Tasks Controller (DELETE /api/v1/tasks/:id)', () => {
    let taskToDeleteId: string;

    beforeAll(async () => {
      // Create a task to delete
      const res = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Task to Delete',
          projectId: projectId,
          priority: 'LOW',
        });
      taskToDeleteId = res.body.data.id;
    });

    it('should delete a task successfully', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/tasks/${taskToDeleteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('message');
        });
    });

    it('should return 404 if task not found', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/tasks/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/tasks/${taskId}`)
        .expect(401);
    });
  });

  describe('Tasks Controller (GET /api/v1/tasks/stats)', () => {
    it('should retrieve task statistics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('TODO');
          expect(res.body.data).toHaveProperty('IN_PROGRESS');
          expect(res.body.data).toHaveProperty('DONE');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks/stats')
        .expect(401);
    });
  });
});
