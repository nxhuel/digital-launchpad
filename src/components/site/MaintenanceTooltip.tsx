import React from "react";
import { Info, Check, X, Zap, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ServiceType = "webs" | "sistemas" | "ia";
export type TierType = "basic" | "mid" | "premium";

interface MaintenanceTooltipProps {
  service: ServiceType;
  tier: TierType;
  className?: string;
}

const MAINTENANCE_DATA: Record<ServiceType, Record<TierType, { title: string; includes: string[]; excludes: string[] }>> = {
  webs: {
    basic: {
      title: "Soporte Web Básico",
      includes: [
        "Monitoreo 24/7 (Disponibilidad)",
        "Verificación de dominio y hosting",
        "Reemplazo de contenidos existentes",
        "Hasta 1 actualización semanal",
      ],
      excludes: [
        "Nuevas secciones o rutas",
        "Funcionalidades adicionales",
        "Hosting y dominio (pago externo)",
      ],
    },
    mid: {
      title: "Soporte Web Intermedio",
      includes: [
        "Todo lo del plan básico",
        "Reemplazo contenido multi-sección",
        "Ajustes visuales menores",
        "Optimización de carga periódica",
      ],
      excludes: [
        "Desarrollo de nuevas integraciones",
        "Ampliaciones (se cotizan aparte)",
        "Hosting y dominio (pago externo)",
      ],
    },
    premium: {
      title: "Soporte Web Premium",
      includes: [
        "Todo lo del plan intermedio",
        "Soporte prioritario 1-to-1",
        "Supervisión técnica avanzada",
        "Ajustes visuales frecuentes",
      ],
      excludes: [
        "Nuevos desarrollos complejos",
        "Expansiones de infraestructura",
        "Hosting y dominio (pago externo)",
      ],
    },
  },
  sistemas: {
    basic: {
      title: "Soporte Sistema Básico",
      includes: [
        "Verificación de servidor y base de datos",
        "Corrección de errores (bugs)",
        "1 ajuste semanal",
      ],
      excludes: [
        "Nuevos módulos o herramientas (se cotizan aparte)",
        "Servidor y dominio (pago externo)",
      ],
    },
    mid: {
      title: "Soporte Sistema Intermedio",
      includes: [
        "Todo lo del plan básico",
        "Ajustes de UI/UX",
        "2 ajustes semanales",
      ],
      excludes: [
        "Nuevos módulos o herramientas (se cotizan aparte)",
        "Servidor y dominio (pago externo)",
      ],
    },
    premium: {
      title: "Soporte Sistema Premium",
      includes: [
        "Todo lo del plan intermedio",
        "Supervisión prioritaria 24/7",
        "Correcciones críticas inmediatas",
        "Coordinación mejoras evolutivas",
      ],
      excludes: [
        "Desarrollo de nuevas funciones (se cotizan aparte)",
        "Escalabilidad (se cotiza aparte)",
        "Servidor y dominio (pago externo)",
      ],
    },
  },
  ia: {
    basic: {
      title: "Soporte IA Básico",
      includes: [
        "Supervisión del flujo del Chatbot",
        "Verificación de disponibilidad",
        "Ajustes de prompts/respuestas",
        "1 actualización semanal",
      ],
      excludes: [
        "Nuevos flujos de conversación",
        "Integraciones adicionales",
        "Costos de APIs (OpenAI, etc)",
      ],
    },
    mid: {
      title: "Soporte IA Intermedio",
      includes: [
        "Supervisión de agentes activos",
        "Reentrenamiento liviano mensual",
        "Ajustes de comportamiento IA",
        "Revisión de integraciones",
      ],
      excludes: [
        "Nuevas automatizaciones",
        "Cambios de modelo o arquitectura",
        "Costos de APIs (OpenAI, etc)",
      ],
    },
    premium: {
      title: "Soporte IA Premium",
      includes: [
        "Supervisión prioritaria de flujos",
        "Optimización avanzada de prompts",
        "Monitoreo de automatizaciones",
        "Coordinación técnica de escala",
      ],
      excludes: [
        "Nuevas integraciones complejas",
        "Automatizaciones desde cero",
        "Costos de APIs (OpenAI, etc)",
      ],
    },
  },
};

export function MaintenanceTooltip({ service, tier, className }: MaintenanceTooltipProps) {
  const data = MAINTENANCE_DATA[service]?.[tier];

  if (!data) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center ml-1.5 p-0.5 rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-all cursor-help outline-none group",
              className
            )}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <ShieldCheck className="h-3 w-3 transition-transform group-hover:scale-110" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="center"
          className="p-0 border-none bg-transparent shadow-none"
          sideOffset={12}
        >
          <div className="w-72 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-bottom">
            {/* Header */}
            <div className="bg-slate-50/80 px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {data.title}
              </h4>
              <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="space-y-2.5">
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Compromiso Mensual</p>
                <ul className="space-y-2">
                  {data.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[12px] text-slate-600 leading-tight group/item">
                      <div className="mt-0.5 h-3.5 w-3.5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 group-hover/item:bg-emerald-100 transition-colors">
                        <Check className="h-2 w-2 text-emerald-600 stroke-[4]" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fuera de Alcance</p>
                <ul className="space-y-2">
                  {data.excludes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[12px] text-slate-400 leading-tight">
                      <div className="mt-0.5 h-3.5 w-3.5 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <X className="h-2 w-2 text-slate-300 stroke-[4]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Professional Footer */}
            <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100">
               <p className="text-[9px] text-slate-400 italic text-center leading-relaxed">
                 Soporte enfocado en estabilidad y ajustes menores. Mejoras evolutivas se cotizan por separado.
               </p>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-primary" />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
