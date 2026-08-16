'use client';
import { useState } from 'react';
import { usePlayer } from './PlayerProvider';
import type { Song } from '@/lib/types';

export default function HeroPlay({ songs, albumName }: { songs: Song[]; albumName: string }) {
  const p = usePlayer();
  const [loadingShuffle, setLoadingShuffle] = useState(false);

  const handleShuffleAll = async () => {
    setLoadingShuffle(true);
    try {
      await p.shuffleAll();
    } finally {
      setLoadingShuffle(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {songs.length > 0 && (
        <button
          onClick={() => p.setQueueAndPlay(songs, 0)}
          aria-label={`Putar album ${albumName}`}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent hover:bg-accent-hover hover:scale-105 active:scale-90 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          Putar Album
        </button>
      )}

      <button
        onClick={handleShuffleAll}
        disabled={loadingShuffle}
        aria-label="Acak semua lagu"
        className="rounded-full bg-surface-hover border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-white/10 hover:border-accent/40 hover:scale-105 active:scale-90 transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16 3h5v5l-2.5-2.5-3.2 3.2-1.4-1.4 3.2-3.2L16 3zM3 5h3a8 8 0 0 1 6 2.7l2.4 2.9A8 8 0 0 0 9 19H3v-2h6a6 6 0 0 0 4.5-2l2.4-2.9a8 8 0 0 1 6-2.1h.1V8a6 6 0 0 0-4.5 2l-2.4 2.9A8 8 0 0 1 6-2.1h.1V8a6 6 0 0 0-4.5 2l-2.4 2.9A8 8 0 0 0 9 7H3V5z" />
        </svg>
        {loadingShuffle ? 'Memuat...' : 'Acak Semua Lagu'}
      </button>
    </div>
  );
}