/**
 * Target registry : decides what counts as "important" and where it is, the
 * reflow-free way.
 *
 * Geometry is measured once (batched, after webfonts settle) into
 * document-relative boxes, then refreshed only on resize / font-load. The
 * per-frame hot path derives viewport boxes from `docX/Y - scroll`, so it never
 * touches the layout engine. (Per-frame getBoundingClientRect would force
 * synchronous layout and thrash against scramble.ts's innerHTML writes on the
 * very same headings.)
 *
 * "Important" = h1/h2 (or any element) whose computed font-size clears the
 * threshold, plus anything explicitly tagged `data-dragon="protect|burn"`.
 * Auto-detected targets are dropped when they sit next to a CTA / form so the
 * dragon can never draw fire across the conversion path. Explicit author marks
 * bypass that safety net.
 */
import { CONFIG, CTA_SELECTOR } from "./config";
import type { Box, Target, Viewport } from "./types";

const AUTO_SELECTOR = "h1, h2";

function isInteractive(el: Element): boolean {
  return !!el.closest(CTA_SELECTOR) || el.matches(CTA_SELECTOR);
}

function boxGap(a: Box, b: Box): number {
  const dx = Math.max(0, Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w)));
  const dy = Math.max(0, Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h)));
  return Math.hypot(dx, dy);
}

export class TargetRegistry {
  private targets: Target[] = [];
  private ctaEls: HTMLElement[] = [];
  private ctaBoxes: Box[] = [];
  private ro: ResizeObserver;

  constructor(private root: HTMLElement = document.body) {
    this.ro = new ResizeObserver(() => this.measure());
    this.ro.observe(document.documentElement);
  }

  async init(): Promise<void> {
    const seen = new Set<HTMLElement>();
    const consider = (el: HTMLElement) => {
      if (seen.has(el)) return;
      const attr = el.dataset.dragon;
      if (attr === "ignore") return;
      const explicit = attr === "protect" || attr === "burn";
      const resolvedKind = attr === "burn" ? "burn" : "protect";

      if (resolvedKind === "burn") {
        if (el.children.length > 0 || isInteractive(el) || !el.textContent?.trim()) return;
      } else {
        if (isInteractive(el)) return; // never breathe fire onto a link/button
        if (!explicit) {
          const px = parseFloat(getComputedStyle(el).fontSize) || 0;
          if (px < CONFIG.importantFontPx) return;
          if (!el.textContent?.trim()) return;
        }
      }
      seen.add(el);
      this.targets.push({
        el,
        kind: resolvedKind,
        explicit,
        docX: 0,
        docY: 0,
        w: 0,
        h: 0,
        lastVisit: -1e9,
        nearCta: false,
        burn: "restored",
      });
    };

    this.root.querySelectorAll<HTMLElement>(AUTO_SELECTOR).forEach((el) => consider(el));
    this.root.querySelectorAll<HTMLElement>("[data-dragon]").forEach((el) => consider(el));

    this.ctaEls = Array.from(this.root.querySelectorAll<HTMLElement>(CTA_SELECTOR));

    try {
      await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
    } catch {}

    this.measure();
  }

  measure(): void {
    const sx = window.scrollX;
    const sy = window.scrollY;
    for (const t of this.targets) {
      const r = t.el.getBoundingClientRect();
      t.docX = r.left + sx;
      t.docY = r.top + sy;
      t.w = r.width;
      t.h = r.height;
    }

    this.ctaBoxes = this.ctaEls.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + sx, y: r.top + sy, w: r.width, h: r.height };
    });

    for (const t of this.targets) {
      const tb: Box = { x: t.docX, y: t.docY, w: t.w, h: t.h };
      t.nearCta = this.ctaBoxes.some((c) => boxGap(tb, c) < CONFIG.ctaKeepout);
    }
  }

  vpBox(t: Target, vp: Viewport): Box {
    return { x: t.docX - vp.scrollX, y: t.docY - vp.scrollY, w: t.w, h: t.h };
  }

  isOnScreen(t: Target, vp: Viewport, margin = 40): boolean {
    const x = t.docX - vp.scrollX;
    const y = t.docY - vp.scrollY;
    return x + t.w > -margin && x < vp.w + margin && y + t.h > -margin && y < vp.h + margin;
  }

  pickFocus(now: number, vp: Viewport): Target | null {
    const focalX = vp.w * 0.5;
    const focalY = vp.h * CONFIG.focalY;
    const maxD = Math.hypot(vp.w, vp.h);
    let best: Target | null = null;
    let bestScore = -Infinity;
    let fallback: Target | null = null;
    let fallbackAge = -Infinity;

    for (const t of this.targets) {
      if (!this.isOnScreen(t, vp)) continue;
      if (!t.explicit && t.nearCta && t.kind === "burn") continue;
      const b = this.vpBox(t, vp);
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;

      if (cy < CONFIG.headerSafe || cy > vp.h - CONFIG.edgeMargin) continue;

      const age = now - t.lastVisit;
      if (age > fallbackAge) {
        fallbackAge = age;
        fallback = t;
      }

      if (age < CONFIG.revisitCooldown) continue;

      const d = Math.hypot(cx - focalX, cy - focalY);
      let score = (1 - d / maxD) * 100;
      score += Math.min(1, (b.w * b.h) / (vp.w * vp.h) / 0.06) * 22;
      if (t.kind === "burn") score += 26;
      if (score > bestScore) {
        bestScore = score;
        best = t;
      }
    }

    return best ?? fallback;
  }

  onScreenCount(): number {
    const vp: Viewport = {
      w: window.innerWidth,
      h: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };

    let n = 0;
    for (const t of this.targets) if (this.isOnScreen(t, vp)) n++;
    return n;
  }

  all(): readonly Target[] {
    return this.targets;
  }

  destroy(): void {
    this.ro.disconnect();
    this.targets = [];
    this.ctaEls = [];
    this.ctaBoxes = [];
  }
}
