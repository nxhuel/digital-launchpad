import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
<<<<<<< HEAD
import { ArrowLeft, MessageCircle, Sparkles, X, Eye, ArrowDown, ExternalLink } from "lucide-react";
=======
import { ArrowLeft, MessageCircle, Sparkles, X, Eye, Filter } from "lucide-react";
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { InvitePhone } from "@/components/site/InvitePhone";
import { ScrollableInvite } from "@/components/site/ScrollableInvite";
import { cardCategories, cardDesigns, type CardDesign } from "@/data/cards";
<<<<<<< HEAD
import bgHero from "@/assets/bg-hero-2.png";
import { InteractiveInvite } from "@/components/site/InteractiveInvite";
=======
import cardsHero from "@/assets/cards-hero.jpg";
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2

export const Route = createFileRoute("/tarjetas")({
  head: () => ({
    meta: [
      { title: "Catálogo de Tarjetas Digitales — Lanzar.studio" },
      {
        name: "description",
        content:
          "Invitaciones digitales interactivas: música, cuenta regresiva, mapa y RSVP por WhatsApp. Casamientos, XV, infantiles y eventos.",
      },
      { property: "og:title", content: "Catálogo de Tarjetas Digitales — Lanzar.studio" },
      {
        property: "og:description",
        content:
          "Invitaciones digitales modernas e interactivas. Mirá la demo y contratá por WhatsApp.",
      },
    ],
  }),
  component: TarjetasCatalog,
});

const WHATSAPP_NUMBER = "+541133501445";

function buildWhatsAppLink(design: CardDesign, categoryName: string) {
  const message = encodeURIComponent(
    `Hola! Me gustaría contratar la tarjeta digital "${design.name}" de la sección ${categoryName}.`,
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

const tagStyles: Record<string, string> = {
  Popular: "bg-primary text-white border-primary shadow-sm",
  Nuevo: "bg-emerald-600 text-white border-emerald-500 shadow-sm",
  Elegante: "bg-[#7C4E36] text-[#FDFBF7] border-[#B8956A] shadow-sm",
  Premium: "bg-indigo-600 text-white border-indigo-500 shadow-sm",
  Minimal: "bg-zinc-900 text-white border-zinc-800 shadow-sm",
};

function DesignCard({ design, categoryName }: { design: CardDesign; categoryName: string }) {
  const CardContent = (
    <>
      {/* Tag */}
      {design.tag && (
        <span
          className={`absolute top-3 left-3 z-20 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-lg border ${tagStyles[design.tag]}`}
        >
          {design.tag}
        </span>
      )}

      {/* Phone preview */}
      <div className="relative pt-10 pb-6 px-4 flex justify-center bg-gradient-to-b from-background/0 via-background/0 to-background/40">
        <div className="absolute inset-x-0 top-0 h-full -z-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="transition-transform duration-500 ease-out [transform:rotate(-3deg)] group-hover:[transform:rotate(0deg)_scale(1.04)]">
          <InvitePhone design={design} size="sm">
            {design.imageUrl && (
              <img src={design.imageUrl} alt={design.name} className="w-full h-full object-cover" />
            )}
          </InvitePhone>
        </div>

        {/* Reveal "Ver demo" overlay on hover */}
        <div className="absolute inset-0 grid place-items-center bg-black/0 group-hover:bg-black/40 backdrop-blur-0 group-hover:backdrop-blur-[2px] transition-all duration-300 opacity-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-white text-black shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="h-3.5 w-3.5" /> Ver demo
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="group relative rounded-2xl glass overflow-hidden flex flex-col transition-all duration-500 hover:border-primary/50 hover:-translate-y-1 hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      {design.demoUrl ? (
        <a
          href={design.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block"
        >
          {CardContent}
        </a>
      ) : (
        <div className="relative block">{CardContent}</div>
      )}

      {/* Footer */}
      <div className="p-5 border-t border-white/5 flex flex-col gap-3 bg-card/40">
<<<<<<< HEAD
        <div className="flex gap-2">
          <Button variant="hero" size="sm" asChild className="flex-1">
            <a
              href={buildWhatsAppLink(design, categoryName)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" /> Contratar
=======
        <div>
          <h3 className="text-base font-bold leading-tight">{design.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{design.style}</p>
        </div>

        <Button
          variant="hero"
          size="sm"
          asChild
          className="w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={buildWhatsAppLink(design, categoryName)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" /> Contratar
          </a>
        </Button>
      </div>
    </div>
  );
}

function PreviewModal({
  design,
  categoryName,
  onClose,
}: {
  design: CardDesign;
  categoryName: string;
  onClose: () => void;
}) {
  const url = buildWhatsAppLink(design, categoryName);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      <div
        className="relative z-10 w-full max-w-4xl rounded-3xl glass p-6 md:p-10 animate-scale-in grid md:grid-cols-2 gap-8 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex justify-center">
          <ScrollableInvite design={design} size="lg" whatsappUrl={url} />
        </div>

        <div className="text-center md:text-left">
          <div className="mb-2 text-xs uppercase tracking-widest text-primary">
            {categoryName}
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-2">{design.name}</h3>
          <p className="text-muted-foreground mb-6">{design.style}</p>

          <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="h-4 w-4 text-primary" /> Música, mapa y cuenta regresiva
            </li>
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="h-4 w-4 text-primary" /> RSVP directo por WhatsApp
            </li>
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="h-4 w-4 text-primary" /> Lista en 24-48hs
            </li>
          </ul>

          <Button variant="hero" size="lg" asChild className="w-full">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Contratar por WhatsApp
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
            </a>
          </Button>

          {design.demoUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={design.demoUrl} target="_blank" rel="noopener noreferrer" title="Ver web">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function TarjetasCatalog() {
<<<<<<< HEAD
  const grouped = useMemo(
=======
  const [preview, setPreview] = useState<CardDesign | null>(null);
  const [activeCat, setActiveCat] = useState<string>("all");

  const featured = useMemo(
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
    () =>
      cardDesigns.find((d) => d.tag === "Popular" && d.category === "casamientos") ??
      cardDesigns[0],
    [],
  );

<<<<<<< HEAD
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative">
        {/* Premium Hero Section */}
        <section
          className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-black"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${bgHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Subtle overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-0" />

          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full bg-gradient-to-br from-primary/30 via-fuchsia-500/20 to-transparent blur-3xl opacity-50" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Copy */}
              <div className="flex flex-col items-start text-left max-w-2xl">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8 group"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Volver al inicio
                </Link>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-elegant animate-fade-in">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold tracking-widest uppercase text-white/90">
                    Catálogo Premium
                  </span>
                </div>

                <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight animate-fade-up">
                  Invitaciones <br />
                  <span className="text-gradient">Listas para Enviar</span>
                </h1>

                <p
                  className="text-xl text-white/70 mb-10 leading-relaxed max-w-xl animate-fade-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  Elegí tu diseño favorito, mirá la demo y consultá directo por WhatsApp sin
                  compromiso. Invitaciones y regalos digitales personalizados para sorprender en
                  momentos especiales.
                </p>

                {/* Quick category nav */}
                <div
                  className="flex flex-wrap gap-2 animate-fade-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  {cardCategories.map((c) => (
                    <a
                      key={c.slug}
                      href={`#cat-${c.slug}`}
                      className="text-[10px] uppercase tracking-widest font-bold px-10 py-2.5 rounded-full bg-white/5 border border-white/15 hover:border-primary/50 hover:bg-white/10 hover:text-white text-white/60 transition-all hover:scale-105 active:scale-95"
                    >
                      {c.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Right: Scrolling Phone Visual */}
              <div
                className="relative flex justify-center lg:justify-end animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                {/* Decorative element behind phone */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -z-10" />

                <div className="relative group transition-transform duration-700 hover:rotate-2 hover:scale-[1.02]">
                  {/* Interactivity Cue */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce pointer-events-none z-20">
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest whitespace-nowrap bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                      Probá scrollear
                    </span>
                    <ArrowDown className="h-4 w-4 text-white/60" />
                  </div>

                  <InvitePhone design={cardDesigns[0]} size="lg">
                    {cardDesigns[0].demoUrl ? (
                      <iframe
                        src={cardDesigns[0].demoUrl}
                        className="w-full h-full border-none bg-white"
                        title="Live Demo"
                      />
                    ) : (
                      <InteractiveInvite />
                    )}
                  </InvitePhone>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Categories */}
          <div className="space-y-24">
            {grouped.map(({ category, designs }) => (
              <section key={category.slug} id={`cat-${category.slug}`} className="scroll-mt-24">
                {/* Section header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary mb-2">Categoría</p>
                    <h2 className="font-display text-3xl md:text-4xl font-bold">{category.name}</h2>
                    <p className="text-muted-foreground mt-2 max-w-xl">{category.description}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {designs.length} diseños disponibles
                  </span>
                </div>

                {/* Subtle divider */}
                <div className="h-px bg-gradient-to-r from-primary/40 via-white/10 to-transparent mb-10" />

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {designs.map((d) => (
                    <DesignCard key={d.id} design={d} categoryName={category.name} />
                  ))}
=======
  const featuredCategoryName =
    cardCategories.find((c) => c.slug === featured.category)?.name ?? "";
  const featuredUrl = buildWhatsAppLink(featured, featuredCategoryName);

  const filtered = useMemo(() => {
    if (activeCat === "all") return cardDesigns;
    return cardDesigns.filter((d) => d.category === activeCat);
  }, [activeCat]);

  const previewCategoryName = preview
    ? (cardCategories.find((c) => c.slug === preview.category)?.name ?? "")
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* ===== HERO with premium image ===== */}
        <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 -z-10">
            <img
              src={cardsHero}
              alt=""
              width={1536}
              height={1024}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.25),transparent_60%)]" />
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left copy */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium tracking-wide uppercase">
                    Catálogo de tarjetas
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold leading-[1.05]">
                  Invitaciones digitales{" "}
                  <span className="text-gradient">interactivas</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Música, cuenta regresiva en vivo, ubicación con mapa y RSVP por WhatsApp.
                  Probá la demo de la derecha — es real, podés deslizar adentro del celular.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button variant="hero" size="lg" asChild>
                    <a href="#catalogo">
                      <Eye className="h-4 w-4" /> Ver catálogo
                    </a>
                  </Button>
                  <Button variant="outlineGlow" size="lg" asChild>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola! Quiero info sobre las tarjetas digitales.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" /> Hablar por WhatsApp
                    </a>
                  </Button>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
                </div>

                <div className="flex items-center gap-6 pt-6 text-sm text-muted-foreground">
                  <div>
                    <div className="text-xl font-display font-bold text-foreground">+500</div>
                    <div>Eventos</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <div className="text-xl font-display font-bold text-foreground">24-48h</div>
                    <div>Entrega</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <div className="text-xl font-display font-bold text-foreground">100%</div>
                    <div>Personalizada</div>
                  </div>
                </div>
              </div>

              {/* Right interactive phone */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="absolute -inset-10 bg-gradient-to-br from-primary/30 via-fuchsia-500/15 to-transparent blur-3xl -z-10" />
                <div style={{ animation: "var(--animate-float)" }}>
                  <ScrollableInvite design={featured} size="lg" whatsappUrl={featuredUrl} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FILTERABLE CATALOG ===== */}
        <section id="catalogo" className="relative py-20 scroll-mt-24">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-full bg-gradient-to-br from-primary/15 via-fuchsia-500/8 to-transparent blur-3xl" />
          </div>

<<<<<<< HEAD
          {/* Final CTA */}
          <div className="mt-24 rounded-3xl glass p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-fuchsia-500/10" />
            <h3 className="font-display text-3xl md:text-4xl font-bold mb-3">
              ¿No encontraste el diseño ideal?
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Hacemos diseños 100% personalizados según tu estilo, colores y temática. Contanos cómo
              lo imaginás.
            </p>
            <Button variant="hero" size="xl" asChild>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  "Hola! Me gustaría una tarjeta digital personalizada.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" /> Pedir diseño personalizado
              </a>
            </Button>
=======
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-3">
                Explorá nuestro <span className="text-gradient">catálogo</span>
              </h2>
              <p className="text-muted-foreground">
                Filtrá por categoría y tocá cualquier diseño para ver la demo completa.
              </p>
            </div>

            {/* Filter pills */}
            <div className="sticky top-20 z-30 -mx-6 px-6 py-4 mb-10 backdrop-blur-xl bg-background/70 border-y border-white/5">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground shrink-0">
                  <Filter className="h-3.5 w-3.5" /> Filtrar
                </div>
                {[{ slug: "all", name: "Todas" }, ...cardCategories.map((c) => ({ slug: c.slug, name: c.name }))].map(
                  (c) => {
                    const isActive = activeCat === c.slug;
                    const count =
                      c.slug === "all"
                        ? cardDesigns.length
                        : cardDesigns.filter((d) => d.category === c.slug).length;
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => setActiveCat(c.slug)}
                        className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                          isActive
                            ? "border-primary/60 bg-primary/15 text-foreground shadow-[0_0_30px_-5px_var(--primary)]"
                            : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:border-white/30"
                        }`}
                        aria-pressed={isActive}
                      >
                        {c.name}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-primary/30 text-foreground" : "bg-white/5 text-muted-foreground"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((d) => (
                <DesignCard
                  key={d.id}
                  design={d}
                  categoryName={
                    cardCategories.find((c) => c.slug === d.category)?.name ?? ""
                  }
                  onPreview={setPreview}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No hay diseños en esta categoría todavía.
              </div>
            )}

            {/* Final CTA */}
            <div className="mt-24 rounded-3xl glass p-10 md:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-fuchsia-500/10" />
              <h3 className="text-3xl md:text-4xl font-bold mb-3">
                ¿No encontraste el diseño ideal?
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Hacemos diseños 100% personalizados según tu estilo, colores y temática.
              </p>
              <Button variant="hero" size="xl" asChild>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    "Hola! Me gustaría una tarjeta digital personalizada.",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" /> Pedir diseño personalizado
                </a>
              </Button>
            </div>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
          </div>
        </section>
      </main>
      <Footer />
<<<<<<< HEAD
=======

      {preview && (
        <PreviewModal
          design={preview}
          categoryName={previewCategoryName}
          onClose={() => setPreview(null)}
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
    </div>
  );
}
