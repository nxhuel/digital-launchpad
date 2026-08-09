import { Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { ROUTES } from "@/config/site";
import clikLogo from "@/assets/logo-v2.png";

const navItems = [
  { label: "Inicio", to: ROUTES.home },
  { label: "Cómo funciona", to: ROUTES.home, hash: "como-funciona" },
  { label: "Planes", to: ROUTES.home, hash: "planes" },
  {
    label: "Servicios",
    children: [
      { label: "Tarjetas Digitales", to: ROUTES.tarjetas, desc: "Invitaciones interactivas para eventos" },
      { label: "Soluciones Web", to: ROUTES.soluciones, desc: "Landing pages, sistemas y automatizaciones" },

    ],
  },
  { label: "Nosotros", to: ROUTES.nosotros },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const currentHash = router.state.location.hash;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(item: { to: string; hash?: string }): boolean {
    if (item.hash) {
      return currentPath === item.to && currentHash === `#${item.hash}`;
    }
    return currentPath === item.to;
  }

  const linkClass = (active: boolean) =>
    `relative px-3 py-2 text-base font-semibold transition-colors ${active ? "text-violet-600" : "text-slate-700 hover:text-violet-600"
    } before:absolute before:inset-x-3 before:bottom-0 before:h-1 before:bg-violet-600 before:origin-left before:transition-transform before:duration-200 ${active ? "before:scale-x-100" : "before:scale-x-0 hover:before:scale-x-100"
    }`;

  return (
    <header
      className={`sticky top-9 z-40 transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white/80 backdrop-blur-sm"
        }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="px-2 py-1 bg-slate-900/5">
            <img src={clikLogo} alt="Clik" className="h-8 w-auto object-contain" />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if ("children" in item && item.children) {
              return (
                <div key={item.label} className="relative group">
                  <button
                    className={`${linkClass(false)} flex items-center gap-1`}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 mt-0.5 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                    <div className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 min-w-[240px] overflow-hidden">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group/link"
                        >
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover/link:text-primary transition-colors">
                              {child.label}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{child.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            const linkItem = item as { label: string; to: string; hash?: string };
            const active = isActive(linkItem);
            return (
              <Link
                key={linkItem.label}
                to={linkItem.to}
                hash={linkItem.hash as any}
                className={`${linkClass(active)}`}
              >
                {linkItem.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-md shadow-violet-500/25 transition-all hover:shadow-lg hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            Comenzá ahora
          </Link>
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 pb-6 pt-4 space-y-1 animate-fade-in">
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="mb-3 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-sm font-bold px-5 py-3 rounded-full shadow-md shadow-violet-500/25 transition-all hover:shadow-lg"
          >
            Comenzá ahora
          </Link>
          {navItems.map((item) => {
            if ("children" in item && item.children) {
              return (
                <div key={item.label} className="space-y-1 pt-3">
                  <div className="px-4 py-2 text-sm font-black text-primary uppercase tracking-widest">
                    {item.label}
                  </div>
                  {item.children.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 px-4 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div>{child.label}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">{child.desc}</div>
                    </Link>
                  ))}
                </div>
              );
            }

            const linkItem = item as { label: string; to: string; hash?: string };
            const active = isActive(linkItem);
            return (
              <Link
                key={linkItem.label}
                to={linkItem.to}
                hash={linkItem.hash as any}
                onClick={() => setMobileOpen(false)}
                className={`block py-3 px-4 text-base font-bold transition-colors border-l-4 ${active
                    ? "text-violet-600 border-violet-600"
                    : "text-slate-700 border-transparent hover:border-violet-300 hover:text-violet-600"
                  }`}
              >
                {linkItem.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
