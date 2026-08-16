import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { DATA_DIR } from './db';

/** Simpan artwork dari tag ke disk, return nama file (hash). Convert ke webp. */
export async function saveArtwork(data: Buffer, _format: string): Promise<string> {
  const hash = crypto.createHash('md5').update(data).digest('hex');
  const fileName = `${hash}.webp`;
  const outDir = path.join(DATA_DIR, 'artworks');
  const outPath = path.join(outDir, fileName);
  if (!fs.existsSync(outPath)) {
    const buf = await sharp(data).webp({ quality: 80, effort: 4 }).toBuffer();
    fs.writeFileSync(outPath, buf);
  }
  return fileName;
}

/** Cari cover di folder lagu (folder.jpg/cover.jpg) atau folder artist. */
export function findFolderArtwork(dir: string): string | null {
  const candidates = ['folder.jpg', 'folder.png', 'cover.jpg', 'cover.png', 'Folder.jpg', 'Cover.jpg', 'front.jpg'];
  for (const c of candidates) {
    const p = path.join(dir, c);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Cari thumbnail_Artist file di folder parent 2 level. */
export function findArtistThumbnail(artistDir: string): string | null {
  const candidates = [`thumbnail_${path.basename(artistDir)}.avif`, `${path.basename(artistDir)}.jpg`];
  for (const c of candidates) {
    const p = path.join(artistDir, c);
    if (fs.existsSync(p)) return p;
  }
  return null;
}
// ponytail: hanya 1 artwork per album. Resize via sharp nanti jika artwork besar bikin UI lambat.