/**
 * Fire: a warm, continuous plume of point-sprite particles.
 *
 * Design constraints baked in:
 *   - Zero steady-state allocation: fixed-capacity struct-of-arrays pool with
 *     swap-remove on death. One reusable output Float32Array for the GPU.
 *   - Photosensitivity-safe: a smooth plume (particles fade in/out over ~0.6s),
 *     never a strobing burst. The colour ramp tops out at warm amber, never
 *     white. Spawn rate is temporally smoothed by the emitter.
 *   - Protect deflection: particles are pushed out of an (inflated) shield box
 *     so flame wreathes around important text rather than across it.
 */
import { CONFIG, COLORS } from "./config";
import type { Box } from "./types";
import { clamp, rand } from "./math";

const F = CONFIG.fire;

export class Fire {
  private px: Float32Array;
  private py: Float32Array;
  private vx: Float32Array;
  private vy: Float32Array;
  private age: Float32Array;
  private ttl: Float32Array;
  private count = 0;
  private spawnAcc = 0;
  private out: Float32Array;
  private deflect: Box | null = null;

  quality = 1;

  constructor(private max = F.maxParticles) {
    this.px = new Float32Array(max);
    this.py = new Float32Array(max);
    this.vx = new Float32Array(max);
    this.vy = new Float32Array(max);
    this.age = new Float32Array(max);
    this.ttl = new Float32Array(max);
    this.out = new Float32Array(max * 7);
  }

  get active(): number {
    return this.count;
  }

  setDeflect(box: Box | null): void {
    this.deflect = box;
  }

  emit(x: number, y: number, angle: number, dt: number, intensity: number): void {
    this.spawnAcc += F.spawnPerSec * clamp(intensity, 0, 1) * this.quality * dt;
    let n = this.spawnAcc | 0;
    this.spawnAcc -= n;
    while (n-- > 0 && this.count < this.max) {
      const a = angle + rand(-F.spread, F.spread);
      const sp = F.speed * rand(0.55, 1.05);
      const i = this.count++;

      this.px[i] = x + rand(-3, 3);
      this.py[i] = y + rand(-3, 3);
      this.vx[i] = Math.cos(a) * sp;
      this.vy[i] = Math.sin(a) * sp;
      this.age[i] = 0;
      this.ttl[i] = F.life * rand(0.75, 1.15);
    }
  }

  update(dt: number): void {
    const d = this.deflect;
    for (let i = 0; i < this.count; ) {
      let a = (this.age[i] += dt);
      if (a >= this.ttl[i]) {

        const j = --this.count;
        this.px[i] = this.px[j];
        this.py[i] = this.py[j];
        this.vx[i] = this.vx[j];
        this.vy[i] = this.vy[j];
        this.age[i] = this.age[j];
        this.ttl[i] = this.ttl[j];
        continue;
      }

      this.vy[i] -= 60 * dt;
      this.vx[i] *= 1 - 1.6 * dt;
      this.vy[i] *= 1 - 1.6 * dt;

      let nx = this.px[i] + this.vx[i] * dt;
      let ny = this.py[i] + this.vy[i] * dt;

      if (d && nx > d.x && nx < d.x + d.w && ny > d.y && ny < d.y + d.h) {
        const cx = d.x + d.w / 2;
        const cy = d.y + d.h / 2;
        const push = 900 * dt;
        if (Math.abs(nx - cx) / d.w > Math.abs(ny - cy) / d.h) {
          this.vx[i] += Math.sign(nx - cx || 1) * push;
        } else {
          this.vy[i] += Math.sign(ny - cy || 1) * push;
        }

        this.age[i] += dt * 2;
        nx = this.px[i] + this.vx[i] * dt;
        ny = this.py[i] + this.vy[i] * dt;
      }

      this.px[i] = nx;
      this.py[i] = ny;
      i++;
    }
  }

  writeBuffer(): { data: Float32Array; count: number } {
    const o = this.out;
    const am = COLORS.amber;
    const em = COLORS.ember;
    const ed = COLORS.emberDeep;
    for (let i = 0; i < this.count; i++) {
      const t = clamp(this.age[i] / this.ttl[i], 0, 1); // 0 young .. 1 spent
      let r: number, g: number, b: number;
      if (t < 0.5) {
        const k = t / 0.5;
        r = am[0] + (em[0] - am[0]) * k;
        g = am[1] + (em[1] - am[1]) * k;
        b = am[2] + (em[2] - am[2]) * k;
      } else {
        const k = (t - 0.5) / 0.5;
        r = em[0] + (ed[0] - em[0]) * k;
        g = em[1] + (ed[1] - em[1]) * k;
        b = em[2] + (ed[2] - em[2]) * k;
      }

      const fadeIn = clamp(t / 0.12, 0, 1);
      const fadeOut = clamp((1 - t) / 0.55, 0, 1);
      const alpha = fadeIn * fadeOut * 0.9;
      const size = F.sizeStart + (F.sizeEnd - F.sizeStart) * t;
      const p = i * 7;
      o[p] = this.px[i];
      o[p + 1] = this.py[i];
      o[p + 2] = size;
      o[p + 3] = r;
      o[p + 4] = g;
      o[p + 5] = b;
      o[p + 6] = alpha;
    }

    return { data: o, count: this.count };
  }

  reset(): void {
    this.count = 0;
    this.spawnAcc = 0;
  }
}

export function angleToBox(x: number, y: number, b: Box): number {
  return Math.atan2(b.y + b.h / 2 - y, b.x + b.w / 2 - x) || 0;
}
