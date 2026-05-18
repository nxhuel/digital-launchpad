<<<<<<< HEAD
import { useState, useRef, useEffect } from "react";
import { Check, Globe, MonitorSmartphone, BrainCircuit, CreditCard, Zap, ArrowRight, Star } from "lucide-react";
=======
import { Link } from "@tanstack/react-router";
import { Check, Globe, Layers, Bot, CreditCard, ArrowRight, Sparkles } from "lucide-react";
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
import { Button } from "@/components/ui/button";
import { MaintenanceTooltip } from "./MaintenanceTooltip";

type Plan = {
  tier: "basic" | "mid" | "premium";
  name: string;
  badge?: string;
  price: string;
  sub: string;
  desc: string;
  effort: string;
  features: string[];
  cta: string;
  ctaHref: string;
};

type Category = {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  type: "service" | "product";
  accentGrad: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  intro: string;
  plans: Plan[];
};

const categories: Category[] = [
  {
    id: "webs",
    label: "Páginas Web",
    shortLabel: "Web",
    icon: Globe,
    type: "service",
    accentGrad: "from-violet-600 to-indigo-600",
    accentText: "text-violet-400",
    accentBg: "bg-violet-900/20",
    accentBorder: "border-violet-500/20",
    intro: "Tu presencia online lista para vender, sin tecnicismos.",
    plans: [
      {
        tier: "basic",
        name: "Básico",
        price: "120.000 ARS",
        sub: "Pago único - mantenimiento 8.000 ARS/mes",
        desc: "Una landing page simple y efectiva para mostrar tu negocio.",
        effort: "Entrega en 5 días",
<<<<<<< HEAD
        features: ["Landing page hasta 4 secciones", "Diseño responsive", "WhatsApp integrado", "Redes sociales integrados"],
=======
        features: ["Landing page de 1 sección", "Diseño responsive", "Formulario de contacto", "WhatsApp integrado", "Hosting incluido"],
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        cta: "Empezar ahora",
        ctaHref: "#contacto",
      },
      {
        tier: "mid",
        name: "Intermedio",
        badge: "Más elegido",
        price: "300.000 ARS",
        sub: "Pago único - mantenimiento 35.000/mes",
        desc: "Web multi-sección profesional para crecer en serio.",
        effort: "Entrega en 10 días",
<<<<<<< HEAD
        features: ["Secciones ilimitadas, hasta 2 rutas", "Diseño enfocado y responsive", "WhatsApp integrado", "Redes sociales integrados", "Formularios de contacto"],
=======
        features: ["Web de hasta 5 secciones", "Diseño premium personalizado", "Reservas y formularios", "SEO básico", "Mantenimiento mensual", "Soporte prioritario"],
        highlighted: true,
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        cta: "Empezar ahora",
        ctaHref: "#contacto",
      },
      {
        tier: "premium",
        name: "Premium",
        badge: "Para escalar",
        price: "900.000 ARS",
        sub: "Pago único - mantenimiento 50.000/mes",
        desc: "Web completa con optimización avanzada e integraciones.",
        effort: "Entrega en 3 semanas",
<<<<<<< HEAD
        features: ["Rutas y secciones ilimitadas", "Diseño exclusivo a medida", "Integraciones (calendario, chatbot, etc)", "WhatsApp integrado", "Redes sociales integrados", "Formulario de contacto", "Soporte dedicado"],
=======
        features: ["Web ilimitada en secciones", "Diseño exclusivo a medida", "SEO avanzado + analítica", "Integraciones (CRM, email, pagos)", "Velocidad y rendimiento óptimos", "Soporte dedicado"],
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        cta: "Consultar",
        ctaHref: "#contacto",
      },
    ],
  },
  {
    id: "sistemas",
    label: "Sistemas a medida",
    shortLabel: "Sistemas",
    icon: MonitorSmartphone,
    type: "service",
    accentGrad: "from-indigo-600 to-blue-600",
    accentText: "text-indigo-400",
    accentBg: "bg-indigo-900/20",
    accentBorder: "border-indigo-500/20",
    intro: "Soluciones a medida para gestionar y escalar tu operación.",
    plans: [
      {
        tier: "basic",
        name: "Básico",
<<<<<<< HEAD
        price: "400.000 ARS",
        sub: "Pago único - mantenimiento 30.000/mes",
        desc: "Sistema simple para resolver una tarea concreta.",
        effort: "1-2 semanas",
        features: ["Sistema de 1 módulo funcional", "Login básico de usuarios", "Panel de administración", "Base de datos incluida"],
=======
        price: "USD 690",
        sub: "pago único + USD 29/mes",
        desc: "Sistema simple para una tarea concreta.",
        effort: "1-2 semanas",
        features: ["Sistema de 1 módulo", "Login básico", "Panel de administración", "Base de datos incluida", "Hosting y soporte"],
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        cta: "Empezar ahora",
        ctaHref: "#contacto",
      },
      {
        tier: "mid",
        name: "Intermedio",
<<<<<<< HEAD
        badge: "Más elegido",
        price: "750.000 ARS",
        sub: "Pago único - mantenimiento 80.000/mes",
        desc: "Gestión con módulos múltiples, roles y reportes.",
        effort: "3-4 semanas",
        features: ["Múltiples módulos integrados", "Usuarios con roles y permisos", "Reportes y exportaciones", "Hasta 1 integración con API externa"],
=======
        price: "USD 1.490",
        sub: "pago único + USD 59/mes",
        desc: "Gestión con usuarios, roles y reportes.",
        effort: "3-4 semanas",
        features: ["Múltiples módulos integrados", "Usuarios y roles", "Reportes y exportaciones", "Notificaciones por email", "Mantenimiento mensual", "Soporte prioritario"],
        highlighted: true,
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        cta: "Empezar ahora",
        ctaHref: "#contacto",
      },
      {
        tier: "premium",
        name: "Premium",
<<<<<<< HEAD
        badge: "Para escalar",
        price: "Desde 1.200.000 ARS",
        sub: "Pago único - mantenimiento 120.000/mes",
        desc: "Sistema completo, escalable y hecho para tu negocio.",
        effort: "Proyecto a medida",
        features: ["Arquitectura completamente personalizada", "Integraciones con APIs externas (pasarela de pagos, etc)", "Dashboards avanzados con Métricas en tiempo real"],
=======
        price: "Desde USD 3.500",
        sub: "presupuesto + USD 99/mes",
        desc: "Sistema completo a medida para tu negocio.",
        effort: "Proyecto a medida",
        features: ["Arquitectura a medida", "Integraciones con APIs externas", "Pagos online y facturación", "Dashboards avanzados", "Escalabilidad y seguridad", "Soporte dedicado"],
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        cta: "Consultar",
        ctaHref: "#contacto",
      },
    ],
  },
  {
    id: "ia",
<<<<<<< HEAD
    label: "Automatización con IA",
    shortLabel: "IA",
    icon: BrainCircuit,
    type: "service",
    accentGrad: "from-fuchsia-600 to-purple-600",
    accentText: "text-fuchsia-400",
    accentBg: "bg-fuchsia-900/20",
    accentBorder: "border-fuchsia-500/20",
    intro: "Automatizaciones de procesos, ayuda en la toma de decisiones, etc. con IA entrenada",
=======
    label: "IA y Automatización",
    icon: Bot,
    intro: "Automatizá tareas repetitivas y vendé mientras dormís.",
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
    plans: [
      {
        tier: "basic",
        name: "Básico",
<<<<<<< HEAD
        price: "100.000 ARS",
        sub: "Pago único · mantenimiento a definir/mes",
        desc: "Chatbot en tiempo real para no perder clientes.",
        effort: "1 flujo",
        features: ["Chatbot con IA mediante Wspp/Web", "Respuesta a preguntas frecuentes"],
=======
        price: "USD 390",
        sub: "pago único + USD 25/mes",
        desc: "Una automatización simple lista para usar.",
        effort: "Entrega rápida",
        features: ["1 flujo automatizado", "Conexión con WhatsApp o email", "Respuestas automáticas", "Plantillas pre-armadas", "Soporte inicial"],
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        cta: "Empezar ahora",
        ctaHref: "#contacto",
      },
      {
        tier: "mid",
        name: "Intermedio",
<<<<<<< HEAD
        badge: "Más elegido",
        price: "300.000 ARS",
        sub: "Pago único · mantenimiento a definir/mes",
        desc: "Chatbot gerencial que te ayuda con la toma de decisiones diarias.",
        effort: "Hasta 5 flujos",
        features: ["Integración Chatbot con IA al sistema", "Agentes de IA entrenados con tu negocio", "Reportes semanales", "Historial de chats"],
=======
        price: "USD 890",
        sub: "pago único + USD 49/mes",
        desc: "Integraciones y flujos conectados entre apps.",
        effort: "Hasta 5 flujos",
        features: ["Hasta 5 flujos automatizados", "Integraciones (Sheets, CRM, Notion)", "Chatbot básico con IA", "Reportes automáticos", "Mantenimiento mensual"],
        highlighted: true,
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        cta: "Empezar ahora",
        ctaHref: "#contacto",
      },
      {
        tier: "premium",
        name: "Premium",
        badge: "Para escalar",
        price: "Desde 1.200.000 ARS",
        sub: "Pago único · mantenimiento a definir/mes",
        desc: "IA personalizada entrenada con tu negocio.",
        effort: "Proyecto a medida",
<<<<<<< HEAD
        features: ["Automatizaciones ilimitadas", "Integraciones con otros sistemas (gmail, calendar, etc)", "Soporte dedicado"],
=======
        features: ["Agentes de IA entrenados con tu info", "Automatizaciones ilimitadas", "Integraciones personalizadas", "Análisis predictivo", "Optimización continua", "Soporte dedicado"],
        cta: "Consultar",
      },
    ],
  },
  {
    id: "tarjetas",
    label: "Tarjetas Digitales",
    icon: CreditCard,
    intro: "Invitaciones modernas para casamientos, 15, cumpleaños y eventos.",
    plans: [
      {
        name: "Esencial",
        price: "USD 49",
        sub: "pago único",
        desc: "Tarjeta digital simple y elegante.",
        effort: "Entrega en 48hs",
        features: ["Diseño a elegir del catálogo", "Tu información personalizada", "Compartir por WhatsApp", "Confirmación de asistencia", "Mobile-first"],
        cta: "Elegir diseño",
      },
      {
        name: "Premium",
        price: "USD 89",
        sub: "pago único",
        desc: "Animaciones, música y cuenta regresiva.",
        effort: "Entrega en 72hs",
        features: ["Diseño premium animado", "Música personalizada", "Cuenta regresiva", "Galería de fotos", "Mapa interactivo", "RSVP automático"],
        highlighted: true,
        cta: "Elegir diseño",
      },
      {
        name: "Boda completa",
        price: "USD 149",
        sub: "pago único",
        desc: "La invitación perfecta para tu gran día.",
        effort: "Entrega en 5 días",
        features: ["Diseño exclusivo a medida", "Web completa del evento", "Confirmaciones por categoría", "Lista de regalos digital", "Galería privada de invitados", "Soporte prioritario"],
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        cta: "Consultar",
        ctaHref: "#contacto",
      },
    ],
  },
  {
    id: "tarjetas",
    label: "Tarjetas Digitales",
    shortLabel: "Tarjetas",
    icon: CreditCard,
    type: "product",
    accentGrad: "from-purple-600 to-violet-600",
    accentText: "text-purple-400",
    accentBg: "bg-purple-900/20",
    accentBorder: "border-purple-500/20",
    intro: "Invitaciones y tarjetas digitales listas para compartir en segundos.",
    plans: [
      {
        tier: "basic",
        name: "Esencial",
        price: "25.000 ARS",
        sub: "Pago único",
        desc: "Tu tarjeta digital lista para compartir con QR.",
        effort: "Entrega en 48 hs",
        features: ["Tarjeta digital lista para usar", "Enlace para compartir", "Compatible con WhatsApp"],
        cta: "Ver diseños",
        ctaHref: "/tarjetas",
      },
      {
        tier: "mid",
        name: "Evento",
        badge: "Más elegido",
        price: "80.000 ARS",
        sub: "Pago único",
        desc: "Invitación digital para tu evento especial.",
        effort: "Entrega en 3 días",
        features: ["Diseño exclusivo para el evento", "Código QR incluido", "Tarjeta digital lista para usar", "Enlace para compartir", "Compatible con WhatsApp"],
        cta: "Ver diseños",
        ctaHref: "/tarjetas",
      },
      {
        tier: "premium",
        name: "Premium",
        badge: "Para escalar",
        price: "120.000 ARS",
        sub: "Pago único",
        desc: "Invitación digital completa.",
        effort: "Entrega en 5 días",
        features: ["Diseño exclusivo por grupos", "Invitados gestionados", "Código QR incluido", "Tarjeta digital lista para usar", "Enlace para compartir", "Compatible con WhatsApp"],
        cta: "Ver diseños",
        ctaHref: "/tarjetas",
      },
    ],
  },
];

function PlanCard({ plan, cat, animKey }: { plan: Plan; cat: Category; animKey: string }) {
  const isHighlighted = plan.tier === "mid";

  return (
<<<<<<< HEAD
    <div
      key={animKey}
      className={`relative flex flex-col rounded-[2.5rem] p-8 transition-all duration-500 ${
        isHighlighted
          ? "border-2 border-primary shadow-[0_20px_50px_rgba(124,58,237,0.12)] bg-white scale-105 z-10"
          : "border border-slate-100 bg-white hover:shadow-xl hover:border-slate-200"
      }`}
    >
      {isHighlighted && (
        <div className={`absolute inset-0 rounded-[2.5rem] bg-primary/5 -z-10`} />
      )}

      {plan.badge && (
        <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          isHighlighted
            ? `bg-primary text-white shadow-lg shadow-primary/20`
            : `bg-slate-100 text-slate-600 border border-slate-200`
        }`}
        >
          {isHighlighted && <Star className="h-3 w-3 fill-white text-white" />}
          {plan.badge}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mt-2">{plan.desc}</p>
      </div>

      <div className="mb-6">
        <div className={`text-3xl font-display font-bold ${isHighlighted ? "text-primary" : "text-slate-900"}`}>
          {plan.price}
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 flex items-center flex-wrap">
          {(() => {
            const lowerSub = plan.sub.toLowerCase();
            const keyword = lowerSub.includes("mantenimiento") ? "mantenimiento" : lowerSub.includes("soporte") ? "soporte" : null;
            
            if (keyword && (cat.id === "webs" || cat.id === "sistemas" || cat.id === "ia")) {
              const parts = plan.sub.split(new RegExp(`(${keyword})`, "i"));
              return (
                <>
                  {parts[0]}
                  <span className="inline-flex items-center">
                    {parts[1]}
                    <MaintenanceTooltip service={cat.id as any} tier={plan.tier} />
                  </span>
                  {parts[2]}
                </>
              );
            }
            return plan.sub;
          })()}
        </div>
      </div>

      {/* <div className={`self-start mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cat.accentBg} ${cat.accentText} border ${cat.accentBorder}`}>
        <Zap className="h-3 w-3" />
        {plan.effort}
      </div> */}

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
            <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <Check className="h-3 w-3 text-emerald-500 stroke-[3]" />
            </div>
            {f}
          </li>
        ))}
      </ul>

      <Button 
        variant={isHighlighted ? "default" : "outline"} 
        size="lg" 
        asChild 
        className={`mt-auto w-full rounded-2xl h-12 font-bold transition-all ${
          isHighlighted 
            ? "bg-primary hover:bg-indigo-700 text-white shadow-lg shadow-primary/20" 
            : "border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        <a href={plan.ctaHref}>
          {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

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
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function Pricing() {
  const [activeId, setActiveId] = useState<string>(categories[0].id);
  const [contentKey, setContentKey] = useState(0);
  const headerRef = useReveal();

  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const ActiveIcon = active.icon;

  const handleTabClick = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    setContentKey((k) => k + 1);
  };

  return (
    <section id="planes" className="py-20 md:py-28 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent -z-10" />

      <div className="max-w-6xl mx-auto px-6">
        <div ref={headerRef} className="reveal text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-medium tracking-widest text-primary uppercase mb-3">
            SERVICIOS Y PLANES
          </div>
          <h2 className="font-display text-4xl md:text-5xl  mb-4">
            Elegí el servicio que <span className="text-primary">tu negocio necesita</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Cuatro categorías, tres niveles. Empezá simple y escalá cuando estés listo. <span className="underline">Cada plan incluye todo lo del anterior y nuevas herramientas para crecer.</span>
          </p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.id === activeId;
            return (
              <button
                key={cat.id}
                onClick={() => handleTabClick(cat.id)}
                className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-300 cursor-pointer border focus:outline-none ${
                  isActive
                    ? `bg-gradient-to-r ${cat.accentGrad} text-white border-transparent shadow-glow`
                    : `bg-card ${cat.accentText} ${cat.accentBorder} hover:${cat.accentBg}`
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{cat.label}</span>
                {cat.type === "product" && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : `${cat.accentBg} ${cat.accentText}`}`}>
                    PRODUCTO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div key={`intro-${contentKey}`} className="mb-6" style={{ animation: "var(--animate-fade-up)" }}>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${active.accentBg} ${active.accentText} ${active.accentBorder}`}>
            <ActiveIcon className="h-4 w-4" />
            {active.label}
          </div>
          <p className="text-lg text-muted-foreground mt-2 max-w-xl">{active.intro}</p>
        </div>

        <div key={`cards-${contentKey}`} className="grid md:grid-cols-3 gap-5" style={{ animation: "var(--animate-fade-up)", animationDelay: "0.08s", opacity: 0, animationFillMode: "forwards" }}>
          {active.plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} cat={active} animKey={`${activeId}-${plan.name}`} />
=======
    <section id="precios" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Servicios y planes
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4 leading-[1.1]">
            Elegí el servicio que <span className="text-primary italic">tu negocio necesita</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Cuatro categorías, planes claros. Empezá simple y escalá cuando estés listo.
          </p>
        </div>

        <Tabs defaultValue="webs" className="w-full">
          <TabsList className="mx-auto mb-12 grid w-full max-w-3xl grid-cols-2 sm:grid-cols-4 h-auto bg-secondary p-1.5 rounded-xl">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <TabsTrigger
                  key={c.id}
                  value={c.id}
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg py-3 gap-2 text-foreground/70"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">{c.label}</span>
                  <span className="text-xs font-medium sm:hidden">{c.label.split(" ")[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-0">
              <p className="text-center text-muted-foreground mb-10">{c.intro}</p>
              <div className="grid md:grid-cols-3 gap-6">
                {c.plans.map((p) => (
                  <div
                    key={p.name}
                    className={`relative p-8 rounded-2xl flex flex-col transition-all duration-300 ${
                      p.highlighted
                        ? "bg-gradient-to-b from-primary/15 to-card border-2 border-primary shadow-glow scale-[1.02]"
                        : "bg-card border border-border hover:border-primary/40 hover:shadow-elegant"
                    }`}
                  >
                    {p.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground shadow-glow">
                        Más elegido
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="font-display text-2xl font-semibold mb-2 text-foreground">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className="mb-4">
                      <div className="text-4xl font-display font-semibold text-foreground">{p.price}</div>
                      <div className="text-sm text-muted-foreground mt-1">{p.sub}</div>
                    </div>
                    <div className="mb-6 inline-flex self-start px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold">
                      {p.effort}
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-3 text-sm text-foreground/80">
                          <Check className="h-5 w-5 text-primary shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant={p.highlighted ? "hero" : "outlineGlow"} size="lg" asChild>
                      <a href="#contacto">{p.cta ?? "Empezar"}</a>
                    </Button>
                  </div>
                ))}
              </div>

              {c.id === "tarjetas" && (
                <div className="text-center mt-10">
                  <Button variant="outlineGlow" size="lg" asChild>
                    <Link to="/tarjetas">
                      Ver catálogo completo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
          ))}
        </div>
      </div>
    </section>
  );
}