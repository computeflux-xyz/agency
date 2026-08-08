/**
 * Deep copy for the /expertise/bare-metal page.
 *
 * Same shape and same organism as the data-engineering and AI-engineering pages
 * (see `practiceContent.ts` and `PracticeDetail.astro`) — only the argument
 * changes. French-first, English mirror.
 *
 * The argument: we sell neither the cloud nor the rack, we sell the measurement
 * that decides between them and the operations that make the winner pay off. So
 * the five stages are not "buy → rack → run" (which would presuppose the answer)
 * but the path a workload takes: the load it really puts on a machine, the
 * sizing that follows from it, the acceptance run, the fleet, and the occupancy
 * that says whether the bet held.
 *
 * No invented measurements anywhere: the sketch draws topology, not data.
 */

import type { Locale } from "@i18n";
import type { PracticeContent, PracticeFlow } from "@data/practiceContent";

/* Stage ids are shared across locales; only the mono labels differ. The stencils
   in `PipelineSketch` are position-based, so the order carries meaning:
   the load that comes in → the measurement everything passes through → the gate
   → where it lands → what people read afterwards. */
const flowFr: PracticeFlow = {
  nodes: [
    { id: "wkl", label: "Charges", tone: "default" },
    { id: "msr", label: "Mesure", tone: "fix" },
    { id: "acc", label: "Recette", tone: "fix" },
    { id: "flt", label: "Parc", tone: "default" },
    { id: "obs", label: "Suivi", tone: "default" },
  ],
  edges: [
    { from: "wkl", to: "msr", label: "profil" },
    { from: "msr", to: "acc", label: "dimensionnement" },
    { from: "acc", to: "flt", label: "mise en service" },
    { from: "flt", to: "obs", label: "occupation" },
  ],
};

const flowEn: PracticeFlow = {
  nodes: [
    { id: "wkl", label: "Workloads", tone: "default" },
    { id: "msr", label: "Measure", tone: "fix" },
    { id: "acc", label: "Burn-in", tone: "fix" },
    { id: "flt", label: "Fleet", tone: "default" },
    { id: "obs", label: "Monitoring", tone: "default" },
  ],
  edges: [
    { from: "wkl", to: "msr", label: "profile" },
    { from: "msr", to: "acc", label: "sizing" },
    { from: "acc", to: "flt", label: "commissioning" },
    { from: "flt", to: "obs", label: "occupancy" },
  ],
};

const bmFr: PracticeContent = {
  /* Le hero descend dans la machine : une lame qu'on insère, un maillage réseau,
     une carte qu'on inspecte à la main, puis les consoles qui la mettent au
     travail. C'est l'argument de la page — le matériel n'est pas une facture,
     c'est quelque chose qu'on exploite. Le titre dit l'exploitation, pas l'achat. */
  heroTitle: "Du matériel qu'on exploite vraiment.",
  heroLead:
    "Serveurs, GPU, réseau, stockage : on mesure ce que vous consommez, on dimensionne, puis on tient la machine.",
  overviewEyebrow: "Vue d'ensemble",
  /* La section qui suit le hero doit désamorcer le réflexe « on a acheté des
     GPU, donc on a réglé le problème ». */
  overviewTitle: "Acheter du matériel ne suffit pas.",
  overviewBullets: [
    "La mesure d'abord : profil de charge réel — CPU, mémoire, entrées-sorties, GPU — avant tout arbitrage entre cloud, hébergement dédié et machines en propre.",
    "Exploitation système : placement NUMA, réglage réseau et stockage, ordonnancement des tâches. C'est là que se creuse l'écart entre matériel acheté et matériel utilisé.",
    "GPU partagés proprement : files d'attente, quotas et suivi d'occupation, pour que les cartes travaillent au lieu d'attendre.",
    "Continuité : sauvegardes, bascule et supervision, pour qu'une panne matérielle reste un incident et non un arrêt.",
  ],
  overviewCta: "Dimensionnons votre infrastructure",
  pipelineEyebrow: "Comment on construit",
  pipelineTitle: "Du profil de charge à la machine qui tourne.",
  pipelineLead:
    "On part de ce que vous consommez réellement, pas de ce qui a été provisionné. La mesure décide du dimensionnement, la recette décide de la mise en service, et le suivi d'occupation dit si le pari tient.",
  flowAlt:
    "Diagramme : les charges sont profilées, la mesure décide du dimensionnement, la recette valide le matériel, le parc entre en service, et le suivi rend l'occupation visible.",
  flowCaption: "Rien n'est commandé avant d'avoir été mesuré.",
  flowLegendFix: "Notre intervention",
  flowLegendDefault: "Le chemin",
  darkTitle: "Le cloud n'est pas un camp.",
  darkLead:
    "Nous exploitons les deux modèles, donc nous n'avons aucun intérêt à vous pousser vers l'un. Sur une charge irrégulière, le cloud gagne. Sur une charge lourde et régulière, la facture à l'usage finit par dépasser le prix du matériel — et c'est un calcul, pas une opinion.",
  pipelineTools: [
    { name: "Linux", si: "Linux" },
    { name: "Kubernetes", si: "Kubernetes" },
    { name: "NVIDIA", si: "Nvidia" },
    { name: "OpenTofu", si: "Opentofu" },
    { name: "Prometheus", si: "Prometheus" },
    { name: "Grafana", si: "Grafana" },
  ],
  stackLabel: "Ce sur quoi nous construisons",
  stackLead:
    "Des couches ouvertes, du noyau au planificateur : le fournisseur de la machine peut changer sans que l'exploitation soit à réécrire.",
  buildStack: [
    "Linux",
    "systemd / cgroups v2",
    "KVM / Proxmox",
    "Kubernetes",
    "Slurm",
    "NVIDIA GPU Operator",
    "CUDA",
    "RDMA / InfiniBand",
    "Ceph",
    "ZFS",
    "MinIO",
    "OpenTofu",
    "Ansible",
    "Prometheus",
    "Grafana",
  ],
  teamEyebrow: "L'équipe",
  teamTitle: "Des gens qui ouvrent les machines.",
  teamLead:
    "Une petite équipe senior, entièrement à distance, qui lit un profil de charge avant de commander une carte.",
};

const bmEn: PracticeContent = {
  heroTitle: "Hardware that is actually run.",
  heroLead:
    "Servers, GPUs, network, storage: we measure what you consume, size it, then keep the machine running.",
  overviewEyebrow: "Overview",
  overviewTitle: "Buying hardware is not the hard part.",
  overviewBullets: [
    "Measurement first: a real load profile — CPU, memory, I/O, GPU — before any call between cloud, dedicated hosting and hardware you own.",
    "Systems operation: NUMA placement, network and storage tuning, job scheduling. This is where the gap between hardware bought and hardware used opens up.",
    "GPUs shared properly: queues, quotas and occupancy tracking, so the cards work instead of waiting.",
    "Continuity: backups, failover and monitoring, so a hardware failure stays an incident rather than an outage.",
  ],
  overviewCta: "Size your infrastructure",
  pipelineEyebrow: "How we build",
  pipelineTitle: "From load profile to a machine that runs.",
  pipelineLead:
    "We start from what you actually consume, not from what was provisioned. Measurement decides the sizing, burn-in decides the commissioning, and occupancy says whether the bet holds.",
  flowAlt:
    "Diagram: workloads are profiled, measurement drives the sizing, burn-in validates the hardware, the fleet is commissioned, and monitoring makes occupancy visible.",
  flowCaption: "Nothing is ordered before it has been measured.",
  flowLegendFix: "Our intervention",
  flowLegendDefault: "The path",
  darkTitle: "The cloud is not a side to pick.",
  darkLead:
    "We operate both models, so we have no stake in pushing you towards either. On spiky load, the cloud wins. On heavy, steady load, the metered bill eventually passes the price of the hardware — and that is arithmetic, not an opinion.",
  pipelineTools: [
    { name: "Linux", si: "Linux" },
    { name: "Kubernetes", si: "Kubernetes" },
    { name: "NVIDIA", si: "Nvidia" },
    { name: "OpenTofu", si: "Opentofu" },
    { name: "Prometheus", si: "Prometheus" },
    { name: "Grafana", si: "Grafana" },
  ],
  stackLabel: "What we build on",
  stackLead:
    "Open layers from the kernel up to the scheduler: the vendor of the machine can change without the operations being rewritten.",
  buildStack: [
    "Linux",
    "systemd / cgroups v2",
    "KVM / Proxmox",
    "Kubernetes",
    "Slurm",
    "NVIDIA GPU Operator",
    "CUDA",
    "RDMA / InfiniBand",
    "Ceph",
    "ZFS",
    "MinIO",
    "OpenTofu",
    "Ansible",
    "Prometheus",
    "Grafana",
  ],
  teamEyebrow: "The team",
  teamTitle: "People who open the machines.",
  teamLead:
    "A small, senior team, fully remote, that reads a load profile before ordering a card.",
};

const contentByLocale: Record<Locale, PracticeContent> = {
  fr: bmFr,
  en: bmEn,
};

const flowByLocale: Record<Locale, PracticeFlow> = {
  fr: flowFr,
  en: flowEn,
};

export function getBareMetal(locale: Locale): {
  content: PracticeContent;
  flow: PracticeFlow;
} {
  return {
    content: contentByLocale[locale] ?? bmFr,
    flow: flowByLocale[locale] ?? flowFr,
  };
}
