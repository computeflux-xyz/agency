/**
 * This is the one place pretext is genuinely the right tool: we render the
 * target's text ourselves onto the top canvas, so we must lay it out ourselves,
 * reflow-free. (Measuring a DOM heading's wrapping with pretext would be wrong.
 * text-wrap:balance / responsive <br> / letter-spacing make the browser the
 * only authority there but here the browser isn't laying out our copy, we are.)
 *
 *   - The real DOM node is NEVER mutated or removed, only its inline `opacity`
 *     is animated (no reflow, no CLS. Text stays in the a11y/SEO tree). Burn is
 *     only ever allowed on childless, non-interactive text (validated in
 *     targets.ts), so nothing focusable is hidden.
 *   - A strict per-element state machine + lock prevents overlapping cycles.
 *   - `restore()` forces the element back to its pristine state and is called on
 *     completion, on pause/visibility-hidden, on scroll-away, and on teardown
 *     so the only stable resting state is "fully restored".
 */
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import type { Target } from "./types";
import type { TopStage } from "./topstage";
import { clamp, rand, smoothstep, TAU } from "./math";
import { COLORS } from "./config";

const BURN = 0.55;
const GAP = 0.12;
const REBUILD = 0.65;
const TOTAL = BURN + GAP + REBUILD;
const SCATTER = 66;

interface Glyph {
  ch: string;
  hx: number; // home x (viewport px at trigger)
  hy: number; // home baseline y
  dx: number; // scatter direction
  dy: number;
  rot: number;
}

function parseColor(c: string): [number, number, number] {
  const m = c.match(/(\d+(?:\.\d+)?)/g);
  if (m && m.length >= 3) return [+m[0] / 255, +m[1] / 255, +m[2] / 255];
  return COLORS.ink as unknown as [number, number, number];
}

export class Burn {
  private target: Target | null = null;
  private glyphs: Glyph[] = [];
  private font = "";
  private color: [number, number, number] = [0, 0, 0];
  private start = 0;
  private startScrollX = 0;
  private startScrollY = 0;

  get busy(): boolean {
    return this.target !== null;
  }

  canBurn(t: Target): boolean {
    return !this.busy && t.kind === "burn" && t.burn === "restored";
  }

  trigger(t: Target, stage: TopStage, now: number): void {
    if (!this.canBurn(t)) return;
    const text = (t.el.textContent ?? "").replace(/\s+/g, " ").trim();
    const box = t.el.getBoundingClientRect();
    if (!text || box.width < 4 || box.height < 4) return;

    const cs = getComputedStyle(t.el);
    const style = cs.fontStyle && cs.fontStyle !== "normal" ? cs.fontStyle + " " : "";
    this.font = `${style}${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    this.color = parseColor(cs.color);
    const fontPx = parseFloat(cs.fontSize) || 24;
    const lineH = parseFloat(cs.lineHeight) || fontPx * 1.2;
    const ascent = fontPx * 0.8;
    const centered = cs.textAlign === "center";

    const ctx = stage.ctx;
    ctx.font = this.font;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    let lines: { text: string; width: number }[];
    try {
      const prepared = prepareWithSegments(text, this.font);
      lines = layoutWithLines(prepared, box.width + 1, lineH).lines;
    } catch {
      lines = [{ text, width: ctx.measureText(text).width }];
    }
    if (!lines.length) lines = [{ text, width: ctx.measureText(text).width }];

    this.glyphs = [];
    let seed = 0;
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const lineW = ctx.measureText(line.text).width;
      let x = box.left + (centered ? (box.width - lineW) / 2 : 0);
      const y = box.top + li * lineH + ascent;
      for (const ch of Array.from(line.text)) {
        const w = ctx.measureText(ch).width;
        if (ch !== " ") {
          const a = rand(0, TAU);
          const mag = SCATTER * rand(0.6, 1.4);
          this.glyphs.push({
            ch,
            hx: x,
            hy: y,
            dx: Math.cos(a) * mag,
            dy: Math.sin(a) * mag - 26,
            rot: rand(-1, 1) * 0.9,
          });
        }
        x += w;
        seed++;
      }
    }

    this.target = t;
    t.burn = "burning";
    this.start = now;
    this.startScrollX = window.scrollX;
    this.startScrollY = window.scrollY;
    t.el.style.opacity = "0";
    t.el.style.willChange = "opacity";
  }

  draw(stage: TopStage, now: number): boolean {
    const t = this.target;
    if (!t) return false;
    const e = now - this.start;
    if (e >= TOTAL) {
      this.restore();
      return false;
    }

    const ctx = stage.ctx;
    ctx.font = this.font;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const ox = this.startScrollX - window.scrollX;
    const oy = this.startScrollY - window.scrollY;

    let s: number, h: number, ga: number;
    if (e < BURN) {
      const p = smoothstep(e / BURN);
      s = p;
      h = p;
      ga = 1 - p;
      t.burn = "burning";
    } else if (e < BURN + GAP) {
      s = 1;
      h = 1;
      ga = 0;
      t.burn = "burned";
    } else {
      const p = smoothstep((e - BURN - GAP) / REBUILD);
      s = 1 - p;
      h = 1 - p;
      ga = p;
      t.burn = "rebuilding";
    }

    const [r0, g0, b0] = this.color;
    const em = COLORS.ember;
    const r = ((r0 + (em[0] - r0) * h) * 255) | 0;
    const g = ((g0 + (em[1] - g0) * h) * 255) | 0;
    const b = ((b0 + (em[2] - b0) * h) * 255) | 0;
    ctx.fillStyle = `rgb(${r},${g},${b})`;

    for (const gl of this.glyphs) {
      const gx = gl.hx + ox + gl.dx * s;
      const gy = gl.hy + oy + gl.dy * s;
      const a = ga * clamp(1 - Math.abs(s) * 0.15, 0.15, 1);
      if (a <= 0.01) continue;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(gx, gy);
      if (gl.rot) ctx.rotate(gl.rot * s);
      ctx.fillText(gl.ch, 0, 0);
      ctx.restore();
    }
    return true;
  }

  restore(): void {
    const t = this.target;
    if (!t) return;
    t.el.style.opacity = "";
    t.el.style.willChange = "";
    t.burn = "restored";
    t.lastVisit = performance.now() / 1000;
    this.target = null;
    this.glyphs = [];
  }
}
