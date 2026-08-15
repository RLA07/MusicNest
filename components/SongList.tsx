'use client';
import { usePlayer } from './PlayerProvider';
import { fmtDuration } from '@/lib/format';
import type { Song } from '@/lib/types';

export default function SongList({ songs, showAlbum = false }: { songs: Song[]; showAlbum?: boolean }) {
  const p = usePlayer();
  return (
    <div>
      {songs.length > 1 && (
        <button
          onClick={() => p.setQueueAndPlay(songs, 0)}
          className="mb-4 rounded-full bg-black dark:bg-white px-5 py-2 text-sm font-semibold text-white dark:text-black hover:scale-105 transition-transform"
        >
          ▶ Play All
        </button>
      )}
      <div className="space-y-1">
        {songs.map((s, i) => (
          <button
            key={s.id}
            onClick={() => p.setQueueAndPlay(songs, i)}
            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-black/5 dark:hover:bg-white/5 ${
              p.current?.id === s.id ? 'bg-black/5 dark:bg-white/5' : ''
            }`}
          >
            <span className="text-sm text-zinc-400 w-6 text-right">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{s.title}</p>
              {showAlbum && <p className="text-sm text-zinc-500 truncate">{s.artist} · {s.album}</p>}
            </div>
            <span className="text-sm text-zinc-500">{fmtDuration(s.duration_ms)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}