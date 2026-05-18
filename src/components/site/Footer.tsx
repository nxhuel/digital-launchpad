import { Instagram, Linkedin, MessageCircle, Mail } from "lucide-react";
<<<<<<< HEAD

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <span className="font-display text-2xl text-slate-900">
              Clik <span className="text-primary">.</span>
            </span>
          </div>
          <p className="text-base text-slate-500 max-w-sm leading-relaxed">
            Ayudamos a emprendedores a llevar su negocio al mundo digital de forma simple, rápida y profesional. No somos solo desarrolladores, somos tus socios.
=======
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
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
          </p>
        </div>

        <div>
<<<<<<< HEAD
          <h4 className="font-bold mb-6 text-sm text-slate-900 uppercase tracking-widest">Contacto</h4>
          <ul className="space-y-4 text-sm text-slate-600 font-medium">
            <li className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-primary">
                <Mail className="h-4 w-4 shrink-0" />
              </div>
              <span>clik.agencia@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-primary">
                <MessageCircle className="h-4 w-4 shrink-0" />
              </div>
              <span>+54 9 11 3350-1445</span>
=======
          <h4 className="font-semibold mb-4 text-sm text-foreground">Contacto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>hola@nodustudio.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span>WhatsApp +54 11 0000 0000</span>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
            </li>
          </ul>
        </div>

        <div>
<<<<<<< HEAD
          <h4 className="font-bold mb-6 text-sm text-slate-900 uppercase tracking-widest">Redes</h4>
          <div className="flex gap-4">
            {[
              { label: "Instagram", icon: Instagram, href: "https://www.instagram.com/clik.ba/" },
              { label: "WhatsApp", icon: MessageCircle, href: "https://wa.me/5491133501445" },
            ].map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 grid place-items-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <Icon className="h-5 w-5" />
=======
          <h4 className="font-semibold mb-4 text-sm text-foreground">Redes</h4>
          <div className="flex gap-3">
            {[Instagram, Linkedin, MessageCircle].map((Icon, i) => (
              <a key={i} href="#" aria-label="Red social" className="h-10 w-10 rounded-lg bg-card border border-border grid place-items-center hover:border-primary hover:text-primary transition-colors">
                <Icon className="h-4 w-4" />
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
              </a>
            ))}
          </div>
        </div>
      </div>
<<<<<<< HEAD

      <div className="max-w-6xl mx-auto px-6 py-8 border-t border-slate-50 flex flex-wrap justify-between gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <span>&copy; {new Date().getFullYear()} Clik Agencia Digital</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Términos</a>
          <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
        </div>
=======
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-border text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
        <span>© {new Date().getFullYear()} NoduStudio — Todos los derechos reservados</span>
        <span>Hecho con ☕ para emprendedores</span>
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
      </div>
    </footer>
  );
}