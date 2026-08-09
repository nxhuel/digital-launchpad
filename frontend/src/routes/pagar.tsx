import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Check,
  Copy,
  Banknote,
  ArrowLeft,
  Upload,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { apiUpload } from "../lib/api";
import type { Attachment } from "../types";

const MP_ALIAS = "ntisera0x";

export const Route = createFileRoute("/pagar")({
  head: () => ({
    meta: [
      { title: "Pagar — Clik" },
      { name: "description", content: "Completá el pago de tu proyecto." },
    ],
  }),
  component: Pagar,
});

function Pagar() {
  const navigate = useNavigate();
  const search = useSearch({ from: Route.id });
  const projectId = (search as any).projectId || null;
  const projectName = (search as any).proyecto || "tu proyecto";
  const total = (search as any).total ? Number((search as any).total) : 0;
  const cuotas = (search as any).cuotas ? Number((search as any).cuotas) : 1;
  const cuotaActual = (search as any).cuotaActual ? Number((search as any).cuotaActual) : 1;
  const montoCuota = (search as any).montoCuota ? Number((search as any).montoCuota) : 0;

  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receipt, setReceipt] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(MP_ALIAS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadReceipt = async (file: File) => {
    if (!projectId) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/projects/${projectId}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payments = await res.json();
      const pending = payments.find((p: any) => p.status === 'pendiente');
      if (pending) {
        const updated = await apiUpload<{ receipts?: Attachment[] }>(`/projects/${projectId}/payments/${pending.id}/receipt`, file);
        const last = updated.receipts?.[updated.receipts.length - 1];
        if (last) setReceipt(last);
        toast.success('Comprobante subido. ¡Gracias!');
      }
    } catch {
      toast.error('No se pudo subir el comprobante. Intentá de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const goBackAfterTransfer = () => {
    toast.success('Estamos validando tu pago. Te avisamos cuando esté confirmado.');
    if (projectId) {
      navigate({ to: `/projects/${projectId}` as any, search: { transferido: true } as any });
    } else {
      navigate({ to: '/' as any });
    }
  };

  const goBack = () => {
    if (projectId) {
      navigate({ to: `/projects/${projectId}` as any });
    } else {
      navigate({ to: '/' as any });
    }
  };

  const amountToPay = montoCuota || (total > 0 ? Math.round(total / cuotas) : 0);
  const isMaintenance = cuotas === 0;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Pagar</h1>
              <p className="text-sm text-slate-400 truncate max-w-[280px]">{projectName}</p>
            </div>
          </div>

          {/* Total a pagar */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 font-medium">Total a pagar</p>
                <p className="text-3xl font-bold mt-1">$ {amountToPay.toLocaleString('es-AR')}</p>
              </div>
              {!isMaintenance && cuotas > 1 && (
                <span className="text-sm bg-white/20 rounded-full px-3 py-1.5 font-semibold">
                  Cuota {cuotaActual} de {cuotas}
                </span>
              )}
            </div>
            {total > 0 && (
              <p className="text-sm text-white/60 mt-2">
                Total del proyecto: $ {total.toLocaleString('es-AR')}
              </p>
            )}
          </div>

          {/* Pago por alias (único método) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-700">Transferencia por alias</p>
                <p className="text-xs text-slate-400">Mercado Pago · sin costo</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 text-center border-2 border-dashed border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Alias</p>
              <p className="text-2xl font-bold text-slate-900 font-mono tracking-wide mb-3">{MP_ALIAS}</p>
              <button onClick={handleCopy}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors">
                {copied ? <><Check className="w-5 h-5" /> Copiado</> : <><Copy className="w-5 h-5" /> Copiar alias</>}
              </button>
            </div>

            <ol className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                Tocá <strong>Copiar alias</strong> y abrí la app de tu banco.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                Hacé una transferencia por el monto de arriba al alias copiado.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                Adjuntá el comprobante abajo para confirmarlo más rápido.
              </li>
            </ol>

            <button onClick={goBackAfterTransfer}
              className="block w-full text-center text-sm text-violet-600 font-medium hover:underline py-2">
              Ya transferí — Volver al proyecto
            </button>
          </div>

          {/* Upload receipt */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-slate-400" />
              <p className="text-base font-semibold text-slate-700">Comprobante (opcional)</p>
            </div>
            <p className="text-sm text-slate-400">
              Adjuntá imagen o PDF. Ayuda al equipo a verificar tu pago más rápido.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadReceipt(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-300 text-sm text-slate-500 hover:text-violet-600 font-medium transition-colors disabled:opacity-50"
            >
              {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo...</> : <><Upload className="w-5 h-5" /> Seleccionar comprobante</>}
            </button>

            {/* Preview del comprobante subido */}
            {receipt && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
                {receipt.mime?.startsWith('image/') ? (
                  <img
                    src={receipt.url}
                    alt={receipt.filename}
                    className="w-16 h-16 object-cover rounded-lg border border-emerald-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Comprobante subido
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{receipt.filename}</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-violet-600 font-medium hover:underline shrink-0"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-400 text-center pb-4">
            ¿Dudas?{' '}
            <a href="https://wa.me/5491133501445" target="_blank" rel="noopener noreferrer" className="text-violet-600 font-medium hover:underline">WhatsApp</a>
          </p>
        </div>
      </div>
    </div>
  );
}
