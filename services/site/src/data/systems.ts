/**
 * Systems Computeflux built and operates itself.
 *
 * These are NOT client logos. Every entry here is a product we designed, shipped
 * and still maintain, so the landing page frames them as dogfooding ("we don't
 * just advise, we operate") rather than as social proof. Never relabel this list
 * as clients, references or trust badges — that would be a false claim.
 *
 * Copy is French-first; English mirrors it, via getSystems(locale).
 *
 * Each entry carries a solid card `bg` (rendered white/light text on it) and a
 * small `chart` used by the card to visualise what makes the engineering hard —
 * same `atoms/MiniChart` contract as the diagnostic cards.
 */

import type { Locale } from "@i18n";

export type SystemChart = {
  kind: "bars" | "spark" | "split";
  data: number[];
  labels: string[];
};

export type ProductionSystem = {
  slug: string;
  name: string;
  logo: string;
  logoShape: "mark" | "lockup";
  logoAlt: string;
  url: string;
  sourceUrl?: string;
  kind: string;
  /** Short: what the product is, from a user's point of view. */
  what: string;
  /** One paragraph: the hard engineering part. */
  hard: string;
  stack: string[];
  /** Solid card background; light text is rendered on top. */
  bg: string;
  /** True when `bg` is light and the card should render dark text. */
  light?: boolean;
  chart: SystemChart;
};

const bijouChart = {
  kind: "bars" as const,
  data: [46, 92, 100],
  labels: ["Catalogue", "Paiement Mobile Money", "Couche de service"],
};

const systemsFr: ProductionSystem[] = [
  {
    slug: "bijou-gabriel",
    name: "Bijou Gabriel",
    logo: "/logos/bijou-gabriel-lockup-1200.webp",
    logoShape: "lockup",
    logoAlt: "Bijou Gabriel",
    url: "https://bijou-gabriel.com",
    kind: "Commerce · marchés africains",
    what: "Boutique en ligne de spiritueux premium, pensée pour un marché africain exotique où le paiement passe avant tout par le mobile money.",
    hard: "Un processeur de paiement sur mesure cible l'infrastructure Mobile Money, là où les passerelles classiques séchent. La couche de service qui le distribue est puissante : catalogue versionné, images optimisées servies par domaine dédié, et une stack qui tient sous un trafic très inégal.",
    stack: ["Mobile Money", "processeur de paiement sur mesure", "couche de service", "catalogue relationnel"],
    bg: "#14213d",
    chart: bijouChart,
  },  {
    slug: "fertiluna",
    name: "FertiLuna",
    logo: "/logos/fertiluna-lockup-680.webp",
    logoShape: "lockup",
    logoAlt: "FertiLuna",
    url: "https://fertiluna.com",
    sourceUrl: "https://github.com/gabrielmougard/fertiluna",
    kind: "Santé · outil grand public",
    what: "Lecture de courbes de température basale, pour comprendre son cycle sans passer par le jargon médical.",
    hard: "Un modèle de vision lit la capture d'écran d'une courbe et en extrait les points, entièrement dans le navigateur. Aucune donnée de santé ne quitte l'appareil : c'est une contrainte d'architecture, pas une promesse.",
    stack: ["modèle de vision", "100 % client", "zéro donnée serveur", "open source"],
    bg: "#f4d9ec",
    light: true,
    chart: {
      kind: "split",
      data: [100, 22],
      labels: ["Données envoyées au serveur", "Traitement local"],
    },
  },
];

const systemsEn: ProductionSystem[] = [
  {
    slug: "bijou-gabriel",
    name: "Bijou Gabriel",
    logo: "/logos/bijou-gabriel-lockup-1200.webp",
    logoShape: "lockup",
    logoAlt: "Bijou Gabriel",
    url: "https://bijou-gabriel.com",
    kind: "Commerce · African markets",
    what: "An online shop for premium spirits, built for an exotic African market where payment runs on Mobile Money first.",
    hard: "A custom payment processor targets the Mobile Money rails where the usual gateways fall over. The serving layer around it is powerful: a versioned catalogue, optimised images served from a dedicated domain, and a stack that holds under wildly uneven traffic.",
    stack: ["Mobile Money", "custom payment processor", "serving layer", "relational catalogue"],
    bg: "#14213d",
    chart: {
      kind: "bars",
      data: [46, 92, 100],
      labels: ["Catalogue", "Mobile Money", "Serving layer"],
    },
  },
  {
    slug: "fertiluna",
    name: "FertiLuna",
    logo: "/logos/fertiluna-lockup-680.webp",
    logoShape: "lockup",
    logoAlt: "FertiLuna",
    url: "https://fertiluna.com",
    sourceUrl: "https://github.com/gabrielmougard/fertiluna",
    kind: "Health · consumer tool",
    what: "Reading basal body temperature charts, to understand a cycle without going through medical jargon.",
    hard: "A vision model reads a screenshot of a chart and extracts its points, entirely inside the browser. No health data leaves the device: that is an architectural constraint, not a promise.",
    stack: ["vision model", "runs fully client-side", "no server-side data", "open source"],
    bg: "#f4d9ec",
    light: true,
    chart: {
      kind: "split",
      data: [100, 22],
      labels: ["Data to server", "Local processing"],
    },
  },
];

const byLocale: Record<Locale, ProductionSystem[]> = {
  fr: systemsFr,
  en: systemsEn,
};

export function getSystems(locale: Locale): ProductionSystem[] {
  return byLocale[locale] ?? systemsFr;
}
