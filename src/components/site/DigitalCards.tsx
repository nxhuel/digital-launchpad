import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Invite = {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  accent: string; // tailwind gradient classes
  ring: string;
  badge: string;
  font: string;
  cta: string;
};

const invites: Invite[] = [
  {
    title: "Valentina",
    subtitle: "cumple 15",
    date: "Sábado 14 · Septiembre",
    location: "Salón Aurora · 21:00 hs",
    accent: "from-fuchsia-500/30 via-pink-500/20 to-rose-500/30",
    ring: "ring-pink-300/20",
    badge: "Mis 15",
    font: "font-serif italic",
    cta: "Confirmar asistencia",
  },
  {
    title: "Sofía & Lucas",
    subtitle: "se casan",
    date: "Sábado 12 · Octubre 2026",
    location: "Estancia La Reserva · 19:30 hs",
    accent: "from-amber-200/25 via-rose-200/15 to-stone-300/25",
    ring: "ring-amber-200/25",
    badge: "Save the date",
    font: "font-serif",
    cta: "Confirmar asistencia",
  },
  {
    title: "Mateo",
    subtitle: "Bautismo",
    date: "Domingo 03 · Agosto",
    location: "Parroquia San Benito · 11:00 hs",
    accent: "from-sky-300/25 via-indigo-300/15 to-blue-400/25",
    ring: "ring-sky-200/25",
    badge: "Te esperamos",
    font: "font-serif",
    cta: "Confirmar asistencia",
  },
];

function PhoneCard({ invite, variant }: { invite: Invite; variant: "left" | "center" | "right" }) {
  const transform =
    variant === "center"
      ? "md:scale-110 md:-translate-y-4 z-20"
      : variant === "left"
        ? "md:-rotate-[8deg] md:translate-x-4 md:translate-y-6 z-10"
        : "md:rotate-[8deg] md:-translate-x-4 md:translate-y-6 z-10";

  return (
    <div
      className={`group relative transition-all duration-500 ease-out hover:!rotate-0 hover:!translate-y-0 hover:scale-[1.08] ${transform}`}
    >
      {/* Phone frame */}
      <div
        className={`relative w-[230px] md:w-[260px] aspect-[9/19] rounded-[2.5rem] bg-gradient-to-b from-zinc-800 to-black p-[6px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ${invite.ring}`}
      >
        {/* Glow */}
        <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/0 to-fuchsia-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Screen */}
        <div className="relative h-full w-full rounded-[2.1rem] overflow-hidden bg-zinc-950">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-30" />

          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${invite.accent}`} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

          {/* Decorative orbit */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-white/10" />
          <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full border border-white/5" />

          {/* Content */}
          <div className="relative h-full w-full flex flex-col items-center justify-between px-6 pt-12 pb-6 text-center">
            <div className="space-y-2 mt-2">
              <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-white/60 border border-white/15 rounded-full px-2.5 py-0.5">
                {invite.badge}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-white/60 text-xs tracking-widest uppercase">
                {invite.subtitle}
              </p>
              <h3 className={`text-white text-3xl leading-tight ${invite.font}`}>
                {invite.title}
              </h3>
              <div className="w-10 h-px bg-white/30 my-2" />
              <p className="text-white/80 text-[11px] font-medium">{invite.date}</p>
              <p className="text-white/50 text-[10px]">{invite.location}</p>
            </div>

            <div className="w-full space-y-2">
              <button className="w-full bg-white text-black text-[11px] font-semibold py-2.5 rounded-full shadow-lg">
                {invite.cta}
              </button>
              <p className="text-white/40 text-[9px]">Toca para ver más detalles</p>
            </div>
          </div>

          {/* Subtle reflection */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0" />
        </div>
      </div>
    </div>
  );
}

export function DigitalCards() {
  return (
    <section id="tarjetas" className="py-24 md:py-32 relative overflow-hidden">
      {/* violet glow background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-primary/20 via-fuchsia-500/10 to-transparent blur-3xl" />
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
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
          Invitaciones modernas, animadas y listas para compartir por WhatsApp en segundos.
          Diseño profesional sin que tengas que mover un dedo.
        </p>

        {/* Phone mockups */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-0 mb-16 perspective-[1200px]">
          <PhoneCard invite={invites[0]} variant="left" />
          <PhoneCard invite={invites[1]} variant="center" />
          <PhoneCard invite={invites[2]} variant="right" />
        </div>

        <Button variant="hero" size="xl" asChild>
          <Link to="/tarjetas">Ver todos los diseños</Link>
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">
          Casamientos · Cumpleaños · Eventos · Negocios
        </p>
      </div>
    </section>
  );
}
