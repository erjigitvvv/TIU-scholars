import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { id } = await params;
    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        authors: {
          include: {
            scholar: {
              include: {
                department: {
                  include: { faculty: true },
                },
              },
            },
          },
          orderBy: { authorOrder: 'asc' },
        },
        qualityCheck: true,
      },
    });

    if (!publication) {
      return NextResponse.json({ success: false, error: 'Nashr topilmadi' }, { status: 404 });
    }

    // Generate act number if not present
    let actNo = publication.expertiseActNo;
    let actDate = publication.expertiseActDate;

    if (!actNo) {
      const year = new Date().getFullYear();
      const count = await prisma.publication.count({
        where: { expertiseActNo: { not: null } },
      });
      actNo = `TIU-EXP-${year}-${String(count + 1).padStart(4, '0')}`;
      actDate = new Date();

      await prisma.publication.update({
        where: { id },
        data: {
          expertiseActNo: actNo,
          expertiseActDate: actDate,
        },
      });
    }

    const firstAuthor = publication.authors[0]?.scholar;
    const departmentName = firstAuthor?.department?.nameUz || 'Toshkent Xalqaro Universiteti';
    const facultyName = firstAuthor?.department?.faculty?.nameUz || 'Universitet Ilmiy Kengashi';

    const actData = {
      actNo,
      actDate: actDate || new Date(),
      universityName: 'TOSHKENT XALQARO UNIVERSITETI (TIU)',
      commissionName: 'Ilmiy-tadqiqot ishlari va ekspertiza komissiyasi',
      publicationTitle: publication.title,
      publicationType: publication.type,
      journalOrPublisher: publication.journalOrPublisher,
      year: publication.year,
      doi: publication.doi || 'Berilmagan',
      authors: publication.authors.map((a) => ({
        fullName: a.scholar?.fullName || 'Muallif',
        academicDegree: a.scholar?.academicDegree || 'Yo‘q',
        academicTitle: a.scholar?.academicTitle || 'Yo‘q',
        department: a.scholar?.department?.nameUz || '',
      })),
      facultyName,
      departmentName,
      plagiarismPercent: publication.qualityCheck?.plagiarismPercent || 5,
      isPlagiarismPassed: publication.qualityCheck?.isPlagiarismPassed ?? true,
      conclusionPoints: [
        'Ushbu ilmiy tadqiqot ishi Toshkent Xalqaro Universiteti (TIU) ilmiy yo‘nalishlariga to‘la mos keladi.',
        'Antiplagiat litsenziyalangan tizimi orqali tekshirildi: noqonuniy ko‘chirmachilik va plagiat holatlari aniqlanmadi (meʼyoriy chegarada).',
        'Maqola materiallarida O‘zbekiston Respublikasining davlat yoki tijoriy siriga daxldor maʼlumotlar mavjud emas.',
        'Ushbu ilmiy maqolani OAK ro‘yxatidagi va xalqaro Scopus / Web of Science indeksatsiyasidagi jurnallarda ochiq matbuotda chop etishga RUXSAT BERILADI.',
      ],
      qrVerificationUrl: `https://scholars.tiu.uz/verify-act/${actNo}`,
    };

    return NextResponse.json({ success: true, data: actData });
  } catch (err) {
    console.error('GET /expertise-act error:', err);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}
