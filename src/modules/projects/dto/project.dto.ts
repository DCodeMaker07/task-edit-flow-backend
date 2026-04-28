import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from 'src/generated/prisma/enums';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

export class ProjectResponseDto {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  ownerId: string;
  createdAt: Date;
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
