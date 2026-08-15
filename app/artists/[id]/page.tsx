import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ensureSchema, pool } from '@/lib/db';
import ArtworkCard from '@/components/ArtworkCard';
import MediaCard from '@/components/MediaCard';

export const dynamic = 'force-dynamic';

export default async function ArtistDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artistId = Number(id);
  await ensureSchema();
  const [a] = await pool.query<any[]>('SELECT id, name FROM artists WHERE id = ?', [artistId]);
  if (!a[0]) notFound();
  const [albums] = await pool.query<any[]>(
    'SELECT id, name, year, artwork FROM albums WHERE artist_id = ? ORDER BY year IS NULL, year', [artistId]
  );
  return (
    <div>
      <div className="flex items-center gap-6 mb-8">
        <ArtworkCard artwork={albums.find(a => a.artwork)?.artwork ?? null} alt={a[0].name} size={200} />
        <div>
          <h1 className="text-3xl font-semibold">{a[0].name}</h1>
          <p className="text-muted mt-1">{albums.length} album</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {albums.map((al) => (
          <MediaCard key={al.id} href={`/albums/${al.id}`} artwork={al.artwork} title={al.name} subtitle={al.year?.toString()} />
        ))}
      </div>
    </div>
  );
}