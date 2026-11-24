import { NextResponse } from 'next/server';
import { findMatchingJournals, ACADEMIC_JOURNALS } from '@/lib/journalRegistry';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title = '', abstract = '', field = 'ALL', targetType = 'ALL', checkIssn = '' } = body;

    // Direct ISSN / Journal name lookup for Predatory Check
    if (checkIssn.trim()) {
      const cleanIssn = checkIssn.trim().toLowerCase();
      const matched = ACADEMIC_JOURNALS.find(
        (j) => j.issn?.toLowerCase() === cleanIssn || j.name.toLowerCase().includes(cleanIssn)
      );

      if (matched) {
        return NextResponse.json({
          success: true,
          mode: 'LOOKUP',
          journal: matched,
        });
      } else {
        return NextResponse.json({
          success: true,
          mode: 'LOOKUP',
          journal: {
            name: checkIssn,
            issn: checkIssn,
            isSafe: false,
            safetyStatus: 'UNVERIFIED',
            warningReason: 'Ushbu jurnal OAK yoki Scopus rasmiy oq ro‘yxatida (whitelist) tasdiqlanmagan. Qo‘lyozma topshirishdan oldin ilmiy bo‘lim bilan maslahatlashing.',
          },
        });
      }
    }

    const matches = findMatchingJournals({ title, abstract, field, targetType });

    return NextResponse.json({
      success: true,
      data: matches,
      total: matches.length,
    });
  } catch (error) {
    console.error('POST /api/research-tools/journal-matcher error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}
