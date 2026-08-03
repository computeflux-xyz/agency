/**
 * Möbius band geometry, shared by the server render and the client animation.
 *
 * WHY A LIBRARY AND NOT INLINE MATH: `MoebiusNav.astro` renders the band once at
 * build time (so the links exist, and the drawing is there before any JS runs)
 * and then re-renders it every frame in the browser to spin it. Both paths have
 * to agree exactly or the first frame would jump, so the parametrisation lives
 * here and is imported by both.
 *
 * The surface:
 *
 *   r(u, v) = R + v·cos(u/2)
 *   P(u, v) = ( r·cos u, r·sin u, v·sin(u/2) )      u ∈ [0, 2π), v ∈ [-hw, hw]
 *
 * The half-twist is the `u/2`: follow the band once round and the `v` axis comes
 * back inverted, which is the whole point — one edge, one side, no "other side"
 * to hide a link on. Each practice owns an equal arc of `u`, so the band is a
 * navigation surface rather than an illustration of one.
 *
 * Projection is orthographic: spin about the Z axis (the animated parameter),
 * then a fixed tilt about X, then drop Z. Orthographic keeps the far half the
 * same scale as the near half, so a segment does not become unclickable just
 * because it is at the back — depth only drives paint order and shading.
 */

export type Vec3 = { x: number; y: number; z: number };

export type MoebiusFacet = {
  /** Index of the segment this facet belongs to. */
  index: number;
  /** SVG path data for the filled quad strip. */
  d: string;
  /** Projected centroid, where the label goes. */
  cx: number;
  cy: number;
  /**
   * Mean depth in view space, normalised to about [-1, 1]. Higher is nearer the
   * viewer; used for paint order, shading and label legibility.
   */
  depth: number;
  /**
   * How square-on the facet faces the viewer, 0..1, from the projected area of
   * its quad relative to its unprojected size. An edge-on facet gets a dimmer
   * label because its text would be sitting on a sliver.
   */
  facing: number;
};

export type MoebiusOptions = {
  /** Number of clickable segments. */
  segments: number;
  /** Ring radius in view units. */
  radius: number;
  /** Half-width of the band. */
  halfWidth: number;
  /** Samples per segment along `u`. More = smoother silhouette. */
  steps: number;
  /** Gap between consecutive segments, as a fraction of one segment's arc. */
  gap: number;
  /** Fixed tilt about X, radians. */
  tilt: number;
  /** Spin about Z, radians — the animated parameter. */
  spin: number;
  /** Viewport centre and scale (view units → SVG units). */
  cx: number;
  cy: number;
  scale: number;
};

export const MOEBIUS_DEFAULTS: Omit<MoebiusOptions, "segments" | "spin"> = {
  radius: 1,
  /* Narrow on purpose: a wide band projects to a blob and the half-twist stops
     being legible. This is about as wide as it can get and still read as a
     ribbon that turns over. */
  halfWidth: 0.2,
  steps: 24,
  gap: 0.05,
  /* Tilt 0 looks straight down at the ring (a flat annulus — no twist visible);
     π/2 is dead edge-on (a line). 1.28 rad is where the half-twist reads: you see
     the near face, the far face turning over, and the crossing in the middle. */
  tilt: 1.28,
  cx: 0,
  cy: 0,
  scale: 1,
};

const TAU = Math.PI * 2;

/** Surface point, before any camera transform. */
function surface(u: number, v: number, radius: number): Vec3 {
  const r = radius + v * Math.cos(u / 2);
  return { x: r * Math.cos(u), y: r * Math.sin(u), z: v * Math.sin(u / 2) };
}

/** Spin about Z, then tilt about X. Returns view-space coordinates. */
function toView(p: Vec3, spin: number, tilt: number): Vec3 {
  const cs = Math.cos(spin);
  const ss = Math.sin(spin);
  const x = p.x * cs - p.y * ss;
  const y = p.x * ss + p.y * cs;

  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return { x, y: y * ct - p.z * st, z: y * st + p.z * ct };
}

const f = (v: number) => Number(v.toFixed(2));

/**
 * Build one facet per segment for a given pose.
 *
 * Facets are returned in segment order, NOT depth order: the caller decides what
 * to do about painting (the client script reorders DOM nodes, the server render
 * sorts a copy), because reordering the links themselves would scramble tab
 * order on every frame.
 */
export function moebiusFacets(options: MoebiusOptions): MoebiusFacet[] {
  const { segments, radius, halfWidth, steps, gap, tilt, spin, cx, cy, scale } = options;
  const arc = TAU / segments;
  const inset = (arc * gap) / 2;

  const facets: MoebiusFacet[] = [];

  for (let i = 0; i < segments; i += 1) {
    const u0 = i * arc + inset;
    const u1 = (i + 1) * arc - inset;

    const outer: { x: number; y: number }[] = [];
    const inner: { x: number; y: number }[] = [];
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let count = 0;

    for (let s = 0; s <= steps; s += 1) {
      const u = u0 + ((u1 - u0) * s) / steps;
      for (const [v, bucket] of [
        [halfWidth, outer],
        [-halfWidth, inner],
      ] as const) {
        const view = toView(surface(u, v, radius), spin, tilt);
        bucket.push({ x: cx + view.x * scale, y: cy + view.y * scale });
        sumX += cx + view.x * scale;
        sumY += cy + view.y * scale;
        sumZ += view.z;
        count += 1;
      }
    }

    /* One closed quad strip: down the outer edge, back along the inner one. */
    const ring = [...outer, ...inner.reverse()];
    const d = `M ${ring.map((p) => `${f(p.x)} ${f(p.y)}`).join(" L ")} Z`;

    /* Facing: the projected area of the strip against the area it would cover if
       it were square-on to the camera. The shoelace formula gives the signed
       area; a half-twisted band flips that sign as it turns, so take |area|. */
    let area2 = 0;
    for (let k = 0; k < ring.length; k += 1) {
      const a = ring[k];
      const b = ring[(k + 1) % ring.length];
      area2 += a.x * b.y - b.x * a.y;
    }
    const flat = Math.abs(area2 / 2);
    const full = (u1 - u0) * radius * 2 * halfWidth * scale * scale;
    const facing = full > 0 ? Math.min(1, flat / full) : 0;

    facets.push({
      index: i,
      d,
      cx: sumX / count,
      cy: sumY / count,
      depth: sumZ / count / Math.max(radius, 0.0001),
      facing,
    });
  }

  return facets;
}

/**
 * The band's edge, as ONE path.
 *
 * This is the fact the whole component is built on: a Möbius band has a single
 * boundary curve. Walk `v = +hw` all the way round and you arrive back at
 * `v = -hw`; walk again and you close the loop. So `u` runs over [0, 4π) and the
 * result is one continuous stroke, not two rings — worth drawing, because it is
 * the thing a reader would otherwise have to take on trust.
 */
export function moebiusEdge(options: MoebiusOptions): string {
  const { radius, halfWidth, steps, segments, tilt, spin, cx, cy, scale } = options;
  const total = Math.max(segments * steps * 2, 96);
  const points: string[] = [];

  for (let s = 0; s <= total; s += 1) {
    const u = (TAU * 2 * s) / total;
    /* `+hw` at u, which is the same point as `-hw` at u + 2π — the parametrisation
       already carries the flip, so nothing special happens at the seam. */
    const view = toView(surface(u, halfWidth, radius), spin, tilt);
    points.push(`${f(cx + view.x * scale)} ${f(cy + view.y * scale)}`);
  }

  return `M ${points.join(" L ")} Z`;
}
