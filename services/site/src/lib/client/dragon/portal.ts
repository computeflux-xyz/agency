/**
 * Rip: a tear through the "paper": a randomly jagged slit that can run HORIZONTAL
 * (upper/lower lips, dragon dives vertically) or VERTICAL (left/right lips,
 * dragon dives horizontally).
 *
 * Two-phase animation, both directions reversible:
 *   1. a cut LINE draws itself across (a directional sweep),
 *   2. then the tear PARTS open into a gap revealing the void beneath.
 *   Closing plays the reverse: the gap re-seals, then the line retracts.
 *
 * Depth / z-order (so the dragon reads as coming through the paper):
 *   - the void + the far lip are drawn behind the dragon (`drawBack`),
 *   - the near lip is drawn in front of the dragon (`drawFront`) : one torn
 *     edge always sits over the dragon,
 *   - the dragon is clipped to the front (paper) side of the near lip, so
 *     whatever has slipped under the wallpaper is hidden (no fade).
 *
 * Axis convention: "along" runs down the tear length. "cross" is where it
 * parts. The far lip sits on the −cross side, the near lip on the +cross side.
 * The dragon dives in the +cross direction to go under.
 */
import { CONFIG } from "./config";
import type { TopStage } from "./topstage";
import { clamp, easeInOutSine, rand } from "./math";

const P = CONFIG.portal;

export type RipAxis = "h" | "v";
type RipState = "idle" | "drawing" | "opening" | "open" | "closing" | "undrawing";

export class Portal {
  private state: RipState = "idle";
  private t = 0;
  private x = 0;
  private y = 0;
  private axis: RipAxis = "h";
  private dir = 1; // line-sweep direction: +1 / -1 along the tear

  private w = 0; // tear length
  private segs = 11;
  private jagFar: number[] = []; // roughness, far lip (−cross)
  private jagNear: number[] = []; // roughness, near lip (+cross)
  private jagC: number[] = []; // roughness, closed cut line

  get active(): boolean {
    return this.state !== "idle";
  }
  get cx(): number {
    return this.x;
  }
  get cy(): number {
    return this.y;
  }

  private lineProgress(): number {
    switch (this.state) {
      case "drawing":
        return clamp(this.t / P.line, 0, 1);
      case "opening":
      case "open":
      case "closing":
        return 1;
      case "undrawing":
        return clamp(1 - this.t / P.line, 0, 1);
      default:
        return 0;
    }
  }
  private partProgress(): number {
    switch (this.state) {
      case "opening":
        return clamp(this.t / P.open, 0, 1);
      case "open":
        return 1;
      case "closing":
        return clamp(1 - this.t / P.close, 0, 1);
      default:
        return 0;
    }
  }
  get openFraction(): number {
    return easeInOutSine(this.partProgress());
  }

  openAt(x: number, y: number, axis: RipAxis = "h"): void {
    this.x = x;
    this.y = y;
    this.axis = axis;
    this.t = 0;
    this.state = "drawing";
    this.dir = Math.random() < 0.5 ? 1 : -1;
    this.w = rand(CONFIG.dragonSize * 1.7, CONFIG.dragonSize * 2.4);
    this.jagFar = [];
    this.jagNear = [];
    this.jagC = [];
    for (let i = 0; i <= this.segs; i++) {
      this.jagFar.push(rand(0, CONFIG.dragonSize * 0.14));
      this.jagNear.push(rand(0, CONFIG.dragonSize * 0.14));
      this.jagC.push(rand(-1, 1) * CONFIG.dragonSize * 0.05);
    }
  }

  beginClose(): void {
    if (this.state === "open" || this.state === "opening") {
      this.t = this.state === "opening" ? (1 - this.partProgress()) * P.close : 0;
      this.state = "closing";
    }
  }

  setCenter(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  reset(): void {
    this.state = "idle";
    this.t = 0;
  }

  update(dt: number): void {
    if (this.state === "idle") return;
    this.t += dt;
    switch (this.state) {
      case "drawing":
        if (this.t >= P.line) ((this.state = "opening"), (this.t = 0));
        break;
      case "opening":
        if (this.t >= P.open) ((this.state = "open"), (this.t = 0));
        break;
      case "closing":
        if (this.t >= P.close) ((this.state = "undrawing"), (this.t = 0));
        break;
      case "undrawing":
        if (this.t >= P.line) ((this.state = "idle"), (this.t = 0));
        break;
    }
  }

  private alongCenter(): number {
    return this.axis === "h" ? this.x : this.y;
  }
  private crossCenter(): number {
    return this.axis === "h" ? this.y : this.x;
  }
  private alongAt(i: number): number {
    return this.alongCenter() - this.w / 2 + (this.w * i) / this.segs;
  }
  private tip(i: number): number {
    return Math.sin((Math.PI * i) / this.segs);
  }
  private farCross(i: number, half: number): number {
    return this.crossCenter() - (half + this.jagFar[i]) * this.tip(i);
  }
  private nearCross(i: number, half: number): number {
    return this.crossCenter() + (half + this.jagNear[i]) * this.tip(i);
  }
  private ptX(along: number, cross: number): number {
    return this.axis === "h" ? along : cross;
  }
  private ptY(along: number, cross: number): number {
    return this.axis === "h" ? cross : along;
  }

  drawBack(stage: TopStage): void {
    if (!this.active) return;
    const part = easeInOutSine(this.partProgress());
    if (part <= 0.01) return;
    const half = (P.maxRadius * part) / 2;
    const ctx = stage.ctx;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.ptX(this.alongAt(0), this.farCross(0, half)), this.ptY(this.alongAt(0), this.farCross(0, half)));
    for (let i = 1; i <= this.segs; i++)
      ctx.lineTo(this.ptX(this.alongAt(i), this.farCross(i, half)), this.ptY(this.alongAt(i), this.farCross(i, half)));
    for (let i = this.segs; i >= 0; i--)
      ctx.lineTo(this.ptX(this.alongAt(i), this.nearCross(i, half)), this.ptY(this.alongAt(i), this.nearCross(i, half)));
    ctx.closePath();
    const c = this.crossCenter();
    const g =
      this.axis === "h"
        ? ctx.createLinearGradient(0, c - half, 0, c + half)
        : ctx.createLinearGradient(c - half, 0, c + half, 0);
    g.addColorStop(0, `rgba(14,12,20,${0.75 * part})`);
    g.addColorStop(0.5, `rgba(6,6,10,${0.96 * part})`);
    g.addColorStop(1, `rgba(14,12,20,${0.75 * part})`);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();

    this.strokeLip(ctx, (i) => this.farCross(i, half), false, part);
  }

  clipAbove(stage: TopStage): void {
    const ctx = stage.ctx;
    const part = easeInOutSine(this.partProgress());
    const half = (P.maxRadius * part) / 2;
    const W = stage.cssW;
    const H = stage.cssH;
    const c = this.crossCenter();
    ctx.beginPath();
    if (this.axis === "h") {
      ctx.moveTo(0, 0);
      ctx.lineTo(W, 0);
      ctx.lineTo(W, c);
      for (let i = this.segs; i >= 0; i--) ctx.lineTo(this.alongAt(i), this.nearCross(i, half));
      ctx.lineTo(0, c);
    } else {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, H);
      ctx.lineTo(c, H);
      for (let i = this.segs; i >= 0; i--) ctx.lineTo(this.nearCross(i, half), this.alongAt(i));
      ctx.lineTo(c, 0);
    }

    ctx.closePath();
    ctx.clip();
  }

  drawFront(stage: TopStage): void {
    if (!this.active) return;
    const ctx = stage.ctx;
    const part = easeInOutSine(this.partProgress());
    if (part <= 0.01) {
      this.drawCutLine(ctx, this.lineProgress());
      return;
    }

    const half = (P.maxRadius * part) / 2;
    this.strokeLip(ctx, (i) => this.nearCross(i, half), true, part);
  }

  private drawCutLine(ctx: CanvasRenderingContext2D, reveal: number): void {
    if (reveal <= 0.001) return;
    const n = this.segs;
    const count = Math.max(1, Math.round(reveal * n));
    const crossAt = (i: number) => this.crossCenter() + this.jagC[i] * this.tip(i);
    const idx: number[] = [];
    if (this.dir > 0) for (let i = 0; i <= count; i++) idx.push(i);
    else for (let i = n; i >= n - count; i--) idx.push(i);

    const trace = () => {
      ctx.beginPath();
      ctx.moveTo(this.ptX(this.alongAt(idx[0]), crossAt(idx[0])), this.ptY(this.alongAt(idx[0]), crossAt(idx[0])));
      for (let k = 1; k < idx.length; k++)
        ctx.lineTo(this.ptX(this.alongAt(idx[k]), crossAt(idx[k])), this.ptY(this.alongAt(idx[k]), crossAt(idx[k])));
    };

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(15,12,22,0.5)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(15,12,22,0.5)";
    ctx.shadowBlur = 5;
    trace();
    ctx.stroke();
    ctx.strokeStyle = "rgba(251,251,249,0.9)";
    ctx.lineWidth = 1.4;
    ctx.shadowBlur = 0;
    trace();
    ctx.stroke();
    ctx.restore();
  }

  private strokeLip(
    ctx: CanvasRenderingContext2D,
    crossFn: (i: number) => number,
    nearSide: boolean,
    a: number,
  ): void {
    const trace = () => {
      ctx.beginPath();
      ctx.moveTo(this.ptX(this.alongAt(0), crossFn(0)), this.ptY(this.alongAt(0), crossFn(0)));
      for (let i = 1; i <= this.segs; i++)
        ctx.lineTo(this.ptX(this.alongAt(i), crossFn(i)), this.ptY(this.alongAt(i), crossFn(i)));
    };

    const gapDir = nearSide ? -1 : 1;
    const gx = (this.axis === "h" ? 0 : gapDir) * 3;
    const gy = (this.axis === "h" ? gapDir : 0) * 3;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(15,12,22,${0.4 * a})`;
    ctx.lineWidth = 5;
    ctx.shadowColor = `rgba(15,12,22,${0.5 * a})`;
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = gx;
    ctx.shadowOffsetY = gy;
    trace();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(251,251,249,${0.85 * a})`;
    ctx.lineWidth = 2;
    ctx.translate(this.axis === "h" ? 0 : -gapDir * 1.5, this.axis === "h" ? -gapDir * 1.5 : 0);
    trace();
    ctx.stroke();
    ctx.restore();
  }
}
