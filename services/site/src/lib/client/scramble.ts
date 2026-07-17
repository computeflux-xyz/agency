/**
 * Text scramble / decode animation.
 *
 * The "ASCII decode" effect: characters resolve from a stream of random glyphs into the
 * final string. Dependency-free, respects `prefers-reduced-motion`, and is
 * accessibility-safe.
 *
 * Progressive enhancement: markup ships with the real text. This script wraps
 * each `[data-scramble]` element and animates on view / on demand. If JS is
 * off or motion is reduced, users simply see the final text.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|<>[]{}=+*#%$&_—";

type Queued = {
  from: string;
  to: string;
  start: number;
  end: number;
  char?: string;
};

export class TextScramble {
  private el: HTMLElement;
  private chars: string;
  private queue: Queued[] = [];
  private frameRequest = 0;
  private frame = 0;
  private resolve: (() => void) | null = null;

  constructor(el: HTMLElement, chars: string = GLYPHS) {
    this.el = el;
    this.chars = chars;
    this.update = this.update.bind(this);
  }

  setText(newText: string): Promise<void> {
    const oldText = this.el.textContent ?? "";
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] ?? "";
      const to = newText[i] ?? "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40) + 10;
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  private update(): void {
    let output = "";
    let complete = 0;
    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];
      const { from, to, start, end } = item;
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }

        output += `<span class="scramble-glyph">${item.char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve?.();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initScramble(root: ParentNode = document): void {
  const els = Array.from(
    root.querySelectorAll<HTMLElement>("[data-scramble]"),
  );
  if (!els.length) return;

  if (prefersReducedMotion()) return;

  const run = (el: HTMLElement) => {
    const finalText = el.dataset.scrambleText ?? el.textContent ?? "";
    el.dataset.scrambleText = finalText;
    const delay = Number(el.dataset.scrambleDelay ?? 0);
    const fx = new TextScramble(el);
    window.setTimeout(() => void fx.setText(finalText), delay);
  };

  const onView = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          run(entry.target as HTMLElement);
          obs.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.35 },
  );

  for (const el of els) {
    el.dataset.scrambleText = el.textContent ?? "";
    if ((el.dataset.scrambleOn ?? "view") === "load") {
      run(el);
    } else {
      onView.observe(el);
    }
  }
}
