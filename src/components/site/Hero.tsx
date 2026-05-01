import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Globe, BarChart3, Bot, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MockWebsite, MockSystem, MockAI, MockCard } from "./ServiceMockups";

const services = [
  {
    key: "web",
    label: "Webs",
    icon: Globe,
    title: "Webs y tiendas online",
    desc: "Tu negocio online en días, no en meses.",
    Mock: MockWebsite,
  },
  {
    key: "sys",
    label: "Sistemas",
    icon: BarChart3,
    title: "Sistemas a medida",
    desc: "Gestión, ventas y métricas en un solo lugar.",
    Mock: MockSystem,
  },
  {
    key: "ai",
    label: "IA",
    icon: Bot,
    title: "Automatización con IA",
    desc: "Atendé clientes 24/7 sin levantar un dedo.",
    Mock: MockAI,
  },
  {
    key: "card",
    label: "Tarjetas",
    icon: CreditCard,
    title: "Tarjetas digitales",
    desc: "Invitaciones modernas para todo tipo de evento.",
    Mock: MockCard,
  },
] as const;

export function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % services.length), 4000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section id="top" className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] -z-10" />
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div className="space-y-8" style={{ animation: "var(--animate-fade-up)" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">
              Tu negocio online en días, no en meses
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Llevá tu idea al{" "}
            <span className="text-gradient">mundo digital</span> sin saber de tecnología
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Webs, sistemas, automatización con IA y tarjetas digitales.
            Vos te enfocás en tu negocio, nosotros del resto.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="#contacto">
                Quiero empezar <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outlineGlow" size="xl" asChild>
              <a href="#como-funciona">Ver cómo funciona</a>
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div>
              <div className="text-2xl font-display font-bold text-foreground">+120</div>
              <div>Negocios online</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-2xl font-display font-bold text-foreground">7 días</div>
              <div>Tiempo promedio</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-2xl font-display font-bold text-foreground">100%</div>
              <div>Satisfacción</div>
            </div>
          </div>
        </div>

        {/* Right — rotating service mockup */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{ animation: "var(--animate-fade-in)", animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}
        >
          <div className="absolute -inset-8 bg-gradient-primary blur-3xl opacity-25 rounded-full -z-10" />

          {/* Device frame */}
          <div className="relative aspect-[4/3] w-full rounded-3xl bg-gradient-to-br from-zinc-900/60 to-black/60 p-3 shadow-elegant ring-1 ring-white/10">
            <div className="relative w-full h-full">
              {services.map((s, i) => (
                <div
                  key={s.key}
                  aria-hidden={i !== active}
                  className={`transition-all duration-700 ease-out ${
                    i === active
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  style={{ position: "absolute", inset: 0 }}
                >
                  <s.Mock />
                </div>
              ))}
            </div>

            {/* Caption pill on mockup */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 rounded-full glass shadow-lg whitespace-nowrap">
              {(() => {
                const Icon = services[active].icon;
                return <Icon className="h-3.5 w-3.5 text-primary" />;
              })()}
              <span className="text-xs font-medium">{services[active].title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service indicator pills */}
      <div className="max-w-7xl mx-auto px-6 mt-20">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {services.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === active;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  setActive(i);
                  setPaused(true);
                }}
                className={`group inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                  isActive
                    ? "border-primary/60 bg-primary/15 text-foreground shadow-[0_0_30px_-5px_var(--primary)]"
                    : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:border-white/30"
                }`}
                aria-pressed={isActive}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                {s.label}
                {isActive && (
                  <span className="ml-1 hidden md:inline text-xs text-muted-foreground">
                    · {s.desc}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mx-auto mt-6 h-px w-40 bg-white/5 overflow-hidden rounded-full">
          <div
            key={active + (paused ? "p" : "r")}
            className="h-full bg-gradient-to-r from-primary to-primary-glow"
            style={{
              width: paused ? "100%" : "0%",
              animation: paused ? undefined : "hero-progress 4s linear forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes hero-progress { from { width: 0% } to { width: 100% } }
      `}</style>
    </section>
  );
}
