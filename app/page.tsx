import Link from 'next/link';
import { ensureSchema, pool } from '@/lib/db';
import ArtworkCard from '@/components/ArtworkCard';
import { fmtDuration } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await ensureSchema();
  const [albums] = await pool.query<any[]>(
    `SELECT al.id, al.name, al.artwork, a.name AS artist
     FROM albums al JOIN artists a ON al.artist_id = a.id
     ORDER BY RAND() LIMIT 13`
  );
  const [songs] = await pool.query<any[]>(
    `SELECT s.id, s.title, s.duration_ms, al.name AS album, ar.name AS artist, al.artwork
     FROM songs s
     JOIN albums al ON s.album_id = al.id
     JOIN artists ar ON al.artist_id = ar.id
     ORDER BY s.id DESC LIMIT 10`
  );

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-4">Album Acak</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {albums.map((al) => (
            <Link key={al.id} href={`/albums/${al.id}`} className="group">
              <ArtworkCard artwork={al.artwork} alt={al.name} size={200} />
              <p className="mt-2 font-medium truncate group-hover:underline">{al.name}</p>
              <p className="text-sm text-zinc-500 truncate">{al.artist}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Terbaru</h2>
        <div className="space-y-1">
          {songs.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              <ArtworkCard artwork={s.artwork} alt={s.title} size={40} />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{s.title}</p>
                <p className="text-sm text-zinc-500 truncate">{s.artist} · {s.album}</p>
              </div>
              <span className="text-sm text-zinc-500">{fmtDuration(s.duration_ms)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}