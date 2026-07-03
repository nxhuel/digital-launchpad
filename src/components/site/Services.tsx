import { MessageCircle, Zap, HeartHandshake, Clock } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { SITE } from "@/config/site";

const benefits = [
  {
    icon: MessageCircle,
    title: "Hablamos claro",
    desc: "Sin tecnicismos ni vueltas. Te explicamos todo en simple porque sabemos que tu tiempo es valioso.",
  },
  {
    icon: Zap,
    title: "Resultados rápidos",
    desc: "Landing pages en 5 días, tarjetas en 48hs. Procesos eficientes sin burocracia.",
  },
  {
    icon: HeartHandshake,
    title: "Acompañamiento real",
    desc: "No desaparecemos después de entregar. Seguimos ahí por WhatsApp cuando nos necesitás.",
  },
  {
    icon: Clock,
    title: "Pagás al final",
    desc: "Primero trabajamos, después cobramos. Sin adelantos, sin riesgo. Solo cuando aprobás, pagás.",
  },
];

export function Services() {
  const ref = useReveal();

  return (
    <section className="py-20 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-medium tracking-widest text-primary uppercase mb-3">
            POR QUÉ CLIK
          </div>
          <h2 className="font-display text-4xl md:text-5xl mb-4">
            Una forma distinta de <span className="text-primary">hacer tecnología</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No somos una agencia cualquiera. Nos involucramos como si fuera nuestro.
          </p>
        </div>

        <div ref={ref} className="reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="group rounded-2xl p-8 bg-white border border-slate-100 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{b.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href={SITE.whatsapp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <MessageCircle className="h-4 w-4" /> Conversemos sin compromiso
          </a>
        </div>
      </div>
    </section>
  );
}
