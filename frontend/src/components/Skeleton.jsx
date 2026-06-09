export function SkeletonLine({ className = "" }) {
  return <div className={`skeleton rounded-full ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-ink-950/10 bg-white/70 p-5">
      <SkeletonLine className="h-4 w-28" />
      <SkeletonLine className="mt-6 h-8 w-20" />
    </div>
  );
}
