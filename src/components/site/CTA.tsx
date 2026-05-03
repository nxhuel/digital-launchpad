import { useState } from "react";
import { ArrowRight, Send, Mail, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function CTA() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("¡Mensaje enviado! Te contactamos en menos de 24hs.");
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <section id="contacto" className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
            Contacto
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4 leading-[1.1]">
            Lanzá tu negocio <span className="text-primary italic">hoy</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Contanos qué tenés en mente. Te respondemos en menos de 24 horas con una propuesta gratuita.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Info card */}
          <div className="bg-gradient-to-br from-primary to-primary-glow rounded-3xl p-10 text-primary-foreground shadow-elegant relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <h3 className="font-display text-3xl font-semibold mb-4">Hablemos</h3>
              <p className="text-primary-foreground/90 mb-8 leading-relaxed">
                La forma más rápida de empezar es por WhatsApp. Te respondemos en minutos.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/15 grid place-items-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm">hola@nodustudio.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/15 grid place-items-center">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm">+54 11 0000 0000</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/15 grid place-items-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Buenos Aires, Argentina</span>
                </div>
              </div>

              <Button variant="secondary" size="lg" asChild className="bg-white text-primary hover:bg-white/90">
                <a href="https://wa.me/5491100000000" target="_blank" rel="noopener noreferrer">
                  Hablar por WhatsApp <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-10 shadow-elegant space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Nombre</label>
              <Input required placeholder="Tu nombre" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <Input required type="email" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tu proyecto</label>
              <Textarea required placeholder="Contanos brevemente tu idea..." rows={5} />
            </div>
            <Button variant="hero" size="lg" type="submit" disabled={sending} className="w-full">
              {sending ? "Enviando..." : (<>Enviar mensaje <Send className="h-4 w-4" /></>)}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
