# Database Integration Setup Guide

This guide explains how to set up and run the Kanban board application with PostgreSQL database integration.

## 🗄️ Database Architecture

The application uses:
- **PostgreSQL 15**: Primary database
- **Prisma**: ORM for database operations
- **Docker Compose**: Database containerization
- **Next.js API Routes**: Backend API endpoints

## 📊 Database Schema

### Tasks Table
```sql
CREATE TABLE "public"."tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."task_status" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);
```

### Task Status Enum
```sql
CREATE TYPE "public"."task_status" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
```

## 🚀 Quick Start

### 1. Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed
- Git (for cloning)

### 2. Environment Setup
Copy the environment variables:
```bash
cp .env.example .env
```

The `.env` file contains:
```env
DATABASE_URL="postgresql://kanban_user:kanban_password@localhost:5432/kanban_db?schema=public"
POSTGRES_DB=kanban_db
POSTGRES_USER=kanban_user
POSTGRES_PASSWORD=kanban_password
```

### 3. Start Database
```bash
# Start PostgreSQL container
docker-compose up -d

# Verify container is running
docker-compose ps
```

### 4. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample data
npm run db:seed
```

### 5. Start Application
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Database Operations

### API Endpoints

#### GET /api/tasks
Fetch all tasks
```bash
curl http://localhost:3000/api/tasks
```

#### POST /api/tasks
Create a new task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"Task description","status":"TODO"}'
```

#### PUT /api/tasks/[id]
Update a task
```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","status":"IN_PROGRESS"}'
```

#### DELETE /api/tasks/[id]
Delete a task
```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID
```

## 🛠️ Development Commands

### Database Management
```bash
# Reset database and reseed
npm run db:reset

# Seed database only
npm run db:seed

# View database in Prisma Studio
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name
```

### Docker Commands
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs postgres

# Access database shell
docker exec -it kanban_postgres psql -U kanban_user -d kanban_db
```

## 🔍 Troubleshooting

### Database Connection Issues
1. Ensure Docker Desktop is running
2. Check if PostgreSQL container is healthy:
   ```bash
   docker-compose ps
   ```
3. Verify environment variables in `.env`
4. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

### Migration Issues
1. Reset database if needed:
   ```bash
   npm run db:reset
   ```
2. Ensure Prisma schema is valid:
   ```bash
   npx prisma validate
   ```

### API Issues
1. Check Next.js development server logs
2. Verify API routes are accessible:
   ```bash
   curl http://localhost:3000/api/tasks
   ```

## 📁 File Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts               # Database seeding script
│   └── migrations/           # Database migrations
├── src/
│   ├── app/api/tasks/        # API routes
│   ├── lib/prisma.ts         # Prisma client setup
│   └── hooks/useKanbanBoard.ts # Database operations
├── docker-compose.yml        # PostgreSQL container config
└── .env                      # Environment variables
```

## 🔒 Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Enable SSL for production database connections
- Implement proper authentication and authorization

## 📈 Performance Considerations

- Database queries are optimized with proper indexing
- Optimistic updates for better UX
- Connection pooling handled by Prisma
- Error handling with user feedback via toast notifications

## 🚀 Production Deployment

For production deployment:
1. Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
2. Update `DATABASE_URL` with production credentials
3. Run migrations in production environment
4. Enable SSL connections
5. Set up database backups
6. Monitor database performance
