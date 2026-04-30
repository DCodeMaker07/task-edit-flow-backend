import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { PrismaService } from '../../prisma.service';
import { ProjectStatus, UserRole } from 'src/generated/prisma/enums';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a project as ADMIN', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'Test Description',
        status: ProjectStatus.ACTIVE,
      };

      const mockProject = {
        id: 'project-1',
        ...createProjectDto,
        ownerId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrismaService.project.create as jest.Mock).mockResolvedValue(
        mockProject,
      );

      const result = await service.create(
        createProjectDto,
        'user-1',
        UserRole.ADMIN,
      );

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.project.create).toHaveBeenCalledWith({
        data: {
          ...createProjectDto,
          ownerId: 'user-1',
        },
      });
    });

    it('should create a project as PROJECT_MANAGER', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
      };

      const mockProject = {
        id: 'project-1',
        ...createProjectDto,
        ownerId: 'user-1',
      };

      (mockPrismaService.project.create as jest.Mock).mockResolvedValue(
        mockProject,
      );

      const result = await service.create(
        createProjectDto,
        'user-1',
        UserRole.PROJECT_MANAGER,
      );

      expect(result).toEqual(mockProject);
    });

    it('should throw ForbiddenException for DEVELOPER role', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
      };

      await expect(
        service.create(createProjectDto, 'user-1', UserRole.DEVELOPER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return all projects for ADMIN', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          ownerId: 'user-1',
          tasks: [],
        },
      ];

      (mockPrismaService.project.findMany as jest.Mock).mockResolvedValue(
        mockProjects,
      );
      (mockPrismaService.project.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(1, 10, 'user-1', 'ADMIN');

      expect(result.data).toEqual(mockProjects);
      expect(result.total).toBe(1);
    });

    it('should return only owned projects for PROJECT_MANAGER', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          ownerId: 'user-1',
          tasks: [],
        },
      ];

      (mockPrismaService.project.findMany as jest.Mock).mockResolvedValue(
        mockProjects,
      );
      (mockPrismaService.project.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(1, 10, 'user-1', 'PROJECT_MANAGER');

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ownerId: 'user-1' },
        }),
      );
    });

    it('should return projects with assigned tasks for DEVELOPER', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          tasks: [{ id: 'task-1', assignedToId: 'user-1' }],
        },
      ];

      (mockPrismaService.project.findMany as jest.Mock).mockResolvedValue(
        mockProjects,
      );
      (mockPrismaService.project.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(1, 10, 'user-1', 'DEVELOPER');

      expect(result.data).toEqual(mockProjects);
    });
  });

  describe('findOne', () => {
    it('should return a project with owner and tasks', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
        owner: {
          id: 'user-1',
          name: 'Owner',
          email: 'owner@example.com',
        },
        tasks: [
          {
            id: 'task-1',
            title: 'Task 1',
            status: 'TODO',
            priority: 'HIGH',
          },
        ],
      };

      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );

      const result = await service.findOne('project-1');

      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update project as owner', async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Project',
        status: ProjectStatus.ARCHIVED,
      };

      const mockProject = {
        id: 'project-1',
        name: 'Original Project',
        ownerId: 'user-1',
      };

      const mockUpdatedProject = { ...mockProject, ...updateProjectDto };

      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );
      (mockPrismaService.project.update as jest.Mock).mockResolvedValue(
        mockUpdatedProject,
      );

      const result = await service.update(
        'project-1',
        updateProjectDto,
        'user-1',
        UserRole.PROJECT_MANAGER,
      );

      expect(result).toEqual(mockUpdatedProject);
    });

    it('should allow ADMIN to update any project', async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated by Admin',
      };

      const mockProject = {
        id: 'project-1',
        ownerId: 'user-2',
      };

      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );
      (mockPrismaService.project.update as jest.Mock).mockResolvedValue({
        ...mockProject,
        ...updateProjectDto,
      });

      const result = await service.update(
        'project-1',
        updateProjectDto,
        'user-1',
        UserRole.ADMIN,
      );

      expect(mockPrismaService.project.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not owner or admin', async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated',
      };

      const mockProject = {
        id: 'project-1',
        ownerId: 'user-2',
      };

      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );

      await expect(
        service.update(
          'project-1',
          updateProjectDto,
          'user-1',
          UserRole.DEVELOPER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if project not found', async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated',
      };

      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.update('non-existent', updateProjectDto, 'user-1', UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete project as ADMIN', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
      };

      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );
      (mockPrismaService.project.delete as jest.Mock).mockResolvedValue(null);

      const result = await service.delete('project-1', UserRole.ADMIN);

      expect(result).toEqual({ message: 'Project deleted successfully' });
      expect(mockPrismaService.project.delete).toHaveBeenCalledWith({
        where: { id: 'project-1' },
      });
    });

    it('should throw ForbiddenException for non-ADMIN', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'Test Project',
      };

      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );

      await expect(
        service.delete('project-1', UserRole.PROJECT_MANAGER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if project not found', async () => {
      (mockPrismaService.project.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.delete('non-existent', UserRole.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
