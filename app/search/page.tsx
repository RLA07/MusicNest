import Link from 'next/link';
import { ensureSchema, pool } from '@/lib/db';
import ArtworkCard from '@/components/ArtworkCard';
import { fmtDuration } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const term = (q ?? '').trim();
  await ensureSchema();

  if (!term) {
    return (
      <div className="py-20 text-center text-zinc-500">
        <h1 className="text-2xl font-semibold mb-2">Search</h1>
        <p>Cari artist, album, atau lagu.</p>
      </div>
    );
  }

  const like = `%${term}%`;
  const [artists] = await pool.query<any[]>(
    `SELECT id, name FROM artists WHERE name LIKE ? ORDER BY name`, [like]
  );
  const [albums] = await pool.query<any[]>(
    `SELECT al.id, al.name, al.artwork, a.name AS artist
     FROM albums al JOIN artists a ON al.artist_id = a.id
     WHERE al.name LIKE ? ORDER BY al.name`, [like]
  );
  const [songs] = await pool.query<any[]>(
    `SELECT s.id, s.title, s.duration_ms, al.name AS album, ar.name AS artist
     FROM songs s JOIN albums al ON s.album_id = al.id JOIN artists ar ON al.artist_id = ar.id
     WHERE s.title LIKE ? OR ar.name LIKE ? ORDER BY s.title LIMIT 50`, [like, like]
  );
  const empty = !artists.length && !albums.length && !songs.length;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Hasil untuk "{term}"</h1>
      {empty && <p className="text-zinc-500">No results.</p>}

      {artists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Artists</h2>
          <div className="space-y-1">
            {artists.map((a) => (
              <Link key={a.id} href={`/artists/${a.id}`} className="block p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 font-medium">
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Albums</h2>
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
      )}

      {songs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Songs</h2>
          <div className="space-y-1">
            {songs.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{s.title}</p>
                  <p className="text-sm text-zinc-500 truncate">{s.artist} · {s.album}</p>
                </div>
                <span className="text-sm text-zinc-500">{fmtDuration(s.duration_ms)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}