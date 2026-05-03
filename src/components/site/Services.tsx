import { Globe, ShoppingBag, Zap, Repeat, Layout, LifeBuoy } from "lucide-react";

const services = [
  { icon: Globe, title: "Páginas web", desc: "Sitios profesionales que transmiten confianza y atraen clientes desde el primer clic." },
  { icon: Layout, title: "Landing pages", desc: "Páginas optimizadas para vender, captar leads o lanzar tu próximo producto." },
  { icon: ShoppingBag, title: "Tiendas online", desc: "Vendé 24/7 con un e-commerce simple de gestionar y listo para crecer." },
  { icon: Zap, title: "Automatizaciones con IA", desc: "Chatbots, formularios y flujos que trabajan por vos sin esfuerzo." },
  { icon: Repeat, title: "Suscripción mensual", desc: "Hosting, mantenimiento y actualizaciones incluidas. Olvidate de los problemas." },
  { icon: LifeBuoy, title: "Soporte cercano", desc: "Te acompañamos por WhatsApp. Hablamos claro, sin tecnicismos." },
];

export function Services() {
  return (
    <section id="servicios" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
            Servicios
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4 leading-[1.1]">
            Todo lo que necesitás para <span className="text-primary italic">empezar online</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Soluciones simples para emprendedores reales. Sin complicaciones técnicas.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <div
              key={s.title}
              className="group p-7 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-primary grid place-items-center mb-5 group-hover:shadow-glow transition-shadow">
                <s.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
