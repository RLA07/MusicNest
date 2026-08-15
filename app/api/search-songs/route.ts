import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) return Response.json([]);
  const like = `%${q}%`;
  const [rows] = await pool.query<any[]>(
    `SELECT s.id, s.title, al.name AS album, ar.name AS artist
     FROM songs s JOIN albums al ON s.album_id = al.id JOIN artists ar ON al.artist_id = ar.id
     WHERE s.title LIKE ? OR ar.name LIKE ? OR al.name LIKE ?
     ORDER BY s.title LIMIT 20`, [like, like, like]
  );
  return Response.json(rows);
}