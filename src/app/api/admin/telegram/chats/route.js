import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/auth';

export async function GET() {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch announcements for TIU-scholar bot chat
    const announcements = await prisma.announcement.findMany({
      take: 25,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        status: true,
        createdAt: true,
        viewsCount: true,
      },
    });

    // 2. Fetch all scholars with their profile and user info
    const scholars = await prisma.scholarProfile.findMany({
      include: {
        department: {
          select: {
            id: true,
            nameUz: true,
            faculty: { select: { id: true, nameUz: true } },
          },
        },
        user: {
          select: {
            email: true,
            id: true,
            academicProjects: {
              take: 10,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                title: true,
                type: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        grantProjects: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            fundingAgency: true,
            status: true,
            createdAt: true,
          },
        },
        announcementInquiries: {
          include: {
            announcement: { select: { title: true, id: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    // 3. Assemble TIU-scholar bot chat object
    const botMessages = announcements.map((a) => ({
      id: `bot-ann-${a.id}`,
      type: 'ANNOUNCEMENT',
      sender: 'TIU-scholar',
      title: a.title,
      text: a.content,
      category: a.category,
      createdAt: a.createdAt,
      isOutgoing: true, // From system to scholars
    }));

    const botChat = {
      id: 'tiu-scholar-bot',
      name: 'TIU-scholar (Rasmiy Bot)',
      username: '@tiuscholarbot',
      avatar: '🤖',
      isBot: true,
      isOnline: true,
      lastMessage: botMessages[0]
        ? {
            text: `📢 ${botMessages[0].title}`,
            time: botMessages[0].createdAt,
          }
        : { text: 'Bot faol holatda', time: new Date() },
      messages: botMessages,
    };

    // 4. Assemble each scholar's chat thread
    const scholarChats = scholars.map((scholar) => {
      const messages = [];

      // Add academic projects requests
      (scholar.user?.academicProjects || []).forEach((proj) => {
        messages.push({
          id: `proj-${proj.id}`,
          type: 'PROJECT_REQUEST',
          sender: scholar.fullName,
          title: `📑 Ilmiy loyiha so‘rovi: ${proj.title}`,
          text: `Yangi ilmiy ish / ariza topshirildi.\nYo‘nalishi: ${proj.type}\nHolati: ${proj.status}`,
          createdAt: proj.createdAt,
          isOutgoing: false,
          referenceId: proj.id,
          referenceType: 'PROJECT',
        });
      });

      // Add grant projects requests
      (scholar.grantProjects || []).forEach((grant) => {
        messages.push({
          id: `grant-${grant.id}`,
          type: 'GRANT_REQUEST',
          sender: scholar.fullName,
          title: `🏆 Grant arizasi: ${grant.title}`,
          text: `Moliyalashtiruvchi: ${grant.fundingAgency || 'Davlat / Xalqaro'}\nHolati: ${grant.status}`,
          createdAt: grant.createdAt,
          isOutgoing: false,
          referenceId: grant.id,
          referenceType: 'GRANT',
        });
      });

      // Add announcement inquiries and moderator answers
      (scholar.announcementInquiries || []).forEach((inq) => {
        // Scholar's question
        messages.push({
          id: `inq-${inq.id}`,
          type: 'INQUIRY_QUESTION',
          sender: scholar.fullName,
          title: inq.announcement?.title ? `💬 «${inq.announcement.title}» e'loni bo'yicha savol` : '💬 Savol',
          text: inq.questionText,
          status: inq.status,
          createdAt: inq.createdAt,
          isOutgoing: false,
          inquiryId: inq.id,
          announcementId: inq.announcementId,
        });

        // Moderator's reply if exists
        if (inq.answerText) {
          messages.push({
            id: `ans-${inq.id}`,
            type: 'INQUIRY_ANSWER',
            sender: 'TIU Ilmiy Bo‘limi',
            title: `↩ Javob: ${inq.announcement?.title || ''}`,
            text: inq.answerText,
            createdAt: inq.answeredAt || inq.createdAt,
            isOutgoing: true,
            replyToId: `inq-${inq.id}`,
          });
        }
      });

      // Sort all messages chronologically (oldest to newest for chat view)
      messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      // Calculate unread / pending
      const unreadCount = (scholar.announcementInquiries || []).filter((q) => q.status === 'PENDING').length;

      const lastMsg = messages[messages.length - 1];

      // Determine department & faculty folder
      const deptName = (scholar.department?.nameUz || '').toLowerCase();
      const facName = (scholar.department?.faculty?.nameUz || '').toLowerCase();
      const isJurisprudence =
        deptName.includes('yuris') ||
        deptName.includes('huquq') ||
        facName.includes('yuris') ||
        facName.includes('huquq');
      const folder = isJurisprudence ? 'JURISPRUDENCE' : 'BUSINESS';

      return {
        id: scholar.id,
        scholarId: scholar.id,
        name: scholar.fullName,
        fullName: scholar.fullName,
        academicDegree: scholar.academicDegree || 'Tadqiqotchi',
        department: scholar.department?.nameUz || 'Kafedra',
        faculty: scholar.department?.faculty?.nameUz || (isJurisprudence ? 'Yurisprudensiya fakulteti' : 'Biznes va innovatsion taʼlim fakulteti'),
        folder,
        email: scholar.user?.email,
        telegramChatId: scholar.telegramChatId,
        isTelegramConnected: Boolean(scholar.telegramChatId),
        telegramUsername: scholar.telegramUsername,
        avatar: scholar.photoUrl,
        unreadCount,
        lastMessage: lastMsg
          ? {
              text: lastMsg.text?.slice(0, 50) + (lastMsg.text?.length > 50 ? '...' : ''),
              time: lastMsg.createdAt,
              isOutgoing: lastMsg.isOutgoing,
            }
          : { text: 'Muloqot boshlanmagan', time: scholar.createdAt, isOutgoing: false },
        messages,
      };
    });

    // Sort scholar chats by latest activity
    scholarChats.sort((a, b) => {
      const timeA = a.lastMessage?.time ? new Date(a.lastMessage.time).getTime() : 0;
      const timeB = b.lastMessage?.time ? new Date(b.lastMessage.time).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      botChat,
      scholarChats,
    });
  } catch (error) {
    console.error('GET /api/admin/telegram/chats error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}
