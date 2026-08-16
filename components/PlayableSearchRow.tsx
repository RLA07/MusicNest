'use client';
import Image from 'next/image';
import { usePlayer } from './PlayerProvider';
import { fmtDuration } from '@/lib/format';

interface SearchSongItem {
  id: number;
  title: string;
  duration_ms: number | null;
  album: string;
  artist: string;
  artwork?: string | null;
}

/** Play single search result row with artwork. */
export default function PlayableSearchRow({ s }: { s: SearchSongItem }) {
  const p = usePlayer();
  const isPlayingCurrent = p.current?.id === s.id && p.isPlaying;

  return (
    <button
      onClick={() => p.playSong({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album,
        artwork: s.artwork ?? null,
        duration_ms: s.duration_ms,
      })}
      className="group w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors text-left cursor-pointer"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-hover flex items-center justify-center text-muted">
        {s.artwork ? (
          <Image
            src={`/api/artwork/${s.artwork}`}
            alt={s.title}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        )}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity ${isPlayingCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {isPlayingCurrent ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`truncate text-sm font-medium ${isPlayingCurrent ? 'text-accent' : 'text-foreground'}`}>
          {s.title}
        </p>
        <p className="text-xs text-muted truncate mt-0.5">
          {s.artist} · {s.album}
        </p>
      </div>

      <span className="text-xs text-muted font-mono">{fmtDuration(s.duration_ms)}</span>
    </button>
  );
}