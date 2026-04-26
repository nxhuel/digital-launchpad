import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Esencial",
    price: "USD 290",
    sub: "pago único + USD 19/mes",
    desc: "Perfecto para empezar con presencia profesional.",
    features: [
      "Landing page de 1 sección",
      "Diseño responsive",
      "Formulario de contacto",
      "WhatsApp integrado",
      "Hosting incluido",
    ],
    highlighted: false,
  },
  {
    name: "Negocio",
    price: "USD 590",
    sub: "pago único + USD 39/mes",
    desc: "Para emprendimientos que quieren crecer en serio.",
    features: [
      "Web de hasta 5 secciones",
      "Diseño premium personalizado",
      "Reservas y formularios",
      "SEO básico",
      "Mantenimiento mensual",
      "Soporte prioritario",
    ],
    highlighted: true,
  },
  {
    name: "Tienda",
    price: "USD 990",
    sub: "pago único + USD 59/mes",
    desc: "Vendé tus productos online sin límites.",
    features: [
      "Tienda online completa",
      "Pasarela de pagos",
      "Gestión de productos",
      "Envíos automáticos",
      "Panel de administración",
      "Capacitación incluida",
    ],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="precios" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-medium text-primary mb-3">PLANES</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Precios <span className="text-gradient">claros</span>, sin sorpresas
          </h2>
          <p className="text-lg text-muted-foreground">
            Elegí el plan que mejor se adapta a tu momento. Cambiá cuando quieras.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
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
              <div className="mb-6">
                <div className="text-4xl font-display font-bold">{p.price}</div>
                <div className="text-sm text-muted-foreground mt-1">{p.sub}</div>
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
                <a href="#contacto">Empezar</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
