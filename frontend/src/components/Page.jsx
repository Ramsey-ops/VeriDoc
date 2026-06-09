import { motion } from "framer-motion";
import { pageTransition } from "../lib/motion.js";

export default function Page({ children, className = "" }) {
  return (
    <motion.main {...pageTransition} className={`min-h-screen ${className}`}>
      {children}
    </motion.main>
  );
}
