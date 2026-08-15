'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/artists', label: 'Artists' },
  { href: '/albums', label: 'Albums' },
  { href: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-black/10 bg-white/50 dark:border-white/10 dark:bg-white/5 flex flex-col gap-1 p-3">
      <Link href="/" className="px-3 py-2 text-lg font-bold tracking-tight">Music Nest</Link>
      <div className="mb-2"><SearchBar /></div>
      {LINKS.map((l) => {
        const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active ? 'bg-black/10 dark:bg-white/10' : 'text-zinc-500 hover:text-black dark:hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </aside>
  );
}