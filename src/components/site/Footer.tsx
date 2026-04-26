import { Rocket, Instagram, Linkedin, MessageCircle, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 mt-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Rocket className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">
              Lanzar<span className="text-gradient">.studio</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Ayudamos a emprendedores a llevar su negocio al mundo digital de forma simple, rápida y profesional.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">Contacto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>hola@lanzar.studio</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp +54 11 0000 0000</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">Redes</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="h-9 w-9 rounded-lg glass grid place-items-center hover:border-primary/50 transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="h-9 w-9 rounded-lg glass grid place-items-center hover:border-primary/50 transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" aria-label="WhatsApp" className="h-9 w-9 rounded-lg glass grid place-items-center hover:border-primary/50 transition-colors">
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-border text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
        <span>© {new Date().getFullYear()} Lanzar.studio — Todos los derechos reservados</span>
        <span>Hecho con 💜 para emprendedores</span>
      </div>
    </footer>
  );
}
