import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { cardCategories, designsByCategory } from "@/data/cards";

export const Route = createFileRoute("/tarjetas/$categoria")({
  loader: ({ params }) => {
    const category = cardCategories.find((c) => c.slug === params.categoria);
    if (!category) throw notFound();
    const designs = designsByCategory[params.categoria] ?? [];
    return { category, designs };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.category.name ?? "Tarjetas";
    return {
      meta: [
        { title: `Diseños de tarjetas para ${name} — Lanzar.studio` },
        {
          name: "description",
          content: `Plantillas de tarjetas digitales para ${name.toLowerCase()}. Elegí tu favorita y contratá por WhatsApp.`,
        },
        { property: "og:title", content: `Tarjetas para ${name} — Lanzar.studio` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-32 pb-20 flex-1">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Categoría no encontrada</h1>
          <p className="text-muted-foreground mb-8">
            La categoría que buscás no existe.
          </p>
          <Button variant="hero" asChild>
            <Link to="/tarjetas">Ver todas las categorías</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  ),
  component: CategoryDesigns,
});

const WHATSAPP_NUMBER = "5491100000000"; // placeholder

function CategoryDesigns() {
  const { category, designs } = Route.useLoaderData();

  const buildWhatsAppLink = (designName: string) => {
    const message = encodeURIComponent(
      `Hola, quiero este diseño de tarjeta digital: "${designName}" (${category.name})`,
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-32 pb-20 flex-1">
        <div className="max-w-6xl mx-auto px-6">
          <Link
            to="/tarjetas"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a categorías
          </Link>

          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-5xl mb-4">{category.emoji}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Diseños para <span className="text-gradient">{category.name}</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Elegí el diseño que más te guste y contratá directo por WhatsApp.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((d) => (
              <div
                key={d.id}
                className="group rounded-2xl glass overflow-hidden flex flex-col transition-all hover:border-primary/50 hover:-translate-y-1"
              >
                <div
                  className={`relative aspect-[3/4] bg-gradient-to-br ${d.gradient} flex items-center justify-center overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="text-7xl group-hover:scale-110 transition-transform duration-500">
                    {d.emoji}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-xs uppercase tracking-wider text-foreground/70 mb-1">
                      Preview
                    </div>
                    <div className="h-px bg-gradient-to-r from-foreground/40 to-transparent" />
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-1">{d.name}</h3>
                  <p className="text-sm text-muted-foreground mb-5 flex-1">{d.style}</p>
                  <Button variant="hero" asChild className="w-full">
                    <a
                      href={buildWhatsAppLink(d.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" /> Contratar
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
