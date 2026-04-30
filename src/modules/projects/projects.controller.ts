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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
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
  constructor(private projectsService: ProjectsService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, type: ProjectResponseDto })
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
  @ApiOperation({ summary: 'Get all projects with pagination' })
  @ApiResponse({ status: 200 })
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
      req.user.role
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
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    return {
      success: true,
      data: project,
      message: 'Project retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
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
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id') id: string, @Request() req: any) {
    const result = await this.projectsService.delete(id, req.user.role);
    return {
      success: true,
      data: result,
      message: 'Project deleted successfully',
    };
  }
}
