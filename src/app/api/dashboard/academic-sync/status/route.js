import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const scholar = await prisma.scholarProfile.findFirst({
      where: { userId: user.id },
      include: {
        department: {
          include: { faculty: true },
        },
        publications: {
          include: { publication: true },
        },
      },
    });

    if (!scholar) {
      return NextResponse.json({ error: 'Olim profili topilmadi' }, { status: 404 });
    }

    const publications = scholar.publications.map((p) => p.publication);
    const scopusCount = publications.filter((p) => p.isScopusIndexed || p.type === 'SCOPUS').length;
    const orcidCount = publications.filter((p) => p.isOrcidVerified || p.source === 'ORCID').length;
    const scholarCount = publications.filter((p) => p.isScholarIndexed || p.source === 'SCHOLAR').length;

    return NextResponse.json({
      orcid: {
        id: scholar.orcidId || null,
        isConnected: Boolean(scholar.isOrcidConnected || scholar.orcidId),
        verifiedCount: orcidCount,
        url: scholar.orcidId ? `https://orcid.org/${scholar.orcidId}` : null,
      },
      scopus: {
        id: scholar.scopusId || null,
        isConnected: Boolean(scholar.isScopusConnected || scholar.scopusId),
        indexedCount: scopusCount,
        hIndex: scholar.hIndexScopus || scholar.hIndex || 0,
        citations: scholar.totalCitationsScopus || 0,
        url: scholar.scopusId ? `https://www.scopus.com/authid/detail.uri?authorId=${scholar.scopusId}` : null,
      },
      scholar: {
        id: scholar.googleScholarId || null,
        url: scholar.googleScholarUrl || null,
        isConnected: Boolean(scholar.isScholarConnected || scholar.googleScholarUrl || scholar.googleScholarId),
        indexedCount: scholarCount,
        hIndex: scholar.hIndexScholar || scholar.hIndex || 0,
        i10Index: scholar.i10Index || 0,
        citations: scholar.totalCitationsScholar || 0,
      },
      metrics: {
        totalPublications: publications.length,
        totalCitations: scholar.totalCitations || 0,
        hIndex: scholar.hIndex || 0,
        tiuScore: scholar.tiuScore || 0,
        lastAcademicSyncAt: scholar.lastAcademicSyncAt || null,
      },
    });
  } catch (err) {
    console.error('Academic sync status error:', err);
    return NextResponse.json({ error: 'Statusni yuklashda xatolik yuz berdi' }, { status: 500 });
  }
}
