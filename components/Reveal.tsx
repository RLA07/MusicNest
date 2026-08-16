'use client';

/** Scroll-reveal fade+rise murni CSS. Selalu 100% terlihat tanpa resiko bug IntersectionObserver. */
export default function Reveal({
  children,
  className = '',
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  return (
    <div
      className={`reveal w-full ${className}`}
      style={{ '--d': `${delayMs}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}