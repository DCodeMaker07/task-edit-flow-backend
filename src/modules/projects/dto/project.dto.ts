import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from 'src/generated/prisma/enums';

export class CreateProjectDto {
  @ApiProperty({
    example: 'E-Commerce Platform',
    description: 'Project name',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Build a modern e-commerce platform with payment integration',
    description: 'Project description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ProjectStatus,
    example: 'ACTIVE',
    description: 'Project status',
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'E-Commerce Platform v2',
    description: 'Project name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Build a modern e-commerce platform with payment integration',
    description: 'Project description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ProjectStatus,
    example: 'ARCHIVED',
    description: 'Project status',
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

export class ProjectResponseDto {
  @ApiProperty({ example: 'project-123', description: 'Project unique identifier' })
  id: string;

  @ApiProperty({
    example: 'E-Commerce Platform',
    description: 'Project name',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Build a modern e-commerce platform',
    description: 'Project description',
  })
  description?: string;

  @ApiProperty({ enum: ProjectStatus, example: 'ACTIVE' })
  status: ProjectStatus;

  @ApiProperty({ example: 'user-123', description: 'Project owner ID' })
  ownerId: string;

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  updatedAt: Date;
}

export class PaginatedProjectResponseDto {
  @Type(() => ProjectResponseDto)
  data: ProjectResponseDto[];

  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;

  @IsNumber()
  totalPages: number;
}
