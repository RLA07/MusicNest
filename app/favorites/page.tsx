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
        ? <p className="text-muted text-sm">Belum ada lagu favorit. Klik hati di samping lagu untuk menambah.</p>
        : <SongList songs={songs} showAlbum />
      }
    </div>
  );
}