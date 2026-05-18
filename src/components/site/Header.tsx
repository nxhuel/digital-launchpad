<<<<<<< HEAD
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import clikLogo from "../../assets/logo-v2.png";

const navLinks = [
  { hash: "#servicios", label: "Servicios" },
  { hash: "#como-funciona", label: "Cómo funciona" },
  { hash: "#planes", label: "Planes" },
  { hash: "#contacto", label: "Contacto" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 inset-x-0 z-50 transition-all duration-500 px-4 md:px-6 pointer-events-none`}
    >
      <div className={`max-w-6xl mx-auto h-16 flex items-center justify-between rounded-full px-6 md:px-10 transition-all duration-500 pointer-events-auto ${
        scrolled 
          ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 py-2" 
          : "bg-white/90 backdrop-blur-md border border-white/50 py-3"
      }`}>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="px-2 py-1 rounded-xl bg-slate-900/5 transition-colors group-hover:bg-slate-900/10">
            <img src={clikLogo} alt="Clik Logo" className="h-8 w-auto object-contain" />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.hash}
              href={link.hash}
              className="text-sm text-slate-700 hover:text-primary transition-colors"
=======
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
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
            >
              {link.label}
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
<<<<<<< HEAD
          <Button variant="default" size="sm" asChild className="hidden md:inline-flex rounded-full px-6 bg-primary hover:bg-indigo-700 text-white shadow-lg shadow-primary/20">
            <Link to="/mas-de-nosotros">Más de nosotros</Link>
          </Button>

          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
=======
          <Button variant="hero" size="sm" asChild className="hidden sm:inline-flex">
            <a href={prefix("#contacto")}>Empezar ahora</a>
          </Button>
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {mobileOpen && (
        <div className="md:hidden mt-2 mx-2 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-6 space-y-2 pointer-events-auto animate-fade-up">
          {navLinks.map((link) => (
            <a
              key={link.hash}
              href={link.hash}
              onClick={() => setMobileOpen(false)}
              className="block py-3 px-4 text-base font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-50">
            <Button variant="default" size="lg" asChild className="w-full rounded-xl bg-primary text-white">
              <Link to="/mas-de-nosotros" onClick={() => setMobileOpen(false)}>
                Más de nosotros
              </Link>
            </Button>
=======
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
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
          </div>
        </div>
      )}
    </header>
  );
}
