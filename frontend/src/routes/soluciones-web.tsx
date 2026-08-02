import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Globe, Monitor, Bot, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/config/site";

export const Route = createFileRoute("/soluciones-web")({
  head: () => ({
    meta: [
      { title: "Soluciones Web — Clik Agencia Digital" },
      {
        name: "description",
        content:
          "Desarrollamos landing pages, sitios web, sistemas a medida, dashboards, automatizaciones e integraciones. Soluciones digitales para tu negocio..",
      },
      {
        property: "og:title",
        content: "Soluciones Web a Medida — Clik",
      },
      {
        property: "og:description",
        content:
          "Landing pages, sistemas web, automatizaciones e integraciones. Desarrollamos la solución digital que tu negocio necesita.",
      },
    ],
  }),
  component: SolucionesWeb,
});

const services = [
  {
    id: "pagina-web",
    icon: Globe,
    title: "Página Web",
    desc: "Landing page o sitio profesional para mostrar tu negocio y captar clientes.",
    price: "Desde $80.000 ARS",
    features: [
      "Diseño responsive",
      "WhatsApp integrado",
      "Redes sociales",
      "Formulario de contacto",
      "Hosting 1er año incluido",
    ],
    delivery: "A definir",
    accent: "violet",
  },
  {
    id: "sistema-medida",
    icon: Monitor,
    title: "Sistema a Medida",
    desc: "Dashboards, CRM, gestión de stock o cualquier sistema que necesites.",
    price: "Desde $200.000 ARS",
    features: [
      "Módulos personalizados",
      "Panel de administración",
      "Usuarios y permisos",
      "Base de datos incluida",
      "Integración con APIs",
    ],
    delivery: "A definir",
    accent: "blue",
  },
  {
    id: "sistema-ia",
    icon: Bot,
    title: "Sistema con IA Integrada",
    desc: "Automatizaciones inteligentes, chatbots, procesamiento de datos y agentes IA.",
    price: "A consultar",
    features: [
      "Modelos de IA personalizados",
      "Chatbots y asistentes",
      "Automatización de procesos",
      "Integración con APIs",
      "Soporte dedicado",
    ],
    delivery: "A definir",
    accent: "emerald",
  },
];

const accentMap: Record<string, { iconBg: string; text: string; border: string; badge: string }> = {
  violet: {
    iconBg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
    badge: "bg-violet-600",
  },
  blue: {
    iconBg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-600",
  },
  emerald: {
    iconBg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    badge: "bg-emerald-600",
  },
};

function ServiceCard({ s, i }: { s: (typeof services)[number]; i: number }) {
  const Icon = s.icon;
  const isHighlighted = i === 1;
  const a = accentMap[s.accent];

  return (
    <div
      className={`relative flex flex-col p-8 transition-all duration-300 bg-white border-2 shadow-sm hover:shadow-lg hover:-translate-y-1 ${
        isHighlighted ? "border-violet-500 scale-105 z-10 shadow-violet-100" : "border-slate-200"
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest">
          Más elegido
        </div>
      )}

      <div className={`h-12 w-12 ${a.iconBg} flex items-center justify-center mb-5`}>
        <Icon className={`h-6 w-6 ${a.text}`} />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">{s.desc}</p>

      <div className="mb-6">
        <div className="text-3xl font-bold text-slate-900">{s.price}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-tight mt-1">
          Precio Mantenimiento {s.delivery}
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {s.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
            <div className="mt-1 h-5 w-5 flex items-center justify-center shrink-0">
              <svg className={`h-4 w-4 ${a.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            {f}
          </li>
        ))}
      </ul>

      <Button
        size="lg"
        asChild
        className="mt-auto w-full h-12 font-bold bg-slate-900 hover:bg-slate-800 text-white"
      >
        <a href={whatsappLink(`Hola! Quiero info sobre ${s.title}.`)} target="_blank" rel="noopener noreferrer">
          Consultar <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

function SolucionesWeb() {
  return (
    <main>
      <section className="relative pt-4 md:pt-8 pb-20 md:pb-28 overflow-hidden min-h-[60vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/80" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.05]">
            Desarrollo web{" "}
            <span className="text-violet-300">a medida</span>
          </h1>
          <p className="text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto">
            Landing pages, sitios profesionales, sistemas web, dashboards, automatizaciones,
            integraciones y más. Todo lo que tu negocio necesita para estar online y conectarse con tus clientes.
          </p>
          <div className="mt-12">
            <a
              href="#planes"
              className="inline-flex flex-col items-center gap-1 text-violet-300 hover:text-violet-200 transition-colors"
            >
              <span className="text-sm font-bold uppercase tracking-widest">Ver planes</span>
              <ChevronDown className="h-6 w-6 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      <section id="planes" className="py-20 md:py-28 relative bg-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              PLANES
            </div>
            <h2 className="font-display text-4xl md:text-5xl mb-4 text-slate-900">
              Elegí el plan que{" "}
              <span className="text-primary">tu negocio necesita</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Precios fijos, sin sorpresas. Reserva con seña y aboná el resto al entregar el servicio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto items-start">
            {services.map((s, i) => (
              <ServiceCard key={s.id} s={s} i={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
