import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchOrcidWorks } from '@/lib/orcid';
import { fetchByDoi } from '@/lib/crossref';
import { recalculateScholarScores } from '@/lib/scoring';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    // Find scholar profile
    const scholar = await prisma.scholarProfile.findFirst({
      where: { userId: user.id },
    });

    if (!scholar) {
      return NextResponse.json({ error: 'Olim profili topilmadi' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const orcidId = body.orcidId || scholar.orcidId;

    if (!orcidId) {
      return NextResponse.json(
        { error: 'ORCID ID kiritilmagan. Avval profilingizda ORCID ID ni saqlang.' },
        { status: 400 }
      );
    }

    // Update orcidId in profile if newly provided
    if (body.orcidId && body.orcidId !== scholar.orcidId) {
      await prisma.scholarProfile.update({
        where: { id: scholar.id },
        data: { orcidId: body.orcidId },
      });
    }

    // Fetch works from ORCID Public API
    const orcidWorks = await fetchOrcidWorks(orcidId);
    if (!orcidWorks || orcidWorks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'ORCID profilida ochiq (public) maqolalar topilmadi.',
        syncedCount: 0,
        skippedCount: 0,
      });
    }

    let syncedCount = 0;
    let skippedCount = 0;
    let totalNewCitations = 0;

    for (const work of orcidWorks) {
      // Check existing by DOI
      let existing = null;
      if (work.doi) {
        existing = await prisma.publication.findUnique({
          where: { doi: work.doi },
          include: { authors: true },
        });
      }

      // If DOI exists in database, link to scholar if not yet linked
      if (existing) {
        const isAuthorLinked = existing.authors.some((a) => a.scholarId === scholar.id);
        if (!isAuthorLinked) {
          await prisma.publicationAuthor.create({
            data: {
              publicationId: existing.id,
              scholarId: scholar.id,
              authorOrder: existing.authors.length + 1,
            },
          });
          syncedCount++;
        } else {
          skippedCount++;
        }
        continue;
      }

      // If not existing, enrich citation and metadata using Crossref if DOI exists
      let citationsCount = 0;
      let publicationType = work.type || 'INTERNATIONAL_JOURNAL';
      let verifiedUrl = work.url;

      if (work.doi) {
        try {
          const crossrefMeta = await fetchByDoi(work.doi);
          if (crossrefMeta) {
            citationsCount = crossrefMeta.citationsCount || 0;
            totalNewCitations += citationsCount;
            if (crossrefMeta.url) verifiedUrl = crossrefMeta.url;
          }
        } catch (e) {
          console.warn('Crossref lookup error for DOI:', work.doi, e);
        }
      }

      // Create new publication
      await prisma.publication.create({
        data: {
          title: work.title,
          type: publicationType,
          journalOrPublisher: work.journalOrPublisher || 'ORCID Archive',
          year: work.year || new Date().getFullYear(),
          doi: work.doi,
          url: verifiedUrl,
          citationsCount: citationsCount,
          quartile: 'NONE',
          status: 'APPROVED', // Synced verified ORCID works can be auto-approved or pending based on policy
          submittedById: user.id,
          authors: {
            create: [
              {
                scholarId: scholar.id,
                authorOrder: 1,
              },
            ],
          },
        },
      });
      syncedCount++;
    }

    // Recalculate TIU score & citations
    await recalculateScholarScores(scholar.id);

    return NextResponse.json({
      success: true,
      message: `${syncedCount} ta yangi maqola ORCID dan muvaffaqiyatli tortildi!`,
      syncedCount,
      skippedCount,
      totalFetched: orcidWorks.length,
    });
  } catch (error) {
    console.error('ORCID sync API error:', error);
    return NextResponse.json(
      { error: error.message || 'ORCID sinxronizatsiyasida xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
