import { useEffect, useRef } from "react";
import { MessageSquare, Zap, HeartHandshake, Rocket, Users, Award } from "lucide-react";

const values = [
  {
    icon: MessageSquare,
    title: "Hablamos claro, sin tecnicismos",
    desc: "Te explicamos todo en simple. Sin jerga técnica, sin vueltas. Sabemos que tu tiempo es valioso.",
  },
  {
    icon: Zap,
    title: "Soluciones listas para usar",
    desc: "Entregamos proyectos que funcionan desde el día uno. Sin bugs escondidos ni promesas incumplidas.",
  },
  {
    icon: HeartHandshake,
    title: "Te acompaamos de verdad",
    desc: "No somos una agencia fría. Respondemos por WhatsApp, te guiamos y seguimos ahí después del lanzamiento.",
  },
  {
    icon: Rocket,
    title: "Resultados en días, no en meses",
    desc: "Procesos eficientes y sin burocracia. Tu negocio online funcionando antes de lo que imaginás.",
  },
];

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

export function Identity() {
  const leftRef  = useReveal();
  const rightRef = useReveal(0.08);

  return (
    <section id="nosotros" className="py-20 md:py-28 relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px] -z-10" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">NOSOTROS</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Conocenos y descubrí por qué <span className="text-primary">elegirnos</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div ref={leftRef} className="reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Users className="h-3 w-3" /> Qun somos
            </div>
            <p className="text-2xl md:text-3xl font-display font-semibold leading-snug text-foreground mb-6">
              Somos un equipo que une{" "}
              <span className="text-primary">diseo, tecnologa y estrategia</span>{" "}
              para hacer crecer negocios reales.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed mb-6">
              No somos una agencia genrica. Nos involucramos en cada proyecto como
              si fuera el nuestro. Entendemos tus objetivos, proponemos soluciones
              concretas y las ejecutamos con cuidado.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Trabajamos con emprendedores, pymes y marcas que veulent dar el salto
              digital sin perder el tiempo en procesos complicados. La tecnologa es
              nuestra herramienta; tu crecimiento, nuestro objetivo.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass-card">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">+120 proyectos lanzados</div>
                <div className="text-xs text-muted-foreground">Emprendedores, pymes y marcas</div>
              </div>
            </div>
          </div>

          <div ref={rightRef} id="elegirnos" className="reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Award className="h-3 w-3" /> Por qu elegirnos
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {values.map((v, i) => {
                const VIcon = v.icon;
                return (
                  <div
                    key={v.title}
                    className="glass-card rounded-2xl p-6 hover:shadow-glow hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center mb-4">
                      <VIcon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-2 leading-snug">{v.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}