import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where = {};
  if (status) {
    where.accountStatus = status;
  }

  const scholars = await prisma.scholarProfile.findMany({
    where: {
      ...(status ? { user: { accountStatus: status } } : {}),
    },
    include: {
      user: true,
      department: { include: { faculty: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(scholars);
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, accountStatus, rejectionReason, role } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const updateData = {};
    if (accountStatus) updateData.accountStatus = accountStatus;
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;
    if (role && user.role === 'SUPER_ADMIN') {
      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { scholarProfile: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'ADMIN_UPDATE_SCHOLAR',
        entityType: 'User',
        entityId: userId,
        details: JSON.stringify({ accountStatus, rejectionReason, role }),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Admin scholar update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
