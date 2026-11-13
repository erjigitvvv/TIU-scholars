import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getActiveScholar() {
  return await prisma.scholarProfile.findFirst()
}

export async function PUT(request, { params }) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const pub = await prisma.publication.findUnique({ where: { id } })
    if (!pub) return Response.json({ error: 'Publication not found' }, { status: 404 })

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

    const { id } = params
    const pub = await prisma.publication.findUnique({ where: { id } })
    if (!pub) return Response.json({ error: 'Publication not found' }, { status: 404 })

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
