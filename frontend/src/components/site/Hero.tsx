import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, CreditCard, Globe, Database, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ROUTES } from "@/config/site";
import heroBg from "@/assets/logo-v3.png";
import heroBgResponsive from "@/assets/logo-v3-responsive.png";
import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { BrowserMockup } from "@/components/mockups/BrowserMockup";
import { DashboardMockup } from "@/components/mockups/DashboardMockup";
import { AIMockup } from "@/components/mockups/AIMockup";

const services = [
  {
    id: "tarjetas",
    label: "Tarjetas Digitales",
    icon: CreditCard,
    title: "Tarjetas digitales",
    highlight: "para tus eventos",
    description:
      "Invitaciones interactivas con diseño moderno, QR, WhatsApp, Instagram y todo lo que necesitás.",
    cta: { label: "Crear tarjeta", href: ROUTES.tarjetas },
    mockup: <PhoneMockup />,
  },
  {
    id: "web",
    label: "Páginas Web",
    icon: Globe,
    title: "Páginas web",
    highlight: "que convierten",
    description:
      "Landing pages y sitios profesionales con diseño premium, optimizados para velocidad y SEO.",
    cta: { label: "Ver planes web", href: ROUTES.soluciones },
    mockup: <BrowserMockup />,
  },
  {
    id: "sistemas",
    label: "Sistemas Web",
    icon: Database,
    title: "Sistemas web",
    highlight: "a tu medida",
    description:
      "Dashboards, CRM y software SaaS diseñados para digitalizar y potenciar tu negocio.",
    cta: { label: "Consultar sistema", href: ROUTES.soluciones },
    mockup: <DashboardMockup />,
  },
  {
    id: "ia",
    label: "IA",
    icon: Bot,
    title: "Automatización",
    highlight: "con inteligencia",
    description:
      "Chatbots, asistentes virtuales y workflows automatizados con IA para tu negocio.",
    cta: { label: "Explorar IA", href: ROUTES.soluciones },
    mockup: <AIMockup />,
  },
];

const AUTOPLAY_INTERVAL = 10000;
const TRANSITION_DURATION = 450;

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "transitioning">("idle");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeService = services[activeIndex];

  const startTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % services.length);
    }, AUTOPLAY_INTERVAL);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(intervalRef.current);
  }, [startTimer]);

  useEffect(() => {
    if (phase === "transitioning") {
      const timer = setTimeout(() => {
        setPhase("idle");
        setPrevIndex(null);
      }, TRANSITION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const goToService = (index: number) => {
    if (index === activeIndex || phase === "transitioning") return;
    clearInterval(intervalRef.current);
    setPrevIndex(activeIndex);
    setActiveIndex(index);
    setPhase("transitioning");
    startTimer();
  };

  const renderContent = (
    service: (typeof services)[0],
    state: "entering" | "exiting" | "visible",
  ) => {
    const isEntering = state === "entering";
    const isExiting = state === "exiting";

    return (
      <div
        className={`transition-all ease-out will-change-transform will-change-opacity`}
        style={{
          opacity: isExiting ? 0 : 1,
          transform: isEntering
            ? "translateY(8px)"
            : isExiting
              ? "translateY(-4px)"
              : "translateY(0)",
          transitionDuration: `${TRANSITION_DURATION}ms`,
        }}
      >


        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                {service.title}{" "}
                <span className="text-violet-400">{service.highlight}</span>
              </h1>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-lg mt-3">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-5">
                <Button
                  size="lg"
                  asChild
                  className="rounded-none bg-violet-600 hover:bg-violet-500 px-6 h-12 text-sm font-bold border-2 border-violet-400 text-white shadow-[3px_3px_0px_0px_rgba(139,92,246,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(139,92,246,0.3)] active:shadow-none transition-all duration-200"
                >
                  <Link to={service.cta.href}>
                    {service.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-[320px] drop-shadow-2xl">
              {service.mockup}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative min-h-[calc(100vh-100px)] flex items-center overflow-hidden bg-slate-900">
      <div
        className={`absolute inset-0 bg-cover bg-center ${isMobile ? "" : "bg-fixed"}`}
        style={{ backgroundImage: `url(${isMobile ? heroBgResponsive : heroBg})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-900 pointer-events-none" />

      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8">
        <div className="relative">
          {prevIndex !== null && (
            <div className="absolute inset-0 pointer-events-none">
              {renderContent(services[prevIndex], "exiting")}
            </div>
          )}
          <div>
            {renderContent(activeService, phase === "transitioning" ? "entering" : "visible")}
          </div>
        </div>

        <div
          className="flex flex-wrap justify-center gap-2 mt-6 pt-6 border-t border-slate-800"
        >
          {services.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === activeIndex;
            return (
              <button
                key={s.id}
                onClick={() => goToService(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold transition-all duration-200 will-change-transform ${
                  isActive
                    ? "bg-violet-600 border-violet-500 text-white shadow-sm"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
          </div>
      </div>
    </section>
  );
}
