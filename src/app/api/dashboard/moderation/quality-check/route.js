import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchByDoi } from '@/lib/crossref';
import { notifyUser } from '@/lib/notifications';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicationId = searchParams.get('publicationId');

    if (publicationId) {
      const check = await prisma.moderatorQualityCheck.findUnique({
        where: { publicationId },
        include: { publication: true },
      });
      return NextResponse.json({ success: true, qualityCheck: check });
    }

    // List all quality checks
    const checks = await prisma.moderatorQualityCheck.findMany({
      include: {
        publication: {
          select: { id: true, title: true, type: true, doi: true, status: true, year: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, checks });
  } catch (error) {
    console.error('Fetch quality checks error:', error);
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    // Verify moderator/admin role
    if (!['MODERATOR', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Faqat moderatorlar uchun ruxsat etilgan' }, { status: 403 });
    }

    const body = await request.json();
    const {
      publicationId,
      plagiarismPercent,
      plagiarismReportUrl,
      isPlagiarismPassed,
      citationFormatStyle,
      isCitationValid,
      isDoiVerified,
      languageQuality,
      languageNotes,
      autoVerifyDoi,
    } = body;

    if (!publicationId) {
      return NextResponse.json({ error: 'publicationId talab qilinadi' }, { status: 400 });
    }

    const pub = await prisma.publication.findUnique({
      where: { id: publicationId },
      include: { submittedBy: true },
    });

    if (!pub) {
      return NextResponse.json({ error: 'Nashr topilmadi' }, { status: 404 });
    }

    // Auto verify DOI via Crossref if requested
    let finalDoiVerified = Boolean(isDoiVerified);
    let crossrefData = null;

    if (autoVerifyDoi && pub.doi) {
      try {
        const crossrefMeta = await fetchByDoi(pub.doi);
        if (crossrefMeta) {
          finalDoiVerified = true;
          crossrefData = JSON.stringify(crossrefMeta);
        } else {
          finalDoiVerified = false;
        }
      } catch (err) {
        console.warn('Crossref check failed:', err);
      }
    }

    const savedCheck = await prisma.moderatorQualityCheck.upsert({
      where: { publicationId },
      create: {
        publicationId,
        plagiarismPercent: plagiarismPercent ? parseFloat(plagiarismPercent) : null,
        plagiarismReportUrl: plagiarismReportUrl || null,
        isPlagiarismPassed: Boolean(isPlagiarismPassed),
        citationFormatStyle: citationFormatStyle || 'APA',
        isCitationValid: Boolean(isCitationValid),
        isDoiVerified: finalDoiVerified,
        crossrefRawData: crossrefData,
        languageQuality: languageQuality || 'ACCEPTABLE',
        languageNotes: languageNotes || null,
        moderatorId: user.id,
        checkedAt: new Date(),
      },
      update: {
        plagiarismPercent: plagiarismPercent ? parseFloat(plagiarismPercent) : undefined,
        plagiarismReportUrl: plagiarismReportUrl || undefined,
        isPlagiarismPassed: Boolean(isPlagiarismPassed),
        citationFormatStyle: citationFormatStyle || undefined,
        isCitationValid: Boolean(isCitationValid),
        isDoiVerified: finalDoiVerified,
        ...(crossrefData ? { crossrefRawData: crossrefData } : {}),
        languageQuality: languageQuality || undefined,
        languageNotes: languageNotes || undefined,
        moderatorId: user.id,
        checkedAt: new Date(),
      },
    });

    // Notify author of quality check completion
    if (pub.submittedById) {
      await notifyUser({
        userId: pub.submittedById,
        type: 'MODERATION',
        title: `Maqola 4-mezonli tekshiruvdan o‘tdi`,
        message: `"${pub.title}" maqolasi plagiat (${savedCheck.plagiarismPercent || 0}%), DOI, iqtibos formati va til mezonlari bo‘yicha tekshirildi.`,
        link: `/dashboard/publications`,
      });
    }

    return NextResponse.json({
      success: true,
      qualityCheck: savedCheck,
      message: '4-mezonli sifat tekshiruvi muvaffaqiyatli saqlandi.',
    });
  } catch (error) {
    console.error('Save quality check error:', error);
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}
