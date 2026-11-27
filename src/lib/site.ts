export const SITE = {
  name: "Bellas Cejas",
  legalName: "Bellas Cejas Academy LLC",
  tagline:
    "Especialistas en realce facial y micropigmentación en Miami y Santiago.",
  bookingUrl: "/reservar",
  whatsappUrl: "http://wa.link/661qhl",
  whatsappApi: "https://api.whatsapp.com/send?phone=17868205602",
  email: "Andreapalenciam@icloud.com",
  phoneDisplay: "+1 786-820-5602",
  instagram: "https://www.instagram.com/bellascejascl/?hl=es-la",
  facebookYulexi: "https://www.facebook.com/estilistayulexi/",
  facebookBrand: "https://www.facebook.com/bellascejascl",
  tiktok: "https://www.tiktok.com/@bellascejascl",
  miami: {
    address: "11402 NW 41 St, Doral FL 33178",
    suites: "Areas Salones Suite 218 – Suite 107",
    mapsUrl: "https://maps.app.goo.gl/nVspGdSiTeXvtgpz9",
    hours: [
      "Martes – Sábado: 10:00am a 06:00pm",
      "Domingo – Lunes: Cerrado",
    ],
  },
  santiago: {
    address: "Quinta Normal, San Pablo 4025",
    hours: ["Martes - Sabado 10:00 a 18:00 hrs"],
    phoneDisplay: "+56 9 4919 3023",
    whatsappUrl: "http://wa.link/88hk1s",
  },
} as const;

export type NavChild = { label: string; href: string };
export type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
};

export const NAV: NavItem[] = [
  {
    label: "Servicios Miami",
    href: "/servicios/miami",
    children: [
      { label: "Cejas", href: "/servicios/miami/cejas" },
      { label: "Depilación", href: "/servicios/miami/depilacion" },
      {
        label: "Electrocauterización",
        href: "/servicios/miami/electrocauterizacion",
      },
      { label: "Faciales", href: "/servicios/miami/faciales" },
      {
        label: "Microblading / Micropigmentación",
        href: "/servicios/miami/microblading-micropigmentacion",
      },
      {
        label: "Retoques & Mantenimientos",
        href: "/servicios/miami/retoques-mantenimientos",
      },
      { label: "Pestañas", href: "/servicios/miami/pestanas" },
    ],
  },
  { label: "Productos", href: "/productos" },
  {
    label: "Cursos",
    children: [
      { label: "Curso de Microblading", href: "/cursos/microblading" },
      {
        label: "Curso de Eyelash Extensions",
        href: "/cursos/eyelash-extensions",
      },
      {
        label: "Diseño de cejas + Brow lamination",
        href: "/cursos/diseno-cejas-brow-lamination",
      },
    ],
  },
  { label: "Gift Card", href: "/gift-card" },
  {
    label: "Clientes",
    children: [
      {
        label: "Comentarios Instagram",
        href: "/clientes/comentarios-instagram",
      },
      { label: "Resultados", href: "/clientes/resultados" },
      { label: "Reseñas Google", href: "/clientes/resenas-google" },
    ],
  },
  { label: "FAQ", href: "/faq" },
  { label: "Contacto", href: "/contacto" },
  { label: "Santiago, Chile", href: "/servicios/santiago" },
];

export const MIAMI_SERVICE_SLUGS = [
  "cejas",
  "depilacion",
  "electrocauterizacion",
  "faciales",
  "microblading-micropigmentacion",
  "retoques-mantenimientos",
  "pestanas",
] as const;

export const CURSO_SLUGS = [
  "microblading",
  "eyelash-extensions",
  "diseno-cejas-brow-lamination",
] as const;
