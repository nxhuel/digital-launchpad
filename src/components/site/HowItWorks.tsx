const steps = [
  { n: "01", title: "Contanos tu idea", desc: "Charlamos por WhatsApp o video. Entendemos tu negocio y tus objetivos." },
  { n: "02", title: "Diseñamos tu solución", desc: "Creamos una propuesta a medida. Te mostramos avances en cada paso." },
  { n: "03", title: "Lanzamos tu negocio", desc: "Publicamos tu sitio, te capacitamos y quedás listo para vender online." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 md:py-32 relative bg-card/40">
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
            Cómo funciona
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4 leading-[1.1]">
            3 pasos simples para <span className="text-primary italic">estar online</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Un proceso claro, sin sorpresas, pensado para que sea fácil.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="p-8 rounded-2xl bg-card border border-border h-full hover:border-primary/40 transition-colors">
                <div className="text-5xl font-display font-semibold text-primary mb-4">{s.n}</div>
                <h3 className="font-display text-2xl font-semibold mb-3 text-foreground">{s.title}</h3>
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
