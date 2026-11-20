import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { getActiveScholar } from '@/lib/auth'
import { recalculateScholarMetrics, getPublicationPoints } from '@/lib/scoring'
import { fetchByDoi } from '@/lib/crossref'
import { parseBibtex } from '@/lib/bibtex'

function getFeedbackMap() {
  try {
    const file = path.join(process.cwd(), 'data', 'publication-feedback.json')
    if (!fs.existsSync(file)) return {}
    return JSON.parse(fs.readFileSync(file, 'utf8') || '{}')
  } catch {
    return {}
  }
}


export async function GET(request) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) {
      return Response.json({ error: 'Unauthorized or no scholar profile' }, { status: 401 })
    }

    const [pubAuthors, scoringConfig] = await Promise.all([
      prisma.publicationAuthor.findMany({
        where: { scholarId: scholar.id },
        include: {
          publication: {
            include: {
              authors: {
                include: { scholar: true }
              }
            }
          }
        },
        orderBy: { publication: { createdAt: 'desc' } }
      }),
      prisma.scoringConfig.findFirst(),
    ])

    const feedbackMap = getFeedbackMap()
    const publications = pubAuthors.map(pa => ({
      ...pa.publication,
      authorOrder: pa.authorOrder,
      views: feedbackMap[pa.publication.id]?.views || 0,
      commentsCount: Array.isArray(feedbackMap[pa.publication.id]?.comments)
        ? feedbackMap[pa.publication.id].comments.length
        : 0,
      tiuScoreValue: getPublicationPoints(pa.publication, scoringConfig),
    }))

    const allScholars = await prisma.scholarProfile.findMany({
      where: {
        id: { not: scholar.id },
        user: { accountStatus: 'ACTIVE' },
      },
      select: { id: true, fullName: true, academicDegree: true },
      orderBy: { fullName: 'asc' },
    })

    return Response.json({ publications, allScholars })
  } catch (error) {
    console.error('API GET /api/dashboard/publications error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mode, doi, bibContent, manualData, pdfUrl, coAuthorIds, coverImageUrl } = body

    let targetPubs = []

    if (mode === 'doi' && doi) {
      const fetched = await fetchByDoi(doi)
      if (fetched) {
        targetPubs.push(fetched)
      } else {
        return Response.json({ error: 'Could not fetch publication from Crossref for given DOI' }, { status: 400 })
      }
    } else if (mode === 'bibtex' && bibContent) {
      targetPubs = parseBibtex(bibContent)
      if (targetPubs.length === 0) {
        return Response.json({ error: 'No valid publications parsed from BibTeX content' }, { status: 400 })
      }
    } else if (mode === 'manual' && manualData) {
      targetPubs.push({
        title: manualData.title,
        type: manualData.type || 'SCOPUS',
        journalOrPublisher: manualData.journalOrPublisher || 'Unknown',
        year: parseInt(manualData.year, 10) || new Date().getFullYear(),
        doi: manualData.doi ? manualData.doi.trim() : null,
        url: manualData.url || null,
        isbnOrPatentNo: manualData.isbnOrPatentNo || null,
        coverImageUrl: manualData.coverImageUrl || null,
        quartile: manualData.quartile || 'NONE',
        citationsCount: parseInt(manualData.citationsCount, 10) || 0,
      })
    } else {
      return Response.json({ error: 'Invalid submission payload or mode' }, { status: 400 })
    }

    const createdOrLinkedPubs = []

    for (const pubData of targetPubs) {
      // Deduplication & Co-author Engine: check normalized doi OR (LOWER(title) + year)
      let existingPub = null
      if (pubData.doi) {
        existingPub = await prisma.publication.findUnique({
          where: { doi: pubData.doi }
        })
      }

      if (!existingPub) {
        const normalizedTitle = pubData.title.trim().toLowerCase()
        const allPubs = await prisma.publication.findMany({
          where: { year: pubData.year }
        })
        existingPub = allPubs.find(p => p.title.trim().toLowerCase() === normalizedTitle)
      }

      let publicationId
      if (existingPub) {
        publicationId = existingPub.id
        // Link current scholar via PublicationAuthor if not already linked
        const existingAuthorLink = await prisma.publicationAuthor.findUnique({
          where: {
            publicationId_scholarId: {
              publicationId,
              scholarId: scholar.id,
            }
          }
        })

        if (!existingAuthorLink) {
          await prisma.publicationAuthor.create({
            data: {
              publicationId,
              scholarId: scholar.id,
              authorOrder: 2, // co-author link
            }
          })
        }
      } else {
        // Create new publication
        const extraAuthors = Array.isArray(coAuthorIds)
          ? coAuthorIds
              .filter((cid) => cid && cid !== scholar.id)
              .map((cid, idx) => ({ scholarId: cid, authorOrder: idx + 2 }))
          : []
        const newPub = await prisma.publication.create({
          data: {
            title: pubData.title,
            type: pubData.type,
            journalOrPublisher: pubData.journalOrPublisher,
            year: pubData.year,
            doi: pubData.doi || null,
            url: pdfUrl || pubData.url || null,
            isbnOrPatentNo: pubData.isbnOrPatentNo || null,
            coverImageUrl: coverImageUrl || pubData.coverImageUrl || null,
            quartile: pubData.quartile || 'NONE',
            citationsCount: pubData.citationsCount || 0,
            status: 'PENDING',
            submittedById: scholar.userId,
            authors: {
              create: [
                {
                  scholarId: scholar.id,
                  authorOrder: 1,
                },
                ...extraAuthors,
              ]
            }
          }
        })
        publicationId = newPub.id
      }

      createdOrLinkedPubs.push(publicationId)
    }

    return Response.json({ success: true, count: createdOrLinkedPubs.length })
  } catch (error) {
    console.error('API POST /api/dashboard/publications error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
