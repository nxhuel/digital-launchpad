import { ArrowRight, Globe, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useReveal } from "@/hooks/use-reveal";
import { ROUTES } from "@/config/site";

const plans = [
  {
    icon: CreditCard,
    title: "Tarjetas Digitales",
    desc: "Invitaciones y regalos interactivos.",
    price: "Desde $20.000",
    suffix: "ARS",
    features: [
      "Catálogo con diseños listos para usar",
      "Personalización disponible",
      "Entrega en 48 horas",
    ],
    href: ROUTES.tarjetas,
    accent: "rose",
  },
  {
    icon: Globe,
    title: "Soluciones Web",
    desc: "Páginas webs, e-commerce y sistemas a medida.",
    price: "Desde $80.000",
    suffix: "ARS",
    features: [
      "Landing pages hasta sistemas complejos",
      "Diseño responsive y moderno",
      "Pago único al finalizar",
    ],
    href: ROUTES.soluciones,
    accent: "violet",
  },
];

const accentMap: Record<string, { iconBg: string; text: string }> = {
  violet: {
    iconBg: "bg-violet-100",
    text: "text-violet-700",
  },
  rose: {
    iconBg: "bg-rose-100",
    text: "text-rose-600",
  },
};

export function Pricing() {
  const ref = useReveal(0.08);

  return (
    <section id="planes" className="py-20 md:py-28 relative bg-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className="reveal text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            PLANES
          </div>
          <h2 className="font-display text-4xl md:text-5xl mb-4 text-slate-900">
            Elegí lo que <span className="text-primary">necesitás</span>
          </h2>
          <p className="text-slate-500 text-base leading-relaxed">
            Dos líneas de producto.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((p) => {
            const Icon = p.icon;
            const a = accentMap[p.accent];
            return (
              <div
                key={p.title}
                className="relative flex flex-col p-8 md:p-10 bg-white border-2 border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >

                <h3 className="text-2xl font-bold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-4">{p.desc}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-slate-900">{p.price}</span>
                    <span className="text-sm font-semibold text-slate-400">{p.suffix}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-tight mt-1">
                    Pago único · Sin mantenimiento obligatorio
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f) => (
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
                  className={`mt-auto w-full h-13 font-bold bg-slate-900 hover:bg-slate-800 text-white`}
                >
                  <Link to={p.href}>
                    Ver más <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
