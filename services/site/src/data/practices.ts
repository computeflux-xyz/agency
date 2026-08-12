import type { Locale } from "@i18n";

export type PracticeTool = {
  name: string;
  si: string;
  reason: string;
};

export type Practice = {
  index: string;
  title: string;
  body: string;
  path: string;
  accent: string;
  tools: PracticeTool[];
};

const fr: Practice[] = [
  {
    index: "01",
    title: "Ingénierie & architecture de données",
    body: "Nous concevons des systèmes scalables et fiables : ingestion, contrats, modélisation et entrepôt. Une base sur laquelle l'analyse et l'entraînement s'appuient, avec les contrôles de qualité qui rendent les chiffres dignes de confiance.",
    path: "/expertise/data-engineering",
    accent: "data",
    tools: [
      { name: "Python", si: "Python", reason: "Le langage de la couche data : scripts d'ingestion, contrats, notebooks." },
      { name: "Airflow", si: "Apacheairflow", reason: "Orchestre les pipelines qui alimentent l'entrepôt." },
      { name: "ClickHouse", si: "Clickhouse", reason: "Le stockage columnaire où les lectures analytiques s'exécutent." },
      { name: "DuckDB", si: "Duckdb", reason: "Un moteur analytique embarqué pour prototyper vite vos modèles." },
      { name: "Trino", si: "Trino", reason: "SQL distribué sur tous les lacs, sans déplacer les données." },
      { name: "Kafka", si: "Apachekafka", reason: "L'épine dorsale événementielle entre producteurs et entrepôt." },
      { name: "Spark", si: "Apachespark", reason: "Le traitement distribué des gros lots en batch." },
      { name: "Flink", si: "Apacheflink", reason: "Le traitement stateful et temps réel de vos flux." },
      { name: "Rust", si: "Rust", reason: "Des workers typés et rapides pour les octets qui franchissent la frontière." },
      { name: "OCaml", si: "Ocaml", reason: "Les règles métier encodées en types : des contrats qui ne dérivent pas." },
    ],
  },
  {
    index: "02",
    title: "Ingénierie IA",
    body: "Nous ne sortons pas le grand modèle pour tout. La plupart des besoins méritent une machine dédiée : recommandations, bandits multi-bras, classifieurs, bien servis et peu coûteux. Une chose, et bien faite.",
    path: "/expertise/ai-engineering",
    accent: "ai",
    tools: [
      { name: "PyTorch", si: "Pytorch", reason: "Le cadre où l'on entraîne des modèles dédiés, de moyenne ou grande échelle." },
      { name: "Hugging Face", si: "Huggingface", reason: "Poids préentraînés et hub central pour la chirurgie de modèles." },
      { name: "LangChain", si: "Langchain", reason: "La colle qui assemble retrieval et appels de modèles." },
      { name: "MLflow", si: "Mlflow", reason: "Suivi d'expériences et registre de modèles sur toutes les runs." },
      { name: "ONNX", si: "Onnx", reason: "Format de graphe portable qui déplace les modèles entre cadres." },
    ],
  },
  {
    index: "03",
    title: "Systèmes agentiques",
    body: "Boucles bornées, appels d'outils vérifiables, replis explicites et évaluation de parcours. Des agents à qui on peut confier un vrai processus métier, et qui survivent à la production.",
    path: "/expertise/agentic-systems",
    accent: "agents",
    tools: [
      { name: "LangChain", si: "Langchain", reason: "Orchestration des boucles agent, des outils et des replis." },
      { name: "Ollama", si: "Ollama", reason: "Exécution locale des modèles légers qui équipent les agents." },
      { name: "Hugging Face", si: "Huggingface", reason: "Modèles et datasets de base pour les trajectoires agentiques." },
      { name: "Docker", si: "Docker", reason: "Isole chaque agent et ses outils dans un conteneur." },
    ],
  },
  {
    index: "04",
    title: "Bare metal & calcul",
    body: "Serveurs dédiés, GPU, stockage et réseau, bien exploités. Quand la charge est lourde et régulière, le matériel bat le cloud, et pour la souveraineté, vos données restent sous votre contrôle, pas sous celui d'un opérateur américain.",
    path: "/expertise/bare-metal",
    accent: "metal",
    tools: [
      { name: "NVIDIA", si: "Nvidia", reason: "Pilotes GPU, CUDA et NVLink réglés à la couche matérielle." },
      { name: "Linux", si: "Linux", reason: "Le noyau, l'ordonnanceur et la politique NUMA décident qui a les cœurs." },
      { name: "Kubernetes", si: "Kubernetes", reason: "Ordonnance les pods sur le matériel que l'on possède." },
      { name: "Argo", si: "Argo", reason: "Pilote les pipelines et les jobs batch sur le cluster." },
      { name: "OpenTofu", si: "Opentofu", reason: "Décrit les serveurs physiques et le réseau comme du code." },
      { name: "Go", si: "Go", reason: "Le langage de l'outillage infra : CLI, contrôle-planes, serveurs légers." },
    ],
  },
  {
    index: "05",
    title: "Inférence & performance",
    body: "Quantification, batching continu, cache, décodage spéculatif, sur vLLM, llama.cpp, SGLang ou TensorRT, ou un serveur d'inférence sur mesure quand le chemin critique l'exige. Servi là où vous décidez, y compris en auto-hébergement, pour la souveraineté. Mesuré avant et après.",
    path: "/expertise/inference-optimization",
    accent: "inference",
    tools: [
      { name: "vLLM", si: "Vllm", reason: "Le moteur haute performance : batching continu, paged attention." },
      { name: "Ollama", si: "Ollama", reason: "Un serveur d'inférence local en Go, pratique pour les modèles légers." },
      { name: "NVIDIA", si: "Nvidia", reason: "Les GPU et TensorRT qui accélèrent le chemin d'inférence." },
      { name: "ONNX", si: "Onnx", reason: "Un graphe optimisé et quantifiable, exécutable sur de nombreux runtime." },
      { name: "TensorFlow", si: "Tensorflow", reason: "TF-Serving et TF-TRT pour des déploiements éprouvés." },
      { name: "C/C++", si: "Cplusplus", reason: "Là où vivent tokenizers et kernels : vLLM, llama.cpp, TensorRT." },
    ],
  },
];

const en: Practice[] = [
  {
    index: "01",
    title: "Data engineering & architecture",
    body: "We design scalable, reliable systems: ingestion, contracts, modelling and warehousing. A base analytics and training can both stand on, with the quality checks that keep numbers trustworthy.",
    path: "/expertise/data-engineering",
    accent: "data",
    tools: [
      { name: "Python", si: "Python", reason: "The language of the data layer: ingestion scripts, contracts, notebooks." },
      { name: "Airflow", si: "Apacheairflow", reason: "Orchestrates the pipelines that feed the warehouse." },
      { name: "ClickHouse", si: "Clickhouse", reason: "The columnar storage where analytics actually gets queried." },
      { name: "DuckDB", si: "Duckdb", reason: "An embedded analytics engine to prototype models fast." },
      { name: "Trino", si: "Trino", reason: "Distributed SQL across every lake without moving data." },
      { name: "Kafka", si: "Apachekafka", reason: "The event backbone between producers and the warehouse." },
      { name: "Spark", si: "Apachespark", reason: "Distributed processing for the heavy batch loads." },
      { name: "Flink", si: "Apacheflink", reason: "Stateful, real-time processing of your streams." },
      { name: "Rust", si: "Rust", reason: "Type-safe, fast workers for the bytes crossing the boundary." },
      { name: "OCaml", si: "Ocaml", reason: "Business rules encoded as types: contracts that can't drift." },
    ],
  },
  {
    index: "02",
    title: "AI engineering",
    body: "We don't reach for a large model for everything. Most needs deserve a dedicated machine: recommenders, multi-armed bandits, classifiers, well served and cheap. One thing, done well.",
    path: "/expertise/ai-engineering",
    accent: "ai",
    tools: [
      { name: "PyTorch", si: "Pytorch", reason: "The framework where we train dedicated, mid-to-large scale models." },
      { name: "Hugging Face", si: "Huggingface", reason: "Pretrained weights and the central hub for model surgery." },
      { name: "LangChain", si: "Langchain", reason: "The glue assembling retrieval and model calls." },
      { name: "MLflow", si: "Mlflow", reason: "Experiment tracking and the model registry across every run." },
      { name: "ONNX", si: "Onnx", reason: "A portable graph format that moves models between frameworks." },
    ],
  },
  {
    index: "03",
    title: "Agentic systems",
    body: "Bounded loops, verifiable tool calls, explicit fallbacks and trajectory-level evaluation. Agents you can hand a real business process to, and that survive production.",
    path: "/expertise/agentic-systems",
    accent: "agents",
    tools: [
      { name: "LangChain", si: "Langchain", reason: "Orchestrates the agent loops, tools and fallbacks." },
      { name: "Ollama", si: "Ollama", reason: "Runs the small models powering agents locally." },
      { name: "Hugging Face", si: "Huggingface", reason: "Base models and datasets for agent trajectories." },
      { name: "Docker", si: "Docker", reason: "Isolates each agent and its tools in a container." },
    ],
  },
  {
    index: "04",
    title: "Bare metal & compute",
    body: "Dedicated servers, GPUs, storage and network, well run. When the load is heavy and steady, hardware beats the cloud, and for sovereignty, your data stays under your control, not a US operator's.",
    path: "/expertise/bare-metal",
    accent: "metal",
    tools: [
      { name: "NVIDIA", si: "Nvidia", reason: "GPU drivers, CUDA and NVLink tuned at the hardware layer." },
      { name: "Linux", si: "Linux", reason: "The kernel, scheduler and NUMA policy decide who gets the cores." },
      { name: "Kubernetes", si: "Kubernetes", reason: "Schedules pods onto the hardware we own." },
      { name: "Argo", si: "Argo", reason: "Runs pipelines and batch jobs across the cluster." },
      { name: "OpenTofu", si: "Opentofu", reason: "Describes the physical servers and network as code." },
      { name: "Go", si: "Go", reason: "The language of our infra tooling: CLIs, control planes, lean servers." },
    ],
  },
  {
    index: "05",
    title: "Inference & performance",
    body: "Quantization, continuous batching, caching, speculative decoding, on vLLM, llama.cpp, SGLang or TensorRT, or a custom inference server when the path is critical. Served where you decide, including self-hosted, for sovereignty. Measured before and after.",
    path: "/expertise/inference-optimization",
    accent: "inference",
    tools: [
      { name: "vLLM", si: "Vllm", reason: "The high-performance engine: continuous batching, paged attention." },
      { name: "Ollama", si: "Ollama", reason: "A local Go inference server, handy for lightweight models." },
      { name: "NVIDIA", si: "Nvidia", reason: "The GPUs and TensorRT that accelerate the inference path." },
      { name: "ONNX", si: "Onnx", reason: "An optimised, quantisable graph that runs on many runtimes." },
      { name: "TensorFlow", si: "Tensorflow", reason: "TF-Serving and TF-TRT for battle-tested deployments." },
      { name: "C/C++", si: "Cplusplus", reason: "Where tokenisers and kernels live: vLLM, llama.cpp, TensorRT." },
    ],
  },
];

export function getPractices(locale: Locale): Practice[] {
  return locale === "fr" ? fr : en;
}
