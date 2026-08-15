'use client';
import { usePlayer } from './PlayerProvider';
import { fmtDuration } from '@/lib/format';

export default function PlayerBar({ onExpand }: { onExpand?: () => void }) {
  const p = usePlayer();
  if (!p.current) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 border-t border-black/10 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3">
        {/* kiri: info (klik → FullPlayer) */}
        <button onClick={onExpand} className="flex items-center gap-3 min-w-0 w-1/4 text-left group">
          {p.current.artwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/artwork/${p.current.artwork}`} alt="" className="h-12 w-12 rounded object-cover" />
          ) : (
            <div className="h-12 w-12 rounded bg-zinc-300 dark:bg-zinc-700" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium group-hover:underline">{p.current.title}</p>
            <p className="truncate text-xs text-zinc-500">{p.current.artist}</p>
          </div>
        </button>

        {/* tengah: controls + seek */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button onClick={() => p.playPrev()} aria-label="Prev" className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button onClick={p.toggle} aria-label="Play/Pause" className="rounded-full bg-black dark:bg-white text-white dark:text-black p-2 hover:scale-105 transition-transform">
              {p.isPlaying
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
            </button>
            <button onClick={() => p.playNext()} aria-label="Next" className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-lg text-xs text-zinc-500">
            <span>{fmtDuration(p.currentTime * 1000)}</span>
            <input
              type="range" min={0} max={p.duration || 0} step={0.1} value={p.currentTime}
              onChange={(e) => p.seek(Number(e.target.value))}
              className="flex-1 accent-black dark:accent-white"
            />
            <span>{fmtDuration(p.duration * 1000)}</span>
          </div>
        </div>

        {/* kanan: volume + expand */}
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-500">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input type="range" min={0} max={1} step={0.01} value={p.volume}
            onChange={(e) => p.setVolume(Number(e.target.value))}
            className="w-24 accent-black dark:accent-white" />
          <button onClick={onExpand} aria-label="Full player" className="text-zinc-500 hover:text-black dark:hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}