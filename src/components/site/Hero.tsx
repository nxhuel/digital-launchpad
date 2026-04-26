import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

export function Hero() {
  return (
    <section id="top" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] -z-10" />
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8" style={{ animation: "var(--animate-fade-up)" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">
              Tu negocio online en días, no en meses
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Llevá tu idea al{" "}
            <span className="text-gradient">mundo digital</span> sin saber de tecnología
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Diseñamos y lanzamos tu web, tienda online o landing profesional.
            Vos te enfocás en tu negocio, nosotros del resto.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="#contacto">
                Quiero mi web <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outlineGlow" size="xl" asChild>
              <a href="#como-funciona">Ver cómo funciona</a>
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div>
              <div className="text-2xl font-display font-bold text-foreground">+120</div>
              <div>Negocios online</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-2xl font-display font-bold text-foreground">7 días</div>
              <div>Tiempo promedio</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-2xl font-display font-bold text-foreground">100%</div>
              <div>Satisfacción</div>
            </div>
          </div>
        </div>

        <div
          className="relative"
          style={{ animation: "var(--animate-fade-in)", animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}
        >
          <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-30 rounded-full" />
          <img
            src={heroImg}
            alt="Cohete digital despegando — lanzá tu negocio online"
            width={1280}
            height={1280}
            className="relative rounded-3xl shadow-elegant w-full"
            style={{ animation: "var(--animate-float)" }}
          />
        </div>
      </div>
    </section>
  );
}
