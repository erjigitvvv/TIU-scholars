export async function fetchOrcidWorks(orcidId) {
  if (!orcidId) return []
  const cleanOrcid = orcidId.trim().replace(/^https?:\/\/orcid\.org\//i, '')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`https://pub.orcid.org/v3.0/${encodeURIComponent(cleanOrcid)}/works`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TIUScholarsPortal/1.0 (mailto:admin@tiu.uz)',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const groups = data.group || []
    const works = []

    for (const group of groups) {
      const summary = group['work-summary'] && group['work-summary'][0]
      if (!summary) continue

      const titleObj = summary.title && summary.title.title && summary.title.title.value
      const title = titleObj || 'Untitled ORCID Work'

      let year = new Date().getFullYear()
      if (summary['publication-date'] && summary['publication-date'].year) {
        year = parseInt(summary['publication-date'].year.value, 10) || year
      }

      const journalOrPublisher = summary['journal-title'] && summary['journal-title'].value
        ? summary['journal-title'].value
        : 'ORCID Repository'

      // Extract DOI if available
      let doi = null
      const externalIds = summary['external-ids'] && summary['external-ids']['external-id']
      if (Array.isArray(externalIds)) {
        for (const extId of externalIds) {
          if (extId['external-id-type'] === 'doi') {
            doi = extId['external-id-value']
            break
          }
        }
      }

      works.push({
        title,
        journalOrPublisher,
        year,
        doi,
        url: doi ? `https://doi.org/${doi}` : null,
        type: 'INTERNATIONAL_JOURNAL',
        citationsCount: 0,
        quartile: 'NONE',
      })
    }

    return works
  } catch (err) {
    console.error('ORCID fetch error:', err)
    return []
  }
}
