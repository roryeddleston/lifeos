-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "public"."Habit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HabitRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "habitId" TEXT NOT NULL,

    CONSTRAINT "HabitRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Habit_userId_createdAt_idx" ON "public"."Habit"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "HabitRecord_habitId_completed_date_idx" ON "public"."HabitRecord"("habitId", "completed", "date");

-- CreateIndex
CREATE INDEX "HabitRecord_date_idx" ON "public"."HabitRecord"("date");

-- CreateIndex
CREATE UNIQUE INDEX "HabitRecord_habitId_date_key" ON "public"."HabitRecord"("habitId", "date");

-- CreateIndex
CREATE INDEX "Task_status_completedAt_idx" ON "public"."Task"("status", "completedAt");

-- CreateIndex
CREATE INDEX "Task_status_dueDate_createdAt_idx" ON "public"."Task"("status", "dueDate", "createdAt");

-- CreateIndex
CREATE INDEX "Task_userId_status_dueDate_idx" ON "public"."Task"("userId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Task_userId_createdAt_idx" ON "public"."Task"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Task_userId_position_idx" ON "public"."Task"("userId", "position");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "public"."Task"("dueDate");

-- CreateIndex
CREATE INDEX "Goal_userId_deadline_idx" ON "public"."Goal"("userId", "deadline");

-- CreateIndex
CREATE INDEX "Goal_userId_createdAt_idx" ON "public"."Goal"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."HabitRecord" ADD CONSTRAINT "HabitRecord_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
