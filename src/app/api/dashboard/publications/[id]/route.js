import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

async function getActiveScholar() {
  const user = await getCurrentUser()
  if (!user || !user.scholarProfile) return null
  return user.scholarProfile
}

export async function PUT(request, { params }) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const pub = await prisma.publication.findUnique({
      where: { id },
      include: { authors: true }
    })
    if (!pub) return Response.json({ error: 'Publication not found' }, { status: 404 })
    const isOwner = pub.submittedById === scholar.userId || pub.authors.some(a => a.scholarId === scholar.id)
    if (!isOwner) return Response.json({ error: 'Forbidden' }, { status: 403 })

    // Integrity Lock: Allow edit/resubmit ONLY for PENDING or REJECTED. Block (403) for APPROVED.
    if (pub.status === 'APPROVED') {
      return Response.json({ error: 'Forbidden: Cannot edit approved publications.' }, { status: 403 })
    }

    const body = await request.json()
    const updated = await prisma.publication.update({
      where: { id },
      data: {
        title: body.title,
        type: body.type,
        journalOrPublisher: body.journalOrPublisher,
        year: parseInt(body.year, 10),
        doi: body.doi || null,
        url: body.url || null,
        isbnOrPatentNo: body.isbnOrPatentNo || null,
        quartile: body.quartile || 'NONE',
        citationsCount: parseInt(body.citationsCount, 10) || 0,
        status: 'PENDING', // Resubmit sets back to PENDING
        rejectionReason: null,
      }
    })

    return Response.json({ success: true, updated })
  } catch (error) {
    console.error('API PUT publication error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const pub = await prisma.publication.findUnique({
      where: { id },
      include: { authors: true }
    })
    if (!pub) return Response.json({ error: 'Publication not found' }, { status: 404 })
    const isOwner = pub.submittedById === scholar.userId || pub.authors.some(a => a.scholarId === scholar.id)
    if (!isOwner) return Response.json({ error: 'Forbidden' }, { status: 403 })

    // Integrity Lock: Block (403) deleting APPROVED items
    if (pub.status === 'APPROVED') {
      return Response.json({ error: 'Forbidden: Cannot delete approved publications.' }, { status: 403 })
    }

    await prisma.publication.delete({ where: { id } })

    return Response.json({ success: true })
  } catch (error) {
    console.error('API DELETE publication error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
