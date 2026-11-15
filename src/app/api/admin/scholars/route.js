import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/auth';
import { notifyUser } from '@/lib/notifications';

export async function GET(request) {
  const user = await requireModeratorOrAdmin();
  if (!user) {
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
  const user = await requireModeratorOrAdmin();
  if (!user) {
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

    if (accountStatus === 'ACTIVE') {
      await notifyUser({
        userId,
        type: 'ACCOUNT_APPROVED',
        title: 'Hisobingiz tasdiqlandi',
        message: 'Ilmiy bo‘lim tomonidan arizangiz tasdiqlandi. Endi kabinetingizdan to‘liq foydalanishingiz mumkin.',
        link: '/dashboard',
      });
    } else if (accountStatus === 'REJECTED') {
      await notifyUser({
        userId,
        type: 'ACCOUNT_REJECTED',
        title: 'Arizangiz rad etildi',
        message: rejectionReason
          ? `Sabab: ${rejectionReason}`
          : 'Ro‘yxatdan o‘tish arizangiz ilmiy bo‘lim tomonidan rad etildi.',
        link: '/dashboard/profile',
      });
    } else if (accountStatus === 'SUSPENDED') {
      await notifyUser({
        userId,
        type: 'ACCOUNT_SUSPENDED',
        title: 'Hisobingiz vaqtincha bloklandi',
        message: rejectionReason
          ? `Sabab: ${rejectionReason}`
          : 'Hisobingiz moderator tomonidan vaqtincha to‘xtatildi.',
        link: '/dashboard/profile',
      });
    } else if (Object.keys(profileUpdateData).length > 0) {
      await notifyUser({
        userId,
        type: 'PROFILE_UPDATED',
        title: 'Akademik ma’lumotlaringiz yangilandi',
        message: 'Moderator tomonidan kafedra, ilmiy daraja yoki identifikator ma’lumotlaringiz yangilandi.',
        link: '/dashboard/profile',
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Admin scholar update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
