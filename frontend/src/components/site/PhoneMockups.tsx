// Mockups ilustrados de celulares (SVG inline, flat, sin sombras ni gradientes)
// para la sección de pricing. Mismo estilo entre los tres: mismo grosor de trazo,
// mismo radio de esquinas, misma paleta (#6C4FE0, #EFEBFC, #17C777, #E7E5F1, #F6F6FA).
import { cn } from "@/lib/utils";

const STROKE = "#E7E5F1";
const SCREEN_BG = "#F6F6FA";
const VIOLET = "#6C4FE0";
const VIOLET_SOFT = "#EFEBFC";
const GREEN = "#17C777";
const LINE_GRAY = "#D8DCE6";

/** Componente 1: celular con QR + tarjeta flotante de invitados (plan Premium Plus+). */
export function PhoneQRAlbum({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 170 200"
      className={cn("h-auto w-36", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Celular */}
      <rect x="12" y="6" width="100" height="188" rx="24" fill="white" stroke={STROKE} strokeWidth="2" />
      <rect x="18" y="12" width="88" height="176" rx="16" fill={SCREEN_BG} />

      {/* QR simplificado (patrón de cuadraditos violeta) */}
      <rect x="26" y="24" width="18" height="18" rx="3" fill={VIOLET} />
      <rect x="31" y="29" width="8" height="8" fill={SCREEN_BG} />
      <rect x="62" y="24" width="18" height="18" rx="3" fill={VIOLET} />
      <rect x="67" y="29" width="8" height="8" fill={SCREEN_BG} />
      <rect x="30" y="48" width="5" height="5" fill={VIOLET} />
      <rect x="42" y="44" width="5" height="5" fill={VIOLET} />
      <rect x="54" y="48" width="5" height="5" fill={VIOLET} />
      <rect x="30" y="58" width="5" height="5" fill={VIOLET} />
      <rect x="42" y="60" width="5" height="5" fill={VIOLET} />
      <rect x="54" y="56" width="5" height="5" fill={VIOLET} />
      <rect x="66" y="58" width="5" height="5" fill={VIOLET} />
      <rect x="30" y="70" width="5" height="5" fill={VIOLET} />
      <rect x="42" y="68" width="5" height="5" fill={VIOLET} />
      <rect x="54" y="72" width="5" height="5" fill={VIOLET} />
      <rect x="30" y="82" width="5" height="5" fill={VIOLET} />
      <rect x="42" y="84" width="5" height="5" fill={VIOLET} />
      <rect x="54" y="80" width="5" height="5" fill={VIOLET} />
      <rect x="42" y="92" width="5" height="5" fill={VIOLET} />
      <rect x="54" y="90" width="5" height="5" fill={VIOLET} />

      {/* Texto simulado debajo del QR */}
      <rect x="26" y="108" width="36" height="5" rx="2.5" fill={LINE_GRAY} />
      <rect x="26" y="120" width="26" height="5" rx="2.5" fill={LINE_GRAY} />

      {/* Tarjeta flotante: álbum + confirmación de invitados (overlap sobre el celular) */}
      <rect x="70" y="58" width="88" height="112" rx="16" fill="white" stroke={VIOLET} strokeWidth="2" />
      {/* Casilleros marcados */}
      <rect x="80" y="74" width="26" height="26" rx="7" fill="white" stroke={VIOLET} strokeWidth="2" />
      <path d="M87 87l5 5 10-12" stroke={VIOLET} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="116" y="74" width="26" height="26" rx="7" fill="white" stroke={VIOLET} strokeWidth="2" />
      <path d="M123 87l5 5 10-12" stroke={VIOLET} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Casilleros sin marcar */}
      <circle cx="93" cy="126" r="13" fill="white" stroke={VIOLET} strokeWidth="2" />
      <circle cx="129" cy="126" r="13" fill="white" stroke={VIOLET} strokeWidth="2" />
    </svg>
  );
}

/** Componente 2: celular con header violeta y filas de formulario/chat (plan Premium). */
export function PhoneFormChat({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 170 200"
      className={cn("h-auto w-36", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Tarjeta gris asomando por detrás (otro formulario/documento) */}
      <rect x="12" y="64" width="44" height="72" rx="14" fill="#ECEDF2" stroke={STROKE} strokeWidth="2" />
      <rect x="20" y="78" width="28" height="4" rx="2" fill={LINE_GRAY} />
      <rect x="20" y="88" width="20" height="4" rx="2" fill={LINE_GRAY} />
      <rect x="20" y="98" width="24" height="4" rx="2" fill={LINE_GRAY} />

      {/* Celular */}
      <rect x="40" y="6" width="100" height="188" rx="24" fill="white" stroke={STROKE} strokeWidth="2" />
      <rect x="46" y="12" width="88" height="176" rx="16" fill={SCREEN_BG} />

      {/* Header violeta sólido */}
      <rect x="46" y="12" width="88" height="30" rx="16" fill={VIOLET} />
      <rect x="46" y="24" width="88" height="18" fill={VIOLET} />

      {/* Fila 1: burbuja de chat + líneas de texto */}
      <rect x="52" y="52" width="76" height="44" rx="12" fill="white" stroke={STROKE} strokeWidth="2" />
      <path
        d="M60 64h20a7 7 0 0 1 7 7v0a7 7 0 0 1-7 7h-10l-6 5v-5h-4a7 7 0 0 1-7-7v0a7 7 0 0 1 7-7z"
        fill={VIOLET_SOFT}
        stroke={VIOLET}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="92" y="66" width="30" height="4" rx="2" fill={LINE_GRAY} />
      <rect x="92" y="75" width="22" height="4" rx="2" fill={LINE_GRAY} />

      {/* Fila 2 */}
      <rect x="52" y="106" width="76" height="44" rx="12" fill="white" stroke={STROKE} strokeWidth="2" />
      <path
        d="M60 118h20a7 7 0 0 1 7 7v0a7 7 0 0 1-7 7h-10l-6 5v-5h-4a7 7 0 0 1-7-7v0a7 7 0 0 1 7-7z"
        fill={VIOLET_SOFT}
        stroke={VIOLET}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="92" y="120" width="30" height="4" rx="2" fill={LINE_GRAY} />
      <rect x="92" y="129" width="22" height="4" rx="2" fill={LINE_GRAY} />
    </svg>
  );
}

/** Componente 3: celular con confirmación por WhatsApp Asisto / No asisto (plan Estándar). */
export function PhoneWhatsApp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 170 200"
      className={cn("h-auto w-36", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Celular */}
      <rect x="35" y="6" width="100" height="188" rx="24" fill="white" stroke={STROKE} strokeWidth="2" />
      <rect x="41" y="12" width="88" height="176" rx="16" fill={SCREEN_BG} />

      {/* Píldora "Asisto" */}
      <rect x="43" y="28" width="64" height="30" rx="15" fill={GREEN} />
      {/* Ícono de chat genérico (sin logo real de WhatsApp) */}
      <circle cx="59" cy="43" r="8" fill={GREEN} stroke="white" strokeWidth="1.5" />
      <rect x="55.5" y="40" width="7" height="5" rx="2" fill="white" />
      <path d="M60 45l-3 3 1-3z" fill="white" />
      <text
        x="71"
        y="47"
        fill="white"
        fontSize="11"
        fontWeight="700"
        fontFamily="inherit"
        letterSpacing="0.02em"
      >
        Asisto
      </text>

      {/* Píldora "No asisto" (sin marcar) */}
      <rect x="35" y="70" width="80" height="34" rx="17" fill="white" stroke={STROKE} strokeWidth="2" />
      <text
        x="75"
        y="91"
        fill="#9A9AA6"
        fontSize="12"
        fontWeight="600"
        fontFamily="inherit"
        textAnchor="middle"
      >
        No asisto
      </text>
    </svg>
  );
}
