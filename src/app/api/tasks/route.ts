import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tasks - Fetch all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        column: true,
      },
      orderBy: [
        { column: { position: 'asc' } },
        { position: 'asc' },
      ],
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, columnId } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!columnId) {
      return NextResponse.json(
        { error: 'Column ID is required' },
        { status: 400 }
      );
    }

    // Get the highest position in the target column
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: 'desc' },
    });

    const newPosition = lastTask ? lastTask.position + 1 : 0;

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        columnId,
        position: newPosition,
      },
      include: {
        column: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
