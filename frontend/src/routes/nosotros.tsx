import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Linkedin,
  Instagram,
  ArrowRight,
  Check,
  Quote,
  Star,
  ShieldCheck,
  Scale,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, ROUTES } from "@/config/site";
import clikBanner from "@/assets/CLIK.jpg";
import nosotrosEquipo from "@/assets/nosotros.png";
import petshopWeb from "@/assets/petshop-web.png";
import logoAtAbogadas from "@/assets/logo-at-abogadas.png";

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

const atServices = [
  {
    icon: ShieldCheck,
    title: "Propiedad Intelectual y Derecho de Autor",
    desc: "n/a",
  },
  {
    icon: Scale,
    title: "Protección y Registro de Marca",
    desc: "n/a",
  },
  {
    icon: BadgeCheck,
    title: "Protección y Registro de Patentes",
    desc: "n/a",
  },
  {
    icon: BadgeCheck,
    title: "Redacción de Contratos",
    desc: "n/a",
  },
];

function AtAbogadasCard() {
  return (
    <article className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden group">
      <div className="relative w-full bg-black">
        <img
          src={logoAtAbogadas}
          alt="Logo de AT Abogadas"
          loading="lazy"
          className="w-full h-36 md:h-44 object-cover"
        />
      </div>
      <div className="p-6 md:p-7">
        <div className="text-[10px] font-black text-primary uppercase tracking-widest">
          Alianza estratégica
        </div>
        <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-1.5">AT Abogadas</h3>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Dra. Antonella Tisera &amp; Dra. Laura Agrelo
        </p>

        <div className="pt-5 mt-5 border-t border-slate-100">
          <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            Principales servicios legales
          </div>
          <div className="space-y-3">
            {atServices.map((s) => (
              <div key={s.title} className="flex items-start gap-1">
                <span className="h-4 w-4 text-black font-bold">*</span>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-snug">{s.title}</div>
                </div>
              </div>
            ))}
            <a
              href="https://www.instagram.com/at.abogadas/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 pt-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <Instagram className="h-4 w-4" />
              Consultar por Instagram
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

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
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">
            <div>
              <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
                Nuestro equipo
              </div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight mb-5">
                Desarrollo técnico y <span className="italic text-primary">respaldo legal</span> para tu proyecto
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Thiago se sumó al equipo para potenciar el desarrollo y el análisis de cada
                sistema. Y junto a <span className="font-semibold text-slate-700">AT Abogadas</span>
                , el estudio que registró nuestra marca, acompañan tu negocio en lo legal.
              </p>
            </div>

            <div className="lg:col-span-2 grid lg:grid-cols-5 gap-5 items-start">
              <article className="lg:col-span-2 group">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-[3/4]">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-indigo-600">
                    <span className="font-display text-6xl text-white/90 select-none">TC</span>
                    <span className="absolute -bottom-6 -right-4 font-display text-[9rem] leading-none text-white/10 select-none">
                      TC
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">Thiago Cassera</h3>
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest mt-1.5">
                    Desarrollador de Software & Analista de Sistemas
                  </div>
                  <a
                    href="https://www.linkedin.com/in/thiago-cassera-rodella-b06a5b2b8/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </div>
              </article>

              <AtAbogadasCard />
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

      <section className="pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              Testimonios
            </div>
            <h2 className="font-display text-4xl md:text-5xl mb-4">Nuestros clientes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              El primer cliente siempre se recuerda. Este es el caso de Azul, dueña de Mi Amigo
              Fiel.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="border border-slate-200 bg-white overflow-hidden">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 aspect-[4/3] md:aspect-auto overflow-hidden">
                  <img
                    src={petshopWeb}
                    alt="Mi Amigo Fiel - Sitio web"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="relative mb-6">
                    <Quote className="h-8 w-8 text-primary/20 absolute -top-2 -left-1" />
                    <p className="text-base md:text-lg text-slate-600 leading-relaxed italic relative z-10 pl-6">
                      &ldquo;{`Pase de tener todo desordenado por WhatsApp a contar con una página web profesional en solo una semana. Ahora mis clientes pueden ver el catálogo fácilmente y el negocio se ve mucho más organizado y confiable.`}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Azul R.</div>
                      <div className="text-sm text-slate-400">Dueña de Mi Amigo Fiel</div>
                    </div>
                    <a
                      href="https://miamigofiel.onrender.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Visitar sitio web <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
