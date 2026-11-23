/**
 * DOI Citation Resolver & Metadata Extractor
 * Uses CrossRef REST API to extract metadata and format into standard academic citation styles.
 */

export function cleanDoi(rawDoi) {
  if (!rawDoi) return '';
  let doi = String(rawDoi).trim();
  // Remove URL prefixes if present
  doi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  doi = doi.replace(/^doi:\s*/i, '');
  return doi.trim();
}

/**
 * Format authors into standard academic names: "Smith, J., Doe, A."
 */
function formatAuthors(authors = []) {
  if (!authors || !authors.length) return 'Nomaʼlum muallif';
  return authors
    .map((a) => {
      if (a.family && a.given) {
        const initials = a.given
          .split(/[\s-]+/)
          .map((n) => (n[0] ? n[0].toUpperCase() + '.' : ''))
          .join(' ');
        return `${a.family}, ${initials}`;
      }
      return a.family || a.name || a.given || '';
    })
    .filter(Boolean)
    .join(', ');
}

export async function resolveDoi(rawDoi) {
  const doi = cleanDoi(rawDoi);
  if (!doi) {
    throw new Error('DOI kiritilmadi.');
  }

  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'TIUScholars/1.0 (mailto:info@tiu.uz)',
      Accept: 'application/json',
    },
    // 8 second timeout
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Ushbu DOI CrossRef bazasidan topilmadi.');
    }
    throw new Error(`CrossRef API xatosi (${res.status})`);
  }

  const data = await res.json();
  const item = data.message;
  if (!item) {
    throw new Error('DOI maʼlumotlari bo‘sh qaytdi.');
  }

  const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Sarlavhasiz';
  const journal = Array.isArray(item['container-title'])
    ? item['container-title'][0]
    : item['container-title'] || item.publisher || '';
  
  // Year calculation
  let year = '';
  if (item['published-print']?.['date-parts']?.[0]?.[0]) {
    year = String(item['published-print']['date-parts'][0][0]);
  } else if (item['published-online']?.['date-parts']?.[0]?.[0]) {
    year = String(item['published-online']['date-parts'][0][0]);
  } else if (item.issued?.['date-parts']?.[0]?.[0]) {
    year = String(item.issued['date-parts'][0][0]);
  } else if (item.created?.['date-parts']?.[0]?.[0]) {
    year = String(item.created['date-parts'][0][0]);
  }

  const volume = item.volume || '';
  const issue = item.issue || '';
  const page = item.page || '';
  const authorsFormatted = formatAuthors(item.author);
  const publisher = item.publisher || '';

  // 1. APA 7th style: Author, A. A. (Year). Title of article. Title of Periodical, volume(issue), pages. https://doi.org/xx
  let apaCitation = `${authorsFormatted} (${year || 'n.d.'}). ${title}. <i>${journal}</i>`;
  if (volume) {
    apaCitation += `, ${volume}`;
    if (issue) apaCitation += `(${issue})`;
  }
  if (page) apaCitation += `, ${page}`;
  apaCitation += `. https://doi.org/${doi}`;

  // 2. IEEE style: [1] A. A. Author, "Title of article," Title of Periodical, vol. x, no. x, pp. xxx, Year.
  let ieeeCitation = `${authorsFormatted}, "${title}," <i>${journal}</i>`;
  if (volume) ieeeCitation += `, vol. ${volume}`;
  if (issue) ieeeCitation += `, no. ${issue}`;
  if (page) ieeeCitation += `, pp. ${page}`;
  if (year) ieeeCitation += `, ${year}`;
  ieeeCitation += `. doi: ${doi}`;

  // 3. Harvard style: Author, A. (Year) 'Title of article', Title of Periodical, Volume(Issue), pp. pages.
  let harvardCitation = `${authorsFormatted} (${year || 'no date'}) '${title}', <i>${journal}</i>`;
  if (volume) harvardCitation += `, ${volume}`;
  if (issue) harvardCitation += `(${issue})`;
  if (page) harvardCitation += `, pp. ${page}`;
  harvardCitation += `. Available at: https://doi.org/${doi}`;

  return {
    doi,
    title,
    authors: item.author || [],
    authorsFormatted,
    journal,
    year,
    volume,
    issue,
    page,
    publisher,
    type: item.type || 'journal-article',
    citations: {
      apa: apaCitation,
      ieee: ieeeCitation,
      harvard: harvardCitation,
    },
  };
}
