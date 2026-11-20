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
    const { publicationId } = body;

    if (!publicationId) {
      return NextResponse.json({ error: 'publicationId majburiy.' }, { status: 400 });
    }

    const existingPub = await prisma.publication.findUnique({ where: { id: publicationId } });
    if (!existingPub) {
      return NextResponse.json({ error: 'Nashr topilmadi.' }, { status: 404 });
    }

    const linked = await prisma.supervisionPublication.upsert({
      where: {
        supervisionId_publicationId: {
          supervisionId,
          publicationId,
        },
      },
      create: {
        supervisionId,
        publicationId,
      },
      update: {},
      include: {
        publication: true,
      },
    });

    return NextResponse.json({ success: true, linked });
  } catch (error) {
    console.error('Link publication error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const supervisionId = resolvedParams.id;

  try {
    const { searchParams } = new URL(request.url);
    const publicationId = searchParams.get('publicationId');

    if (!publicationId) {
      return NextResponse.json({ error: 'publicationId query parametri talab qilinadi.' }, { status: 400 });
    }

    await prisma.supervisionPublication.deleteMany({
      where: {
        supervisionId,
        publicationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unlink publication error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
