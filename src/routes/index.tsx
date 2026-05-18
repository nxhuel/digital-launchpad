import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { HowItWorks } from "@/components/site/HowItWorks";
<<<<<<< HEAD
import { Pricing } from "@/components/site/Pricing";
import { CTA } from "@/components/site/CTA.tsx";
=======
import { About } from "@/components/site/About";
import { Cases } from "@/components/site/Cases";
import { Pricing } from "@/components/site/Pricing";
import { CTA } from "@/components/site/CTA";
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
<<<<<<< HEAD
      { title: "Clik — Agencia Digital" },
      {
        name: "description",
        content: "Agencia tecnologica para emprendedores. Paginas web, sistemas, automatizaciones con IA y tarjetas digitales.",
      },
      { property: "og:title", content: "Clik — Tu negocio online en dias" },
=======
      { title: "NoduStudio — Agencia tecnológica para emprendedores" },
      {
        name: "description",
        content:
          "Webs, sistemas, automatizaciones con IA y tarjetas digitales. Llevá tu idea al mundo digital sin saber de tecnología.",
      },
      { property: "og:title", content: "NoduStudio — Tu negocio online en días" },
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
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
<<<<<<< HEAD
=======
        <About />
        <Cases />
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}