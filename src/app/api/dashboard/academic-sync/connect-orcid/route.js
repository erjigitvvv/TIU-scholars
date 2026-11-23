import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { connectScholarOrcid, syncScholarAcademicDossier } from '@/lib/academicSync';

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

    const { orcidId } = await request.json();
    if (!orcidId) {
      return NextResponse.json({ error: 'ORCID ID kiritilishi shart' }, { status: 400 });
    }

    const result = await connectScholarOrcid(scholar.id, orcidId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Darhol avtomatik dastlabki sinxronlash
    const syncRes = await syncScholarAcademicDossier(scholar.id);

    return NextResponse.json({
      success: true,
      message: 'ORCID profili muvaffaqiyatli bog‘landi va maqolalar sinxronlandi!',
      data: result,
      sync: syncRes,
    });
  } catch (err) {
    console.error('Connect ORCID error:', err);
    return NextResponse.json({ error: err.message || 'ORCID bog‘lashda xatolik' }, { status: 500 });
  }
}
