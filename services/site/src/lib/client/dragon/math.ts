export interface Vec2 {
  x: number;
  y: number;
}

export const TAU = Math.PI * 2;

export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const damp = (current: number, target: number, lambda: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export const rand = (lo: number, hi: number): number => lo + Math.random() * (hi - lo);

export const randSign = (): number => (Math.random() < 0.5 ? -1 : 1);

export const pick = <T>(arr: readonly T[]): T => arr[(Math.random() * arr.length) | 0];

export function angleDelta(a: number, b: number): number {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

export const dist2 = (ax: number, ay: number, bx: number, by: number): number => {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
};

export const smoothstep = (t: number): number => {
  t = clamp(t, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

export function noise1(t: number, seed = 0): number {
  return (
    0.5 * Math.sin(t * 1.0 + seed * 1.7) +
    0.3 * Math.sin(t * 2.3 + seed * 4.1 + 1.3) +
    0.2 * Math.sin(t * 4.7 + seed * 2.9 + 2.7)
  );
}
