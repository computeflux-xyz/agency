/**
 * ARIA tabs — "tabs with automatic activation".
 *
 * Drives every `[data-tabs]` group in `root`. Expected markup:
 *
 *   <div data-tabs="diag">
 *     <div role="tablist">
 *       <button role="tab" id="t-1" aria-controls="p-1" aria-selected="true"  tabindex="0">…
 *       <button role="tab" id="t-2" aria-controls="p-2" aria-selected="false" tabindex="-1">…
 *     </div>
 *     <div role="tabpanel" id="p-1" aria-labelledby="t-1" class="is-active">…
 *     <div role="tabpanel" id="p-2" aria-labelledby="t-2">…
 *   </div>
 *
 * Progressive enhancement: all panels ship in the HTML (so they are indexed),
 * the stylesheet reveals the one carrying `.is-active`, and this script only
 * moves that class around. With JS off the server-rendered panel stays visible.
 *
 * Moving focus with the arrow keys also selects (automatic activation), so
 * `aria-selected` and the focused tab never disagree.
 */
export function initTabs(root: ParentNode = document): void {
  const groups = Array.from(root.querySelectorAll<HTMLElement>("[data-tabs]"));
  if (!groups.length) return;

  for (const group of groups) {
    // Idempotent: `boot()` re-runs on `astro:after-swap`, and a swapped-in
    // document brings fresh nodes that carry no flag yet.
    if (group.dataset.tabsReady === "true") continue;
    group.dataset.tabsReady = "true";

    const tablist = group.querySelector<HTMLElement>('[role="tablist"]');
    if (!tablist) continue;

    const tabs = Array.from(
      tablist.querySelectorAll<HTMLElement>('[role="tab"]'),
    );
    if (!tabs.length) continue;

    // Resolved by id comparison rather than `querySelector("#" + id)` so that
    // ids needing CSS escaping cannot break the lookup.
    const panels = Array.from(
      group.querySelectorAll<HTMLElement>('[role="tabpanel"]'),
    );
    const panelOf = (tab: HTMLElement): HTMLElement | undefined => {
      const id = tab.getAttribute("aria-controls");
      return id ? panels.find((panel) => panel.id === id) : undefined;
    };

    const selectedIndex = (): number => {
      const i = tabs.findIndex(
        (tab) => tab.getAttribute("aria-selected") === "true",
      );
      return i === -1 ? 0 : i;
    };

    /** The tab the user is acting from: the focused one, else the selected one. */
    const currentIndex = (): number => {
      const focused = tabs.indexOf(document.activeElement as HTMLElement);
      return focused === -1 ? selectedIndex() : focused;
    };

    const select = (index: number, moveFocus: boolean): void => {
      const count = tabs.length;
      const target = ((index % count) + count) % count; // wraps at both ends
      tabs.forEach((tab, i) => {
        const isSelected = i === target;
        tab.setAttribute("aria-selected", String(isSelected));
        // Only the selected tab is in the tab order: Tab enters the group once,
        // then the arrow keys move within it.
        tab.setAttribute("tabindex", isSelected ? "0" : "-1");
        panelOf(tab)?.classList.toggle("is-active", isSelected);
      });
      if (moveFocus) tabs[target].focus();
    };

    tabs.forEach((tab, i) => {
      // `Enter` / `Space` arrive here for free — these are real buttons.
      tab.addEventListener("click", () => select(i, false));
    });

    tablist.addEventListener("keydown", (event) => {
      let next: number;
      switch (event.key) {
        case "ArrowRight":
          next = currentIndex() + 1;
          break;
        case "ArrowLeft":
          next = currentIndex() - 1;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = tabs.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault(); // Home/End would otherwise scroll the page
      select(next, true);
    });

    // Normalise whatever the server rendered (without stealing focus), so
    // `tabindex` and `.is-active` are guaranteed coherent from the first frame.
    select(selectedIndex(), false);
  }
}
