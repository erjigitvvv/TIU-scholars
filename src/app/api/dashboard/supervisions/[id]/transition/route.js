import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { transitionSupervisionStage } from '@/lib/supervision-state-machine';

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
  }

  const resolvedParams = await params;
  const supervisionId = resolvedParams.id;

  try {
    const body = await request.json();
    const { targetStage, payload = {} } = body;

    if (!targetStage) {
      return NextResponse.json({ error: 'targetStage ko‘rsatilishi shart.' }, { status: 400 });
    }

    const updated = await transitionSupervisionStage({
      supervisionId,
      targetStage,
      actorUser: user,
      payload,
    });

    return NextResponse.json({ success: true, supervision: updated });
  } catch (error) {
    console.error('Supervision transition error:', error);
    return NextResponse.json({ error: error.message || 'Bosqich o‘tishida xatolik' }, { status: 400 });
  }
}
