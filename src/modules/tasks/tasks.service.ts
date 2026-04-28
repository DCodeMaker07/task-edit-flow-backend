import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserRole } from 'src/generated/prisma/enums';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const { projectId, assignedToId, ...rest } = createTaskDto;

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    // Verify assigned user exists if provided
    if (assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: assignedToId },
      });

      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    return this.prisma.task.create({
      data: {
        ...rest,
        projectId,
        assignedToId,
        createdById: userId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    filters?: FilterTasksDto,
  ) {
    const skip = (page - 1) * pageSize;

    // Build where clause based on filters
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assignedTo) {
      where.assignedToId = filters.assignedTo;
    }

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: tasks,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: UserRole) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify assigned user exists if provided
    if (updateTaskDto.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateTaskDto.assignedToId },
      });

      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    // Check permissions - creator, admin, or project owner can update
    const project = await this.prisma.project.findUnique({
      where: { id: task.projectId },
    });

    const isCreator = task.createdById === userId;
    const isAdmin = userRole === UserRole.ADMIN;
    const isProjectOwner = project?.ownerId === userId;

    if (!isCreator && !isAdmin && !isProjectOwner) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check permissions - creator, admin, or project owner can delete
    const project = await this.prisma.project.findUnique({
      where: { id: task.projectId },
    });

    const isAdmin = userRole === UserRole.ADMIN;
    const isProjectOwner = project?.ownerId === userId;

    if (!isAdmin && !isProjectOwner) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }

  async getTasksByProject(
    projectId: string,
    page: number = 1,
    pageSize: number = 10,
    filters?: FilterTasksDto,
  ) {
    const skip = (page - 1) * pageSize;

    const where: any = {
      projectId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assignedTo) {
      where.assignedToId = filters.assignedTo;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: tasks,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
