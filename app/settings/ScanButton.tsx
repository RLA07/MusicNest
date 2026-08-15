'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanButton() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function scan() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(`Scanned ${data.files} files. Artists: ${data.artists}, Albums: ${data.albums}, Songs: ${data.songs}. New: ${data.newSongs}, Updated: ${data.updated}, Removed: ${data.removed}.`);
      router.refresh();
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={scan}
        disabled={running}
        className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {running ? 'Scanning...' : 'Scan Library'}
      </button>
      {result && <p className="text-sm text-zinc-500">{result}</p>}
    </div>
  );
}