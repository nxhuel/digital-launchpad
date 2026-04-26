import { Link } from "@tanstack/react-router";
import { Sparkles, Heart, PartyPopper, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DigitalCards() {
  return (
    <section id="tarjetas" className="py-24 md:py-32 relative overflow-hidden">
      {/* decorative emotional background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-pink-500/10 via-primary/10 to-amber-400/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium tracking-wide uppercase">Catálogo</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
          Tarjetas Digitales para{" "}
          <span className="text-gradient">Todo Tipo de Eventos</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Sorprendé a tus invitados con una invitación moderna, animada y lista para compartir
          por WhatsApp en segundos.
        </p>

        {/* visual preview */}
        <div className="flex items-end justify-center gap-4 mb-12 h-56 md:h-72">
          <div className="hidden sm:block w-32 md:w-44 h-44 md:h-56 rounded-2xl bg-gradient-to-br from-pink-400/30 to-rose-600/30 border border-pink-300/30 -rotate-6 shadow-elegant flex items-center justify-center">
            <Heart className="h-10 w-10 text-pink-300 m-auto mt-16" />
          </div>
          <div className="w-40 md:w-52 h-52 md:h-64 rounded-2xl bg-gradient-to-br from-primary/40 to-violet-700/40 border-2 border-primary/40 shadow-glow flex items-center justify-center relative z-10">
            <Sparkles className="h-12 w-12 text-primary-glow m-auto mt-20" />
          </div>
          <div className="hidden sm:block w-32 md:w-44 h-44 md:h-56 rounded-2xl bg-gradient-to-br from-amber-400/30 to-orange-600/30 border border-amber-300/30 rotate-6 shadow-elegant flex items-center justify-center">
            <PartyPopper className="h-10 w-10 text-amber-300 m-auto mt-16" />
          </div>
        </div>

        <Button variant="hero" size="xl" asChild>
          <Link to="/tarjetas">Ver diseños</Link>
        </Button>

        <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-400" /> Casamientos
          </span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-2">
            <PartyPopper className="h-4 w-4 text-amber-400" /> Cumpleaños
          </span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Eventos
          </span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-blue-400" /> Negocios
          </span>
        </div>
      </div>
    </section>
  );
}
