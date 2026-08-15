import { NextRequest } from 'next/server';
import fs from 'fs';
import { pool } from '@/lib/db';
import { parseLrc } from '@/lib/lyrics';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const songId = Number(id);
  if (!Number.isInteger(songId)) return new Response('bad id', { status: 400 });
  const [rows] = await pool.query<any[]>(
    `SELECT l.filename FROM lyrics l WHERE l.song_id = ?`, [songId]
  );
  const lrc = rows[0]?.filename;
  if (!lrc || !fs.existsSync(lrc)) return new Response('no lyrics', { status: 404 });
  return Response.json(parseLrc(fs.readFileSync(lrc, 'utf8')));
}