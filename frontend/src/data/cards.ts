export type CardCategory = {
  slug: string;
  name: string;
  description: string;
};

export type CardTag = "Popular" | "Nuevo" | "Elegante" | "Premium" | "Minimal";

export type CardDesign = {
  id: string;
  name: string;
  category: string; // slug
  tag?: CardTag;
  discountLabel?: string;
  demoUrl?: string;
  imageUrl?: string;
};
