import { ensureSchema, pool } from '@/lib/db';
import CreatePlaylist from './CreatePlaylist';
import PlaylistCard from './PlaylistCard';

export const dynamic = 'force-dynamic';

export default async function PlaylistsPage() {
  await ensureSchema();
  const [rows] = await pool.query<any[]>(
    `SELECT pl.id, pl.name, COUNT(ps.song_id) AS song_count
     FROM playlists pl LEFT JOIN playlist_songs ps ON ps.playlist_id = pl.id
     GROUP BY pl.id, pl.name ORDER BY pl.id`
  );
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Playlists</h1>
        <CreatePlaylist />
      </div>
      {rows.length === 0
        ? <p className="text-muted text-sm">Belum ada playlist. Buat satu untuk mulai.</p>
        : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {rows.map((p) => <PlaylistCard key={p.id} {...p} />)}
          </div>
      }
    </div>
  );
}