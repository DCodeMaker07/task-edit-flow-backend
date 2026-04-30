import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  ValidationPipe,
  Query,
  Request,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from './dto/project.dto';
import { UserRole } from 'src/generated/prisma/enums';

@SkipThrottle()
@ApiTags('Projects')
@Controller('api/v1/projects')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({
    summary: 'Create a new project',
    description: 'Create a new project (ADMIN and PROJECT_MANAGER only)',
  })
  @ApiBody({
    type: CreateProjectDto,
    examples: {
      example1: {
        value: {
          name: 'E-Commerce Platform',
          description: 'Build a modern e-commerce platform',
          status: 'ACTIVE',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body(ValidationPipe) createProjectDto: CreateProjectDto,
    @Request() req: any,
  ) {
    const project = await this.projectsService.create(
      createProjectDto,
      req.user.id,
      req.user.role,
    );
    return {
      success: true,
      data: project,
      message: 'Project created successfully',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects',
    description:
      'Retrieve projects with pagination (filtered by role: ADMIN sees all, PROJECT_MANAGER sees owned, DEVELOPER sees assigned)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, example: 10, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    example: {
      success: true,
      data: [{ id: 'proj-123', name: 'Project 1' }],
      meta: { page: 1, limit: 10, total: 5, totalPages: 1 },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Request() req?: any,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;

    const result = await this.projectsService.findAll(
      pageNum,
      pageSizeNum,
      req.user.id,
      req.user.role,
    );

    return {
      success: true,
      data: result.data,
      message: 'Projects retrieved successfully',
      meta: {
        page: result.page,
        limit: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project by ID',
    description: 'Retrieve a specific project with its details and tasks',
  })
  @ApiParam({ name: 'id', description: 'Project unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    return {
      success: true,
      data: project,
      message: 'Project retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update project',
    description: 'Update project details (owner or ADMIN only)',
  })
  @ApiParam({ name: 'id', description: 'Project unique identifier' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ) {
    const project = await this.projectsService.update(
      id,
      updateProjectDto,
      req.user.id,
      req.user.role,
    );
    return {
      success: true,
      data: project,
      message: 'Project updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete project',
    description: 'Delete a project (ADMIN only)',
  })
  @ApiParam({ name: 'id', description: 'Project unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string, @Request() req: any) {
    const result = await this.projectsService.delete(id, req.user.role);
    return {
      success: true,
      data: result,
      message: 'Project deleted successfully',
    };
  }
}
