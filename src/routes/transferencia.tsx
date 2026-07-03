import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, CreditCard, Globe, Database, Bot, Check, Copy, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, whatsappLink } from "@/config/site";

export const Route = createFileRoute("/transferencia")({
  head: () => ({
    meta: [
      { title: "Transferencia — Clik" },
      { name: "description", content: "Pago vía Mercado Pago. Seguí estos pasos para completar tu pago." },
    ],
  }),
  component: Transferencia,
});

const ALIAS = "ntisera0x";
const CVU = "00000031001234567890";

const services = [
  { id: "tarjetas", icon: CreditCard, label: "Tarjetas Digitales", price: "Desde $25.000 ARS", color: "rose" },
  { id: "web", icon: Globe, label: "Página Web", price: "Desde $80.000 ARS", color: "violet" },
  { id: "sistema", icon: Database, label: "Sistema a Medida", price: "Desde $350.000 ARS", color: "blue" },
  { id: "ia", icon: Bot, label: "Sistema con IA", price: "A consultar", color: "emerald" },
];

function Transferencia() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const copyAlias = () => {
    navigator.clipboard.writeText(ALIAS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-2 w-2 bg-slate-900" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Clik</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  s <= step
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                {s < step ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s}
              </div>
              {s < 3 && (
                <div className={`h-px w-12 sm:w-16 transition-colors ${s < step ? "bg-violet-600" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[280px]">
          {step === 1 && (
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Paso 1: Contactanos</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Escribinos por WhatsApp para contarnos qué necesitás. Te vamos a indicar el paso a seguir y el
                  monto correspondiente.
                </p>
              </div>
              <Button
                asChild
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 h-12"
              >
                <a
                  href={whatsappLink("Hola! Quiero hacer una transferencia. ¿Cuál es el siguiente paso?")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Escribir por WhatsApp
                </a>
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Paso 2: Elegí tu servicio</h2>
                <p className="text-slate-500 text-sm">Seleccioná lo que querés y el precio se ajusta automáticamente.</p>
              </div>
              <div className="space-y-2">
                {services.map((s) => {
                  const Icon = s.icon;
                  const isSelected = selectedService === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s.id)}
                      className={`w-full flex items-center gap-4 p-4 border-2 transition-all text-left ${
                        isSelected
                          ? "border-violet-600 bg-violet-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`h-10 w-10 flex items-center justify-center ${
                        isSelected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-sm">{s.label}</div>
                        <div className="text-xs font-semibold text-slate-500">{s.price}</div>
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-violet-600 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Paso 3: Pagá con Mercado Pago</h2>
                <p className="text-slate-500 text-sm">Usá el alias o transferí mediante el QR.</p>
              </div>

              <div className="border-2 border-slate-200 p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Alias
                </div>
                <div className="font-bold text-lg text-slate-900 mb-3 font-mono tracking-wide">{ALIAS}</div>
                <button
                  onClick={copyAlias}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors"
                >
                  {copied ? (
                    <><Check className="h-4 w-4" /> Copiado</>
                  ) : (
                    <><Copy className="h-4 w-4" /> Copiar alias</>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-32 h-32 bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="grid grid-cols-5 gap-0.5 mb-2">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? "bg-slate-900" : "bg-slate-200"}`} />
                      ))}
                    </div>
                    <span className="text-[8px] font-mono font-bold text-slate-400">{ALIAS}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Anterior
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors"
            >
              Siguiente <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <a href={whatsappLink(`Ya transferí el pago. Mi servicio es: ${selectedService || "sin definir"}.`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Avise que transferí
              </a>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
