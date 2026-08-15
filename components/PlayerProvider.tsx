'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { Song } from '@/lib/types';

interface PlayerState {
  queue: Song[];
  index: number;
  current: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song) => void;
  setQueueAndPlay: (songs: Song[], startIndex: number) => void;
  playNext: () => void;
  playPrev: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
}

const PlayerCtx = createContext<PlayerState | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerCtx);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Song[]>([]);
  const indexRef = useRef(0);
  const [queue, setQueue] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);

  /** Pindah +delta lagu di queue; stop jika di ujung & mau next. */
  function step(delta: number, stopAtEnd = false) {
    const q = queueRef.current;
    if (!q.length) return;
    let ni = indexRef.current + delta;
    if (ni >= q.length) {
      if (stopAtEnd) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setCurrentTime(0);
        return;
      }
      ni = 0;
    }
    if (ni < 0) ni = q.length - 1;
    indexRef.current = ni;
    setIndex(ni);
    setCurrent(q[ni]);
    audioRef.current!.src = `/api/stream/${q[ni].id}`;
    audioRef.current!.play();
    setIsPlaying(true);
  }

  if (typeof window !== 'undefined' && !audioRef.current) {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = 1;
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onloadedmetadata = () => setDuration(audio.duration || 0);
    audio.onended = () => step(1);
    audio.onerror = () => step(1); // file corrupt → lompat
  }
  const audio = audioRef.current!;

  const playSong = (song: Song) => {
    queueRef.current = [song];
    indexRef.current = 0;
    setQueue([song]);
    setIndex(0);
    setCurrent(song);
    audio.src = `/api/stream/${song.id}`;
    audio.play();
    setIsPlaying(true);
  };

  const setQueueAndPlay = (songs: Song[], startIndex: number) => {
    queueRef.current = songs;
    indexRef.current = startIndex;
    setQueue(songs);
    setIndex(startIndex);
    setCurrent(songs[startIndex]);
    audio.src = `/api/stream/${songs[startIndex].id}`;
    audio.play();
    setIsPlaying(true);
  };

  const toggle = () => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const seek = (t: number) => {
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const setVol = (v: number) => {
    audio.volume = v;
    setVolumeState(v);
  };

  const value: PlayerState = {
    queue, index, current, isPlaying, currentTime, duration, volume,
    playSong, setQueueAndPlay, playNext: () => step(1), playPrev: () => step(-1),
    toggle, seek, setVolume: setVol,
  };

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}