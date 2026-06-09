import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, FileCheck2, LockKeyhole, QrCode, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";
import { rise, stagger } from "../lib/motion.js";

const features = [
  { icon: LockKeyhole, label: "Employee-only issuance" },
  { icon: QrCode, label: "QR verification portal" },
  { icon: BadgeCheck, label: "Signed document trail" },
];

export default function Landing() {
  return (
    <Page className="relative overflow-hidden bg-ivory text-ink-950">
      <div className="absolute inset-0 soft-grid opacity-70" />
      <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-bank-500/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-950 text-white shadow-lift">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold">VeriDoc</span>
            <span className="block text-xs text-ink-700/55">Union Bank of Cameroon</span>
          </span>
        </Link>
        <Link to="/login" className="hidden sm:block">
          <Button variant="secondary" icon={ArrowRight}>Login</Button>
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1fr_0.92fr]">
        <motion.div variants={stagger} initial="initial" animate="animate">
          <motion.div variants={rise} className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 bg-white/75 px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-bank-500" />
            QR Code-Based Document Authentication
          </motion.div>
          <motion.h1 variants={rise} className="mt-7 max-w-4xl text-5xl font-semibold leading-[1.02] text-ink-950 sm:text-7xl lg:text-8xl">
            VeriDoc
          </motion.h1>
          <motion.p variants={rise} className="mt-6 max-w-2xl text-lg leading-8 text-ink-700/72 sm:text-xl">
            Securely issue bank documents with embedded QR verification, cryptographic signatures, employee accountability, and a public authenticity portal.
          </motion.p>
          <motion.div variants={rise} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login">
              <Button icon={ArrowRight} className="w-full sm:w-auto">
                Start verification workflow
              </Button>
            </Link>
            <Link to="/verify/demo">
              <Button variant="secondary" icon={QrCode} className="w-full sm:w-auto">
                View portal
              </Button>
            </Link>
          </motion.div>
          <motion.div variants={rise} className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.label} className="rounded-3xl border border-ink-950/10 bg-white/72 p-4 shadow-sm backdrop-blur">
                <feature.icon className="h-5 w-5 text-bank-700" />
                <p className="mt-3 text-sm font-semibold text-ink-900">{feature.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel relative rounded-[2rem] p-4"
        >
          <div className="rounded-[1.5rem] bg-ink-950 p-5 text-white shadow-premium">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-xs uppercase text-bank-100/70">Document status</p>
                <p className="mt-2 text-2xl font-semibold">Authentic</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bank-500">
                <FileCheck2 className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {["Customer name verified", "Signature hash matched", "Original PDF available", "Audit trail recorded"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3">
                  <span className="text-sm text-white/78">{item}</span>
                  <BadgeCheck className="h-4 w-4 text-bank-100" />
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-white p-4 text-ink-950">
              <div className="aspect-[4/5] rounded-xl border border-ink-950/10 bg-gradient-to-b from-white to-bank-50 p-4">
                <div className="h-3 w-24 rounded-full bg-ink-950/80" />
                <div className="mt-7 space-y-2">
                  <div className="h-2 rounded-full bg-ink-950/12" />
                  <div className="h-2 w-10/12 rounded-full bg-ink-950/12" />
                  <div className="h-2 w-7/12 rounded-full bg-ink-950/12" />
                </div>
                <div className="mt-auto flex h-full items-end justify-end">
                  <div className="grid h-16 w-16 grid-cols-4 gap-1 rounded-lg bg-ink-950 p-2">
                    {Array.from({ length: 16 }).map((_, index) => (
                      <span key={index} className={index % 3 === 0 ? "bg-white" : "bg-white/30"} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </Page>
  );
}
