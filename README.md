<h1 align="center">
  🎵 MusicNest
</h1>

<p align="center">
  <strong>Pemutar musik pribadi berbasis web, self-hosted, dan berjalan di jaringan lokal (LAN).</strong><br/>
  Dirancang untuk mereka yang ingin menikmati koleksi musik lokal dengan pengalaman se-modern Spotify atau YouTube Music.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?logo=nextdotjs" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/MySQL-8+-4479A1?logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Platform-Windows-0078D4?logo=windows" alt="Windows"/>
</p>

---

## Fitur Utama

### Pemutar Musik

- Kontrol Play / Pause / Next / Prev
- **Player bar** persisten di bawah layar, tersedia di semua halaman
- **Full Player** mode layar penuh, bisa dibuka dengan klik artwork
- **Vinyl spin** — album art berputar seperti piringan hitam saat lagu diputar
- **Seek bar** interaktif dengan dukungan klik & drag
- **Kontrol volume** termasuk tombol mute
- **Keyboard shortcuts**: `Space` (putar/jeda), `M` (mute), `Esc` (tutup Full Player)

### Mode Pemutaran

- **Shuffle** — mengacak urutan lagu dalam antrean aktif
- **Shuffle All** — memuat dan memutarkan seluruh koleksi perpustakaan secara acak, lintas artis dan album
- **Repeat Off / Repeat All / Repeat One** — tiga mode, siklus putar

### Manajemen Perpustakaan

- **Pemindai Otomatis** (`/settings`) — mendeteksi semua file audio secara rekursif di `MUSIC_DIR`
- **Rescan idempotent** — hanya memproses file yang berubah (berdasarkan `mtime` dan ukuran), tidak memproses ulang file yang sama
- **Penghapusan otomatis** — lagu yang filenya sudah dihapus dari disk akan otomatis dihapus dari database
- **Format didukung:** `.mp3` · `.flac` · `.m4a` · `.m4b` · `.aac` · `.ogg` · `.opus` · `.wav` · `.wma`

### Pencarian

- **Pencarian real-time** di seluruh perpustakaan (lagu, artis, album), tanpa perlu tekan Enter
- **Full-Text Search** MySQL dengan pembobotan skor relevansi
- **Fuzzy fallback** ke `LIKE` otomatis jika FTS tidak menemukan hasil atau query < 3 karakter
- **Top Result** — menampilkan hasil paling relevan di bagian atas

### Halaman & Navigasi

| Halaman                             | Deskripsi                                          |
| ----------------------------------- | -------------------------------------------------- |
| **Beranda**                         | Hero banner album acak, daftar album, lagu terbaru |
| **Artis** (`/artists`)              | Grid semua artis                                   |
| **Halaman Artis** (`/artists/[id]`) | Foto, biografi, dan daftar album artis             |
| **Album** (`/albums`)               | Grid semua album                                   |
| **Halaman Album** (`/albums/[id]`)  | Sampul, daftar lagu, dan info album                |
| **Favorit** (`/favorites`)          | Kumpulan lagu yang telah di-like                   |
| **Playlist** (`/playlists`)         | Buat dan kelola playlist kustom                    |
| **Pencarian** (`/search`)           | Hasil pencarian terkelompok (artis, album, lagu)   |
| **Pengaturan** (`/settings`)        | Statistik perpustakaan & tombol scan               |

### Metadata Artis Otomatis

Saat halaman artis dibuka pertama kali, MusicNest otomatis mengambil dan menyimpan:

- **Foto artis**: Deezer API → iTunes Search API → fallback ke cover album lokal
- **Biografi artis**: Wikipedia Bahasa Indonesia → Wikipedia Bahasa Inggris
- Mendukung **query multi-variasi** untuk artis kolaborasi / duo

### Full Player (Layar Penuh)

- **3 slide geser** (swipe kiri/kanan atau panah desktop):
  1. **Cover** — vinyl art berputar
  2. **Lirik** — lirik `.lrc` sinkron dengan waktu, auto-scroll
  3. **Metadata** — informasi teknis file (format, bitrate, sample rate, ukuran)
- **Tombol Favorit**, **Tambah ke Playlist**, **Shuffle**, dan **Repeat** langsung di Full Player
- **Latar belakang blur dinamis** berdasarkan warna artwork lagu aktif

### Responsif & Aksesibel

- **Mobile-first** dengan bottom navigation bar untuk layar kecil
- **Desktop sidebar** dengan navigasi dan tombol aksi cepat
- Mendukung **`prefers-reduced-motion`** — semua animasi dimatikan jika pengguna memilih ini
- **`focus-visible`** ring untuk navigasi keyboard aksesibel

### Teknis & Infrastruktur

- **Streaming audio** dengan dukungan HTTP `Range` requests (seek tanpa buffering ulang penuh)
- **Transcode otomatis** file ALAC (`.m4a`) ke AAC 256kbps via `ffmpeg`, di-cache di `data/transcodes/`
- **PM2-ready** untuk menjalankan aplikasi sebagai background service di Windows
- **Akses LAN** — bisa diakses dari perangkat lain di jaringan yang sama

---

## Screenshots

<div align="center">
  <img src="public/screenshots/home.avif" alt="Home"/>
  <p>Beranda</p> <br>
  <img src="public/screenshots/full-player.avif" alt="Full Player"/>
  <p>Full Player</p> <br>
  <img src="public/screenshots/Detail_Artist.avif" alt="Detail Artist"/>
  <p>Detail Artist</p> <br>
  <img src="public/screenshots/Detail_Album.avif" alt="Detail Album"/>
  <p>Detail Album</p> <br>
  <img src="public/screenshots/search.avif" alt="Search"/>
  <p>Search</p>
</div>

---

## Persyaratan Sistem

| Komponen    | Minimum                             | Catatan                                                                  |
| ----------- | ----------------------------------- | ------------------------------------------------------------------------ |
| **OS**      | Windows 10/11                       | Dioptimalkan untuk Windows; Linux belum diuji                            |
| **Node.js** | v20 LTS+                            | [nodejs.org](https://nodejs.org)                                         |
| **MySQL**   | 8.0+                                | Atau MariaDB 10.5+                                                       |
| **ffmpeg**  | Terbaru                             | Wajib untuk streaming ALAC & transcode. [ffmpeg.org](https://ffmpeg.org) |
| **Browser** | Chrome 90+ / Firefox 90+ / Edge 90+ | Browser modern dengan dukungan `<audio>` HTML5                           |

> `ffmpeg` dan `ffprobe` harus tersedia di **PATH** sistem. Verifikasi dengan `ffmpeg -version` di terminal.

---

## Instalasi & Setup

### 1. Clone Repositori

```bash
git clone https://github.com/RLA07/MusicNest.git
cd musicnest
```

### 2. Instal Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment

Salin file contoh, sesuaikan:

```bash
cp .env.example .env.local
```

Buka `.env.local` dan isi:

```env
MUSIC_DIR=D:\Music
DATA_DIR=./data
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password_kamu
MYSQL_DATABASE=music_nest
```

### 4. Buat Database MySQL

Skema dibuat otomatis saat pertama kali dijalankan. Pastikan database kosong sudah ada:

```sql
CREATE DATABASE music_nest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Build & Jalankan

```bash
npm run build
npm start
```

Aplikasi berjalan di **http://localhost:3030**.

---

## Menjalankan Sebagai Background Service (PM2)

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
```

| Perintah                | Fungsi                 |
| ----------------------- | ---------------------- |
| `pm2 status`            | Cek status             |
| `pm2 logs musicnest`    | Lihat log real-time    |
| `pm2 restart musicnest` | Restart setelah update |
| `pm2 stop musicnest`    | Hentikan server        |

---

## Memindai Perpustakaan

Buka **http://localhost:3030/settings** → klik **"Scan Perpustakaan"**.

MusicNest akan:

1. Membaca seluruh file audio rekursif dari `MUSIC_DIR`
2. Mengekstrak metadata dari tag ID3 / Vorbis
3. Mengekstrak dan menyimpan artwork album
4. Menyimpan semua data ke MySQL

> Scan ulang aman kapan saja — hanya file baru atau yang berubah yang diproses.

Alternatif via CLI:

```bash
npm run scan
```

---

## Lirik Sinkron (.lrc)

Tempatkan `.lrc` di folder yang sama dengan file audio, nama file harus sama:

```
Music/Artist/Album/01 - Lagu Indah.mp3
Music/Artist/Album/01 - Lagu Indah.lrc
```

Jalankan scan ulang, buka Full Player → slide **Lirik**.

---

## Struktur Folder

```
musicnest/
├── app/                    # Next.js App Router (halaman & API)
│   ├── api/                # Routes: artwork, favorite, lyrics, playlist, scan, search, song, stream
│   ├── albums/             # Daftar & detail album
│   ├── artists/            # Daftar & detail artis
│   ├── favorites/          # Lagu favorit
│   ├── playlists/          # Daftar & detail playlist
│   ├── search/             # Hasil pencarian
│   ├── settings/           # Pengaturan & scan
│   └── page.tsx            # Beranda
├── components/             # React (PlayerProvider, PlayerBar, FullPlayer, Sidebar, MobileNav, SearchBar, SongList)
├── lib/                    # Utilities (db, schema, scanner, metadata, transcode, search, lyrics, artwork)
├── data/                   # Runtime: artworks/ → transcodes/
├── .env.example
├── ecosystem.config.cjs
└── package.json
```

---

## Skema Database

```
artists, albums, songs, lyrics, favorites, playlists, playlist_songs, settings
```

---

## Keyboard Shortcuts

| Shortcut | Aksi                       |
| -------- | -------------------------- |
| `Space`  | Putar / Jeda               |
| `M`      | Mute / Unmute              |
| `Esc`    | Tutup Full Player          |
| `← / →`  | Geser slide di Full Player |

---

## Keterbatasan yang Diketahui

| Keterbatasan               | Keterangan                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single-user**            | Tidak ada autentikasi. Siapapun yang bisa mengakses IP:port bisa pakai.                                                                      |
| **Transcode blocking**     | Transcode ALAC dilakukan sinkron (`execSync`). Jika beberapa pengguna meminta lagu ALAC yang belum di-cache bersamaan, server akan melambat. |
| **Tidak ada HTTPS bawaan** | HTTP saja. Untuk HTTPS, pasang reverse proxy (Nginx/Caddy) di depan.                                                                         |
| **Windows-first**          | Dioptimalkan dan diuji di Windows. Linux/macOS belum diverifikasi.                                                                           |
| **Shuffle All load**       | Memuat hingga 500 lagu sekalih ke memori browser.                                                                                            |
| **Metadata artis**         | Bergantung pada API eksternal (Deezer, iTunes, Wikipedia) yang butuh koneksi internet.                                                       |

---

## Stack Teknologi

| Komponen            | Teknologi                                                                    |
| ------------------- | ---------------------------------------------------------------------------- |
| **Framework**       | [Next.js 16](https://nextjs.org/) (App Router)                               |
| **UI**              | [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) |
| **Database**        | MySQL 8+ via `mysql2`                                                        |
| **Metadata Audio**  | `music-metadata`                                                             |
| **Transcode**       | `ffmpeg` + `ffprobe` via `child_process.execSync`                            |
| **Pencarian**       | MySQL FULLTEXT Boolean Mode + Fuzzy `LIKE` fallback                          |
| **Optimasi Gambar** | `sharp`                                                                      |
| **Process Manager** | PM2                                                                          |
| **Font**            | DM Sans                                                                      |

---

## Lisensi

Proyek ini bersifat pribadi. Gunakan hanya untuk koleksi musik yang kamu miliki secara legal.
