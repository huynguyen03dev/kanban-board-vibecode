import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/columns - Fetch all columns with their tasks
export async function GET() {
  try {
    const columns = await prisma.column.findMany({
      include: {
        tasks: {
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });
    return NextResponse.json(columns);
  } catch (error) {
    console.error('Error fetching columns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch columns' },
      { status: 500 }
    );
  }
}

// POST /api/columns - Create a new column
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Column name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Column name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (trimmedName.length > 50) {
      return NextResponse.json(
        { error: 'Column name must be 50 characters or less' },
        { status: 400 }
      );
    }

    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Invalid color format. Use hex format like #3B82F6' },
        { status: 400 }
      );
    }

    // Get the highest position to place the new column at the end
    const lastColumn = await prisma.column.findFirst({
      orderBy: { position: 'desc' },
    });

    const newPosition = lastColumn ? lastColumn.position + 1 : 0;

    const column = await prisma.column.create({
      data: {
        name: trimmedName,
        color: color || '#3B82F6',
        position: newPosition,
      },
      include: {
        tasks: true,
      },
    });

    return NextResponse.json(column, { status: 201 });
  } catch (error) {
    console.error('Error creating column:', error);
    return NextResponse.json(
      { error: 'Failed to create column' },
      { status: 500 }
    );
  }
}
