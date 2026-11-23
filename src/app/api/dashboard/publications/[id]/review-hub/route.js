import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { id } = await params;
    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        authors: {
          include: {
            scholar: true,
          },
        },
      },
    });

    if (!publication) {
      return NextResponse.json({ success: false, error: 'Nashr topilmadi' }, { status: 404 });
    }

    const isMember =
      publication.submittedById === user.id ||
      publication.authors.some((a) => a.scholar?.userId === user.id);

    if (!isMember) {
      return NextResponse.json({ success: false, error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    const body = await req.json();
    const { roundTitle, decision, reviewerComments, revisedDocUrl, newStage } = body;

    let existingLogs = [];
    try {
      existingLogs = publication.reviewLogs ? JSON.parse(publication.reviewLogs) : [];
    } catch {
      existingLogs = [];
    }

    const newEntry = {
      id: Date.now().toString(),
      roundTitle: roundTitle || `Taqriz bosqichi #${existingLogs.length + 1}`,
      decision: decision || 'MINOR_REVISION', // ACCEPTED, MINOR_REVISION, MAJOR_REVISION, REJECTED
      date: new Date().toISOString(),
      updatedBy: user.email,
      revisedDocUrl: revisedDocUrl || null,
      comments: Array.isArray(reviewerComments) ? reviewerComments : [],
    };

    const updatedLogs = [newEntry, ...existingLogs];

    const updateData = {
      reviewLogs: JSON.stringify(updatedLogs),
    };

    if (newStage) {
      updateData.currentStage = newStage;
    }

    const updated = await prisma.publication.update({
      where: { id },
      data: updateData,
    });

    // Notify all co-authors via Telegram and in-app Notification
    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    for (const a of publication.authors) {
      if (a.scholar?.userId && a.scholar?.userId !== user.id) {
        // In-app notification
        await prisma.notification.create({
          data: {
            userId: a.scholar.userId,
            title: '📝 Nashr taqrizi va javob xati yangilandi',
            message: `«${publication.title}» nashriga jurnaldan yangi taqriz izohlari va javob xati qo‘shildi (${decision}).`,
            type: 'SYSTEM',
            link: `/dashboard/publications/${publication.id}`,
          },
        }).catch(() => {});

        // Telegram Bot
        if (a.scholar.isTelegramConnected && a.scholar.telegramChatId) {
          const text = `📝 <b>Yangi Taqriz Izohi va Javob Xati Kiritildi!</b>\n\n` +
            `«<b>${publication.title}</b>» nashri bo‘yicha jurnaldan yangi bosqich qayd etildi:\n` +
            `📌 <b>Bosqich:</b> ${newEntry.roundTitle}\n` +
            `⚖️ <b>Qaror:</b> ${decision}\n\n` +
            `<i>Batafsil maʼlumotni kabinetingizda ko‘ring:</i>`;

          const replyMarkup = {
            inline_keyboard: [
              [
                {
                  text: '👁 Kabinetda ko‘rish',
                  url: `${siteUrl}/dashboard/publications/${publication.id}`,
                },
              ],
            ],
          };

          await sendTelegramMessage({
            chatId: a.scholar.telegramChatId,
            text,
            replyMarkup,
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Taqriz izohlari va javob xati muvaffaqiyatli saqlandi hamda jamoaga xabar berildi!',
    });
  } catch (err) {
    console.error('POST /api/dashboard/publications/[id]/review-hub error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server xatosi' }, { status: 500 });
  }
}
