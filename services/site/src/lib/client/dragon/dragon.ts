/**
 * The dragon's brain: a small finite-state machine over steering behaviours,
 * plus the mapping from motion to sprite frames (flap cadence, banking, facing,
 * body bob) that makes it read as alive.
 *
 * Layers and facing:
 *   - It lives on the behind (WebGL) plane while gliding between the paper and
 *     the content, wreathing important text in protective fire.
 *   - It hops to the top (2D) plane to come to the forefront (facing the
 *     viewer, `front` pose) for a calm "surface" pass, and to dive through a
 *     portal (facing away, `back` pose) when it leaves, then emerges from a
 *     new portal facing the viewer again. No fading, ever: appearance and
 *     disappearance are done by scaling into / out of the rift.
 *   - It can perch by its tail on a heading and doze (`sleep`). A click wakes it.
 *
 * The whole creature also drifts with the page as you scroll, so it feels
 * physically present in the document rather than pinned to the glass.
 */
import { CONFIG, ROW } from "./config";
import type { Fire } from "./fire";
import { angleToBox } from "./fire";
import type { Portal } from "./portal";
import type { TargetRegistry } from "./targets";
import type { Box, Target, Viewport } from "./types";
import { angleDelta, clamp, damp, lerp, noise1, rand, TAU } from "./math";

type State =
  | "portalIn"
  | "drift"
  | "approach"
  | "showcase"
  | "breathe"
  | "surface"
  | "sleep"
  | "portalOut"
  | "gone";

export interface RenderCmd {
  layer: "behind" | "top" | "rip";
  col: number;
  row: number;
  x: number;
  y: number;
  size: number;
  rot: number;
  flip: boolean;
  alpha: number;
}

const SHIELD_CLASS = "dragon-shield";

export class Dragon {
  private x = 0;
  private y = 0;
  private vx = 0;
  private vy = 0;
  private gx = 0; // goal
  private gy = 0;
  private size = CONFIG.dragonSize;

  private state: State = "portalIn";
  private stateT = 0; // seconds in current state
  private stateDur = 0; // planned duration where relevant
  private flap = Math.random();
  private mouth = 0; // 0..1 openness
  private alpha = 1; // never fades. Disappearance is via portal + scale
  private scale = 0;
  private heat = 0;
  private shielded: HTMLElement | null = null;
  private target: Target | null = null;
  private surfacedOnce = false;
  private seed = Math.random() * 100;

  // Portal handshake (armed once per portal state. Closed once at travel end).
  private portalArmed = false;
  private portalClosing = false;
  private portalEntering = false; // portalOut: has the dragon reached the rift?
  private px0 = 0; // portal centre
  private py0 = 0;
  private ripCX = 0; // rip "cross" unit (dive direction): (0,1) h, (1,0) v
  private ripCY = 1;

  // Sleep / perch. The anchor is stored relative to the element so the dragon
  // stays hooked to it (moving with the page) as you scroll.
  private sleepSettled = false;
  private sleepEdge: "top" | "bottom" = "bottom";
  private sleepAnchorFracX = 0.5; // where along the element's width it hooked
  private sleepAnchorOffY = 0; // offset from that edge

  // Scroll-follow.
  private lastScrollX = 0;
  private lastScrollY = 0;
  private lastVp: Viewport;

  /** Set when the dragon wants a burn kicked off. Index consumes it once. */
  burnRequest: Target | null = null;

  /** Dev introspection (window.__fluxDragon.debug()). */
  get info(): Record<string, unknown> {
    return {
      state: this.state,
      x: Math.round(this.x),
      y: Math.round(this.y),
      scale: +this.scale.toFixed(2),
      sleeping: this.isSleeping(),
      target: this.target?.el.textContent?.slice(0, 32) ?? null,
    };
  }

  constructor(vp: Viewport) {
    this.lastVp = vp;
    this.lastScrollX = vp.scrollX;
    this.lastScrollY = vp.scrollY;
    const p = this.chooseBandPoint(vp);
    this.x = p.x;
    this.y = p.y;
    this.go("portalIn"); // emerge from a rift on first appearance
  }

  private band(vp: Viewport) {
    const h = this.size * 0.5;
    return {
      xMin: CONFIG.edgeMargin + h,
      xMax: vp.w - CONFIG.edgeMargin - h,
      yMin: CONFIG.headerSafe + h,
      yMax: vp.h - CONFIG.edgeMargin - h,
    };
  }

  private chooseBandPoint(vp: Viewport): { x: number; y: number } {
    const b = this.band(vp);
    return { x: rand(b.xMin, b.xMax), y: rand(b.yMin, b.yMax) };
  }

  private go(state: State, dur = 0): void {
    this.state = state;
    this.stateT = 0;
    this.stateDur = dur;
    this.portalArmed = false;
    this.portalClosing = false;
    this.portalEntering = false;
  }

  private newDriftGoal(vp: Viewport): void {
    const p = this.chooseBandPoint(vp);
    this.gx = p.x;
    this.gy = p.y;
  }

  private setShield(el: HTMLElement | null): void {
    if (this.shielded === el) return;
    this.shielded?.classList.remove(SHIELD_CLASS);
    this.shielded = el;
    el?.classList.add(SHIELD_CLASS);
  }

  /** Remove any lingering visual side-effects (called on pause/teardown). */
  clearTransient(): void {
    this.setShield(null);
  }

  /** Public: is the dragon currently perched and asleep? */
  isSleeping(): boolean {
    return this.state === "sleep" && this.sleepSettled;
  }

  /** Public: viewport position (for click hit-testing). */
  pos(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /** Public: wake from sleep and resume flying. */
  wake(): void {
    if (!this.isSleeping()) return;
    this.sleepSettled = false;
    this.setShield(null);
    this.target = null;
    this.go("drift");
    this.newDriftGoal(this.lastVp);
    // A little startle-hop so the wake reads clearly.
    this.vy = -160;
  }

  private targetBox(reg: TargetRegistry, vp: Viewport): Box | null {
    return this.target ? reg.vpBox(this.target, vp) : null;
  }

  /** Approach point beside a target, kept inside the flight band. */
  private besideBox(b: Box, vp: Viewport): { x: number; y: number } {
    const band = this.band(vp);
    const cy = clamp(b.y + b.h / 2, band.yMin, band.yMax);
    const leftRoom = b.x - band.xMin;
    const rightRoom = band.xMax - (b.x + b.w);
    const onLeft = leftRoom > rightRoom;
    const gx = onLeft
      ? clamp(b.x - this.size * 0.75, band.xMin, band.xMax)
      : clamp(b.x + b.w + this.size * 0.75, band.xMin, band.xMax);
    return { x: gx, y: cy };
  }

  private steer(dt: number, speed: number): void {
    const dx = this.gx - this.x;
    const dy = this.gy - this.y;
    const d = Math.hypot(dx, dy) || 1;
    const arrive = d < CONFIG.arriveRadius ? d / CONFIG.arriveRadius : 1;
    const tvx = (dx / d) * speed * arrive;
    const tvy = (dy / d) * speed * arrive;
    const maxStep = CONFIG.maxForce * dt;
    this.vx += clamp(tvx - this.vx, -maxStep, maxStep);
    this.vy += clamp(tvy - this.vy, -maxStep, maxStep);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  update(dt: number, now: number, vp: Viewport, reg: TargetRegistry, fire: Fire, portal: Portal): RenderCmd {
    this.stateT += dt;
    this.lastVp = vp;
    this.burnRequest = null;
    let speed: number = CONFIG.cruiseSpeed;
    let breathing = false;
    let mouthWant = 0;
    let layer: "behind" | "top" | "rip" = "behind";
    fire.setDeflect(null);

    // scroll-follow: keep the creature anchored to the page as it moves
    const dsx = vp.scrollX - this.lastScrollX;
    const dsy = vp.scrollY - this.lastScrollY;
    this.lastScrollX = vp.scrollX;
    this.lastScrollY = vp.scrollY;
    const flyingScroll =
      this.state === "drift" ||
      this.state === "approach" ||
      this.state === "showcase" ||
      this.state === "breathe" ||
      this.state === "surface";
    const portalScroll = this.state === "portalIn" || this.state === "portalOut";
    if ((flyingScroll || portalScroll) && (dsx || dsy)) {
      this.x -= dsx;
      this.y -= dsy;
      this.gx -= dsx;
      this.gy -= dsy;
      if (portalScroll) {
        // The rip is torn into the background paper, it scrolls with it, and
        // the diving dragon rides along.
        this.px0 -= dsx;
        this.py0 -= dsy;
      }
    }
    // Sleep is handled separately: it stays rigidly hooked to its element.

    const b = this.band(vp);
    const tb = this.targetBox(reg, vp);
    // Drop a target that scrolled away or got detached. A settled sleeper is
    // exempt: it naps at a fixed viewport spot and ignores the scrolling page.
    if (this.target && (!tb || !reg.isOnScreen(this.target, vp))) {
      const settledSleep = this.state === "sleep" && this.sleepSettled;
      if (
        !settledSleep &&
        (this.state === "approach" ||
          this.state === "showcase" ||
          this.state === "breathe" ||
          this.state === "sleep")
      ) {
        this.setShield(null);
        this.sleepSettled = false;
        this.target = null;
        this.go("drift");
        this.newDriftGoal(vp);
      }
    }

    switch (this.state) {
      case "portalIn": {
        // Emerge head-first out of a rip onto the paper, no fade.
        layer = "rip";
        if (!this.portalArmed) {
          const vertical = Math.random() < 0.4;
          this.ripCX = vertical ? 1 : 0;
          this.ripCY = vertical ? 0 : 1;
          const pp = this.chooseBandPoint(vp);
          this.px0 = pp.x;
          this.py0 = pp.y;
          // Start beneath the paper (beyond the near lip, clipped away).
          this.x = pp.x + this.ripCX * this.size * 0.95;
          this.y = pp.y + this.ripCY * this.size * 0.95;
          this.vx = 0;
          this.vy = 0;
          this.scale = 1;
          portal.openAt(pp.x, pp.y, vertical ? "v" : "h");
          this.portalArmed = true;
        }

        portal.setCenter(this.px0, this.py0); // stay pinned to the scrolling paper
        // Signed distance from the tear centre along the dive ("cross") axis.
        const proj = (this.x - this.px0) * this.ripCX + (this.y - this.py0) * this.ripCY;
        const outX = this.px0 - this.ripCX * this.size * 1.7;
        const outY = this.py0 - this.ripCY * this.size * 1.7;
        const holdX = this.px0 + this.ripCX * this.size * 0.95;
        const holdY = this.py0 + this.ripCY * this.size * 0.95;
        if (!this.portalClosing) {
          if (portal.openFraction < 0.5) {
            this.gx = holdX; // wait under the paper until the tear parts
            this.gy = holdY;
            speed = CONFIG.cruiseSpeed * 0.4;
          } else {
            this.gx = outX; // climb out, head-first
            this.gy = outY;
            speed = CONFIG.cruiseSpeed;
          }

          if ((proj <= -this.size * 0.7 && portal.openFraction > 0.9) || this.stateT > 3.6) {
            portal.beginClose();
            this.portalClosing = true;
          }
        } else {
          this.gx = outX;
          this.gy = outY;
          speed = CONFIG.cruiseSpeed;
          if (!portal.active) {
            this.go("drift");
            this.newDriftGoal(vp);
          }
        }

        break;
      }
      case "drift": {
        const reached = Math.hypot(this.gx - this.x, this.gy - this.y) < 34;
        if (reached || this.stateT > 3.2) {
          const t = reg.pickFocus(now, vp);
          const r = Math.random();
          if (t && r < 0.74) {
            this.target = t;
            this.surfacedOnce = false;
            this.go("approach");
          } else if (r < 0.74 + CONFIG.exitChance) {
            this.go("portalOut");
          } else {
            this.newDriftGoal(vp);
          }
        }

        break;
      }
      case "approach": {
        if (tb) {
          const p = this.besideBox(tb, vp);
          this.gx = p.x;
          this.gy = p.y;
          speed = CONFIG.cruiseSpeed * 1.35;
          if (Math.hypot(this.gx - this.x, this.gy - this.y) < 40) {
            if (this.target!.kind === "burn") {
              this.heat = 0;
              this.go("breathe", rand(CONFIG.fire.burstMin, CONFIG.fire.burstMax) + CONFIG.fire.burnThreshold);
            } else {
              this.go("showcase", rand(CONFIG.showcaseMin, CONFIG.showcaseMax));
            }
          }
        }

        break;
      }
      case "showcase": {
        if (tb) {
          // Hover beside the heading. Breathe protective fire in gentle puffs.
          const p = this.besideBox(tb, vp);
          this.gx = p.x + Math.sin(now * 1.3 + this.seed) * 26;
          this.gy = p.y + Math.cos(now * 1.7 + this.seed) * 16;
          speed = CONFIG.cruiseSpeed * 0.8;
          const puff = (Math.sin(now * 2.2 + this.seed) + 1) / 2; // 0..1
          if (puff > 0.35) {
            breathing = true;
            mouthWant = 1;
            const infl: Box = { x: tb.x - 10, y: tb.y - 8, w: tb.w + 20, h: tb.h + 16 };
            fire.setDeflect(infl);
            this.setShield(this.target!.el);
          }

          // A single quick, calm "surface" pop to the forefront per visit.
          if (!this.surfacedOnce && this.stateT > 0.8 && Math.random() < CONFIG.surfaceChance * dt * 4) {
            this.surfacedOnce = true;
            this.go("surface", 0.9);
          } else if (this.stateT > this.stateDur) {
            this.target!.lastVisit = now;
            this.setShield(null);
            const r = Math.random();
            if (r < CONFIG.sleepChance) {
              // Doze off, hanging by its tail from this heading's top or bottom
              // edge. Pick an edge that leaves room within the flight band.
              const roomBelow = tb.y + tb.h + this.size * 0.7 < vp.h - CONFIG.edgeMargin;
              const roomTop = tb.y > CONFIG.headerSafe + this.size * 0.15;
              if (roomTop && (Math.random() < 0.5 || !roomBelow)) this.sleepEdge = "top";
              else if (roomBelow) this.sleepEdge = "bottom";
              else this.sleepEdge = "top";
              this.go("sleep", rand(CONFIG.sleepMin, CONFIG.sleepMax));
            } else if (r < CONFIG.sleepChance + CONFIG.exitChance) {
              this.target = null;
              this.go("portalOut");
            } else {
              this.target = null;
              this.go("drift");
              this.newDriftGoal(vp);
            }
          }
        }

        break;
      }

      case "breathe": {
        if (tb) {
          const p = this.besideBox(tb, vp);
          this.gx = p.x;
          this.gy = p.y;
          speed = CONFIG.cruiseSpeed * 0.5;
          breathing = true;
          mouthWant = 1;
          this.heat += dt;
          if (this.heat >= CONFIG.fire.burnThreshold && this.target!.burn === "restored") {
            this.burnRequest = this.target!; // index kicks off the burn once
          }

          if (this.stateT > this.stateDur) {
            this.target!.lastVisit = now;
            this.target = null;
            this.go("drift");
            this.newDriftGoal(vp);
          }
        }

        break;
      }
      case "surface": {
        // Come to the forefront, facing the viewer, at a calm glide (no dash).
        layer = "top";
        if (tb) {
          this.gx = clamp(tb.x + tb.w / 2, b.xMin, b.xMax);
          this.gy = clamp(tb.y - this.size * 0.15, b.yMin, b.yMax);
        }

        speed = CONFIG.cruiseSpeed;
        if (this.stateT > this.stateDur) {
          this.go("showcase", rand(CONFIG.showcaseMin * 0.6, CONFIG.showcaseMax * 0.6));
        }

        break;
      }
      case "sleep": {
        // Hang by the tail from the target's top or bottom edge and doze.
        // Top-edge hangs read best on the forefront (in front of the content),
        // bottom-edge hangs dangle in the gutter on the behind plane.
        layer = this.sleepEdge === "top" ? "top" : "behind";
        if (!this.sleepSettled && tb) {
          // Fly to the perch on the element's edge.
          const edgeY = this.sleepEdge === "top" ? tb.y : tb.y + tb.h;
          const hookX = clamp(tb.x + tb.w * 0.5, b.xMin, b.xMax);
          const hookY = clamp(edgeY + this.size * 0.3, b.yMin + this.size * 0.2, b.yMax);
          this.gx = hookX;
          this.gy = hookY;
          speed = CONFIG.cruiseSpeed * 0.7;
          if (Math.hypot(hookX - this.x, hookY - this.y) < 12) {
            this.sleepSettled = true;
            // Store the anchor relative to the element, so it stays hooked and
            // moves with the element as the page scrolls.
            this.sleepAnchorFracX = tb.w > 1 ? clamp((this.x - tb.x) / tb.w, 0, 1) : 0.5;
            this.sleepAnchorOffY = this.y - edgeY;
          }
        } else if (this.sleepSettled && tb) {
          // Rigidly anchored to the element, follows it exactly on scroll.
          const edgeY = this.sleepEdge === "top" ? tb.y : tb.y + tb.h;
          this.x = tb.x + this.sleepAnchorFracX * tb.w;
          this.y = edgeY + this.sleepAnchorOffY;
          this.gx = this.x;
          this.gy = this.y;
          this.vx = 0;
          this.vy = 0;
          if (this.stateT > this.stateDur) {
            this.sleepSettled = false;
            this.target = null;
            this.go("drift");
            this.newDriftGoal(vp);
          }
        }

        break;
      }
      case "portalOut": {
        // Fly to a rip, dive head-first through it and slip under the wallpaper
        // (clipped) no fade, then it seals behind us.
        layer = "rip";
        if (!this.portalArmed) {
          const vertical = Math.random() < 0.4;
          this.ripCX = vertical ? 1 : 0;
          this.ripCY = vertical ? 0 : 1;
          const px = clamp(this.x + this.ripCX * 150, b.xMin, b.xMax);
          const py = clamp(this.y + this.ripCY * 150, b.yMin + (this.ripCY ? 70 : 0), b.yMax);
          this.px0 = px;
          this.py0 = py;
          portal.openAt(px, py, vertical ? "v" : "h");
          this.portalArmed = true;
          this.scale = 1;
        }

        portal.setCenter(this.px0, this.py0);
        const proj = (this.x - this.px0) * this.ripCX + (this.y - this.py0) * this.ripCY;
        const underProj = this.size * 0.9; // fully beneath the near lip
        const approachX = this.px0 - this.ripCX * this.size * 0.15;
        const approachY = this.py0 - this.ripCY * this.size * 0.15;
        const diveX = this.px0 + this.ripCX * this.size * 1.9;
        const diveY = this.py0 + this.ripCY * this.size * 1.9;
        if (!this.portalEntering) {
          // Hover just before the tear until it has parted, then commit.
          this.gx = approachX;
          this.gy = approachY;
          speed = CONFIG.cruiseSpeed;
          if ((proj > -this.size * 0.5 && portal.openFraction > 0.7) || this.stateT > 3.6) {
            this.portalEntering = true;
          }
        } else if (!this.portalClosing) {
          // Dive straight through the gap and under the paper.
          this.gx = diveX;
          this.gy = diveY;
          speed = CONFIG.cruiseSpeed * 0.95;
          if (proj >= underProj) {
            portal.beginClose(); // seal only after the dragon is fully under
            this.portalClosing = true;
          }
        } else {
          this.gx = diveX;
          this.gy = diveY;
          // Wait for the rip to fully seal before disappearing.
          if (!portal.active) this.go("gone", rand(0.8, 2.2));
        }

        break;
      }
      case "gone": {
        this.scale = 0;
        if (this.stateT > this.stateDur) this.go("portalIn");
        break;
      }
    }

    // Integrate motion (steer) unless fully perched or gone.
    const flying = this.state !== "gone" && !(this.state === "sleep" && this.sleepSettled);
    if (flying) this.steer(dt, speed);

    // Soft-contain within the band for the free-flying states.
    const contained =
      this.state === "drift" ||
      this.state === "approach" ||
      this.state === "showcase" ||
      this.state === "breathe" ||
      this.state === "surface";
    if (contained) {
      if (this.x < b.xMin) this.vx += (b.xMin - this.x) * 6 * dt;
      if (this.x > b.xMax) this.vx += (b.xMax - this.x) * 6 * dt;
      if (this.y < b.yMin) this.vy += (b.yMin - this.y) * 6 * dt;
      if (this.y > b.yMax) this.vy += (b.yMax - this.y) * 6 * dt;
    }

    // Scale eases back to 1 in the normal states (portal states drive it above).
    if (this.state !== "portalIn" && this.state !== "portalOut" && this.state !== "gone") {
      this.scale = damp(this.scale, 1, 10, dt);
    }

    // facing
    const inPortal = this.state === "portalIn" || this.state === "portalOut";
    // Only the "surface" pass faces the viewer now, the portal is head-first.
    const facing: "side" | "front" = this.state === "surface" ? "front" : "side";

    // While breathing, face the target so fire always leaves the mouth outward.
    let faceLeft = this.vx < -6;
    if (!inPortal && facing === "side" && breathing && tb) faceLeft = tb.x + tb.w / 2 < this.x;

    // sprite frame
    const spd = Math.hypot(this.vx, this.vy);
    const hz = lerp(CONFIG.flapHzMin, CONFIG.flapHzMax, clamp(spd / CONFIG.dashSpeed, 0, 1));
    this.flap = (this.flap + hz * dt) % 1;
    const col = Math.floor(this.flap * CONFIG.flapFrames) % CONFIG.flapFrames;
    this.mouth = damp(this.mouth, mouthWant, 12, dt);

    const asleep = this.state === "sleep" && this.sleepSettled;
    let row: number;
    if (asleep) row = ROW.sleep;
    else if (inPortal) row = ROW.sideClosed; // head-first side pose
    else if (facing === "front") row = ROW.front;
    else row = this.mouth > 0.5 ? ROW.sideOpen : ROW.sideClosed;

    // orientation (flip + rotation)
    const bob = Math.sin(now * CONFIG.bobHz * TAU + this.seed) * CONFIG.bobAmpl * clamp(1 - spd / 300, 0, 1);
    let flip = false;
    let rot = 0;
    if (inPortal) {
      // Point head-first along the dive direction (+cross out, −cross in).
      const dsign = this.state === "portalOut" ? 1 : -1;
      const tvx = this.ripCX * dsign;
      const tvy = this.ripCY * dsign;
      if (Math.abs(tvy) >= Math.abs(tvx)) {
        flip = false;
        rot = tvy > 0 ? Math.PI / 2 : -Math.PI / 2; // head down / up
      } else {
        flip = tvx < 0; // head left / right
        rot = 0;
      }
    } else if (asleep) {
      rot = Math.sin(now * 1.5 + this.seed) * 0.12; // gentle pendulum
    } else if (facing === "front") {
      rot = Math.sin(now * 0.9 + this.seed) * 0.05; // subtle sway head-on
    } else {
      flip = faceLeft;
      rot = clamp(this.vy / 900, -CONFIG.maxBank, CONFIG.maxBank);
      if (flip) rot = -rot;
      rot += noise1(now * 0.6, this.seed) * 0.04;
    }

    // fire: always projected outward from the mouth
    if (breathing && this.mouth > 0.35 && tb) {
      const dir = flip ? -1 : 1;
      const mouthX = this.x + dir * this.size * 0.34;
      const mouthY = this.y + bob - this.size * 0.06;
      const forward = dir > 0 ? 0 : Math.PI; // the way the snout points
      // Aim at the target, but clamp into the forward hemisphere so flame can
      // never travel backwards into the mouth.
      const aim = angleToBox(mouthX, mouthY, tb);
      const angle = forward + clamp(angleDelta(forward, aim), -1.15, 1.15);
      fire.emit(mouthX, mouthY, angle, dt, this.mouth);
    }

    const size = this.size * this.scale;
    return {
      layer,
      col,
      row,
      x: this.x,
      y: this.y + (asleep || inPortal ? 0 : bob),
      size,
      rot,
      flip,
      alpha: clamp(this.alpha, 0, 1),
    };
  }
}
