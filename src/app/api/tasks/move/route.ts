import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/tasks/move - Move a task to a different column
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, sourceColumnId, targetColumnId, targetPosition } = body;

    if (!taskId || !targetColumnId) {
      return NextResponse.json(
        { error: 'Task ID and target column ID are required' },
        { status: 400 }
      );
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the task to move
      const task = await tx.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // If moving to the same column, just update position
      if (sourceColumnId === targetColumnId) {
        // Update positions of other tasks in the same column
        if (targetPosition !== undefined) {
          // Move other tasks to make room
          await tx.task.updateMany({
            where: {
              columnId: targetColumnId,
              position: { gte: targetPosition },
              id: { not: taskId },
            },
            data: {
              position: { increment: 1 },
            },
          });

          // Update the task position
          const updatedTask = await tx.task.update({
            where: { id: taskId },
            data: { position: targetPosition },
            include: { column: true },
          });

          return updatedTask;
        }
      } else {
        // Moving to a different column
        // Get the target position (end of target column if not specified)
        let newPosition = targetPosition;
        if (newPosition === undefined) {
          const lastTask = await tx.task.findFirst({
            where: { columnId: targetColumnId },
            orderBy: { position: 'desc' },
          });
          newPosition = lastTask ? lastTask.position + 1 : 0;
        } else {
          // Make room in the target column
          await tx.task.updateMany({
            where: {
              columnId: targetColumnId,
              position: { gte: newPosition },
            },
            data: {
              position: { increment: 1 },
            },
          });
        }

        // Update the task
        const updatedTask = await tx.task.update({
          where: { id: taskId },
          data: {
            columnId: targetColumnId,
            position: newPosition,
          },
          include: { column: true },
        });

        // Reorder tasks in the source column to fill the gap
        await tx.task.updateMany({
          where: {
            columnId: sourceColumnId,
            position: { gt: task.position },
          },
          data: {
            position: { decrement: 1 },
          },
        });

        return updatedTask;
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error moving task:', error);
    return NextResponse.json(
      { error: 'Failed to move task' },
      { status: 500 }
    );
  }
}
