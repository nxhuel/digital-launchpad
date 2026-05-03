import { Instagram, Linkedin, MessageCircle, Mail } from "lucide-react";
import logo from "@/assets/logo-nodustudio.png";

export function Footer() {
  return (
    <footer className="border-t border-border py-14 mt-12 bg-card/40">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="NoduStudio" className="h-10 w-10 rounded-lg ring-1 ring-primary/20" />
            <span className="font-display font-semibold text-xl text-foreground">
              Nodu<span className="text-primary">Studio</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Ayudamos a emprendedores a llevar su negocio al mundo digital de
            forma simple, rápida y profesional.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm text-foreground">Contacto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>hola@nodustudio.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span>WhatsApp +54 11 0000 0000</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm text-foreground">Redes</h4>
          <div className="flex gap-3">
            {[Instagram, Linkedin, MessageCircle].map((Icon, i) => (
              <a key={i} href="#" aria-label="Red social" className="h-10 w-10 rounded-lg bg-card border border-border grid place-items-center hover:border-primary hover:text-primary transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-border text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
        <span>© {new Date().getFullYear()} NoduStudio — Todos los derechos reservados</span>
        <span>Hecho con ☕ para emprendedores</span>
      </div>
    </footer>
  );
}
