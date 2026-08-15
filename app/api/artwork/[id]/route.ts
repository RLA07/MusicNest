import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';
import { DATA_DIR } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (path.basename(id) !== id) return new Response('bad id', { status: 400 }); // cegah traversal
  const file = path.join(DATA_DIR, 'artworks', id);
  if (!fs.existsSync(file)) return new Response('not found', { status: 404 });
  const buf = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return new Response(buf, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}