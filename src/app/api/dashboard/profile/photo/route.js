import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.scholarProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Rasm fayli tanlanmadi' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Rasm hajmi 5MB dan oshmasligi kerak' }, { status: 400 });
    }

    const ext = path.extname(file.name || '').toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json({ error: 'Faqat JPG, PNG yoki WEBP rasm yuklash mumkin' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${user.scholarProfile.id}-${Date.now()}${ext}`;
    const filepath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    const photoUrl = `/uploads/avatars/${filename}`;
    await prisma.scholarProfile.update({
      where: { id: user.scholarProfile.id },
      data: { photoUrl },
    });

    return NextResponse.json({ success: true, photoUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Rasm yuklashda xatolik' }, { status: 500 });
  }
}
