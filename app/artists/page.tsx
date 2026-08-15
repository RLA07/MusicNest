import MediaCard from '@/components/MediaCard';
import { ensureSchema, pool } from '@/lib/db';

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {rows.map((a) => (
          <MediaCard key={a.id} href={`/artists/${a.id}`} artwork={a.artwork} title={a.name} />
        ))}
      </div>
    </div>
  );
}