import { prisma } from '@/lib/prisma';
import { cleanOrcidId, fetchOrcidProfile, fetchOrcidWorks } from '@/lib/orcid';
import { cleanScopusId, fetchScopusProfile, fetchScopusWorks } from '@/lib/scopus';
import { extractScholarId, fetchScholarProfile, fetchScholarWorks } from '@/lib/scholar';
import { fetchByDoi } from '@/lib/crossref';
import { recalculateScholarMetrics } from '@/lib/scoring';

/**
 * Matnni solishtirish uchun tozalash (Fuzzy Title Match)
 */
function normalizeTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * 1. ORCID profilini tekshirish va bog'lash
 */
export async function connectScholarOrcid(scholarId, orcidInput) {
  const cleanOrcid = cleanOrcidId(orcidInput);
  if (!cleanOrcid) {
    return { success: false, error: 'Yaroqsiz ORCID ID formati (masalan: 0000-0002-1825-0097).' };
  }

  const profile = await fetchOrcidProfile(cleanOrcid);

  // Olim profilini yangilash
  const updateData = {
    orcidId: cleanOrcid,
    isOrcidConnected: true,
  };

  // Agar ORCID ichidan Scopus ID topilsa, uni ham avtomatik saqlaymiz!
  if (profile?.scopusId) {
    updateData.scopusId = profile.scopusId;
    updateData.isScopusConnected = true;
  }

  const updatedScholar = await prisma.scholarProfile.update({
    where: { id: scholarId },
    data: updateData,
  });

  return {
    success: true,
    orcidId: cleanOrcid,
    autoDetectedScopusId: profile?.scopusId || null,
    profile,
    scholar: updatedScholar,
  };
}

/**
 * 2. Scopus Author ID ni tekshirish va bog'lash
 */
export async function connectScholarScopus(scholarId, scopusInput) {
  const cleanId = cleanScopusId(scopusInput);
  if (!cleanId) {
    return { success: false, error: 'Yaroqsiz Scopus Author ID (8-12 xonali raqam bo‘lishi kerak).' };
  }

  const scopusProfile = await fetchScopusProfile(cleanId);

  const updatedScholar = await prisma.scholarProfile.update({
    where: { id: scholarId },
    data: {
      scopusId: cleanId,
      isScopusConnected: true,
      hIndexScopus: scopusProfile?.hIndex || 0,
      totalCitationsScopus: scopusProfile?.totalCitations || 0,
    },
  });

  return {
    success: true,
    scopusId: cleanId,
    profile: scopusProfile,
    scholar: updatedScholar,
  };
}

/**
 * 3. Google Scholar profilini tekshirish va bog'lash
 */
export async function connectScholarGoogle(scholarId, scholarInput) {
  const scholarIdStr = extractScholarId(scholarInput);
  if (!scholarIdStr) {
    return { success: false, error: 'Google Scholar ID yoki havolasi noto‘g‘ri kiritildi.' };
  }

  const scholarProfile = await fetchScholarProfile(scholarIdStr);

  const updatedScholar = await prisma.scholarProfile.update({
    where: { id: scholarId },
    data: {
      googleScholarId: scholarIdStr,
      googleScholarUrl: `https://scholar.google.com/citations?user=${scholarIdStr}`,
      isScholarConnected: true,
      hIndexScholar: scholarProfile?.hIndex || 0,
      totalCitationsScholar: scholarProfile?.totalCitations || 0,
      i10Index: scholarProfile?.i10Index || 0,
    },
  });

  return {
    success: true,
    scholarId: scholarIdStr,
    profile: scholarProfile,
    scholar: updatedScholar,
  };
}

/**
 * 4. Yagona, dublikatsiz avtomatik sinxronizatsiya mexanizmi (Sync All Engine)
 */
export async function syncScholarAcademicDossier(scholarId) {
  const scholar = await prisma.scholarProfile.findUnique({
    where: { id: scholarId },
    include: {
      user: true,
      publications: {
        include: { publication: true },
      },
    },
  });

  if (!scholar) throw new Error('Olim profili topilmadi');

  const incomingWorks = [];

  // A. ORCID orqali maqolalarni olish
  if (scholar.orcidId && (scholar.isOrcidConnected || scholar.orcidId)) {
    try {
      const orcidWorks = await fetchOrcidWorks(scholar.orcidId);
      incomingWorks.push(...orcidWorks);
    } catch (e) {
      console.warn('ORCID works sync error:', e.message);
    }
  }

  // B. Scopus orqali maqolalarni olish
  if (scholar.scopusId && (scholar.isScopusConnected || scholar.scopusId)) {
    try {
      const scopusWorks = await fetchScopusWorks(scholar.scopusId);
      incomingWorks.push(...scopusWorks);
    } catch (e) {
      console.warn('Scopus works sync error:', e.message);
    }
  }

  // C. Google Scholar orqali maqolalarni olish
  if (scholar.googleScholarId || scholar.googleScholarUrl) {
    const sId = scholar.googleScholarId || extractScholarId(scholar.googleScholarUrl);
    if (sId) {
      try {
        const scholarWorks = await fetchScholarWorks(sId);
        incomingWorks.push(...scholarWorks);
      } catch (e) {
        console.warn('Scholar works sync error:', e.message);
      }
    }
  }

  // Dublikatlarni birlashtirish va saqlash statistikasi
  let newCreated = 0;
  let updatedExisting = 0;
  let deduplicatedCount = 0;

  // Mavjud maqolalar ro'yxati
  const existingPubs = await prisma.publication.findMany({
    include: { authors: true },
  });

  for (const work of incomingWorks) {
    if (!work || !work.title) continue;

    const normTitle = normalizeTitle(work.title);
    let matchedPub = null;

    // 1-bosqich: DOI bo'yicha qidirish (Eng aniq)
    if (work.doi) {
      matchedPub = existingPubs.find(
        (p) => p.doi && p.doi.toLowerCase() === work.doi.toLowerCase()
      );
    }

    // 2-bosqich: Agar DOI bo'lmasa, sarlavha va yil bo'yicha moslashtirish (Fuzzy Title Match)
    if (!matchedPub && normTitle.length > 10) {
      matchedPub = existingPubs.find((p) => {
        const existingNorm = normalizeTitle(p.title);
        const yearDiff = Math.abs((p.year || 0) - (work.year || 0));
        return existingNorm === normTitle && yearDiff <= 1;
      });
    }

    if (matchedPub) {
      // Dublikat aniqlandi! Mavjud maqolani boyitamiz
      deduplicatedCount++;
      const isAuthorLinked = matchedPub.authors?.some((a) => a.scholarId === scholar.id);

      if (!isAuthorLinked) {
        await prisma.publicationAuthor.create({
          data: {
            publicationId: matchedPub.id,
            scholarId: scholar.id,
            authorOrder: (matchedPub.authors?.length || 0) + 1,
          },
        }).catch(() => {});
      }

      // Belgilar va iqtiboslarni yangilash
      const updatePayload = {};
      if (work.isScopusIndexed && !matchedPub.isScopusIndexed) updatePayload.isScopusIndexed = true;
      if (work.isOrcidVerified && !matchedPub.isOrcidVerified) updatePayload.isOrcidVerified = true;
      if (work.isScholarIndexed && !matchedPub.isScholarIndexed) updatePayload.isScholarIndexed = true;
      if (work.citationsCount > matchedPub.citationsCount) updatePayload.citationsCount = work.citationsCount;
      if (work.scopusEID && !matchedPub.scopusEID) updatePayload.scopusEID = work.scopusEID;

      if (Object.keys(updatePayload).length > 0) {
        await prisma.publication.update({
          where: { id: matchedPub.id },
          data: updatePayload,
        });
        updatedExisting++;
      }
    } else {
      // Yangi unikal maqola — tizimga kiritamiz
      let citations = work.citationsCount || 0;
      let finalUrl = work.url;

      // Agar DOI mavjud bo'lsa, Crossref orqali aniq iqtiboslarni tekshiramiz
      if (work.doi) {
        try {
          const crossrefMeta = await fetchByDoi(work.doi);
          if (crossrefMeta) {
            if (crossrefMeta.citationsCount > citations) {
              citations = crossrefMeta.citationsCount;
            }
            if (!finalUrl && crossrefMeta.url) finalUrl = crossrefMeta.url;
          }
        } catch {}
      }

      const newPub = await prisma.publication.create({
        data: {
          title: work.title,
          type: work.type || (work.isScopusIndexed ? 'SCOPUS' : 'INTERNATIONAL_JOURNAL'),
          journalOrPublisher: work.journalOrPublisher || 'Xalqaro Ilmiy Jurnal',
          year: work.year || new Date().getFullYear(),
          doi: work.doi || null,
          url: finalUrl,
          quartile: work.quartile || 'NONE',
          citationsCount: citations,
          status: 'APPROVED', // Ochiq xalqaro bazadan tortilgani uchun avto-tasdiqlanadi
          isScopusIndexed: Boolean(work.isScopusIndexed),
          isOrcidVerified: Boolean(work.isOrcidVerified),
          isScholarIndexed: Boolean(work.isScholarIndexed),
          scopusEID: work.scopusEID || null,
          source: work.source || 'ORCID',
          submittedById: scholar.userId,
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

      existingPubs.push(newPub);
      newCreated++;
    }
  }

  // Oxirgi sinxronizatsiya vaqti va ko'rsatkichlarni yangilash
  await prisma.scholarProfile.update({
    where: { id: scholar.id },
    data: {
      lastAcademicSyncAt: new Date(),
    },
  });

  // Reyting va TIU ballini qayta hisoblash
  const updatedScores = await recalculateScholarMetrics(scholar.id);

  return {
    success: true,
    totalIncoming: incomingWorks.length,
    newCreated,
    updatedExisting,
    deduplicatedCount,
    updatedScores,
  };
}
