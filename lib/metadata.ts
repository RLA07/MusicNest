import { parseFile } from 'music-metadata';
import type { IAudioMetadata } from 'music-metadata';
import path from 'path';
import { MUSIC_DIR } from './db';

export interface ParsedSong {
  title: string | null;
  artist: string | null;
  album: string | null;
  trackNo: number | null;
  discNo: number | null;
  year: number | null;
  durationMs: number | null;
  bitrate: number | null;
  sampleRate: number | null;
  codec: string | null;
  picture?: { data: Buffer; format: string };
}

/** Parse file metadata via music-metadata. Catches per-file, never throws. */
export async function parseMetadata(filePath: string): Promise<ParsedSong> {
  try {
    const meta: IAudioMetadata = await parseFile(filePath, { duration: true });
    const c = meta.common;
    return {
      title: c.title ?? null,
      artist: c.artist ?? null,
      album: c.album ?? null,
      trackNo: c.track?.no ?? null,
      discNo: c.disk?.no ?? null,
      year: c.year ?? null,
      durationMs: meta.format.duration ? Math.round(meta.format.duration * 1000) : null,
      bitrate: meta.format.bitrate ?? null,
      sampleRate: meta.format.sampleRate ?? null,
      codec: meta.format.codec ?? null,
      picture: c.picture?.[0] ? { data: Buffer.from(c.picture[0].data), format: c.picture[0].format } : undefined,
    };
  } catch {
    return {
      title: null, artist: null, album: null,
      trackNo: null, discNo: null, year: null,
      durationMs: null, bitrate: null, sampleRate: null, codec: null,
    };
  }
}

/** Extract folder segments relative to MUSIC_DIR. */
export function folderParts(filePath: string): string[] {
  const rel = path.relative(MUSIC_DIR, path.dirname(filePath));
  if (rel === '' || rel === '.') return [];
  return rel.split(path.sep);
}

export function resolveArtist(parsed: ParsedSong, folders: string[]): string {
  const candidate = parsed.artist ?? (folders.length >= 2 ? folders[folders.length - 2] : null);
  return (candidate ?? 'Unknown Artist').trim() || 'Unknown Artist';
}

export function resolveAlbum(parsed: ParsedSong, folders: string[]): string {
  const candidate = parsed.album ?? (folders.length >= 1 ? folders[folders.length - 1] : null);
  return (candidate ?? 'Unknown Album').trim() || 'Unknown Album';
}

export function resolveTitle(parsed: ParsedSong, filePath: string): string {
  const candidate = parsed.title ?? path.basename(filePath, path.extname(filePath));
  return (candidate ?? 'Unknown').trim() || 'Unknown';
}