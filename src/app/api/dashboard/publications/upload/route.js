import { promises as fs } from 'fs';
import path from 'path';

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'PDF fayl tanlanmadi' }, { status: 400 });
    }

    const isPdfMime = file.type === 'application/pdf';
    const isPdfName = String(file.name || '').toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfName) {
      return Response.json({ error: 'Faqat .pdf formatidagi fayl yuklash mumkin' }, { status: 400 });
    }

    if (file.size > MAX_PDF_BYTES) {
      return Response.json({ error: 'PDF hajmi 20 MB dan oshmasligi kerak' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeBase = String(file.name || 'publication.pdf')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(-80);
    const filename = `${Date.now()}-${safeBase}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'publications');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return Response.json({ url: `/uploads/publications/${filename}` });
  } catch (error) {
    console.error('PDF upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
