import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { UserRole } from '../src/generated/prisma/enums';

describe('Projects E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let adminId: string;
  let projectManagerToken: string;
  let projectManagerId: string;
  let developerToken: string;
  let developerId: string;
  let projectId: string;

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
    await cleanDatabase();

    // Create users with different roles
    const adminRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
      });
    adminToken = adminRes.body.data.access_token;
    adminId = adminRes.body.data.id;

    // Set admin role
    await prismaService.user.update({
      where: { id: adminId },
      data: { role: UserRole.ADMIN },
    });

    const pmRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'pm@example.com',
        password: 'password123',
        name: 'Project Manager',
      });
    projectManagerToken = pmRes.body.data.access_token;
    projectManagerId = pmRes.body.data.id;

    // Set PROJECT_MANAGER role
    await prismaService.user.update({
      where: { id: projectManagerId },
      data: { role: UserRole.PROJECT_MANAGER },
    });

    const devRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'dev@example.com',
        password: 'password123',
        name: 'Developer',
      });
    developerToken = devRes.body.data.access_token;
    developerId = devRes.body.data.id;
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

  describe('POST /api/v1/projects', () => {
    it('should create a project as ADMIN', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Project',
          description: 'Created by admin',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('Admin Project');
          projectId = res.body.data.id;
        });
    });

    it('should create a project as PROJECT_MANAGER', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .send({
          name: 'PM Project',
          description: 'Created by project manager',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('PM Project');
        });
    });

    it('should reject project creation for DEVELOPER', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${developerToken}`)
        .send({
          name: 'Dev Project',
        })
        .expect(403);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({
          name: 'No Auth Project',
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/projects', () => {
    it('should retrieve all projects for ADMIN', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('total');
        });
    });

    it('should retrieve only owned projects for PROJECT_MANAGER', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          // All projects should be owned by this user
          res.body.data.forEach((project: any) => {
            expect(project.ownerId).toBe(projectManagerId);
          });
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects?page=1&pageSize=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(401);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should retrieve a project by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(projectId);
        });
    });

    it('should return 404 if project not found', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/projects/:id', () => {
    it('should update a project as owner', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Project Name',
          status: 'ARCHIVED',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Updated Project Name');
          expect(res.body.data.status).toBe('ARCHIVED');
        });
    });

    it('should allow ADMIN to update any project', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated by admin',
        })
        .expect(200);
    });

    it('should reject update by non-owner non-admin', () => {
      // Create a project owned by PROJECT_MANAGER
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${projectManagerToken}`)
        .send({
          name: 'PM Only Project',
        })
        .then((res) => {
          const pmProjectId = res.body.data.id;
          // Try to update as DEVELOPER
          return request(app.getHttpServer())
            .patch(`/api/v1/projects/${pmProjectId}`)
            .set('Authorization', `Bearer ${developerToken}`)
            .send({
              name: 'Hacked',
            })
            .expect(403);
        });
    });

    it('should return 404 if project not found', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/projects/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated',
        })
        .expect(404);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}`)
        .send({
          name: 'Updated',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    let projectToDelete: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Project to Delete',
        });
      projectToDelete = res.body.data.id;
    });

    it('should delete a project as ADMIN', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('message');
        });
    });

    it('should reject deletion by non-ADMIN', () => {
      // Create another project to delete
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Another Project',
        })
        .then((res) => {
          const projId = res.body.data.id;
          // Try to delete as PROJECT_MANAGER
          return request(app.getHttpServer())
            .delete(`/api/v1/projects/${projId}`)
            .set('Authorization', `Bearer ${projectManagerToken}`)
            .expect(403);
        });
    });

    it('should return 404 if project not found', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/projects/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectId}`)
        .expect(401);
    });
  });
});
