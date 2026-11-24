import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

function extractDois(text = '') {
  const doiRegex = /\b10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+\b/gi;
  const matches = text.match(doiRegex) || [];
  // Return unique DOIs
  return [...new Set(matches.map((d) => d.trim()))];
}

async function fetchCrossRefDoi(doi) {
  try {
    const cleanDoi = encodeURIComponent(doi.replace(/^https?:\/\/doi\.org\//i, '').trim());
    const res = await fetch(`https://api.crossref.org/works/${cleanDoi}`, {
      headers: {
        'User-Agent': 'TIUScholarsResearchEngine/2.0 (mailto:info@tiu.uz)',
      },
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (!res.ok) return null;
    const json = await res.json();
    const item = json.message;
    if (!item) return null;

    const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Sarlavhasiz maqola';
    const journal = Array.isArray(item['container-title']) ? item['container-title'][0] : item['container-title'] || 'Ilmiy Jurnal';
    const year =
      item['published-print']?.['date-parts']?.[0]?.[0] ||
      item['published-online']?.['date-parts']?.[0]?.[0] ||
      item['issued']?.['date-parts']?.[0]?.[0] ||
      new Date().getFullYear();

    const authors = (item.author || []).map((a) => {
      const family = a.family || '';
      const given = a.given ? `${a.given[0]}.` : '';
      return `${family} ${given}`.trim();
    });

    const authorsFormatted =
      authors.length > 3
        ? `${authors.slice(0, 3).join(', ')} et al.`
        : authors.join(', ') || 'Muallif ko‘rsatilmagan';

    const volume = item.volume ? `, ${item.volume}` : '';
    const issue = item.issue ? `(${item.issue})` : '';
    const page = item.page ? `, pp. ${item.page}` : '';

    // Standard APA 7th format
    const apa = `${authorsFormatted} (${year}). ${title}. <i>${journal}</i>${volume}${issue}${page}. https://doi.org/${item.DOI}`;

    // Standard IEEE format
    const firstAuthor = authors[0] || 'Author';
    const ieee = `${authorsFormatted}, "${title}," <i>${journal}</i>${volume}${issue}${page}, ${year}, doi: ${item.DOI}.`;

    // Standard GOST format
    const gost = `${authorsFormatted} ${title} // ${journal}. — ${year}.${volume ? ' — Vol. ' + item.volume : ''}.${issue ? ' — № ' + item.issue : ''}${page ? ' — P. ' + item.page : ''}. — DOI: ${item.DOI}.`;

    // BibTeX format
    const citeKey = `${(authors[0] || 'article').toLowerCase().replace(/\s+/g, '')}${year}`;
    const bibtex = `@article{${citeKey},
  author = {${(item.author || []).map((a) => `${a.family || ''}, ${a.given || ''}`).join(' and ')}},
  title = {${title}},
  journal = {${journal}},
  year = {${year}},
  doi = {${item.DOI}},
  url = {https://doi.org/${item.DOI}}
}`;

    return {
      doi: item.DOI,
      title,
      journal,
      year,
      authorsFormatted,
      citations: {
        apa,
        ieee,
        gost,
        bibtex,
      },
    };
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text = '', dois = [] } = body;

    let targetDois = Array.isArray(dois) && dois.length > 0 ? dois : extractDois(text);

    if (targetDois.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Matnda birorta ham DOI manzili (masalan: 10.1016/...) topilmadi' },
        { status: 400 }
      );
    }

    // Limit to 15 per batch to prevent rate limiting
    targetDois = targetDois.slice(0, 15);

    // Fetch in parallel
    const resolvedItems = await Promise.all(targetDois.map((d) => fetchCrossRefDoi(d)));
    const validItems = resolvedItems.filter(Boolean);

    // Combine BibTeX file string
    const combinedBibtex = validItems.map((item) => item.citations.bibtex).join('\n\n');

    return NextResponse.json({
      success: true,
      foundDois: targetDois,
      resolvedCount: validItems.length,
      items: validItems,
      combinedBibtex,
    });
  } catch (error) {
    console.error('POST /api/research-tools/doi-batch error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}
