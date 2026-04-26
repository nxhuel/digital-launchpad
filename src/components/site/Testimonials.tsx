import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Camila R.",
    role: "Dueña de pastelería",
    text: "No sabía nada de tecnología y en una semana tenía mi web vendiendo. Increíble la atención.",
  },
  {
    name: "Martín L.",
    role: "Diseñador freelance",
    text: "Mi landing me trajo más clientes en un mes que años de Instagram. Súper recomendados.",
  },
  {
    name: "Lucía F.",
    role: "Marca de ropa",
    text: "Pensé que iba a ser carísimo y complicado. Fue todo lo contrario. Hoy facturo el doble.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-medium text-primary mb-3">TESTIMONIOS</div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Lo que dicen quienes <span className="text-gradient">ya despegaron</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure key={t.name} className="p-7 rounded-2xl glass">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-foreground/90 leading-relaxed mb-6">
                "{t.text}"
              </blockquote>
              <figcaption>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
