import { promises as fs } from 'fs';
import path from 'path';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'Rasm fayli tanlanmadi' }, { status: 400 });
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const lowerName = String(file.name || '').toLowerCase();
    const hasValidExt =
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.webp');

    if (!validMimes.includes(file.type) && !hasValidExt) {
      return Response.json(
        { error: 'Faqat rasm formatidagi (.jpg, .jpeg, .png, .webp) fayllar ruxsat etiladi' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return Response.json(
        { error: 'Rasm hajmi 10 MB dan oshmasligi kerak' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeBase = String(file.name || 'cover.jpg')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(-60);
    const filename = `cover_${Date.now()}_${safeBase}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'publications', 'images');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return Response.json({
      success: true,
      url: `/uploads/publications/images/${filename}`,
    });
  } catch (error) {
    console.error('Publication image upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
