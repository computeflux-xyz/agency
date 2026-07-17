/**
 * initDragon is the orchestrator. Wires the renderer, target registry, fire,
 * behaviour FSM and burn effect into a single rAF loop, and enforces every
 * guard the feature promised:
 *
 *   - Hard device gate: fine-pointer, wide, capable desktops only. Reduced
 *     motion, touch/coarse pointers, small viewports, save-data and low
 *     memory/CPU all opt out (and then the module never even loads pretext /
 *     WebGL. See DragonStage.astro, which dynamic-imports this after guards).
 *   - A WCAG pause/hide control, persisted across pages.
 *   - Pauses on tab-hidden and hides under the frosted mega-menu / drawer.
 *   - Batched reads then writes (no layout thrash), zero steady-state alloc.
 *   - A frame-rate governor that dials fire back on slow frames.
 *   - Idempotent singleton + complete teardown (no leaked WebGL contexts).
 */
import { CONFIG } from "./config";
import { buildAtlas } from "./sprite";
import { Renderer } from "./renderer";
import { TopStage } from "./topstage";
import { TargetRegistry } from "./targets";
import { Fire } from "./fire";
import { Dragon } from "./dragon";
import { Burn } from "./burn";
import { Portal } from "./portal";
import { makeControl, isPausedPref, type Control } from "./controls";
import type { Viewport } from "./types";
import { lerp } from "./math";

let instance: DragonSystem | null = null;

function gateReason(): string | null {
  if (typeof window === "undefined" || !("requestAnimationFrame" in window)) return "no window / rAF";
  const mm = window.matchMedia;
  if (mm("(prefers-reduced-motion: reduce)").matches) return "prefers-reduced-motion is enabled";
  if (mm("(hover: none)").matches) return "touch device (no hover)";
  if (window.innerWidth < CONFIG.minViewport) return `viewport ${window.innerWidth}px < ${CONFIG.minViewport}px`;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "Save-Data is enabled";
  try {
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return "WebGL unavailable";
  } catch {
    return "WebGL unavailable";
  }

  return null;
}

function chromeBusy(): boolean {
  return !!document.querySelector("[data-header].has-open-menu, [data-mobile-drawer].is-open");
}

function mkCanvas(id: string, z: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.id = id;
  c.setAttribute("aria-hidden", "true");
  Object.assign(c.style, {
    position: "fixed",
    left: "0",
    top: "0",
    pointerEvents: "none",
    zIndex: String(z),
  } satisfies Partial<CSSStyleDeclaration>);
  return c;
}

class DragonSystem {
  private glCanvas = mkCanvas("flux-dragon", 0);
  private bgCanvas = mkCanvas("flux-dragon-bg", 0);
  private topCanvas = mkCanvas("flux-dragon-top", 40);
  private renderer: Renderer;
  private top: TopStage;
  private bg: TopStage;
  private reg: TargetRegistry;
  private fire = new Fire();
  private dragon: Dragon;
  private burn = new Burn();
  private portal = new Portal();
  private control: Control;

  private raf = 0;
  private running = false;
  private userPaused = isPausedPref();
  private lastT = 0;
  private avgFrame = 1 / 60;
  private lastW = 0;
  private lastH = 0;
  private dirty = true;

  constructor() {
    // First direct children of <body> so the negative content-lift keeps them
    // behind page content, with no transformed ancestor to clip them.
    // Final paint order (all below content z:1 except the top canvas z:40):
    //   bgCanvas (portal rift, deepest) < glCanvas (dragon + fire) < content
    //   < topCanvas (surface pass + burn).
    document.body.insertBefore(this.topCanvas, document.body.firstChild);
    document.body.insertBefore(this.glCanvas, document.body.firstChild);
    document.body.insertBefore(this.bgCanvas, document.body.firstChild);

    const atlas = buildAtlas();
    this.renderer = new Renderer(this.glCanvas, atlas);
    this.top = new TopStage(this.topCanvas, atlas);
    this.bg = new TopStage(this.bgCanvas, atlas);
    this.reg = new TargetRegistry(document.body);
    void this.reg.init();
    this.dragon = new Dragon(this.readVp());

    this.control = makeControl(this.userPaused, (p) => this.setPaused(p));
    document.body.appendChild(this.control.el);
    if (this.userPaused)
      this.glCanvas.style.visibility =
        this.topCanvas.style.visibility =
        this.bgCanvas.style.visibility =
          "hidden";

    window.addEventListener("resize", this.onResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("pagehide", this.onPageHide);
    window.addEventListener("pointerdown", this.onPointerDown, true);

    this.applyResize();
    if (!this.userPaused) this.start();
  }

  private readVp(): Viewport {
    return { w: window.innerWidth, h: window.innerHeight, scrollX: window.scrollX, scrollY: window.scrollY };
  }

  private onResize = () => {
    this.dirty = true;
  };

  private applyResize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w === this.lastW && h === this.lastH) return;
    this.lastW = w;
    this.lastH = h;
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR);
    this.renderer.resize(w, h, dpr);
    this.top.resize(w, h, dpr);
    this.bg.resize(w, h, dpr);
    this.reg.measure();
  }

  private start(): void {
    if (this.running) return;
    this.running = true;
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  private stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.burn.restore();
    this.dragon.clearTransient();
    this.fire.reset();
    this.portal.reset();
    this.renderer.beginFrame();
    this.top.clear();
    this.bg.clear();
  }

  private setPaused(paused: boolean): void {
    this.userPaused = paused;
    const v = paused ? "hidden" : "";
    this.glCanvas.style.visibility = this.topCanvas.style.visibility = this.bgCanvas.style.visibility = v;
    if (paused) this.stop();
    else if (!document.hidden) this.start();
  }

  private onVisibility = () => {
    if (document.hidden) this.stop();
    else if (!this.userPaused) this.start();
  };

  private onPageHide = () => destroyDragon();

  private onPointerDown = (e: PointerEvent) => {
    if (this.userPaused || !this.dragon.isSleeping()) return;
    const p = this.dragon.pos();
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    const r = CONFIG.dragonSize * 0.75;
    if (dx * dx + dy * dy <= r * r) this.dragon.wake();
  };

  private loop = (t: number) => {
    if (!this.running) return;
    let dt = (t - this.lastT) / 1000;
    this.lastT = t;
    if (dt > 0.05) dt = 0.05;
    if (dt <= 0) dt = 1 / 60;
    this.frame(t / 1000, dt, false);
    this.raf = requestAnimationFrame(this.loop);
  };

  private frame(now: number, dt: number, force: boolean): void {
    this.avgFrame = lerp(this.avgFrame, dt, 0.08);
    this.fire.quality = this.avgFrame > 0.026 ? 0.5 : this.avgFrame > 0.02 ? 0.75 : 1;

    if (this.dirty) {
      this.applyResize();
      this.dirty = false;
    }

    const vp = this.readVp();
    const hidden = !force && (chromeBusy() || document.hidden);

    this.renderer.beginFrame();
    this.top.clear();
    this.bg.clear();

    const cmd = this.dragon.update(dt, now, vp, this.reg, this.fire, this.portal);
    this.fire.update(dt);
    this.portal.update(dt);

    if (hidden) {
      this.burn.restore();
      return;
    }

    if (this.portal.active) this.portal.drawBack(this.bg);
    if (cmd.layer === "rip") {
      const ctx = this.bg.ctx;
      ctx.save();
      this.portal.clipAbove(this.bg);
      this.bg.drawDragon(cmd.col, cmd.row, cmd.x, cmd.y, cmd.size, cmd.rot, cmd.flip, cmd.alpha);
      ctx.restore();
    } else if (cmd.layer === "top") {
      this.top.drawDragon(cmd.col, cmd.row, cmd.x, cmd.y, cmd.size, cmd.rot, cmd.flip, cmd.alpha);
    } else {
      this.renderer.drawSprite(cmd.col, cmd.row, cmd.x, cmd.y, cmd.size, cmd.rot, cmd.flip, cmd.alpha);
    }

    if (this.portal.active) this.portal.drawFront(this.bg);
    const { data, count } = this.fire.writeBuffer();
    this.renderer.drawParticles(data, count); // fire lives on the behind plane
    if (this.dragon.burnRequest && this.burn.canBurn(this.dragon.burnRequest)) {
      this.burn.trigger(this.dragon.burnRequest, this.top, now);
    }

    this.burn.draw(this.top, now);
  }

  debugStep(frames = 120, dtMs = 16.7): string {
    this.applyResize();
    const dt = dtMs / 1000;
    let now = performance.now() / 1000;
    for (let i = 0; i < frames; i++) {
      now += dt;
      this.frame(now, dt, true);
    }

    return JSON.stringify(this.debug());
  }

  debug(): Record<string, unknown> {
    return {
      running: this.running,
      userPaused: this.userPaused,
      viewport: [window.innerWidth, window.innerHeight],
      onScreenTargets: this.reg.onScreenCount(),
      totalTargets: this.reg.all().length,
      avgFrameMs: +(this.avgFrame * 1000).toFixed(1),
      dragon: this.dragon.info,
    };
  }

  destroy(): void {
    this.stop();
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("pagehide", this.onPageHide);
    window.removeEventListener("pointerdown", this.onPointerDown, true);
    this.reg.destroy();
    this.renderer.destroy();
    this.control.destroy();
    this.glCanvas.remove();
    this.bgCanvas.remove();
    this.topCanvas.remove();
  }
}

export function initDragon(): void {
  if (instance) return;
  const reason = gateReason();
  if (reason) {
    if (import.meta.env.DEV) console.info(`[dragon] not started — ${reason}`);
    return;
  }

  try {
    instance = new DragonSystem();
    if (import.meta.env.DEV) {
      (window as unknown as { __fluxDragon?: unknown }).__fluxDragon = instance;
    }
  } catch (e) {
    if (import.meta.env.DEV) console.error("[dragon] init error", e);
    instance?.destroy();
    instance = null;
  }
}

export function destroyDragon(): void {
  instance?.destroy();
  instance = null;
}
