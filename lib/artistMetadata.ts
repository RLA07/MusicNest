import fs from 'fs';
import path from 'path';
import { DATA_DIR, pool } from '@/lib/db';

interface DeezerArtistSearchResponse {
  data?: Array<{
    id: number;
    name: string;
    picture_big?: string;
    picture_xl?: string;
  }>;
}

interface ITunesSearchResponse {
  results?: Array<{
    artistName?: string;
    artworkUrl100?: string;
    primaryGenreName?: string;
  }>;
}

interface WikipediaSummaryResponse {
  type?: string;
  title?: string;
  extract?: string;
}

/**
 * Menghasilkan beberapa variasi kata kunci untuk pencarian artis kolaborasi / duo / feat.
 * Contoh: "Acha Septriasa & Irwansyah" -> 
 * ["Acha Septriasa & Irwansyah", "Irwansyah & Acha Septriasa", "Acha Septriasa", "Irwansyah"]
 */
function getArtistSearchQueries(name: string): string[] {
  const queries: string[] = [name.trim()];
  const separators = [' & ', ', ', ' feat. ', ' ft. ', ' feat ', ' ft ', ' and ', ' x '];

  for (const sep of separators) {
    if (name.toLowerCase().includes(sep.trim())) {
      const parts = name.split(new RegExp(sep, 'i')).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        // Variasi balikan urutan nama (misal "Irwansyah & Acha Septriasa")
        const swapped = [...parts].reverse().join(' & ');
        if (!queries.includes(swapped)) queries.push(swapped);

        // Variasi artis individual ("Acha Septriasa", "Irwansyah")
        for (const p of parts) {
          if (!queries.includes(p)) queries.push(p);
        }
      }
    }
  }

  return queries;
}

/**
 * Fetch & Cache metadata dengan Smart Multi-Query Expansion & Multi-Source Fallbacks:
 * 1. Avatar: Deezer API -> iTunes Search API -> Local Album Cover
 * 2. Biografi: Wikipedia ID -> Wikipedia EN
 */
export async function getOrFetchArtistMetadata(
  artistId: number,
  artistName: string
): Promise<{ avatar: string | null; bio: string | null }> {
  try {
    // 1. Cek data yang sudah tersimpan di database
    const [rows] = await pool.query<any[]>(
      'SELECT avatar, bio FROM artists WHERE id = ?',
      [artistId]
    );
    const existing = rows[0] || {};
    let avatar: string | null = existing.avatar || null;
    let bio: string | null = existing.bio || null;

    let updatedNeeded = false;
    const searchQueries = getArtistSearchQueries(artistName);

    // 2. Fetch Avatar (Coba Deezer dulu per variasi nama, lalu iTunes)
    if (!avatar) {
      // 2a. Deezer API Loop (Coba variasi nama)
      for (const q of searchQueries) {
        if (avatar) break;
        try {
          const deezerUrl = `https://api.deezer.com/search/artist?q=${encodeURIComponent(q)}`;
          const res = await fetch(deezerUrl, {
            headers: { 'User-Agent': 'MusicNest/1.0' },
            next: { revalidate: 86400 },
          });

          if (res.ok) {
            const json: DeezerArtistSearchResponse = await res.json();
            const match = json.data?.find(
              (a) => a.name.toLowerCase() === q.toLowerCase()
            ) || json.data?.[0];

            const imageUrl = match?.picture_xl || match?.picture_big;
            if (imageUrl) {
              const imgRes = await fetch(imageUrl);
              if (imgRes.ok) {
                const buffer = Buffer.from(await imgRes.arrayBuffer());
                const filename = `artist_${artistId}.jpg`;
                const filePath = path.join(DATA_DIR, 'artworks', filename);

                await fs.promises.writeFile(filePath, buffer);
                avatar = filename;
                updatedNeeded = true;
                break;
              }
            }
          }
        } catch (err) {
          console.error(`Deezer fetch failed for ${q}:`, err);
        }
      }

      // 2b. iTunes API Loop Fallback (Jika Deezer tidak menemukan gambar)
      if (!avatar) {
        for (const q of searchQueries) {
          if (avatar) break;
          try {
            const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=3`;
            const itunesRes = await fetch(itunesUrl, {
              headers: { 'User-Agent': 'MusicNest/1.0' },
              next: { revalidate: 86400 },
            });

            if (itunesRes.ok) {
              const json: ITunesSearchResponse = await itunesRes.json();
              const match = json.results?.find(
                (r) => r.artistName?.toLowerCase().includes(q.toLowerCase())
              ) || json.results?.[0];

              if (match?.artworkUrl100) {
                const hdArtworkUrl = match.artworkUrl100.replace('100x100bb', '600x600bb');
                const imgRes = await fetch(hdArtworkUrl);
                if (imgRes.ok) {
                  const buffer = Buffer.from(await imgRes.arrayBuffer());
                  const filename = `artist_${artistId}.jpg`;
                  const filePath = path.join(DATA_DIR, 'artworks', filename);

                  await fs.promises.writeFile(filePath, buffer);
                  avatar = filename;
                  updatedNeeded = true;
                  break;
                }
              }
            }
          } catch (err) {
            console.error(`iTunes fallback fetch failed for ${q}:`, err);
          }
        }
      }
    }

    // 3. Fetch Biografi (Wikipedia ID -> Wikipedia EN per variasi nama)
    if (!bio) {
      for (const q of searchQueries) {
        if (bio) break;
        try {
          // Wikipedia ID
          let wikiUrl = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
          let wikiRes = await fetch(wikiUrl, {
            headers: { 'User-Agent': 'MusicNest/1.0' },
            next: { revalidate: 86400 },
          });

          // Wikipedia EN fallback
          if (!wikiRes.ok) {
            wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
            wikiRes = await fetch(wikiUrl, {
              headers: { 'User-Agent': 'MusicNest/1.0' },
              next: { revalidate: 86400 },
            });
          }

          if (wikiRes.ok) {
            const wikiData: WikipediaSummaryResponse = await wikiRes.json();
            if (wikiData.extract && wikiData.type === 'standard') {
              bio = wikiData.extract;
              updatedNeeded = true;
              break;
            }
          }
        } catch (err) {
          console.error(`Wikipedia bio fetch failed for ${q}:`, err);
        }
      }
    }

    // 4. Update Database jika ada metadata baru
    if (updatedNeeded) {
      await pool.query(
        'UPDATE artists SET avatar = COALESCE(?, avatar), bio = COALESCE(?, bio) WHERE id = ?',
        [avatar, bio, artistId]
      );
    }

    return { avatar, bio };
  } catch (err) {
    console.error('getOrFetchArtistMetadata error:', err);
    return { avatar: null, bio: null };
  }
}
