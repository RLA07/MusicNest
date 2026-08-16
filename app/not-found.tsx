import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-5xl font-bold text-accent">404</h1>
      <p className="mt-3 text-muted">Halaman tidak ditemukan.</p>
      <Link href="/" className="inline-block mt-6 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent hover:bg-accent-hover transition-colors cursor-pointer">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
