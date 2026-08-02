import { useState, useEffect } from "react";

const messages = [
  { icon: "🇦🇷", text: "Agencia digital argentina" },
  { icon: "🚀", text: "Desarrollamos software y páginas web a medida" },
  { icon: "💳", text: "Tarjetas digitales interactivas para eventos" },
  { icon: "⚡", text: "Presupuesto sin cargo · Atención personalizada" },
  { icon: "🔒", text: "Pagos seguros a través de Mercado Pago" },
  { icon: "🤝", text: "Acompañamiento durante todo el proyecto" },
  { icon: "⭐", text: "Sitios optimizados para SEO y velocidad" },
];

export function TopBar() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const msg = messages[current];

  return (
    <div
      className="sticky top-0 z-50 h-9 overflow-hidden"
      style={{ backgroundColor: "#0D1527" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_70%)]" />
      <div className="relative h-full max-w-6xl mx-auto px-6 flex items-center justify-center">
        <div
          className={`flex items-center gap-2 text-xs text-white/90 font-medium tracking-wide transition-all duration-400 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          <span className="text-sm">{msg.icon}</span>
          <span>{msg.text}</span>
          <span className="hidden sm:inline text-white/40 mx-2">·</span>
          <span className="hidden sm:inline text-white/50 text-[10px] font-semibold uppercase tracking-widest">
            Clik
          </span>
        </div>
      </div>
    </div>
  );
}
