'use client';
import { useState } from 'react';

/** Toggle favorite (hati) untuk satu lagu. */
export default function FavButton({ songId, initial = false, size = 18 }: { songId: number; initial?: boolean; size?: number }) {
  const [fav, setFav] = useState(initial);
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        const res = await fetch(`/api/favorite/${songId}`, { method: 'POST' });
        const data = await res.json();
        setFav(data.favorite);
      }}
      aria-label={fav ? 'Hapus dari favorit' : 'Tambah ke favorit'}
      aria-pressed={fav}
      className={`shrink-0 p-1.5 cursor-pointer transition-transform hover:scale-110 ${fav ? 'text-accent' : 'text-muted hover:text-foreground'}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21s-7.5-4.6-10-9.5C.6 8.4 2.5 5 5.8 5c2 0 3.6 1.1 4.4 2.8A8 8 0 0 1 14.6 5c3.3 0 5.2 3.4 3.8 6.5C19 16.4 12 21 12 21z"/>
      </svg>
    </button>
  );
}