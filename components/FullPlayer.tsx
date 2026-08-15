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

  // load LRC saat lagu berubah
  useEffect(() => {
    setLyrics(null);
    if (!p.current) return;
    fetch(`/api/lyrics/${p.current.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((lines) => setLyrics(lines))
      .catch(() => setLyrics(null));
  }, [p.current]);

  // auto-scroll ke baris aktif
  useEffect(() => {
    if (activeIdx >= 0 && lyricBox.current) {
      const el = lyricBox.current.children[activeIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeIdx]);

  if (!p.current) return null;
  const c = p.current;

  return (
    <div className="fixed inset-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={onClose} className="rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <p className="text-sm text-zinc-500">{c.artist} · {c.album}</p>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-center justify-center gap-10 px-6 pb-4 overflow-y-auto">
        <div className="flex flex-col items-center gap-4 lg:w-1/2">
          {c.artwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/artwork/${c.artwork}`} alt="" className="h-64 w-64 sm:h-80 sm:w-80 rounded-xl object-cover shadow-lg" />
          ) : (
            <div className="h-64 w-64 sm:h-80 sm:w-80 rounded-xl bg-zinc-300 dark:bg-zinc-800" />
          )}
          <div className="text-center">
            <h2 className="text-2xl font-bold">{c.title}</h2>
            <p className="text-zinc-500">{c.artist} — {c.album}</p>
          </div>
        </div>

        <div ref={lyricBox} className="lg:w-1/2 space-y-2 max-h-[50vh] overflow-y-auto lg:max-h-[60vh] px-2">
          {!lyrics && <p className="text-zinc-400 text-center py-10">Tidak ada lirik</p>}
          {lyrics?.map((l, i) => (
            <p key={i} className={`transition-colors ${i === activeIdx ? 'text-black dark:text-white font-semibold' : 'text-zinc-400'}`}>
              {l.text || ' '}
            </p>
          ))}
        </div>
      </div>

      {/* controls bawah */}
      <div className="border-t border-black/10 dark:border-white/10 px-6 py-4 flex items-center gap-4">
        <button onClick={() => p.playPrev()} aria-label="Prev" className="hover:scale-105">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button onClick={p.toggle} aria-label="Play/Pause" className="rounded-full bg-black dark:bg-white text-white dark:text-black p-4 hover:scale-105">
          {p.isPlaying
            ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
        </button>
        <button onClick={() => p.playNext()} aria-label="Next" className="hover:scale-105">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>
        </button>
        <div className="flex-1 flex items-center gap-2 text-xs text-zinc-500">
          <span>{fmtDuration(p.currentTime * 1000)}</span>
          <input type="range" min={0} max={p.duration || 0} step={0.1} value={p.currentTime}
            onChange={(e) => p.seek(Number(e.target.value))}
            className="flex-1 accent-black dark:accent-white" />
          <span>{fmtDuration(p.duration * 1000)}</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-500">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        <input type="range" min={0} max={1} step={0.01} value={p.volume}
          onChange={(e) => p.setVolume(Number(e.target.value))}
          className="w-24 accent-black dark:accent-white" />
      </div>
    </div>
  );
}