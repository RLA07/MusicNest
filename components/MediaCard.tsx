import Link from 'next/link';
import ArtworkCard from './ArtworkCard';

interface Props {
  href: string;
  artwork: string | null;
  title: string;
  subtitle?: string | null;
}

/** Kartu album/artist seragam (Spotify-style card). */
export default function MediaCard({ href, artwork, title, subtitle }: Props) {
  return (
    <Link href={href} className="group rounded-xl p-3 bg-surface hover:bg-surface-hover transition-colors">
      <ArtworkCard artwork={artwork} alt={title} size={200} />
      <p className="mt-3 font-medium text-sm truncate">{title}</p>
      {subtitle && <p className="text-sm text-muted truncate mt-0.5">{subtitle}</p>}
    </Link>
  );
}