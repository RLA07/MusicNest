'use client';
import { useEffect, useState } from 'react';

interface Playlist {
  id: number;
  name: string;
  song_count: number;
}

interface Props {
  songId: number;
  onClose: () => void;
  onToast: (msg: string) => void;
}

/** Modal untuk memilih playlist tujuan saat menambah lagu. */
export default function PlaylistPickerModal({ songId, onClose, onToast }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
  const [adding, setAdding] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/playlists')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setPlaylists)
      .catch(() => setPlaylists([]));
  }, []);

  async function add(playlistId: number, name: string) {
    setAdding(playlistId);
    try {
      await fetch(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_id: songId }),
      });
      onToast(`Ditambahkan ke "${name}"`);
      onClose();
    } catch {
      onToast('Gagal menambahkan lagu');
      setAdding(null);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        className="w-full max-w-lg rounded-t-2xl bg-surface border-t border-border p-5 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base">Tambah ke Playlist</h3>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {playlists === null && (
          <p className="text-muted text-sm text-center py-6">Memuat playlist...</p>
        )}
        {playlists !== null && playlists.length === 0 && (
          <p className="text-muted text-sm text-center py-6">Belum ada playlist. Buat dulu di halaman Playlist.</p>
        )}
        {playlists && playlists.length > 0 && (
          <ul className="space-y-1 max-h-60 overflow-y-auto">
            {playlists.map((pl) => (
              <li key={pl.id}>
                <button
                  onClick={() => add(pl.id, pl.name)}
                  disabled={adding === pl.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors text-left cursor-pointer disabled:opacity-50"
                >
                  {/* Ikon playlist */}
                  <span className="shrink-0 h-9 w-9 rounded-md bg-surface-hover flex items-center justify-center text-muted">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h10v2H3v-2zm15 1v-4l-5 2 5 2z" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{pl.name}</p>
                    <p className="text-xs text-muted">{pl.song_count} lagu</p>
                  </div>
                  {adding === pl.id && (
                    <span className="ml-auto text-accent text-xs shrink-0">Menambahkan…</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
