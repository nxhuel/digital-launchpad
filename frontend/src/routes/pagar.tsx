import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  QrCode,
  Banknote,
  ArrowLeft,
  Upload,
  Loader2,
} from "lucide-react";
import { apiUpload } from "../lib/api";

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
  const mpLink = (search as any).link || null;

  const [copied, setCopied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
        await apiUpload(`/projects/${projectId}/payments/${pending.id}/receipt`, file);
      }
    } finally {
      setUploading(false);
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

  const paymentMethods = [
    { id: "mercadopago", name: "Mercado Pago", icon: ExternalLink, desc: "Tarjeta, débito o efectivo", badge: "Rápido" },
    { id: "alias", name: "Alias / Transferencia", icon: Banknote, desc: "Desde tu banco con alias" },
    { id: "qr", name: "Código QR", icon: QrCode, desc: "Escaneá con Mercado Pago" },
  ];

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

          {/* Payment methods grid */}
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{m.desc}</p>
                  {m.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 mt-2 inline-block">
                      {m.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Method detail */}
          {selectedMethod === "mercadopago" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-blue-500" />
                <span className="text-base font-semibold text-slate-700">Mercado Pago</span>
              </div>
              {mpLink ? (
                <a href={mpLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base transition-colors">
                  <ExternalLink className="w-5 h-5" />
                  Ir a pagar con Mercado Pago
                </a>
              ) : (
                <p className="text-sm text-slate-400 text-center py-3">El link de pago aún no fue generado.</p>
              )}
              <button onClick={goBack}
                className="block w-full text-center text-sm text-violet-600 font-medium hover:underline py-2">
                ← Volver al proyecto
              </button>
            </div>
          )}

          {selectedMethod === "alias" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-500" />
                <span className="text-base font-semibold text-slate-700">Alias / Transferencia</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 text-center border-2 border-dashed border-slate-200">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Alias MP</p>
                <p className="text-2xl font-bold text-slate-900 font-mono tracking-wide mb-3">{MP_ALIAS}</p>
                <button onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors">
                  {copied ? <><Check className="w-5 h-5" /> Copiado</> : <><Copy className="w-5 h-5" /> Copiar alias</>}
                </button>
              </div>
              <button onClick={goBack}
                className="block w-full text-center text-sm text-violet-600 font-medium hover:underline py-2">
                Ya transferí — Volver al proyecto
              </button>
            </div>
          )}

          {selectedMethod === "qr" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-violet-500" />
                <span className="text-base font-semibold text-slate-700">Código QR</span>
              </div>
              <div className="flex justify-center">
                <div className="w-40 h-40 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-7 gap-0.5 w-36 h-36">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div key={i} className={`rounded-sm ${
                        [0,1,2,3,4,5,6,7,8,13,14,20,21,27,28,34,35,41,42,48,47,46,45,44,43,36,29,22,15].includes(i)
                          ? 'bg-slate-900'
                          : [9,10,11,12,16,23,30,37,38,39,40].includes(i) ? 'bg-violet-300' : 'bg-transparent'
                      }`} />
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={goBack}
                className="block w-full text-center text-sm text-violet-600 font-medium hover:underline py-2">
                Ya escaneé y pagué — Volver al proyecto
              </button>
            </div>
          )}

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
