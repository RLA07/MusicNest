import { ensureSchema, pool } from '@/lib/db';
import ArtworkCard from '@/components/ArtworkCard';
import MediaCard from '@/components/MediaCard';
import HeroPlay from '@/components/HeroPlay';
import Reveal from '@/components/Reveal';
import { fmtDuration } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await ensureSchema();
  const [[albums], [recent]] = await Promise.all([
    pool.query<any[]>(
      `SELECT al.id, al.name, al.artwork, a.name AS artist
       FROM albums al JOIN artists a ON al.artist_id = a.id
       ORDER BY RAND() LIMIT 13`
    ),
    pool.query<any[]>(
      `SELECT s.id, s.title, s.duration_ms, al.name AS album, ar.name AS artist, al.artwork
       FROM songs s
       JOIN albums al ON s.album_id = al.id
       JOIN artists ar ON al.artist_id = ar.id
       ORDER BY s.id DESC LIMIT 8`
    ),
  ]);
  const ids = albums.map((a) => a.id);
  const [allSongs] = await pool.query<any[]>(
    `SELECT s.id, s.title, s.duration_ms, s.album_id, al.name AS album, ar.name AS artist, al.artwork
     FROM songs s
     JOIN albums al ON s.album_id = al.id
     JOIN artists ar ON al.artist_id = ar.id
     WHERE s.album_id IN (${ids.map(() => '?').join(',')})
     ORDER BY s.disc_no, s.track_no`, ids
  );
  const byAlbum = new Map<number, any[]>();
  for (const s of allSongs) {
    if (!byAlbum.has(s.album_id)) byAlbum.set(s.album_id, []);
    byAlbum.get(s.album_id)!.push(s);
  }
  const hero = albums[0];

  return (
    <div className="space-y-12">
      {/* Hero */}
      {hero && (
        <Reveal>
          <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-accent/10 p-10 hero-glow">
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-accent/5 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="float-slow shrink-0">
                <ArtworkCard artwork={hero.artwork} alt={hero.name} size={180} radius="rounded-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Featured</p>
                <h1 className="font-[family-name:var(--font-righteous)] text-4xl md:text-5xl leading-tight">
                  Selamat datang di <span className="text-gradient">Music Nest</span>
                </h1>
                <p className="text-muted mt-3 max-w-lg">Pustaka musik pribadi kamu — siap diputar.</p>
                <div className="mt-5 flex gap-3">
                  <HeroPlay songs={byAlbum.get(hero.id) ?? []} albumName={hero.name} />
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* Random albums */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pilihan Album</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {albums.map((al, i) => (
            <Reveal key={al.id} delayMs={i * 40}>
              <MediaCard
                href={`/albums/${al.id}`}
                artwork={al.artwork}
                title={al.name}
                subtitle={al.artist}
                songs={byAlbum.get(al.id)}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Recent */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Terbaru</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {recent.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors card-hover">
              <ArtworkCard artwork={s.artwork} alt={s.title} size={48} radius="rounded-md" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{s.title}</p>
                <p className="text-sm text-muted truncate">{s.artist} · {s.album}</p>
              </div>
              <span className="text-sm text-muted shrink-0">{fmtDuration(s.duration_ms)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}