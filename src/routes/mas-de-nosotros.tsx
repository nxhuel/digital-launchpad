import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Star, Menu, X, ArrowRight, Sparkles, Linkedin } from "lucide-react";
import { Footer } from "../components/site/Footer";
import clikLogo from "../assets/logo-v2.png";

export const Route = createFileRoute("/mas-de-nosotros")({
  head: () => ({
    meta: [
      { title: "Más de nosotros — Clik" },
      {
        name: "description",
        content: "Conoce más sobre Clik. Nuestro equipo, casos de éxito y testimonios.",
      },
    ],
  }),
  component: MasDeNosotros,
});

import HERO_BG from "../assets/image-2.png";
import PARTNERS_IMAGE from "../assets/nosotros-2.png";
import PETSHOP_CLIENT from "../assets/petshot-cliente.png";

const clients = [
  {
    tag: "PetShop",
    title: "Mi Amigo Fiel",
    image: PETSHOP_CLIENT,
    desc: "Emprendimiento familiar",
    url: "https://miamigofiel.clik.com.ar/",
  },
  // {
  //   tag: "Moda",
  //   title: "Norte Clothing",
  //   image:
  //     "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
  //   desc: "Tienda digital",
  //   metric: "+340% ventas",
  // },
  // {
  //   tag: "Servicios",
  //   title: "Estudio Vega",
  //   image:
  //     "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
  //   desc: "Consultora",
  //   metric: "x2 consultas",
  // },
];

const testimonials = [
  {
    name: "Azul R.",
    role: "Dueña de petshop",
    text: "Pase de tener todo desordenado por WhatsApp a contar con una página web profesional en solo una semana. Ahora mis clientes pueden ver el catálogo fácilmente y el negocio se ve mucho más organizado y confiable.",
    initials: "AZ",
  },
  // {
  //   name: "Martín L.",
  //   role: "Diseñador freelance",
  //   text: "Mi landing me trajo más clientes.",
  //   initials: "ML",
  // },
  // {
  //   name: "Lucía F.",
  //   role: "Marca de ropa",
  //   text: "Fue todo lo contrario. Facturo el doble.",
  //   initials: "LF",
  // },
];

const marqueeItems = [
  { value: "3+", label: "Proyectos" },
  { value: "3+", label: "Clientes" },
  { value: "1+", label: "Años" },
  { value: "4.9★", label: "Rating" },
  { value: "24/7", label: "Soporte" },
];

function useScrollSpy(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState("");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sectionIds]);
  return activeSection;
}

function Marquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="py-10 bg-background border-y border-border/50 overflow-hidden">
      <div
        ref={containerRef}
        className="flex gap-6 min-w-max"
        style={{ animation: isPaused ? "none" : "var(--animate-scroll-horizontal)" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-muted/50 border border-border/30 shrink-0"
          >
            <div className="text-3xl font-bold text-primary">{item.value}</div>
            <div className="text-sm font-medium text-foreground/70">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MasDeNosotros() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useScrollSpy(["equipo", "clientes", "contacto"]);

  return (
    <div className="min-h-screen bg-background">
      <header
        className={`fixed top-4 inset-x-0 z-50 transition-all duration-500 px-4 md:px-6 pointer-events-none`}
      >
        <div
          className={`max-w-6xl mx-auto h-16 flex items-center justify-between rounded-full px-6 md:px-10 transition-all duration-500 pointer-events-auto bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50`}
        >
          <a href="/" className="flex items-center gap-2 group">
            <div className="px-2 py-1 rounded-xl bg-slate-900/5 transition-colors group-hover:bg-slate-900/10">
              <img src={clikLogo} alt="Clik Logo" className="h-8 w-auto object-contain" />
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: "equipo", label: "Equipo" },
              { id: "clientes", label: "Clientes" },
              { id: "contacto", label: "Contacto" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${activeSection === link.id ? "text-primary bg-primary/5 rounded-full" : "text-slate-600 hover:text-primary"}`}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="/#contacto"
            className="hidden md:block px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-primary/20"
          >
            Empezar ahora
          </a>
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden mt-2 mx-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xl pointer-events-auto">
            {[
              { id: "equipo", label: "Equipo" },
              { id: "clientes", label: "Clientes" },
              { id: "contacto", label: "Contacto" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-base font-bold text-slate-700 hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main className="" id="equipo">
        {/* Vibrant Header - AgroPulse style */}
        <section className="relative pt-25 pb-15  flex items-center justify-center overflow-hidden bg-indigo-600">
          <div className="absolute inset-0 z-0">
            <img
              src={HERO_BG}
              alt="Clik Brand Banner"
              className="w-full h-full object-cover object-center opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 to-indigo-600/40" />
          </div>

          <div className="relative z-10 text-center px-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-black text-white uppercase tracking-[0.25em] mb-6">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
              Nuestra Identidad
            </div>

            <h1 className="text-5xl md:text-7xl font-display text-white drop-shadow-xl">
              Más de <span className="italic font-light text-blue-200">nosotros</span>
            </h1>
            <div className="h-1.5 w-24 bg-white/40 rounded-full mx-auto mt-8" />
          </div>
        </section>

        {/* Partners Section - Light & Clean */}
        <section className="bg-slate-50 relative ">
          <div className="max-w-5xl mx-auto px-6">
            <div className="group relative bg-white rounded-[3rem] overflow-hidden border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-700">
              <div className="grid md:grid-cols-2 items-center">
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={PARTNERS_IMAGE}
                    alt="Fundadores de Clik"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40" />
                </div>
                <div className="p-10 md:p-14 space-y-8">
                  <div className="space-y-4">
                    <div className="h-1.5 w-12 bg-primary rounded-full" />
                    <h2 className="text-3xl md:text-5xl font-display font-medium text-slate-900 leading-tight">
                      El motor detrás de <br />
                      <span className="text-primary italic">Clik</span>
                    </h2>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium">
                      Combinamos tu visión con la ejecución técnica para transformar ideas en
                      productos digitales de alto impacto.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        name: "Julieta Risso",
                        role: "Diseñadora UI/UX; CM & Analista",
                        url: "https://www.linkedin.com/in/julieta-r-911192263/",
                      },
                      {
                        name: "Nahuel Tisera",
                        role: "Software Dev & Analista",
                        url: "https://www.linkedin.com/in/tisera-nahuel-ab3864219/",
                      },
                    ].map((p) => (
                      <div
                        key={p.name}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-colors group/item"
                      >
                        <div>
                          <div className="text-lg font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] font-black text-primary uppercase tracking-widest">
                            {p.role}
                          </div>
                        </div>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 w-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all"
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

        <Marquee />

        <section id="clientes" className="py-24 bg-muted/20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-4">
                CASOS DE ÉXITO
              </div>
              <h2 className="text-4xl md:text-5xl font-display text-foreground">
                Nuestros clientes <span className="text-primary italic">& sus historias</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {clients.map((c, i) => {
                const t = testimonials[i]; // Pair client with testimonial
                return (
                  <div key={c.title} className="flex flex-col gap-2">
                    {/* Case Card */}
                    <article className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={c.image}
                          alt={c.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-7">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                          {c.tag}
                        </span>
                        <h3 className="text-xl font-bold text-foreground mt-2">{c.title}</h3>
                        <p className="text-sm text-foreground/70 leading-relaxed">{c.desc}</p>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 pt-6 border-t border-border/50 group"
                        >
                          <span className="text-sm font-bold text-primary group-hover:underline">
                            Visitar sitio web →
                          </span>
                        </a>
                      </div>
                    </article>

                    {/* Associated Testimonial */}
                    {t && (
                      <figure className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 border border-border/30 hover:border-primary/20 transition-colors shadow-sm">
                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                          ))}
                        </div>
                        <blockquote className="text-foreground/80 mb-5 text-sm italic leading-relaxed">
                          "{t.text}"
                        </blockquote>
                        <figcaption className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary text-[10px] font-bold border border-primary/20">
                            {t.initials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">{t.name}</div>
                            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                              {t.role}
                            </div>
                          </div>
                        </figcaption>
                      </figure>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contacto" className="py-24 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-display text-foreground mb-6">
              ¿Listo para dar el <span className="text-primary">siguiente paso</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Hablemos y veamos cómo podemos potenciar tu negocio con una presencia digital de alto
              nivel.
            </p>
            <a
              href="/#contacto"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1"
            >
              Empezar ahora
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
