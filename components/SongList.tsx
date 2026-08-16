'use client';
import { useState } from 'react';
import { usePlayer } from './PlayerProvider';
import { fmtDuration } from '@/lib/format';
import FavButton from './FavButton';
import type { Song } from '@/lib/types';

export default function SongList({ songs, showAlbum = false, favs, removable, onRemove }: {
  songs: Song[]; showAlbum?: boolean; favs?: Set<number>;
  removable?: boolean; onRemove?: (songId: number) => void;
}) {
  const p = usePlayer();
  const activeId = p.current?.id;
  return (
    <div>
      {songs.length > 1 && (
        <button
          onClick={() => p.setQueueAndPlay(songs, 0)}
          className="mb-4 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover hover:scale-105 active:scale-90 transition-all cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline mr-1.5 -mt-0.5" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          Putar Semua
        </button>
      )}
      <div className="space-y-0.5">
        {songs.map((s, i) => {
          const isActive = activeId === s.id;
          return (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={() => p.setQueueAndPlay(songs, i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.setQueueAndPlay(songs, i); } }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer group ${
                isActive ? 'bg-accent/10' : 'hover:bg-surface-hover'
              }`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className={`text-sm w-6 text-right shrink-0 ${isActive ? 'text-accent' : 'text-muted'}`}>
                {isActive && p.isPlaying ? (
                  <span className="inline-flex items-end gap-[2px] h-4 align-middle" aria-hidden="true">
                    <span className="eq-bar w-[3px] h-4 bg-accent rounded" style={{ animationDelay: '0ms' }} />
                    <span className="eq-bar w-[3px] h-4 bg-accent rounded" style={{ animationDelay: '150ms' }} />
                    <span className="eq-bar w-[3px] h-4 bg-accent rounded" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  <span className="group-hover:hidden">{s.track_no ?? i + 1}</span>
                )}
                {!isActive && (
                  <span className="hidden group-hover:inline text-accent" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline"><path d="M8 5v14l11-7z"/></svg>
                  </span>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`truncate ${isActive ? 'text-accent font-medium' : 'font-medium'}`}>{s.title}</p>
                {showAlbum && <p className="text-sm text-muted truncate">{s.artist} · {s.album}</p>}
              </div>
              <span className="text-sm text-muted shrink-0">{fmtDuration(s.duration_ms)}</span>
              <FavButton songId={s.id} initial={favs?.has(s.id) ?? false} />
              {removable && onRemove && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(s.id); }}
                  aria-label={`Hapus ${s.title} dari playlist`}
                  className="shrink-0 p-1.5 text-muted hover:text-destructive transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}