import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { recalculateScholarMetrics } from '@/lib/scoring';

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'publications'; // publications, grants, supervisions

  if (type === 'publications') {
    const items = await prisma.publication.findMany({
      where: { status: 'PENDING' },
      include: {
        submittedBy: { select: { email: true } },
        authors: { include: { scholar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } else if (type === 'grants') {
    const items = await prisma.grantProject.findMany({
      where: { status: 'PENDING' },
      include: { scholar: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } else if (type === 'supervisions') {
    const items = await prisma.supervision.findMany({
      where: { status: 'PENDING' },
      include: { scholar: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  }

  return NextResponse.json([]);
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, type, status, rejectionReason } = await request.json();
    if (!id || !type || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    let updatedItem;
    if (type === 'publications') {
      updatedItem = await prisma.publication.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        },
        include: { authors: true },
      });

      if (status === 'APPROVED') {
        for (const author of updatedItem.authors) {
          await recalculateScholarMetrics(author.scholarId);
        }
      }
    } else if (type === 'grants') {
      updatedItem = await prisma.grantProject.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        },
      });
    } else if (type === 'supervisions') {
      updatedItem = await prisma.supervision.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: `MODERATE_${type.toUpperCase()}_${status}`,
        entityType: type,
        entityId: id,
        details: JSON.stringify({ status, rejectionReason }),
      },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Moderation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
