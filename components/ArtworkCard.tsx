'use client';
import Image from 'next/image';

/** Cover dengan placeholder fallback (artwork NULL → ikon musik). */
export default function ArtworkCard({ artwork, alt, size = 200 }: { artwork: string | null; alt: string; size?: number }) {
  if (!artwork) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900 text-zinc-400"
        style={{ width: size, height: size }}
        aria-label={alt}
      >
        <svg width={size / 3} height={size / 3} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      </div>
    );
  }
  return (
    <Image
      src={`/api/artwork/${artwork}`}
      alt={alt}
      width={size}
      height={size}
      className="object-cover bg-zinc-200 dark:bg-zinc-800"
      style={{ width: size, height: size }}
    />
  );
}