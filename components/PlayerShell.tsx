'use client';
import { useState } from 'react';
import { usePlayer } from './PlayerProvider';
import PlayerBar from './PlayerBar';
import FullPlayer from './FullPlayer';

/** Menggabungkan PlayerBar + FullPlayer; FullPlayer jadi overlay saat dibuka. */
export default function PlayerShell() {
  const [open, setOpen] = useState(false);
  const p = usePlayer();
  if (!p.current) return null;
  return (
    <>
      {open && <FullPlayer onClose={() => setOpen(false)} />}
      <PlayerBar onExpand={() => setOpen(true)} />
    </>
  );
}