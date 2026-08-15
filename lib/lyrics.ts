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