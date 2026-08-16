import { notFound } from 'next/navigation';
import Link from 'next/link';
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
    `SELECT al.id, al.name, al.year, al.artwork, al.artist_id, a.name AS artist
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
      <nav className="text-sm text-muted mb-4" aria-label="Breadcrumb">
        <Link href="/artists" className="hover:text-foreground transition-colors">Artis</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/artists/${al.artist_id}`} className="hover:text-foreground transition-colors">{al.artist}</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{al.name}</span>
      </nav>
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 mb-8 text-center sm:text-left">
        <ArtworkCard
          artwork={al.artwork}
          alt={al.name}
          className="w-36 h-36 sm:w-48 sm:h-48 md:w-52 md:h-52 shrink-0 shadow-2xl shadow-black/50"
          radius="rounded-2xl"
        />
        <div className="pb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Album</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-1 tracking-tight">{al.name}</h1>
          <p className="text-muted text-sm sm:text-base mt-2">{al.artist} {al.year ? `· ${al.year}` : ''} · {songs.length} lagu · {fmtDuration(totalDur)}</p>
        </div>
      </div>
      <SongList songs={songs} favs={favs} />
    </div>
  );
}