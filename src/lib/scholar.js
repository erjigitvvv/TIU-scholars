/**
 * Google Scholar Integratsiya moduli
 * SerpAPI va OpenAlex orqali Google Scholar ko'rsatkichlarini tortish
 */

export function extractScholarId(input) {
  if (!input) return null;
  const str = String(input).trim();
  // https://scholar.google.com/citations?user=AbCdEfGAAAAJ
  const match = str.match(/user=([a-zA-Z0-9_-]{8,16})/);
  if (match) return match[1];

  // Agar to'g'ridan-to'g'ri 8-16 xonali ID berilgan bo'lsa
  const rawMatch = str.match(/^([a-zA-Z0-9_-]{10,14})$/);
  return rawMatch ? rawMatch[1] : null;
}

/**
 * Google Scholar mualliflik profili (Citations, H-index, i10-index)
 */
export async function fetchScholarProfile(scholarIdOrUrl) {
  const scholarId = extractScholarId(scholarIdOrUrl);
  if (!scholarId) return null;

  const SERPAPI_KEY = process.env.SERPAPI_KEY;

  // 1. Agar SerpAPI kaliti mavjud bo'lsa
  if (SERPAPI_KEY) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const url = `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${scholarId}&api_key=${SERPAPI_KEY}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const author = data.author || {};
        const citedBy = data.cited_by?.table?.[0] || {}; // citations: [all, since_year]
        const hIndexObj = data.cited_by?.table?.[1] || {};
        const i10IndexObj = data.cited_by?.table?.[2] || {};

        return {
          scholarId,
          fullName: author.name || 'Google Scholar Muallifi',
          affiliation: author.affiliations || 'TIU',
          totalCitations: parseInt(citedBy.citations?.all || '0', 10),
          hIndex: parseInt(hIndexObj.h_index?.all || '0', 10),
          i10Index: parseInt(i10IndexObj.i10_index?.all || '0', 10),
          interests: author.interests?.map((i) => i.title) || [],
          url: `https://scholar.google.com/citations?user=${scholarId}`,
          source: 'SERPAPI_GOOGLE_SCHOLAR',
        };
      }
    } catch (err) {
      console.warn('SerpAPI Google Scholar xatosi:', err.message);
    }
  }

  // 2. OpenAlex zaxirasi
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const openAlexRes = await fetch(`https://api.openalex.org/authors?search=${scholarId}&per-page=1`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (openAlexRes.ok) {
      const data = await openAlexRes.json();
      const author = data.results?.[0];
      if (author) {
        return {
          scholarId,
          fullName: author.display_name,
          affiliation: author.last_known_institutions?.[0]?.display_name || 'Tashkent International University',
          totalCitations: author.cited_by_count || 0,
          hIndex: author.summary_stats?.h_index || 0,
          i10Index: author.summary_stats?.i10_index || 0,
          url: `https://scholar.google.com/citations?user=${scholarId}`,
          source: 'OPENALEX_SCHOLAR_ESTIMATE',
        };
      }
    }
  } catch (err) {
    console.warn('OpenAlex Scholar fallback error:', err.message);
  }

  // Standart qaytish
  return {
    scholarId,
    fullName: `Google Scholar User (${scholarId})`,
    affiliation: 'Tashkent International University',
    totalCitations: 0,
    hIndex: 0,
    i10Index: 0,
    url: `https://scholar.google.com/citations?user=${scholarId}`,
    source: 'BASIC',
  };
}

/**
 * Google Scholardagi maqolalar ro'yxatini olish
 */
export async function fetchScholarWorks(scholarIdOrUrl) {
  const scholarId = extractScholarId(scholarIdOrUrl);
  if (!scholarId) return [];

  const works = [];
  const SERPAPI_KEY = process.env.SERPAPI_KEY;

  if (SERPAPI_KEY) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const url = `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${scholarId}&api_key=${SERPAPI_KEY}&num=30`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const articles = data.articles || [];
        for (const art of articles) {
          const title = art.title || 'Scholar Article';
          const year = parseInt(art.year || '0', 10) || new Date().getFullYear();
          const citations = parseInt(art.cited_by?.value || '0', 10);
          const publication = art.publication || 'Google Scholar Source';

          works.push({
            title,
            journalOrPublisher: publication,
            year,
            doi: null,
            url: art.link || null,
            type: 'INTERNATIONAL_JOURNAL',
            citationsCount: citations,
            quartile: 'NONE',
            source: 'SCHOLAR',
            isScholarIndexed: true,
          });
        }
      }
    } catch (err) {
      console.warn('SerpAPI Scholar works error:', err.message);
    }
  }

  return works;
}
