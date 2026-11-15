import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'publication-feedback.json');

async function readStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

async function writeStore(store) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const store = await readStore();
    const entry = store[id] || { views: 0, comments: [] };
    return Response.json({
      views: entry.views || 0,
      comments: Array.isArray(entry.comments) ? entry.comments : [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const store = await readStore();
    const entry = store[id] || { views: 0, comments: [] };

    if (body?.action === 'view') {
      entry.views = (entry.views || 0) + 1;
      store[id] = entry;
      await writeStore(store);
      return Response.json({ views: entry.views, comments: entry.comments || [] });
    }

    if (body?.action === 'comment') {
      const authorName = String(body.authorName || '').trim().slice(0, 80);
      const text = String(body.text || '').trim().slice(0, 1000);

      if (!authorName || !text) {
        return Response.json(
          { error: 'Ism va izoh matnini kiriting' },
          { status: 400 }
        );
      }

      const newComment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        authorName,
        text,
        createdAt: new Date().toISOString(),
      };

      entry.comments = [newComment, ...(Array.isArray(entry.comments) ? entry.comments : [])];
      store[id] = entry;
      await writeStore(store);

      return Response.json({
        views: entry.views || 0,
        comments: entry.comments,
        comment: newComment,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
