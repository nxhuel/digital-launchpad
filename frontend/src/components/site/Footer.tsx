import { Instagram, MessageCircle, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SITE, ROUTES } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="font-display text-2xl text-slate-900">
              Clik <span className="text-primary">.</span>
            </span>
          </Link>
          <p className="text-base text-slate-500 max-w-sm leading-relaxed">
            Ayudamos a emprendedores a llevar su negocio al mundo digital de forma simple, rápida y
            profesional. No somos solo desarrolladores, somos tus socios.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-sm text-slate-900 uppercase tracking-widest">
            Navegación
          </h4>
          <ul className="space-y-3 text-sm text-slate-600 font-medium">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link to={ROUTES.tarjetas} className="hover:text-primary transition-colors">
                Tarjetas Digitales
              </Link>
            </li>
            <li>
              <Link to={ROUTES.soluciones} className="hover:text-primary transition-colors">
                Soluciones Web
              </Link>
            </li>
            <li>
              <Link to={ROUTES.nosotros} className="hover:text-primary transition-colors">
                Nosotros
              </Link>
            </li>
            <li>
              <Link to={ROUTES.contacto} className="hover:text-primary transition-colors">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-sm text-slate-900 uppercase tracking-widest">
            Contacto
          </h4>
          <ul className="space-y-4 text-sm text-slate-600 font-medium">
            <li className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-primary shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <a href={`mailto:${SITE.email}`} className="hover:text-primary transition-colors">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-primary shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <a
                href={SITE.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {SITE.whatsapp.number}
              </a>
            </li>
          </ul>

          <div className="mt-6">
            <h4 className="font-bold mb-4 text-sm text-slate-900 uppercase tracking-widest">
              Redes
            </h4>
            <div className="flex gap-3">
              <a
                href={SITE.social.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 grid place-items-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={SITE.whatsapp.link}
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 grid place-items-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 border-t border-slate-50 flex flex-wrap justify-between gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <span>{SITE.copyright}</span>
        <div className="flex gap-6">
          <Link to={ROUTES.terminos} className="hover:text-primary transition-colors">
            Términos
          </Link>
          <Link to={ROUTES.privacidad} className="hover:text-primary transition-colors">
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
