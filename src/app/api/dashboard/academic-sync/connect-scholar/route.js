import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { connectScholarGoogle, syncScholarAcademicDossier } from '@/lib/academicSync';

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

    const { scholarUrlOrId } = await request.json();
    if (!scholarUrlOrId) {
      return NextResponse.json({ error: 'Google Scholar profil havolasi yoki IDsi kiritilishi shart' }, { status: 400 });
    }

    const result = await connectScholarGoogle(scholar.id, scholarUrlOrId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Darhol dastlabki sinxronlash
    const syncRes = await syncScholarAcademicDossier(scholar.id);

    return NextResponse.json({
      success: true,
      message: 'Google Scholar profili muvaffaqiyatli bog‘landi va iqtiboslar yangilandi!',
      data: result,
      sync: syncRes,
    });
  } catch (err) {
    console.error('Connect Google Scholar error:', err);
    return NextResponse.json({ error: err.message || 'Google Scholar bog‘lashda xatolik' }, { status: 500 });
  }
}
