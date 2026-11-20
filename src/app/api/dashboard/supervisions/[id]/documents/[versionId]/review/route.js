import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id: supervisionId, versionId } = resolvedParams;

    const body = await request.json();
    const { reviewDecision, reviewComment } = body;

    if (!['APPROVED', 'NEEDS_REVISION', 'REJECTED'].includes(reviewDecision)) {
      return NextResponse.json(
        { error: 'Yaroqsiz qaror. Ruxsat etilgan: APPROVED, NEEDS_REVISION, REJECTED' },
        { status: 400 }
      );
    }

    const documentVersion = await prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: {
        supervision: true,
      },
    });

    if (!documentVersion || documentVersion.supervisionId !== supervisionId) {
      return NextResponse.json({ error: 'Hujjat versiyasi topilmadi' }, { status: 404 });
    }

    const updated = await prisma.documentVersion.update({
      where: { id: versionId },
      data: {
        reviewDecision,
        reviewComment: reviewComment || null,
        reviewedAt: new Date(),
      },
    });

    // Notify the uploader if different from actor
    if (documentVersion.uploadedById && documentVersion.uploadedById !== user.id) {
      const decisionLabel =
        reviewDecision === 'APPROVED'
          ? 'Tasdiqlandi'
          : reviewDecision === 'NEEDS_REVISION'
          ? 'Tuzatishga qaytarildi'
          : 'Rad etildi';

      await notifyUser({
        userId: documentVersion.uploadedById,
        type: 'SUPERVISION',
        title: `Hujjat tekshiruvi: ${decisionLabel} (v${documentVersion.versionNumber})`,
        message: `Ilmiy rahbaringiz "${documentVersion.fileName}" (v${documentVersion.versionNumber}) bo‘yicha xulosa berdi: ${decisionLabel}.${reviewComment ? ` Izoh: ${reviewComment}` : ''}`,
        link: `/dashboard/supervisions/${supervisionId}?tab=checklist`,
      });
    }

    return NextResponse.json({
      success: true,
      version: updated,
      message: `Hujjat versiyasi bo‘yicha qaror saqlandi (${reviewDecision}).`,
    });
  } catch (error) {
    console.error('Document version review error:', error);
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}
