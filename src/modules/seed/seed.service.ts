import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { seedProjects, seedUsers } from './data/data.seed';

@Injectable()
export class SeedService {

  constructor(
    private prisma: PrismaService
  ) { }

  async runSeed() {

    await this.cleanDB();

    const users = await this.insertUsers();
    const projects = await this.insertProjects(users);
    await this.insertTasks(users, projects);

    return 'Seed executed';

  }

  private async cleanDB() {
    await this.prisma.task.deleteMany();
    await this.prisma.project.deleteMany();
    await this.prisma.user.deleteMany();
  }

  private async insertUsers() {

    const users = await Promise.all(
      seedUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        return this.prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            password: hashedPassword,
            role: user.role,
          },
        });
      })
    );

    return users;
  }

  private async insertProjects(users: any[]) {
    const admin = users.find(u => u.role === 'ADMIN');
    const pm = users.find(u => u.role === 'PROJECT_MANAGER');

    const projects = await Promise.all(
      seedProjects.map((project, index) => {
        return this.prisma.project.create({
          data: {
            name: project.name,
            description: project.description,
            status: project.status,
            ownerId: index === 1 ? pm.id : admin.id,
          },
        });
      })
    );

    return projects;
  }

  private async insertTasks(users: any[], projects: any[]) {

    const randomUser = (i: number) => users[i % users.length];

    const tasks: any[] = [];

    for (const project of projects) {
      for (let i = 0; i < 15; i++) {

        tasks.push({
          title: `Task ${i + 1}`,
          description: `Task description ${i + 1}`,
          status: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'][i % 4],
          priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4],
          dueDate: new Date(Date.now() + (i + 1) * 86400000),
          projectId: project.id,
          assignedToId: randomUser(i).id,
          createdById: users[0].id,
        });
      }
    }

    await this.prisma.task.createMany({
      data: tasks,
    });
  }


}
