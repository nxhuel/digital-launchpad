import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Benefits } from "@/components/site/Benefits";
import { Cases } from "@/components/site/Cases";
import { Pricing } from "@/components/site/Pricing";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lanzar.studio — Llevá tu negocio al mundo digital" },
      {
        name: "description",
        content:
          "Agencia tecnológica para emprendedores. Creamos webs, tiendas online y landing pages profesionales. Sin tecnicismos, sin complicaciones.",
      },
      { property: "og:title", content: "Lanzar.studio — Tu negocio online en días" },
      {
        property: "og:description",
        content:
          "Webs, tiendas y landings profesionales para emprendedores. Lanzá tu negocio sin saber de tecnología.",
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
        <Benefits />
        <Cases />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
