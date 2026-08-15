import { pool } from './db';

/** Set id lagu yang di-favorite. */
export async function getFavIds(): Promise<Set<number>> {
  const [rows] = await pool.query<any[]>('SELECT song_id FROM favorites');
  return new Set(rows.map((r) => r.song_id));
}
