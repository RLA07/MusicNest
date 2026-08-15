'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  return (
    <form
      className="relative"
      onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q)}`); }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari di library..."
        className="w-full rounded-lg border border-border bg-background/60 pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
        aria-label="Cari"
      />
    </form>
  );
}