import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const adminUser = await requireModeratorOrAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: 'Ruxsat yo‘q (Faqat Moderator yoki Admin)' }, { status: 403 });
  }

  const resolvedParams = await params;
  const reportId = resolvedParams.reportId;

  try {
    const report = await prisma.supervisionReport.findUnique({
      where: { id: reportId },
      include: {
        supervision: {
          include: { scholar: { include: { user: true } } },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Hisobot topilmadi' }, { status: 404 });
    }

    const body = await request.json();
    const { status, feedback } = body;

    if (!['ACCEPTED', 'NEEDS_REVISION'].includes(status)) {
      return NextResponse.json({ error: 'Status ACCEPTED yoki NEEDS_REVISION bo‘lishi kerak' }, { status: 400 });
    }

    const updated = await prisma.supervisionReport.update({
      where: { id: reportId },
      data: {
        status,
        feedback: feedback || null,
        reviewedAt: new Date(),
        reviewedBy: adminUser.email || adminUser.name || 'Moderator',
      },
    });

    // Notify supervisor
    if (report.supervision?.scholar?.userId) {
      const isAccepted = status === 'ACCEPTED';
      await prisma.notification.create({
        data: {
          userId: report.supervision.scholar.userId,
          type: isAccepted ? 'SUCCESS' : 'WARNING',
          title: isAccepted ? 'Hisobot qabul qilindi' : 'Hisobot qaytarildi (Qayta ishlash)',
          message: `${report.supervision.studentName} bo‘yicha "${report.periodName}" hisoboti ${
            isAccepted ? 'tasdiqlandi.' : 'qaytarildi: ' + (feedback || 'Izohsiz')
          }`,
          link: `/dashboard/supervisions/${report.supervisionId}?tab=reports`,
        },
      });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (error) {
    console.error('Report review error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
