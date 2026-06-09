import { motion } from "framer-motion";
import { rise } from "../lib/motion.js";

export default function MetricCard({ label, value, icon: Icon, tone = "dark" }) {
  const tones = {
    dark: "bg-ink-950 text-white",
    green: "bg-bank-600 text-white",
    light: "bg-white/80 text-ink-950",
  };

  return (
    <motion.div variants={rise} className={`rounded-3xl p-5 shadow-lift ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium opacity-70">{label}</p>
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/14">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-5 text-3xl font-semibold">{value ?? "0"}</p>
    </motion.div>
  );
}
