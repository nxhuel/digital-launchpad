import { useState } from "react";
import { Send, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SITE, whatsappLink } from "@/config/site";

export function CTA() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Para activar el correo, necesitamos que el formulario envíe los datos
    // de la manera tradicional (sin AJAX) la primera vez.
    setSending(true);
    // No usamos e.preventDefault() aquí para permitir la navegación a FormSubmit
  };

  return (
    <section id="contacto" className="py-20 md:py-28 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 -z-10" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-[3rem] overflow-hidden border border-slate-200 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
          <div className="h-2 w-full bg-primary" />

          <div className="relative grid md:grid-cols-2 gap-0">
            <div className="p-10 md:p-14 flex flex-col justify-center gap-8 border-b md:border-b-0 md:border-r border-slate-100">
              <div>
                <div className="text-[11px] font-black tracking-[0.2em] text-primary uppercase mb-4">
                  CONTACTO
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-medium leading-tight mb-6 text-slate-900">
                  Lanzá tu negocio <span className="text-primary italic">hoy</span>
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  Contanos qué tenés en mente. Te respondemos con una propuesta gratuita y sin
                  compromisos.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Sin costos ocultos ni sorpresas",
                  "Propuesta MVP (Producto Mínimo Viable) ",
                  "Atención directa por WhatsApp",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-bold text-slate-700"
                  >
                    <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Check className="h-3 w-3 text-emerald-500 stroke-[3]" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <Button
                variant="default"
                size="xl"
                asChild
                className="self-start rounded-2xl bg-primary hover:bg-indigo-700 shadow-xl shadow-primary/20 h-14 px-8 font-bold"
              >
                <a href={SITE.whatsapp.link} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> Hablar por WhatsApp
                </a>
              </Button>
            </div>

            <div className="p-10 md:p-14 flex flex-col justify-center bg-slate-50/50">
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                O escribinos directamente
              </p>
              <form
                action={`https://formsubmit.co/${SITE.email}`}
                method="POST"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <Input
                  required
                  name="name"
                  placeholder="Tu nombre"
                  className="h-12 rounded-xl border-slate-200 focus:ring-primary/20"
                />
                <Input
                  required
                  name="email"
                  type="email"
                  placeholder="Tu email"
                  className="h-12 rounded-xl border-slate-200 focus:ring-primary/20"
                />
                <Textarea
                  required
                  name="message"
                  placeholder="Contanos tu idea..."
                  rows={4}
                  className="rounded-xl border-slate-200 focus:ring-primary/20"
                />
                <Button
                  variant="default"
                  size="xl"
                  type="submit"
                  disabled={sending}
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  {sending ? (
                    "Enviando..."
                  ) : (
                    <>
                      Enviar mensaje <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
