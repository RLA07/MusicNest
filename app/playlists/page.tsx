import { ensureSchema, pool } from '@/lib/db';
import Reveal from '@/components/Reveal';
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
        ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-2xl bg-surface-hover flex items-center justify-center text-muted mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Belum ada playlist</h2>
            <p className="text-muted text-sm mt-1 max-w-xs">Buat playlist pertamamu untuk mulai mengumpulkan lagu favorit dalam satu tempat.</p>
          </div>
        )
        : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {rows.map((p, i) => <Reveal key={p.id} delayMs={i * 40}><PlaylistCard {...p} /></Reveal>)}
          </div>
      }
    </div>
  );
}