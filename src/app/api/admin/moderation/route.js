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
  const statusParam = (searchParams.get('status') || 'PENDING').toUpperCase();
  const statusFilter =
    statusParam === 'ALL'
      ? { in: ['PENDING', 'APPROVED', 'REJECTED'] }
      : statusParam;

  const [pendingPubs, pendingGrants, pendingSupervisions] = await Promise.all([
    prisma.publication.count({ where: { status: 'PENDING' } }),
    prisma.grantProject.count({ where: { status: 'PENDING' } }),
    prisma.supervision.count({ where: { status: 'PENDING' } }),
  ]);

  const counts = {
    publications: pendingPubs,
    grants: pendingGrants,
    supervisions: pendingSupervisions,
    totalPending: pendingPubs + pendingGrants + pendingSupervisions,
  };

  let items = [];
  if (type === 'publications') {
    items = await prisma.publication.findMany({
      where: { status: statusFilter },
      include: {
        submittedBy: { select: { email: true } },
        authors: {
          include: {
            scholar: {
              include: { department: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  } else if (type === 'grants') {
    items = await prisma.grantProject.findMany({
      where: { status: statusFilter },
      include: {
        scholar: {
          include: { department: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  } else if (type === 'supervisions') {
    items = await prisma.supervision.findMany({
      where: { status: statusFilter },
      include: {
        scholar: {
          include: { department: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  return NextResponse.json({ items, counts });
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      id,
      type,
      status,
      rejectionReason,
      pubType,
      quartile,
      citationsCount,
    } = await request.json();

    if (!id || !type || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    let updatedItem;
    if (type === 'publications') {
      const updateData = {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      };
      if (pubType) updateData.type = pubType;
      if (quartile) updateData.quartile = quartile;
      if (citationsCount !== undefined && citationsCount !== null && citationsCount !== '') {
        const parsed = parseInt(citationsCount, 10);
        if (!Number.isNaN(parsed) && parsed >= 0) {
          updateData.citationsCount = parsed;
        }
      }

      updatedItem = await prisma.publication.update({
        where: { id },
        data: updateData,
        include: { authors: true },
      });

      for (const author of updatedItem.authors) {
        await recalculateScholarMetrics(author.scholarId);
      }
    } else if (type === 'grants') {
      updatedItem = await prisma.grantProject.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        },
      });
      if (updatedItem.scholarId) {
        await recalculateScholarMetrics(updatedItem.scholarId);
      }
    } else if (type === 'supervisions') {
      updatedItem = await prisma.supervision.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        },
      });
      if (updatedItem.scholarId) {
        await recalculateScholarMetrics(updatedItem.scholarId);
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: `MODERATE_${type.toUpperCase()}_${status}`,
        entityType: type,
        entityId: id,
        details: JSON.stringify({ status, rejectionReason, pubType, quartile, citationsCount }),
      },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Moderation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
