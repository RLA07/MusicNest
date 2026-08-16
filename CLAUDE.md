# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Command

Next.js 16 App Router app, React 19, TypeScript, Tailwind v4, MySQL. Runs on port **3030**.

```bash
npm run dev      # dev server :3030
npm run scan     # rescan music library (tsx scripts/scan.ts)
npm run build    # production build
npm run start    # prod server :3030 (PM2: ecosystem.config.cjs)
```

No lint or test setup — `next build` is the type check gate.

Requires **MySQL** running locally (schema auto-creates on first request via `ensureSchema()`) and **ffmpeg/ffprobe** on PATH (ALAC transcoding). Copy `.env.example` → `.env.local` and point `MUSIC_DIR` at the music folder.

## Architecture

**Flow:** `scripts/scan.ts` / `POST /api/scan` → `scanLibrary()` (lib/scanner.ts) walks `MUSIC_DIR`, reads tags via `music-metadata` (lib/metadata.ts), extracts embedded art via `sharp` into `data/artworks/*.webp` (lib/artwork.ts), upserts rows into MySQL, runs in one transaction inside `lib/db.ts` `pool`. Pages are server components that query the pool directly (`force-dynamic`); mutations go through route handlers under `app/api/`.

**Audio pipeline:** browser `<audio>` plays `/api/stream/[id]` (Range-request support). `playablePathFor()` (lib/transcode.ts) returns the original file, or transparently transcodes ALAC `m4a/m4b/m4p` → AAC 256k once via ffmpeg, cached at `data/transcodes/<songId>.m4a`. Playback state (queue, shuffle, repeat, keyboard shortcuts) lives in client context `components/PlayerProvider.tsx` — all play buttons call `playSong`/`setQueueAndPlay`.

**Search:** `lib/search.ts` does 2-stage — MySQL FULLTEXT `MATCH...AGAINST` in BOOLEAN MODE with scored relevance, falling back to `LIKE` when FTS misses or query < 3 chars. `GET /api/search` returns artists/albums/songs/topResult; `GET /api/search-songs` returns songs only.

**DB schema:** `lib/schema.sql` (artists → albums → songs, plus lyrics/favorites/playlists/settings). `ensureSchema()` runs `CREATE TABLE IF NOT EXISTS` each boot, then a list of idempotent `ALTER` migrations wrapped in try/catch — add new columns as `ALTER ...` entries there, not in schema.sql.

**Artist metadata enrichment:** `lib/artistMetadata.ts` fetches avatar + bio from Deezer → iTunes → Wikipedia, caches into `data/artworks/artist_<id>.jpg` and `artists` row.

## Conventions

- Code comments are in **Indonesian** — keep new comments in the same language.
- Relative-import aliases: `@/` maps to project root. Server code imports `@/lib/...`; client components import `@/components/...` and `@/lib/types`.
- Audio file paths stored absolute in `songs.filepath`; artwork stored as filename only and served via `/api/artwork/<filename>` (path-traversal guarded).
- `ponytail:` comments mark deliberate shortcuts (single-transaction scan, blocking execSync ffmpeg) — read them before "optimizing".
- The app is a single-user personal streamer; no auth, `MYSQL_USER` root default, LAN access enabled via `allowedDevOrigins`.