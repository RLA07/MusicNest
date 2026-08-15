import Link from 'next/link';
import { ensureSchema, pool } from '@/lib/db';
import MediaCard from '@/components/MediaCard';
import { fmtDuration } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const term = (q ?? '').trim();
  await ensureSchema();

  if (!term) {
    return (
      <div className="py-20 text-center text-muted">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 opacity-40" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" />
        </svg>
        <h1 className="text-xl font-semibold mb-1">Search</h1>
        <p className="text-sm">Cari artist, album, atau lagu di library-mu.</p>
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Hasil untuk "{term}"</h1>
        <p className="text-sm text-muted mt-1">{artists.length + albums.length + songs.length} hasil</p>
      </div>
      {empty && <p className="text-muted">Tidak ada hasil.</p>}

      {artists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Artists</h2>
          <div className="space-y-1">
            {artists.map((a) => (
              <Link key={a.id} href={`/artists/${a.id}`} className="block p-2.5 rounded-lg hover:bg-surface-hover transition-colors font-medium">
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {albums.map((al) => (
              <MediaCard key={al.id} href={`/albums/${al.id}`} artwork={al.artwork} title={al.name} subtitle={al.artist} />
            ))}
          </div>
        </section>
      )}

      {songs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Songs</h2>
          <div className="space-y-1">
            {songs.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-hover transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{s.title}</p>
                  <p className="text-sm text-muted truncate">{s.artist} · {s.album}</p>
                </div>
                <span className="text-sm text-muted">{fmtDuration(s.duration_ms)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}