import { notFound } from 'next/navigation';
import { ensureSchema, pool } from '@/lib/db';
import { getOrFetchArtistMetadata } from '@/lib/artistMetadata';
import ArtistPageClient from '@/components/ArtistPageClient';

export const dynamic = 'force-dynamic';

export default async function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artistId = Number(id);

  if (isNaN(artistId)) notFound();

  await ensureSchema();

  // 1. Fetch artist details
  const [artists] = await pool.query<any[]>(
    'SELECT id, name, avatar, bio FROM artists WHERE id = ?',
    [artistId]
  );
  if (!artists[0]) notFound();

  // 2. Fetch/cache Deezer avatar & Wikipedia biography asynchronously
  const meta = await getOrFetchArtistMetadata(artistId, artists[0].name);
  const artistData = {
    ...artists[0],
    avatar: meta.avatar || artists[0].avatar,
    bio: meta.bio || artists[0].bio,
  };

  // 3. Fetch albums with track count
  const [albums] = await pool.query<any[]>(
    `SELECT al.id, al.name, al.year, al.artwork,
       (SELECT COUNT(*) FROM songs s WHERE s.album_id = al.id) AS track_count
     FROM albums al
     WHERE al.artist_id = ?
     ORDER BY al.year DESC, al.name ASC`,
    [artistId]
  );

  // 4. Fetch songs by artist
  const [songs] = await pool.query<any[]>(
    `SELECT s.id, s.title, s.duration_ms, s.track_no, s.album_id, al.name AS album_name, al.artwork, ar.name AS artist
     FROM songs s
     JOIN albums al ON s.album_id = al.id
     JOIN artists ar ON al.artist_id = ar.id
     WHERE ar.id = ?
     ORDER BY s.title ASC`,
    [artistId]
  );

  return (
    <ArtistPageClient
      artist={artistData}
      albums={albums}
      songs={songs}
    />
  );
}