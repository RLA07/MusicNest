'use client';
import Image from 'next/image';

/** Cover dengan placeholder fallback + hover scale (Spotify-style card). */
export default function ArtworkCard({ artwork, alt, size = 200, radius = 'rounded-xl' }: { artwork: string | null; alt: string; size?: number; radius?: string }) {
  const cls = `overflow-hidden ${radius} bg-gradient-to-br from-surface-hover to-surface transition-transform duration-200 group-hover:scale-[1.03]`;
  if (!artwork) {
    return (
      <div className={`${cls} flex items-center justify-center text-muted`} style={{ width: size, height: size }} aria-label={alt}>
        <svg width={size / 2.5} height={size / 2.5} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      </div>
    );
  }
  return (
    <div className={cls} style={{ width: size, height: size }}>
      <Image
        src={`/api/artwork/${artwork}`}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </div>
  );
}