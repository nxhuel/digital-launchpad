import { Link, useLocation } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const sectionLinks = [
  { hash: "#servicios", label: "Servicios" },
  { hash: "#como-funciona", label: "Cómo funciona" },
  { hash: "#precios", label: "Planes" },
  { hash: "#tarjetas", label: "Tarjetas" },
];

export function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow group-hover:scale-110 transition-transform">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Lanzar<span className="text-gradient">.studio</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {sectionLinks.map((l) => (
            <a
              key={l.hash}
              href={isHome ? l.hash : `/${l.hash}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Button variant="hero" size="sm" asChild>
          <a href={isHome ? "#contacto" : "/#contacto"}>Empezar ahora</a>
        </Button>
      </div>
    </header>
  );
}
