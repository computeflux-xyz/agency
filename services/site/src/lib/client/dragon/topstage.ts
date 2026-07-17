/**
 * The top layer : a lightweight 2D canvas pinned above page content (below the
 * sticky header). It is idle almost always. It only lights up for two brief,
 * deliberate events:
 *   1. the dragon's quick "pop above a component" zip (drawn from the atlas)
 *   2. the burn / reconstruct text set-piece (drawn by burn.ts)
 *
 * Kept 2D on purpose: these are occasional and cheap, so a second WebGL context
 * (and the z-index toggling that a single shared context would require) is not
 * worth it. Drawing happens in CSS pixels (the context is DPR-scaled).
 */
import type { Atlas } from "./sprite";

export class TopStage {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private atlas: Atlas;
  cssW = 0;
  cssH = 0;

  constructor(canvas: HTMLCanvasElement, atlas: Atlas) {
    this.canvas = canvas;
    this.atlas = atlas;
    this.ctx = canvas.getContext("2d")!;
  }

  resize(cssW: number, cssH: number, dpr: number): void {
    this.cssW = cssW;
    this.cssH = cssH;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    this.canvas.style.width = cssW + "px";
    this.canvas.style.height = cssH + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  clear(): void {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  drawDragon(
    col: number,
    row: number,
    x: number,
    y: number,
    size: number,
    rot: number,
    flipX: boolean,
    alpha: number,
  ): void {
    if (alpha <= 0.001) return;
    const ctx = this.ctx;
    const c = this.atlas.cell;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (flipX) ctx.scale(-1, 1);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(this.atlas.canvas, col * c, row * c, c, c, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
}
