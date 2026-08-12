import type { Locale } from "@i18n";

export type Source = {
  n: number;
  publisher: string;
  title: string;
  year?: string;
  url: string;
};

const sourcesFr: Source[] = [
  {
    n: 1,
    publisher: "Congrès des États-Unis",
    title: "CLOUD Act (H.R. 4943)",
    year: "2018",
    url: "https://www.congress.gov/bill/115th-congress/house-bill/4943",
  },
  {
    n: 2,
    publisher: "CJUE",
    title: "Arrêt Schrems II, affaire C-311/18",
    year: "2020",
    url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A62018CJ0311",
  },
  {
    n: 3,
    publisher: "ANSSI",
    title: "Qualification SecNumCloud",
    url: "https://cyber.gouv.fr/secnumcloud",
  },
  {
    n: 4,
    publisher: "Commission européenne",
    title: "Data Act, règlement (UE) 2023/2854",
    year: "2023",
    url: "https://digital-strategy.ec.europa.eu/en/policies/data-act",
  },
];

const sourcesEn: Source[] = [
  {
    n: 1,
    publisher: "US Congress",
    title: "CLOUD Act (H.R. 4943)",
    year: "2018",
    url: "https://www.congress.gov/bill/115th-congress/house-bill/4943",
  },
  {
    n: 2,
    publisher: "CJEU",
    title: "Schrems II judgment, case C-311/18",
    year: "2020",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A62018CJ0311",
  },
  {
    n: 3,
    publisher: "ANSSI",
    title: "SecNumCloud qualification",
    url: "https://cyber.gouv.fr/secnumcloud",
  },
  {
    n: 4,
    publisher: "European Commission",
    title: "Data Act, Regulation (EU) 2023/2854",
    year: "2023",
    url: "https://digital-strategy.ec.europa.eu/en/policies/data-act",
  },
];

const byLocale: Record<Locale, Source[]> = {
  fr: sourcesFr,
  en: sourcesEn,
};

export function getSources(locale: Locale): Source[] {
  return byLocale[locale] ?? sourcesFr;
}
