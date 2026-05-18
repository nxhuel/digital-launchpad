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
  {
    slug: "regalos",
    name: "Regalos",
    description: "Tarjetas y diseños personalizados para sorprender en ocasiones especiales.",
  },
];

export type CardTag = "Popular" | "Nuevo" | "Elegante" | "Premium" | "Minimal";

export type CardDesign = {
  id: string;
  name: string;
  category: string; // slug
  tag?: CardTag;
<<<<<<< HEAD
  demoUrl?: string;
  imageUrl?: string;
=======
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
  // Optional rich invite content
  eventISO?: string; // for live countdown
  song?: { title: string; artist: string };
  mapsUrl?: string;
>>>>>>> 108bdb491ebbd172a17967dba400e76c57056ad2
};

import invDig1 from "../assets/inv-dig-1.png";
import luciaMateo from "../assets/luciamateocasamiento.png";
import miliXv from "../assets/milixv.png";
import xvSofia from "../assets/xvsofia.png";
import cumpleMateoImg from "../assets/cumpleMateo.png";
import cumpleNicoImg from "../assets/cumpleNico.png";
import babyShowerImg from "../assets/babyshower.png";
import cumpleEmmaImg from "../assets/cumpleEmma.png";
import nexoraImg from "../assets/invDigNexora.png";
import romanceImg from "../assets/cartaRomance.png";
import sanValentinImg from "../assets/sanValentin.png";
import aniversarioImg from "../assets/primerAniversario.png";
import cristianoImg from "../assets/aniversarioCristiano.png";

export const cardDesigns: CardDesign[] = [
  // Casamientos
  {
    id: "julietarisso-casamiento",
    name: "Casamiento",
    category: "casamientos",
    tag: "Popular",
    demoUrl: "https://bodajyg.lovable.app/",
    imageUrl: invDig1,
  },
  {
    id: "luciamateocasamiento",
    name: "lucia y mateo casamiento",
    category: "casamientos",
    tag: "Popular",
    demoUrl: "https://lucia-mateo-cinematic-story.lovable.app/",
    imageUrl: luciaMateo,
  },
  // XV / 15 años
  {
    id: "xv-mili",
    name: "Festaja tus XV",
    category: "xv",
    tag: "Popular",
    demoUrl: "https://sweet-fifteen-elegance.lovable.app",
    imageUrl: miliXv,
  },
    {
    id: "xv-sofia",
    name: "Festaja tus XV",
    category: "xv",
    tag: "Popular",
    demoUrl: "https://disco-glam-invites.lovable.app/",
    imageUrl: xvSofia,
  },
  // Peques / Infantiles
  {
    id: "cumple-mateo",
    name: "cumple mateo",
    category: "peques",
    tag: "Popular",
    demoUrl: "https://stadium-party-kickoff.lovable.app",
    imageUrl: cumpleMateoImg,
  },
  {
    id: "cumpleNico",
    name: "cumpleNico",
    category: "peques",
    tag: "Popular",
    demoUrl: "https://rock-stage-inviter.lovable.app",
    imageUrl: cumpleNicoImg,
  },

  {
    id: "babyshower",
    name: "babyshower",
    category: "peques",
    tag: "Popular",
    demoUrl: "https://baby-bear-sky-ride.lovable.app",
    imageUrl: babyShowerImg,
  },
  {
    id: "cumpleEmma",
    name: "cumple Emma",
    category: "peques",
    tag: "Popular",
    demoUrl: "https://fantasy-sparkle-invite.lovable.app",
    imageUrl: cumpleEmmaImg,
  },
  // Empresariales
  {
    id: "nexora",
    name: "Nexora Summit",
    category: "empresariales",
    tag: "Nuevo",
    demoUrl: "https://digital-dream-wave.lovable.app/",
    imageUrl: nexoraImg,
  },
  // Regalos
  {
    id: "cartaRomance",
    name: "Carta de Romance",
    category: "regalos",
    tag: "Nuevo",
    demoUrl: "https://heartfelt-memories-studio.lovable.app",
    imageUrl: romanceImg,
  },
  {
    id: "sanValentin",
    name: "San Valentin",
    category: "regalos",
    tag: "Nuevo",
    demoUrl: "https://love-story-scroll-76.lovable.app",
    imageUrl: sanValentinImg,
  },
  {
    id: "primerAniversario",
    name: "Primer aniversario",
    category: "regalos",
    tag: "Nuevo",
    demoUrl: "https://dreamy-year-one-glow.lovable.app",
    imageUrl: aniversarioImg,
  },
  {
    id: "aniversario",
    name: "Aniversario cristiano",
    category: "regalos",
    tag: "Nuevo",
    demoUrl: "https://faith-filled-embrace.lovable.app",
    imageUrl: cristianoImg,
  },
];
