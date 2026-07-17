/**
 * Central tunables for the dragon. Kept in one place so the whole creature can
 * be re-balanced without spelunking through the behaviour code.
 */

export type RGB = readonly [number, number, number];

export const COLORS = {
  ink: [0x20 / 255, 0x1f / 255, 0x1e / 255] as RGB, // #201f1e outline
  blue: [0x2f / 255, 0x6b / 255, 0xff / 255] as RGB, // #2f6bff body
  blueDeep: [0x1e / 255, 0x45 / 255, 0xc4 / 255] as RGB,
  magenta: [0xe1 / 255, 0x1f / 255, 0xd0 / 255] as RGB, // #e11fd0 wings
  amber: [0xff / 255, 0xc4 / 255, 0x0f / 255] as RGB, // #ffc40f accents / fire core
  ember: [0xff / 255, 0x6a / 255, 0x18 / 255] as RGB, // fire mid
  emberDeep: [0xd0 / 255, 0x1f / 255, 0x2a / 255] as RGB, // fire edge (reads on light paper)
  belly: [0xdb / 255, 0xe4 / 255, 0xff / 255] as RGB, // #dbe4ff soft belly
} as const;

/**
 * Sprite atlas rows : one pose per row, `flapFrames` columns of wing-phase each.
 *   side (closed/open) = the default profile view (fire-breathing uses "open")
 *   front = facing the viewer (flying toward us / surfacing to the forefront)
 *   back  = facing away (receding into the background / diving into a portal)
 *   sleep = eyes-closed perched pose (hangs by its tail, dozing)
 */
export const ROW = {
  sideClosed: 0,
  sideOpen: 1,
  front: 2,
  back: 3,
  sleep: 4,
} as const;


export const CONFIG = {
  maxDPR: 1.5,

  dragonSize: 104,

  flapFrames: 8,
  atlasRows: 5,
  atlasCell: 176,

  cruiseSpeed: 200,
  dashSpeed: 760,
  maxForce: 1500,
  arriveRadius: 150,

  /** Wing-flap cadence scales with speed */
  flapHzMin: 1.5,
  flapHzMax: 6.0,

  /** Body life: vertical bob + banking. */
  bobAmpl: 5,
  bobHz: 1.05,
  maxBank: 0.4,

  /** How long the dragon lingers "showcasing" one focused element (s). */
  showcaseMin: 2.4,
  showcaseMax: 4.8,
  /** Cooldown before the same element can be showcased again (s). */
  revisitCooldown: 10,

  /** Odds the dragon perches by its tail on a heading and dozes off. */
  sleepChance: 0.8,
  sleepMin: 10,
  sleepMax: 30,

  /** Paper-rip timings. A cut line first draws itself across (a directional
   *  sweep), then the tear parts open. Closing reverses both. `maxRadius` is
   *  the fully-open GAP height (CSS px). */
  portal: {
    line: 0.34,
    open: 0.42,
    close: 0.42,
    maxRadius: 108,
  },

  /** Odds (per decision) of the theatrical portal exit / recede. Kept low so
   *  the dragon stays present and attention-drawing far more than it hides. */
  exitChance: 0.12,
  /** Odds of using the quick top-layer "surface" pass (comes to the forefront,
   *  facing the viewer). No speed boost, it glides forward calmly. */
  surfaceChance: 0.32,

  /** Keep the whole creature out of the sticky-header band (CSS px from top):
   *  header is 4.5rem (72px) + margin, and its backdrop-blur would frost us. */
  headerSafe: 96,
  /** Margin kept from the other viewport edges while cruising (CSS px). */
  edgeMargin: 40,

  /** Fire: a smooth, continuous warm plume. Never a white peak or a strobing
   *  burst: luminance changes stay gradual, area bounded. */
  fire: {
    maxParticles: 220,
    spawnPerSec: 240,
    speed: 480,
    spread: 0.32, // cone half-angle (radians)
    life: 0.6, // seconds
    sizeStart: 24,
    sizeEnd: 3,
    /** Seconds the dragon breathes at a target per visit. */
    burstMin: 0.7,
    burstMax: 1.3,
    /** Heat a burn-target must absorb before it chars (~seconds of fire). */
    burnThreshold: 0.55,
  },

  /** Auto-detected "important" text is anything whose computed font-size is
   *  at least this many CSS px (headings, hero, stat numbers). */
  importantFontPx: 30,

  /** Focal point for "what is the reader looking at": fraction down the
   *  viewport where the eye tends to rest while scrolling. */
  focalY: 0.4,

  /** Never target/scorch within this radius (CSS px) of a call-to-action or
   *  form control, the dragon must never obscure the conversion path. */
  ctaKeepout: 120,

  /** Device gate (see index.ts): the feature runs on hover-capable viewports
   *  at least this wide. Touch phones and reduced-motion users are excluded. */
  minViewport: 768,
} as const;

/** Selector for interactive / conversion elements the dragon must avoid. */
export const CTA_SELECTOR =
  'a[href="/book"], a[href="/contact"], a[href^="mailto:"], button, [role="button"], input, textarea, select, label';
