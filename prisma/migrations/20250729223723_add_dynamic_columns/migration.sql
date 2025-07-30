/*
  Migration to add dynamic columns support
  This migration safely converts existing status-based tasks to column-based tasks
*/

-- Step 1: Create the columns table
CREATE TABLE "public"."columns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "columns_pkey" PRIMARY KEY ("id")
);

-- Step 2: Insert default columns with specific IDs for mapping
INSERT INTO "public"."columns" ("id", "name", "color", "position", "createdAt", "updatedAt") VALUES
    ('col_todo', 'To Do', '#3B82F6', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('col_in_progress', 'In Progress', '#F59E0B', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('col_done', 'Done', '#10B981', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 3: Add columnId column with a temporary default
ALTER TABLE "public"."tasks" ADD COLUMN "columnId" TEXT;

-- Step 4: Map existing status values to column IDs
UPDATE "public"."tasks" SET "columnId" = 'col_todo' WHERE "status" = 'TODO';
UPDATE "public"."tasks" SET "columnId" = 'col_in_progress' WHERE "status" = 'IN_PROGRESS';
UPDATE "public"."tasks" SET "columnId" = 'col_done' WHERE "status" = 'DONE';

-- Step 5: Make columnId NOT NULL now that all rows have values
ALTER TABLE "public"."tasks" ALTER COLUMN "columnId" SET NOT NULL;

-- Step 6: Add position column for task ordering within columns
ALTER TABLE "public"."tasks" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- Step 7: Set initial positions for existing tasks (ordered by creation date)
WITH ranked_tasks AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY "columnId" ORDER BY "createdAt") - 1 as new_position
    FROM "public"."tasks"
)
UPDATE "public"."tasks"
SET position = ranked_tasks.new_position
FROM ranked_tasks
WHERE "public"."tasks".id = ranked_tasks.id;

-- Step 8: Drop the old status column
ALTER TABLE "public"."tasks" DROP COLUMN "status";

-- Step 9: Drop the old enum
DROP TYPE "public"."task_status";

-- Step 10: Add foreign key constraint
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "public"."columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
