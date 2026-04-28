# TaskFlow Pro - Backend API

A production-ready task management system API built with NestJS, PostgreSQL, and Prisma ORM.

## 🚀 Caracteristicas

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - ADMIN, PROJECT_MANAGER, DEVELOPER roles
- ✅ **Modular Architecture** - Clean, scalable, and maintainable code
- ✅ **RESTful API** - Well-structured endpoints with versioning
- ✅ **Database** - PostgreSQL with Prisma ORM
- ✅ **Validation** - DTOs with class-validator and class-transformer
- ✅ **Error Handling** - Comprehensive exception handling with standardized responses
- ✅ **Swagger Documentation** - Auto-generated API documentation
- ✅ **Docker Support** - Production-ready Dockerfile and docker-compose
- ✅ **Seed Data** - Pre-populated database with test users and projects

## 📋 Stack Tecnológico

- **Runtime**: Node.js 22 (Alpine)
- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **Database**: PostgreSQL 17
- **ORM**: Prisma 6
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcrypt
- **API Documentation**: Swagger/OpenAPI
- **Container**: Docker & Docker Compose

## 📁 Estructura de la API

```
└── 📁backend
    └── 📁prisma
        └── 📁migrations
            └── 📁20260427195207_init
                ├── migration.sql
            ├── migration_lock.toml
        ├── schema.prisma
    └── 📁src
        └── 📁common
            └── 📁decorators
                ├── roles.decorator.ts
            └── 📁filters
                ├── all-exceptions.filter.ts
            └── 📁guards
                ├── auth.guard.ts
                ├── roles.guard.ts
            └── 📁interceptors
                ├── response.interceptor.ts
        └── 📁config
            ├── envs.ts
        └── 📁generated
            └── 📁prisma
                └── 📁internal
                    ├── class.ts
                    ├── prismaNamespace.ts
                    ├── prismaNamespaceBrowser.ts
                └── 📁models
                    ├── Project.ts
                    ├── Task.ts
                    ├── User.ts
                ├── browser.ts
                ├── client.ts
                ├── commonInputTypes.ts
                ├── enums.ts
                ├── models.ts
        └── 📁modules
            └── 📁auth
                └── 📁dto
                    ├── auth.dto.ts
                └── 📁strategies
                    ├── jwt.strategy.ts
                ├── auth.controller.ts
                ├── auth.module.ts
                ├── auth.service.ts
            └── 📁projects
                └── 📁dto
                    ├── project.dto.ts
                ├── projects.controller.ts
                ├── projects.module.ts
                ├── projects.service.ts
            └── 📁seed
                └── 📁data
                    ├── data.seed.ts
                ├── seed.controller.ts
                ├── seed.module.ts
                ├── seed.service.ts
            └── 📁tasks
                └── 📁dto
                    ├── task.dto.ts
                ├── tasks.controller.ts
                ├── tasks.module.ts
                ├── tasks.service.ts
            └── 📁users
                └── 📁dto
                    ├── user.dto.ts
                ├── users.controller.ts
                ├── users.module.ts
                ├── users.service.ts
        ├── app.controller.spec.ts
        ├── app.controller.ts
        ├── app.module.ts
        ├── app.service.ts
        ├── main.ts
        ├── prisma.service.ts
    └── 📁test
        ├── app.e2e-spec.ts
        ├── jest-e2e.json
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── .prettierrc
    ├── docker-compose.yaml
    ├── eslint.config.mjs
    ├── nest-cli.json
    ├── package.json
    ├── pnpm-lock.yaml
    ├── prisma.config.ts
    ├── README.md
    ├── tsconfig.build.json
    └── tsconfig.json
```

## 🔐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Users (Admin only)
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - Get all users (paginated)
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Projects
- `POST /api/v1/projects` - Create project (ADMIN, PROJECT_MANAGER)
- `GET /api/v1/projects` - Get all projects
- `GET /api/v1/projects/:id` - Get project by ID
- `PATCH /api/v1/projects/:id` - Update project (owner or admin)
- `DELETE /api/v1/projects/:id` - Delete project (owner or admin)

### Tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - Get all tasks with filtering
- `GET /api/v1/tasks/project/:projectId` - Get tasks by project
- `GET /api/v1/tasks/:id` - Get task by ID
- `PATCH /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

## 🔑 Roles

### ADMIN
- Gestionar todos los usuarios
- Ver todos los proyectos y tareas
- Acceso completo al sistema

### PROJECT_MANAGER
- Crear proyectos
- Gestionar proyectos y tareas propias
- Asignar tareas a desarrolladores

### DEVELOPER
- Ver las tareas asignadas
- Actualizar las propias tareas
- Ver los proyectos a los que están asignadas

## 📊 Database Schema

### User
- `id` - Unique identifier
- `email` - Unique email address
- `name` - User name
- `password` - Hashed password
- `role` - User role (ADMIN, PROJECT_MANAGER, DEVELOPER)
- `avatarUrl` - Avatar URL (optional)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Project
- `id` - Unique identifier
- `name` - Project name
- `description` - Project description
- `status` - Status (ACTIVE, ARCHIVED)
- `ownerId` - Owner user ID
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Task
- `id` - Unique identifier
- `title` - Task title
- `description` - Task description
- `status` - Status (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- `priority` - Priority (LOW, MEDIUM, HIGH, CRITICAL)
- `projectId` - Associated project ID
- `assignedToId` - Assigned user ID (optional)
- `createdById` - Creator user ID
- `dueDate` - Due date (optional)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- pnpm 10+
- PostgreSQL 17+ (or Docker)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up PostgreSQL database** (Option A: Local)
```bash
# Ensure PostgreSQL is running
# Update DATABASE_URL in .env

# Run migrations
pnpm prisma migrate dev

# Seed database
pnpm prisma:seed
```

**Option B: Docker**
```bash
docker-compose -f docker-compose.dev.yml up -d
pnpm prisma migrate dev
pnpm prisma:seed
```

5. **Run the application**
```bash
# Development
pnpm start:dev

# Production build
pnpm build
pnpm start:prod
```

### Application URLs
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

### Test Credentials
```
Admin:
  Email: admin@taskflow.com
  Password: admin123

Project Manager:
  Email: pm@taskflow.com
  Password: pm123

Developer:
  Email: dev@taskflow.com
  Password: dev123
```

## 🐳 Docker Deployment

### Quick Start
```bash
docker-compose up --build
```

This will:
1. Build the NestJS application
2. Start PostgreSQL database
3. Run database migrations
4. Start the backend server

### Development with Docker
```bash
# Start only PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Run migrations and seed locally
pnpm prisma migrate dev
pnpm prisma:seed

# Start development server
pnpm start:dev
```

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL=postgresql://taskflow:taskflow123@postgres:5432/taskflow_db
JWT_SECRET=your-strong-secret-key
JWT_EXPIRATION=3600
PORT=3000
NODE_ENV=production
API_BASE_URL=http://localhost:3000
```

## 📚 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["error detail"]
  },
  "statusCode": 400
}
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## 📝 Common Tasks

### Add a new migration
```bash
pnpm prisma migrate dev --name migration_name
```

### View database in Prisma Studio
```bash
pnpm prisma studio
```

### Reset database (development only)
```bash
pnpm prisma migrate reset
```

### Format code
```bash
pnpm format
```

### Lint code
```bash
pnpm lint
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` to version control
2. **JWT Secret**: Use a strong, random secret in production
3. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
4. **CORS**: Configure CORS for specific frontend domains
5. **Validation**: All inputs are validated using class-validator
6. **Rate Limiting**: Consider implementing rate limiting for production
7. **HTTPS**: Use HTTPS in production
8. **Database**: Use strong database passwords and encrypted connections

## 🚀 Production Deployment

1. **Environment Setup**
   ```bash
   # Use strong secrets
   JWT_SECRET=$(openssl rand -hex 32)
   ```

2. **Build Docker Image**
   ```bash
   docker build -t taskflow-backend:latest .
   ```

3. **Push to Registry**
   ```bash
   docker tag taskflow-backend:latest your-registry/taskflow-backend:latest
   docker push your-registry/taskflow-backend:latest
   ```

4. **Deploy with Compose** or Kubernetes/ECS

5. **Health Checks**
   - Backend: `GET /api/docs` (check if Swagger loads)
   - Database: Health check endpoint in docker-compose

## 📖 Swagger Documentation

Full API documentation is available at `/api/docs` when the application is running.

Features:
- All endpoints documented
- Request/response schemas
- Authentication setup
- Try-it-out functionality

## 🤝 Contributing

1. Follow SOLID principles
2. Keep controllers thin, business logic in services
3. Use meaningful commit messages
4. Write tests for new features
5. Maintain clean code with proper linting

## 📄 License

UNLICENSED

## 📞 Support

For issues and questions, please create an issue in the repository.

---

**Happy coding! 🎉**
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
