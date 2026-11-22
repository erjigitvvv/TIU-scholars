import { NextResponse } from 'next/server';
import { verifyTelegramAuthCode } from '@/lib/telegram';

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, chatId, username, firstName } = body;

    if (!code || !chatId) {
      return NextResponse.json(
        { error: 'Kod (code) va Chat ID (chatId) talab qilinadi' },
        { status: 400 }
      );
    }

    const result = await verifyTelegramAuthCode({
      code,
      chatId,
      username,
      firstName,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('verify API error:', error);
    return NextResponse.json({ error: error.message || 'Tasdiqlashda xatolik' }, { status: 500 });
  }
}
