'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddSongs({ playlistId, current }: { playlistId: number; current: number[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  async function search(term: string) {
    setQ(term);
    if (!term.trim()) { setResults([]); return; }
    const res = await fetch(`/api/search-songs?q=${encodeURIComponent(term)}`);
    if (res.ok) setResults(await res.json());
  }

  async function add(songId: number) {
    await fetch(`/api/playlists/${playlistId}/songs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ song_id: songId }),
    });
    router.refresh();
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="rounded-full bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-hover transition-colors cursor-pointer">
        + Tambah Lagu
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-96 rounded-xl border border-border bg-surface shadow-2xl shadow-black/50 p-4">
          <input
            value={q}
            onChange={(e) => search(e.target.value)}
            placeholder="Cari lagu..."
            autoFocus
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
            {results.filter((s) => !current.includes(s.id)).map((s) => (
              <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-hover">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate font-medium">{s.title}</p>
                  <p className="text-xs text-muted truncate">{s.artist} · {s.album}</p>
                </div>
                <button onClick={() => add(s.id)} className="text-accent text-sm font-semibold cursor-pointer">Tambah</button>
              </div>
            ))}
            {q && results.filter((s) => !current.includes(s.id)).length === 0 && <p className="text-sm text-muted">Tidak ada hasil</p>}
          </div>
        </div>
      )}
    </div>
  );
}