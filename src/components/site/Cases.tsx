<<<<<<< HEAD
import { UtensilsCrossed, Shirt, Briefcase } from "lucide-react";

const cases = [
  {
    icon: UtensilsCrossed,
    tag: "Gastronomía",
    title: "La Trattoria",
    desc: "Restaurante familiar que ahora vende online y recibe reservas automáticas.",
    url: "https://ejemplo.com",
  },
  {
    icon: Shirt,
    tag: "Indumentaria",
    title: "Norte Clothing",
    desc: "Marca de ropa que abrió su tienda digital y vende en todo el país.",
    url: "https://ejemplo.com",
  },
  {
    icon: Briefcase,
    tag: "Servicios",
    title: "Estudio Vega",
    desc: "Consultora con landing profesional que duplicó sus consultas mensuales.",
    url: "https://ejemplo.com",
  },
=======
import { UtensilsCrossed, Shirt, Briefcase, TrendingUp, Star } from "lucide-react";

const cases = [
  { icon: UtensilsCrossed, tag: "Gastronomía", title: "La Trattoria", desc: "Restaurante familiar que ahora vende online y recibe reservas automáticas.", metric: "+180% pedidos" },
  { icon: Shirt, tag: "Indumentaria", title: "Norte Clothing", desc: "Marca de ropa que abrió su tienda digital y vende en todo el país.", metric: "+340% ventas" },
  { icon: Briefcase, tag: "Servicios", title: "Estudio Vega", desc: "Consultora con landing profesional que duplicó sus consultas mensuales.", metric: "x2 consultas" },
];

const testimonials = [
  { name: "Camila R.", role: "Dueña de pastelería", text: "No sabía nada de tecnología y en una semana tenía mi web vendiendo. Increíble la atención." },
  { name: "Martín L.", role: "Diseñador freelance", text: "Mi landing me trajo más clientes en un mes que años de Instagram. Súper recomendados." },
  { name: "Lucía F.", role: "Marca de ropa", text: "Pensé que iba a ser carísimo y complicado. Fue todo lo contrario. Hoy facturo el doble." },
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
];

export function Cases() {
  return (
    <section id="casos" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
            Casos reales & testimonios
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4 leading-[1.1]">
            Negocios que ya <span className="text-primary italic">despegaron</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {cases.map((c) => (
            <article key={c.title} className="p-7 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
                  <c.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {c.tag}
                </span>
              </div>
<<<<<<< HEAD
              <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{c.desc}</p>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-gradient hover:underline"
              >
                Ver sitio web →
              </a>
=======
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{c.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{c.desc}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <TrendingUp className="h-4 w-4" />
                {c.metric}
              </div>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
            </article>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure key={t.name} className="p-7 rounded-2xl bg-card border border-border">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-foreground/85 leading-relaxed mb-6">
                "{t.text}"
              </blockquote>
              <figcaption>
                <div className="font-semibold text-foreground">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
