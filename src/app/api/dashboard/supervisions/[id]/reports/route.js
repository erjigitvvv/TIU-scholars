import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const supervisionId = resolvedParams.id;

  try {
    const sup = await prisma.supervision.findUnique({
      where: { id: supervisionId },
      include: { scholar: true },
    });
    if (!sup) return NextResponse.json({ error: 'Supervision not found' }, { status: 404 });

    if (user.role === 'SCHOLAR' && sup.scholar.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { periodName, content, fileUrl } = body;

    if (!periodName || !content) {
      return NextResponse.json({ error: 'Davr nomi va hisobot matni majburiy.' }, { status: 400 });
    }

    const report = await prisma.supervisionReport.create({
      data: {
        supervisionId,
        periodName,
        content,
        fileUrl: fileUrl || null,
        status: 'PENDING',
      },
    });

    // Notify moderators
    const moderators = await prisma.user.findMany({
      where: { role: { in: ['MODERATOR', 'SUPER_ADMIN'] } },
      select: { id: true },
    });
    for (const mod of moderators) {
      await prisma.notification.create({
        data: {
          userId: mod.id,
          type: 'INFO',
          title: 'Yangi attestatsiya hisoboti',
          message: `${sup.scholar.fullName} izlanuvchi ${sup.studentName} uchun "${periodName}" hisobotini topshirdi.`,
          link: `/admin/supervisions`,
        },
      });
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Supervision report error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
