'use client';
import Link from 'next/link';
import ArtworkCard from './ArtworkCard';
import { usePlayer } from './PlayerProvider';
import type { Song } from '@/lib/types';

interface Props {
  href: string;
  artwork: string | null;
  title: string;
  subtitle?: string | null;
  songs?: Song[];
  playIndex?: number;
}

/** Kartu album/artist seragam. Hover → tombol play (accent circle). */
export default function MediaCard({ href, artwork, title, subtitle, songs, playIndex = 0 }: Props) {
  const p = usePlayer();
  const canPlay = !!songs?.length;
  return (
    <Link href={href} className="group relative rounded-xl p-3 bg-surface hover:bg-surface-hover transition-all card-hover">
      <div className="relative">
        <ArtworkCard artwork={artwork} alt={title} size={200} />
        {canPlay && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              p.setQueueAndPlay(songs!, playIndex);
            }}
            aria-label={`Putar ${title}`}
            className="absolute bottom-2 right-2 rounded-full bg-accent text-on-accent p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 focus-visible:opacity-100 transition-all duration-200 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-3 font-medium text-sm truncate">{title}</p>
      {subtitle && <p className="text-sm text-muted truncate mt-0.5">{subtitle}</p>}
    </Link>
  );
}