import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { PrismaService } from './prisma.service';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [AuthModule, UsersModule, ProjectsModule, TasksModule, SeedModule],
  providers: [PrismaService],
})
export class AppModule {}
