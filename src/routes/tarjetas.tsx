import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle, Sparkles, X, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { InvitePhone } from "@/components/site/InvitePhone";
import { ScrollableInvite } from "@/components/site/ScrollableInvite";
import { cardCategories, cardDesigns, type CardDesign } from "@/data/cards";
import cardsHero from "@/assets/cards-hero.jpg";

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

const WHATSAPP_NUMBER = "123456789"; // placeholder

function buildWhatsAppLink(design: CardDesign, categoryName: string) {
  const message = encodeURIComponent(
    `Hola! Me gustaría contratar la tarjeta digital "${design.name}" de la sección ${categoryName}.`,
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

const tagStyles: Record<string, string> = {
  Popular: "bg-primary/15 text-primary border-primary/30",
  Nuevo: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  Elegante: "bg-amber-400/15 text-amber-200 border-amber-300/30",
  Premium: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/30",
  Minimal: "bg-white/10 text-white/80 border-white/20",
};

function DesignCard({
  design,
  categoryName,
  onPreview,
}: {
  design: CardDesign;
  categoryName: string;
  onPreview: (d: CardDesign) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPreview(design)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPreview(design);
        }
      }}
      className="group relative rounded-2xl glass overflow-hidden flex flex-col cursor-pointer transition-all duration-500 hover:border-primary/50 hover:-translate-y-1 hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Tag */}
      {design.tag && (
        <span
          className={`absolute top-3 left-3 z-20 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md ${tagStyles[design.tag]}`}
        >
          {design.tag}
        </span>
      )}

      {/* Phone preview */}
      <div className="relative pt-10 pb-6 px-4 flex justify-center bg-gradient-to-b from-background/0 via-background/0 to-background/40">
        <div className="absolute inset-x-0 top-0 h-full -z-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="transition-transform duration-500 ease-out [transform:rotate(-3deg)] group-hover:[transform:rotate(0deg)_scale(1.04)]">
          <InvitePhone design={design} size="sm" />
        </div>

        {/* Reveal "Ver demo" overlay on hover */}
        <div className="absolute inset-0 grid place-items-center bg-black/0 group-hover:bg-black/40 backdrop-blur-0 group-hover:backdrop-blur-[2px] transition-all duration-300 opacity-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-white text-black shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="h-3.5 w-3.5" /> Ver demo
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-white/5 flex flex-col gap-3 bg-card/40">
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
            </a>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Te respondemos en minutos · Sin compromiso
          </p>
        </div>
      </div>
    </div>
  );
}

function TarjetasCatalog() {
  const [preview, setPreview] = useState<CardDesign | null>(null);
  const [activeCat, setActiveCat] = useState<string>("all");

  const featured = useMemo(
    () =>
      cardDesigns.find((d) => d.tag === "Popular" && d.category === "casamientos") ??
      cardDesigns[0],
    [],
  );

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
          </div>
        </section>
      </main>
      <Footer />

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
    </div>
  );
}
