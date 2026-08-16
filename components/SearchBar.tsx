'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Fuse from 'fuse.js';
import { usePlayer } from './PlayerProvider';
import { fmtDuration } from '@/lib/format';

interface Props {
  placeholder?: string;
  compact?: boolean;
}

interface SearchResults {
  artists: Array<{ id: number; name: string; artwork?: string | null }>;
  albums: Array<{ id: number; name: string; artwork: string | null; artist: string }>;
  songs: Array<{
    id: number;
    title: string;
    duration_ms: number | null;
    album: string;
    artist: string;
    artwork?: string | null;
  }>;
}

function SearchBarForm({ placeholder = "Cari di library...", compact = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const player = usePlayer();

  const [query, setQuery] = useState(searchParams?.get('q') ?? '');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize input with URL query parameter when on /search page
  useEffect(() => {
    const urlQuery = searchParams?.get('q');
    if (urlQuery !== null && urlQuery !== undefined) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  // Debounced search fetch (300ms) + Fuse.js client re-ranking
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=5`);
        if (res.ok) {
          const data: SearchResults = await res.json();
          
          // Re-ranking dengan Fuse.js di client untuk skor kemiripan terbaik (tanpa membuang hasil server)
          if (data) {
            if (data.artists.length > 1) {
              const fuse = new Fuse(data.artists, { threshold: 0.5, keys: ['name'] });
              const ranked = fuse.search(trimmed).map(r => r.item);
              const unranked = data.artists.filter(a => !ranked.some(r => r.id === a.id));
              data.artists = [...ranked, ...unranked];
            }
            if (data.albums.length > 1) {
              const fuse = new Fuse(data.albums, { threshold: 0.5, keys: ['name', 'artist'] });
              const ranked = fuse.search(trimmed).map(r => r.item);
              const unranked = data.albums.filter(a => !ranked.some(r => r.id === a.id));
              data.albums = [...ranked, ...unranked];
            }
            if (data.songs.length > 1) {
              const fuse = new Fuse(data.songs, { threshold: 0.5, keys: ['title', 'artist', 'album'] });
              const ranked = fuse.search(trimmed).map(r => r.item);
              const unranked = data.songs.filter(s => !ranked.some(r => r.id === s.id));
              data.songs = [...ranked, ...unranked];
            }
          }

          setResults(data);
          setIsOpen(true);
          setFocusedIndex(-1);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalItems = (results?.artists.length ?? 0) + (results?.albums.length ?? 0) + (results?.songs.length ?? 0);

  // Flatten items for keyboard navigation index calculation
  const itemsList = [
    ...(results?.artists.map(a => ({ type: 'artist', data: a })) ?? []),
    ...(results?.albums.map(al => ({ type: 'album', data: al })) ?? []),
    ...(results?.songs.map(s => ({ type: 'song', data: s })) ?? []),
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && results) setIsOpen(true);
      setFocusedIndex((prev) => (prev < itemsList.length - 1 ? prev + 1 : 0));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : itemsList.length - 1));
      return;
    }

    if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < itemsList.length) {
        e.preventDefault();
        const selected = itemsList[focusedIndex];
        executeItemAction(selected);
      } else if (query.trim()) {
        e.preventDefault();
        setIsOpen(false);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const executeItemAction = (item: { type: string; data: any }) => {
    setIsOpen(false);
    if (item.type === 'artist') {
      router.push(`/artists/${item.data.id}`);
    } else if (item.type === 'album') {
      router.push(`/albums/${item.data.id}`);
    } else if (item.type === 'song') {
      player.playSong({
        id: item.data.id,
        title: item.data.title,
        artist: item.data.artist,
        album: item.data.album,
        artwork: item.data.artwork ?? null,
        duration_ms: item.data.duration_ms,
      });
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  let globalIndexCounter = 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <form action="/search" onSubmit={handleSubmit} className="relative w-full">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4-4" />
        </svg>

        <input
          ref={inputRef}
          name="q"
          value={query}
          onFocus={() => { if (results && query.trim()) setIsOpen(true); }}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-border bg-background/60 pl-9 pr-8 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:bg-background transition-colors ${
            compact ? 'py-1.5 text-xs' : 'py-2.5'
          }`}
          aria-label="Cari"
          autoComplete="off"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        )}

        {!isLoading && query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 rounded-md transition-colors"
            aria-label="Hapus pencarian"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* Live Search Autocomplete Popover Dropdown */}
      {isOpen && results && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border bg-surface/95 backdrop-blur-xl shadow-2xl p-2 text-foreground space-y-3 max-h-[75vh] overflow-y-auto">
          {totalItems === 0 ? (
            <div className="py-6 text-center text-muted text-sm">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {/* Artis Section */}
              {results.artists.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-[11px] font-semibold tracking-wider text-muted uppercase">Artis</p>
                  <div className="space-y-0.5 mt-0.5">
                    {results.artists.map((artist) => {
                      const itemIdx = globalIndexCounter++;
                      const isFocused = itemIdx === focusedIndex;
                      return (
                        <button
                          key={`art-${artist.id}`}
                          type="button"
                          onClick={() => executeItemAction({ type: 'artist', data: artist })}
                          onMouseEnter={() => setFocusedIndex(itemIdx)}
                          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                            isFocused ? 'bg-surface-hover font-medium text-accent' : 'hover:bg-surface-hover'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden relative">
                            {artist.artwork ? (
                              <Image
                                src={artist.artwork.startsWith('http') ? artist.artwork : `/api/artwork/${artist.artwork}`}
                                alt={artist.name}
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              artist.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="truncate flex-1">{artist.name}</span>
                          <span className="text-[11px] text-muted">Artis</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Album Section */}
              {results.albums.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-[11px] font-semibold tracking-wider text-muted uppercase">Album</p>
                  <div className="space-y-0.5 mt-0.5">
                    {results.albums.map((album) => {
                      const itemIdx = globalIndexCounter++;
                      const isFocused = itemIdx === focusedIndex;
                      return (
                        <button
                          key={`alb-${album.id}`}
                          type="button"
                          onClick={() => executeItemAction({ type: 'album', data: album })}
                          onMouseEnter={() => setFocusedIndex(itemIdx)}
                          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                            isFocused ? 'bg-surface-hover font-medium text-accent' : 'hover:bg-surface-hover'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-md bg-surface-hover overflow-hidden shrink-0 relative flex items-center justify-center text-muted">
                            {album.artwork ? (
                              <Image
                                src={`/api/artwork/${album.artwork}`}
                                alt={album.name}
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm">{album.name}</p>
                            <p className="truncate text-xs text-muted">{album.artist}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Songs Section */}
              {results.songs.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-[11px] font-semibold tracking-wider text-muted uppercase">Lagu</p>
                  <div className="space-y-0.5 mt-0.5">
                    {results.songs.map((song) => {
                      const itemIdx = globalIndexCounter++;
                      const isFocused = itemIdx === focusedIndex;
                      const isCurrentPlaying = player.current?.id === song.id && player.isPlaying;

                      return (
                        <button
                          key={`song-${song.id}`}
                          type="button"
                          onClick={() => executeItemAction({ type: 'song', data: song })}
                          onMouseEnter={() => setFocusedIndex(itemIdx)}
                          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-sm transition-colors cursor-pointer group ${
                            isFocused ? 'bg-surface-hover text-accent font-medium' : 'hover:bg-surface-hover'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-md bg-surface-hover overflow-hidden shrink-0 relative flex items-center justify-center text-muted">
                            {song.artwork ? (
                              <Image
                                src={`/api/artwork/${song.artwork}`}
                                alt={song.title}
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                              </svg>
                            )}
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              {isCurrentPlaying ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm ${isCurrentPlaying ? 'text-accent font-semibold' : ''}`}>{song.title}</p>
                            <p className="truncate text-xs text-muted">{song.artist} · {song.album}</p>
                          </div>
                          <span className="text-xs text-muted font-mono">{fmtDuration(song.duration_ms)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom See All Results Action */}
              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className="w-full py-2 px-3 text-center text-xs font-semibold text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Lihat semua hasil untuk &ldquo;{query}&rdquo;
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchBar(props: Props) {
  return (
    <Suspense fallback={
      <div className="relative w-full">
        <input
          placeholder={props.placeholder ?? "Cari di library..."}
          className={`w-full rounded-lg border border-border bg-background/60 pl-9 pr-3 text-sm text-foreground outline-none ${props.compact ? 'py-1.5 text-xs' : 'py-2.5'}`}
          disabled
        />
      </div>
    }>
      <SearchBarForm {...props} />
    </Suspense>
  );
}