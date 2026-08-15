import { ensureSchema, pool } from '../lib/db';
import { scanLibrary } from '../lib/scanner';

process.loadEnvFile('.env.local');

async function main() {
  await ensureSchema();
  try {
    const r = await scanLibrary();
    console.log(`Scanned ${r.files} files. Artists: ${r.artists}, Albums: ${r.albums}, Songs: ${r.songs}. New: ${r.newSongs}, Updated: ${r.updated}, Removed: ${r.removed}.`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
