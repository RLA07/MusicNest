'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePlaylist() {
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const router = useRouter();

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch('/api/playlists', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName('');
      setShow(false);
      router.refresh();
    }
  }

  if (!show) {
    return (
      <button onClick={() => setShow(true)} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover transition-colors cursor-pointer">
        + Buat Playlist
      </button>
    );
  }
  return (
    <form onSubmit={create} className="flex gap-2 items-center">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama playlist"
        autoFocus
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
      />
      <button type="submit" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent cursor-pointer">Buat</button>
      <button type="button" onClick={() => setShow(false)} className="px-2 text-muted hover:text-foreground cursor-pointer">Batal</button>
    </form>
  );
}