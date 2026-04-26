export type CardCategory = {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
};

export const cardCategories: CardCategory[] = [
  {
    slug: "casamientos",
    name: "Casamientos",
    description: "Invitaciones elegantes para el día más importante.",
    emoji: "💍",
    gradient: "from-pink-400/40 to-rose-600/40",
  },
  {
    slug: "cumpleanos",
    name: "Cumpleaños",
    description: "Diseños divertidos para celebrar a lo grande.",
    emoji: "🎂",
    gradient: "from-amber-400/40 to-orange-600/40",
  },
  {
    slug: "eventos",
    name: "Eventos",
    description: "Para fiestas, baby showers, bautismos y más.",
    emoji: "🎉",
    gradient: "from-violet-400/40 to-fuchsia-600/40",
  },
  {
    slug: "negocios",
    name: "Negocios",
    description: "Inauguraciones, lanzamientos y eventos corporativos.",
    emoji: "💼",
    gradient: "from-blue-400/40 to-cyan-600/40",
  },
  {
    slug: "otros",
    name: "Otros",
    description: "Diseños únicos para cualquier ocasión especial.",
    emoji: "✨",
    gradient: "from-emerald-400/40 to-teal-600/40",
  },
];

export type CardDesign = {
  id: string;
  name: string;
  style: string;
  gradient: string;
  emoji: string;
};

export const designsByCategory: Record<string, CardDesign[]> = {
  casamientos: [
    { id: "c1", name: "Eterno", style: "Elegante minimalista", gradient: "from-rose-200/30 to-pink-500/40", emoji: "💍" },
    { id: "c2", name: "Romántico", style: "Floral acuarela", gradient: "from-pink-300/30 to-rose-600/40", emoji: "🌸" },
    { id: "c3", name: "Dorado", style: "Lujo dorado", gradient: "from-amber-200/30 to-yellow-600/40", emoji: "✨" },
    { id: "c4", name: "Boho", style: "Natural rústico", gradient: "from-stone-300/30 to-amber-700/40", emoji: "🌿" },
    { id: "c5", name: "Moderno", style: "Tipográfico audaz", gradient: "from-slate-300/30 to-zinc-700/40", emoji: "🤍" },
    { id: "c6", name: "Playa", style: "Tropical relajado", gradient: "from-sky-300/30 to-cyan-600/40", emoji: "🌊" },
  ],
  cumpleanos: [
    { id: "b1", name: "Confeti", style: "Festivo colorido", gradient: "from-fuchsia-300/30 to-pink-600/40", emoji: "🎉" },
    { id: "b2", name: "Globos", style: "Divertido infantil", gradient: "from-sky-300/30 to-blue-600/40", emoji: "🎈" },
    { id: "b3", name: "Neón", style: "Fiesta nocturna", gradient: "from-violet-400/30 to-fuchsia-700/40", emoji: "🪩" },
    { id: "b4", name: "Princesa", style: "Mágico fantasía", gradient: "from-pink-300/30 to-purple-600/40", emoji: "👑" },
    { id: "b5", name: "Dorado", style: "Elegante 30/40/50", gradient: "from-amber-200/30 to-yellow-700/40", emoji: "🥂" },
    { id: "b6", name: "Retro", style: "Vintage años 80", gradient: "from-orange-300/30 to-red-600/40", emoji: "🎂" },
  ],
  eventos: [
    { id: "e1", name: "Baby Shower", style: "Suave pastel", gradient: "from-sky-200/30 to-pink-300/40", emoji: "👶" },
    { id: "e2", name: "Bautismo", style: "Espiritual celeste", gradient: "from-blue-200/30 to-indigo-500/40", emoji: "🕊️" },
    { id: "e3", name: "Comunión", style: "Clásico blanco", gradient: "from-slate-100/30 to-blue-400/40", emoji: "🤍" },
    { id: "e4", name: "Egresados", style: "Joven dinámico", gradient: "from-violet-300/30 to-blue-700/40", emoji: "🎓" },
    { id: "e5", name: "Aniversario", style: "Romántico íntimo", gradient: "from-rose-300/30 to-red-600/40", emoji: "💖" },
  ],
  negocios: [
    { id: "n1", name: "Lanzamiento", style: "Corporativo moderno", gradient: "from-blue-400/30 to-indigo-700/40", emoji: "🚀" },
    { id: "n2", name: "Inauguración", style: "Premium dorado", gradient: "from-amber-300/30 to-yellow-700/40", emoji: "🥂" },
    { id: "n3", name: "Conferencia", style: "Profesional serio", gradient: "from-slate-400/30 to-zinc-800/40", emoji: "🎤" },
    { id: "n4", name: "Networking", style: "Dinámico ejecutivo", gradient: "from-cyan-300/30 to-blue-700/40", emoji: "🤝" },
  ],
  otros: [
    { id: "o1", name: "Personalizado", style: "Diseño único a medida", gradient: "from-emerald-300/30 to-teal-700/40", emoji: "✨" },
    { id: "o2", name: "Despedida", style: "Emotivo cálido", gradient: "from-orange-300/30 to-red-600/40", emoji: "👋" },
    { id: "o3", name: "Halloween", style: "Misterioso oscuro", gradient: "from-orange-400/30 to-purple-900/40", emoji: "🎃" },
    { id: "o4", name: "Navidad", style: "Festivo tradicional", gradient: "from-red-400/30 to-green-700/40", emoji: "🎄" },
  ],
};
