/**
 * A small, keyboard-reachable control to pause / resume the dragon
 */
const KEY = "flux-dragon-paused";

export function isPausedPref(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function savePref(paused: boolean): void {
  try {
    localStorage.setItem(KEY, paused ? "1" : "0");
  } catch {}
}

const PLAY =
  '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M4 3l9 5-9 5z" fill="currentColor"/></svg>';
const PAUSE =
  '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><rect x="4" y="3.5" width="3" height="9" rx="1" fill="currentColor"/><rect x="9" y="3.5" width="3" height="9" rx="1" fill="currentColor"/></svg>';

export interface Control {
  el: HTMLButtonElement;
  destroy(): void;
}

export function makeControl(paused: boolean, onChange: (paused: boolean) => void): Control {
  const el = document.createElement("button");
  el.id = "flux-dragon-toggle";
  el.type = "button";
  const sync = () => {
    el.setAttribute("aria-pressed", String(paused));
    el.setAttribute("aria-label", paused ? "Resume the dragon animation" : "Pause the dragon animation");
    el.title = el.getAttribute("aria-label")!;
    el.innerHTML = paused ? PLAY : PAUSE;
  };
  sync();
  const handler = () => {
    paused = !paused;
    savePref(paused);
    sync();
    onChange(paused);
  };
  el.addEventListener("click", handler);
  return {
    el,
    destroy() {
      el.removeEventListener("click", handler);
      el.remove();
    },
  };
}
