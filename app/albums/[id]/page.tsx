import { notFound } from 'next/navigation';
import { ensureSchema, pool } from '@/lib/db';
import { getFavIds } from '@/lib/favorites';
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
  const favs = await getFavIds();

  return (
    <div>
      <div className="flex gap-8 items-end mb-8">
        <ArtworkCard artwork={al.artwork} alt={al.name} size={220} />
        <div className="pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Album</p>
          <h1 className="text-4xl font-semibold mt-1">{al.name}</h1>
          <p className="text-muted mt-2">{al.artist} · {al.year ?? ''} · {songs.length} lagu · {fmtDuration(totalDur)}</p>
        </div>
      </div>
      <SongList songs={songs} favs={favs} />
    </div>
  );
}