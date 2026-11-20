import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const supervisionId = resolvedParams.id;

  try {
    const body = await request.json();
    const { title, stage, dueDate, notes } = body;

    if (!title || !dueDate) {
      return NextResponse.json({ error: 'Sarlavha va oxirgi muddat majburiy.' }, { status: 400 });
    }

    const milestone = await prisma.supervisionMilestone.create({
      data: {
        supervisionId,
        title,
        stage: stage || 'B_ACTIVE_RESEARCH',
        dueDate: new Date(dueDate),
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, milestone });
  } catch (error) {
    console.error('Create milestone error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { milestoneId, isCompleted, dueDate, notes } = body;

    if (!milestoneId) {
      return NextResponse.json({ error: 'milestoneId majburiy.' }, { status: 400 });
    }

    const updateData = {};
    if (isCompleted !== undefined) {
      updateData.isCompleted = Boolean(isCompleted);
      updateData.completedDate = isCompleted ? new Date() : null;
    }
    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
      updateData.isOverdue = false;
    }
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.supervisionMilestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    return NextResponse.json({ success: true, milestone: updated });
  } catch (error) {
    console.error('Patch milestone error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
