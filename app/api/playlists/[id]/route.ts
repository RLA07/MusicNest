import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

// DELETE: hapus playlist
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  await pool.query('DELETE FROM playlists WHERE id = ?', [id]);
  return Response.json({ ok: true });
}