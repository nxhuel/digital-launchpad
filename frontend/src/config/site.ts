export const SITE = {
  name: "Clik",
  fullName: "Clik Agencia Digital",
  tagline: "Transformá tu idea en un negocio digital",
  description:
    "Agencia digital especializada en soluciones web a medida y tarjetas digitales para eventos.",
  url: "https://clik.com.ar",
  email: "Clikagenciadigital.ba@gmail.com",
  whatsapp: {
    number: "+54 11 3350-1445",
    numberClean: "549113501445",
    link: "https://wa.me/549113501145",
    message: "Hola! Quiero más información sobre sus servicios.",
  },
  social: {
    instagram: "https://www.instagram.com/clik.ba/",
  },
  copyright: `© ${new Date().getFullYear()} Clik Agencia Digital`,
} as const;

export const ROUTES = {
  home: "/",
  tarjetas: "/tarjetas-digitales",
  soluciones: "/soluciones-web",
  nosotros: "/nosotros",
  contacto: "/contacto",
  pagar: "/pagar",
  privacidad: "/privacidad",
  terminos: "/terminos",
} as const;

export function whatsappLink(message?: string): string {
  const text = encodeURIComponent(message ?? SITE.whatsapp.message);
  return `https://wa.me/${SITE.whatsapp.numberClean}?text=${text}`;
}
