# TaskFlow Pro - Decisiones de Arquitectura

## 1. Stack Tecnológico Elegido

### Backend
- **Framework**: NestJS (Node.js) - v11.1.19
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT con Passport.js
- **Validación**: class-validator y class-transformer
- **Documentación API**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js (React) - v16.2.4
- **Estado global**: Redux Toolkit con RTK Query
- **Validación de formularios**: Formik + Yup
- **Cliente HTTP**: Axios con interceptores
- **Estilos**: Tailwind CSS + DaisyUI

### Justificación de la Combinación

La elección de este stack responde a criterios de:

- **Escalabilidad**: NestJS proporciona una arquitectura modular y bien estructurada que facilita el crecimiento del proyecto
- **Cohesión**: Tanto backend como frontend usan TypeScript, proporcionando una experiencia de desarrollo consistente
- **Productividad**: Next.js con Redux Toolkit permite desarrollo rápido sin sacrificar calidad
- **Robustez**: Prisma garantiza type-safety en la capa de datos y migraciones versionadas
- **Documentación**: Swagger integrado en NestJS ofrece documentación automática y accesible
- **Comunidad**: Ambos frameworks tienen comunidades amplias y bien establecidas

---

## 2. Arquitectura General del Proyecto

### Estructura General

```
taskflow-pro/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuración (variables de entorno, validaciones)
│   │   ├── common/
│   │   │   ├── decorators/   # Decoradores personalizados
│   │   │   ├── filters/      # Global exception filter
│   │   │   ├── guards/       # JWT guard, role-based guards
│   │   │   └── interceptors/ # Response interceptor, logging
│   │   ├── modules/
│   │   │   ├── auth/         # Autenticación y autorización
│   │   │   ├── users/        # CRUD de usuarios
│   │   │   ├── projects/     # CRUD de proyectos
│   │   │   ├── tasks/        # CRUD de tareas
│   │   │   └── seed/         # Datos iniciales
│   │   ├── generated/        # Prisma Client generado
│   │   ├── prisma.service.ts # Service para Prisma
│   │   ├── app.module.ts     # Módulo raíz
│   │   └── main.ts           # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma     # Esquema de BD
│   │   └── migrations/       # Migraciones versionadas
│   └── test/                 # Tests E2E
├── my-app/
│   ├── app/                  # Rutas y layouts (Next.js app router)
│   ├── components/           # Componentes reutilizables
│   ├── hooks/                # Hooks personalizados
│   ├── lib/                  # Configuración (axios, validaciones)
│   ├── redux/
│   │   ├── store.ts          # Configuración de Redux
│   │   ├── slices/           # Slices (estado local)
│   │   └── services/         # RTK Query endpoints
│   ├── types/                # TypeScript types globales
│   └── utils/                # Funciones auxiliares
└── docs/
    └── ARCHITECTURE.md       # Este archivo
```

### Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Next.js)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Components + Formik Forms                 │   │
│  └───────────┬──────────────────────────────────────┘   │
│              │ (Axios)                                   │
│  ┌───────────▼──────────────────────────────────────┐   │
│  │  Redux Store + RTK Query                         │   │
│  │  - authSlice (token, usuario actual)             │   │
│  │  - authApi, projectApi, taskApi, userApi         │   │
│  └───────────┬──────────────────────────────────────┘   │
└──────────────┼──────────────────────────────────────────┘
               │ HTTP/JWT (Bearer Token)
    ┌──────────▼──────────────────────────────┐
    │      API Gateway / Ingress              │
    │   (CORS enabled, Rate limiting)         │
    └──────────┬───────────────────────────────┘
               │
    ┌──────────▼──────────────────────────────┐
    │   NestJS Application (/api/v1)          │
    │  ┌────────────────────────────────────┐ │
    │  │  Controllers                       │ │
    │  │  (AuthCtrl, UsersCtrl, ...)        │ │
    │  └───────────┬────────────────────────┘ │
    │             │                           │
    │  ┌──────────▼─────────────────────────┐ │
    │  │ Middleware / Guards               │ │
    │  │ - JwtGuard (autenticación)        │ │
    │  │ - RoleGuard (autorización)        │ │
    │  └──────────┬─────────────────────────┘ │
    │             │                           │
    │  ┌──────────▼────────────────────────┐  │
    │  │  Services                         │  │
    │  │  (Business Logic Layer)           │  │
    │  └──────────┬───────────────────────┘  │
    │             │                          │
    │  ┌──────────▼───────────────────────┐  │
    │  │ Prisma Service                  │  │
    │  │ (ORM - Data Access Layer)       │  │
    │  └──────────┬──────────────────────┘  │
    └─────────────┼────────────────────────┘
                  │
    ┌─────────────▼────────────────────┐
    │     PostgreSQL Database          │
    │  - users, projects, tasks        │
    │  - Transacciones + Índices       │
    └──────────────────────────────────┘
```

---

## 3. Patrones de Diseño Utilizados

### Backend

#### 3.1 Patrón MVC (Modificado)
- **Controllers**: Manejan las peticiones HTTP, validan entrada, delegan lógica
- **Services**: Contienen la lógica de negocio centralizada
- **Models**: Definidos en Prisma schema

**Ejemplo**: En `AuthModule`, el `AuthController` recibe solicitudes de login/registro, valida con DTOs, y delega al `AuthService` que contiene la lógica de hash, JWT generation, etc.

#### 3.2 Patrón Service Layer
Cada módulo tiene un servicio dedicado que:
- Encapsula la lógica de negocio
- Implementa validaciones de negocio
- Interactúa con Prisma para acceso a datos
- Es fácilmente testeable

#### 3.3 Patrón Modular (Domain-Driven Design Light)
Módulos independientes:
- `AuthModule`: Autenticación, JWT, Passport
- `UsersModule`: Gestión de usuarios (admin only)
- `ProjectsModule`: CRUD de proyectos con roles
- `TasksModule`: CRUD de tareas con asignación

Cada módulo es independiente y reutilizable.

#### 3.4 Patrón Interceptor + Filter
- **ResponseInterceptor**: Estandariza todas las respuestas (success, data, message, meta)
- **AllExceptionsFilter**: Captura y formatiza todos los errores globalmente

#### 3.5 Patrón Guardia (Guard Pattern)
- **JwtGuard**: Valida presencia y validez del JWT
- **RoleGuard**: Valida roles del usuario para endpoints específicos

**Beneficio**: Separación de concerns, reutilización de lógica de autorización

### Frontend

#### 3.1 Patrón Container/Presentational
- **Componentes de contenedor**: Conectados a Redux (páginas en `app/`)
- **Componentes presentacionales**: Puros, reciben props, en `components/`

#### 3.2 Redux + RTK Query
- **Redux Slices**: Estado local (ej. `authSlice` guarda usuario y token)
- **RTK Query**: Caching automático de datos de API, sincronización de estado

#### 3.3 Patrón HOC para Rutas Protegidas
Rutas protegidas según autenticación y rol en `/app/`

#### 3.4 Validación con Formik + Yup
- Validación declarativa del lado del cliente
- Esquemas centralizados en `lib/validations/`

---

## 4. Estrategia de Autenticación y Autorización

### Flujo de Autenticación

1. **Registro**: Usuario proporciona email, nombre, password
   - Password se hashea con bcrypt (10 salt rounds)
   - Se crea usuario con rol DEVELOPER por defecto
   - Respuesta incluye token JWT

2. **Login**: Usuario proporciona email y password
   - Se valida contraseña contra hash
   - Se genera JWT con `sub` (user id), rol, email
   - Token se guarda en localStorage del cliente
   - Token tiene expiración configurable (24h por defecto)

3. **Solicitudes Protegidas**: Cliente incluye token en header Authorization
   ```
   Authorization: Bearer <token>
   ```
   - JwtGuard valida y extrae información del token
   - Token disponible en `request.user` en el controller

### Autorización Basada en Roles

Tres roles con permisos diferenciados:

| Recurso | ADMIN | PROJECT_MANAGER | DEVELOPER |
|---------|-------|-----------------|-----------|
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Crear/editar proyectos | ✅ | ✅ (propios) | ❌ |
| Ver dashboard | Global | Sus proyectos | Sus tareas |
| Crear tareas | ✅ | ✅ | ✅ (asignadas) |
| Cambiar estado tareas | ✅ | ✅ | ✅ (asignadas) |

**Implementación**: 
- Guards decoradores en endpoints: `@UseGuards(JwtGuard, RoleGuard(...))`
- Validación de recursos propios en Services

### Token JWT

- **Algoritmo**: HS256 (HMAC SHA-256)
- **Payload**: `{ sub, role, email, iat, exp }`
- **Secreto**: Configurable por variable de entorno
- **Expiración**: Configurable (defecto 24 horas)

### Seguridad en Contraseñas

- **Hashing**: bcrypt con 10 salt rounds
- **Almacenamiento**: Nunca en JWT (sensible)
- **Validación**: Mínimo 8 caracteres, complejidad requerida
- **Reset**: No implementado (bonus para futuro)

---

## 5. Estructura de la Base de Datos y Relaciones

### Esquema de Datos (PostgreSQL)

#### Tabla `users`
```sql
- id (UUID, PK)
- email (UNIQUE, indexed)
- name
- password (bcrypt hash)
- role (ENUM: ADMIN, PROJECT_MANAGER, DEVELOPER)
- avatarUrl (opcional)
- createdAt, updatedAt
```

**Índices**:
- `email` (búsqueda frecuente de login)

**Relaciones**:
- One-to-Many: Usuario → Proyectos propios
- One-to-Many: Usuario → Tareas asignadas
- One-to-Many: Usuario → Tareas creadas

---

#### Tabla `projects`
```sql
- id (UUID, PK)
- name
- description (opcional)
- status (ENUM: ACTIVE, ARCHIVED)
- ownerId (FK a users, CASCADE delete)
- createdAt, updatedAt
```

**Índices**:
- `ownerId` (filtrado por propietario)

**Relaciones**:
- Many-to-One: Proyecto → Usuario (propietario)
- One-to-Many: Proyecto → Tareas

---

#### Tabla `tasks`
```sql
- id (UUID, PK)
- title
- description (opcional)
- status (ENUM: TODO, IN_PROGRESS, IN_REVIEW, DONE)
- priority (ENUM: LOW, MEDIUM, HIGH, CRITICAL)
- dueDate (opcional)
- projectId (FK a projects, CASCADE delete, indexed)
- assignedToId (FK a users, nullable, SET NULL, indexed)
- createdById (FK a users, CASCADE delete, indexed)
- createdAt, updatedAt
```

**Índices**:
- `projectId` (tareas por proyecto)
- `assignedToId` (tareas asignadas a un usuario)
- `createdById` (tareas creadas por usuario)

**Relaciones**:
- Many-to-One: Tarea → Proyecto
- Many-to-One: Tarea → Usuario (asignado)
- Many-to-One: Tarea → Usuario (creador)

---

### Estrategia de Migraciones

- **Prisma Migrate**: Versionado automático en `prisma/migrations/`
- **Seeders**: Datos iniciales en `src/modules/seed/seed.ts`
- **Datos por defecto**: 
  - 1 usuario Admin (`admin@taskflow.com`)
  - 1 usuario Project Manager
  - 1 usuario Developer
  - 2+ proyectos de ejemplo
  - 5+ tareas distribuidas

---

## 6. Trade-offs y Mejoras Futuras

### Trade-offs por Límite de Tiempo

| Aspecto | Decisión Tomada | Justificación |
|---------|-----------------|---------------|
| Comentarios en tareas | Bonus no implementado | Priorizó CRUD core y autenticación |
| Tests unitarios | Pruebas E2E básicas | Enfoque en funcionalidad |
| Refresh tokens | Token simple con expiración | Simplifica implementación |
| Notificaciones | No implementadas | Requiere WebSockets o polling |
| Docker | Compose opcional | Proyecto funcional sin containerización |
| CI/CD | No implementado | Enfoque en desarrollo local |

### Mejoras Futuras (Próximas Fases)

1. **Comentarios en Tareas**
   - Nueva entidad Comment con relación Many-to-One a Task
   - Endpoint CRUD de comentarios
   - Timeline de actividad en detalles de tarea

2. **Notificaciones Real-time**
   - Implementar WebSockets (Socket.io)
   - Notificar cuando usuario es asignado a tarea
   - Notificar cambios de estado de tareas

3. **Refresh Tokens**
   - Token de acceso corta duración (15 min)
   - Refresh token larga duración (7 días)
   - Endpoint de refresh en backend

4. **Tests Completos**
   - Tests unitarios de Services
   - Tests de integración de Controllers
   - Coverage mínimo del 80%

5. **Documentación Mejorada**
   - Casos de uso en Swagger
   - Ejemplos de request/response reales
   - Colección de Postman exportable

6. **Performance**
   - Rate limiting más granular por usuario
   - Caché en Redis para queries frecuentes
   - Paginación optimizada

7. **Seguridad Adicional**
   - Rate limiting por IP
   - HTTPS forzado
   - CSRF protection
   - Validación de CORS más restrictiva

---

## 7. Decisiones Técnicas Relevantes

### 1. Uso de Prisma ORM
**Por qué**: 
- Type-safety automático en TypeScript
- Migraciones automáticas y versionadas
- Query builder intuitivo
- Prisma Studio para debugging visual

**Alternativas consideradas**: TypeORM (más complejo), Sequelize (menos modern)

### 2. DTOs con Class-validator en Backend
**Por qué**:
- Validación declarativa y reutilizable
- Errores específicos por campo
- Integración nativa con NestJS

**Ejemplo**:
```typescript
class CreateTaskDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;
}
```

### 3. RTK Query en Frontend
**Por qué**:
- Caching automático y smart
- Sincronización optimista
- Reducción de boilerplate vs Redux puro
- Generación de hooks para cada endpoint

### 4. Versionado de API (/api/v1)
**Por qué**:
- Permite evolucionar API sin romper clientes
- Estándar en desarrollo profesional

### 5. Interceptor Global para Respuestas
**Por qué**:
- Formato consistente en todas las respuestas
- Fácil de consumir en frontend
- Mejor experiencia de desarrollo

**Formato**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "meta": { "page": 1, "total": 45 }
}
```

### 6. Soft Delete Recomendado en Usuarios
**Implementado**: Soft delete con flag `deletedAt` (si aplica en future)
**Por qué**: Preserva integridad relacional e histórico

---

## 8. Notas de Implementación

### Variables de Entorno Críticas
```env
# Backend (.env)
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow_dev
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=86400

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

### Credenciales de Seeder
```
Admin:
  Email: admin@taskflow.com
  Contraseña: Admin123!

PM:
  Email: maria@taskflow.com
  Contraseña: Maria123!

Dev:
  Email: carlos@taskflow.com
  Contraseña: Carlos123!
```

### Comandos Principales

**Backend**:
```bash
pnpm install                 # Instalar dependencias
pnpm prisma:migrate:dev     # Ejecutar migraciones en desarrollo
pnpm prisma:seed            # Ejecutar seeders
pnpm start:dev              # Iniciar en modo desarrollo
```

**Frontend**:
```bash
pnpm install                 # Instalar dependencias
pnpm dev                     # Iniciar servidor development (Next.js)
```

**API Documentation**:
- Accesible en: `http://localhost:3001/api/docs`
- Swagger integrado con ejemplos de requests/responses

---

## 9. Conclusión

TaskFlow Pro demuestra una arquitectura profesional, modular y escalable para un sistema de gestión de proyectos. La elección del stack (NestJS + Next.js + PostgreSQL + Prisma) proporciona un balance óptimo entre productividad, robustez y mantenibilidad. Los patrones implementados (MVC, Service Layer, Guards, Interceptors) facilitan el testing, debugging y evolución futura del proyecto.

El código está preparado para crecer sin refactorizaciones mayores, y los trade-offs realizados priorizan la completitud funcional del MVP sin sacrificar calidad.
