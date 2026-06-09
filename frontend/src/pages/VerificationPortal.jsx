import { motion } from "framer-motion";
import { AlertTriangle, BadgeCheck, FileText, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Page from "../components/Page.jsx";
import { SkeletonLine } from "../components/Skeleton.jsx";
import { apiUrl, verifyDocument } from "../lib/api.js";
import { rise, stagger } from "../lib/motion.js";

export default function VerificationPortal() {
  const { documentId } = useParams();
  const [lookupId, setLookupId] = useState(documentId === "demo" ? "" : documentId || "");
  const [state, setState] = useState({ loading: false, result: null, error: "" });

  useEffect(() => {
    if (documentId && documentId !== "demo") {
      runVerification(documentId);
    }
  }, [documentId]);

  async function runVerification(id) {
    setState({ loading: true, result: null, error: "" });
    try {
      const result = await verifyDocument(id);
      setState({ loading: false, result, error: "" });
    } catch (err) {
      setState({ loading: false, result: null, error: err.message });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (lookupId.trim()) runVerification(lookupId.trim());
  }

  const documentUrl = state.result?.document_url ? apiUrl(state.result.document_url) : "";

  return (
    <Page className="min-h-screen bg-ivory px-5 py-6 text-ink-950 sm:px-8">
      <div className="absolute inset-0 soft-grid opacity-55" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-950 text-white shadow-lift">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">VeriDoc</span>
              <span className="block text-xs text-ink-700/55">Verification Portal</span>
            </span>
          </Link>
        </header>

        <motion.section variants={stagger} initial="initial" animate="animate" className="mt-10 grid gap-6 xl:grid-cols-[0.46fr_1fr]">
          <motion.aside variants={rise} className="space-y-6">
            <div className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase text-bank-700">Customer verification</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink-950">Authenticity result</h1>
              <p className="mt-4 text-sm leading-6 text-ink-700/65">
                Confirm the document originated from the bank and view the official softcopy on this page.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input
                  label="Document ID"
                  value={lookupId}
                  onChange={(event) => setLookupId(event.target.value)}
                  placeholder="Paste document identifier"
                />
                <Button type="submit" icon={Search} loading={state.loading} className="w-full">
                  Verify document
                </Button>
              </form>
            </div>

            {state.loading ? <LoadingStatus /> : null}

            {state.error ? (
              <StatusCard
                icon={AlertTriangle}
                title="Document not verified"
                tone="danger"
                lines={[state.error, "Please confirm the QR code or document identifier and try again."]}
              />
            ) : null}

            {state.result ? (
              <StatusCard
                icon={BadgeCheck}
                title={state.result.verification_status}
                tone="success"
                lines={[
                  state.result.customer_name,
                  state.result.document_number,
                  state.result.document_type,
                  new Date(state.result.issue_date).toLocaleString(),
                ]}
              />
            ) : null}
          </motion.aside>

          <motion.div variants={rise} className="min-h-[38rem] rounded-[2rem] border border-ink-950/10 bg-white/78 p-3 shadow-premium backdrop-blur">
            {state.loading ? (
              <div className="h-full rounded-[1.5rem] bg-ivory p-6">
                <SkeletonLine className="h-5 w-44" />
                <SkeletonLine className="mt-6 h-[34rem] w-full rounded-3xl" />
              </div>
            ) : documentUrl ? (
              <iframe
                title="Verified document"
                src={documentUrl}
                className="h-[72vh] min-h-[38rem] w-full rounded-[1.5rem] bg-white"
              />
            ) : (
              <div className="flex h-[72vh] min-h-[38rem] items-center justify-center rounded-[1.5rem] bg-ivory">
                <div className="max-w-sm text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
                    <FileText className="h-7 w-7 text-ink-700/45" />
                  </span>
                  <h2 className="mt-5 text-xl font-semibold text-ink-950">Verified softcopy appears here</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-700/60">
                    Scan a VeriDoc QR code or enter a document ID to view the official PDF directly on this page.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.section>
      </div>
    </Page>
  );
}

function StatusCard({ icon: Icon, title, lines, tone }) {
  const styles =
    tone === "success"
      ? "border-bank-500/20 bg-bank-50 text-bank-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-[2rem] border p-5 ${styles}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">
        {lines.map((line) => (
          <p key={line} className="break-words text-sm opacity-80">
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

function LoadingStatus() {
  return (
    <div className="rounded-[2rem] border border-ink-950/10 bg-white/72 p-5">
      <SkeletonLine className="h-5 w-40" />
      <SkeletonLine className="mt-4 h-4 w-56" />
      <SkeletonLine className="mt-2 h-4 w-44" />
    </div>
  );
}
