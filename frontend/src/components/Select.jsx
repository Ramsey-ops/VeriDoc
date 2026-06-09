export default function Select({ label, children, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-800">{label}</span>
      <select
        className={`h-12 w-full rounded-2xl border border-ink-950/10 bg-white/80 px-4 text-sm text-ink-950 outline-none transition focus:border-bank-500 focus:ring-4 focus:ring-bank-500/10 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
