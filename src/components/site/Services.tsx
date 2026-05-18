import { useEffect, useRef } from "react";
import { Globe, CreditCard, MonitorSmartphone, BrainCircuit } from "lucide-react";

const services = [
<<<<<<< HEAD
  {
    icon: Globe,
    title: "Páginas Web",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=1000",
    desc: "Sitios profesionales que transmiten confianza y atraen clientes.",
  },
  {
    icon: CreditCard,
    title: "Tarjetas Digitales",
    image: "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=1000",
    desc: "Tu tarjeta digital lista para compartir con QR.",
  },
  {
    icon: MonitorSmartphone,
    title: "Sistemas Web",
    image: "https://images.unsplash.com/photo-1771923082503-0a3381c46cef?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "Dashboards y sistemas a medida para gestionar tu negocio.",
  },
  {
    icon: BrainCircuit,
    title: "IA",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
    desc: "Automatizacion con inteligencia artificial.",
  },
=======
  { icon: Globe, title: "Páginas web", desc: "Sitios profesionales que transmiten confianza y atraen clientes desde el primer clic." },
  { icon: Layout, title: "Landing pages", desc: "Páginas optimizadas para vender, captar leads o lanzar tu próximo producto." },
  { icon: ShoppingBag, title: "Tiendas online", desc: "Vendé 24/7 con un e-commerce simple de gestionar y listo para crecer." },
  { icon: Zap, title: "Automatizaciones con IA", desc: "Chatbots, formularios y flujos que trabajan por vos sin esfuerzo." },
  { icon: Repeat, title: "Suscripción mensual", desc: "Hosting, mantenimiento y actualizaciones incluidas. Olvidate de los problemas." },
  { icon: LifeBuoy, title: "Soporte cercano", desc: "Te acompañamos por WhatsApp. Hablamos claro, sin tecnicismos." },
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function Services() {
  const ref = useReveal();

  return (
    <section id="servicios" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
<<<<<<< HEAD
          <div className="text-sm font-medium text-primary mb-3">SERVICIOS</div>
          <h2 className="font-display text-4xl md:text-5xl  mb-4">
            Lo que necesitamos para <span className="text-primary">empezar online</span>
=======
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
            Servicios
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4 leading-[1.1]">
            Todo lo que necesitás para <span className="text-primary italic">empezar online</span>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
          </h2>
          <p className="text-lg text-muted-foreground">
            Soluciones simples para Emprendedores. Sin complicaciones técnicas.
          </p>
        </div>
        <div ref={ref} className="reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
<<<<<<< HEAD
              className="bg-white group rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(124,58,237,0.1)] border border-slate-100 transition-all duration-500 hover:-translate-y-2"
=======
              className="group p-7 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={s.image} 
                  alt={s.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 left-4">
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-slate-50">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{s.desc}</p>
              </div>
<<<<<<< HEAD
=======
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{s.desc}</p>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}