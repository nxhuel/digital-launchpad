import { PenTool, CreditCard } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

const steps = [
  {
    n: "01",
    icon: PenTool,
    title: "Contanos tu idea",
    desc: "Nos contás qué necesitás y definimos el alcance del proyecto. Sin vueltas, sin compromiso.",
    image: "https://images.unsplash.com/photo-1598520106830-8c45c2035460?auto=format&fit=crop&q=80&w=600",
  },
  {
    n: "02",
    icon: PenTool,
    title: "Desarrollamos",
    desc: "Trabajamos en tu proyecto con comunicación constante. Te mostramos avances y hacemos revisiones hasta que esté aprobado.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600",
  },
  {
    n: "03",
    icon: CreditCard,
    title: "Pagás al finalizar",
    desc: "Cuando el trabajo está listo y aprobado, te enviamos el link de pago. Recibís la entrega final al confirmar.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=600",
  },
];

export function HowItWorks() {
  const ref = useReveal(0.12);

  return (
    <section id="como-funciona" className="py-20 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-medium tracking-widest text-primary uppercase mb-3">
            Cómo funciona
          </div>
          <h2 className="font-display text-4xl md:text-5xl mb-4">
            Así de <span className="text-primary">simple</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Sin adelantos, sin compromisos. Primero trabajamos, después cobramos.
          </p>
        </div>

        <div ref={ref} className="reveal relative">
          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            {steps.map((s, i) => {
              const StepIcon = s.icon;
              return (
                <div key={s.n} className="group relative">
                  <div className="bg-white h-full overflow-hidden border border-slate-100 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <img
                        src={s.image}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <div className="h-8 w-8 flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
                          <StepIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-bold text-white/80">{s.n}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{s.desc}</p>
                    </div>
                    <div className="h-1 w-full bg-slate-50 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-indigo-500 w-0 group-hover:w-full transition-all duration-1000 ease-in-out" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
