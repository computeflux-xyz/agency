export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type TargetKind = "protect" | "burn";
export type BurnState = "restored" | "burning" | "burned" | "rebuilding";

export interface Target {
  el: HTMLElement;
  kind: TargetKind;
  docX: number;
  docY: number;
  w: number;
  h: number;
  explicit: boolean;
  lastVisit: number;
  nearCta: boolean;
  burn: BurnState;
}

export interface Viewport {
  w: number;
  h: number;
  scrollX: number;
  scrollY: number;
}
