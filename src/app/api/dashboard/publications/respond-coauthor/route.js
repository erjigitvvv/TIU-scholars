import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActiveScholar } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req) {
  try {
    const scholar = await getActiveScholar();
    if (!scholar) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { publicationId, action, rejectionNote } = await req.json();

    if (!publicationId || !action) {
      return NextResponse.json({ success: false, error: 'Parametrlar yetarli emas' }, { status: 400 });
    }

    const pubAuthor = await prisma.publicationAuthor.findUnique({
      where: {
        publicationId_scholarId: {
          publicationId,
          scholarId: scholar.id,
        },
      },
      include: {
        publication: {
          include: {
            submittedBy: {
              include: { scholarProfile: true },
            },
          },
        },
      },
    });

    if (!pubAuthor) {
      return NextResponse.json({ success: false, error: 'Siz ushbu nashrga hammuallif sifatida biriktirilmagansiz' }, { status: 404 });
    }

    const isApprove = action === 'APPROVE';

    const updated = await prisma.publicationAuthor.update({
      where: { id: pubAuthor.id },
      data: {
        approvalStatus: isApprove ? 'APPROVED' : 'REJECTED',
        approvedAt: isApprove ? new Date() : null,
        rejectionNote: isApprove ? null : rejectionNote || 'Platforma orqali rad etildi',
      },
    });

    // Notify submitter via Telegram if connected
    const submitterChatId = pubAuthor.publication?.submittedBy?.scholarProfile?.telegramChatId;
    if (submitterChatId) {
      const text = isApprove
        ? `🎉 <b>Hammualliflik tasdiqlandi!</b>\n\nOlim <b>${scholar.fullName}</b> siz topshirgan «${pubAuthor.publication.title}» nomli nashringizdagi hammualliflikni <b>TASDIQLADI</b>!`
        : `ℹ️ <b>Hammualliflik rad etildi:</b>\n\nOlim <b>${scholar.fullName}</b> siz topshirgan «${pubAuthor.publication.title}» nashridagi hammualliflikni rad etdi.`;

      await sendTelegramMessage({
        chatId: submitterChatId,
        text,
      });
    }

    // In-app notification to submitter
    if (pubAuthor.publication?.submittedById) {
      await prisma.notification.create({
        data: {
          userId: pubAuthor.publication.submittedById,
          title: isApprove ? '✅ Hammuallif tasdiqladi' : '❌ Hammuallif rad etdi',
          message: `${scholar.fullName} «${pubAuthor.publication.title}» nashringizdagi hammualliflikni ${isApprove ? 'tasdiqladi' : 'rad etdi'}.`,
          type: 'SYSTEM',
          link: '/dashboard/publications',
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: isApprove ? 'Nashr hammuallifligi muvaffaqiyatli tasdiqlandi!' : 'Hammualliflik rad etildi.',
    });
  } catch (err) {
    console.error('POST /api/dashboard/publications/respond-coauthor error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server xatosi' }, { status: 500 });
  }
}
