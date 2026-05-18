import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Camila R.",
    role: "Dueña de pastelería",
    text: "No sabía nada de tecnología y en una semana tenía mi web vendiendo. Increíble la atención.",
    initials: "CR",
  },
  // {
  //   name: "Martín L.",
  //   role: "Diseñador freelance",
  //   text: "Mi landing me trajo más clientes en un mes que años de Instagram. Súper recomendados.",
  //   initials: "ML",
  // },
  // {
  //   name: "Lucía F.",
  //   role: "Marca de ropa",
  //   text: "Pensé que iba a ser carísimo y complicado. Fue todo lo contrario. Hoy facturo el doble.",
  //   initials: "LF",
  // },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function Testimonials() {
  const ref = useReveal();

  return (
    <section className="relative">
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-violet-200/20 blur-[90px] -z-10" />
      <div className="max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center max-w-2xl mx-auto ">
          {/* <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Testimonios</div> */}
          {/* <h2 className="font-display text-4xl md:text-5xl font-bold">
            Lo que dicen quienes{" "}
            <span className="text-gradient">ya lo lograron</span>
          </h2> */}
        </div>

        <div ref={ref} className="reveal grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <figure key={t.name} className="glass-card rounded-2xl p-7 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-foreground/80 leading-relaxed mb-6 flex-1 text-sm">
                &ldquo;{t.text}&rdquo;
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
  );
}
