import { Bot, BarChart3, Globe, Sparkles, Send, MessageSquare, Heart, MapPin } from "lucide-react";

/* ---------- Website mockup ---------- */
export function MockWebsite() {
  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10">
      {/* browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-black/40">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <div className="ml-3 h-5 flex-1 rounded-md bg-white/5 px-3 flex items-center text-[10px] text-white/40">
          tu-negocio.com
        </div>
      </div>
      <div className="p-5 grid grid-cols-5 gap-4 h-[calc(100%-2.6rem)]">
        {/* sidebar nav */}
        <div className="col-span-1 space-y-2">
          <div className="h-2 rounded bg-white/15 w-3/4" />
          <div className="h-2 rounded bg-white/8 w-2/3" />
          <div className="h-2 rounded bg-white/8 w-3/4" />
          <div className="h-2 rounded bg-primary/60 w-2/3" />
          <div className="h-2 rounded bg-white/8 w-1/2" />
        </div>
        <div className="col-span-4 space-y-3">
          <div className="h-3 rounded bg-white/20 w-2/3" />
          <div className="h-2 rounded bg-white/10 w-full" />
          <div className="h-2 rounded bg-white/10 w-5/6" />
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="h-16 rounded-lg bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30" />
            <div className="h-16 rounded-lg bg-white/5 border border-white/10" />
            <div className="h-16 rounded-lg bg-white/5 border border-white/10" />
          </div>
          <div className="flex gap-2 pt-1">
            <div className="h-7 rounded-md bg-primary px-3 flex items-center text-[10px] font-semibold text-white">
              Comprar ahora
            </div>
            <div className="h-7 rounded-md bg-white/5 border border-white/10 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- System / Dashboard mockup ---------- */
export function MockSystem() {
  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/20 grid place-items-center">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xs font-semibold text-white/80">Panel de control</div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <div className="text-[10px] text-white/50">Activo</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { v: "1.248", l: "Ventas" },
          { v: "94%", l: "Satisfacción" },
          { v: "+18", l: "Hoy" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] text-white/50 uppercase tracking-wider">{s.l}</div>
            <div className="text-lg font-bold text-white">{s.v}</div>
          </div>
        ))}
      </div>

      {/* chart */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 h-[140px] relative overflow-hidden">
        <svg viewBox="0 0 200 80" className="w-full h-full">
          <defs>
            <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.25 290)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="oklch(0.65 0.25 290)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 L25,50 L50,55 L75,35 L100,40 L125,20 L150,28 L175,12 L200,18 L200,80 L0,80 Z"
            fill="url(#g1)"
          />
          <path
            d="M0,60 L25,50 L50,55 L75,35 L100,40 L125,20 L150,28 L175,12 L200,18"
            fill="none"
            stroke="oklch(0.75 0.22 295)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="h-8 rounded-md bg-white/5 border border-white/10" />
        <div className="h-8 rounded-md bg-white/5 border border-white/10" />
      </div>
    </div>
  );
}

/* ---------- AI Chatbot mockup ---------- */
export function MockAI() {
  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 flex flex-col">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5 bg-black/40">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow grid place-items-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white/90">Asistente IA</div>
          <div className="text-[9px] text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> En línea
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-3 overflow-hidden">
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary text-white text-[11px] px-3 py-2">
            Hola! ¿Tienen turno para mañana?
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/20 grid place-items-center shrink-0">
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
          <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white/8 text-white/90 text-[11px] px-3 py-2 border border-white/5">
            ¡Hola! Sí, tengo disponible <b>10:30</b> y <b>16:00</b>. ¿Cuál preferís?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary text-white text-[11px] px-3 py-2">
            16:00 perfecto 🙌
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/20 grid place-items-center shrink-0">
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-white/8 text-white/60 text-[11px] px-3 py-2 border border-white/5 inline-flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse [animation-delay:.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse [animation-delay:.4s]" />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-white/5 flex items-center gap-2">
        <div className="flex-1 h-8 rounded-full bg-white/5 border border-white/10 px-3 flex items-center text-[11px] text-white/40">
          Escribí un mensaje…
        </div>
        <div className="h-8 w-8 rounded-full bg-primary grid place-items-center">
          <Send className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Digital invitation card mockup ---------- */
export function MockCard() {
  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 grid place-items-center p-8">
      <div className="relative w-[200px] aspect-[9/19] rounded-[2rem] bg-gradient-to-b from-zinc-800 to-black p-[5px] shadow-[0_25px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-fuchsia-400/20">
        <div className="relative h-full w-full rounded-[1.65rem] overflow-hidden bg-zinc-950">
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-black rounded-full z-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/30 via-pink-500/20 to-rose-500/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_60%)]" />

          <div className="relative h-full w-full flex flex-col items-center justify-between px-5 pt-9 pb-5 text-center">
            <span className="text-[8px] uppercase tracking-[0.25em] text-white/60 border border-white/15 rounded-full px-2 py-0.5">
              Mis 15
            </span>
            <div className="flex flex-col items-center gap-1">
              <p className="text-white/60 text-[9px] tracking-widest uppercase">cumple 15</p>
              <h3 className="text-white text-2xl font-serif italic">Valentina</h3>
              <div className="w-8 h-px bg-white/30 my-1.5" />
              <p className="text-white/80 text-[9px] font-medium">Sáb 14 · Septiembre</p>
              <div className="flex items-center justify-center gap-1 text-white/50 text-[8px]">
                <MapPin className="h-2.5 w-2.5" /> Salón Aurora
              </div>
            </div>
            <div className="w-full bg-white text-black text-[9px] font-semibold py-1.5 rounded-full shadow-lg">
              Confirmar
            </div>
          </div>
        </div>
      </div>

      {/* Floating side bubbles */}
      <div className="absolute top-8 right-8 rounded-2xl glass px-3 py-2 flex items-center gap-2 shadow-lg">
        <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
        <span className="text-[10px] text-white/80">+42 confirmados</span>
      </div>
      <div className="absolute bottom-8 left-8 rounded-2xl glass px-3 py-2 flex items-center gap-2 shadow-lg">
        <MessageSquare className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] text-white/80">Compartido por WhatsApp</span>
      </div>
    </div>
  );
}

export const SERVICE_ICONS = { Globe, BarChart3, Bot, Sparkles };
