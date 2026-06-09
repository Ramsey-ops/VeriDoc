export default function Input({ label, hint, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-800">{label}</span>
      <input
        className={`h-12 w-full rounded-2xl border border-ink-950/10 bg-white/80 px-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-700/40 focus:border-bank-500 focus:ring-4 focus:ring-bank-500/10 ${className}`}
        {...props}
      />
      {hint ? <span className="mt-2 block text-xs text-ink-700/60">{hint}</span> : null}
    </label>
  );
}
