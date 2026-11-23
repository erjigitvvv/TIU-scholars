import { promises as fs } from 'fs';
import path from 'path';

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'Fayl tanlanmadi' }, { status: 400 });
    }

    const name = String(file.name || '').toLowerCase();
    const isDocx = name.endsWith('.docx') || name.endsWith('.doc');
    const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';

    if (!isDocx && !isPdf) {
      return Response.json({ error: 'Faqat .docx, .doc yoki .pdf formatidagi fayllar qabul qilinadi' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return Response.json({ error: 'Fayl hajmi 25 MB dan oshmasligi kerak' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeBase = String(file.name || 'grant_proposal.docx')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(-80);
    const filename = `${Date.now()}-${safeBase}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'grants');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return Response.json({
      success: true,
      url: `/uploads/grants/${filename}`,
      originalName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('Grant file upload error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
