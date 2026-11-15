import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = await getCurrentUser();
  if (!user || !user.scholarProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const grantId = resolvedParams.id;

  try {
    const grant = await prisma.grantProject.findUnique({ where: { id: grantId } });
    if (!grant || grant.scholarId !== user.scholarProfile.id) {
      return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
    }

    if (grant.status === 'APPROVED') {
      return NextResponse.json({ error: 'Cannot modify an APPROVED grant (Integrity Lock)' }, { status: 403 });
    }

    const body = await request.json();
    const updated = await prisma.grantProject.update({
      where: { id: grantId },
      data: {
        title: body.title ?? grant.title,
        role: body.role ?? grant.role,
        fundingSource: body.fundingSource ?? grant.fundingSource,
        startYear: body.startYear ? parseInt(body.startYear, 10) : grant.startYear,
        endYear: body.endYear ? parseInt(body.endYear, 10) : null,
        status: 'PENDING',
        rejectionReason: null,
      },
    });
    return NextResponse.json({ success: true, grant: updated });
  } catch (error) {
    console.error('Update grant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user || !user.scholarProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const grantId = resolvedParams.id;

  try {
    const grant = await prisma.grantProject.findUnique({ where: { id: grantId } });
    if (!grant || grant.scholarId !== user.scholarProfile.id) {
      return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
    }

    if (grant.status === 'APPROVED') {
      return NextResponse.json({ error: 'Cannot modify or delete an APPROVED grant (Integrity Lock)' }, { status: 403 });
    }

    await prisma.grantProject.delete({ where: { id: grantId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete grant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
