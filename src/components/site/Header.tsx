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
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" asChild className="hidden md:inline-flex rounded-full px-6 bg-primary hover:bg-indigo-700 text-white shadow-lg shadow-primary/20">
            <Link to="/mas-de-nosotros">Más de nosotros</Link>
          </Button>

          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

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
          </div>
        </div>
      )}
    </header>
  );
}
