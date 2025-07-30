import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/columns/[id] - Update a column
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { name, color, position } = body;
    const { id } = await params;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: 'Column name must be a string' },
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
    }

    // Validate color if provided
    if (color !== undefined && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'Invalid color format. Use hex format like #3B82F6' },
        { status: 400 }
      );
    }

    // Validate position if provided
    if (position !== undefined && (typeof position !== 'number' || position < 0)) {
      return NextResponse.json(
        { error: 'Position must be a non-negative number' },
        { status: 400 }
      );
    }

    const column = await prisma.column.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(color !== undefined && { color }),
        ...(position !== undefined && { position }),
      },
      include: {
        tasks: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error('Error updating column:', error);
    return NextResponse.json(
      { error: 'Failed to update column' },
      { status: 500 }
    );
  }
}

// DELETE /api/columns/[id] - Delete a column
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if column has tasks
    const column = await prisma.column.findUnique({
      where: { id },
      include: { tasks: true },
    });

    if (!column) {
      return NextResponse.json(
        { error: 'Column not found' },
        { status: 404 }
      );
    }

    if (column.tasks.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete column with tasks. Please move or delete all tasks first.' },
        { status: 400 }
      );
    }

    await prisma.column.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting column:', error);
    return NextResponse.json(
      { error: 'Failed to delete column' },
      { status: 500 }
    );
  }
}
