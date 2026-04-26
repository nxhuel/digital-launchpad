import { useState } from "react";
import { ArrowRight, Send } from "lucide-react";
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
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 glass shadow-elegant">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-primary-glow/20 blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Lanzá tu negocio <span className="text-gradient">hoy</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Contanos qué tenés en mente. Te respondemos en menos de 24 horas con una propuesta gratuita.
              </p>
              <Button variant="hero" size="lg" asChild>
                <a href="https://wa.me/5491100000000" target="_blank" rel="noopener noreferrer">
                  Hablar por WhatsApp <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input required placeholder="Tu nombre" className="bg-background/50" />
              <Input required type="email" placeholder="Tu email" className="bg-background/50" />
              <Textarea required placeholder="Contanos tu idea..." rows={4} className="bg-background/50" />
              <Button variant="hero" size="lg" type="submit" disabled={sending} className="w-full">
                {sending ? "Enviando..." : (<>Enviar <Send className="h-4 w-4" /></>)}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
