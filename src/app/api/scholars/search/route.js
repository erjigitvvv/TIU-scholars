import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();

    const where = {
      user: {
        accountStatus: 'ACTIVE',
      },
    };

    if (q) {
      where.OR = [
        { fullName: { contains: q } },
        { publicEmail: { contains: q } },
        { user: { email: { contains: q } } },
        { department: { nameUz: { contains: q } } },
      ];
    }

    const scholars = await prisma.scholarProfile.findMany({
      where,
      select: {
        id: true,
        userId: true,
        fullName: true,
        photoUrl: true,
        academicDegree: true,
        academicTitle: true,
        publicEmail: true,
        isTelegramConnected: true,
        user: {
          select: {
            email: true,
          },
        },
        department: {
          select: {
            nameUz: true,
          },
        },
      },
      take: 15,
      orderBy: { fullName: 'asc' },
    });

    const formatted = scholars.map((s) => ({
      id: s.id,
      userId: s.userId,
      fullName: s.fullName,
      email: s.user?.email || s.publicEmail || '',
      photoUrl: s.photoUrl,
      academicDegree: s.academicDegree,
      academicTitle: s.academicTitle,
      departmentName: s.department?.nameUz || '',
      isTelegramConnected: s.isTelegramConnected,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error('GET /api/scholars/search error:', err);
    return NextResponse.json({ success: false, error: 'Qidiruvda xatolik' }, { status: 500 });
  }
}
