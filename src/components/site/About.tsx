import { Heart, Sparkles, Shield, Users, Clock, Target } from "lucide-react";

const values = [
  { icon: Heart, title: "Trato cercano", desc: "Hablamos sin tecnicismos. Te acompañamos por WhatsApp en cada paso." },
  { icon: Clock, title: "Entregas rápidas", desc: "En días tu negocio puede estar online. Nada de meses esperando." },
  { icon: Shield, title: "Soporte real", desc: "No desaparecemos al entregar. Mantenimiento y mejoras incluidas." },
  { icon: Target, title: "Enfocados en vender", desc: "Cada decisión de diseño persigue un objetivo: que tu negocio crezca." },
];

export function About() {
  return (
    <section id="nosotros" className="py-24 md:py-32 relative bg-card/40">
      <div className="max-w-7xl mx-auto px-6">
        {/* Quiénes somos */}
        <div id="quienes-somos" className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
              <Users className="h-3.5 w-3.5" /> Quiénes somos
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6 leading-[1.1]">
              Una agencia <span className="text-primary italic">cercana</span>, hecha por y para emprendedores
            </h2>
            <p className="text-lg text-foreground/70 leading-relaxed mb-4">
              En NoduStudio creemos que cualquier persona puede tener su negocio
              online, sin importar si sabe de tecnología o no. Nos especializamos
              en webs, sistemas a medida, automatización con IA y tarjetas digitales.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Trabajamos con gastronomía, indumentaria, servicios y todo tipo de
              proyectos que quieran dar el salto digital con confianza.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-primary opacity-15 blur-3xl rounded-full" />
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
              alt="Equipo NoduStudio trabajando"
              loading="lazy"
              className="relative rounded-3xl shadow-elegant ring-1 ring-border w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>

        {/* Por qué elegirnos */}
        <div id="por-que-elegirnos" className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Por qué elegirnos
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-[1.1]">
            Lo que nos hace <span className="text-primary italic">diferentes</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v) => (
            <div
              key={v.title}
              className="p-7 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center mb-5">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
