'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Song } from '@/lib/types';

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  queue: Song[];
  index: number;
  current: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  playSong: (song: Song) => void;
  setQueueAndPlay: (songs: Song[], startIndex: number) => void;
  playNext: () => void;
  playPrev: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
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
  const shuffleRef = useRef(false);
  const repeatRef = useRef<RepeatMode>('off');
  const [queue, setQueue] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');

  /** Pindah +delta lagu. stopAtEnd = jangan wrap (ujung queue = berhenti). */
  function step(delta: number, stopAtEnd = false) {
    const q = queueRef.current;
    if (!q.length) return;
    if (repeatRef.current === 'one' && delta !== 0) {
      // satu lagu: ulangi lagi
      audioRef.current!.currentTime = 0;
      audioRef.current!.play();
      setIsPlaying(true);
      return;
    }
    let ni: number;
    if (shuffleRef.current && q.length > 1) {
      let r;
      do { r = Math.floor(Math.random() * q.length); } while (r === indexRef.current);
      ni = r;
    } else {
      ni = indexRef.current + delta;
      if (ni >= q.length) {
        if (stopAtEnd) {
          if (repeatRef.current === 'all') { ni = 0; }
          else {
            audioRef.current?.pause();
            setIsPlaying(false);
            setCurrentTime(0);
            return;
          }
        } else ni = 0;
      }
      if (ni < 0) ni = q.length - 1;
    }
    indexRef.current = ni;
    setIndex(ni);
    setCurrent(q[ni]);
    const a = audioRef.current!;
    a.src = `/api/stream/${q[ni].id}`;
    a.play();
    setIsPlaying(true);
  }

  // inisialisasi audio sekali
  if (typeof window !== 'undefined' && !audioRef.current) {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = 1;
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onloadedmetadata = () => setDuration(audio.duration || 0);
    audio.onended = () => step(1, true);
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

  const toggle = useCallback(() => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [audio, isPlaying]);

  const seek = (t: number) => {
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const setVol = (v: number) => {
    audio.volume = v;
    setVolumeState(v);
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (muted) {
      audio.volume = volume || 0.7;
      setMuted(false);
    } else {
      audio.volume = 0;
      setMuted(true);
    }
  };

  const toggleShuffle = () => {
    shuffleRef.current = !shuffleRef.current;
    setShuffle(shuffleRef.current);
  };

  const cycleRepeat = () => {
    const next: RepeatMode = repeatRef.current === 'off' ? 'all' : repeatRef.current === 'all' ? 'one' : 'off';
    repeatRef.current = next;
    setRepeat(next);
  };

  // keyboard shortcuts (Space play/pause, ArrowNext/Prev, M mute)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); toggle(); }
      else if (e.key === 'm' || e.key === 'M') toggleMute();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, toggleMute]);

  const value: PlayerState = {
    queue, index, current, isPlaying, currentTime, duration, volume, muted, shuffle, repeat,
    playSong, setQueueAndPlay, playNext: () => step(1), playPrev: () => step(-1),
    toggle, seek, setVolume: setVol, toggleMute, toggleShuffle, cycleRepeat,
  };

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}
