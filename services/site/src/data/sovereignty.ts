/**
 * Sources and open-source stack backing the sovereignty section on the home page.
 *
 * Rules for this file:
 *  - Every source must be a primary one (regulator, court, agency, IEA), never a
 *    vendor blog or a press summary. If a claim in `sov.c*.body` cannot be traced
 *    to an entry here, drop the claim, not the citation.
 *  - `n` is the footnote number rendered on the page and referenced by
 *    `REFS` in `organisms/SovereigntySection.astro`. Numbers are stable: append,
 *    never renumber, or the superscripts drift out of sync with the copy.
 *  - Figures quoted in the copy: IEA "Energy and AI" (2025) gives ~415 TWh of
 *    data-centre electricity in 2024 (~1.5% of world consumption) and ~945 TWh
 *    projected for 2030; IEA "Electricity 2024" is the >1000 TWh-by-2026 figure
 *    for data centres, AI and crypto combined. Two different scopes — keep them
 *    in separate sentences.
 *
 * `TOOLS` is deliberately locale-independent: these are product names, and they
 * are listed because none of them is a single vendor's proprietary API.
 */

import type { Locale } from "@i18n";

export type Source = {
  /** Footnote number as rendered. Stable across edits. */
  n: number;
  /** Publisher, e.g. "AIE" / "IEA". */
  publisher: string;
  /** Document title, as published. */
  title: string;
  /** Publication year, omitted for continuously updated resources. */
  year?: string;
  url: string;
};

const sourcesFr: Source[] = [
  {
    n: 1,
    publisher: "AIE",
    title: "Energy and AI",
    year: "2025",
    url: "https://www.iea.org/reports/energy-and-ai",
  },
  {
    n: 2,
    publisher: "AIE",
    title: "Electricity 2024",
    year: "2024",
    url: "https://www.iea.org/reports/electricity-2024",
  },
  {
    n: 3,
    publisher: "Commission européenne",
    title: "Data Act — règlement (UE) 2023/2854",
    year: "2023",
    url: "https://digital-strategy.ec.europa.eu/en/policies/data-act",
  },
  {
    n: 4,
    publisher: "Congrès des États-Unis",
    title: "CLOUD Act (H.R. 4943)",
    year: "2018",
    url: "https://www.congress.gov/bill/115th-congress/house-bill/4943",
  },
  {
    n: 5,
    publisher: "CJUE",
    title: "Arrêt Schrems II, affaire C-311/18",
    year: "2020",
    url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A62018CJ0311",
  },
  {
    n: 6,
    publisher: "ANSSI",
    title: "Qualification SecNumCloud",
    url: "https://cyber.gouv.fr/secnumcloud",
  },
  {
    n: 7,
    publisher: "RTE",
    title: "éCO2mix — production et émissions en temps réel",
    url: "https://www.rte-france.com/eco2mix",
  },
];

const sourcesEn: Source[] = [
  {
    n: 1,
    publisher: "IEA",
    title: "Energy and AI",
    year: "2025",
    url: "https://www.iea.org/reports/energy-and-ai",
  },
  {
    n: 2,
    publisher: "IEA",
    title: "Electricity 2024",
    year: "2024",
    url: "https://www.iea.org/reports/electricity-2024",
  },
  {
    n: 3,
    publisher: "European Commission",
    title: "Data Act — Regulation (EU) 2023/2854",
    year: "2023",
    url: "https://digital-strategy.ec.europa.eu/en/policies/data-act",
  },
  {
    n: 4,
    publisher: "US Congress",
    title: "CLOUD Act (H.R. 4943)",
    year: "2018",
    url: "https://www.congress.gov/bill/115th-congress/house-bill/4943",
  },
  {
    n: 5,
    publisher: "CJEU",
    title: "Schrems II judgment, case C-311/18",
    year: "2020",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A62018CJ0311",
  },
  {
    n: 6,
    publisher: "ANSSI",
    title: "SecNumCloud qualification",
    url: "https://cyber.gouv.fr/secnumcloud",
  },
  {
    n: 7,
    publisher: "RTE",
    title: "éCO2mix — real-time generation and emissions",
    url: "https://www.rte-france.com/eco2mix",
  },
];

const byLocale: Record<Locale, Source[]> = {
  fr: sourcesFr,
  en: sourcesEn,
};

/** Footnotes for a locale (falls back to French, the reference locale). */
export function getSources(locale: Locale): Source[] {
  return byLocale[locale] ?? sourcesFr;
}

/**
 * The portable half of the stack we build on: open formats, replaceable engines,
 * self-hostable runtimes. Nothing here is reachable through exactly one vendor.
 */
export const TOOLS: string[] = [
  "PostgreSQL",
  "ClickHouse",
  "DuckDB",
  "Apache Iceberg",
  "Parquet",
  "Trino",
  "Kafka / Redpanda",
  "Dagster",
  "dbt / SQLMesh",
  "MinIO / Ceph",
  "Kubernetes / Talos",
  "OpenTofu",
  "vLLM",
  "llama.cpp",
  "Mistral / Qwen",
];
