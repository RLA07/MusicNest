'use client';
import { useRouter } from 'next/navigation';
import SongList from '@/components/SongList';

/** SongList wired with remove-from-playlist. */
export default function PlaylistSongs({ songs, favs, playlistId }: {
  songs: any[]; favs?: Set<number>; playlistId: number;
}) {
  const router = useRouter();
  return (
    <SongList
      songs={songs}
      showAlbum
      favs={favs}
      removable
      onRemove={async (songId) => {
        await fetch(`/api/playlists/${playlistId}/songs`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ song_id: songId }),
        });
        router.refresh();
      }}
    />
  );
}
