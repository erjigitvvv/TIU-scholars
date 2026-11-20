import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/auth';

export async function POST(request, { params }) {
  const adminUser = await requireModeratorOrAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: 'Ruxsat yo‘q (Faqat Moderator yoki Admin)' }, { status: 403 });
  }

  const resolvedParams = await params;
  const supervisionId = resolvedParams.id;

  try {
    const supervision = await prisma.supervision.findUnique({
      where: { id: supervisionId },
      include: {
        scholar: { include: { user: true } },
      },
    });

    if (!supervision) {
      return NextResponse.json({ error: 'Supervision topilmadi' }, { status: 404 });
    }

    const body = await request.json();
    const { action, payload = {} } = body;

    if (action === 'extend_deadline') {
      const { newExpectedDate, reason } = payload;
      if (!newExpectedDate) {
        return NextResponse.json({ error: 'newExpectedDate talab qilinadi.' }, { status: 400 });
      }

      const updated = await prisma.supervision.update({
        where: { id: supervisionId },
        data: {
          expectedDefenseDate: new Date(newExpectedDate),
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: adminUser.id,
          action: 'SUPERVISION_DEADLINE_EXTENDED',
          entityType: 'Supervision',
          entityId: supervisionId,
          details: JSON.stringify({
            oldDate: supervision.expectedDefenseDate,
            newDate: newExpectedDate,
            reason: reason || 'Moderator tomonidan uzaytirildi',
          }),
        },
      });

      if (supervision.scholar?.userId) {
        await prisma.notification.create({
          data: {
            userId: supervision.scholar.userId,
            type: 'INFO',
            title: 'Himoya muddati uzaytirildi',
            message: `${supervision.studentName} bo‘yicha himoya muddati ${new Date(newExpectedDate).toLocaleDateString()} gacha uzaytirildi. Sabab: ${reason || 'Belgilanmagan'}`,
            link: `/dashboard/supervisions/${supervisionId}`,
          },
        });
      }

      return NextResponse.json({ success: true, supervision: updated });
    }

    if (action === 'change_supervisor') {
      const { newScholarId, reason } = payload;
      if (!newScholarId) {
        return NextResponse.json({ error: 'newScholarId tanlanishi shart.' }, { status: 400 });
      }

      const newScholar = await prisma.scholarProfile.findUnique({
        where: { id: newScholarId },
        include: { user: true },
      });

      if (!newScholar) {
        return NextResponse.json({ error: 'Yangi ilmiy rahbar topilmadi.' }, { status: 404 });
      }

      const oldScholarId = supervision.scholarId;
      const updated = await prisma.supervision.update({
        where: { id: supervisionId },
        data: {
          scholarId: newScholarId,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: adminUser.id,
          action: 'SUPERVISION_SUPERVISOR_CHANGED',
          entityType: 'Supervision',
          entityId: supervisionId,
          details: JSON.stringify({
            oldScholarId,
            newScholarId,
            reason: reason || 'Kafedra yoki moderator qarori bilan almashtirildi',
          }),
        },
      });

      // Notify old supervisor
      if (supervision.scholar?.userId) {
        await prisma.notification.create({
          data: {
            userId: supervision.scholar.userId,
            type: 'WARNING',
            title: 'Ilmiy rahbarlik o‘zgartirildi',
            message: `${supervision.studentName} bo‘yicha ilmiy rahbarlik boshqa olimga (${newScholar.fullName}) o‘tkazildi. Sabab: ${reason || 'Ma’muriyat qarori'}`,
            link: `/dashboard/supervisions`,
          },
        });
      }

      // Notify new supervisor
      if (newScholar.userId) {
        await prisma.notification.create({
          data: {
            userId: newScholar.userId,
            type: 'INFO',
            title: 'Yangi izlanuvchi biriktirildi',
            message: `Sizga yangi izlanuvchi (${supervision.studentName}) biriktirildi. Mavzu: ${supervision.dissertationTitle}`,
            link: `/dashboard/supervisions/${supervisionId}`,
          },
        });
      }

      return NextResponse.json({ success: true, supervision: updated });
    }

    return NextResponse.json({ error: 'Noma’lum action turi' }, { status: 400 });
  } catch (error) {
    console.error('Supervision quick action error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
