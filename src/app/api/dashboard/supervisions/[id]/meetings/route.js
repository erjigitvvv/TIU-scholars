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
    const { topicsCovered, tasksAssigned, nextMeetingDate, notes, meetingDate } = body;

    if (!topicsCovered || !tasksAssigned) {
      return NextResponse.json({ error: 'Mavzular va topshiriqlar majburiy.' }, { status: 400 });
    }

    const meeting = await prisma.supervisionMeeting.create({
      data: {
        supervisionId,
        meetingDate: meetingDate ? new Date(meetingDate) : new Date(),
        topicsCovered,
        tasksAssigned,
        nextMeetingDate: nextMeetingDate ? new Date(nextMeetingDate) : null,
        notes: notes || null,
      },
    });

    // AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'SUPERVISION_MEETING_LOGGED',
        entityType: 'SupervisionMeeting',
        entityId: meeting.id,
        details: JSON.stringify({ supervisionId, topicsCovered }),
      },
    });

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    console.error('Supervision meeting error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
