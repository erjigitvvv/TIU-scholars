import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        departments: {
          orderBy: { nameUz: 'asc' },
          select: {
            id: true,
            nameUz: true,
            nameRu: true,
            nameEn: true,
          },
        },
      },
      orderBy: { nameUz: 'asc' },
    });

    return NextResponse.json({ faculties });
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return NextResponse.json({ error: 'Failed to load departments' }, { status: 500 });
  }
}
