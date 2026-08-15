import MediaCard from '@/components/MediaCard';
import { ensureSchema, pool } from '@/lib/db';

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {rows.map((al) => (
          <MediaCard key={al.id} href={`/albums/${al.id}`} artwork={al.artwork} title={al.name} subtitle={al.artist} />
        ))}
      </div>
    </div>
  );
}