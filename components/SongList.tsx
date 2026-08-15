'use client';
import { usePlayer } from './PlayerProvider';
import { fmtDuration } from '@/lib/format';
import FavButton from './FavButton';
import type { Song } from '@/lib/types';

export default function SongList({ songs, showAlbum = false, favs }: { songs: Song[]; showAlbum?: boolean; favs?: Set<number> }) {
  const p = usePlayer();
  const activeId = p.current?.id;
  return (
    <div>
      {songs.length > 1 && (
        <button
          onClick={() => p.setQueueAndPlay(songs, 0)}
          className="mb-4 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover hover:scale-105 transition-all cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline mr-1.5 -mt-0.5" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          Play All
        </button>
      )}
      <div className="space-y-0.5">
        {songs.map((s, i) => {
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => p.setQueueAndPlay(songs, i)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                isActive ? 'bg-accent/10' : 'hover:bg-surface-hover'
              }`}
              aria-pressed={isActive}
            >
              <span className={`text-sm w-6 text-right shrink-0 ${isActive ? 'text-accent' : 'text-muted'}`}>
                {isActive
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline"><path d="M8 5v14l11-7z"/></svg>
                  : (s.track_no ?? i + 1)}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`truncate ${isActive ? 'text-accent font-medium' : 'font-medium'}`}>{s.title}</p>
                {showAlbum && <p className="text-sm text-muted truncate">{s.artist} · {s.album}</p>}
              </div>
              <span className="text-sm text-muted shrink-0">{fmtDuration(s.duration_ms)}</span>
              <FavButton songId={s.id} initial={favs?.has(s.id) ?? false} />
            </button>
          );
        })}
      </div>
    </div>
  );
}