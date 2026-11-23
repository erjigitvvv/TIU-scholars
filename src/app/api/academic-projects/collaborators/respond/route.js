import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { inviteId, inviteToken, action, reason } = await req.json();

    const whereClause = inviteToken ? { inviteToken } : { id: inviteId };
    const collab = await prisma.projectCollaborator.findFirst({
      where: whereClause,
      include: {
        project: {
          include: {
            creator: {
              include: { scholarProfile: true },
            },
          },
        },
      },
    });

    if (!collab) {
      return NextResponse.json({ success: false, error: 'Taklif topilmadi' }, { status: 404 });
    }

    // Verify recipient
    if (collab.userId && collab.userId !== user.id && collab.scholarEmail !== user.email) {
      return NextResponse.json({ success: false, error: 'Ushbu taklif sizga tegishli emas' }, { status: 403 });
    }

    const isAccept = action === 'ACCEPT';
    const updated = await prisma.projectCollaborator.update({
      where: { id: collab.id },
      data: {
        userId: user.id,
        inviteStatus: isAccept ? 'ACCEPTED' : 'REJECTED',
        consentSignedAt: isAccept ? new Date() : null,
        rejectReason: isAccept ? null : reason || 'Veb platforma orqali rad etildi',
      },
    });

    // Notify creator
    const creatorChatId = collab.project?.creator?.scholarProfile?.telegramChatId;
    if (creatorChatId) {
      const scholarTitle = user.scholarProfile?.fullName || user.email;
      const text = isAccept
        ? `🎉 <b>Xushxabar!</b>\n\nOlim <b>${scholarTitle}</b> sizning «${collab.project.title}» nomli ilmiy ishingizdagi hammualliflik taklifingizni <b>QABUL QILDI</b>!`
        : `ℹ️ <b>Taklif rad etildi:</b>\n\nOlim <b>${scholarTitle}</b> sizning «${collab.project.title}» ilmiy ishingizdagi taklifni rad etdi.`;

      await sendTelegramMessage({
        chatId: creatorChatId,
        text,
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: isAccept ? 'Hammualliflik muvaffaqiyatli qabul qilindi!' : 'Taklif rad etildi.',
    });
  } catch (err) {
    console.error('POST /collaborators/respond error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server xatosi' }, { status: 500 });
  }
}
