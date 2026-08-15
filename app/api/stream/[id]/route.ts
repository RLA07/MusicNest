import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { mimeFor } from '@/lib/mime';
import { createReadStream, statSync } from 'fs';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

function toWeb(stream: NodeJS.ReadableStream): ReadableStream {
  return Readable.toWeb(stream as any) as unknown as ReadableStream;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const songId = Number(id);
  if (!Number.isInteger(songId)) return new Response('bad id', { status: 400 });

  const [rows] = await pool.query<any[]>(
    'SELECT filepath, format FROM songs WHERE id = ?', [songId]
  );
  const song = rows[0] as { filepath: string; format: string } | undefined;
  if (!song) return new Response('not found', { status: 404 });

  const size = statSync(song.filepath).size;
  const mime = mimeFor(song.format);
  const range = req.headers.get('range');

  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (m) {
      let start = m[1] ? Number(m[1]) : 0;
      let end = m[2] ? Number(m[2]) : size - 1;
      if (start > end || end >= size) end = size - 1;
      if (start >= size) return new Response(null, { status: 416, headers: {
        'Content-Range': `bytes */${size}` } });
      return new Response(toWeb(createReadStream(song.filepath, { start, end })), {
        status: 206,
        headers: {
          'Content-Type': mime,
          'Content-Length': String(end - start + 1),
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache',
        },
      });
    }
  }

  return new Response(toWeb(createReadStream(song.filepath)), {
    status: 200,
    headers: { 'Content-Type': mime, 'Content-Length': String(size),
               'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' },
  });
}