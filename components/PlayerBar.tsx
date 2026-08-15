'use client';
import { usePlayer } from './PlayerProvider';
import { fmtDuration } from '@/lib/format';

const ICON = {
  prev: <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />,
  next: <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />,
  play: <path d="M8 5v14l11-7z" />,
  pause: <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />,
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  volume: <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />,
};

function Icon({ name, size = 20 }: { name: keyof typeof ICON; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {ICON[name]}
    </svg>
  );
}

export default function PlayerBar({ onExpand }: { onExpand?: () => void }) {
  const p = usePlayer();
  if (!p.current) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 border-t border-border bg-surface/95 backdrop-blur z-40">
      <div className="flex items-center gap-4 px-4 py-3">
        {/* kiri: info (klik → FullPlayer) */}
        <button onClick={onExpand} className="flex items-center gap-3 min-w-0 w-1/4 text-left group">
          {p.current.artwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/artwork/${p.current.artwork}`} alt="" className="h-12 w-12 rounded-md object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-md bg-surface-hover" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium group-hover:underline">{p.current.title}</p>
            <p className="truncate text-xs text-muted">{p.current.artist}</p>
          </div>
        </button>

        {/* tengah: controls + seek */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-5">
            <button onClick={() => p.playPrev()} aria-label="Lagu sebelumnya" className="text-muted hover:text-foreground transition-colors p-1 cursor-pointer">
              <Icon name="prev" />
            </button>
            <button onClick={p.toggle} aria-label={p.isPlaying ? 'Jeda' : 'Putar'} className="rounded-full bg-accent text-on-accent p-2.5 hover:bg-accent-hover hover:scale-105 transition-all cursor-pointer">
              <Icon name={p.isPlaying ? 'pause' : 'play'} size={22} />
            </button>
            <button onClick={() => p.playNext()} aria-label="Lagu berikutnya" className="text-muted hover:text-foreground transition-colors p-1 cursor-pointer">
              <Icon name="next" />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-lg text-xs text-muted tabular-nums">
            <span>{fmtDuration(p.currentTime * 1000)}</span>
            <input
              type="range" min={0} max={p.duration || 0} step={0.1} value={p.currentTime}
              onChange={(e) => p.seek(Number(e.target.value))}
              className="flex-1"
              aria-label="Posisi lagu"
            />
            <span>{fmtDuration(p.duration * 1000)}</span>
          </div>
        </div>

        {/* kanan: volume + expand */}
        <div className="flex items-center gap-3 w-1/4 justify-end text-muted">
          <Icon name="volume" size={18} />
          <input type="range" min={0} max={1} step={0.01} value={p.volume}
            onChange={(e) => p.setVolume(Number(e.target.value))}
            className="w-24"
            aria-label="Volume" />
          <button onClick={onExpand} aria-label="Buka player penuh" className="text-muted hover:text-foreground transition-colors p-1 cursor-pointer">
            <Icon name="expand" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}