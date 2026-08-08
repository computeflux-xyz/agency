/**
 * Deep copy for the /expertise/data-engineering page.
 *
 * Long-form copy, French-first with an English mirror, exactly like
 * `expertise.ts` / `systems.ts` / `diagnostics.ts`. The SHAPE lives in
 * `practiceContent.ts` and is shared with the other full practice pages, which
 * all render through `PracticeDetail.astro`; `media.ts` owns the photographs.
 *
 * No invented measurements anywhere: the sketch draws topology, not data.
 */

import type { Locale } from "@i18n";
import type { PracticeContent, PracticeFlow } from "@data/practiceContent";

/* Shared topology: sources → contract → tests → warehouse → usage. Node ids are
   the same in both locales; only the mono labels differ. */
const flowFr: PracticeFlow = {
  nodes: [
    { id: "src", label: "Sources", tone: "default" },
    { id: "ctr", label: "Contrat", tone: "fix" },
    { id: "tst", label: "Tests", tone: "fix" },
    { id: "war", label: "Entrepôt", tone: "default" },
    { id: "use", label: "Dashboards", tone: "default" },
  ],
  edges: [
    { from: "src", to: "ctr", label: "schéma" },
    { from: "ctr", to: "tst", label: "qualité" },
    { from: "tst", to: "war", label: "transformations" },
    { from: "war", to: "use", label: "analyses" },
  ],
};

const flowEn: PracticeFlow = {
  nodes: [
    { id: "src", label: "Sources", tone: "default" },
    { id: "ctr", label: "Contract", tone: "fix" },
    { id: "tst", label: "Tests", tone: "fix" },
    { id: "war", label: "Warehouse", tone: "default" },
    { id: "use", label: "Dashboards", tone: "default" },
  ],
  edges: [
    { from: "src", to: "ctr", label: "schema" },
    { from: "ctr", to: "tst", label: "quality" },
    { from: "tst", to: "war", label: "transforms" },
    { from: "war", to: "use", label: "queries" },
  ],
};

const deFr: PracticeContent = {
  heroTitle: "Des données qui tiennent la distance.",
  heroLead:
    "Vos données au rythme de votre activité : flux continus, latence maîtrisée, une architecture qui ne vous ralentit pas.",
  overviewEyebrow: "Vue d'ensemble",
  overviewTitle: "Des données que vos équipes et vos modèles peuvent croire.",
  overviewBullets: [
    "Ingestion fiable : des sources disparates convergent vers un contrat unique, rejouables sans perte.",
    "Qualité mesurée : contrôles à chaque étape, alertes de dérive, fraîcheur garantie.",
    "Modélisation pour l'usage : des schémas pensés pour l'analyse, le reporting et l'entraînement.",
  ],
  overviewCta: "Bâtissons votre pipeline data",
  pipelineEyebrow: "Comment on construit",
  pipelineTitle: "Le chemin normal d'une donnée.",
  pipelineLead:
    "Chaque source emprunte le même chemin : un contrat, des tests, des transformations, un stockage, puis des usages. La qualité se joue à chaque étape, pas seulement à la sortie.",
  flowAlt:
    "Diagramme : les sources convergent vers un contrat de données, passent des tests de qualité, sont transformées, stockées dans l'entrepôt, puis consommées par les dashboards.",
  flowCaption: "Chaque étape est vérifiée avant que la suivante commence.",
  flowLegendFix: "Notre intervention",
  flowLegendDefault: "Le chemin",
  darkTitle: "Des types qui ne dérivent pas.",
  darkLead:
    "Un contrat de données est un type, pas un document : vérifié à l'entrée, versionné, avec un historique rejouable. La stack qui le porte reste la vôtre.",
  pipelineTools: [
    { name: "Airflow", si: "Apacheairflow" },
    { name: "Kafka", si: "Apachekafka" },
    { name: "DuckDB", si: "Duckdb" },
    { name: "Trino", si: "Trino" },
    { name: "Polars", si: "Polars" },
    { name: "Spark", si: "Apachespark" },
  ],
  stackLabel: "Ce sur quoi nous construisons",
  stackLead:
    "Des outils éprouvés et remplaçables, qui ne vous enferment pas chez un fournisseur. La stack au-dessus du contrat reste la vôtre.",
  buildStack: [
    "PostgreSQL",
    "ClickHouse",
    "DuckDB",
    "Trino",
    "Kafka / Redpanda",
    "Apache Iceberg",
    "Parquet",
    "Airflow",
    "Dagster",
    "dbt / SQLMesh",
    "Polars",
    "Spark",
    "Flink",
    "MinIO / Ceph",
    "Kubernetes",
    "OpenTofu",
    "Great Expectations",
    "OpenLineage",
  ],
  teamEyebrow: "L'équipe",
  teamTitle: "Des humains derrière les pipelines.",
  teamLead:
    "Une petite équipe senior, entièrement à distance. Les photos remplacent le jargon : voilà ce que ça donne en vrai.",
};

const deEn: PracticeContent = {
  heroTitle: "Data that goes the distance.",
  heroLead:
    "Your data at the pace of your business: continuous flows, latency under control, an architecture that never slows you down.",
  overviewEyebrow: "Overview",
  overviewTitle: "Data your teams and your models can actually believe.",
  overviewBullets: [
    "Reliable ingestion: disparate sources converge on a single contract, replayable without loss.",
    "Measured quality: checks at every step, drift alerts, guaranteed freshness.",
    "Modelling for use: schemas built for analytics, reporting and model training.",
  ],
  overviewCta: "Build your data pipeline",
  pipelineEyebrow: "How we build",
  pipelineTitle: "The normal path of a piece of data.",
  pipelineLead:
    "Every source follows the same road: a contract, tests, transformations, storage, then usage. Quality is decided at each step, not only at the end.",
  flowAlt:
    "Diagram: sources converge on a data contract, pass quality tests, are transformed, stored in the warehouse, then consumed by dashboards.",
  flowCaption: "Each step is verified before the next one starts.",
  flowLegendFix: "Our intervention",
  flowLegendDefault: "The path",
  darkTitle: "Types that cannot drift.",
  darkLead:
    "A data contract is a type, not a document: checked at the boundary, versioned, with replayable history. The stack carrying it stays yours.",
  pipelineTools: [
    { name: "Airflow", si: "Apacheairflow" },
    { name: "Kafka", si: "Apachekafka" },
    { name: "DuckDB", si: "Duckdb" },
    { name: "Trino", si: "Trino" },
    { name: "Polars", si: "Polars" },
    { name: "Spark", si: "Apachespark" },
  ],
  stackLabel: "What we build on",
  stackLead:
    "Proven, replaceable tools that don't lock you into one vendor. The stack above the contract stays yours.",
  buildStack: [
    "PostgreSQL",
    "ClickHouse",
    "DuckDB",
    "Trino",
    "Kafka / Redpanda",
    "Apache Iceberg",
    "Parquet",
    "Airflow",
    "Dagster",
    "dbt / SQLMesh",
    "Polars",
    "Spark",
    "Flink",
    "MinIO / Ceph",
    "Kubernetes",
    "OpenTofu",
    "Great Expectations",
    "OpenLineage",
  ],
  teamEyebrow: "The team",
  teamTitle: "Humans behind the pipelines.",
  teamLead:
    "A small, senior team, fully remote. Photos beat jargon: this is what it looks like in practice.",
};

const contentByLocale: Record<Locale, PracticeContent> = {
  fr: deFr,
  en: deEn,
};

const flowByLocale: Record<Locale, PracticeFlow> = {
  fr: flowFr,
  en: flowEn,
};

export function getDataEngineering(locale: Locale): {
  content: PracticeContent;
  flow: PracticeFlow;
} {
  return {
    content: contentByLocale[locale] ?? deFr,
    flow: flowByLocale[locale] ?? flowFr,
  };
}
