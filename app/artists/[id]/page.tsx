import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ensureSchema, pool } from '@/lib/db';
import ArtworkCard from '@/components/ArtworkCard';

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
      <h1 className="text-2xl font-semibold mb-6">{a[0].name}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {albums.map((al) => (
          <Link key={al.id} href={`/albums/${al.id}`} className="group">
            <ArtworkCard artwork={al.artwork} alt={al.name} size={200} />
            <p className="mt-2 font-medium truncate group-hover:underline">{al.name}</p>
            {al.year && <p className="text-sm text-zinc-500">{al.year}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}