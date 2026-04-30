import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from 'src/generated/prisma/enums';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement user authentication',
    description: 'Task title',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Add JWT authentication with refresh tokens',
    description: 'Task description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: 'TODO',
    description: 'Task status',
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: 'HIGH',
    description: 'Task priority level',
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    example: 'project-123',
    description: 'Project ID this task belongs to',
  })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({
    example: 'user-456',
    description: 'User ID to assign this task to',
  })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Due date for the task',
  })
  @IsOptional()
  dueDate?: Date;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Implement user authentication',
    description: 'Task title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Add JWT authentication with refresh tokens',
    description: 'Task description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: 'IN_PROGRESS',
    description: 'Task status',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: 'HIGH',
    description: 'Task priority level',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: 'user-456',
    description: 'User ID to assign this task to',
  })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Due date for the task',
  })
  @IsOptional()
  dueDate?: Date;
}

export class TaskResponseDto {
  @ApiProperty({ example: 'task-123', description: 'Task unique identifier' })
  id: string;

  @ApiProperty({
    example: 'Implement authentication',
    description: 'Task title',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'Add JWT auth',
    description: 'Task description',
  })
  description?: string;

  @ApiProperty({ enum: TaskStatus, example: 'TODO' })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: 'HIGH' })
  priority: TaskPriority;

  @ApiProperty({ example: 'project-123' })
  projectId: string;

  @ApiPropertyOptional({ example: 'user-456' })
  assignedToId?: string;

  @ApiProperty({ example: 'user-789' })
  createdById: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  dueDate?: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  updatedAt: Date;
}

export class FilterTasksDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class PaginatedTaskResponseDto {
  @Type(() => TaskResponseDto)
  data: TaskResponseDto[];

  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;

  @IsNumber()
  totalPages: number;
}