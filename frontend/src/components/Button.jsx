import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-ink-950 text-white shadow-lift hover:-translate-y-0.5 hover:bg-ink-900",
  secondary: "border border-ink-950/10 bg-white/70 text-ink-900 hover:-translate-y-0.5 hover:bg-white",
  subtle: "text-ink-700 hover:bg-ink-950/[0.04]",
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  loading = false,
  icon: Icon,
  ...props
}) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </button>
  );
}
