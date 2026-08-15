import { notFound } from 'next/navigation';
import { ensureSchema, pool } from '@/lib/db';
import ArtworkCard from '@/components/ArtworkCard';
import SongList from '@/components/SongList';
import { fmtDuration } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AlbumDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const albumId = Number(id);
  await ensureSchema();
  const [info] = await pool.query<any[]>(
    `SELECT al.id, al.name, al.year, al.artwork, a.name AS artist
     FROM albums al JOIN artists a ON al.artist_id = a.id WHERE al.id = ?`, [albumId]
  );
  if (!info[0]) notFound();
  const al = info[0];
  const [songs] = await pool.query<any[]>(
    `SELECT s.id, s.title, s.duration_ms, al.name AS album, a.name AS artist, al.artwork
     FROM songs s
     JOIN albums al ON s.album_id = al.id
     JOIN artists a ON al.artist_id = a.id
     WHERE s.album_id = ? ORDER BY s.disc_no, s.track_no, s.id`, [albumId]
  );
  const totalDur = songs.reduce((s: number, x: any) => s + (x.duration_ms ?? 0), 0);

  return (
    <div>
      <div className="flex gap-6 mb-8">
        <ArtworkCard artwork={al.artwork} alt={al.name} size={220} />
        <div className="flex flex-col justify-end">
          <h1 className="text-3xl font-bold">{al.name}</h1>
          <p className="text-lg text-zinc-500">{al.artist}</p>
          <p className="text-sm text-zinc-400">{al.year ?? ''} · {songs.length} lagu · {fmtDuration(totalDur)}</p>
        </div>
      </div>
      <SongList songs={songs} />
    </div>
  );
}