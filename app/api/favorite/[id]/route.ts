import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: cek status favorit
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const songId = Number((await params).id);
  const [rows] = await pool.query<any[]>('SELECT 1 FROM favorites WHERE song_id = ?', [songId]);
  return Response.json({ favorite: rows.length > 0 });
}

// POST: toggle favorite
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const songId = Number((await params).id);
  const [rows] = await pool.query<any[]>('SELECT 1 FROM favorites WHERE song_id = ?', [songId]);
  if (rows.length > 0) {
    await pool.query('DELETE FROM favorites WHERE song_id = ?', [songId]);
    return Response.json({ favorite: false });
  }
  await pool.query('INSERT IGNORE INTO favorites (song_id) VALUES (?)', [songId]);
  return Response.json({ favorite: true });
}