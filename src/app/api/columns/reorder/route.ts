import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/columns/reorder - Reorder columns
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { columnIds } = body;

    if (!Array.isArray(columnIds)) {
      return NextResponse.json(
        { error: 'columnIds must be an array' },
        { status: 400 }
      );
    }

    // Update positions in a transaction
    await prisma.$transaction(
      columnIds.map((columnId: string, index: number) =>
        prisma.column.update({
          where: { id: columnId },
          data: { position: index },
        })
      )
    );

    // Fetch updated columns
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
    console.error('Error reordering columns:', error);
    return NextResponse.json(
      { error: 'Failed to reorder columns' },
      { status: 500 }
    );
  }
}
