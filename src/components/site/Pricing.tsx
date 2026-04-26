import { Check, Globe, Layers, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Plan = {
  name: string;
  price: string;
  sub: string;
  desc: string;
  effort: string;
  features: string[];
  highlighted?: boolean;
  cta?: string;
};

type Category = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  intro: string;
  plans: Plan[];
};

const categories: Category[] = [
  {
    id: "webs",
    label: "Páginas Web",
    icon: Globe,
    intro: "Tu presencia online lista para vender, sin tecnicismos.",
    plans: [
      {
        name: "Básico",
        price: "USD 290",
        sub: "pago único + USD 19/mes",
        desc: "Una landing simple para mostrar tu negocio.",
        effort: "Entrega en 5 días",
        features: [
          "Landing page de 1 sección",
          "Diseño responsive",
          "Formulario de contacto",
          "WhatsApp integrado",
          "Hosting incluido",
        ],
        cta: "Empezar ahora",
      },
      {
        name: "Intermedio",
        price: "USD 590",
        sub: "pago único + USD 39/mes",
        desc: "Web multi-sección para crecer en serio.",
        effort: "Entrega en 10 días",
        features: [
          "Web de hasta 5 secciones",
          "Diseño premium personalizado",
          "Reservas y formularios",
          "SEO básico",
          "Mantenimiento mensual",
          "Soporte prioritario",
        ],
        highlighted: true,
        cta: "Empezar ahora",
      },
      {
        name: "Premium",
        price: "USD 1.290",
        sub: "pago único + USD 69/mes",
        desc: "Web completa con optimización e integraciones.",
        effort: "Entrega en 3 semanas",
        features: [
          "Web ilimitada en secciones",
          "Diseño exclusivo a medida",
          "SEO avanzado + analítica",
          "Integraciones (CRM, email, pagos)",
          "Velocidad y rendimiento óptimos",
          "Soporte dedicado",
        ],
        cta: "Consultar",
      },
    ],
  },
  {
    id: "sistemas",
    label: "Sistemas Web",
    icon: Layers,
    intro: "Software a medida para gestionar y escalar tu operación.",
    plans: [
      {
        name: "Básico",
        price: "USD 690",
        sub: "pago único + USD 29/mes",
        desc: "Sistema simple para una tarea concreta.",
        effort: "Bajo esfuerzo · 1-2 semanas",
        features: [
          "Sistema de 1 módulo",
          "Login básico",
          "Panel de administración",
          "Base de datos incluida",
          "Hosting y soporte",
        ],
        cta: "Empezar ahora",
      },
      {
        name: "Intermedio",
        price: "USD 1.490",
        sub: "pago único + USD 59/mes",
        desc: "Gestión con usuarios, roles y reportes.",
        effort: "Esfuerzo medio · 3-4 semanas",
        features: [
          "Múltiples módulos integrados",
          "Usuarios y roles",
          "Reportes y exportaciones",
          "Notificaciones por email",
          "Mantenimiento mensual",
          "Soporte prioritario",
        ],
        highlighted: true,
        cta: "Empezar ahora",
      },
      {
        name: "Premium",
        price: "Desde USD 3.500",
        sub: "presupuesto + USD 99/mes",
        desc: "Sistema completo a medida para tu negocio.",
        effort: "Esfuerzo alto · proyecto a medida",
        features: [
          "Arquitectura a medida",
          "Integraciones con APIs externas",
          "Pagos online y facturación",
          "Dashboards avanzados",
          "Escalabilidad y seguridad",
          "Soporte dedicado",
        ],
        cta: "Consultar",
      },
    ],
  },
  {
    id: "ia",
    label: "Automatizaciones con IA",
    icon: Bot,
    intro: "Automatizá tareas repetitivas y vendé mientras dormís.",
    plans: [
      {
        name: "Básico",
        price: "USD 390",
        sub: "pago único + USD 25/mes",
        desc: "Una automatización simple lista para usar.",
        effort: "1 flujo · entrega rápida",
        features: [
          "1 flujo automatizado",
          "Conexión con WhatsApp o email",
          "Respuestas automáticas",
          "Plantillas pre-armadas",
          "Soporte inicial",
        ],
        cta: "Empezar ahora",
      },
      {
        name: "Intermedio",
        price: "USD 890",
        sub: "pago único + USD 49/mes",
        desc: "Integraciones y flujos conectados entre apps.",
        effort: "Hasta 5 flujos integrados",
        features: [
          "Hasta 5 flujos automatizados",
          "Integraciones (Sheets, CRM, Notion)",
          "Chatbot básico con IA",
          "Reportes automáticos",
          "Mantenimiento mensual",
        ],
        highlighted: true,
        cta: "Empezar ahora",
      },
      {
        name: "Premium",
        price: "Desde USD 1.890",
        sub: "presupuesto + USD 89/mes",
        desc: "Automatización avanzada con IA personalizada.",
        effort: "Proyecto a medida",
        features: [
          "Agentes de IA entrenados con tu info",
          "Automatizaciones ilimitadas",
          "Integraciones personalizadas",
          "Análisis predictivo",
          "Optimización continua",
          "Soporte dedicado",
        ],
        cta: "Consultar",
      },
    ],
  },
];

export function Pricing() {
  return (
    <section id="precios" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-medium text-primary mb-3">SERVICIOS Y PLANES</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Elegí el servicio que <span className="text-gradient">tu negocio necesita</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tres categorías, tres niveles. Empezá simple y escalá cuando estés listo.
          </p>
        </div>

        <Tabs defaultValue="webs" className="w-full">
          <TabsList className="mx-auto mb-12 grid w-full max-w-2xl grid-cols-1 sm:grid-cols-3 h-auto bg-card/50 p-1.5 rounded-xl">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <TabsTrigger
                  key={c.id}
                  value={c.id}
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg py-3 gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{c.label}</span>
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
                    className={`relative p-8 rounded-2xl flex flex-col ${
                      p.highlighted
                        ? "bg-gradient-to-b from-primary/20 to-card border-2 border-primary shadow-glow"
                        : "glass"
                    }`}
                  >
                    {p.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                        Más elegido
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className="mb-4">
                      <div className="text-4xl font-display font-bold">{p.price}</div>
                      <div className="text-sm text-muted-foreground mt-1">{p.sub}</div>
                    </div>
                    <div className="mb-6 inline-flex self-start px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                      {p.effort}
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-3 text-sm">
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
