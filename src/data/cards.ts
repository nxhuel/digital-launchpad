export type CardCategory = {
  slug: string;
  name: string;
  description: string;
};

export const cardCategories: CardCategory[] = [
  {
    slug: "casamientos",
    name: "Casamientos",
    description: "Invitaciones elegantes para el día más importante.",
  },
  {
    slug: "xv",
    name: "XV / 15 años",
    description: "Diseños modernos y soñados para los 15.",
  },
  {
    slug: "peques",
    name: "Peques / Infantiles",
    description: "Cumples, baby showers y bautismos con onda.",
  },
  {
    slug: "empresariales",
    name: "Empresariales",
    description: "Lanzamientos, inauguraciones y eventos corporativos.",
  },
];

export type CardTag = "Popular" | "Nuevo" | "Elegante" | "Premium" | "Minimal";

export type CardDesign = {
  id: string;
  name: string;
  category: string; // slug
  style: string;
  tag?: CardTag;
  // Visual
  accent: string; // tailwind gradient classes inside the phone screen
  ring: string;
  font: string; // font class for the title
  badge: string;
  // Invite content
  subtitle: string;
  date: string;
  location: string;
  cta: string;
};

export const cardDesigns: CardDesign[] = [
  // Casamientos
  {
    id: "w-elegance",
    name: "Elegance Wedding",
    category: "casamientos",
    style: "Elegante minimalista",
    tag: "Popular",
    accent: "from-amber-200/25 via-rose-200/15 to-stone-300/25",
    ring: "ring-amber-200/25",
    font: "font-serif",
    badge: "Save the date",
    subtitle: "se casan",
    date: "Sábado 12 · Octubre 2026",
    location: "Estancia La Reserva · 19:30 hs",
    cta: "Confirmar asistencia",
  },
  {
    id: "w-romantico",
    name: "Romántico Floral",
    category: "casamientos",
    style: "Floral acuarela",
    tag: "Elegante",
    accent: "from-rose-300/25 via-pink-300/20 to-rose-500/25",
    ring: "ring-rose-200/25",
    font: "font-serif italic",
    badge: "Nos casamos",
    subtitle: "te invitan a su boda",
    date: "Domingo 5 · Mayo 2026",
    location: "Jardín Los Olivos · 18:00 hs",
    cta: "Confirmar asistencia",
  },
  {
    id: "w-dorado",
    name: "Golden Luxe",
    category: "casamientos",
    style: "Lujo dorado",
    tag: "Premium",
    accent: "from-amber-300/25 via-yellow-500/15 to-amber-700/25",
    ring: "ring-amber-300/30",
    font: "font-serif",
    badge: "Wedding day",
    subtitle: "celebran su amor",
    date: "Sábado 22 · Noviembre",
    location: "Hotel Palacio Real · 20:00 hs",
    cta: "Confirmar asistencia",
  },
  {
    id: "w-moderno",
    name: "Modern Minimal",
    category: "casamientos",
    style: "Tipográfico audaz",
    tag: "Minimal",
    accent: "from-zinc-200/15 via-stone-300/10 to-zinc-500/20",
    ring: "ring-white/15",
    font: "font-display tracking-tight",
    badge: "12.10.26",
    subtitle: "wedding",
    date: "Sábado 12 · Octubre",
    location: "Casa de Campo · 19:00 hs",
    cta: "Confirmar asistencia",
  },

  // XV / 15 años
  {
    id: "xv-valentina",
    name: "Valentina Glow",
    category: "xv",
    style: "Brillo y glamour",
    tag: "Popular",
    accent: "from-fuchsia-500/30 via-pink-500/20 to-rose-500/30",
    ring: "ring-pink-300/25",
    font: "font-serif italic",
    badge: "Mis 15",
    subtitle: "cumple 15",
    date: "Sábado 14 · Septiembre",
    location: "Salón Aurora · 21:00 hs",
    cta: "Confirmar asistencia",
  },
  {
    id: "xv-rosegold",
    name: "Rose Gold",
    category: "xv",
    style: "Romántico rosé",
    tag: "Elegante",
    accent: "from-rose-300/25 via-pink-300/15 to-amber-200/25",
    ring: "ring-rose-200/25",
    font: "font-serif",
    badge: "XV años",
    subtitle: "celebra sus 15",
    date: "Viernes 7 · Junio",
    location: "Quinta El Rosedal · 22:00 hs",
    cta: "Confirmar asistencia",
  },
  {
    id: "xv-neon",
    name: "Neón Party",
    category: "xv",
    style: "Fiesta nocturna",
    tag: "Nuevo",
    accent: "from-violet-500/30 via-fuchsia-500/20 to-cyan-400/25",
    ring: "ring-fuchsia-400/30",
    font: "font-display tracking-tight",
    badge: "XV · Party",
    subtitle: "te invita a sus 15",
    date: "Sábado 28 · Marzo",
    location: "Club Neón · 23:00 hs",
    cta: "Sumarme a la fiesta",
  },
  {
    id: "xv-celestial",
    name: "Celestial",
    category: "xv",
    style: "Etéreo soñado",
    tag: "Premium",
    accent: "from-indigo-400/25 via-violet-400/20 to-pink-400/25",
    ring: "ring-violet-300/25",
    font: "font-serif italic",
    badge: "Mis XV",
    subtitle: "cumple 15",
    date: "Sábado 5 · Octubre",
    location: "Salón Estelar · 21:30 hs",
    cta: "Confirmar asistencia",
  },

  // Peques / Infantiles
  {
    id: "k-mateo",
    name: "Mateo Bautismo",
    category: "peques",
    style: "Suave celeste",
    tag: "Popular",
    accent: "from-sky-300/25 via-indigo-300/15 to-blue-400/25",
    ring: "ring-sky-200/25",
    font: "font-serif",
    badge: "Te esperamos",
    subtitle: "Bautismo",
    date: "Domingo 03 · Agosto",
    location: "Parroquia San Benito · 11:00 hs",
    cta: "Confirmar asistencia",
  },
  {
    id: "k-luna",
    name: "Luna Baby Shower",
    category: "peques",
    style: "Pastel acuarela",
    tag: "Elegante",
    accent: "from-pink-200/25 via-rose-200/15 to-amber-200/25",
    ring: "ring-pink-200/25",
    font: "font-serif italic",
    badge: "Baby Shower",
    subtitle: "esperamos a Luna",
    date: "Sábado 19 · Abril",
    location: "Casa de la familia · 16:00 hs",
    cta: "Confirmar asistencia",
  },
  {
    id: "k-tomas",
    name: "Tomás Aventura",
    category: "peques",
    style: "Divertido infantil",
    tag: "Nuevo",
    accent: "from-emerald-400/25 via-cyan-400/15 to-blue-500/25",
    ring: "ring-cyan-300/25",
    font: "font-display tracking-tight",
    badge: "Cumple 5",
    subtitle: "festeja",
    date: "Domingo 11 · Mayo",
    location: "Parque Aventura · 15:30 hs",
    cta: "Quiero ir",
  },
  {
    id: "k-sofi",
    name: "Sofi Princesa",
    category: "peques",
    style: "Mágico fantasía",
    tag: "Popular",
    accent: "from-pink-400/25 via-purple-400/15 to-violet-500/25",
    ring: "ring-purple-300/25",
    font: "font-serif italic",
    badge: "Mis 6",
    subtitle: "cumple años",
    date: "Sábado 8 · Marzo",
    location: "Salón Encantado · 17:00 hs",
    cta: "Confirmar asistencia",
  },

  // Empresariales
  {
    id: "e-launch",
    name: "Launch Pro",
    category: "empresariales",
    style: "Corporativo moderno",
    tag: "Nuevo",
    accent: "from-blue-500/25 via-indigo-500/15 to-violet-600/25",
    ring: "ring-blue-400/25",
    font: "font-display tracking-tight",
    badge: "Launch event",
    subtitle: "presenta",
    date: "Jueves 18 · Septiembre",
    location: "Centro de Convenciones · 19:00 hs",
    cta: "Reservar mi lugar",
  },
  {
    id: "e-opening",
    name: "Grand Opening",
    category: "empresariales",
    style: "Premium dorado",
    tag: "Premium",
    accent: "from-amber-300/25 via-yellow-500/15 to-orange-600/25",
    ring: "ring-amber-300/30",
    font: "font-serif",
    badge: "Inauguración",
    subtitle: "te invita",
    date: "Viernes 22 · Agosto",
    location: "Av. Libertador 1234 · 20:00 hs",
    cta: "Confirmar asistencia",
  },
  {
    id: "e-summit",
    name: "Summit Minimal",
    category: "empresariales",
    style: "Profesional minimal",
    tag: "Minimal",
    accent: "from-zinc-300/15 via-slate-400/10 to-zinc-700/25",
    ring: "ring-white/15",
    font: "font-display tracking-tight",
    badge: "Summit 2026",
    subtitle: "conferencia anual",
    date: "Miércoles 7 · Octubre",
    location: "Auditorio Central · 09:00 hs",
    cta: "Reservar mi lugar",
  },
];
