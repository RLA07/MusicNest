import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: detail playlist + songs
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [pl] = await pool.query<any[]>('SELECT id, name FROM playlists WHERE id = ?', [id]);
  if (!pl[0]) return new Response('not found', { status: 404 });
  const [songs] = await pool.query<any[]>(
    `SELECT s.id, s.title, s.duration_ms, al.name AS album, ar.name AS artist, al.artwork
     FROM playlist_songs ps
     JOIN songs s ON s.id = ps.song_id
     JOIN albums al ON s.album_id = al.id
     JOIN artists ar ON al.artist_id = ar.id
     WHERE ps.playlist_id = ?
     ORDER BY ps.position`, [id]
  );
  return Response.json({ ...pl[0], songs });
}

// DELETE: hapus playlist
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  await pool.query('DELETE FROM playlists WHERE id = ?', [id]);
  return Response.json({ ok: true });
}