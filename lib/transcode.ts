import { existsSync, mkdirSync, statSync, unlinkSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { DATA_DIR } from './db';

const TRANSCODE_DIR = path.join(DATA_DIR, 'transcodes');
mkdirSync(TRANSCODE_DIR, { recursive: true });

// aac_mf (MediaFoundation) jauh lebih cepat di Windows (≈5s vs ≈16s CPU). Deteksi sekali, cache module-level.
let AAC_ENC: 'aac_mf' | 'aac' | null = null;
function aacEncoder(): 'aac_mf' | 'aac' {
  if (AAC_ENC) return AAC_ENC;
  try {
    AAC_ENC = execSync(
      `ffmpeg -hide_banner -encoders 2>&1`,
      { encoding: 'utf8', timeout: 10000, windowsHide: true },
    ).includes('aac_mf') ? 'aac_mf' : 'aac';
  } catch {
    AAC_ENC = 'aac';
  }
  return AAC_ENC;
}

/** Path cache hasil transcode untuk song id (bisa belum ada). */
export function transcodePath(songId: number): string {
  return path.join(TRANSCODE_DIR, `${songId}.m4a`);
}

/**
 * Path siap-stream untuk satu song.
 * M4A/M4B/M4P ber-codec ALAC → transcode ke AAC 256k sekali, cache di data/transcodes/.
 * codec opsional: kalau sudah diketahui (dari scan), hindari panggil ffprobe.
 */
export function playablePathFor(
  songId: number,
  filepath: string,
  format: string,
  codec?: string | null,
): string {
  if (!['m4a', 'm4b', 'm4p'].includes(format)) return filepath;
  const cache = transcodePath(songId);
  // Cache ada & lebih baru dari sumber → langsung pakai, tanpa ffprobe/ffmpeg.
  if (existsSync(cache) && statSync(cache).mtimeMs >= statSync(filepath).mtimeMs) return cache;
  if (!codec) {
    try {
      codec = execSync(
        `ffprobe -v quiet -show_entries stream=codec_name -select_streams a:0 -of csv=p=0 "${filepath}"`,
        { encoding: 'utf8', timeout: 10000, windowsHide: true },
      ).trim();
    } catch {
      return filepath;
    }
  }
  if ((codec ?? '').toLowerCase() !== 'alac') return filepath;
  try {
    execSync(
      `ffmpeg -v error -i "${filepath}" -vn -c:a ${aacEncoder()} -b:a 256k -movflags +faststart -y "${cache}"`,
      { timeout: 300000, windowsHide: true },
    );
  } catch {
    if (existsSync(cache)) unlinkSync(cache); // hapus partial, biar request berikutnya coba lagi
    return filepath;
  }
  return cache;
}
// ponytail: execSync serial + blocking. Fine untuk personal; parallel worker kalau ramai.

