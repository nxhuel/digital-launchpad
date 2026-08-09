import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageCircle, Sparkles, Eye, ArrowDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvitePhone } from "@/components/site/InvitePhone";
import { InviteLaptop } from "@/components/site/InviteLaptop";
import { type CardDesign, type CardCategory } from "@/data/cards";
import { whatsappLink } from "@/config/site";
import { apiFetch } from "@/lib/api";
import type { CardCatalog } from "@/types";
import bgHero from "@/assets/bg-hero-2.png";

export const Route = createFileRoute("/tarjetas-digitales")({
  head: () => ({
    meta: [
      { title: "Catálogo de Tarjetas Digitales — Clik" },
      {
        name: "description",
        content:
          "Invitaciones digitales interactivas: música, cuenta regresiva, mapa y RSVP por WhatsApp. Casamientos, XV, infantiles y eventos.",
      },
      {
        property: "og:title",
        content: "Catálogo de Tarjetas Digitales — Clik",
      },
      {
        property: "og:description",
        content:
          "Invitaciones digitales modernas e interactivas. Mirá la demo y contratá por WhatsApp.",
      },
    ],
  }),
  component: TarjetasCatalog,
});

function buildWhatsAppLink(design: CardDesign, categoryName: string) {
  return whatsappLink(
    `Hola! Me gustaría contratar la tarjeta digital "${design.name}" de la sección ${categoryName}.`,
  );
}

const tagStyles: Record<string, string> = {
  Popular: "bg-primary text-white border-primary shadow-sm",
  Nuevo: "bg-emerald-600 text-white border-emerald-500 shadow-sm",
  Elegante: "bg-[#7C4E36] text-[#FDFBF7] border-[#B8956A] shadow-sm",
  Premium: "bg-indigo-600 text-white border-indigo-500 shadow-sm",
  Minimal: "bg-zinc-900 text-white border-zinc-800 shadow-sm",
};

function DiscountRibbon({ label }: { label: string }) {
  return (
    <div className="absolute top-10 right-[-52px] z-30 rotate-45 w-[230px] py-1.5 text-center bg-gradient-to-r from-red-600 via-rose-500 to-fuchsia-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-950/40 ring-1 ring-white/30 pointer-events-none">
      {label}
    </div>
  )
}

function DesignCard({ design, categoryName }: { design: CardDesign; categoryName: string }) {
  const CardContent = (
    <>
      {design.discountLabel && <DiscountRibbon label={design.discountLabel} />}
      {design.tag && (
        <span
          className={`absolute top-3 left-3 z-20 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-lg border ${
            tagStyles[design.tag] || "bg-primary text-white border-primary shadow-sm"
          }`}
        >
          {design.tag}
        </span>
      )}
      <div className="relative pt-10 pb-6 px-4 flex justify-center bg-gradient-to-b from-background/0 via-background/0 to-background/40">
        <div className="absolute inset-x-0 top-0 h-full -z-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="transition-transform duration-500 ease-out [transform:rotate(-3deg)] group-hover:[transform:rotate(0deg)_scale(1.04)]">
          <InvitePhone design={design} size="sm">
            {design.imageUrl && (
              <img src={design.imageUrl} alt={design.name} className="w-full h-full object-cover" />
            )}
          </InvitePhone>
        </div>
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
        <a href={design.demoUrl} target="_blank" rel="noopener noreferrer" className="relative block">
          {CardContent}
        </a>
      ) : (
        <div className="relative block">{CardContent}</div>
      )}
      <div className="p-5 border-t border-white/5 flex flex-col gap-3 bg-card/40">
        <div className="flex gap-2">
          <Button variant="hero" size="sm" asChild className="flex-1">
            <a href={buildWhatsAppLink(design, categoryName)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Contratar
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
  const [serverCatalog, setServerCatalog] = useState<CardCatalog | null>(null)

  // El catálogo real lo sube el admin desde el sistema; si la API no responde,
  // se muestra el catálogo estático como respaldo.
  useEffect(() => {
    let cancelled = false
    apiFetch<CardCatalog>("/public/card-catalog")
      .then(data => {
        if (!cancelled) setServerCatalog(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const categories: CardCategory[] = serverCatalog?.categories ?? []

  const designs: CardDesign[] = useMemo(() => {
    if (!serverCatalog) return []
    return serverCatalog.designs.map(d => ({
      id: String(d.id),
      name: d.name,
      category: d.category,
      tag: (d.tag as CardDesign["tag"]) || undefined,
      discountLabel: d.discount_label || undefined,
      demoUrl: d.demo_url || undefined,
      imageUrl: d.image_url || undefined,
    }))
  }, [serverCatalog])

  const grouped = useMemo(
    () =>
      categories.map((c) => ({
        category: c,
        designs: designs.filter((d) => d.category === c.slug),
      })),
    [categories, designs],
  );

  return (
    <main className="flex-1 relative">
      <section
        className="relative pt-4 md:pt-8 pb-20 md:pb-32 overflow-hidden bg-black"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${bgHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-0" />
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full bg-gradient-to-br from-primary/30 via-fuchsia-500/20 to-transparent blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
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

              <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-xl animate-fade-up"
                style={{ animationDelay: "0.1s" }}
              >
                Elegí tu diseño favorito, mirá la demo y consultá directo por WhatsApp sin
                compromiso. Invitaciones y regalos digitales personalizados para sorprender en
                momentos especiales.
              </p>

              <div className="flex flex-wrap gap-2 animate-fade-up"
                style={{ animationDelay: "0.2s" }}
              >
                {categories.map((c) => (
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

            <div className="relative flex justify-center lg:justify-end animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[420px] bg-primary/20 rounded-full blur-[100px] -z-10" />
              <div className="relative group transition-transform duration-700 hover:rotate-2 hover:scale-[1.02]">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce pointer-events-none z-20">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest whitespace-nowrap bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                    Probá scrollear
                  </span>
                  <ArrowDown className="h-4 w-4 text-white/60" />
                </div>
                {/* Ejemplo fijo: preview en vivo de la invitación dentro del mockup de notebook */}
                <InviteLaptop>
                  <iframe
                    src="https://bodajyg.lovable.app/"
                    className="w-full h-full border-none bg-white"
                    title="Live Demo"
                  />
                </InviteLaptop>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="space-y-24">
          {grouped.map(({ category, designs }) => (
            <section key={category.slug} id={`cat-${category.slug}`} className="scroll-mt-24">
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

              <div className="h-px bg-gradient-to-r from-primary/40 via-white/10 to-transparent mb-10" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {designs.map((d) => (
                  <DesignCard key={d.id} design={d} categoryName={category.name} />
                ))}
              </div>
            </section>
          ))}
        </div>

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
              href={whatsappLink("Hola! Me gustaría una tarjeta digital personalizada.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5" /> Pedir diseño personalizado
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
