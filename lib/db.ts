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

// alias untuk route handler (mysql2 promise style: pool.query, BUKAN prepare)
export const db = pool;

// Bootstrap schema (jalan sekali saat startup)
let bootstrapped = false;
export async function ensureSchema() {
  if (bootstrapped) return;
  const sql = fs.readFileSync(path.join(process.cwd(), 'lib', 'schema.sql'), 'utf8');
  // buang baris komentar & kosong DULU, baru split per-statement
  const stmts = sql
    .split('\n').filter(l => l.trim() && !l.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
  const conn = await pool.getConnection();
  try {
    for (const s of stmts) await conn.query(s);
  } finally {
    conn.release();
  }
  bootstrapped = true;
}
// ponytail: bootstrap schema sekali saja; cukup untuk personal project. Untuk multi-instance ganti dengan migration tool.
