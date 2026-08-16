import { notFound } from 'next/navigation';
import { ensureSchema, pool } from '@/lib/db';
import { getFavIds } from '@/lib/favorites';
import SongList from '@/components/SongList';
import AddSongs from './AddSongs';
import DeletePlaylist from './DeletePlaylist';
import PlaylistSongs from './PlaylistSongs';

export const dynamic = 'force-dynamic';

export default async function PlaylistDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  await ensureSchema();
  const [pl] = await pool.query<any[]>('SELECT id, name FROM playlists WHERE id = ?', [id]);
  if (!pl[0]) notFound();
  const [songs] = await pool.query<any[]>(
    `SELECT s.id, s.title, s.duration_ms, al.name AS album, ar.name AS artist, al.artwork
     FROM playlist_songs ps
     JOIN songs s ON s.id = ps.song_id
     JOIN albums al ON s.album_id = al.id
     JOIN artists ar ON al.artist_id = ar.id
     WHERE ps.playlist_id = ?
     ORDER BY ps.position`, [id]
  );
  const favs = await getFavIds();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{pl[0].name}</h1>
        <div className="flex gap-2">
          <AddSongs playlistId={id} current={songs.map((s: any) => s.id)} />
          <DeletePlaylist id={id} name={pl[0].name} />
        </div>
      </div>
      {songs.length === 0
        ? <p className="text-muted text-sm">Playlist kosong. Tambah lagu dari album.</p>
        : <PlaylistSongs songs={songs} favs={favs} playlistId={id} />
      }
    </div>
  );
}