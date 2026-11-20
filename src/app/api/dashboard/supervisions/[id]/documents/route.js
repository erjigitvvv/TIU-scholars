import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const resolvedParams = await params;
    const supervisionId = resolvedParams.id;

    const versions = await prisma.documentVersion.findMany({
      where: { supervisionId },
      orderBy: [{ documentType: 'asc' }, { versionNumber: 'desc' }],
    });

    return NextResponse.json({ success: true, versions });
  } catch (error) {
    console.error('Fetch document versions error:', error);
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const resolvedParams = await params;
    const supervisionId = resolvedParams.id;

    const supervision = await prisma.supervision.findUnique({
      where: { id: supervisionId },
      include: {
        scholar: {
          select: { id: true, userId: true, fullName: true },
        },
      },
    });

    if (!supervision) {
      return NextResponse.json({ error: 'Supervision topilmadi' }, { status: 404 });
    }

    const body = await request.json();
    const { documentType, fileUrl, fileName, fileSize, uploaderNotes } = body;

    if (!documentType || !fileUrl || !fileName) {
      return NextResponse.json(
        { error: 'Hujjat turi, fayl nomi va fayl havolasi kiritilishi shart.' },
        { status: 400 }
      );
    }

    // Determine highest current version number
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { supervisionId, documentType },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });

    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Create DocumentVersion
    const newVersion = await prisma.documentVersion.create({
      data: {
        supervisionId,
        documentType,
        versionNumber: nextVersionNumber,
        fileUrl,
        fileName,
        fileSize: fileSize || null,
        uploaderNotes: uploaderNotes || null,
        uploadedById: user.id,
      },
    });

    // Sync with SupervisionChecklist if dissertation or autoreferat
    if (documentType === 'DISSERTATION') {
      await prisma.supervisionChecklist.upsert({
        where: { supervisionId },
        create: {
          supervisionId,
          dissertationFileUrl: fileUrl,
          isDissertationReady: true,
        },
        update: {
          dissertationFileUrl: fileUrl,
          isDissertationReady: true,
        },
      });
    } else if (documentType === 'AUTOREFERAT') {
      await prisma.supervisionChecklist.upsert({
        where: { supervisionId },
        create: {
          supervisionId,
          autoreferatFileUrl: fileUrl,
          isAutoreferatReady: true,
        },
        update: {
          autoreferatFileUrl: fileUrl,
          isAutoreferatReady: true,
        },
      });
    }

    // Send instant notification to supervisor
    if (supervision.scholar?.userId) {
      const typeLabel =
        documentType === 'DISSERTATION'
          ? 'Dissertatsiya matni'
          : documentType === 'AUTOREFERAT'
          ? 'Avtoreferat'
          : documentType === 'REPORT'
          ? 'Attestatsiya hisoboti'
          : documentType;

      await notifyUser({
        userId: supervision.scholar.userId,
        type: 'SUPERVISION',
        title: `Yangi hujjat yuklandi: ${typeLabel} (v${nextVersionNumber})`,
        message: `Izlanuvchi ${supervision.studentName} "${typeLabel}" hujjatining v${nextVersionNumber} versiyasini yukladi. Ko‘rib chiqishingiz kutilmoqda.`,
        link: `/dashboard/supervisions/${supervisionId}?tab=checklist`,
      });
    }

    return NextResponse.json({
      success: true,
      version: newVersion,
      message: `v${nextVersionNumber} versiyasi muvaffaqiyatli saqlandi va rahbarga bildirishnoma yuborildi.`,
    });
  } catch (error) {
    console.error('Document version upload error:', error);
    return NextResponse.json({ error: error.message || 'Hujjat yuklashda xatolik' }, { status: 500 });
  }
}
