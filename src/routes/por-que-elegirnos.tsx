import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Zap, HeartHandshake, Rocket, Users, Award } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/por-que-elegirnos")({
  head: () => ({
    meta: [
      { title: "Por qué elegirnos — Clik" },
      { name: "description", content: "Descubre por qué elegir Clik para tu proyecto digital. Soporte cercano, resultados rápidos y calidad garantizada." },
    ],
  }),
  component: PorQueElegirnos,
});

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
    title: "Te acompañamos de verdad",
    desc: "No somos una agencia fría. Respondemos por WhatsApp, te guiamos y seguimos ahí después del lanzamiento.",
  },
  {
    icon: Rocket,
    title: "Resultados en días, no en meses",
    desc: "Procesos eficientes y sin burocracia. Tu negocio online funcionando antes de lo que imaginás.",
  },
];

function PorQueElegirnos() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">POR QUÉ ELEGIRNOS</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
             Nuestra diferencia
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No somos una agencia cualquiera. Nos apasiona tu éxito tanto como el tuyo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => {
              const VIcon = v.icon;
              return (
                <div
                  key={v.title}
                  className="glass-card rounded-2xl p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center mb-5">
                    <VIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 leading-snug">{v.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link to="/" className="text-primary font-semibold hover:underline">
              Ver nuestros casos de éxito →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}