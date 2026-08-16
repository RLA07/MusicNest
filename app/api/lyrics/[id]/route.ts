import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';
import { pool } from '@/lib/db';
import { parseLrc, extractEmbeddedLyrics } from '@/lib/lyrics';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const songId = Number(id);
  if (!Number.isInteger(songId)) return new Response('bad id', { status: 400 });

  // 1. Cek tabel lyrics (.lrc eksternal)
  const [lrcRows] = await pool.query<any[]>(
    `SELECT l.filename FROM lyrics l WHERE l.song_id = ?`, [songId]
  );
  const lrc = lrcRows[0]?.filename;
  if (lrc && fs.existsSync(lrc)) {
    return Response.json(parseLrc(fs.readFileSync(lrc, 'utf8')));
  }

  // 2. Ambil filepath lagu dari DB
  const [songRows] = await pool.query<any[]>(
    `SELECT filepath FROM songs WHERE id = ?`, [songId]
  );
  const filepath = songRows[0]?.filepath;
  if (!filepath) return new Response('no lyrics', { status: 404 });

  // 3. Fallback: Cek file .lrc di folder yang sama (bila belum terdaftar di DB)
  const autoLrcPath = filepath.slice(0, -path.extname(filepath).length) + '.lrc';
  if (fs.existsSync(autoLrcPath)) {
    return Response.json(parseLrc(fs.readFileSync(autoLrcPath, 'utf8')));
  }

  // 4. Fallback: Ekstrak Embedded Lyrics dari file audio via music-metadata
  try {
    const meta = await parseFile(filepath);
    const embeddedLyrics = extractEmbeddedLyrics(meta);
    if (embeddedLyrics && embeddedLyrics.length > 0) {
      return Response.json(embeddedLyrics);
    }
  } catch (err) {
    console.error('Error reading embedded lyrics:', err);
  }

  return new Response('no lyrics', { status: 404 });
}