import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncScholarAcademicDossier } from '@/lib/academicSync';

export async function POST() {
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

    const result = await syncScholarAcademicDossier(scholar.id);

    return NextResponse.json({
      success: true,
      message: 'Barcha ilmiy platformalardan maqolalar va ko‘rsatkichlar muvaffaqiyatli sinxronlandi!',
      data: result,
    });
  } catch (err) {
    console.error('Academic sync-all error:', err);
    return NextResponse.json({ error: err.message || 'Sinxronizatsiyada xatolik' }, { status: 500 });
  }
}
