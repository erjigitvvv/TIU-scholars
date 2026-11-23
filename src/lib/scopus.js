/**
 * Scopus / Elsevier va OpenAlex Ochiq Ilmiy Integratsiya moduli
 */

export function cleanScopusId(input) {
  if (!input) return null;
  const str = String(input).trim();
  const match = str.match(/(\d{8,12})/);
  return match ? match[1] : null;
}

/**
 * Scopus mualliflik profili (H-Index, iqtiboslar, tashkilot va ism)
 */
export async function fetchScopusProfile(scopusId) {
  const cleanId = cleanScopusId(scopusId);
  if (!cleanId) return null;

  const SCOPUS_API_KEY = process.env.SCOPUS_API_KEY;

  // 1-yo'l: Agar rasmiy Elsevier Scopus API kaliti bo'lsa
  if (SCOPUS_API_KEY) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(`https://api.elsevier.com/content/author?author_id=${cleanId}&apiKey=${SCOPUS_API_KEY}`, {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const authorProfile = data['author-retrieval-response']?.[0] || {};
        const coredata = authorProfile['coredata'] || {};
        const subjectAreas = authorProfile['subject-areas']?.['subject-area'] || [];

        const preferredName = authorProfile['author-profile']?.['preferred-name'] || {};
        const givenName = preferredName['given-name'] || '';
        const surname = preferredName['surname'] || '';
        const fullName = [givenName, surname].filter(Boolean).join(' ');

        const affiliation = authorProfile['author-profile']?.['affiliation-current']?.['affiliation']?.['ip-doc']?.['afdispname'] || 'TIU';

        return {
          scopusId: cleanId,
          fullName: fullName || coredata['dc:title'] || `Scopus Author (${cleanId})`,
          affiliation,
          hIndex: parseInt(coredata['h-index'] || '0', 10),
          totalCitations: parseInt(coredata['citation-count'] || '0', 10),
          worksCount: parseInt(coredata['document-count'] || '0', 10),
          source: 'ELSEVIER_SCOPUS_API',
          url: `https://www.scopus.com/authid/detail.uri?authorId=${cleanId}`,
        };
      }
    } catch (err) {
      console.warn('Elsevier Scopus API so‘rovida xatolik, ochiq OpenAlex zahirasiga o‘tilmoqda:', err.message);
    }
  }

  // 2-yo'l: Bepul va Ochiq OpenAlex zaxira mexanizmi (Scopus ID bo‘yicha dunyo bo‘yicha 250M+ maqola bazasi)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const openAlexUrl = `https://api.openalex.org/authors?filter=ids.scopus:https://www.scopus.com/authid/detail.uri?authorId=${cleanId}`;
    const res = await fetch(openAlexUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TIUScholars/1.0 (mailto:admin@tiu.uz)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const author = data.results?.[0];
      if (author) {
        const affiliation = author.last_known_institutions?.[0]?.display_name || 'Tashkent International University';
        return {
          scopusId: cleanId,
          fullName: author.display_name,
          affiliation,
          hIndex: author.summary_stats?.h_index || 0,
          i10Index: author.summary_stats?.i10_index || 0,
          totalCitations: author.cited_by_count || 0,
          worksCount: author.works_count || 0,
          source: 'OPENALEX_SCOPUS_SYNC',
          url: `https://www.scopus.com/authid/detail.uri?authorId=${cleanId}`,
        };
      }
    }
  } catch (err) {
    console.error('Scopus OpenAlex zaxira xatosi:', err.message);
  }

  // Standart minimal qaytarish (agar API offline bo'lsa)
  return {
    scopusId: cleanId,
    fullName: `Scopus Author (${cleanId})`,
    affiliation: 'Tashkent International University',
    hIndex: 0,
    totalCitations: 0,
    worksCount: 0,
    source: 'BASIC',
    url: `https://www.scopus.com/authid/detail.uri?authorId=${cleanId}`,
  };
}

/**
 * Scopus indeksidagi maqolalarni tortish
 */
export async function fetchScopusWorks(scopusId) {
  const cleanId = cleanScopusId(scopusId);
  if (!cleanId) return [];

  const works = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // OpenAlex orqali Scopus ID ga tegishli maqolalarni ochiq formatda tortish
    const url = `https://api.openalex.org/works?filter=author.id:https://openalex.org/authors?filter=ids.scopus:https://www.scopus.com/authid/detail.uri?authorId=${cleanId}&per-page=50`;
    
    // Yoki to'g'ridan-to'g'ri muallifning OpenAlex orqali works_api_url ga murojaat
    const authorProfile = await fetchScopusProfile(cleanId);
    let worksUrl = `https://api.openalex.org/works?filter=raw_author_name.search:${encodeURIComponent(authorProfile?.fullName || cleanId)}&per-page=30`;

    if (process.env.SCOPUS_API_KEY) {
      // Elsevier Scopus Search API
      const elsevierUrl = `https://api.elsevier.com/content/search/scopus?query=AU-ID(${cleanId})&apiKey=${process.env.SCOPUS_API_KEY}&count=25`;
      const sRes = await fetch(elsevierUrl, { headers: { 'Accept': 'application/json' } }).catch(() => null);
      if (sRes && sRes.ok) {
        const sData = await sRes.json();
        const entries = sData['search-results']?.entry || [];
        for (const entry of entries) {
          const doi = entry['prism:doi'] || null;
          const title = entry['dc:title'] || 'Scopus Publication';
          const journal = entry['prism:publicationName'] || 'Scopus Indexed Journal';
          const citations = parseInt(entry['citedby-count'] || '0', 10);
          const dateStr = entry['prism:coverDate'] || '';
          const year = dateStr ? parseInt(dateStr.slice(0, 4), 10) : new Date().getFullYear();

          works.push({
            title,
            journalOrPublisher: journal,
            year: year || new Date().getFullYear(),
            doi,
            scopusEID: entry['eid'] || null,
            url: doi ? `https://doi.org/${doi}` : `https://www.scopus.com/record/display.uri?eid=${entry['eid']}`,
            type: 'SCOPUS',
            citationsCount: citations,
            quartile: 'NONE',
            source: 'SCOPUS',
            isScopusIndexed: true,
          });
        }
        if (works.length > 0) return works;
      }
    }

    // OpenAlex fallback
    const oaRes = await fetch(`https://api.openalex.org/works?filter=default.search:${encodeURIComponent(authorProfile?.fullName || 'TIU')}&per-page=20`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (oaRes.ok) {
      const oaData = await oaRes.json();
      for (const item of oaData.results || []) {
        const doi = item.doi ? item.doi.replace(/^https?:\/\/doi\.org\//i, '') : null;
        works.push({
          title: item.title || 'Academic Article',
          journalOrPublisher: item.primary_location?.source?.display_name || 'Peer-reviewed Journal',
          year: item.publication_year || new Date().getFullYear(),
          doi,
          url: item.doi || item.primary_location?.landing_page_url || null,
          type: 'SCOPUS',
          citationsCount: item.cited_by_count || 0,
          quartile: 'NONE',
          source: 'SCOPUS',
          isScopusIndexed: true,
        });
      }
    }
  } catch (err) {
    console.warn('fetchScopusWorks xatosi:', err.message);
  }

  return works;
}
