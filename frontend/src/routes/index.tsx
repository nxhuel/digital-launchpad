import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Pricing } from "@/components/site/Pricing";
import logoSrc from "@/assets/logo-v2.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clik — Agencia Digital" },
      {
        name: "description",
        content:
          "Agencia digital especializada en soluciones web a medida y tarjetas digitales para eventos.",
      },
      { property: "og:title", content: "Clik — Tu negocio online en días" },
      {
        property: "og:description",
        content:
          "Soluciones web a medida y tarjetas digitales para eventos. Lanzá tu negocio sin saber de tecnología.",
      },
    ],
    links: [
      {
        rel: "icon",
        href: logoSrc,
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Pricing />
    </main>
  );
}
