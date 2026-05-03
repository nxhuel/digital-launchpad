import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="top" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[120px] -z-10" />
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-6 space-y-8" style={{ animation: "var(--animate-fade-up)" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold tracking-wider uppercase text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Agencia tecnológica
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-foreground">
            Llevá tu idea al{" "}
            <span className="italic text-primary">mundo digital</span>
            <br />
            sin saber de tecnología
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            En NoduStudio creamos webs, sistemas, automatizaciones con IA y
            tarjetas digitales para que tu negocio despegue. Vos te enfocás en
            crecer; nosotros del resto.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="#contacto">
                Quiero empezar <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outlineGlow" size="xl" asChild>
              <a href="#como-funciona">Cómo funciona</a>
            </Button>
          </div>
          <div className="flex items-center gap-8 pt-4">
            <div>
              <div className="text-3xl font-display font-semibold text-foreground">+120</div>
              <div className="text-sm text-muted-foreground">Negocios online</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-3xl font-display font-semibold text-foreground">7 días</div>
              <div className="text-sm text-muted-foreground">Tiempo promedio</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-3xl font-display font-semibold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Satisfacción</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative" style={{ animation: "var(--animate-fade-in)", animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
          <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-full -z-10" />
          <div className="relative rounded-3xl overflow-hidden shadow-elegant ring-1 ring-border">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80"
              alt="Equipo creativo de NoduStudio"
              className="w-full aspect-[4/5] lg:aspect-[4/4] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-5 -left-5 bg-card border border-border shadow-elegant rounded-2xl px-5 py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Listos en días</div>
              <div className="text-xs text-muted-foreground">No en meses</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
