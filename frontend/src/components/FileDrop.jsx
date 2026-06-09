import { FileUp } from "lucide-react";

export default function FileDrop({ file, onChange }) {
  return (
    <label className="group flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-ink-950/15 bg-white/70 px-6 text-center transition hover:-translate-y-0.5 hover:border-bank-500/60 hover:bg-bank-50/50">
      <input
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-950 text-white shadow-lift transition group-hover:scale-105">
        <FileUp className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-ink-950">{file ? file.name : "Upload PDF document"}</span>
      <span className="mt-2 max-w-sm text-xs leading-5 text-ink-700/60">
        {file ? "Ready to authenticate and stamp." : "PDF files are stamped with a VeriDoc QR code before delivery."}
      </span>
    </label>
  );
}
