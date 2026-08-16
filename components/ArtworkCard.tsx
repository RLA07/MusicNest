'use client';
import Image from 'next/image';

interface ArtworkCardProps {
  artwork: string | null;
  alt: string;
  size?: number;
  radius?: string;
  className?: string;
  priority?: boolean;
}

/** Cover dengan placeholder fallback + hover scale (Spotify-style card). */
export default function ArtworkCard({
  artwork,
  alt,
  size,
  radius = 'rounded-xl',
  className = '',
  priority = false,
}: ArtworkCardProps) {
  const sizeStyle = size ? { width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, flexShrink: 0 } : undefined;
  const cls = `relative aspect-square overflow-hidden ${radius} bg-gradient-to-br from-surface-hover to-surface transition-transform duration-200 group-hover:scale-[1.03] ${className} ${!size && !className ? 'w-full' : ''}`;

  if (!artwork) {
    return (
      <div className={`${cls} flex items-center justify-center text-muted`} style={sizeStyle} aria-label={alt}>
        <svg width="40%" height="40%" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      </div>
    );
  }
  return (
    <div className={cls} style={sizeStyle}>
      <Image
        src={`/api/artwork/${artwork}`}
        alt={alt}
        width={size || 300}
        height={size || 300}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </div>
  );
}