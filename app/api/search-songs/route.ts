import { NextRequest } from 'next/server';
import { ensureSchema } from '@/lib/db';
import { executeSearch } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) return Response.json([]);
  await ensureSchema();
  const data = await executeSearch(q, 20);
  return Response.json(data.songs);
}