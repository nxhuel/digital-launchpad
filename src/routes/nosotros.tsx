import { createFileRoute, Link } from "@tanstack/react-router";
import { Linkedin, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, ROUTES } from "@/config/site";
import clikBanner from "@/assets/CLIK.jpg";
import nosotrosEquipo from "@/assets/nosotros.png";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Nosotros — Clik Agencia Digital" },
      {
        name: "description",
        content:
          "Conocé a Clik. Somos Nahuel y Julieta, una agencia digital que ayuda a emprendedores a llevar su negocio al mundo digital.",
      },
      {
        property: "og:title",
        content: "Nosotros — Clik Agencia Digital",
      },
      {
        property: "og:description",
        content:
          "Diseño, tecnología y estrategia para hacer crecer negocios reales.",
      },
    ],
  }),
  component: Nosotros,
});

const team = [
  {
    name: "Julieta Risso",
    role: "Diseñadora UI/UX; CM & Analista",
    linkedin: "https://www.linkedin.com/in/julieta-r-911192263/",
  },
  {
    name: "Nahuel Tisera",
    role: "Software Dev & Analista",
    linkedin: "https://www.linkedin.com/in/tisera-nahuel-ab3864219/",
  },
];

const values = [
  {
    title: "Hablamos claro, sin tecnicismos",
    desc: "Te explicamos todo en simple. Sin jerga técnica, sin vueltas.",
  },
  {
    title: "Soluciones listas para usar",
    desc: "Entregamos proyectos que funcionan desde el día uno.",
  },
  {
    title: "Te acompañamos de verdad",
    desc: "No somos una agencia fría. Respondemos por WhatsApp, te guiamos y seguimos ahí después del lanzamiento.",
  },
  {
    title: "Resultados en días, no en meses",
    desc: "Procesos eficientes y sin burocracia. Tu negocio online funcionando antes de lo que imaginás.",
  },
];

function Nosotros() {
  return (
    <main>
      <section className="bg-[#F1F1F3] h-[200px] md:h-[280px] overflow-hidden">
        <img
          src={clikBanner}
          alt="Clik Agencia Digital"
          className="w-full h-full object-cover"
        />
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white overflow-hidden border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)">
            <div className="grid md:grid-cols-2 items-center">
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={nosotrosEquipo}
                  alt="Equipo Clik"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40" />
              </div>
              <div className="pl-4 space-y-8">
                <div className="space-y-4">
                  <div className="h-1.5 w-12 bg-primary" />
                  <h2 className="text-3xl md:text-5xl font-display font-medium text-slate-900 leading-tight">
                    El motor detrás de <br />
                    <span className="text-primary">Clik</span>
                  </h2>
                  <p className="text-lg text-slate-500 leading-relaxed font-medium">
                    Combinamos tu visión con la ejecución técnica para transformar ideas en productos
                    digitales de alto impacto.
                  </p>
                </div>

                <div className="space-y-4 mr-4">
                  {team.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 hover:border-primary/20 transition-colors group/item"
                    >
                      <div>
                        <div className="text-lg font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest">
                          {p.role}
                        </div>
                      </div>
                      <a
                        href={p.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              Por qué elegirnos
            </div>
            <h2 className="font-display text-4xl md:text-5xl mb-4">Nuestra diferencia</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No somos una agencia cualquiera. Nos apasiona tu éxito tanto como el tuyo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="p-8 border border-slate-200 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-emerald-500 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 leading-snug">
                      {v.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
