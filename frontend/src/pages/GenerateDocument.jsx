import { motion } from "framer-motion";
import { CheckCircle2, Download, FileSignature, QrCode, ShieldCheck } from "lucide-react";
import { useState } from "react";
import AppShell from "../components/AppShell.jsx";
import Button from "../components/Button.jsx";
import FileDrop from "../components/FileDrop.jsx";
import Input from "../components/Input.jsx";
import Page from "../components/Page.jsx";
import Select from "../components/Select.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { downloadGeneratedDocument, generateDocument } from "../lib/api.js";
import { rise, stagger } from "../lib/motion.js";

const documentTypes = [
  "Bank Statement",
  "Transaction Receipt",
  "Loan Approval Letter",
  "Financial Certificate",
];

export default function GenerateDocument() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    customer_name: "",
    document_number: "",
    document_type: documentTypes[0],
    expiration_date: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Upload a PDF before generating the verified document.");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    formData.append("uploaded_file", file);

    setLoading(true);
    try {
      const response = await generateDocument({ token, formData });
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!result?.download_url) return;

    setError("");
    setDownloading(true);
    try {
      await downloadGeneratedDocument({
        token,
        path: result.download_url,
        filename: `veridoc_${result.document_number}.pdf`,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Page>
      <AppShell
        eyebrow="Employee workflow"
        title="Generate verified document"
        subtitle="Upload a PDF, stamp it with a VeriDoc QR code, and deliver the authenticated copy."
      >
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
          <motion.form variants={rise} onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-5 sm:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Customer name"
                placeholder="Customer full name"
                value={form.customer_name}
                onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
                required
              />
              <Input
                label="Document number"
                placeholder="UBC-2026-0001"
                value={form.document_number}
                onChange={(event) => setForm({ ...form, document_number: event.target.value })}
                required
              />
              <Select
                label="Document type"
                value={form.document_type}
                onChange={(event) => setForm({ ...form, document_type: event.target.value })}
              >
                {documentTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </Select>
              <Input
                label="QR expiration"
                type="datetime-local"
                value={form.expiration_date}
                onChange={(event) => setForm({ ...form, expiration_date: event.target.value })}
                hint="Optional"
              />
            </div>

            <div className="mt-6">
              <FileDrop file={file} onChange={setFile} />
            </div>

            {error ? <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-ink-700/65">
                <ShieldCheck className="h-4 w-4 text-bank-700" />
                QR code and signature are generated on submission.
              </div>
              <Button type="submit" icon={FileSignature} loading={loading}>
                Generate PDF
              </Button>
            </div>
          </motion.form>

          <motion.aside variants={rise} className="space-y-6">
            <div className="rounded-[2rem] bg-ink-950 p-6 text-white shadow-premium">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-bank-100/65">Output</p>
                  <h2 className="mt-2 text-2xl font-semibold">Verified PDF</h2>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bank-500">
                  <QrCode className="h-6 w-6" />
                </span>
              </div>

              <div className="mt-7 rounded-3xl bg-white p-4 text-ink-950">
                {result ? (
                  <div>
                    <div className="flex items-center gap-3 rounded-2xl bg-bank-50 px-4 py-3 text-bank-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-semibold">Document generated</span>
                    </div>
                    <dl className="mt-5 space-y-4 text-sm">
                      <Info label="Customer" value={result.customer_name} />
                      <Info label="Document no." value={result.document_number} />
                      <Info label="Document type" value={result.document_type} />
                      <Info label="Document ID" value={result.document_id} />
                    </dl>
                    <Button icon={Download} className="mt-6 w-full" loading={downloading} onClick={handleDownload}>
                      Download stamped PDF
                    </Button>
                  </div>
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-ink-950/12 bg-ivory text-center">
                    <div>
                      <QrCode className="mx-auto h-8 w-8 text-ink-700/35" />
                      <p className="mt-3 text-sm font-semibold text-ink-900">Awaiting document</p>
                      <p className="mt-1 text-xs text-ink-700/55">The stamped output appears here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      </AppShell>
    </Page>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-950/10 pb-3 last:border-0">
      <dt className="text-ink-700/55">{label}</dt>
      <dd className="max-w-[12rem] break-words text-right font-semibold text-ink-950">{value}</dd>
    </div>
  );
}
