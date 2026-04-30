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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskResponseDto, FilterTasksDto } from './dto/task.dto';

@ApiTags('Tasks')
@Controller('api/v1/tasks')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private tasksService: TasksService) { }

  @Get('stats')
  @ApiOperation({ summary: 'Get tasks stats grouped by status' })
  @ApiResponse({ status: 200 })
  async getStats(@Request() req: any) {
    
    const stats = await this.tasksService.getStats(req.user.id);
    return {
      success: true,
      data: stats,
      message: 'Task stats retrieved successfully',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, type: TaskResponseDto })
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
  @ApiOperation({ summary: 'Get all tasks with filtering' })
  @ApiResponse({ status: 200 })
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

    // Remove undefined filters
    Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

    const result = await this.tasksService.findAll(pageNum, pageSizeNum, filters);
    return {
      success: true,
      data: result.data,
      message: 'Tasks retrieved successfully',
      meta: {
        page: result.page,
        limit: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }
    };
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get tasks by project ID' })
  @ApiResponse({ status: 200 })
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

    Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

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
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async findOne(@Param('id') id: string) {
    const task = await this.tasksService.findOne(id);
    return {
      success: true,
      data: task,
      message: 'Task retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    const task = await this.tasksService.update(id, updateTaskDto, req.user.id, req.user.role);
    return {
      success: true,
      data: task,
      message: 'Task updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id') id: string, @Request() req: any) {
    const result = await this.tasksService.delete(id, req.user.id, req.user.role);
    return {
      success: true,
      data: result,
      message: 'Task deleted successfully',
    };
  }



}
