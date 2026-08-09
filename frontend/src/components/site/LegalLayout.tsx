import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ShieldCheck, Scale, ArrowLeft } from "lucide-react";

type LegalSection = {
  title: string;
  body: ReactNode;
};

export function LegalLayout({
  icon,
  title,
  subtitle,
  updatedAt,
  sections,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Marca + volver al login */}
        <div className="flex items-center justify-between mb-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al login
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="font-display text-lg font-bold text-slate-900 tracking-tight">
              Clik <span className="text-violet-600">.</span>
            </span>
          </Link>
        </div>

        <div className="mb-10">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-violet-50 text-violet-600 mb-5">
            {icon}
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-slate-900 mb-3">{title}</h1>
          <p className="text-base text-slate-500 leading-relaxed max-w-xl">{subtitle}</p>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-4">
            Última actualización: {updatedAt}
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-violet-600 text-white text-xs font-black shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <div className="text-[15px] text-slate-600 leading-relaxed space-y-3 ml-10">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium">
            Si tenés preguntas sobre estos documentos, escribinos a{" "}
            <a href="mailto:Clikagenciadigital.ba@gmail.com" className="text-violet-600 hover:text-violet-800">
              Clikagenciadigital.ba@gmail.com
            </a>
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link to="/terminos" className="inline-flex items-center gap-1.5 hover:text-violet-600 transition-colors">
              <Scale className="h-3.5 w-3.5" /> Términos
            </Link>
            <Link to="/privacidad" className="inline-flex items-center gap-1.5 hover:text-violet-600 transition-colors">
              <ShieldCheck className="h-3.5 w-3.5" /> Privacidad
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
