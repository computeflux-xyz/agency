export function initHeader(): void {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-condensed", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const items = Array.from(
    header.querySelectorAll<HTMLElement>("[data-nav-item]"),
  );

  const closeAll = () => {
    items.forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector("[data-nav-trigger]")?.setAttribute(
        "aria-expanded",
        "false",
      );
    });
    header.classList.remove("has-open-menu");
  };

  const open = (item: HTMLElement) => {
    closeAll();
    item.classList.add("is-open");
    item.querySelector("[data-nav-trigger]")?.setAttribute(
      "aria-expanded",
      "true",
    );
    header.classList.add("has-open-menu");
  };

  items.forEach((item) => {
    const hasMega = item.hasAttribute("data-has-mega");
    if (!hasMega) return;
    const trigger = item.querySelector<HTMLElement>("[data-nav-trigger]");

    item.addEventListener("mouseenter", () => open(item));
    item.addEventListener("mouseleave", () => closeAll());

    trigger?.addEventListener("focus", () => open(item));
    trigger?.addEventListener("click", (e) => {
      if (window.matchMedia("(hover: none)").matches) {
        e.preventDefault();
        item.classList.contains("is-open") ? closeAll() : open(item);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
  header.addEventListener("focusout", (e) => {
    if (!header.contains(e.relatedTarget as Node)) closeAll();
  });

  const openBtn = header.querySelector<HTMLElement>("[data-menu-toggle]");
  const drawer = document.querySelector<HTMLElement>("[data-mobile-drawer]");
  const toggles = document.querySelectorAll<HTMLElement>("[data-menu-toggle]");

  const setDrawer = (open: boolean) => {
    drawer?.classList.toggle("is-open", open);
    openBtn?.setAttribute("aria-expanded", String(open));
    document.documentElement.style.overflow = open ? "hidden" : "";
  };

  toggles.forEach((t) =>
    t.addEventListener("click", () => {
      setDrawer(!drawer?.classList.contains("is-open"));
    }),
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setDrawer(false);
  });

  drawer?.querySelectorAll<HTMLElement>("[data-mobile-accordion]").forEach(
    (acc) => {
      const btn = acc.querySelector<HTMLElement>("[data-accordion-btn]");
      btn?.addEventListener("click", () => {
        const expanded = acc.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(expanded));
      });
    },
  );

  drawer?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setDrawer(false)),
  );
}
