import { Check } from "lucide-react";

const benefits = [
  { title: "No necesitás saber de tecnología", desc: "Hablamos en simple. Te guiamos paso a paso." },
  { title: "Soluciones rápidas", desc: "En días tenés tu negocio funcionando online." },
  { title: "Diseño profesional", desc: "Webs que transmiten confianza y venden más." },
  { title: "Acompañamiento real", desc: "Estamos cuando nos necesitás. Sin tickets fríos." },
];

export function Benefits() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="text-sm font-medium text-primary mb-3">POR QUÉ ELEGIRNOS</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pensado para <span className="text-gradient">emprendedores</span>, no para ingenieros
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sabemos que arrancar un negocio ya es bastante difícil. Por eso nos
            ocupamos de toda la parte técnica para que vos te enfoques en lo
            que mejor sabés hacer.
          </p>
        </div>
        <div className="space-y-4">
          {benefits.map((b) => (
            <div key={b.title} className="flex gap-4 p-5 rounded-xl glass hover:border-primary/40 transition-colors">
              <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/15 grid place-items-center">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold mb-1">{b.title}</div>
                <div className="text-sm text-muted-foreground">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
