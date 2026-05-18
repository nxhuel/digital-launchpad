import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Globe,
  MonitorSmartphone,
  BrainCircuit,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { Link } from "@tanstack/react-router";

function WebMockup() {
  return (
    <div className="w-full select-none" style={{ animation: "var(--animate-float)" }}>
      <div className="rounded-2xl border border-primary/20 bg-card shadow-xl overflow-hidden">
        <div className="h-8 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10 flex items-center px-3 gap-2">
          <div className="flex gap-1.5">
            {["bg-primary/40", "bg-primary/40", "bg-primary/40"].map((c) => (
              <div key={c} className={`h-2 w-2 rounded-full ${c}`} />
            ))}
          </div>
          <div className="flex-1 h-5 mx-2 rounded-full bg-white border border-primary/10 flex items-center px-3 text-[10px] text-muted-foreground">
            tu-negocio.com
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="h-24 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <div className="text-primary text-xs font-bold tracking-widest uppercase">
              Hero Banner
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Servicios", "Nosotros", "Contacto"].map((t) => (
              <div
                key={t}
                className="h-10 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary"
              >
                {t}
              </div>
            ))}
          </div>
          <div className="h-6 w-24 rounded-lg bg-gradient-to-r from-primary to-primary/80" />
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="w-full select-none space-y-3" style={{ animation: "var(--animate-float)" }}>
      <div className="rounded-2xl border border-primary/20 bg-card shadow-xl overflow-hidden">
        <div className="h-8 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10 flex items-center px-4 gap-3">
          <div className="h-2 w-2 rounded-full bg-primary/40" />
          <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Panel</div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { l: "Usuarios", v: "2.841" },
              { l: "Ventas", v: "$8.4k" },
              { l: "Uptime", v: "99.9%" },
            ].map(({ l, v }) => (
              <div key={l} className="rounded-xl bg-primary/10 border border-primary/10 p-2.5">
                <div className="text-[9px] font-semibold text-primary uppercase mb-1">{l}</div>
                <div className="text-sm font-bold text-foreground">{v}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-primary/10 border border-primary/10 p-3 space-y-2">
            {["Pedido #1042", "Usuario Maria G.", "Pago $1.200"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                <span className="text-[10px] text-foreground/70 font-medium">{t}</span>
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
      <div className="rounded-2xl border border-primary/20 bg-card shadow-xl overflow-hidden">
        <div className="h-9 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10 flex items-center px-4 gap-2">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-primary to-primary/80" />
          <span className="text-[10px] font-bold text-primary">Asistente IA</span>
        </div>
        <div className="p-4 space-y-2.5">
          <div className="flex gap-2 items-end">
            <div className="h-5 w-5 rounded-full bg-primary/10 shrink-0" />
            <div className="bg-primary/10 border border-primary/10 rounded-xl rounded-bl-sm px-3 py-2 text-[10px] text-foreground max-w-[80%]">
              Hola! Como te ayudo?
            </div>
          </div>
          <div className="flex gap-2 items-end justify-end">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl rounded-br-sm px-3 py-2 text-[10px] text-white max-w-[80%]">
              Quiero info sobre servicios
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <div className="h-5 w-5 rounded-full bg-primary/10 shrink-0" />
            <div className="bg-primary/10 border border-primary/10 rounded-xl rounded-bl-sm px-3 py-2 text-[10px] text-foreground max-w-[80%]">
              Tenemos webs, sistemas y mas...
            </div>
          </div>
        </div>
      </div>
      {[{ ok: true }, { ok: true }, { ok: false }].map(({ ok }, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-primary/10 shadow-sm"
        >
          <span className="text-sm">{ok ? "✓" : "..."}</span>
          <span className="text-xs font-medium text-foreground">
            {["Lead recibido", "Email enviado", "CRM"][i]}
          </span>
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
      <div className="w-36 h-56 rounded-3xl border-4 border-primary/20 bg-card shadow-xl overflow-hidden relative">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-primary/20" />
        <div className="pt-5 p-3 space-y-2">
          <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-3 text-white">
            <div className="text-[8px] font-bold opacity-70 uppercase tracking-wider mb-1">
              Clik
            </div>
            <div className="text-sm font-bold leading-tight">Tu Nombre</div>
            <div className="text-[8px] opacity-80 mt-0.5">Founder / CEO</div>
          </div>
          <div className="rounded-lg bg-primary/10 border border-primary/10 p-2 flex items-center justify-center gap-1">
            <span className="text-[8px] font-medium text-primary">QR</span>
          </div>
          {["WhatsApp", "Email", "IG"].map((s) => (
            <div
              key={s}
              className="h-4 rounded-lg bg-primary/10 border border-primary/10 flex items-center px-2"
            >
              <span className="text-[7px] font-medium text-primary">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-primary font-semibold">Digital Card</p>
    </div>
  );
}

const services = [
  {
    id: "webs",
    label: "Páginas Web",
    icon: Globe,
    accentFrom: "from-primary",
    accentTo: "to-primary/80",
    visual: <WebMockup />,
    cta: "Quiero mi web",
  },
  {
    id: "sistemas",
    label: "Sistemas Web",
    icon: MonitorSmartphone,
    accentFrom: "from-primary",
    accentTo: "to-primary/80",
    visual: <DashboardMockup />,
    cta: "Quiero un sistema",
  },
  {
    id: "ia",
    label: "IA",
    icon: BrainCircuit,
    accentFrom: "from-primary",
    accentTo: "to-primary/80",
    visual: <AutomationMockup />,
    cta: "Automatizar",
  },
  {
    id: "tarjetas",
    label: "Tarjetas",
    icon: CreditCard,
    accentFrom: "from-primary",
    accentTo: "to-primary/80",
    visual: <CardsMockup />,
    cta: "Ver diseños",
    href: "/tarjetas",
    isInternal: true,
  },
] as const;

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

import bannerImg from "../../assets/logo-v3.png";
=======
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2

export function Hero() {
  const [active, setActive] = useState(0);
  const [visualKey, setVisualKey] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heroRef = useReveal();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const svc = services[active];

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
  }, []);

  const goTo = (i: number) => {
    if (i === active) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActive(i);
    setVisualKey((k) => k + 1);
    startInterval();
  };

  return (
<<<<<<< HEAD
    <section
      id="top"
      className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden min-h-[90vh] flex items-center"
    >
      {/* GIF Background with Vibrant Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-indigo-900">
        <img 
          src={bannerImg} 
          alt="banner" 
          className="absolute -top-[20%] left-0 w-full h-[140%] object-cover object-center will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * 0.25}px, 0)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/90 via-purple-700/80 to-primary/90 mix-blend-multiply" />
      </div>

      {/* Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div ref={heroRef} className="reveal max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center text-white">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Tu negocio online en días</span>
            </div>

            <h1
              className="font-display leading-[1.05] tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: "600" }}
            >
              Transformá tu idea en un <br />
              <span className="text-white/90"> negocio digital</span>
            </h1>

            <p className="text-xl text-white/80 leading-relaxed max-w-lg font-medium">
              Diseñamos, construimos y lanzamos lo que tu negocio necesita.{" "}
              <br className="hidden md:block" />
              Vos te enfocás en crecer; nosotros, en la tecnología.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                variant="default"
                size="xl"
                asChild
                className="bg-white text-indigo-700 hover:bg-slate-50 shadow-xl shadow-indigo-900/20 px-8 rounded-2xl"
              >
                {"href" in svc ? (
                  svc.isInternal ? (
                    <Link to={svc.href}>
                      {svc.cta} <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  ) : (
                    <a href={svc.href}>
                      {svc.cta} <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  )
                ) : (
                  <a href="#planes">
                    {svc.cta} <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                )}
              </Button>
              <Button
                size="xl"
                asChild
                className="text-white hover:bg-indigo-700 px-8 rounded-2xl border border-white/20"
              >
                <a href="#como-funciona">Como funciona</a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              {[
                { val: "+10", label: "Proyectos" },
                { val: "7 dias", label: "Entrega promedio" },
                { val: "100%", label: "Satisfacción" },
              ].map(({ val, label }, i, arr) => (
                <div key={label} className="flex items-center gap-6">
                  <div>
                    <div className="text-2xl font-display font-bold text-white">{val}</div>
                    <div className="text-xs text-white/60 mt-0.5 uppercase tracking-wider">
                      {label}
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className="h-10 w-px bg-white/20" />}
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative flex items-center justify-center min-h-[400px] md:min-h-[500px]"
            onMouseEnter={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
            }}
            onMouseLeave={startInterval}
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-primary/20 to-transparent opacity-30 blur-3xl" />

            <div
              key={visualKey}
              className="relative w-full max-w-md h-full flex items-center justify-center"
              style={{ animation: "var(--animate-fade-in)" }}
            >
              <div className="relative z-10 w-full px-8 md:px-12 flex justify-center">
                {svc.visual}
              </div>
=======
    <section id="top" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[120px] -z-10" />
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-6 space-y-8" style={{ animation: "var(--animate-fade-up)" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold tracking-wider uppercase text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Agencia tecnológica
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-foreground">
            Llevá tu idea al{" "}
            <span className="italic text-primary">mundo digital</span>
            <br />
            sin saber de tecnología
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            En NoduStudio creamos webs, sistemas, automatizaciones con IA y
            tarjetas digitales para que tu negocio despegue. Vos te enfocás en
            crecer; nosotros del resto.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="#contacto">
                Quiero empezar <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outlineGlow" size="xl" asChild>
              <a href="#como-funciona">Cómo funciona</a>
            </Button>
          </div>
          <div className="flex items-center gap-8 pt-4">
            <div>
              <div className="text-3xl font-display font-semibold text-foreground">+120</div>
              <div className="text-sm text-muted-foreground">Negocios online</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-3xl font-display font-semibold text-foreground">7 días</div>
              <div className="text-sm text-muted-foreground">Tiempo promedio</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-3xl font-display font-semibold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Satisfacción</div>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
            </div>
          </div>
        </div>

<<<<<<< HEAD
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
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-all duration-300 cursor-pointer focus:outline-none ${
                  isActive
                    ? "bg-white text-indigo-700 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
                }`}
              >
                <TabIcon className="h-4 w-4 shrink-0" />
                <span>{s.label}</span>
              </button>
            );
          })}
=======
        <div className="lg:col-span-6 relative" style={{ animation: "var(--animate-fade-in)", animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
          <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-full -z-10" />
          <div className="relative rounded-3xl overflow-hidden shadow-elegant ring-1 ring-border">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80"
              alt="Equipo creativo de NoduStudio"
              className="w-full aspect-[4/5] lg:aspect-[4/4] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-5 -left-5 bg-card border border-border shadow-elegant rounded-2xl px-5 py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Listos en días</div>
              <div className="text-xs text-muted-foreground">No en meses</div>
            </div>
          </div>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        </div>
      </div>
    </section>
  );
}
