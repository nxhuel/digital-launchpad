import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  MessageCircle,
  Shield,
  Lock,
  ArrowLeft,
  Smartphone,
  Banknote,
  ExternalLink,
  Copy,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, whatsappLink, ROUTES } from "@/config/site";

const MP_ALIAS = "ntisera0x";

export const Route = createFileRoute("/pagar")({
  head: () => ({
    meta: [
      { title: "Pagar — Clik Agencia Digital" },
      {
        name: "description",
        content:
          "Completá el pago de tu proyecto de forma segura a través de Mercado Pago, QR o transferencia.",
      },
    ],
  }),
  component: Pagar,
});

const paymentMethods = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    icon: ExternalLink,
    desc: "Pagá con tarjeta de crédito, débito o efectivo de forma segura.",
    badge: "Recomendado",
  },
  {
    id: "qr",
    name: "Código QR",
    icon: QrCode,
    desc: "Escaneá el QR con la app de Mercado Pago desde tu celular.",
  },
  {
    id: "alias",
    name: "Alias / Transferencia",
    icon: Banknote,
    desc: "Transferí directamente desde tu banco usando nuestro alias.",
  },
];

function Pagar() {
  const search = useSearch({ from: Route.id });
  const projectName = (search as any).proyecto || "tu proyecto";
  const amount = (search as any).monto || null;
  const paymentLink = (search as any).link || null;

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MP_ALIAS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main>
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 -z-10" />

        <div className="max-w-2xl mx-auto px-6">
          <Link
            to={ROUTES.home}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </Link>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <div className="h-2 bg-gradient-to-r from-primary to-indigo-500" />

            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-emerald-500" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  Tu proyecto está listo
                </h1>
                <p className="text-slate-500">
                  Completá el pago para recibir la entrega final de{" "}
                  <span className="font-semibold text-slate-700">{projectName}</span>.
                </p>
              </div>

              {amount && (
                <div className="bg-slate-50 rounded-2xl p-6 text-center mb-8 border border-slate-100">
                  <div className="text-sm font-medium text-slate-500 mb-1">Total a pagar</div>
                  <div className="text-4xl md:text-5xl font-display font-bold text-slate-900">
                    {amount}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">Pago único</div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Elegí cómo pagar</h2>
                <div className="space-y-3">
                  {paymentMethods.map((m) => {
                    const Icon = m.icon;
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
                            }`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{m.name}</span>
                              {m.badge && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {m.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{m.desc}</p>
                          </div>
                          <div
                            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-slate-200"
                            }`}
                          >
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMethod === "mercadopago" && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      Pago 100% seguro via Mercado Pago
                    </span>
                  </div>

                  {paymentLink ? (
                    <Button
                      variant="default"
                      size="lg"
                      asChild
                      className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 h-14"
                    >
                      <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-5 w-5" /> Ir a pagar con Mercado Pago
                      </a>
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="default"
                        size="lg"
                        asChild
                        className="w-full rounded-xl bg-primary hover:bg-indigo-700 h-14"
                      >
                        <a
                          href={whatsappLink(
                            "Hola! Quiero recibir el link de pago de Mercado Pago para mi proyecto.",
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="mr-2 h-5 w-5" /> Solicitar link por WhatsApp
                        </a>
                      </Button>
                      <p className="text-xs text-slate-400 text-center">
                        Tambien podés pagar con nuestro alias:{" "}
                        <button
                          onClick={handleCopy}
                          className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {MP_ALIAS} <Copy className="h-3 w-3" />
                        </button>
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 text-center mt-3">
                    Aceptamos tarjetas de credito, debito y efectivo (Rapipago, Pago Facil).
                  </p>
                </div>
              )}

              {selectedMethod === "qr" && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
                  <div className="text-center mb-4">
                    <div className="w-48 h-48 mx-auto bg-white rounded-2xl border-2 border-slate-200 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-7 gap-0.5 w-40 h-40">
                          {Array.from({ length: 49 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-sm ${
                                [0, 1, 2, 3, 4, 5, 6, 7, 8, 13, 14, 20, 21, 27, 28, 34, 35, 41, 42, 48, 47, 46, 45, 44, 43, 36, 29, 22, 15].includes(i)
                                  ? "bg-slate-900"
                                  : [9, 10, 11, 12, 16, 23, 30, 37, 38, 39, 40].includes(i)
                                  ? "bg-primary/30"
                                  : "bg-transparent"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 bg-white rounded-md shadow-sm border border-slate-200 flex items-center justify-center">
                          <Smartphone className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-700 mt-3">Alias MP: <span className="text-primary font-bold">{MP_ALIAS}</span></p>
                  </div>

                  <p className="text-sm text-slate-500 text-center mb-4">
                    Escaneá con la app de Mercado Pago o transferí al alias.
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleCopy}
                      className="flex-1 rounded-xl bg-primary hover:bg-indigo-700 h-14"
                    >
                      <Copy className="mr-2 h-5 w-5" /> {copied ? "Copiado!" : "Copiar alias"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                      className="rounded-xl h-14"
                    >
                      <a
                        href={whatsappLink(
                          "Hola! Quiero confirmar el pago por QR de mi proyecto.",
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {selectedMethod === "alias" && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
                  <Banknote className="h-10 w-10 text-primary mx-auto mb-4" />

                  <div className="bg-white rounded-2xl border-2 border-dashed border-primary/30 p-6 text-center mb-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Alias de Mercado Pago
                    </div>
                    <div className="text-2xl font-display font-bold text-slate-900 mb-3">
                      {MP_ALIAS}
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleCopy}
                      className="rounded-full bg-primary hover:bg-indigo-700"
                    >
                      <Copy className="mr-2 h-4 w-4" /> {copied ? "Copiado!" : "Copiar alias"}
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm text-slate-500 mb-4">
                    <p className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      Transferí desde cualquier banco o billetera virtual
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      El alias no cambia, siempre podés usarlo
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      Avísanos por WhatsApp cuando hagas la transferencia
                    </p>
                  </div>

                  <Button
                    variant="default"
                    size="lg"
                    asChild
                    className="w-full rounded-xl bg-primary hover:bg-indigo-700 h-14"
                  >
                    <a
                      href={whatsappLink(
                        `Hola! Acabo de transferir ${amount ? amount : "el monto acordado"} para mi proyecto por alias (${MP_ALIAS}).`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" /> Avísanos al transferir
                    </a>
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-4 border-t border-slate-100">
                <Lock className="h-3.5 w-3.5" />
                <span>Pago seguro. Tus datos están protegidos.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              ¿Tenés dudas?{" "}
              <a
                href={SITE.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Hablanos por WhatsApp
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
