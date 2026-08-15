# Music Nest

Aplikasi streaming musik pribadi ala Spotify/Apple Music. Spesifikasi lengkap: [`Plan_Project.md`](Plan_Project.md).

## Prasyarat

- Node.js 20+
- MySQL server lokal berjalan (database `music_nest` — dibuat otomatis via `lib/db.ts`)

## Setup

```bash
npm install
cp .env.example .env.local   # lalu sesuaikan MUSIC_DIR, MYSQL_*
npm run dev                  # http://localhost:3030
```

`.env.local` wajib berisi path folder musik (`MUSIC_DIR`) — bisa di mana saja, tidak dipindah.

## Scan

```bash
npm run scan   # (Fase 1: scripts/scan.ts — belum ada)
```

## Struktur

```
app/          halaman + route handler (Next.js App Router)
lib/          db, scanner, metadata, artwork, stream
data/         artwork hasil ekstrak (gitignored)
```
