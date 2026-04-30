import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserRole } from 'src/generated/prisma/enums';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  async create(createProjectDto: CreateProjectDto, userId: string, userRole: UserRole) {

    const allowedRoles: UserRole[] = [
      UserRole.ADMIN,
      UserRole.PROJECT_MANAGER
    ];

    // Only ADMIN and PROJECT_MANAGER can create projects
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Only ADMIN and PROJECT_MANAGER can create projects');
    }

    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        ownerId: userId,
      },
    });
  }

  async findAll(page: number, pageSize: number, userId: string, role: string) {

    let where = {};

    if (role === 'PROJECT_MANAGER') {
      where = { ownerId: userId };
    }

    if (role === 'DEVELOPER') {
      where = {
        tasks: {
          some: {
            assignedToId: userId,
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          tasks: true, // para progreso
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
    userRole: UserRole,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Only owner or admin can edit
    if (project.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this project');
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async delete(id: string, userRole: UserRole) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Administrador permitido a eliminar, otros roles denegados
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this project');
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }
}
