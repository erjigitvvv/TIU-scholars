import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        viewsCount: { increment: 1 },
      },
      include: {
        author: { select: { email: true, role: true } },
        inquiries: {
          include: {
            scholar: {
              select: {
                fullName: true,
                photoUrl: true,
                department: { select: { nameUz: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('GET /api/announcements/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Eʼlon topilmadi' }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'MODERATOR' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Ruxsat yo‘q' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isPinned !== undefined) updateData.isPinned = Boolean(body.isPinned);
    if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null;

    const updated = await prisma.announcement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    console.error('PUT /api/announcements/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Tahrirlashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'MODERATOR' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Ruxsat yo‘q' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Eʼlon o‘chirildi' });
  } catch (error) {
    console.error('DELETE /api/announcements/[id] error:', error);
    return NextResponse.json({ success: false, error: 'O‘chirishda xatolik' }, { status: 500 });
  }
}
