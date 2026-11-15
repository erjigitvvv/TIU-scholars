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
  const includeFaculties = searchParams.get('includeFaculties') === '1';

  const scholars = await prisma.scholarProfile.findMany({
    where: {
      ...(status ? { user: { accountStatus: status } } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          accountStatus: true,
          rejectionReason: true,
          createdAt: true,
        },
      },
      department: { include: { faculty: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (includeFaculties) {
    const faculties = await prisma.faculty.findMany({
      include: { departments: { orderBy: { nameUz: 'asc' } } },
      orderBy: { nameUz: 'asc' },
    });
    return NextResponse.json({ scholars, faculties, currentRole: user.role });
  }

  return NextResponse.json(scholars);
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      userId,
      accountStatus,
      rejectionReason,
      role,
      departmentId,
      academicDegree,
      academicTitle,
      positionUz,
      orcidId,
      scopusId,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // User-level updates (Moderator: status/reason only; Super Admin: also role)
    const userUpdateData = {};
    if (accountStatus) userUpdateData.accountStatus = accountStatus;
    if (rejectionReason !== undefined) userUpdateData.rejectionReason = rejectionReason;
    if (role && user.role === 'SUPER_ADMIN') {
      userUpdateData.role = role;
    }

    // ScholarProfile allowed academic fields (Moderator CANNOT edit email/password/tiuScore/hIndex/citations/bio)
    const profileUpdateData = {};
    if (departmentId) profileUpdateData.departmentId = departmentId;
    if (academicDegree) profileUpdateData.academicDegree = academicDegree;
    if (academicTitle) profileUpdateData.academicTitle = academicTitle;
    if (positionUz !== undefined) profileUpdateData.positionUz = positionUz;
    if (orcidId !== undefined) profileUpdateData.orcidId = orcidId;
    if (scopusId !== undefined) profileUpdateData.scopusId = scopusId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...userUpdateData,
        ...(Object.keys(profileUpdateData).length > 0
          ? {
              scholarProfile: {
                update: profileUpdateData,
              },
            }
          : {}),
      },
      include: {
        scholarProfile: {
          include: { department: { include: { faculty: true } } },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'ADMIN_UPDATE_SCHOLAR',
        entityType: 'User',
        entityId: userId,
        details: JSON.stringify({
          ...userUpdateData,
          ...profileUpdateData,
        }),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Admin scholar update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
