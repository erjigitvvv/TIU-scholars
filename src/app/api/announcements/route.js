import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        ...(user ? {} : { visibility: 'PUBLIC' }),
        ...(category && category !== 'ALL' ? { category } : {}),
      },
      include: {
        author: { select: { email: true, role: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('GET /api/announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
