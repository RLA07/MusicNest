import Link from 'next/link';

export default function PlaylistCard({ id, name, song_count }: { id: number; name: string; song_count: number }) {
  return (
    <Link href={`/playlists/${id}`} className="group rounded-xl p-3 bg-surface hover:bg-surface-hover transition-colors">
      <div className="flex items-center justify-center h-[200px] rounded-xl bg-gradient-to-br from-accent/20 to-surface-hover text-accent">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      </div>
      <p className="mt-3 font-medium text-sm truncate">{name}</p>
      <p className="text-sm text-muted mt-0.5">{song_count} lagu</p>
    </Link>
  );
}