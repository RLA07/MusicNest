import { NextRequest } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [rows] = await pool.query<any[]>(
    `SELECT pl.id, pl.name, COUNT(ps.song_id) AS song_count
     FROM playlists pl LEFT JOIN playlist_songs ps ON ps.playlist_id = pl.id
     GROUP BY pl.id, pl.name ORDER BY pl.id`
  );
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) return Response.json({ error: 'Nama kosong' }, { status: 400 });
  const [r] = await pool.query<ResultSetHeader>('INSERT INTO playlists (name) VALUES (?)', [name.trim()]);
  return Response.json({ id: Number(r.insertId), name: name.trim() });
}