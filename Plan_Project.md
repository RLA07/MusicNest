# Music Stream App — Plan / PRD Lengkap (From Scratch)

> Proyek iseng personal: aplikasi streaming musik pribadi ala Spotify / Apple Music / YouTube Music.
> **Dibangun benar-benar dari 0** — folder baru, stack baru, database baru.
> Dokumen ini = satu-satunya referensi. Semua keputusan, arsitektur, stack, dan roadmap ada di sini.

---

## 2. Keputusan Stack

| Aspek | Pilihan | Alasan |
|---|---|---|
| Runtime | **Node.js 20+** | Ekosistem metadata audio paling matang (music-metadata). |
| Framework | **Next.js 15** (App Router, TypeScript) | Routing + API route handler gratis; HMR; Server Components untuk query DB tanpa fetch round-trip. |
| Bahasa | **TypeScript** | Tipe untuk schema DB & metadata parser mencegah salah field. |
| Database | **MySQL** via `mysql2` (server lokal sudah jalan) | Tidak perlu install DB baru; MySQL sudah dipakai di project lain pada server yang sama. Tanpa ORM. |
| Metadata audio | **`music-metadata`** | Baca tag + artwork dari mp3/flac/m4a/ogg/wav/aac/opus/wma. |
| Styling | **Tailwind CSS** | |
| Streaming | Route handler bawaan Next + header `Range` | Seek work tanpa server ekstra. |
| Transcode fallback (opsional) | `ffmpeg-static` | FLAC tidak didukung Safari. |
| Manajemen paket | npm | |

**Mengapa bukan yang lain:**
- **Electron/Tauri (desktop)?** Tidak — target web browser. Native FLAC di browser adalah trade-off yang sudah diterima (§8).
- **SQLite?** Tidak — MySQL sudah terlanjur dipakai di banyak project lain pada server yang sama; tidak mau install/manage DB tambahan.
- **ORM (Prisma/Drizzle)?** Tidak — schema 4–5 tabel, `mysql2` langsung cukup. ORM = lapisan tambahan tanpa benefit untuk proyek ini.
- **State library (Zustand/Redux)?** Tidak — satu `PlayerProvider` React Context cukup untuk queue + player state.

**Dependensi final:**
```
dependencies:  next, react, react-dom, mysql2, music-metadata
devDependencies:  typescript, @types/node, @types/react, @types/react-dom, tailwindcss, tsx
optional (Fase 5):  ffmpeg-static, fluent-ffmpeg
```

---

## 3. Kebutuhan Fungsional (PRD)

### Wajib (MVP)
1. **Scan library**: baca seluruh file audio di `Music/` (subfolder tak terbatas, termasuk file lepas di root), ekstrak metadata via tag.
2. **Resolver otomatis**: artist/album/title — prioritas **tag > inferensi folder > default**. File tanpa tag tidak hilang (masuk "Unknown Artist").
3. **Artwork otomatis**: cover dari tag tertanam → `folder.jpg`/`cover.jpg` → `thumbnail_Artist.*` → placeholder.
4. **Browse**: daftar Artists, Albums, Songs.
5. **Detail**: halaman artist (list album), halaman album (list lagu + track_no).
6. **Search**: cari artist/album/lagu sekaligus, real-time di sidebar.
7. **Streaming player**: sticky bottom bar + full player; play/pause, seek (Range), next/prev, volume, progress bar, **queue** (antrian berlanjut otomatis ke lagu berikutnya).
8. **Lyrics (LRC)**: tampilkan synced lyrics jika file `.lrc` ada di sebelah lagu.
9. **Settings**: tombol "Scan", status library (jumlah artist/album/song, last_scan_at).

### Opsional (Fase 5+)
- Playlist (buat/hapus/tambah lagu/urutkan).
- Favorit / recently-played.
- Edit metadata via UI (perbaiki hasil scan yang salah).
- File watcher (deteksi file baru tanpa klik scan).
- Transcode FLAC→AAC untuk Safari.

### Non-goals
- Multi-user, login, akun. Single-user.
- Fitur sosial, rekomendasi algoritma, DRM.
- Upload lagu dari browser.
- Integrasi cloud / sinkronisasi antar device.

---

## 4. Arsitektur

```
┌───────────────────────────────────────────────────────────┐
│  Browser  ───  http://localhost:3030  (Next.js 15)         │
│                                                            │
│  Halaman (Server Components):                              │
│   /                Home (recent + random picks)            │
│   /artists         daftar artist                           │
│   /artists/[id]    detail artist → album list              │
│   /albums          daftar album                            │
│   /albums/[id]     detail album → song list + play all     │
│   /search          hasil pencarian                         │
│   /settings        scan button + status library            │
│                                                            │
│  Komponen Client:                                          │
│   PlayerProvider (queue+state) → PlayerBar + FullPlayer    │
└──────────────────────────┬────────────────────────────────┘
                           │ fetch /<audio src>
┌──────────────────────────▼────────────────────────────────┐
│  Route Handlers (Next App Router, server-side)             │
│   GET /api/stream/[id]       Range streaming               │
│   GET /api/artwork/[id]      serve cover image             │
│   POST /api/scan             trigger scanner               │
│   (GET/POST /api/playlist    Fase 5)                       │
└──────────────────────────┬────────────────────────────────┘
                           │ mysql2 (async)  →  localhost:3306
┌──────────────────────────▼────────────────────────────────┐
│  MySQL  music_nest  (server lokal yang sudah ada)          │
│  +  data/artworks/*.jpg  (file cover hasil ekstrak)        │
└──────────────────────────┬────────────────────────────────┘
                           │ fs.createReadStream
┌──────────────────────────▼────────────────────────────────┐
│  Folder Musik  (path dari .env.local, TIDAK dipindah)      │
│   Music/Artist/Album/song.flac                             │
│   Music/acak/file.mp3            (file lepas di root)      │
└───────────────────────────────────────────────────────────┘
```

**Prinsip kunci:**
- Semua query DB terjadi **server-side** (Server Component atau route handler). Tidak ada fetch data di client.
- `PlayerProvider` hanya pegang state UI (lagu aktif, queue, isPlaying, currentTime). Data lagu dikirim sebagai serializable array.
- Audio element `<audio>` memakai `src=/api/stream/[id]` — seek, play/pause, next semua via browser native.

---

## 5. Database Schema (MySQL, file `lib/schema.sql`)

Schema ini dijalankan sekali saat startup jika tabel belum ada (`CREATE TABLE IF NOT EXISTS`). Database `music_nest` dipakai bersama dengan project lain yang sudah jalan di server MySQL lokal — bukan database baru. Buat database ini via MySQL client: `CREATE DATABASE IF NOT EXISTS music_nest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

```sql
-- Tabel artists
CREATE TABLE IF NOT EXISTS artists (
  id   INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel albums
CREATE TABLE IF NOT EXISTS albums (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  artist_id INT NOT NULL,
  name      VARCHAR(255) NOT NULL,
  year      INT NULL,
  artwork   VARCHAR(255) NULL,                    -- nama file di data/artworks/, NULL = placeholder
  UNIQUE KEY uniq_artist_album (artist_id, name),
  CONSTRAINT fk_albums_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel songs
CREATE TABLE IF NOT EXISTS songs (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  album_id    INT NOT NULL,
  title       VARCHAR(255) NOT NULL,
  track_no    INT NULL,
  disc_no     INT NULL,
  duration_ms INT NULL,
  filepath    VARCHAR(512) NOT NULL UNIQUE,       -- path absolut ke file audio
  format      VARCHAR(16) NULL,                   -- 'mp3'|'flac'|'m4a'|'ogg'|'opus'|'wav'|'aac'|'wma'
  bitrate     INT NULL,
  sample_rate INT NULL,
  size        BIGINT NULL,
  mtime       BIGINT NULL,                        -- file mtime, untuk rescan idempotent
  KEY idx_songs_album (album_id),
  KEY idx_songs_title (title),
  CONSTRAINT fk_songs_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel lyrics
CREATE TABLE IF NOT EXISTS lyrics (
  id       INT PRIMARY KEY AUTO_INCREMENT,
  song_id  INT NOT NULL,
  filename VARCHAR(512) NOT NULL,
  CONSTRAINT fk_lyrics_song FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fase 5 (opsional)
CREATE TABLE IF NOT EXISTS playlists (
  id   INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id INT NOT NULL,
  song_id     INT NOT NULL,
  position    INT NOT NULL,
  PRIMARY KEY (playlist_id, song_id),
  CONSTRAINT fk_ps_pl FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_sg FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengaturan runtime
CREATE TABLE IF NOT EXISTS settings (
  key_   VARCHAR(64) PRIMARY KEY,                 -- 'key' reserved word di MySQL 8+; pakai key_
  value_ TEXT NOT NULL                            -- 'last_scan_at' → ISO string
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Catatan desain schema:**
- `songs.artwork` dipindah ke `albums.artwork` (per-album yang ditampilkan, bukan per-lagu).
- Ditambah `format`, `track_no`, `disc_no`, `year`, `mtime` — untuk rescan idempotent dan UI album.
- `filepath UNIQUE` = anti-duplikat alami.
- `UNIQUE(artist_id, name)` mencegah album duplikat.
- InnoDB + utf8mb4 untuk konsistensi dengan project PHP lama dan dukungan emoji/unicode penuh.
- `key`/`value` di tabel `settings` jadi `key_`/`value_` (reserved word).
- **Tidak dipakai** kolom `file_hash` — `path + mtime + size` cukup untuk deteksi perubahan (hash SHA1 mahal untuk ribuan file). `ponytail: file_hash, add if same-file-in-two-folders proves to be a real dup problem.`

**Catatan desain schema:**
- `songs.artwork` dipindah ke `albums.artwork` (per-album yang ditampilkan, bukan per-lagu).
- Ditambah `format`, `track_no`, `disc_no`, `year`, `mtime` — untuk rescan idempotent dan UI album.
- `filepath UNIQUE` = anti-duplikat alami.
- `UNIQUE(artist_id, name)` mencegah album duplikat.
- **Tidak dipakai** kolom `file_hash` — `path + mtime + size` cukup untuk deteksi perubahan (hash SHA1 mahal untuk ribuan file). `ponytail: file_hash, add if same-file-in-two-folders proves to be a real dup problem.`

---

## 6. Struktur Folder Project Baru

```
D:\MusicNest\                  ← root project (D:\MusicNest)
├── app/
│   ├── layout.tsx                 # <html> + PlayerProvider + global styles
│   ├── page.tsx                   # Home: recent songs + random albums
│   ├── globals.css                # Tailwind import
│   ├── artists/
│   │   ├── page.tsx               # grid daftar artist
│   │   └── [id]/page.tsx          # detail artist → albums
│   ├── albums/
│   │   ├── page.tsx               # grid daftar album
│   │   └── [id]/page.tsx          # detail album → SongList
│   ├── search/page.tsx            # hasil pencarian (query param)
│   ├── settings/page.tsx          # scan button + status library
│   └── api/
│       ├── stream/[id]/route.ts   # GET Range streaming
│       ├── artwork/[id]/route.ts  # GET cover image
│       └── scan/route.ts          # POST trigger scan
├── components/
│   ├── PlayerProvider.tsx         # React Context: queue, current, isPlaying, time
│   ├── PlayerBar.tsx              # sticky bottom: play/pause, title, seek, next/prev
│   ├── FullPlayer.tsx             # full view: artwork, lyrics (LRC), seek
│   ├── SongList.tsx               # reusable tabel lagu (album detail, search)
│   ├── ArtworkCard.tsx            # cover dengan placeholder fallback
│   ├── SearchBar.tsx              # input → /search?query=
│   └── Sidebar.tsx                # nav + search (gabung navbar)
├── lib/
│   ├── db.ts                      # mysql2 connection pool + bootstrap schema.sql
│   ├── schema.sql                 # (tabel di §5)
│   ├── scanner.ts                 # walk folder → extract → upsert (INTI)
│   ├── metadata.ts                # bungkus music-metadata + folder inference
│   ├── artwork.ts                 # ekstrak/simpan/serve cover
│   ├── stream.ts                  # logika Range header + read stream
│   ├── mime.ts                    # format → Content-Type
│   └── lyrics.ts                  # cari & parse .lrc (Fase 4)
├── data/                          # GITIGNORE: artworks/ (cover hasil ekstrak) — DB di MySQL server
├── scripts/
│   └── scan.ts                    # CLI: npm run scan (panggil lib/scanner)
├── .env.local                     # MUSIC_DIR, DATA_DIR  (tidak di-commit)
├── .env.example                   # template
├── .gitignore                     # node_modules, .next, data/
├── next.config.ts                 # disable telemetry; standalone (opsional)
├── tsconfig.json
├── package.json
└── README.md                      # cara setup & scan
```

**Jangan pakai `public/` untuk artwork** — artwork dibuat runtime dari scan, bukan asset build.

---

## 7. Konfigurasi Environment

`.env.local`:
```
# Folder musik yang akan di-scan (path absolut Windows)
MUSIC_DIR=D:\MusicNest\Music

# Folder artwork hasil ekstrak (relative ke project root cukup)
DATA_DIR=./data

# MySQL (server lokal yang sudah jalan dipakai project lain)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=music_nest
```
Catatan: `MUSIC_DIR` adalah folder berisi file musik — boleh di mana saja (dalam contoh ini `D:\MusicNest\Music`). Root project Next.js ada di `D:\MusicNest`. Folder `Music/` boleh tetap di tempat lama (`C:\xampp\htdocs\Music_Stream\Music`) atau dipindah ke `D:\MusicNest\Music` — cukup ubah `MUSIC_DIR`. Folder XAMPP tidak perlu jalan, MySQL perlu jalan (server yang sudah ada).

`lib/db.ts` (mysql2 connection pool + bootstrap schema):
```ts
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

export const MUSIC_DIR = process.env.MUSIC_DIR ?? path.join(process.cwd(), 'Music');
export const DATA_DIR  = process.env.DATA_DIR  ?? path.join(process.cwd(), 'data');
fs.mkdirSync(path.join(DATA_DIR, 'artworks'), { recursive: true });

// Pool koneksi (shared antar route handler + Server Component)
export const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST     ?? 'localhost',
  port:     Number(process.env.MYSQL_PORT ?? 3306),
  user:     process.env.MYSQL_USER     ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'music_nest',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

// Bootstrap schema (jalan sekali saat startup)
let bootstrapped = false;
export async function ensureSchema() {
  if (bootstrapped) return;
  const sql = fs.readFileSync(path.join(process.cwd(), 'lib', 'schema.sql'), 'utf8');
  // split per-statement (sederhana: split by ';' skip empty + komentar baris)
  const stmts = sql.split(/;\s*\n/).map(s => s.trim()).filter(s =>
    s && !s.startsWith('--'));
  const conn = await pool.getConnection();
  try {
    for (const s of stmts) await conn.query(s);
  } finally {
    conn.release();
  }
  bootstrapped = true;
}
```
`ponytail: bootstrap schema sekali saja; cukup untuk personal project. Untuk multi-instance ganti dengan migration tool.`

Untuk query biasa: `const [rows] = await pool.query<RowType[]>('SELECT ... WHERE id = ?', [id]);` (mysql2 pakai promise).

---

## 8. Scanner — Inti Masalah (paling penting)

### Algoritma lengkap (`lib/scanner.ts`)

```
1. WALK
   - rekursif traverse MUSIC_DIR (pakai fs.readdirSync + recursion, BUKAN glob —
     glob normalisasi path bisa gagal di Windows ber-spasi/unicode)
   - kumpulkan semua file dengan ekstensi audio:
       .mp3 .flac .m4a .m4b .m4p .aac .ogg .opus .wav .wma
   - untuk file lepas di root Music/, folder ditetapkan "Unknown"

2. EXTRACT (per file, lib/metadata.ts)
   - music-metadata parse → common (title, artist, album, track.no, disk.no,
     year, genre) + format (duration, bitrate, sampleRate, container)
   - picture[] → [0].data + [0].format (untuk artwork)
   - wrap dalam try/catch — 1 file corrupt tidak boleh membatalkan scan total

3. RESOLVE ARTIST/ALBUM/TITLE (prioritas: tag > folder > default)
   artist = common.artist                ?? dirname(2 levels up) ?? 'Unknown Artist'
   album  = common.album                 ?? dirname(1 level up)  ?? 'Unknown Album'
   title  = common.title                 ?? basename tanpa ekstensi
   - "dirname" diambil dari struktur folder; lagu di root Music/ → tanpa folder → Unknown
   - Sanitize: trim whitespace; kalau hasil kosong → default

4. RESOLVE ARTWORK (lib/artwork.ts)
   a. tag picture → tulis ke data/artworks/<hash>.jpg   (hash = MD5 dari bytes)
   b. tidak ada → cari di folder lagu:  folder.jpg, cover.jpg, front.jpg,
      Folder.jpg, Cover.jpg (case-insensitive)
   c. tidak ada → cari di folder ARTIST: thumbnail_Artist.avif, artist.jpg
      (dukung `thumbnail_Artist.avif` — pola umum di library iTunes-style)
   d. tidak ada → album.artwork = NULL → UI pakai placeholder
   - simpan hanya SATU file per album (jika 2 lagu sama album, hash sama → dedup)

5. UPSERT (dalam SATU koneksi transaksi — cepat + atomik)
   - `await conn.beginTransaction()` (mysql2); rollback on error; commit di akhir
   - `INSERT IGNORE INTO artists (name) VALUES (?)` → `SELECT LAST_INSERT_ID() / id`
     (kalau gagal insert = duplikat, ambil id via `SELECT id FROM artists WHERE name=?`)
   - `INSERT IGNORE INTO albums (artist_id, name, year, artwork) VALUES (...)`
     - kalau album sudah ada tapi artwork NULL & sekarang dapat:
       `UPDATE albums SET artwork=? WHERE id=?`
   - `INSERT IGNORE INTO songs (album_id, title, track_no, disc_no, duration_ms,
     filepath, format, bitrate, sample_rate, size, mtime) VALUES (...)`
     - karena `filepath UNIQUE`, rescan kedua kali tidak membuat duplikat
   - DELETE songs yang path-nya tidak ada lagi di disk (file dihapus user)
     - hanya hapus yang hasil scan (`WHERE filepath LIKE ?` dg prefix `MUSIC_DIR + '%'`)
   - INSERT/UPDATE `settings` row key_='last_scan_at'

6. TULIS last_scan_at → settings table (INSERT ... ON DUPLICATE KEY UPDATE)
```

### `lib/metadata.ts` — fungsi:

```ts
interface ParsedSong {
  title: string | null;
  artist: string | null;
  album: string | null;
  trackNo: number | null;
  discNo: number | null;
  year: number | null;
  durationMs: number | null;
  bitrate: number | null;
  sampleRate: number | null;
  container: string | null;
  picture?: { data: Buffer; format: string };
}

export async function parseMetadata(filePath: string): Promise<ParsedSong>
export function resolveArtist(parsed, folderParts): string   // tag > folder > default
export function resolveAlbum(parsed, folderParts): string
export function resolveTitle(parsed, fileName): string
```

`folderParts` = array segmen path relatif dari MUSIC_DIR (tanpa nama file). Contoh `Music/Coldplay/A Head Full of Dreams/01 - Adventure.flac` → `['Coldplay', 'A Head Full of Dreams']`. Index `-2` = artist, `-1` = album.

### Skrip CLI (`scripts/scan.ts`)

```
node -r tsx scripts/scan.ts     (atau: npm run scan → "tsx scripts/scan.ts")
```
- load `.env.local` (pakai `process.loadEnvFile` Node 20+, atau parse manual).
- panggil `scanLibrary()` dari `lib/scanner.ts`.
- print ringkas: `Scanned 1297 files. Artists: 169, Albums: 346, Songs: 1297. New: 5, Updated: 2, Removed: 0`.
- exit code 0 = sukses, 1 = error fatal.

---

## 9. Streaming Audio — Route Handler

`app/api/stream/[id]/route.ts`:

```ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { mimeFor } from '@/lib/mime';
import { createReadStream, statSync } from 'fs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return new Response('bad id', { status: 400 });
  const song = db.prepare('SELECT filepath, format FROM songs WHERE id = ?').get(id) as
    { filepath: string; format: string } | undefined;
  if (!song) return new Response('not found', { status: 404 });

  const size = statSync(song.filepath).size;
  const mime = mimeFor(song.format);
  const range = req.headers.get('range');               // contoh: 'bytes=0-1023'

  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (m) {
      let start = m[1] ? Number(m[1]) : 0;
      let end = m[2] ? Number(m[2]) : size - 1;
      if (start > end || end >= size) end = size - 1;
      if (start >= size) return new Response(null, { status: 416, headers: {
        'Content-Range': `bytes */${size}` } });
      return new Response(createReadStream(song.filepath, { start, end }) as any, {
        status: 206,
        headers: {
          'Content-Type': mime,
          'Content-Length': String(end - start + 1),
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache',          // stream harus selalu fresh
        },
      });
    }
  }
  // tanpa Range → full file
  return new Response(createReadStream(song.filepath) as any, {
    status: 200,
    headers: { 'Content-Type': mime, 'Content-Length': String(size),
               'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' },
  });
}
```

`lib/mime.ts`:
```ts
const MIME: Record<string, string> = {
  mp3: 'audio/mpeg', flac: 'audio/flac', m4a: 'audio/mp4',
  m4b: 'audio/mp4', m4p: 'audio/mp4', aac: 'audio/aac',
  ogg: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav', wma: 'audio/x-ms-wma',
};
export function mimeFor(format?: string | null): string {
  return MIME[(format ?? '').toLowerCase()] ?? 'application/octet-stream';
}
```

**Catatan penting Next.js + streaming:**
- Body route handler Next mendukung `ReadableStream` / Node stream. `createReadStream` butuh di-wrap (tersebut di kode). Alternatif: `stream.Readable.toWeb()` lalu `new Response(webStream)`.
- Set `export const dynamic = 'force-dynamic'` — route ini tidak boleh di-cache/statis.
- `params` di Next 15 async → pakai `await params`.

`app/api/artwork/[id]/route.ts`:
- `id` = nama file di `data/artworks/` (simpan di kolom `albums.artwork`).
- validate nama file dengan `path.basename(nama) === nama` (cegah traversal).
- serve file dengan `Cache-Control: public, max-age=86400`.

---

## 10. Kompatibilitas Format & FLAC di Safari

| Format | Chrome/Edge | Firefox | Safari |
|---|---|---|---|
| mp3 | ✅ | ✅ | ✅ |
| m4a (AAC) | ✅ | ✅ | ✅ |
| flac | ✅ | ✅ | ❌ |
| ogg/opus | ✅ | ✅ | ⚠️ ≥17.4 |
| wav | ✅ | ✅ | ✅ |

**FLAC di Safari (Fase 5, opsional):**
- Frontend: `audio.canPlayType('audio/flac') === ''` → tampilkan tombol "Download" (tautan `/api/stream/[id]`), atau minta transcode.
- Transcode: route `/api/stream/[id]?transcode=1` → spawn `ffmpeg-static`:
  `ffmpeg -i <file> -f adts -acodec aac -` → pipe stdout ke Response `audio/aac`.
  Next route handler bisa: spawn child process → `Readable.from(child.stdout)`.
- Single-user localhost → CPU transcode tidak masalah. Cache hasil transcode ke `data/transcode/<id>.aac` + mtime (Fase 5 lanjut).
- **MVP tanpa transcode**: FLAC tetap jalan di Chrome/FF (browser utama).

---

## 11. Frontend — Komponen & State

### PlayerProvider (`components/PlayerProvider.tsx`) — Client Component
State yang dibutuhkan (React Context + `useState`/`useRef`):
```
queue: Song[]                  // { id, title, artist, album, artwork, durationMs }
index: number                  // posisi aktif di queue
isPlaying: boolean
currentTime: number            // sinkron via 'timeupdate' event
setQueueAndPlay(songs, startIndex)
playNext() / playPrev()        // next otomatis saat 'ended' event
```
Audio element: **satu instance global** (buat via `new Audio()` atau `<audio>` ref di Provider). API:
```ts
const audio = new Audio();
audio.onended = () => playNext();
audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
audio.onerror = () => playNext();       // file corrupt → lompat, jangan mati
function playSong(song: Song) {
  audio.src = `/api/stream/${song.id}`;
  audio.play();
  setCurrent({ song, index });
}
function seek(t: number) { audio.currentTime = t; }
function toggleVolume() / setVolume(v: number)
```

### PlayerBar (sticky bottom)
- Kiri: artwork kecil + judul + artist (klik → FullPlayer).
- Tengah: prev / play-pause / next, seek slider (`<input type="range">`), waktu `mm:ss / mm:ss`.
- Kanan: volume slider + expand icon.
- `mm:ss` formatter: `const fmt = (ms) => ...` util kecil, jangan pakai lib.

### FullPlayer
- Overlay full-screen (backdrop blur), artwork besar, judul/artist, seek besar, controls.
- Lyrics panel: jika `lyrics` ada → render lirik, highlight baris aktif berdasarkan `currentTime` (parse LRC: `[mm:ss.xx] lirik`).
- Tombol close → kembali ke PlayerBar.

### SongList (reusable)
Props: `songs: Song[]`, `onPlayAll?`. Tabel/kartu: `#`, judul, artist, album, durasi, ikon play. Klik baris → `playSong`, klik "Play All" → `setQueueAndPlay(songs, 0)`.

### Halaman (Server Components, query langsung via `lib/db.ts`)
- `artists/page.tsx`: `SELECT id, name, (SELECT artwork FROM albums WHERE artist_id=a.id AND artwork IS NOT NULL LIMIT 1) AS artwork FROM artists a ORDER BY name` → grid.
- `artists/[id]`: `SELECT * FROM albums WHERE artist_id=? ORDER BY year` + artist name.
- `albums/[id]`: `SELECT s.*, a.name AS album, a.artwork, ar.name AS artist FROM songs s JOIN albums a ON s.album_id=a.id JOIN artists ar ON a.artist_id=ar.id WHERE s.album_id=? ORDER BY s.disc_no, s.track_no`.
- `search/page.tsx`: tiga query LIKE (`%term%`) → artists, albums, songs; render 3 section.
- `settings/page.tsx`: tombol → `POST /api/scan` (fetch, disable while running), tampilkan hasil + `last_scan_at`.

### Sidebar (nav)
- Logo + `SearchBar` di atas; daftar: Home, Artists, Albums, Songs, Settings.
- Pakai `usePathname()` untuk active state.

---

## 12. Lyrics (LRC) — detail

`lib/lyrics.ts`:
- Saat scan: untuk tiap lagu, cek file sibling dengan nama sama + ekstensi `.lrc` di folder yang sama → `INSERT lyrics (song_id, filename)`.
- Parse LRC (format: `[00:12.34] lirik`):
```ts
export interface LrcLine { timeMs: number; text: string }
export function parseLrc(raw: string): LrcLine[] {
  const out: LrcLine[] = [];
  for (const line of raw.split('\n')) {
    const m = line.match(/\[(\d{1,2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (m) out.push({ timeMs: (+m[1])*60000 + (+m[2])*1000 + +m[3].padEnd(3,'0'), text: m[4].trim() });
  }
  return out.sort((a,b) => a.timeMs - b.timeMs);
}
```
- FullPlayer: garis-garis `<p>`, aktif jika `timeMs <= currentTime < nextLine.timeMs`. Auto-scroll container ke baris aktif.

---

## 13. Persiapan / Prasyarat (sebelum mulai coding)

### Software yang harus ada
1. **Node.js 20+** — cek: `node -v`. Jika belum: install dari nodejs.org (LTS).
2. **Git** (opsional tapi disarankan) — `git init` untuk version control proyek baru.
3. **npm** — sudah termasuk Node.
4. **Folder `Music/`** — tetap di lokasi sekarang (`C:\xampp\htdocs\Music_Stream\Music` atau pindahkan ke mana saja; ditunjuk via `.env.local`). Tidak butuh server lain untuk membacanya.

### Validasi awal (jalan sebelum implementasi)
```
node -v             # ≥ 20
npm -v
mysql --version     # pastikan MySQL client ada
mysql -uroot -p -e "SHOW DATABASES;"   # cek server MySQL jalan, DB music_nest dibuat
dir "D:\MusicNest\Music"               # atau path sesuai .env.local
```

### Persiapan folder baru
```
mkdir D:\MusicNest
cd D:\MusicNest
git init
```

**Struktur akhir direktori:**
```
D:\MusicNest\                       ← project root (Next.js)
├── (semua file proyek Next.js)
├── data\                            ← artworks hasil scan (gitignore)
└── Music\                           ← folder musik (opsional di sini, lihat .env.local)
```

Folder `Music/` boleh di mana saja — termasuk tetap di `C:\xampp\htdocs\Music_Stream\Music` (kalau tidak mau pindahkan). Tinggal ubah `MUSIC_DIR` di `.env.local`. Yang penting MySQL server lokal sudah jalan dan database `music_nest` dibuat.

### Scaffold
```
cd D:\MusicNest
npx create-next-app@latest . --ts --app --tailwind --no-eslint --no-src-dir --import-alias "@/*" --use-npm
npm i mysql2 music-metadata
npm i -D tsx
```
- `mysql2` pure-JS (tidak butuh build native Windows — langsung jalan).
- `tsx` untuk menjalankan `scripts/scan.ts` langsung.
- **Pastikan MySQL server jalan** dan database `music_nest` sudah dibuat:
  ```sql
  CREATE DATABASE IF NOT EXISTS music_nest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- Tidak perlu install SQLite; tidak perlu build native module.

---

## 14. Roadmap Bertahap (urutan wajib)

| Fase | Deliverable | Kriteria selesai (periksa di browser) |
|---|---|---|
| **0. Scaffold** | create-next-app jalan, folder struktur, `.env.local`, `lib/db.ts` + `schema.sql` | `npm run dev` OK; tabel di DB `music_nest` terbentuk (cek via MySQL client) |
| **1. Scanner** | `lib/metadata.ts`, `lib/artwork.ts`, `lib/scanner.ts`, `scripts/scan.ts` | `npm run scan` isi DB: angka artist/album/song sesuai file; file lepas di root masuk "Unknown Artist"; rescan 2× → tanpa duplikat |
| **2. Core API** | `api/stream/[id]`, `api/artwork/[id]`, `lib/mime.ts`, `lib/stream.ts` | `<audio src=/api/stream/1>` play + **seek berfungsi** (klik timeline lompat benar); artwork tampil |
| **3. Browse UI** | Home, Artists, Artist detail, Albums, Album detail, Search, Sidebar | Klik: artist → album → lagu; search temukan semua; null artwork → placeholder |
| **4. Player** | `PlayerProvider`, `PlayerBar`, `FullPlayer`, `SongList`, lyrics LRC | Play dari album → antri → auto next; seek+volume jalan; FullPlayer tampil; LRC sync |
| **5. Extras (opsional)** | Playlist, favorites, file watcher, transcode FLAC→Safari, edit metadata | Fitur jalan tanpa merusak MVP |
| **6. Polish** | Theme konsisten, responsive mobile, loading states, empty states, pagination besar | Dipakai nyaman harian |

**Aturan:** verifikasi tiap fase di browser sebelum lanjut. Fase 5–6 hanya setelah 0–4 stabil. Estimasi: 0–1 ≈ 1 sesi, 2–4 ≈ 2–3 sesi, 5–6 ≈ 2 sesi. Proyek iseng — tempo fleksibel.

---

## 15. Verifikasi End-to-End (checklist uji)

Setelah implementasi, uji berurutan:

1. **Scan**: `npm run scan` → output sukses, tidak ada error untuk file corrupt.
2. **Rescan**: jalan 2× → count sama (idempotent), 0 duplikat.
3. **Streaming**: buka `/api/stream/1` langsung di browser → audio play; drag timeline → lompat benar (Range). Cek di DevTools Network: status 206 + `Content-Range`.
4. **Artwork**: buka `/api/artwork/1` → gambar tampil; album tanpa cover → placeholder.
5. **Browse**: `/artists` → grid; klik artist → album; klik album → lagu; klik lagu → play.
6. **Search**: cari kata ada di title/artist/album → 3 section benar; kata random → "No results".
7. **Player**: play album → auto next saat selesai; prev/next manual; volume; seek.
8. **Lyrics**: lagu dengan `.lrc` → lirik sync mengikuti currentTime.
9. **FLAC di Chrome**: file `.flac` play + seek (browser utama). Safari (jika ada) → fallback.
10. **File dihapus**: hapus 1 file mp3 → rescan → lagu hilang dari DB & UI.
11. **File baru**: taruh file baru di folder acak → rescan → muncul di UI.
12. **Restart dev server**: `npm run dev` lagi → data tetap (MySQL persist di server), tidak re-scan otomatis.

---

## 16. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| FLAC tidak play di Safari | §10: transcode (Fase 5) / tombol download. Chrome/FF fine. |
| ~~`better-sqlite3` build error~~ | ~~Tidak relevan — pakai `mysql2` (pure-JS, tidak ada native build)~~ |
| File corrupt / tag rusak membatalkan scan | try/catch per file di scanner; file bermasalah di-skip + dicatat count-nya. |
| Nama folder/berkas unicode/spasi (Windows) | Hindari glob; pakai `fs.readdirSync` + path absolut. Tes dengan folder ber-aksen. |
| Library besar → browse lambat | `LIMIT` + pagination di query; index di kolom (`idx_songs_title`, dll). Single-user OK sampai ribuan lagu. |
| Duplikat file | `filepath UNIQUE` + idempotent rescan (mtime). |
| Artwork besar → halaman berat | Saat scan, simpan gambar asli; jika berat, tambah `sharp` resize ke 512px (opsional, jangan sekarang). |
| Next.js cache mengganggu stream | `export const dynamic = 'force-dynamic'` + `Cache-Control: no-cache` di stream route. |
| Query `ORDER BY RAND()` lambat di library besar | Home cukup `ORDER BY RAND() LIMIT 13` (dataset kecil, ok). Jika lambat: ganti `OFFSET` acak. |

---

## 17. Prinsip Pengerjaan (ringkas)

- **Mulai dari Fase 0, jalankan berurutan.** Jangan lompat ke Fase 5 sebelum MVP stabil.
- **Tidak perlu migrasi data dari tool lain** — scanner membaca ulang `Music/` dari nol, hasil lebih benar karena prioritas tag.
- **Tanpa ORM, tanpa auth, tanpa state library, tanpa DB server tambahan** — Next.js + mysql2 + Tailwind menutup semuanya.
- Proyek iseng = evaluasi per fase, tempo sendiri. Dokumen ini jadi acuan agar tidak berantakan lagi.
