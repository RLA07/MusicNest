import { ensureSchema, pool, MUSIC_DIR } from '@/lib/db';
import ScanButton from './ScanButton';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await ensureSchema();
  const [[a], [al], [s], [st]] = await Promise.all([
    pool.query<any[]>('SELECT COUNT(*) c FROM artists'),
    pool.query<any[]>('SELECT COUNT(*) c FROM albums'),
    pool.query<any[]>('SELECT COUNT(*) c FROM songs'),
    pool.query<any[]>(`SELECT value_ FROM settings WHERE key_ = 'last_scan_at'`),
  ]);
  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
        <Row label="Artists" value={a[0].c} />
        <Row label="Albums" value={al[0].c} />
        <Row label="Songs" value={s[0].c} />
        <Row label="Last scan" value={st[0]?.value_ ? new Date(st[0].value_).toLocaleString('id-ID') : 'never'} />
      </div>
      <p className="text-sm text-muted">Folder musik: <code className="text-xs">{MUSIC_DIR}</code></p>
      <ScanButton />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}