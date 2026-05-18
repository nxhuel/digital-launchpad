import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Pricing } from "@/components/site/Pricing";
import { CTA } from "@/components/site/CTA.tsx";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clik — Agencia Digital" },
      {
        name: "description",
        content: "Agencia tecnologica para emprendedores. Paginas web, sistemas, automatizaciones con IA y tarjetas digitales.",
      },
      { property: "og:title", content: "Clik — Tu negocio online en dias" },
      {
        property: "og:description",
        content: "Paginas web, sistemas, automatizaciones con IA y tarjetas digitales. Lanzá tu negocio sin saber de tecnologia.",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/logo.png",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}