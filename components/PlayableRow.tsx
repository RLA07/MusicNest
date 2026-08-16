'use client';
import { usePlayer } from './PlayerProvider';
import { fmtDuration } from '@/lib/format';
import ArtworkCard from './ArtworkCard';
import type { Song } from '@/lib/types';

/** RSC-safe: row renderable from server data, wired to the client player. */
export default function PlayableRow({ song }: { song: Song }) {
  const p = usePlayer();
  return (
    <button
      onClick={() => p.playSong(song)}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors card-hover text-left cursor-pointer"
    >
      <ArtworkCard artwork={song.artwork} alt={song.title} size={48} radius="rounded-md" />
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{song.title}</p>
        <p className="text-sm text-muted truncate">{song.artist} · {song.album}</p>
      </div>
      <span className="text-sm text-muted shrink-0">{fmtDuration(song.duration_ms)}</span>
    </button>
  );
}
