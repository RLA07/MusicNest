'use client';
import { useRouter } from 'next/navigation';

export default function DeletePlaylist({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        if (!confirm(`Hapus playlist "${name}"?`)) return;
        await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
        router.push('/playlists');
        router.refresh();
      }}
      className="rounded-full border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
    >
      Hapus
    </button>
  );
}