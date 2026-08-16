import { ensureSchema } from '@/lib/db';
import { executeSearch } from '@/lib/search';
import SearchResultsView from '@/components/SearchResultsView';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const term = (q ?? '').trim();
  await ensureSchema();

  if (!term) {
    return (
      <div className="py-20 text-center text-muted">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mx-auto mb-4 opacity-40"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4-4" />
        </svg>
        <h1 className="text-xl font-semibold mb-1">Cari Musik</h1>
        <p className="text-sm">Cari artis, album, atau judul lagu di koleksi library Anda.</p>
      </div>
    );
  }

  const { artists, albums, songs, topResult } = await executeSearch(term, 30);

  return (
    <SearchResultsView
      term={term}
      artists={artists}
      albums={albums}
      songs={songs}
      topResult={topResult}
    />
  );
}