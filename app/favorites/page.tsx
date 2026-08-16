import { ensureSchema, pool } from '@/lib/db';
import { fmtDuration } from '@/lib/format';
import SongList from '@/components/SongList';

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  await ensureSchema();
  const [songs] = await pool.query<any[]>(
    `SELECT s.id, s.title, s.duration_ms, al.name AS album, ar.name AS artist, al.artwork
     FROM favorites f
     JOIN songs s ON f.song_id = s.id
     JOIN albums al ON s.album_id = al.id
     JOIN artists ar ON al.artist_id = ar.id
     ORDER BY f.added_at DESC`
  );
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Favorites</h1>
      {songs.length === 0
        ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-2xl bg-surface-hover flex items-center justify-center text-muted mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21s-7.5-4.6-10-9.5C.6 8.4 2.5 5 5.8 5c2 0 3.6 1.1 4.4 2.8A8 8 0 0 1 14.6 5c3.3 0 5.2 3.4 3.8 6.5C19 16.4 12 21 12 21z"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Belum ada lagu favorit</h2>
            <p className="text-muted text-sm mt-1 max-w-xs">Klik ikon hati di samping lagu mana pun untuk menyimpannya di sini.</p>
          </div>
        )
        : <SongList songs={songs} favs={new Set(songs.map((s: any) => s.id))} showAlbum />
      }
    </div>
  );
}