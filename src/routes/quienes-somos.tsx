import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quienes-somos")({
  head: () => ({
    meta: [
      { title: "Quiénes somos — Clik" },
      { name: "description", content: "Conoce al equipo de Clik. Somos una agencia digital que ayuda a emprendedores a llevar su negocio al mundo digital." },
    ],
  }),
  component: QuienesSomos,
});

function QuienesSomos() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">NOSOTROS</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Quiénes somos</h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            Somos un equipo que une <span className="text-primary font-semibold">diseño, tecnología y estrategia</span> para hacer crecer negocios reales.
          </p>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            No somos una agencia genérica. Nos involucramos en cada proyecto como si fuera el nuestro. 
            Entendemos tus objetivos, proponemos soluciones concretas y las ejecutamos con cuidado.
          </p>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Trabajamos con emprendedores, pymes y marcas que quieren dar el salto digital sin perder 
            el tiempo en procesos complicados. La tecnología es nuestra herramienta; tu crecimiento, nuestro objetivo.
          </p>

          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass-card">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <span className="text-white text-lg">🚀</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">+120 proyectos lanzados</div>
              <div className="text-xs text-muted-foreground">Emprendedores, pymes y marcas</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}