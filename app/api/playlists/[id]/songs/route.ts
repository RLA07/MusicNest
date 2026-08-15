import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST: tambah lagu ke playlist
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const playlistId = Number((await params).id);
  const { song_id } = await req.json();
  const [r] = await pool.query<any[]>(
    'SELECT COALESCE(MAX(position), 0) + 1 AS pos FROM playlist_songs WHERE playlist_id = ?', [playlistId]
  );
  await pool.query(
    'INSERT IGNORE INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
    [playlistId, Number(song_id), r[0].pos]
  );
  return Response.json({ ok: true });
}

// DELETE: hapus lagu dari playlist
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const playlistId = Number((await params).id);
  const { song_id } = await req.json();
  await pool.query(
    'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
    [playlistId, Number(song_id)]
  );
  return Response.json({ ok: true });
}