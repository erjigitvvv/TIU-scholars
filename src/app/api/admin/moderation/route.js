import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/auth';
import { recalculateScholarMetrics } from '@/lib/scoring';
import { notifyUser } from '@/lib/notifications';

export async function GET(request) {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'publications'; // publications, grants, supervisions
  const statusParam = (searchParams.get('status') || 'PENDING').toUpperCase();
  const statusFilter =
    statusParam === 'ALL'
      ? { in: ['PENDING', 'APPROVED', 'REJECTED', 'SUBMITTED_INTERNAL', 'WON', 'APPROVED_BY_MODERATOR', 'COMPLETED'] }
      : statusParam === 'PENDING'
      ? { in: ['PENDING', 'SUBMITTED_INTERNAL'] }
      : statusParam;

  const grantStatusFilter =
    statusParam === 'ALL'
      ? { in: ['PENDING', 'SUBMITTED_INTERNAL', 'APPROVED', 'WON', 'APPROVED_BY_MODERATOR', 'COMPLETED', 'REJECTED'] }
      : statusParam === 'PENDING'
      ? { in: ['PENDING', 'SUBMITTED_INTERNAL'] }
      : statusParam === 'APPROVED'
      ? { in: ['APPROVED', 'WON', 'APPROVED_BY_MODERATOR', 'COMPLETED'] }
      : statusParam;

  const [pendingPubs, pendingGrants, pendingSupervisions, pendingProjects] = await Promise.all([
    prisma.publication.count({ where: { status: 'PENDING' } }),
    prisma.grantProject.count({ where: { status: { in: ['PENDING', 'SUBMITTED_INTERNAL'] } } }),
    prisma.supervision.count({ where: { status: 'PENDING' } }),
    prisma.academicProject.count({ where: { status: { in: ['IN_REVIEW', 'SUBMITTED', 'PENDING'] } } }),
  ]);

  const counts = {
    publications: pendingPubs,
    grants: pendingGrants,
    supervisions: pendingSupervisions,
    academicProjects: pendingProjects,
    totalPending: pendingPubs + pendingGrants + pendingSupervisions + pendingProjects,
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
      where: { status: grantStatusFilter },
      include: {
        scholar: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else if (type === 'supervisions') {
    items = await prisma.supervision.findMany({
      where: { status: statusFilter },
      include: {
        scholar: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else if (type === 'academic-projects') {
    const projectFilter =
      statusParam === 'ALL'
        ? undefined
        : statusParam === 'PENDING'
        ? { in: ['IN_REVIEW', 'SUBMITTED', 'PENDING'] }
        : statusParam === 'APPROVED'
        ? { in: ['APPROVED', 'PUBLISHED', 'AWARDED'] }
        : statusParam === 'REJECTED'
        ? { in: ['REJECTED', 'REVISION'] }
        : statusParam;

    items = await prisma.academicProject.findMany({
      where: projectFilter ? { status: projectFilter } : {},
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            scholarProfile: {
              select: {
                id: true,
                fullName: true,
                academicDegree: true,
                department: { select: { nameUz: true } },
                telegramChatId: true,
              },
            },
          },
        },
        collaborators: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  return NextResponse.json({ items, counts });
}

export async function PATCH(request) {
  const user = await requireModeratorOrAdmin();
  if (!user) {
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

    const targetUserIds = new Set();
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
    } else if (type === 'academic-projects') {
      updatedItem = await prisma.academicProject.update({
        where: { id },
        data: {
          status: status === 'APPROVED' ? 'APPROVED' : 'REVISION',
        },
        include: {
          creator: {
            include: { scholarProfile: true },
          },
        },
      });
      if (updatedItem.creatorId) {
        targetUserIds.add(updatedItem.creatorId);
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

    // Notify submitting scholar(s)
    const labelMap = {
      publications: 'Nashr',
      grants: 'Grant loyihasi',
      supervisions: 'Ilmiy rahbarlik',
      'academic-projects': 'Ilmiy loyiha',
    };
    const linkMap = {
      publications: '/dashboard/publications',
      grants: '/dashboard/grants',
      supervisions: '/dashboard/supervisions',
      'academic-projects': '/dashboard/academic-projects',
    };
    const itemLabel = labelMap[type] || 'Ilmiy ish';
    const isApproved = status === 'APPROVED';

    if (type === 'publications') {
      if (updatedItem.submittedById) targetUserIds.add(updatedItem.submittedById);
    } else if (updatedItem.scholarId) {
      const sp = await prisma.scholarProfile.findUnique({
        where: { id: updatedItem.scholarId },
        select: { userId: true },
      });
      if (sp?.userId) targetUserIds.add(sp.userId);
    }

    for (const targetUserId of targetUserIds) {
      await notifyUser({
        userId: targetUserId,
        type: `${type.toUpperCase()}_${status}`,
        title: `${itemLabel} ${isApproved ? 'tasdiqlandi' : 'rad etildi'}`,
        message: isApproved
          ? `"${updatedItem.title || itemLabel}" moderator tomonidan tasdiqlandi va reytingingiz yangilandi.`
          : `"${updatedItem.title || itemLabel}" rad etildi. Sabab: ${rejectionReason}`,
        link: linkMap[type] || '/dashboard',
      });
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Moderation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
