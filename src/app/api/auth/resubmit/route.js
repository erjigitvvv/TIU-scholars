import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.accountStatus !== 'REJECTED') {
      return NextResponse.json({ error: 'Only rejected accounts can resubmit' }, { status: 400 });
    }

    const body = await request.json();
    const { fullName, departmentId, academicDegree, academicTitle } = body;

    await prisma.$transaction(async (tx) => {
      await tx.scholarProfile.update({
        where: { userId: user.id },
        data: {
          ...(fullName && { fullName }),
          ...(departmentId && { departmentId }),
          ...(academicDegree && { academicDegree }),
          ...(academicTitle && { academicTitle }),
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          accountStatus: 'PENDING',
          rejectionReason: null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'USER_RESUBMITTED',
          entityType: 'User',
          entityId: user.id,
          details: JSON.stringify({ fullName, departmentId }),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resubmit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
