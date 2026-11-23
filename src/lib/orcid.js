/**
 * ORCID Public API v3.0 Integratsiya moduli
 * Rasmiy hujjat: https://pub.orcid.org/v3.0/
 */

export function cleanOrcidId(orcidId) {
  if (!orcidId) return null;
  const match = String(orcidId).trim().match(/(\d{4}-\d{4}-\d{4}-[\dX]{4})/i);
  return match ? match[1].toUpperCase() : orcidId.trim().replace(/^https?:\/\/orcid\.org\//i, '');
}

/**
 * Olimning rasmiy ORCID profilini va tashqi ID larini (Scopus ID, ResearcherID) olish
 */
export async function fetchOrcidProfile(orcidId) {
  const cleanOrcid = cleanOrcidId(orcidId);
  if (!cleanOrcid) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(`https://pub.orcid.org/v3.0/${encodeURIComponent(cleanOrcid)}/record`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TIUScholarsPortal/1.0 (mailto:admin@tiu.uz)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const person = data.person || {};
    const nameObj = person.name || {};
    const givenNames = nameObj['given-names']?.value || '';
    const familyName = nameObj['family-name']?.value || '';
    const fullName = [givenNames, familyName].filter(Boolean).join(' ');

    const biography = person.biography?.content || '';

    // Tashqi identifikatorlarni (Scopus, ResearcherID) qidirish
    let scopusId = null;
    let researcherId = null;
    const externalIds = person['external-identifiers']?.['external-identifier'] || [];

    for (const ext of externalIds) {
      const type = (ext['external-id-type'] || '').toLowerCase();
      const val = ext['external-id-value'] || '';
      if (type.includes('scopus') || type.includes('scopus-author-id')) {
        scopusId = val;
      } else if (type.includes('researcherid') || type.includes('wos') || type.includes('publons')) {
        researcherId = val;
      }
    }

    const activities = data['activities-summary'] || {};
    const worksCount = activities.works?.group?.length || 0;

    return {
      orcidId: cleanOrcid,
      fullName: fullName || null,
      biography,
      scopusId,
      researcherId,
      worksCount,
      url: `https://orcid.org/${cleanOrcid}`,
    };
  } catch (err) {
    console.error('ORCID profile fetch error:', err.message);
    return null;
  }
}

/**
 * Olimning ORCID profilidagi barcha maqolalarini tortish
 */
export async function fetchOrcidWorks(orcidId) {
  const cleanOrcid = cleanOrcidId(orcidId);
  if (!cleanOrcid) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`https://pub.orcid.org/v3.0/${encodeURIComponent(cleanOrcid)}/works`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TIUScholarsPortal/1.0 (mailto:admin@tiu.uz)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const groups = data.group || [];
    const works = [];

    for (const group of groups) {
      const summary = group['work-summary'] && group['work-summary'][0];
      if (!summary) continue;

      const titleObj = summary.title?.title?.value;
      const title = titleObj ? titleObj.trim() : 'Untitled ORCID Work';

      let year = new Date().getFullYear();
      if (summary['publication-date']?.year?.value) {
        year = parseInt(summary['publication-date'].year.value, 10) || year;
      }

      const journalOrPublisher = summary['journal-title']?.value
        ? summary['journal-title'].value.trim()
        : 'ORCID Repository';

      // DOI ni ajratib olish
      let doi = null;
      let eid = null;
      const externalIds = summary['external-ids']?.['external-id'] || [];
      if (Array.isArray(externalIds)) {
        for (const extId of externalIds) {
          const extType = (extId['external-id-type'] || '').toLowerCase();
          const extVal = extId['external-id-value'] || '';
          if (extType === 'doi') {
            doi = extVal.trim().replace(/^https?:\/\/doi\.org\//i, '');
          } else if (extType.includes('eid') || extType.includes('scopus')) {
            eid = extVal.trim();
          }
        }
      }

      works.push({
        title,
        journalOrPublisher,
        year,
        doi,
        scopusEID: eid,
        url: doi ? `https://doi.org/${doi}` : null,
        type: 'INTERNATIONAL_JOURNAL',
        citationsCount: 0,
        quartile: 'NONE',
        source: 'ORCID',
        isOrcidVerified: true,
      });
    }

    return works;
  } catch (err) {
    console.error('ORCID fetch error:', err.message);
    return [];
  }
}
