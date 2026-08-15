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
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari..."
        className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
      />
    </form>
  );
}