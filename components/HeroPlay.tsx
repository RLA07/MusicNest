'use client';
import { usePlayer } from './PlayerProvider';
import type { Song } from '@/lib/types';

export default function HeroPlay({ songs, albumName }: { songs: Song[]; albumName: string }) {
  const p = usePlayer();
  if (!songs.length) return null;
  return (
    <button
      onClick={() => p.setQueueAndPlay(songs, 0)}
      aria-label={`Putar album ${albumName}`}
      className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
      Putar Album
    </button>
  );
}