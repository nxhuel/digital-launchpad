import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { HowItWorks } from "@/components/site/HowItWorks";
import { About } from "@/components/site/About";
import { Cases } from "@/components/site/Cases";
import { Pricing } from "@/components/site/Pricing";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NoduStudio — Agencia tecnológica para emprendedores" },
      {
        name: "description",
        content:
          "Webs, sistemas, automatizaciones con IA y tarjetas digitales. Llevá tu idea al mundo digital sin saber de tecnología.",
      },
      { property: "og:title", content: "NoduStudio — Tu negocio online en días" },
      {
        property: "og:description",
        content:
          "Webs, sistemas, automatizaciones con IA y tarjetas digitales. Lanzá tu negocio sin saber de tecnología.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <About />
        <Cases />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}
