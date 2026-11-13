export function parseBibtex(bibContent) {
  if (!bibContent || typeof bibContent !== 'string') return []

  const publications = []
  // Simple robust parser for bibtex entries
  const entryRegex = /@([a-zA-Z]+)\s*\{\s*([^,\s]+)\s*,\s*([\s\S]*?)\n\s*\}/g
  let match

  while ((match = entryRegex.exec(bibContent)) !== null) {
    const bibType = match[1].toLowerCase()
    const fieldsStr = match[3]

    const pub = {
      title: '',
      journalOrPublisher: '',
      year: new Date().getFullYear(),
      doi: null,
      url: null,
      isbnOrPatentNo: null,
      quartile: 'NONE',
      citationsCount: 0,
      type: 'INTERNATIONAL_JOURNAL',
    }

    if (bibType === 'article') pub.type = 'INTERNATIONAL_JOURNAL'
    else if (bibType === 'inproceedings' || bibType === 'conference') pub.type = 'CONFERENCE'
    else if (bibType === 'book') pub.type = 'MONOGRAPH'
    else pub.type = 'LOCAL_JOURNAL'

    // Parse fields
    const fieldRegex = /([a-zA-Z0-9_-]+)\s*=\s*(?:\{([^}]*)\}|"([^"]*)"|([0-9]+))/g
    let fieldMatch
    while ((fieldMatch = fieldRegex.exec(fieldsStr)) !== null) {
      const key = fieldMatch[1].toLowerCase()
      const val = fieldMatch[2] || fieldMatch[3] || fieldMatch[4] || ''

      if (key === 'title') pub.title = val.replace(/[\{\}]/g, '').trim()
      else if (key === 'journal' || key === 'publisher' || key === 'booktitle') {
        pub.journalOrPublisher = val.replace(/[\{\}]/g, '').trim()
      } else if (key === 'year') {
        pub.year = parseInt(val, 10) || new Date().getFullYear()
      } else if (key === 'doi') {
        pub.doi = val.trim()
      } else if (key === 'url') {
        pub.url = val.trim()
      } else if (key === 'isbn' || key === 'issn') {
        pub.isbnOrPatentNo = val.trim()
      }
    }

    if (pub.title) {
      publications.push(pub)
    }
  }

  return publications
}
