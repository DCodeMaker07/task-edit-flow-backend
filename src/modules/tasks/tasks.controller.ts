import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
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
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskResponseDto,
  FilterTasksDto,
} from './dto/task.dto';

@SkipThrottle()
@ApiTags('Tasks')
@Controller('api/v1/tasks')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get task statistics',
    description: 'Retrieve task count grouped by status for current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Task statistics retrieved successfully',
    example: {
      success: true,
      data: {
        TODO: 5,
        IN_PROGRESS: 3,
        IN_REVIEW: 2,
        DONE: 10,
      },
      message: 'Task stats retrieved successfully',
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@Request() req: any) {
    const stats = await this.tasksService.getStats(req.user.id);
    return {
      success: true,
      data: stats,
      message: 'Task stats retrieved successfully',
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new task',
    description: 'Create a new task in a project (requires authentication)',
  })
  @ApiBody({
    type: CreateTaskDto,
    examples: {
      example1: {
        value: {
          title: 'Implement login feature',
          description: 'Add JWT authentication',
          projectId: 'project-123',
          priority: 'HIGH',
          status: 'TODO',
          assignedToId: 'user-456',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid project or assigned user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: any,
  ) {
    const task = await this.tasksService.create(createTaskDto, req.user.id);
    return {
      success: true,
      data: task,
      message: 'Task created successfully',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks with filtering',
    description: 'Retrieve paginated tasks with optional filters',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, example: 10, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiQuery({ name: 'assignedTo', required: false, description: 'User ID' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    example: {
      success: true,
      data: {
        data: [
          {
            id: 'task-123',
            title: 'Task 1',
            status: 'TODO',
            priority: 'HIGH',
          },
        ],
      },
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('projectId') projectId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;

    const filters: FilterTasksDto = {
      status: status as any,
      priority: priority as any,
      assignedTo,
      projectId,
    };

    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key],
    );

    const result = await this.tasksService.findAll(pageNum, pageSizeNum, filters);
    return {
      success: true,
      data: result.data,
      message: 'Tasks retrieved successfully',
      meta: {
        page: result.page,
        limit: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Get('project/:projectId')
  @ApiOperation({
    summary: 'Get tasks by project',
    description: 'Retrieve all tasks for a specific project',
  })
  @ApiParam({ name: 'projectId', description: 'Project unique identifier' })
  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, example: 10, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Project tasks retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getByProject(
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;

    const filters: FilterTasksDto = {
      status: status as any,
      priority: priority as any,
      assignedTo,
    };

    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key],
    );

    const result = await this.tasksService.getTasksByProject(
      projectId,
      pageNum,
      pageSizeNum,
      filters,
    );
    return {
      success: true,
      data: result,
      message: 'Project tasks retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Retrieve a specific task by its ID',
  })
  @ApiParam({ name: 'id', description: 'Task unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    const task = await this.tasksService.findOne(id);
    return {
      success: true,
      data: task,
      message: 'Task retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update task',
    description: 'Update task details (creator, admin, or project owner only)',
  })
  @ApiParam({ name: 'id', description: 'Task unique identifier' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    const task = await this.tasksService.update(
      id,
      updateTaskDto,
      req.user.id,
      req.user.role,
    );
    return {
      success: true,
      data: task,
      message: 'Task updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete task',
    description: 'Delete a task (admin or project owner only)',
  })
  @ApiParam({ name: 'id', description: 'Task unique identifier' })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string, @Request() req: any) {
    const result = await this.tasksService.delete(
      id,
      req.user.id,
      req.user.role,
    );
    return {
      success: true,
      data: result,
      message: 'Task deleted successfully',
    };
  }
}
