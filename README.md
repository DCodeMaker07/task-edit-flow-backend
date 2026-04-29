# TaskFlow Pro - Backend API

Una API de sistema de gestión de tareas lista para producción, construida con NestJS, PostgreSQL y Prisma ORM.

## Caracteristicas

- **Autenticación JWT** - Autenticación segura basada en tokens
- **Control de acceso basado en roles** - Roles de ADMINISTRADOR, GERENTE DE PROYECTO y DESARROLLADOR
- **Arquitectura modular** - Código limpio, escalable y fácil de mantener
- **API RESTful** - Puntos finales bien estructurados con control de versiones
- **Base de datos** - PostgreSQL con Prisma ORM
- **Validación** - DTOs con validador y transformador de clases
- **Gestión de errores** - Gestión integral de excepciones con respuestas estandarizadas
- **Documentación Swagger** - Documentación de API autogenerada
- **Compatibilidad con Docker** - Dockerfile y docker-compose listos para producción
- **Datos de prueba** - Base de datos precargada con usuarios y proyectos de prueba

## Stack Tecnológico

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

## API Endpoints

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

## Esquema de base de datos

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

## Instalación

### requisitos
- Node.js 22+
- pnpm 10+
- PostgreSQL 17+ (or Docker)
- Git

### Pasos de instalación

1. **Clonar repositorio**
```bash
git clone <repository-url>
cd backend
```

2. **Instalación de dependencias con pnpm**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Actualizar con su variables de entorno
```

4. **Levantar base de datos: PostgreSQL** (Option A: Local)
```bash
# Asegurate que tu postgreSQL este corriendo
# Actualiza el valor de DATABASE_URL en .env

# Run migrations
pnpm prisma migrate dev

```

**Option B: Usando Docker**
```bash
docker-compose -f docker-compose.dev.yml up -d
pnpm prisma migrate dev
pnpm prisma:seed
```

5. **Corre la API**
```bash
# Desarrollo
pnpm start:dev

# Construir a producción
pnpm build
pnpm start:prod
```

### URLs de la API
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

### Credenciales temporales
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

## 📚 API formato de respuesta

### Respuesta satisfactoria
```json
{
  "success": true,
  "data": {
    // Respuesta
  },
  "message": "Operation successful"
}
```

### Respuesta erronea
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

## Pruebas

```bash
# Unitarios
pnpm test

# Revisión
pnpm test:watch

# Cobertura
pnpm test:cov

# E2E
pnpm test:e2e
```

## 📝 Tareas comunes

### Añadir nueva integración usando PrismaORM
```bash
pnpm prisma migrate dev --name migration_name
```

### Ver base de datos en prisma
```bash
pnpm prisma studio
```

### Reiniciar base de datos (Desarrollo)
```bash
pnpm prisma migrate reset
```

### Formatear código
```bash
pnpm format
```

### Lint code
```bash
pnpm lint
```

## Mejores practicas de seguridad

1. **Variables de entorno**: Nunca incluyas `.env` en el control de versiones.
2. **Secreto JWT**: Utiliza un secreto seguro y aleatorio en producción.
3. **Hashing de contraseñas**: Las contraseñas se cifran mediante bcrypt con 10 rondas de sal.
4. **CORS**: Configura CORS para dominios frontend específicos.
5. **Validación**: Todas las entradas se validan mediante class-validator.
6. **Limitación de velocidad**: Considera implementar la limitación de velocidad en producción.
7. **HTTPS**: Utiliza HTTPS en producción.
8. **Base de datos**: Utiliza contraseñas seguras para la base de datos y conexiones cifradas.

## Documentación de Swagger

La documentación completa de la API está disponible en `/api/docs` cuando la aplicación está en ejecución.

Características:
- Todos los endpoints documentados
- Esquemas de solicitud/respuesta
- Configuración de autenticación
- Funcionalidad de prueba
