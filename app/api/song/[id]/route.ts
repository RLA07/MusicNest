import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/song/[id] — metadata detail lagu untuk Slide 3 FullPlayer. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await params;
  const songId = Number(id);
  if (!songId) return NextResponse.json({ error: 'id tidak valid' }, { status: 400 });

  const [rows] = await pool.query<any[]>(
    `SELECT
       s.id, s.title, s.format, s.bitrate, s.sample_rate, s.size, s.duration_ms,
       al.name  AS album,
       al.year  AS year,
       ar.name  AS artist
     FROM songs s
     JOIN albums  al ON al.id = s.album_id
     JOIN artists ar ON ar.id = al.artist_id
     WHERE s.id = ?`,
    [songId],
  );

  if (!rows.length) return NextResponse.json({ error: 'Lagu tidak ditemukan' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
