import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { title, description, columnId, position } = body;
    const { id } = await params;

    // If moving to a different column, handle position logic
    let updateData: any = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
    };

    if (columnId !== undefined) {
      // If changing columns, get the highest position in the target column
      const lastTask = await prisma.task.findFirst({
        where: { columnId },
        orderBy: { position: 'desc' },
      });

      updateData.columnId = columnId;
      updateData.position = position !== undefined ? position : (lastTask ? lastTask.position + 1 : 0);
    } else if (position !== undefined) {
      updateData.position = position;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        column: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
