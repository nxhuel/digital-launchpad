import { createFileRoute } from "@tanstack/react-router";
import { UtensilsCrossed, Shirt, Briefcase, Star } from "lucide-react";

export const Route = createFileRoute("/nuestros-trabajos")({
  head: () => ({
    meta: [
      { title: "Nuestros trabajos y testimonios — Clik" },
      { name: "description", content: "Conoce nuestros casos de éxito y lo que dicen nuestros clientes.+120 proyectos lanzados." },
    ],
  }),
  component: NuestrosTrabajos,
});

const cases = [
  {
    icon: UtensilsCrossed,
    tag: "Gastronomía",
    title: "La Trattoria",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000",
    desc: "Restaurante familiar que ahora recibe reservas automáticas y vende online sin esfuerzo.",
    url: "https://ejemplo.com",
  },
  {
    icon: Shirt,
    tag: "Indumentaria",
    title: "Norte Clothing",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000",
    desc: "Marca de ropa que abrió su tienda digital y vende en todo el país desde el día uno.",
    url: "https://ejemplo.com",
  },
  {
    icon: Briefcase,
    tag: "Servicios",
    title: "Estudio Vega",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
    desc: "Consultora con landing profesional que duplicó sus consultas mensuales en 30 días.",
    url: "https://ejemplo.com",
  },
];

const testimonials = [
  {
    name: "Camila R.",
    role: "Dueña de pastelería",
    text: "No sabía nada de tecnología y en una semana tenía mi web vendiendo. Increíble la atención.",
    initials: "CR",
  },
  {
    name: "Martín L.",
    role: "Diseñador freelance",
    text: "Mi landing me trajo más clientes en un mes que años de Instagram. Super recomendados.",
    initials: "ML",
  },
  {
    name: "Lucía F.",
    role: "Marca de ropa",
    text: "Pensé que iba a ser carísimo y complicado. Fue todo lo contrario. Hoy facturo el doble.",
    initials: "LF",
  },
];

function NuestrosTrabajos() {
  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Cases Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">CASOS REALES</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Negocios que ya <span className="text-primary">despegaron</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Proyectos reales con resultados medibles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {cases.map((c) => (
              <article
                key={c.title}
                className="glass-card group rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden image-overlay relative">
                  <img 
                    src={c.image} 
                    alt={c.title} 
                    className="w-full h-full object-cover img-zoom"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/90 shadow-card text-foreground backdrop-blur-md">
                      {c.tag}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{c.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                    {c.desc}
                  </p>
                  
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between mt-auto pt-4 border-t border-border/50 group"
                  >
                    <span className="text-sm font-bold text-primary group-hover:underline">
                      Ver sitio web →
                    </span>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Caso de éxito
                    </div>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">TESTIMONIOS</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lo que dicen quienes <span className="text-primary">ya lo lograron</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <figure key={t.name} className="glass-card rounded-2xl p-7 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-foreground/80 leading-relaxed mb-6 flex-1 text-sm">
                  "{t.text}"
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-white text-xs font-bold shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}