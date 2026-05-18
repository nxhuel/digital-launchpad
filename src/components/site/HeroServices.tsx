import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Globe,
  MonitorSmartphone,
  BrainCircuit,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import heroPremium from "@/assets/hero-premium.png";

/* ─── Mockup visuals ─────────────────────────────────────────────────────── */

function WebMockup() {
  return (
    <div className="w-full select-none" style={{ animation: "var(--animate-float)" }}>
      <div className="rounded-2xl border border-violet-200 bg-white shadow-2xl overflow-hidden mb-4">
        <div className="h-9 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100 flex items-center px-3 gap-2">
          <div className="flex gap-1.5">
            {["bg-rose-400", "bg-amber-400", "bg-emerald-400"].map((c) => (
              <div key={c} className={`h-2 w-2 rounded-full ${c}`} />
            ))}
          </div>
          <div className="flex-1 h-5 mx-2 rounded-full bg-white border border-violet-100 flex items-center px-3 text-[10px] text-muted-foreground">
            tu-negocio.com
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="h-28 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
            <div className="text-violet-400 text-xs font-bold tracking-widest uppercase">
              Hero Banner
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Servicios", "Nosotros", "Contacto"].map((t) => (
              <div
                key={t}
                className="h-12 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-[10px] font-semibold text-violet-600"
              >
                {t}
              </div>
            ))}
          </div>
          <div className="h-7 w-28 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500" />
        </div>
      </div>
      <div className="mx-auto w-28 h-52 rounded-3xl border-4 border-violet-200 bg-white shadow-xl overflow-hidden relative">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-violet-200" />
        <div className="pt-5 p-2 space-y-1.5">
          <div className="h-14 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100" />
          <div className="h-2.5 rounded bg-gray-100 w-full" />
          <div className="h-2 rounded bg-gray-100 w-4/5" />
          <div className="h-5 rounded-md bg-gradient-to-r from-violet-500 to-indigo-500 w-3/4 mt-1" />
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="w-full select-none space-y-3" style={{ animation: "var(--animate-float)" }}>
      <div className="rounded-2xl border border-indigo-200 bg-white shadow-2xl overflow-hidden">
        <div className="h-9 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 flex items-center px-4 gap-3">
          <div className="h-2 w-2 rounded-full bg-indigo-400" />
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
            Panel de Control
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { l: "Usuarios", v: "2 841" },
              { l: "Ventas", v: "$8.4k" },
              { l: "Uptime", v: "99.9%" },
            ].map(({ l, v }) => (
              <div key={l} className="rounded-xl bg-indigo-50 border border-indigo-100 p-2.5">
                <div className="text-[9px] font-semibold text-indigo-500 uppercase mb-1">{l}</div>
                <div className="text-sm font-bold text-indigo-900">{v}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-3 space-y-2">
            {[
              "Pedido #1042 — procesado",
              "Usuario María G. — registrada",
              "Pago $1.200 — confirmado",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span className="text-[10px] text-indigo-700 font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationMockup() {
  return (
    <div className="w-full select-none space-y-2.5" style={{ animation: "var(--animate-float)" }}>
      <div className="rounded-2xl border border-fuchsia-200 bg-white shadow-2xl overflow-hidden">
        <div className="h-9 bg-gradient-to-r from-fuchsia-50 to-violet-50 border-b border-fuchsia-100 flex items-center px-4 gap-2">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500" />
          <span className="text-[10px] font-bold text-fuchsia-700">Asistente IA · En línea</span>
        </div>
        <div className="p-4 space-y-2.5">
          <div className="flex gap-2 items-end">
            <div className="h-5 w-5 rounded-full bg-fuchsia-100 shrink-0" />
            <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-xl rounded-bl-sm px-3 py-2 text-[10px] text-fuchsia-800 max-w-[80%]">
              ¡Hola! ¿En qué te puedo ayudar hoy?
            </div>
          </div>
          <div className="flex gap-2 items-end justify-end">
            <div className="bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-xl rounded-br-sm px-3 py-2 text-[10px] text-white max-w-[80%]">
              Quiero información sobre sus servicios
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <div className="h-5 w-5 rounded-full bg-fuchsia-100 shrink-0" />
            <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-xl rounded-bl-sm px-3 py-2 text-[10px] text-fuchsia-800 max-w-[80%]">
              ¡Claro! Tenemos webs, sistemas y más...
            </div>
          </div>
        </div>
      </div>
      {[
        { s: "Lead recibido", ok: true },
        { s: "Email enviado", ok: true },
        { s: "CRM actualizado", ok: false },
      ].map(({ s, ok }) => (
        <div
          key={s}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-fuchsia-100 shadow-sm"
        >
          <span className="text-sm">{ok ? "✅" : "⏳"}</span>
          <span className="text-xs font-semibold text-fuchsia-800">{s}</span>
        </div>
      ))}
    </div>
  );
}

function CardsMockup() {
  return (
    <div
      className="w-full select-none flex flex-col items-center gap-4"
      style={{ animation: "var(--animate-float)" }}
    >
      <div className="w-40 h-68 rounded-3xl border-4 border-sky-200 bg-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-sky-200" />
        <div className="pt-6 p-3 space-y-2">
          <div className="rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 p-3 text-white">
            <div className="text-[9px] font-bold opacity-70 uppercase tracking-wider mb-1">
              Lanzar.studio
            </div>
            <div className="text-sm font-bold leading-tight">Nahuel García</div>
            <div className="text-[9px] opacity-80 mt-0.5">Fundador · CEO</div>
          </div>
          <div className="rounded-lg bg-sky-50 border border-sky-100 p-2 flex items-center justify-center gap-1">
            <svg
              className="h-4 w-4 text-sky-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h2v2h-2zM16 16h2v2h-2z" />
            </svg>
            <span className="text-[9px] font-semibold text-sky-600">Compartir QR</span>
          </div>
          {["WhatsApp", "Email", "Instagram"].map((s) => (
            <div
              key={s}
              className="h-5 rounded-lg bg-sky-50 border border-sky-100 flex items-center px-2"
            >
              <span className="text-[8px] font-medium text-sky-600">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-sky-600 font-semibold">Sin papel · Con QR · Al instante</p>
    </div>
  );
}

/* ─── Service data ───────────────────────────────────────────────────────── */

const services = [
  {
    id: "webs",
    label: "Páginas Web",
    icon: Globe,
    accentFrom: "from-violet-500",
    accentTo: "to-indigo-600",
    glow: "bg-violet-300/25",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000",
    visual: <WebMockup />,
    cta: "Quiero mi web",
    href: "#contacto",
    isInternal: false,
  },
  {
    id: "sistemas",
    label: "Sistemas Web",
    icon: MonitorSmartphone,
    accentFrom: "from-indigo-500",
    accentTo: "to-blue-600",
    glow: "bg-indigo-300/25",
    image: "https://images.unsplash.com/photo-1551288049-bbda48658a7d?auto=format&fit=crop&q=80&w=1000",
    visual: <DashboardMockup />,
    cta: "Quiero un sistema",
    href: "#contacto",
    isInternal: false,
  },
  {
    id: "ia",
    label: "Automatizaciones con IA",
    icon: BrainCircuit,
    accentFrom: "from-fuchsia-500",
    accentTo: "to-violet-600",
    glow: "bg-fuchsia-300/25",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
    visual: <AutomationMockup />,
    cta: "Automatizar mi negocio",
    href: "#contacto",
    isInternal: false,
  },
  {
    id: "tarjetas",
    label: "Tarjetas Digitales",
    icon: CreditCard,
    accentFrom: "from-sky-500",
    accentTo: "to-blue-600",
    glow: "bg-sky-300/25",
    image: "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=1000",
    visual: <CardsMockup />,
    cta: "Ver diseños",
    href: "/tarjetas",
    isInternal: true,
  },
] as const;

/* ─── Reveal hook ───────────────────────────────────────────────────────── */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function HeroServices() {
  const [active, setActive] = useState(0);
  const [visualKey, setVisualKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heroRef = useReveal();

  const svc = services[active];
  const Icon = svc.icon;

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setActive((p) => {
        const next = (p + 1) % services.length;
        setVisualKey((k) => k + 1);
        return next;
      });
    }, 4000);
  };

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i: number) => {
    if (i === active) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActive(i);
    setVisualKey((k) => k + 1);
    startInterval();
  };

  return (
    <section
      id="top"
      className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden min-h-[95vh] flex items-center bg-white text-foreground noise-overlay"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.9)), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
        
      {/* Subtle depth layer for light mode */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(99,102,241,0.05),transparent_70%)] pointer-events-none" />
      {/* Ambient glow — changes colour with active service */}
      <div
        key={`glow-${active}`}
        className={`pointer-events-none absolute -top-32 -right-32 h-[550px] w-[550px] rounded-full ${svc.glow} blur-[110px] -z-10 transition-colors duration-700`}
      />

      <div ref={heroRef} className="reveal max-w-6xl mx-auto px-6">
        {/* ── Two-column layout ── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full glass shadow-card text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Tu negocio online en días, no en meses</span>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-bold leading-[1.06] tracking-tight text-foreground"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.25rem)" }}
            >
              Llevá tu idea al <span className="text-gradient">mundo digital</span> sin saber de
              tecnología
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Diseñamos, construimos y lanzamos lo que tu negocio necesita. Vos te enfocás en
              crecer; nosotros, de la tecnología.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              {svc.isInternal ? (
                <Button variant="hero" size="xl" asChild>
                  <Link to={svc.href as "/"}>
                    {svc.cta} <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button variant="hero" size="xl" asChild>
                  <a href={svc.href}>
                    {svc.cta} <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              )}
              <Button variant="outlineGlow" size="xl" asChild className="bg-white/5 border-border text-foreground hover:bg-muted">
                <a href="#como-funciona">Cómo funciona</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              {[
                { val: "+120", label: "Proyectos" },
                { val: "7 días", label: "Entrega promedio" },
                { val: "100%", label: "Satisfacción" },
              ].map(({ val, label }, i, arr) => (
                <div key={label} className="flex items-center gap-6">
                  <div>
                    <div className="text-2xl font-display font-bold text-foreground">{val}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                  </div>
                  {i < arr.length - 1 && <div className="h-10 w-px bg-border" />}
                </div>
              ))}
            </div>
          </div>

          {/* Right — rotating service visual */}
          <div
            className="relative flex items-center justify-center min-h-[400px] md:min-h-[500px]"
            onMouseEnter={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
            }}
            onMouseLeave={startInterval}
          >
            {/* Soft radial glow behind visual */}
            <div
              className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${svc.accentFrom} ${svc.accentTo} opacity-20 blur-3xl`}
            />
            
            {/* Main Visual Container */}
            <div
              key={visualKey}
              className="relative w-full max-w-md h-full flex items-center justify-center"
              style={{ animation: "var(--animate-fade-in)" }}
            >
              {/* Mockup on top */}
              <div className="relative z-10 w-full px-8 md:px-12 flex justify-center">
                {svc.visual}
              </div>
            </div>
          </div>
        </div>

        {/* ── Service indicator pills ── */}
        <div
          className="flex flex-wrap justify-center gap-2 mt-14"
          role="tablist"
          aria-label="Servicios"
        >
          {services.map((s, i) => {
            const TabIcon = s.icon;
            const isActive = active === i;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => goTo(i)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold
                  border transition-all duration-300 cursor-pointer focus:outline-none
                  ${
                    isActive
                      ? `bg-gradient-to-r ${s.accentFrom} ${s.accentTo} text-white border-transparent shadow-glow`
                      : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground shadow-card"
                  }
                `}
              >
                <TabIcon className="h-4 w-4 shrink-0" />
                <span>{s.label}</span>
                {/* Active: animated underline progress bar */}
                {isActive && <span className="block h-0.5 w-6 rounded-full bg-white/50" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
