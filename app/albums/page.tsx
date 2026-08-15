import Link from 'next/link';
import { ensureSchema, pool } from '@/lib/db';
import ArtworkCard from '@/components/ArtworkCard';

export const dynamic = 'force-dynamic';

export default async function AlbumsPage() {
  await ensureSchema();
  const [rows] = await pool.query<any[]>(
    `SELECT al.id, al.name, al.year, al.artwork, a.name AS artist
     FROM albums al JOIN artists a ON al.artist_id = a.id
     ORDER BY al.name`
  );
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Albums</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {rows.map((al) => (
          <Link key={al.id} href={`/albums/${al.id}`} className="group">
            <ArtworkCard artwork={al.artwork} alt={al.name} size={200} />
            <p className="mt-2 font-medium truncate group-hover:underline">{al.name}</p>
            <p className="text-sm text-zinc-500 truncate">{al.artist}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}