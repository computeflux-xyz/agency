/**
 * Shape of the deep copy behind a "full" expertise page.
 *
 * Two practices have one so far (data engineering, AI engineering) and both are
 * rendered by the SAME organism, `PracticeDetail.astro`. The type lives here
 * rather than in either practice's file so neither owns the other: adding a third
 * practice means writing a `<practice>.ts` against this type and registering it,
 * not touching a component.
 *
 * No invented measurements anywhere: the sketch draws topology, not data.
 */

import type { FlowEdgeInput, FlowNodeInput } from "@lib/schematic";

export type PracticeContent = {
  /** Hero title. Deliberately not the generic practice name from `expertise.ts`:
      it is written against the hero footage. */
  heroTitle: string;
  /** Hero lead, under the title. Same register as the title — no numbers,
      nothing we cannot prove on a given project. */
  heroLead: string;
  // Overview
  overviewEyebrow: string;
  overviewTitle: string;
  overviewBullets: string[];
  overviewCta: string;
  // Pipeline / dark panel
  pipelineEyebrow: string;
  pipelineTitle: string;
  pipelineLead: string;
  flowAlt: string;
  flowCaption: string;
  flowLegendFix: string;
  flowLegendDefault: string;
  darkTitle: string;
  darkLead: string;
  pipelineTools: { name: string; si: string }[];
  // Full stack (kept in data; no section renders it today)
  stackLabel: string;
  stackLead: string;
  buildStack: string[];
  // Team gallery
  teamEyebrow: string;
  teamTitle: string;
  teamLead: string;
};

/**
 * The five stages `PipelineSketch` draws. Five is not incidental: the stencils
 * are chosen by position — sheet stack, contract hexagon, checked gate, storage
 * drum, dashboard window — so a practice's flow has to tell that story to reuse
 * the drawing.
 */
export type PracticeFlow = {
  nodes: FlowNodeInput[];
  edges: FlowEdgeInput[];
};
