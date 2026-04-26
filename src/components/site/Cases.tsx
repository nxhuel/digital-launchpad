import { UtensilsCrossed, Shirt, Briefcase, TrendingUp } from "lucide-react";

const cases = [
  {
    icon: UtensilsCrossed,
    tag: "Gastronomía",
    title: "La Trattoria",
    desc: "Restaurante familiar que ahora vende online y recibe reservas automáticas.",
    metric: "+180% pedidos",
  },
  {
    icon: Shirt,
    tag: "Indumentaria",
    title: "Norte Clothing",
    desc: "Marca de ropa que abrió su tienda digital y vende en todo el país.",
    metric: "+340% ventas",
  },
  {
    icon: Briefcase,
    tag: "Servicios",
    title: "Estudio Vega",
    desc: "Consultora con landing profesional que duplicó sus consultas mensuales.",
    metric: "x2 consultas",
  },
];

export function Cases() {
  return (
    <section id="casos" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-medium text-primary mb-3">CASOS REALES</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Negocios que ya <span className="text-gradient">despegaron</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c) => (
            <article key={c.title} className="p-7 rounded-2xl glass hover:-translate-y-1 transition-transform duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
                  <c.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {c.tag}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{c.desc}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-gradient">
                <TrendingUp className="h-4 w-4 text-primary" />
                {c.metric}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
