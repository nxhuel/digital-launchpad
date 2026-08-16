// Sección pensada para insertar dentro de una página existente, no requiere layout propio
import { Check, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/config/site";
import { PhoneQRAlbum, PhoneFormChat, PhoneWhatsApp } from "./PhoneMockups";

interface PricingPlan {
  tag: string;
  title: string;
  description: string;
  features: string[];
  idealFor: string;
  featured?: boolean;
  mockup: "qr" | "form" | "whatsapp";
}

// La card featured va primera: en mobile queda arriba de todo (order-first implícito).
const PLANS: PricingPlan[] = [
  {
    tag: "Premium Plus+",
    title: "Sistema de invitados + álbum colaborativo con QR",
    description:
      "Incluye todo lo del Plan Premium más un álbum digital colaborativo para el evento.",
    features: [
      "Código QR personalizado para imprimir en mesas y carteles",
      "Invitados suben sus fotos escaneando desde el celular",
      "Todas las imágenes reunidas en un mismo espacio",
      "Podés verlas y descargarlas después del evento",
    ],
    idealFor: "quienes también quieren guardar los recuerdos espontáneos de sus invitados",
    featured: true,
    mockup: "qr",
  },
  {
    tag: "Premium",
    title: "Confirmaciones organizadas en un solo lugar",
    description:
      "Formulario de confirmación conectado a un sistema propio con respuestas en tiempo real.",
    features: [
      "Asiste / No asiste",
      "Nombre del invitado y acompañantes",
      "Restricciones alimentarias",
      "Canción favorita y otros datos que necesiten",
    ],
    idealFor: "bodas, 15 años y eventos que quieren toda la información organizada",
    mockup: "form",
  },
  {
    tag: "Estándar",
    title: "Confirmación por WhatsApp",
    description: "Tus invitados solo confirman su asistencia, sin recopilar información.",
    features: [],
    idealFor: "quienes prefieren una confirmación directa por WhatsApp",
    mockup: "whatsapp",
  },
];

const MOCKUP_COMPONENTS = {
  qr: PhoneQRAlbum,
  form: PhoneFormChat,
  whatsapp: PhoneWhatsApp,
} as const;

function PlanCard({ plan }: { plan: PricingPlan }) {
  const Mockup = MOCKUP_COMPONENTS[plan.mockup];
  const ctaHref = whatsappLink(
    `Hola! Quiero más información sobre el plan ${plan.tag} de invitaciones digitales.`,
  );

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl bg-white",
        plan.featured ? "p-8" : "p-6",
        plan.featured
          ? "shadow-xl shadow-primary/20 [background:linear-gradient(white,white)_padding-box,linear-gradient(135deg,#7c3aed,#4f46e5,#d946ef)_border-box] border border-transparent"
          : "border border-slate-200 shadow-card",
      )}
    >
      {plan.featured && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-fuchsia-600 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/30">
          El más elegido
        </span>
      )}

      <span
        className={cn(
          "self-center rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest",
          plan.featured
            ? "bg-gradient-to-r from-primary to-indigo-600 text-white"
            : "border border-primary/20 bg-primary/10 text-primary",
        )}
      >
        {plan.tag}
      </span>

      <div className="relative mt-6 mb-5 flex justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-24 rounded-full bg-primary/10 blur-2xl" />
        <Mockup className={plan.featured ? "h-40 w-auto" : "h-28 w-auto"} />
      </div>

      <h3 className={cn("font-display text-center font-bold leading-snug", plan.featured ? "text-2xl" : "text-lg")}>
        {plan.title}
      </h3>
      <p className="mt-2.5 text-center text-sm leading-relaxed text-muted-foreground">
        {plan.description}
      </p>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm leading-snug text-slate-700">
            <span className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded bg-primary/10 text-primary">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <p className="mt-5 text-sm leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-400">Ideal para: </span>
        <span className="font-bold text-primary">{plan.idealFor}</span>
      </p>

      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all hover:scale-[1.02] active:scale-95",
          plan.featured
            ? "bg-gradient-to-r from-primary via-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-primary/25"
            : "bg-[#150E2E] text-white hover:bg-[#241a4d]",
        )}
      >
        <MessageCircle className="h-4 w-4" />
        Consultar plan
      </a>
    </div>
  );
}

export default function PricingCards() {
  return (
    <section id="planes" className="mt-24 scroll-mt-24 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.05),transparent_65%)]" />

          <div className="mb-14 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                Invitaciones digitales
              </span>
            </div>
            <h2 className="font-display mb-4 text-3xl font-bold md:text-4xl">
              Elegí el modelo <span className="text-gradient">ideal</span> para tu evento
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              Tres modelos pensados para cada tipo de evento. Elegí el que mejor se adapte a tus
              invitados y a la experiencia que querés crear.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
            {PLANS.map((plan) => (
              <PlanCard key={plan.tag} plan={plan} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
