import { useEffect, useRef, useState } from "react";
import { Play, Pause, MapPin, MessageCircle, Heart, Calendar, Music2, ChevronDown } from "lucide-react";
import type { CardDesign } from "@/data/cards";

type Size = "md" | "lg";

const sizeMap: Record<Size, string> = {
  md: "w-[260px]",
  lg: "w-[300px]",
};

function useCountdown(targetISO?: string) {
  const target = targetISO ? new Date(targetISO).getTime() : Date.now() + 1000 * 60 * 60 * 24 * 60;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function defaultEventISO(d: CardDesign) {
  if (d.eventISO) return d.eventISO;
  // Default: 90 days from now
  const t = new Date();
  t.setDate(t.getDate() + 90);
  return t.toISOString();
}

export function ScrollableInvite({
  design,
  size = "md",
  whatsappUrl,
}: {
  design: CardDesign;
  size?: Size;
  whatsappUrl?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.32);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const c = useCountdown(defaultEventISO(design));

  // Fake song progress when playing
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => (p >= 1 ? 0 : p + 0.005));
    }, 200);
    return () => clearInterval(id);
  }, [playing]);

  const onScroll = () => {
    if (scrollRef.current) setScrolled(scrollRef.current.scrollTop > 20);
  };

  const song = design.song ?? { title: "Perfect", artist: "Ed Sheeran" };
  const mapsUrl =
    design.mapsUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(design.location)}`;

  return (
    <div
      className={`relative ${sizeMap[size]} aspect-[9/19] rounded-[2.5rem] bg-gradient-to-b from-zinc-800 to-black p-[6px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ${design.ring}`}
    >
      {/* Screen */}
      <div className="relative h-full w-full rounded-[2.1rem] overflow-hidden bg-zinc-950">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-40" />

        {/* Status bar */}
        <div className="absolute top-1.5 left-0 right-0 px-6 flex items-center justify-between text-[8px] text-white/70 z-30 pointer-events-none">
          <span>9:41</span>
          <span className="flex gap-0.5">
            <span className="block w-3 h-1.5 rounded-sm border border-white/50" />
          </span>
        </div>

        {/* Floating WhatsApp */}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-3 z-40 h-11 w-11 rounded-full bg-emerald-500 hover:bg-emerald-400 grid place-items-center shadow-[0_10px_30px_-5px_rgba(16,185,129,0.6)] transition-transform hover:scale-110"
            aria-label="Confirmar por WhatsApp"
          >
            <MessageCircle className="h-5 w-5 text-white" fill="white" fillOpacity={0.15} />
          </a>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          {/* ===== COVER ===== */}
          <section className={`relative h-full w-full flex flex-col items-center justify-between px-5 pt-12 pb-6 text-center bg-gradient-to-br ${design.accent}`}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_60%)]" />
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-white/10" />
            <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full border border-white/5" />

            <div className="relative z-10 mt-2">
              <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-white/70 border border-white/20 rounded-full px-3 py-1">
                {design.badge}
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-1">
              <p className="text-white/70 text-[11px] tracking-[0.3em] uppercase">
                {design.subtitle}
              </p>
              <h3 className={`text-white text-[2.4rem] leading-[1.05] ${design.font}`}>
                {design.name.split(" ")[0]}
              </h3>
              <div className="w-12 h-px bg-white/40 my-2" />
              <p className="text-white/85 text-xs font-medium">{design.date}</p>
              <p className="text-white/55 text-[10px]">{design.location}</p>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2 text-white/60">
              <ChevronDown className="h-4 w-4 animate-bounce" />
              <span className="text-[9px] uppercase tracking-widest">Deslizá para ver más</span>
            </div>

            {/* Reflection */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0" />
          </section>

          {/* ===== MUSIC PLAYER ===== */}
          <section className="px-5 py-7 bg-zinc-950 border-t border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Music2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-white/60">
                Nuestra canción
              </span>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-white/8 to-white/[0.02] border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${design.accent} grid place-items-center shrink-0 ${playing ? "animate-spin-slow" : ""}`}>
                  <div className="h-3 w-3 rounded-full bg-black/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-xs font-semibold truncate">{song.title}</div>
                  <div className="text-white/50 text-[10px] truncate">{song.artist}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="h-9 w-9 rounded-full bg-white text-black grid place-items-center hover:scale-105 transition-transform"
                  aria-label={playing ? "Pausar" : "Reproducir"}
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
              </div>
              {/* Progress */}
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[9px] text-white/40">
                <span>{formatTime(progress * 210)}</span>
                <span>3:30</span>
              </div>
            </div>
          </section>

          {/* ===== COUNTDOWN ===== */}
          <section className="px-5 py-7 bg-zinc-950 border-t border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-white/60">
                Cuenta regresiva
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { v: c.days, l: "días" },
                { v: c.hours, l: "hs" },
                { v: c.minutes, l: "min" },
                { v: c.seconds, l: "seg" },
              ].map((u) => (
                <div
                  key={u.l}
                  className={`rounded-xl bg-gradient-to-br ${design.accent} border border-white/10 px-1 py-3 text-center`}
                >
                  <div className="text-white text-lg font-bold leading-none tabular-nums">
                    {String(u.v).padStart(2, "0")}
                  </div>
                  <div className="text-white/60 text-[9px] uppercase tracking-wider mt-1">
                    {u.l}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== LOCATION ===== */}
          <section className="px-5 py-7 bg-zinc-950 border-t border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-white/60">
                Ubicación
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              {/* Stylized map */}
              <div className="relative h-28 bg-[radial-gradient(circle_at_30%_40%,rgba(139,92,246,0.25),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(236,72,153,0.18),transparent_50%)] bg-zinc-900">
                <svg
                  viewBox="0 0 200 100"
                  className="absolute inset-0 w-full h-full opacity-60"
                  preserveAspectRatio="none"
                >
                  <path d="M0,30 L80,30 L80,70 L200,70" stroke="white" strokeOpacity="0.15" strokeWidth="1" fill="none" />
                  <path d="M40,0 L40,100" stroke="white" strokeOpacity="0.1" strokeWidth="1" fill="none" />
                  <path d="M140,0 L140,100" stroke="white" strokeOpacity="0.1" strokeWidth="1" fill="none" />
                  <path d="M0,80 L200,80" stroke="white" strokeOpacity="0.08" strokeWidth="1" fill="none" />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 -m-2 rounded-full bg-primary/40 animate-ping" />
                    <MapPin className="relative h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] fill-primary/30" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="text-white text-xs font-semibold leading-tight">
                  {design.location.split("·")[0]?.trim() ?? design.location}
                </div>
                {design.location.includes("·") && (
                  <div className="text-white/50 text-[10px] mt-0.5">
                    {design.location.split("·").slice(1).join("·").trim()}
                  </div>
                )}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full inline-flex items-center justify-center gap-1.5 bg-white text-black text-[10px] font-semibold py-2 rounded-full hover:bg-white/90 transition-colors"
                >
                  <MapPin className="h-3 w-3" /> Ver en el mapa
                </a>
              </div>
            </div>
          </section>

          {/* ===== RSVP ===== */}
          <section className="px-5 py-8 bg-zinc-950 border-t border-white/5 text-center">
            <Heart className="h-5 w-5 text-rose-400 fill-rose-400 mx-auto mb-3" />
            <h4 className={`text-white text-xl mb-1 ${design.font}`}>
              ¿Nos acompañás?
            </h4>
            <p className="text-white/50 text-[11px] mb-5">
              Confirmá tu asistencia por WhatsApp
            </p>
            <a
              href={whatsappUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold py-3 rounded-full shadow-lg transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> {design.cta}
            </a>
            <p className="text-white/30 text-[9px] mt-4">Hecho con Lanzar.studio</p>
          </section>
        </div>

        {/* Top fade once scrolled */}
        <div
          className={`pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/60 to-transparent z-20 transition-opacity ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes spin-slow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .animate-spin-slow { animation: spin-slow 6s linear infinite; }
      `}</style>
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}
