import { ensureSchema, pool } from '@/lib/db';
import ArtworkCard from '@/components/ArtworkCard';
import MediaCard from '@/components/MediaCard';
import HeroPlay from '@/components/HeroPlay';
import PlayableRow from '@/components/PlayableRow';
import Reveal from '@/components/Reveal';

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
  const allSongs = ids.length
    ? (await pool.query<any[]>(
        `SELECT s.id, s.title, s.duration_ms, s.album_id, al.name AS album, ar.name AS artist, al.artwork
         FROM songs s
         JOIN albums al ON s.album_id = al.id
         JOIN artists ar ON al.artist_id = ar.id
         WHERE s.album_id IN (${ids.map(() => '?').join(',')})
         ORDER BY s.disc_no, s.track_no`, ids
      ))[0]
    : []; // library kosong → hindari `IN ()` yang bikin syntax error MySQL
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
          <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-10 hero-glow">
            {/* ambient accent blobs — off-center, asymmetric */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
              <div className="float-slow shrink-0">
                <ArtworkCard artwork={hero.artwork} alt={hero.name} className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 shrink-0 shadow-tinted-lg" radius="rounded-2xl" />
              </div>
              <div className="flex-1 pb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">Unggulan</p>
                <h1 className="text-3xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight font-bold">
                  Selamat datang di <span className="text-gradient">Music Nest</span>
                </h1>
                <p className="text-muted mt-4 max-w-lg leading-relaxed">Pustaka musik pribadi kamu — siap diputar.</p>
                <div className="mt-6 flex gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {recent.map((s) => (
            <PlayableRow key={s.id} song={s} />
          ))}
        </div>
      </section>
    </div>
  );
}