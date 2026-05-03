import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-nodustudio.png";

const nosotrosLinks = [
  { hash: "#quienes-somos", label: "Quiénes somos" },
  { hash: "#por-que-elegirnos", label: "Por qué elegirnos" },
  { hash: "#casos", label: "Casos reales & testimonios" },
];

const mainLinks = [
  { hash: "#servicios", label: "Servicios" },
  { hash: "#como-funciona", label: "Cómo funciona" },
];

export function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefix = (h: string) => (isHome ? h : `/${h}`);

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="NoduStudio"
            className="h-10 w-10 rounded-lg object-cover ring-1 ring-primary/20 group-hover:scale-105 transition-transform"
          />
          <span className="font-display font-semibold text-xl tracking-tight text-foreground">
            Nodu<span className="text-primary">Studio</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {mainLinks.map((l) => (
            <a
              key={l.hash}
              href={prefix(l.hash)}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}

          {/* Nosotros dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Nosotros <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="w-64 rounded-xl bg-card border border-border shadow-elegant p-2">
                {nosotrosLinks.map((l) => (
                  <a
                    key={l.hash}
                    href={prefix(l.hash)}
                    className="block px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-secondary hover:text-primary transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <a
            href={prefix("#precios")}
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            Servicios y planes
          </a>
          <a
            href={prefix("#contacto")}
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            Contacto
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="hero" size="sm" asChild className="hidden sm:inline-flex">
            <a href={prefix("#contacto")}>Empezar ahora</a>
          </Button>
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {[...mainLinks, ...nosotrosLinks, { hash: "#precios", label: "Servicios y planes" }, { hash: "#contacto", label: "Contacto" }].map((l) => (
              <a
                key={l.hash}
                href={prefix(l.hash)}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
