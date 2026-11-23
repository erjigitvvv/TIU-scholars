import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { resolveDoi } from '@/lib/doiResolver';

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { doi } = await req.json();
    if (!doi) {
      return NextResponse.json({ success: false, error: 'DOI kiritilishi shart' }, { status: 400 });
    }

    const result = await resolveDoi(doi);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('DOI resolve error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'DOI maʼlumotlarini olishda xatolik yuz berdi' },
      { status: 400 }
    );
  }
}
