import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const supervisionId = resolvedParams.id;

  try {
    const sup = await prisma.supervision.findUnique({
      where: { id: supervisionId },
      include: { scholar: true, checklist: true },
    });
    if (!sup) return NextResponse.json({ error: 'Supervision not found' }, { status: 404 });

    if (user.role === 'SCHOLAR' && sup.scholar.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updateData = {};

    if (body.dissertationFileUrl !== undefined) updateData.dissertationFileUrl = body.dissertationFileUrl;
    if (body.isDissertationReady !== undefined) updateData.isDissertationReady = Boolean(body.isDissertationReady);
    if (body.autoreferatFileUrl !== undefined) updateData.autoreferatFileUrl = body.autoreferatFileUrl;
    if (body.isAutoreferatReady !== undefined) updateData.isAutoreferatReady = Boolean(body.isAutoreferatReady);
    if (body.seminarProtocolUrl !== undefined) updateData.seminarProtocolUrl = body.seminarProtocolUrl;
    if (body.isSeminarApproved !== undefined) updateData.isSeminarApproved = Boolean(body.isSeminarApproved);
    if (body.plagiarismReportUrl !== undefined) updateData.plagiarismReportUrl = body.plagiarismReportUrl;
    if (body.plagiarismPercent !== undefined) {
      updateData.plagiarismPercent = body.plagiarismPercent ? parseFloat(body.plagiarismPercent) : null;
      updateData.isPlagiarismPassed = updateData.plagiarismPercent >= 80;
    }
    if (body.isPlagiarismPassed !== undefined) updateData.isPlagiarismPassed = Boolean(body.isPlagiarismPassed);

    // Check if all 4 are met
    const currentCl = sup.checklist || {};
    const finalDiss = updateData.isDissertationReady ?? currentCl.isDissertationReady;
    const finalAuto = updateData.isAutoreferatReady ?? currentCl.isAutoreferatReady;
    const finalSem = updateData.isSeminarApproved ?? currentCl.isSeminarApproved;
    const finalPlag = updateData.isPlagiarismPassed ?? currentCl.isPlagiarismPassed;

    updateData.allRequirementsMet = finalDiss && finalAuto && finalSem && finalPlag;

    const checklist = await prisma.supervisionChecklist.upsert({
      where: { supervisionId },
      create: {
        supervisionId,
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({ success: true, checklist });
  } catch (error) {
    console.error('Checklist update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
