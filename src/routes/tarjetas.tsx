import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle, Sparkles, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { InvitePhone } from "@/components/site/InvitePhone";
import { cardCategories, cardDesigns, type CardDesign } from "@/data/cards";

export const Route = createFileRoute("/tarjetas")({
  head: () => ({
    meta: [
      { title: "Catálogo de Tarjetas Digitales — Lanzar.studio" },
      {
        name: "description",
        content:
          "Explorá nuestro catálogo de invitaciones digitales: casamientos, XV, infantiles y eventos empresariales. Contratá por WhatsApp en segundos.",
      },
      { property: "og:title", content: "Catálogo de Tarjetas Digitales — Lanzar.studio" },
      {
        property: "og:description",
        content:
          "Invitaciones digitales modernas, animadas y listas para compartir. Mirá la demo y contratá por WhatsApp.",
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

      {/* Hover preview hint */}
      <span className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border border-white/15 bg-black/40 backdrop-blur-md text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
        <Eye className="h-3 w-3" /> Ver demo
      </span>

      {/* Phone preview */}
      <div className="relative pt-10 pb-6 px-4 flex justify-center bg-gradient-to-b from-background/0 via-background/0 to-background/40">
        <div className="absolute inset-x-0 top-0 h-full -z-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="transition-transform duration-500 ease-out [transform:rotate(-3deg)] group-hover:[transform:rotate(0deg)_scale(1.04)]">
          <InvitePhone design={design} size="sm" />
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
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className="relative z-10 w-full max-w-md rounded-3xl glass p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <InvitePhone design={design} size="lg" />
          </div>

          <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
            {categoryName}
          </div>
          <h3 className="text-2xl font-bold mb-1">{design.name}</h3>
          <p className="text-sm text-muted-foreground mb-6">{design.style}</p>

          <Button variant="hero" size="lg" asChild className="w-full">
            <a
              href={buildWhatsAppLink(design, categoryName)}
              target="_blank"
              rel="noopener noreferrer"
            >
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

  const grouped = useMemo(
    () =>
      cardCategories.map((c) => ({
        category: c,
        designs: cardDesigns.filter((d) => d.category === c.slug),
      })),
    [],
  );

  const previewCategoryName = preview
    ? (cardCategories.find((c) => c.slug === preview.category)?.name ?? "")
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-32 pb-20 flex-1 relative overflow-hidden">
        {/* violet ambient glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full bg-gradient-to-br from-primary/15 via-fuchsia-500/8 to-transparent blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>

          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium tracking-wide uppercase">
                Catálogo de tarjetas
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
              Invitaciones digitales <span className="text-gradient">listas para enviar</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Elegí tu diseño favorito, mirá la demo y contratá directo por WhatsApp.
              Te la entregamos personalizada en 24-48hs.
            </p>

            {/* Quick category nav */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {cardCategories.map((c) => (
                <a
                  key={c.slug}
                  href={`#cat-${c.slug}`}
                  className="text-xs uppercase tracking-wider px-4 py-2 rounded-full border border-white/10 hover:border-primary/50 hover:text-foreground text-muted-foreground transition-colors"
                >
                  {c.name}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-24">
            {grouped.map(({ category, designs }) => (
              <section key={category.slug} id={`cat-${category.slug}`} className="scroll-mt-24">
                {/* Section header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary mb-2">
                      Categoría
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold">{category.name}</h2>
                    <p className="text-muted-foreground mt-2 max-w-xl">
                      {category.description}
                    </p>
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
                    <DesignCard
                      key={d.id}
                      design={d}
                      categoryName={category.name}
                      onPreview={setPreview}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-24 rounded-3xl glass p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-fuchsia-500/10" />
            <h3 className="text-3xl md:text-4xl font-bold mb-3">
              ¿No encontraste el diseño ideal?
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Hacemos diseños 100% personalizados según tu estilo, colores y temática.
              Contanos cómo lo imaginás.
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
      </main>
      <Footer />

      {preview && (
        <PreviewModal
          design={preview}
          categoryName={previewCategoryName}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
