import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { connectScholarScopus, syncScholarAcademicDossier } from '@/lib/academicSync';

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

    const { scopusId } = await request.json();
    if (!scopusId) {
      return NextResponse.json({ error: 'Scopus Author ID kiritilishi shart' }, { status: 400 });
    }

    const result = await connectScholarScopus(scholar.id, scopusId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Darhol avtomatik dastlabki sinxronlash
    const syncRes = await syncScholarAcademicDossier(scholar.id);

    return NextResponse.json({
      success: true,
      message: 'Scopus Author ID muvaffaqiyatli bog‘landi va ko‘rsatkichlar yangilandi!',
      data: result,
      sync: syncRes,
    });
  } catch (err) {
    console.error('Connect Scopus error:', err);
    return NextResponse.json({ error: err.message || 'Scopus bog‘lashda xatolik' }, { status: 500 });
  }
}
