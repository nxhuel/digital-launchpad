import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { cardCategories } from "@/data/cards";

export const Route = createFileRoute("/tarjetas")({
  head: () => ({
    meta: [
      { title: "Tarjetas Digitales — Lanzar.studio" },
      {
        name: "description",
        content:
          "Elegí la categoría de tu evento y descubrí diseños únicos de tarjetas digitales: casamientos, cumpleaños, eventos, negocios y más.",
      },
      { property: "og:title", content: "Tarjetas Digitales — Lanzar.studio" },
      {
        property: "og:description",
        content:
          "Invitaciones digitales modernas para todo tipo de eventos. Elegí tu categoría.",
      },
    ],
  }),
  component: TarjetasPage,
});

function TarjetasPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-32 pb-20 flex-1">
        <div className="max-w-6xl mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>

          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium tracking-wide uppercase">
                Catálogo de tarjetas
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Elegí la <span className="text-gradient">categoría</span> de tu evento
            </h1>
            <p className="text-lg text-muted-foreground">
              Tenemos diseños únicos para cada ocasión. Encontrá el que mejor te represente.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardCategories.map((cat) => (
              <div
                key={cat.slug}
                className="group relative overflow-hidden rounded-2xl glass p-8 flex flex-col transition-all hover:border-primary/50 hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${cat.gradient} opacity-50 group-hover:opacity-80 transition-opacity`}
                />
                <div className="text-5xl mb-4">{cat.emoji}</div>
                <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mb-8 flex-1">
                  {cat.description}
                </p>
                <Button variant="outlineGlow" asChild className="self-start">
                  <Link
                    to="/tarjetas/$categoria"
                    params={{ categoria: cat.slug }}
                  >
                    Ver diseños <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
