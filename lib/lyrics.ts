import type { IAudioMetadata } from 'music-metadata';

export interface LrcLine { timeMs: number; text: string }

/** Parse LRC: `[00:12.34] lirik` → sorted lines. */
export function parseLrc(raw: string): LrcLine[] {
  const out: LrcLine[] = [];
  for (const line of raw.split('\n')) {
    const m = line.match(/\[(\d{1,2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (m) out.push({ timeMs: (+m[1])*60000 + (+m[2])*1000 + +m[3].padEnd(3,'0'), text: m[4].trim() });
  }
  return out.sort((a, b) => a.timeMs - b.timeMs);
}

/**
 * Ekstrak lirik embedded dari audio metadata (music-metadata).
 * Mendukung SYLT (synchronized), USLT (unsynchronized), dan embedded LRC.
 */
export function extractEmbeddedLyrics(meta: IAudioMetadata): LrcLine[] | null {
  // 1. Cek meta.common.lyrics
  if (meta.common.lyrics && meta.common.lyrics.length > 0) {
    for (const item of meta.common.lyrics) {
      if (typeof item === 'string') {
        const parsed = parseLrc(item);
        if (parsed.length > 0) return parsed;
        const plainLines = parsePlainLyrics(item);
        if (plainLines.length > 0) return plainLines;
      } else if (item) {
        if (item.syncText && item.syncText.length > 0) {
          const lines: LrcLine[] = item.syncText.map((s) => ({
            timeMs: s.timestamp ?? 0,
            text: s.text ?? '',
          }));
          return lines.sort((a, b) => a.timeMs - b.timeMs);
        }
        if (item.text) {
          const parsed = parseLrc(item.text);
          if (parsed.length > 0) return parsed;
          const plainLines = parsePlainLyrics(item.text);
          if (plainLines.length > 0) return plainLines;
        }
      }
    }
  }

  // 2. Fallback cek native tags (ID3v2, FLAC, iTunes ©lyr, dll)
  if (meta.native) {
    for (const tagType of Object.keys(meta.native)) {
      const tags = meta.native[tagType];
      if (!Array.isArray(tags)) continue;
      for (const tag of tags) {
        const id = (tag.id || '').toUpperCase();
        if (id === 'USLT' || id === 'SYLT' || id === 'LYRICS' || id === 'UNSYNCEDLYRICS' || id === '©LYR' || id === 'WM/LYRICS') {
          const val = tag.value;
          if (typeof val === 'string') {
            const parsed = parseLrc(val);
            if (parsed.length > 0) return parsed;
            const plainLines = parsePlainLyrics(val);
            if (plainLines.length > 0) return plainLines;
          } else if (val && typeof val === 'object') {
            const textVal = (val as any).text || (val as any).descriptor || '';
            if (typeof textVal === 'string' && textVal.trim()) {
              const parsed = parseLrc(textVal);
              if (parsed.length > 0) return parsed;
              const plainLines = parsePlainLyrics(textVal);
              if (plainLines.length > 0) return plainLines;
            }
          }
        }
      }
    }
  }

  return null;
}

function parsePlainLyrics(raw: string): LrcLine[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ timeMs: 0, text }));
}