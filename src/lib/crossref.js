export async function fetchByDoi(doi) {
  if (!doi) return null
  const cleanDoi = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`, {
      headers: {
        'User-Agent': 'TIUScholarsPortal/1.0 (mailto:admin@tiu.uz)',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const item = data.message
    if (!item) return null

    const title = item.title && item.title.length > 0 ? item.title[0] : 'Untitled'
    const journalOrPublisher = item['container-title'] && item['container-title'].length > 0
      ? item['container-title'][0]
      : (item.publisher || 'Unknown Journal / Publisher')

    let year = new Date().getFullYear()
    if (item.published && item.published['date-parts'] && item.published['date-parts'][0]) {
      year = item.published['date-parts'][0][0] || year
    } else if (item['issued'] && item['issued']['date-parts'] && item['issued']['date-parts'][0]) {
      year = item['issued']['date-parts'][0][0] || year
    }

    const citationsCount = item['is-referenced-by-count'] || 0
    const url = item.URL || `https://doi.org/${cleanDoi}`

    return {
      title,
      journalOrPublisher,
      year: Number(year),
      doi: cleanDoi,
      url,
      citationsCount: Number(citationsCount),
      type: 'SCOPUS', // Default inferred or general international journal
      quartile: 'NONE',
    }
  } catch (err) {
    console.error('Crossref fetch error:', err)
    return null
  }
}
