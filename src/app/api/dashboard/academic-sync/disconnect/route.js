import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recalculateScholarMetrics } from '@/lib/scoring';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const scholar = await prisma.scholarProfile.findFirst({
      where: { userId: user.id },
    });

    if (!scholar) {
      return NextResponse.json({ error: 'Olim profili topilmadi' }, { status: 404 });
    }

    const { platform } = await request.json();
    const updateData = {};

    if (platform === 'orcid') {
      updateData.orcidId = null;
      updateData.isOrcidConnected = false;
    } else if (platform === 'scopus') {
      updateData.scopusId = null;
      updateData.isScopusConnected = false;
      updateData.hIndexScopus = 0;
      updateData.totalCitationsScopus = 0;
    } else if (platform === 'scholar') {
      updateData.googleScholarId = null;
      updateData.googleScholarUrl = null;
      updateData.isScholarConnected = false;
      updateData.hIndexScholar = 0;
      updateData.totalCitationsScholar = 0;
      updateData.i10Index = 0;
    } else {
      return NextResponse.json({ error: 'Noma‘lum platforma' }, { status: 400 });
    }

    await prisma.scholarProfile.update({
      where: { id: scholar.id },
      data: updateData,
    });

    await recalculateScholarMetrics(scholar.id);

    return NextResponse.json({
      success: true,
      message: `${platform.toUpperCase()} platformasi ulanishi bekor qilindi.`,
    });
  } catch (err) {
    console.error('Disconnect error:', err);
    return NextResponse.json({ error: 'Ulanishni uzishda xatolik yuz berdi' }, { status: 500 });
  }
}
