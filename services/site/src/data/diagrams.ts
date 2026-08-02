/**
 * Architecture diagrams for the diagnostic cards — draw.io/diagrams.net-style
 * flow graphs rendered as SVG (`atoms/DiagnosticDiagram.astro`) and animated
 * with vivus (stroke drawing) when a case card opens.
 *
 * One diagram per case per half: `cause` shows the shape of what usually goes
 * wrong (last node in the `bad` tone), `action` shows the shape of what we do
 * (last node in the `result` tone). Node labels are short technical loanwords
 * shared by both locales (Cloud, Schema, Batch, LLM, ...), so a single graph
 * serves fr and en.
 *
 * Shapes carry meaning, exactly like a stencil palette:
 *   rect      process / service (Computeflux beveled box)
 *   cylinder  storage — a database, a table, a bucket (vertical drum)
 *   queue     a log / topic / stream buffer (horizontal cylinder)
 *   cloud     the internet, a SaaS, a third party over the network
 *   hex       compute unit (GPU, model server, agent loop)
 *   diamond   a gate / decision / check
 *   doc       a document, a report, a dashboard
 *   para      a transform step (parallelogram)
 *
 * Layout: nodes flow left→right, one per column by default. `col` pins a node
 * to a column (several nodes can share one) and `lane` moves it off the middle
 * row (-1 above, +1 below) to draw a fan-out; edges then route as elbows.
 */

export type DiagramTone = "neutral" | "bad" | "good" | "result";

export type DiagramShape =
  | "rect"
  | "cylinder"
  | "queue"
  | "cloud"
  | "hex"
  | "diamond"
  | "doc"
  | "para";

export type DiagramNode = {
  id: string;
  label: string;
  tone?: DiagramTone;
  shape?: DiagramShape;
  /** Column index; defaults to the node's position in the array. */
  col?: number;
  /** Row offset from the middle lane: -1 above, 0 middle (default), 1 below. */
  lane?: -1 | 0 | 1;
};

export type DiagramEdge = {
  from: string;
  to: string;
  tone?: DiagramTone;
};

export type CaseDiagram = {
  nodes: DiagramNode[];
  /** Defaults to a linear chain through the nodes when omitted. */
  edges?: DiagramEdge[];
};

type Opts = Omit<DiagramNode, "id" | "label" | "tone">;
const bad = (id: string, label: string, o: Opts = {}): DiagramNode => ({ id, label, tone: "bad", ...o });
const good = (id: string, label: string, o: Opts = {}): DiagramNode => ({ id, label, tone: "good", ...o });
const result = (id: string, label: string, o: Opts = {}): DiagramNode => ({ id, label, tone: "result", ...o });
const n = (id: string, label: string, o: Opts = {}): DiagramNode => ({ id, label, ...o });

export const causeDiagrams: Record<string, CaseDiagram> = {
  "data-quality": {
    nodes: [
      n("src", "Sources", { shape: "cloud" }),
      n("schema", "Schema drift", { shape: "para" }),
      n("batch", "Nightly batch"),
      bad("out", "Dashboards", { shape: "doc" }),
    ],
  },
  unstructured: {
    nodes: [
      n("files", "PDF, mails", { shape: "doc" }),
      n("ingest", "Manual ingest"),
      n("dump", "Data dump", { shape: "cylinder" }),
      bad("lost", "Not findable"),
    ],
  },
  governance: {
    nodes: [
      n("raw", "Raw data", { shape: "cylinder", col: 0, lane: 0 }),
      n("a", "Copy A", { shape: "cylinder", col: 1, lane: -1 }),
      n("b", "Copy B", { shape: "cylinder", col: 1, lane: 1 }),
      bad("ans", "Conflict", { shape: "diamond", col: 2, lane: 0 }),
    ],
    edges: [
      { from: "raw", to: "a" },
      { from: "raw", to: "b" },
      { from: "a", to: "ans" },
      { from: "b", to: "ans" },
    ],
  },
  streaming: {
    nodes: [
      n("batch", "Batch job"),
      n("night", "Night run", { shape: "para" }),
      n("stale", "Stale table", { shape: "cylinder" }),
      bad("call", "Bad call", { shape: "diamond" }),
    ],
  },
  rag: {
    nodes: [
      n("docs", "Docs", { shape: "doc" }),
      n("chunk", "Naive split", { shape: "para" }),
      n("llm", "LLM", { shape: "hex" }),
      bad("ans", "Wrong answer"),
    ],
  },
  "agent-observability": {
    nodes: [
      n("agent", "Agent loop", { shape: "hex" }),
      n("tool", "Tool API", { shape: "cloud" }),
      n("logs", "No trace", { shape: "cylinder" }),
      bad("fail", "Fails", { shape: "diamond" }),
    ],
  },
  evaluation: {
    nodes: [
      n("prompt", "Prompt edit", { shape: "doc" }),
      n("llm", "LLM", { shape: "hex" }),
      n("checks", "No test", { shape: "diamond" }),
      bad("out", "Regression"),
    ],
  },
  "compute-cost": {
    nodes: [
      n("reserve", "Reserved GPU", { shape: "hex" }),
      n("idle", "Idle time", { shape: "para" }),
      n("bill", "Cloud bill", { shape: "cloud" }),
      bad("burn", "Overspend", { shape: "doc" }),
    ],
  },
  legacy: {
    nodes: [
      n("legacy", "Legacy DB", { shape: "cylinder" }),
      n("glue", "Manual glue", { shape: "para" }),
      n("api", "New API", { shape: "hex" }),
      bad("silo", "Silo", { shape: "cylinder" }),
    ],
  },
  "llm-serving": {
    nodes: [
      n("req", "Requests", { shape: "queue" }),
      n("serial", "One by one", { shape: "para" }),
      n("gpu", "GPU idle", { shape: "hex" }),
      bad("cost", "Cost up"),
    ],
  },
};

export const actionDiagrams: Record<string, CaseDiagram> = {
  "data-quality": {
    nodes: [
      good("contract", "Contracts", { shape: "doc" }),
      n("test", "Tests", { shape: "diamond" }),
      n("alert", "Alerts", { shape: "queue" }),
      result("replay", "Replay", { shape: "cylinder" }),
    ],
  },
  unstructured: {
    nodes: [
      good("extract", "Extract", { shape: "para" }),
      n("embed", "Embed", { shape: "hex" }),
      n("index", "Index", { shape: "cylinder" }),
      result("search", "Search"),
    ],
  },
  governance: {
    nodes: [
      good("lineage", "Lineage", { shape: "para" }),
      n("access", "Access", { shape: "diamond" }),
      n("audit", "Audit log", { shape: "queue" }),
      result("erase", "Erase"),
    ],
  },
  streaming: {
    nodes: [
      good("events", "Events", { shape: "queue" }),
      n("stream", "Stream job", { shape: "para" }),
      n("state", "State", { shape: "cylinder" }),
      result("live", "Live view", { shape: "doc" }),
    ],
  },
  rag: {
    nodes: [
      good("chunk", "Smart chunk", { shape: "para" }),
      n("embed", "Embed", { shape: "hex" }),
      n("index", "Vector index", { shape: "cylinder" }),
      result("ans", "Cited answer", { shape: "doc" }),
    ],
  },
  "agent-observability": {
    nodes: [
      good("trace", "Traces", { shape: "queue" }),
      n("metrics", "Metrics", { shape: "cylinder" }),
      n("alert", "Alerts", { shape: "diamond" }),
      result("fix", "Fix loop", { shape: "hex" }),
    ],
  },
  evaluation: {
    nodes: [
      good("golden", "Golden set", { shape: "cylinder" }),
      n("run", "Bench run", { shape: "hex" }),
      n("guard", "Guards", { shape: "diamond" }),
      result("ship", "Ship"),
    ],
  },
  "compute-cost": {
    nodes: [
      good("profile", "Profile", { shape: "para" }),
      n("schedule", "Queue", { shape: "queue" }),
      n("share", "Shared GPU", { shape: "hex" }),
      result("cost", "Cost / job", { shape: "doc" }),
    ],
  },
  legacy: {
    nodes: [
      good("wrap", "Wrap", { shape: "hex" }),
      n("events", "Events", { shape: "queue" }),
      n("typed", "Typed API"),
      result("migrate", "Migrate", { shape: "cylinder" }),
    ],
  },
  "llm-serving": {
    nodes: [
      good("batch", "Batching", { shape: "queue" }),
      n("quantize", "Quantize", { shape: "para" }),
      n("route", "Route", { shape: "diamond" }),
      result("low", "Low cost"),
    ],
  },
};
