const steps = [
  {
    n: "01",
    title: "Contanos tu idea",
    desc: "Charlamos por WhatsApp o video. Entendemos tu negocio y tus objetivos.",
  },
  {
    n: "02",
    title: "Diseñamos tu solución",
    desc: "Creamos una propuesta hecha a medida. Te mostramos avances en cada paso.",
  },
  {
    n: "03",
    title: "Lanzamos tu negocio",
    desc: "Publicamos tu sitio, te capacitamos y quedás listo para vender online.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-medium text-primary mb-3">CÓMO FUNCIONA</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            3 pasos simples para <span className="text-gradient">estar online</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Un proceso claro, sin sorpresas, pensado para que sea fácil.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="p-8 rounded-2xl glass h-full">
                <div className="text-5xl font-display font-bold text-gradient mb-4">{s.n}</div>
                <h3 className="text-2xl font-semibold mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
