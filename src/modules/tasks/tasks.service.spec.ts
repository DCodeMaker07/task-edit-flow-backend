import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

import { UserRole, TaskStatus, TaskPriority } from 'src/generated/prisma/enums';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto } from './dto/task.dto';
import { PrismaService } from '../../prisma.service';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: 'project-1',
        assignedToId: 'user-2',
      };

      const mockProject = { id: 'project-1', name: 'Test Project' };
      const mockAssignedUser = { id: 'user-2', name: 'Assigned User' };
      const mockTask = {
        id: 'task-1',
        ...createTaskDto,
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: mockAssignedUser,
        createdBy: { id: 'user-1', name: 'Creator' },
        project: mockProject,
      };

      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(
        mockAssignedUser,
      );
      (mockPrismaService.task.create as jest.Mock).mockResolvedValue(
        mockTask,
      );

      const result = await service.create(createTaskDto, 'user-1');

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: createTaskDto.projectId },
      });
      expect(mockPrismaService.task.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if project not found', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        projectId: 'non-existent-project',
      };

      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.create(createTaskDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if assigned user not found', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        projectId: 'project-1',
        assignedToId: 'non-existent-user',
      };

      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue({
        id: 'project-1',
      });
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(createTaskDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
        },
      ];

      (mockPrismaService.task.findMany as jest.Mock).mockResolvedValue(
        mockTasks,
      );
      (mockPrismaService.task.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(mockTasks);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should filter tasks by status', async () => {
      const filters: FilterTasksDto = {
        status: TaskStatus.IN_PROGRESS,
      };

      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          status: TaskStatus.IN_PROGRESS,
        },
      ];

      (mockPrismaService.task.findMany as jest.Mock).mockResolvedValue(
        mockTasks,
      );
      (mockPrismaService.task.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(1, 10, filters);

      expect(result.data).toEqual(mockTasks);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: TaskStatus.IN_PROGRESS,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.DONE,
      };

      const mockTask = {
        id: 'task-1',
        title: 'Original Task',
        status: TaskStatus.TODO,
        projectId: 'project-1',
        createdById: 'user-1',
      };

      const mockProject = { id: 'project-1', ownerId: 'user-1' };
      const mockUpdatedTask = { ...mockTask, ...updateTaskDto };

      (mockPrismaService.task.findUnique as jest.Mock).mockResolvedValue(
        mockTask,
      );
      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );
      (mockPrismaService.task.update as jest.Mock).mockResolvedValue(
        mockUpdatedTask,
      );

      const result = await service.update(
        'task-1',
        updateTaskDto,
        'user-1',
        UserRole.DEVELOPER,
      );

      expect(mockPrismaService.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1' },
        }),
      );
    });

    it('should throw NotFoundException if task not found', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated' };

      (mockPrismaService.task.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.update('non-existent', updateTaskDto, 'user-1', UserRole.DEVELOPER),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user lacks permission', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated' };

      const mockTask = {
        id: 'task-1',
        createdById: 'user-2',
        projectId: 'project-1',
      };

      const mockProject = { id: 'project-1', ownerId: 'user-3' };

      (mockPrismaService.task.findUnique as jest.Mock).mockResolvedValue(
        mockTask,
      );
      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );

      await expect(
        service.update('task-1', updateTaskDto, 'user-1', UserRole.DEVELOPER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete a task successfully', async () => {
      const mockTask = {
        id: 'task-1',
        projectId: 'project-1',
      };

      const mockProject = { id: 'project-1', ownerId: 'user-1' };

      (mockPrismaService.task.findUnique as jest.Mock).mockResolvedValue(
        mockTask,
      );
      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );
      (mockPrismaService.task.delete as jest.Mock).mockResolvedValue(null);

      const result = await service.delete(
        'task-1',
        'user-1',
        UserRole.PROJECT_MANAGER,
      );

      expect(result).toEqual({ message: 'Task deleted successfully' });
      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      (mockPrismaService.task.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.delete('non-existent', 'user-1', UserRole.DEVELOPER),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user lacks permission', async () => {
      const mockTask = {
        id: 'task-1',
        projectId: 'project-1',
      };

      const mockProject = { id: 'project-1', ownerId: 'user-2' };

      (mockPrismaService.task.findUnique as jest.Mock).mockResolvedValue(
        mockTask,
      );
      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );

      await expect(
        service.delete('task-1', 'user-1', UserRole.DEVELOPER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStats', () => {
    it('should return task statistics grouped by status', async () => {
      const mockStats = [
        { status: TaskStatus.TODO, _count: { status: 5 } },
        { status: TaskStatus.IN_PROGRESS, _count: { status: 3 } },
        { status: TaskStatus.DONE, _count: { status: 7 } },
      ];

      (mockPrismaService.task.groupBy as jest.Mock).mockResolvedValue(
        mockStats,
      );

      const result = await service.getStats('user-1');

      expect(result).toEqual({
        TODO: 5,
        IN_PROGRESS: 3,
        IN_REVIEW: 0,
        DONE: 7,
      });
    });
  });
});
