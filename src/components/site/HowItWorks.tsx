import { useEffect, useRef } from "react";
import { MessageSquare, PenTool, Rocket } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: MessageSquare,
    title: "Contanos tu idea",
    image:
      "https://images.unsplash.com/photo-1598520106830-8c45c2035460?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Charlamos por WhatsApp, completás un rápido formulario o videollamada. Entendemos tu negocio, tus objetivos y lo que realmente necesitás.",
  },
  {
    n: "02",
    icon: PenTool,
    title: "Diseñamos tu solución",
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000",
    desc: "Armamos una propuesta a medida. Te mostramos avances reales en cada etapa, sin sorpresas.",
  },
  {
    n: "03",
    icon: Rocket,
    title: "Lanzamos tu negocio",
    image:
      "https://images.unsplash.com/flagged/photo-1553267252-d100936057c1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Te entregamos todo funcionando y te explicamos cómo usarlo. El soporte no termina al entregar.",
  },
];

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
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function HowItWorks() {
  const ref = useReveal();

  return (
    <section id="como-funciona" className="py-20 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-medium tracking-widest text-primary uppercase mb-3">
            Cómo funciona
          </div>
          <h2 className="font-display text-4xl md:text-5xl  mb-4">
            3 pasos para <span className="text-primary">estar online</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Un proceso claro, sin sorpresas, pensado para que sea fácil desde el primer día.
          </p>
        </div>

        <div ref={ref} className="reveal relative">
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/5 to-primary/20 to-primary/5 -translate-y-1/2 -z-10" />

          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            {steps.map((s, i) => {
              const StepIcon = s.icon;
              return (
                <div key={s.n} className="group relative">
                  <div className="bg-white h-full rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-500 group-hover:-translate-y-2">
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={s.image}
                        alt={s.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-4 right-4 h-14 w-14 rounded-full bg-white shadow-2xl flex items-center justify-center text-2xl font-display font-bold text-primary">
                        {s.n}
                      </div>
                    </div>

                    <div className="p-10">
                      <div className="flex items-center gap-5 mb-5">
                        <div className="h-14 w-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm group-hover:scale-110 transition-transform">
                          <StepIcon className="h-7 w-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground leading-tight">
                          {s.title}
                        </h3>
                      </div>

                      <p className="text-muted-foreground leading-relaxed text-base">{s.desc}</p>
                    </div>

                    <div className="h-2 w-full bg-slate-50 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-indigo-500 w-0 group-hover:w-full transition-all duration-1000 ease-in-out" />
                    </div>
                  </div>

                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-card shadow-card border border-border flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}