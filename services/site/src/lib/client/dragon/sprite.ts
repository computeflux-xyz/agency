/**
 * Procedural dragon sprite-sheet.
 *
 * We draw a cute dragon frame-by-frame onto an offscreen 2D canvas and
 * upload the whole grid to the GPU once. At runtime the renderer just picks a
 * cell (column = wing-flap phase, row = mouth open/closed), so the "video-game
 * sprite" wing-flap and fire-breath cost nothing per frame beyond a UV swap.
 *
 * The dragon faces +x (right). The renderer flips it horizontally when flying
 * left. Design language matches the site: brand blue body, magenta wing
 * membrane, amber spines, and a crisp near-black "ink" outline like the
 * notched technical cards.
 */
import { COLORS, CONFIG, ROW, type RGB } from "./config";
import { TAU } from "./math";

const rgb = (c: RGB, a = 1): string =>
  `rgba(${(c[0] * 255) | 0},${(c[1] * 255) | 0},${(c[2] * 255) | 0},${a})`;

export interface Atlas {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  cols: number;
  rows: number;
  cell: number;
}

const INK = rgb(COLORS.ink);

function drawWing(
  ctx: CanvasRenderingContext2D,
  phase: number,
  far: boolean,
): void {
  const flap = Math.sin(phase * TAU); // -1 (down) .. 1 (up)
  const up = flap * 0.9;
  ctx.save();
  ctx.translate(-6, -10);
  ctx.rotate((far ? 0.15 : -0.05) - up * 0.62);
  if (far) {
    ctx.scale(0.82, 0.9); // foreshorten the far wing
    ctx.globalAlpha = 0.72;
  }

  const span = 62;
  const membrane = far ? COLORS.magenta : COLORS.magenta;
  const grad = ctx.createLinearGradient(0, -span, 0, span * 0.4);
  grad.addColorStop(0, rgb(membrane, 0.95));
  grad.addColorStop(1, rgb(COLORS.magenta, 0.62));

  // Membrane: a scalloped fan with three finger-tips.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-24, -span * 0.9, -8, -span);
  ctx.quadraticCurveTo(-2, -span * 0.7, 6, -span * 0.86);
  ctx.quadraticCurveTo(12, -span * 0.5, 24, -span * 0.62);
  ctx.quadraticCurveTo(26, -span * 0.28, 40, -span * 0.32);
  ctx.quadraticCurveTo(30, -6, 8, 6);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Wing "arm" bones.
  ctx.strokeStyle = rgb(COLORS.ink, 0.8);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.lineTo(-8, -span);
  ctx.moveTo(2, 0);
  ctx.lineTo(24, -span * 0.62);
  ctx.moveTo(2, 0);
  ctx.lineTo(40, -span * 0.32);
  ctx.stroke();
  ctx.restore();
}

function drawTail(ctx: CanvasRenderingContext2D, phase: number): void {
  const sway = Math.sin(phase * TAU + 1.1) * 8;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-24, 14);
  ctx.quadraticCurveTo(-58, 22 + sway, -74, 30 + sway * 1.4);
  ctx.quadraticCurveTo(-60, 30 + sway, -30, 30);
  ctx.closePath();
  ctx.fillStyle = rgb(COLORS.blueDeep);
  ctx.fill();
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Amber spade tip.
  const tx = -78,
    ty = 30 + sway * 1.4;
  ctx.beginPath();
  ctx.moveTo(tx + 10, ty - 12);
  ctx.lineTo(tx - 8, ty);
  ctx.lineTo(tx + 10, ty + 12);
  ctx.quadraticCurveTo(tx + 2, ty, tx + 10, ty - 12);
  ctx.closePath();
  ctx.fillStyle = rgb(COLORS.amber);
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();
}

function drawBody(ctx: CanvasRenderingContext2D): void {
  // Rounded body.
  const g = ctx.createRadialGradient(-18, -6, 6, -6, 10, 44);
  g.addColorStop(0, rgb(COLORS.blue));
  g.addColorStop(1, rgb(COLORS.blueDeep));
  ctx.beginPath();
  ctx.ellipse(-6, 10, 34, 30, 0, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Soft belly.
  ctx.beginPath();
  ctx.ellipse(-2, 22, 20, 16, -0.15, 0, TAU);
  ctx.fillStyle = rgb(COLORS.belly, 0.9);
  ctx.fill();

  // Belly plates.
  ctx.strokeStyle = rgb(COLORS.blueDeep, 0.45);
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(-16, 20 + i * 8);
    ctx.quadraticCurveTo(-2, 24 + i * 8, 12, 20 + i * 8);
    ctx.stroke();
  }

  // Little back spines (amber).
  ctx.fillStyle = rgb(COLORS.amber);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    const x = -22 + i * 12;
    const y = -14 - i * 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 6);
    ctx.lineTo(x, y - 7);
    ctx.lineTo(x + 5, y + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Tiny front leg.
  ctx.beginPath();
  ctx.ellipse(6, 36, 8, 10, 0.2, 0, TAU);
  ctx.fillStyle = rgb(COLORS.blueDeep);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function drawHead(ctx: CanvasRenderingContext2D, mouthOpen: boolean): void {
  const hx = 34,
    hy = -16;

  // Horns (behind head).
  ctx.fillStyle = rgb(COLORS.belly);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  for (const dx of [-6, 8]) {
    ctx.beginPath();
    ctx.moveTo(hx + dx - 3, hy - 18);
    ctx.quadraticCurveTo(hx + dx + 2, hy - 30, hx + dx + 8, hy - 30);
    ctx.quadraticCurveTo(hx + dx + 3, hy - 22, hx + dx + 4, hy - 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Head.
  const g = ctx.createRadialGradient(hx - 8, hy - 8, 4, hx, hy, 30);
  g.addColorStop(0, rgb(COLORS.blue));
  g.addColorStop(1, rgb(COLORS.blueDeep));
  ctx.beginPath();
  ctx.ellipse(hx, hy, 26, 24, 0, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Snout / jaw.
  if (mouthOpen) {
    // Open mouth: inner throat glow + lower jaw dropped.
    ctx.beginPath();
    ctx.moveTo(hx + 14, hy - 4);
    ctx.quadraticCurveTo(hx + 40, hy - 2, hx + 42, hy + 6);
    ctx.quadraticCurveTo(hx + 30, hy + 26, hx + 12, hy + 18);
    ctx.closePath();
    const mg = ctx.createRadialGradient(hx + 30, hy + 8, 2, hx + 26, hy + 8, 22);
    mg.addColorStop(0, rgb(COLORS.amber));
    mg.addColorStop(0.6, rgb(COLORS.ember));
    mg.addColorStop(1, rgb(COLORS.emberDeep, 0.9));
    ctx.fillStyle = mg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.stroke();
    // Upper snout.
    ctx.beginPath();
    ctx.moveTo(hx + 12, hy - 6);
    ctx.quadraticCurveTo(hx + 40, hy - 12, hx + 44, hy - 2);
    ctx.quadraticCurveTo(hx + 34, hy - 2, hx + 14, hy);
    ctx.closePath();
    ctx.fillStyle = rgb(COLORS.blue);
    ctx.fill();
    ctx.stroke();
  } else {
    // Closed snout with a friendly smile.
    ctx.beginPath();
    ctx.moveTo(hx + 12, hy - 8);
    ctx.quadraticCurveTo(hx + 42, hy - 6, hx + 44, hy + 2);
    ctx.quadraticCurveTo(hx + 40, hy + 12, hx + 16, hy + 10);
    ctx.closePath();
    ctx.fillStyle = rgb(COLORS.blue);
    ctx.fill();
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = INK;
    ctx.stroke();
    // Smile + nostril.
    ctx.beginPath();
    ctx.moveTo(hx + 40, hy + 4);
    ctx.quadraticCurveTo(hx + 30, hy + 10, hx + 20, hy + 6);
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(hx + 40, hy - 2, 1.8, 2.4, 0, 0, TAU);
    ctx.fillStyle = INK;
    ctx.fill();
  }

  // Big cute eye.
  ctx.beginPath();
  ctx.ellipse(hx + 4, hy - 4, 8.5, 10, 0, 0, TAU);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(hx + 6, hy - 3, 4.2, 5.4, 0, 0, TAU);
  ctx.fillStyle = INK;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx + 4.5, hy - 5, 1.8, 0, TAU);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // Cheek blush.
  ctx.beginPath();
  ctx.ellipse(hx - 6, hy + 8, 6, 4, 0, 0, TAU);
  ctx.fillStyle = rgb(COLORS.magenta, 0.28);
  ctx.fill();
}

/** Draw one complete dragon frame centred at (0,0) in the current transform. */
function drawSide(
  ctx: CanvasRenderingContext2D,
  phase: number,
  mouthOpen: boolean,
): void {
  drawWing(ctx, phase, true); // far wing (behind body)
  drawTail(ctx, phase);
  drawBody(ctx);
  drawHead(ctx, mouthOpen);
  drawWing(ctx, phase, false); // near wing (in front)
}

/** One symmetric wing for the head-on / tail-on poses, pivoting outward. */
function drawSymWing(
  ctx: CanvasRenderingContext2D,
  side: number, // -1 left, +1 right
  flap: number, // -1..1
  membrane: RGB,
): void {
  ctx.save();
  ctx.translate(side * 20, -14);
  ctx.rotate(side * (0.35 - flap * 0.55));
  const span = 52;
  const grad = ctx.createLinearGradient(0, 0, side * span, -span * 0.3);
  grad.addColorStop(0, rgb(membrane, 0.95));
  grad.addColorStop(1, rgb(COLORS.magenta, 0.6));
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(side * span * 0.5, -span * 0.9, side * span, -span * 0.5);
  ctx.quadraticCurveTo(side * span * 0.9, -span * 0.2, side * span * 0.96, span * 0.02);
  ctx.quadraticCurveTo(side * span * 0.6, span * 0.06, side * span * 0.5, span * 0.16);
  ctx.quadraticCurveTo(side * span * 0.34, span * 0.04, 0, span * 0.1);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();
}

function drawFront(ctx: CanvasRenderingContext2D, phase: number): void {
  const flap = Math.sin(phase * TAU);
  drawSymWing(ctx, -1, flap, COLORS.magenta);
  drawSymWing(ctx, 1, flap, COLORS.magenta);

  ctx.beginPath();
  ctx.moveTo(-6, 30);
  ctx.quadraticCurveTo(2, 46 + flap * 3, 12, 40);
  ctx.quadraticCurveTo(4, 36, -2, 30);
  ctx.closePath();
  ctx.fillStyle = rgb(COLORS.blueDeep);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();

  const g = ctx.createRadialGradient(0, -4, 6, 0, 6, 44);
  g.addColorStop(0, rgb(COLORS.blue));
  g.addColorStop(1, rgb(COLORS.blueDeep));
  ctx.beginPath();
  ctx.ellipse(0, 8, 30, 32, 0, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // belly
  ctx.beginPath();
  ctx.ellipse(0, 14, 17, 20, 0, 0, TAU);
  ctx.fillStyle = rgb(COLORS.belly, 0.92);
  ctx.fill();

  // two little arms
  ctx.fillStyle = rgb(COLORS.blueDeep);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * 22, 20, 7, 9, s * 0.3, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  // head
  const hg = ctx.createRadialGradient(0, -26, 4, 0, -22, 26);
  hg.addColorStop(0, rgb(COLORS.blue));
  hg.addColorStop(1, rgb(COLORS.blueDeep));
  ctx.beginPath();
  ctx.ellipse(0, -22, 22, 20, 0, 0, TAU);
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // horns
  ctx.fillStyle = rgb(COLORS.belly);
  ctx.lineWidth = 2.4;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 12, -36);
    ctx.quadraticCurveTo(s * 20, -48, s * 24, -46);
    ctx.quadraticCurveTo(s * 16, -40, s * 15, -32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // two forward eyes
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * 8, -24, 6, 7.5, 0, 0, TAU);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 8 + 1, -23, 3, 0, TAU);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 8, -25, 1.3, 0, TAU);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }

  // little smile
  ctx.beginPath();
  ctx.moveTo(-7, -12);
  ctx.quadraticCurveTo(0, -7, 7, -12);
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = INK;
  ctx.stroke();
  // blush
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * 15, -15, 4.5, 3, 0, 0, TAU);
    ctx.fillStyle = rgb(COLORS.magenta, 0.26);
    ctx.fill();
  }
}

function drawBack(ctx: CanvasRenderingContext2D, phase: number): void {
  const flap = Math.sin(phase * TAU);
  drawSymWing(ctx, -1, flap, COLORS.magenta);
  drawSymWing(ctx, 1, flap, COLORS.magenta);

  // tail toward viewer (longer, centred, with amber spade)
  ctx.beginPath();
  ctx.moveTo(-9, 22);
  ctx.quadraticCurveTo(-6, 48 + flap * 2, 0, 58 + flap * 3);
  ctx.quadraticCurveTo(6, 48, 9, 22);
  ctx.closePath();
  ctx.fillStyle = rgb(COLORS.blueDeep);
  ctx.fill();
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.beginPath();
  const ty = 60 + flap * 3;
  ctx.moveTo(-11, ty - 10);
  ctx.lineTo(0, ty + 8);
  ctx.lineTo(11, ty - 10);
  ctx.quadraticCurveTo(0, ty - 4, -11, ty - 10);
  ctx.closePath();
  ctx.fillStyle = rgb(COLORS.amber);
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // rounded back
  const g = ctx.createRadialGradient(0, 0, 6, 0, 6, 44);
  g.addColorStop(0, rgb(COLORS.blue));
  g.addColorStop(1, rgb(COLORS.blueDeep));
  ctx.beginPath();
  ctx.ellipse(0, 8, 30, 32, 0, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // spine ridge (amber) down the back
  ctx.fillStyle = rgb(COLORS.amber);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    const y = -14 + i * 12;
    ctx.beginPath();
    ctx.moveTo(-5, y + 6);
    ctx.lineTo(0, y - 5);
    ctx.lineTo(5, y + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // back of head + horns (no face)
  const hg = ctx.createRadialGradient(0, -24, 4, 0, -20, 24);
  hg.addColorStop(0, rgb(COLORS.blue));
  hg.addColorStop(1, rgb(COLORS.blueDeep));
  ctx.beginPath();
  ctx.ellipse(0, -20, 20, 18, 0, 0, TAU);
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = rgb(COLORS.belly);
  ctx.lineWidth = 2.4;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 10, -34);
    ctx.quadraticCurveTo(s * 18, -46, s * 22, -44);
    ctx.quadraticCurveTo(s * 14, -38, s * 13, -30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawSleep(ctx: CanvasRenderingContext2D, phase: number): void {
  const breath = 1 + Math.sin(phase * TAU) * 0.02;
  ctx.save();
  ctx.scale(breath, 1 / breath);

  // Tail hooks up-and-over at the top (the "hanger").
  ctx.beginPath();
  ctx.moveTo(-6, -44);
  ctx.quadraticCurveTo(-26, -54, -20, -34);
  ctx.quadraticCurveTo(-14, -20, -4, -18);
  ctx.quadraticCurveTo(-10, -30, 2, -34);
  ctx.quadraticCurveTo(0, -44, -6, -44);
  ctx.closePath();
  ctx.fillStyle = rgb(COLORS.blueDeep);
  ctx.fill();
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Folded wings (small, tucked).
  ctx.save();
  ctx.translate(-10, -6);
  ctx.rotate(-0.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-22, 6, -26, 26);
  ctx.quadraticCurveTo(-10, 18, 2, 14);
  ctx.closePath();
  ctx.fillStyle = rgb(COLORS.magenta, 0.85);
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();

  // Body dangling below.
  const g = ctx.createRadialGradient(-6, -8, 6, 0, 4, 40);
  g.addColorStop(0, rgb(COLORS.blue));
  g.addColorStop(1, rgb(COLORS.blueDeep));
  ctx.beginPath();
  ctx.ellipse(0, 6, 28, 30, 0, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(2, 14, 16, 15, 0, 0, TAU);
  ctx.fillStyle = rgb(COLORS.belly, 0.9);
  ctx.fill();

  // Head tucked at the bottom, eyes closed.
  const hg = ctx.createRadialGradient(6, 24, 3, 8, 28, 22);
  hg.addColorStop(0, rgb(COLORS.blue));
  hg.addColorStop(1, rgb(COLORS.blueDeep));
  ctx.beginPath();
  ctx.ellipse(8, 28, 20, 18, 0.2, 0, TAU);
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  // horns
  ctx.fillStyle = rgb(COLORS.belly);
  ctx.lineWidth = 2.2;
  for (const dx of [-2, 10]) {
    ctx.beginPath();
    ctx.moveTo(8 + dx, 12);
    ctx.quadraticCurveTo(6 + dx, 2, 12 + dx, 0);
    ctx.quadraticCurveTo(12 + dx, 8, 16 + dx, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // closed happy eyes (downward arcs) + peaceful mouth
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  for (const ex of [2, 16]) {
    ctx.beginPath();
    ctx.moveTo(ex - 4, 26);
    ctx.quadraticCurveTo(ex, 30, ex + 4, 26);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(12, 34, 3.2, 0.1 * TAU, 0.4 * TAU);
  ctx.stroke();

  // z z z drifting up-right
  ctx.fillStyle = rgb(COLORS.ink, 0.75);
  ctx.font = "700 12px 'JetBrains Mono', monospace";
  ctx.fillText("z", 26, -2);
  ctx.font = "700 15px 'JetBrains Mono', monospace";
  ctx.fillText("z", 34, -14);
  ctx.font = "700 19px 'JetBrains Mono', monospace";
  ctx.fillText("z", 44, -30);
  ctx.restore();
}

export function buildAtlas(): Atlas {
  const cols = CONFIG.flapFrames;
  const rows = CONFIG.atlasRows;
  const cell = CONFIG.atlasCell;

  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(cell * cols, cell * rows)
      : Object.assign(document.createElement("canvas"), {
          width: cell * cols,
          height: cell * rows,
        });
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const phase = col / cols;
      ctx.save();
      // Centre the dragon in its cell, nudged so the wingspan fits when up.
      ctx.translate(col * cell + cell / 2, row * cell + cell * 0.56);
      switch (row) {
        case ROW.sideClosed:
          drawSide(ctx, phase, false);
          break;
        case ROW.sideOpen:
          drawSide(ctx, phase, true);
          break;
        case ROW.front:
          drawFront(ctx, phase);
          break;
        case ROW.back:
          drawBack(ctx, phase);
          break;
        case ROW.sleep:
          drawSleep(ctx, phase);
          break;
      }
      ctx.restore();
    }
  }

  return { canvas, cols, rows, cell };
}
