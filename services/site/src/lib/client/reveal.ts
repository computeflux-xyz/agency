/**
 * Scroll-reveal: adds `.is-revealed` to `[data-reveal]` elements as they
 * enter the viewport. Optional staggering via `data-reveal-stagger` on a
 * container (ms between children). CSS handles the actual transition, so this
 * degrades gracefully and honours `prefers-reduced-motion` via the stylesheet.
 */
export function initReveal(root: ParentNode = document): void {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (!els.length) return;

  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );

  root
    .querySelectorAll<HTMLElement>("[data-reveal-stagger]")
    .forEach((container) => {
      const step = Number(container.dataset.revealStagger ?? 80);
      container
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((child, i) => {
          child.style.setProperty("--reveal-delay", `${i * step}ms`);
        });
    });

  els.forEach((el) => observer.observe(el));
}
