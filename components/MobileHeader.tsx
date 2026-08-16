'use client';
import Link from 'next/link';
import SearchBar from './SearchBar';

export default function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-2.5 bg-surface/95 backdrop-blur-md border-b border-border">
      <Link href="/" className="font-bold text-2xl tracking-tight shrink-0">
        Music<span className="text-accent">Nest</span>
      </Link>
      <div className="flex-1 max-w-[220px]">
        <SearchBar compact placeholder="Cari..." />
      </div>
    </header>
  );
}
