import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user || !user.scholarProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const supId = resolvedParams.id;

  try {
    const supervision = await prisma.supervision.findUnique({ where: { id: supId } });
    if (!supervision || supervision.scholarId !== user.scholarProfile.id) {
      return NextResponse.json({ error: 'Supervision not found' }, { status: 404 });
    }

    if (supervision.status === 'APPROVED') {
      return NextResponse.json({ error: 'Cannot modify or delete an APPROVED supervision (Integrity Lock)' }, { status: 403 });
    }

    await prisma.supervision.delete({ where: { id: supId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete supervision error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
