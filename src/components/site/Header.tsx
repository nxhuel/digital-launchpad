import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#servicios", label: "Servicios" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#precios", label: "Precios" },
  { href: "#casos", label: "Casos" },
];

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow group-hover:scale-110 transition-transform">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Lanzar<span className="text-gradient">.studio</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Button variant="hero" size="sm" asChild>
          <a href="#contacto">Empezar ahora</a>
        </Button>
      </div>
    </header>
  );
}
