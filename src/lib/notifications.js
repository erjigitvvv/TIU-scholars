import { prisma } from '@/lib/prisma';

/**
 * Create a notification for a single user.
 */
export async function notifyUser({ userId, type = 'INFO', title, message, link = null }) {
  if (!userId || !title || !message) return null;
  try {
    return await prisma.notification.create({
      data: { userId, type, title, message, link },
    });
  } catch (error) {
    console.error('notifyUser error:', error);
    return null;
  }
}

/**
 * Notify all active moderators and super admins.
 */
export async function notifyModerators({ type = 'INFO', title, message, link = null }) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['MODERATOR', 'SUPER_ADMIN'] },
        accountStatus: 'ACTIVE',
      },
      select: { id: true },
    });
    if (admins.length === 0) return;
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type,
        title,
        message,
        link,
      })),
    });
  } catch (error) {
    console.error('notifyModerators error:', error);
  }
}

/**
 * Notify all active scholars (e.g., when a new announcement is published).
 */
export async function notifyActiveScholars({ type = 'ANNOUNCEMENT', title, message, link = '/dashboard/announcements' }) {
  try {
    const scholars = await prisma.user.findMany({
      where: {
        role: 'SCHOLAR',
        accountStatus: 'ACTIVE',
      },
      select: { id: true },
    });
    if (scholars.length === 0) return;
    await prisma.notification.createMany({
      data: scholars.map((s) => ({
        userId: s.id,
        type,
        title,
        message,
        link,
      })),
    });
  } catch (error) {
    console.error('notifyActiveScholars error:', error);
  }
}
