import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { nameUz, nameRu, nameEn } = await request.json();
    if (!nameEn) {
      return NextResponse.json({ error: 'English name is required' }, { status: 400 });
    }

    const code = nameEn.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) + Math.floor(Math.random() * 90 + 10);

    const faculty = await prisma.faculty.create({
      data: { code, nameUz: nameUz || nameEn, nameRu: nameRu || nameEn, nameEn },
    });

    return NextResponse.json(faculty);
  } catch (error) {
    console.error('Create faculty error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
