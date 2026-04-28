import { ProjectStatus, TaskPriority, TaskStatus, UserRole } from "src/generated/prisma/enums";

export interface SeedUser {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface SeedProject {
  name: string;
  description?: string | null;
  status: ProjectStatus;
  ownerId: string;
}

export interface SeedTask {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  projectId: string;
  assignedToId?: string | null;
  createdById: string;
}

export const seedUsers: SeedUser[] = [
  {
    email: "admin@taskflow.com",
    name: "Admin User",
    password: "123456",
    role: UserRole.ADMIN,
  },
  {
    email: "pm@taskflow.com",
    name: "Project Manager",
    password: "123456",
    role: UserRole.PROJECT_MANAGER,
  },
  {
    email: "dev@taskflow.com",
    name: "Developer User",
    password: "123456",
    role: UserRole.DEVELOPER,
  },
];

export const seedProjects: SeedProject[] = [
  {
    name: "TaskFlow Core",
    description: "Main system development",
    status: ProjectStatus.ACTIVE,
    ownerId: "user-admin",
  },
  {
    name: "Mobile App",
    description: "React Native app",
    status: ProjectStatus.ACTIVE,
    ownerId: "user-pm",
  },
  {
    name: "Legacy Migration",
    description: "System migration",
    status: ProjectStatus.ARCHIVED,
    ownerId: "user-admin",
  },
];

const statuses = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

const priorities = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.CRITICAL,
];

const users = ["user-admin", "user-pm", "user-dev"];

const generateTasksForProject = (projectId: string, createdById: string): SeedTask[] => {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: `${projectId}-task-${i + 1}`,
    title: `Task ${i + 1} - ${projectId}`,
    description: `Description for task ${i + 1}`,
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    dueDate: new Date(Date.now() + (i + 1) * 86400000),
    projectId,
    assignedToId: users[i % users.length],
    createdById,
  }));
};

export const seedTasks: SeedTask[] = [
  ...generateTasksForProject("project-1", "user-admin"),
  ...generateTasksForProject("project-2", "user-pm"),
  ...generateTasksForProject("project-3", "user-admin"),
];