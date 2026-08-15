import Link from 'next/link';
import { ensureSchema, pool } from '@/lib/db';
import ArtworkCard from '@/components/ArtworkCard';

export const dynamic = 'force-dynamic';

export default async function ArtistsPage() {
  await ensureSchema();
  const [rows] = await pool.query<any[]>(
    `SELECT a.id, a.name,
       (SELECT artwork FROM albums WHERE artist_id = a.id AND artwork IS NOT NULL LIMIT 1) AS artwork
     FROM artists a ORDER BY a.name`
  );
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Artists</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {rows.map((a) => (
          <Link key={a.id} href={`/artists/${a.id}`} className="group">
            <ArtworkCard artwork={a.artwork} alt={a.name} size={200} />
            <p className="mt-2 font-medium truncate group-hover:underline">{a.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}