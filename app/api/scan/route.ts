import { NextRequest } from 'next/server';
import { ensureSchema, pool } from '@/lib/db';
import { scanLibrary } from '@/lib/scanner';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  await ensureSchema();
  try {
    const result = await scanLibrary();
    return Response.json(result);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}