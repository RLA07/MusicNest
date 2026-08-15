'use client';
import { useEffect, useRef, useState } from 'react';
import { usePlayer } from './PlayerProvider';
import { fmtDuration } from '@/lib/format';
import { parseLrc } from '@/lib/lyrics';
import type { LrcLine } from '@/lib/lyrics';

export default function FullPlayer({ onClose }: { onClose: () => void }) {
  const p = usePlayer();
  const [lyrics, setLyrics] = useState<LrcLine[] | null>(null);
  const lyricBox = useRef<HTMLDivElement>(null);
  const activeIdx = lyrics?.findLastIndex((l) => l.timeMs <= p.currentTime * 1000) ?? -1;

  useEffect(() => {
    setLyrics(null);
    if (!p.current) return;
    fetch(`/api/lyrics/${p.current.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((lines) => setLyrics(lines))
      .catch(() => setLyrics(null));
  }, [p.current]);

  useEffect(() => {
    if (activeIdx >= 0 && lyricBox.current) {
      const el = lyricBox.current.children[activeIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeIdx]);

  if (!p.current) return null;
  const c = p.current;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" role="dialog" aria-label="Player penuh">
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={onClose} className="rounded-full p-2 text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer" aria-label="Tutup player">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <p className="text-sm text-muted">{c.artist} · {c.album}</p>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 px-6 pb-4 overflow-y-auto">
        <div className="flex flex-col items-center gap-5 lg:w-1/2">
          {c.artwork ? (
            <div className="relative float-slow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/artwork/${c.artwork}`} alt={`Sampul ${c.album}`} className={`h-64 w-64 sm:h-80 sm:w-80 rounded-full object-cover shadow-2xl shadow-black/50 ${p.isPlaying ? 'vinyl-spin' : ''}`} />
              <div className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center" aria-hidden="true">
                <div className="h-2.5 w-2.5 rounded-full bg-accent" />
              </div>
            </div>
          ) : (
            <div className="h-64 w-64 sm:h-80 sm:w-80 rounded-xl bg-surface-hover flex items-center justify-center text-muted">
              <svg width="96" height="96" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
            </div>
          )}
          <div className="text-center">
            <h2 className="text-2xl font-semibold">{c.title}</h2>
            <p className="text-muted mt-1">{c.artist} — {c.album}</p>
          </div>
        </div>

        <div ref={lyricBox} className="lg:w-1/2 space-y-2 max-h-[45vh] overflow-y-auto lg:max-h-[60vh] px-2">
          {!lyrics && <p className="text-muted text-center py-10 text-sm">Tidak ada lirik</p>}
          {lyrics?.map((l, i) => (
            <p key={i} className={`transition-colors ${i === activeIdx ? 'text-accent font-medium' : 'text-muted'}`}>
              {l.text || ' '}
            </p>
          ))}
        </div>
      </div>

      {/* controls bawah */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => p.playPrev()} aria-label="Sebelumnya" className="text-muted hover:text-foreground p-1 cursor-pointer">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          <button onClick={p.toggle} aria-label={p.isPlaying ? 'Jeda' : 'Putar'} className="rounded-full bg-accent text-on-accent p-4 hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all cursor-pointer">
            {p.isPlaying
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
          </button>
          <button onClick={() => p.playNext()} aria-label="Berikutnya" className="text-muted hover:text-foreground p-1 cursor-pointer">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>
          </button>
          <button onClick={p.toggleShuffle} aria-label="Acak" aria-pressed={p.shuffle} className={`p-1 transition-colors cursor-pointer ${p.shuffle ? 'text-accent' : 'text-muted hover:text-foreground'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3h5v5l-2.5-2.5-3.2 3.2-1.4-1.4 3.2-3.2L16 3zM3 5h3a8 8 0 0 1 6 2.7l2.4 2.9A8 8 0 0 0 9 19H3v-2h6a6 6 0 0 0 4.5-2l2.4-2.9a8 8 0 0 1 6-2.1h.1V8a6 6 0 0 0-4.5 2l-2.4 2.9A8 8 0 0 0 9 7H3V5z"/></svg>
          </button>
          <button onClick={p.cycleRepeat} aria-label="Ulangi" aria-pressed={p.repeat !== 'off'} className={`p-1 transition-colors cursor-pointer ${p.repeat !== 'off' ? 'text-accent' : 'text-muted hover:text-foreground'}`}>
            {p.repeat === 'one'
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-6-2V9h-2l-1 .8v1.8l.9-.6h.1v4.9h2z"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>}
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted tabular-nums mt-3">
          <span>{fmtDuration(p.currentTime * 1000)}</span>
          <input type="range" min={0} max={p.duration || 0} step={0.1} value={p.currentTime}
            onChange={(e) => p.seek(Number(e.target.value))}
            className="flex-1 progress"
            style={{ ['--progress' as string]: `${p.duration ? (p.currentTime / p.duration) * 100 : 0}%` }}
            aria-label="Posisi lagu" />
          <span>{fmtDuration(p.duration * 1000)}</span>
          <button onClick={p.toggleMute} aria-label={p.muted ? 'Nyalakan suara' : 'Bisukan'} className="text-muted hover:text-foreground p-1 ml-2 cursor-pointer">
            {p.muted
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM18.36 7.2l-1.41 1.41A3 3 0 0 1 17.5 12a3 3 0 0 1-.55 3.39l1.41 1.41A5 5 0 0 0 19.5 12a5 5 0 0 0-1.14-4.8z"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>}
          </button>
          <input type="range" min={0} max={1} step={0.01} value={p.volume}
            onChange={(e) => p.setVolume(Number(e.target.value))}
            className="w-24" aria-label="Volume" />
        </div>
      </div>
    </div>
  );
}