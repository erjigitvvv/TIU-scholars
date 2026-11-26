import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== 'object') return '';
  const words = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (!Array.isArray(positions)) continue;
    for (const pos of positions) {
      words[pos] = word;
    }
  }
  return words.filter(Boolean).join(' ').slice(0, 600);
}

function formatCitations(work) {
  const authorNames = (work.authorships || [])
    .slice(0, 4)
    .map((a) => a.author?.display_name)
    .filter(Boolean);
  const authorsStr =
    authorNames.length > 0
      ? authorNames.join(', ') + ((work.authorships || []).length > 4 ? ' et al.' : '')
      : 'Unknown Author';
  const year = work.publication_year || new Date().getFullYear();
  const title = work.title || 'Untitled';
  const journal =
    work.primary_location?.source?.display_name || 'Scientific Journal';
  const cleanDoi = work.doi ? work.doi.replace(/^https?:\/\/doi\.org\//i, '') : '';

  const apa = `${authorsStr} (${year}). ${title}. <i>${journal}</i>.${cleanDoi ? ` https://doi.org/${cleanDoi}` : ''}`;
  const ieee = `${authorsStr}, "${title}," <i>${journal}</i>, ${year}.${cleanDoi ? ` doi: ${cleanDoi}` : ''}`;
  return { authorsStr, apa, ieee, cleanDoi };
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const since = (searchParams.get('since') || '').trim();
    const relatedTo = (searchParams.get('relatedTo') || '').trim();
    const includePortal = searchParams.get('includePortal') === '1';

    let portalMatches = [];
    if (includePortal && q.length >= 2) {
      portalMatches = await prisma.publication.findMany({
        where: {
          title: { contains: q },
        },
        select: {
          id: true,
          title: true,
          type: true,
          journalOrPublisher: true,
          year: true,
          doi: true,
          url: true,
          citationsCount: true,
          status: true,
        },
        take: 6,
        orderBy: { year: 'desc' },
      });
    }

    if (!q && !relatedTo) {
      return NextResponse.json({ works: [], portalMatches });
    }

    const params = new URLSearchParams({
      'per-page': '12',
      sort: 'cited_by_count:desc',
    });

    const filters = [];
    if (relatedTo) {
      const workId = relatedTo.replace(/^https?:\/\/openalex\.org\//i, '');
      filters.push(`related_to:${workId}`);
    } else if (q) {
      params.set('search', q);
    }

    if (since && /^\d{4}$/.test(since)) {
      filters.push(`from_publication_date:${since}-01-01`);
    }

    if (filters.length > 0) {
      params.set('filter', filters.join(','));
    }

    const url = `https://api.openalex.org/works?${params.toString()}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TIU-Scholars/1.0 (mailto:info@tiu.uz)' },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({
        works: [],
        portalMatches,
        warning: 'OpenAlex API vaqtincha javob bermadi',
      });
    }

    const data = await res.json();
    const works = (data.results || []).map((w) => {
      const { authorsStr, apa, ieee, cleanDoi } = formatCitations(w);
      return {
        id: (w.id || '').replace(/^https?:\/\/openalex\.org\//i, ''),
        title: w.title || 'Untitled',
        authors: authorsStr,
        year: w.publication_year || null,
        journal: w.primary_location?.source?.display_name || 'Scientific Journal',
        doi: cleanDoi,
        citedByCount: w.cited_by_count || 0,
        abstract: reconstructAbstract(w.abstract_inverted_index),
        url: w.doi || w.primary_location?.landing_page_url || w.id,
        apaCitation: apa,
        ieeeCitation: ieee,
      };
    });

    return NextResponse.json({ works, portalMatches });
  } catch (error) {
    console.error('Literature search error:', error);
    return NextResponse.json({ error: 'Search failed', works: [], portalMatches: [] }, { status: 500 });
  }
}
