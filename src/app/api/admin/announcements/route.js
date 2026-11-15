import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/auth';
import { notifyActiveScholars } from '@/lib/notifications';

const VALID_CATEGORIES = ['GRANT', 'CONFERENCE', 'DEADLINE', 'NEWS'];
const VALID_VISIBILITIES = ['PUBLIC', 'INTERNAL'];
const VALID_STATUSES = ['PUBLISHED', 'DRAFT', 'ARCHIVED'];

export async function GET() {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: { select: { email: true, role: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('GET /api/admin/announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      content,
      category = 'NEWS',
      visibility = 'PUBLIC',
      status = 'PUBLISHED',
      isPinned = false,
      deadline,
      notifyScholars = true,
    } = body || {};

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Sarlavha va matn kiritilishi shart' }, { status: 400 });
    }

    const safeCategory = VALID_CATEGORIES.includes(category) ? category : 'NEWS';
    const safeVisibility = VALID_VISIBILITIES.includes(visibility) ? visibility : 'PUBLIC';
    const safeStatus = VALID_STATUSES.includes(status) ? status : 'PUBLISHED';

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: safeCategory,
        visibility: safeVisibility,
        status: safeStatus,
        isPinned: Boolean(isPinned),
        deadline: deadline ? new Date(deadline) : null,
        authorId: user.id,
      },
      include: {
        author: { select: { email: true, role: true } },
      },
    });

    if (safeStatus === 'PUBLISHED' && notifyScholars) {
      await notifyActiveScholars({
        type: 'ANNOUNCEMENT',
        title: `Yangi e'lon: ${announcement.title}`,
        message: announcement.content.slice(0, 140) + (announcement.content.length > 140 ? '...' : ''),
        link: '/dashboard/announcements',
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_ANNOUNCEMENT',
        entityType: 'Announcement',
        entityId: announcement.id,
        details: JSON.stringify({ title: announcement.title, category: safeCategory, visibility: safeVisibility, status: safeStatus }),
      },
    });

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, content, category, visibility, status, isPinned, deadline } = body || {};

    if (!id) {
      return NextResponse.json({ error: 'Missing announcement id' }, { status: 400 });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (content !== undefined) updateData.content = String(content).trim();
    if (category && VALID_CATEGORIES.includes(category)) updateData.category = category;
    if (visibility && VALID_VISIBILITIES.includes(visibility)) updateData.visibility = visibility;
    if (status && VALID_STATUSES.includes(status)) updateData.status = status;
    if (isPinned !== undefined) updateData.isPinned = Boolean(isPinned);
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { email: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('PATCH /api/admin/announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing announcement id' }, { status: 400 });
    }

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
