'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';

const LINKS = [
  { href: '/', label: 'Home', icon: <path d="M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3z" /> },
  { href: '/artists', label: 'Artists', icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0" /> },
  { href: '/albums', label: 'Albums', icon: <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" /> },
  { href: '/favorites', label: 'Favorites', icon: <path d="M12 21s-7.5-4.6-10-9.5C.6 8.4 2.5 5 5.8 5c2 0 3.6 1.1 4.4 2.8A8 8 0 0 1 14.6 5c3.3 0 5.2 3.4 3.8 6.5C19 16.4 12 21 12 21z" /> },
  { href: '/playlists', label: 'Playlists', icon: <path d="M4 6h16M4 12h16M4 18h10" /> },
  { href: '/settings', label: 'Settings', icon: <path d="M4 8h16M4 16h16M8 3v10M16 11v10" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col gap-1 p-3">
      <Link href="/" className="px-3 py-3 font-[family-name:var(--font-righteous)] text-2xl tracking-wide">
        Music<span className="text-accent">Nest</span>
      </Link>
      <div className="mb-2"><SearchBar /></div>
      {LINKS.map((l) => {
        const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-surface-hover text-foreground'
                : 'text-muted hover:text-foreground hover:bg-surface-hover'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {l.icon}
            </svg>
            {l.label}
          </Link>
        );
      })}
    </aside>
  );
}