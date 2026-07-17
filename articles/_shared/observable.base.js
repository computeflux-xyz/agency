// ============================================================================
//  Shared ObservableHQ template for every Computeflux article.
// ============================================================================
//
//  Each article is a standalone Observable Framework app, but everything that
//  should look and behave identically across articles lives here so it is
//  defined once:
//
//    * theming         — the light "paper" palette that matches computeflux.xyz
//    * layout          — trimmed padding so the embed reads as part of the page
//    * no chrome       — Observable's sidebar, pager and "Built with Observable"
//                        footer are all removed
//    * embed bridge    — a tiny script that talks to the parent page (the Astro
//                        site) over postMessage:
//                          - reports content height so the iframe grows to fit
//                          - reports the heading outline so the PARENT can render
//                            a sticky "Contents" rail (a sticky bar can't work
//                            from inside a height-to-fit iframe. See
//                            services/site ObservableEmbed.astro)
//                          - exposes window.cfTrack(name, data) so interactions
//                            can be forwarded to Umami analytics in the parent
//
//  Usage: an article's observablehq.config.js becomes just:
//
//      import { defineArticle } from "../_shared/observable.base.js";
//      export default defineArticle({ title: "My article title" });
//
//  Pass any extra Observable config through as options. `head` is appended to
//  (not replaced by) the shared head so per-article <head> additions still work.
//
//  The leading "_" keeps this directory out of the article build/publish loop
//  (see .github/workflows/publish-articles.yml and the Taskfile).

/** Rendered inside a sandboxed, cross-origin iframe -> keep the raw R2 page out
 *  of search results (the parent computeflux.xyz page is the canonical one). */
const NOINDEX = `<meta name="robots" content="noindex">`;

/** Palette + layout. Mirrors the site's tokens so the framed article is visually
 *  continuous with the page around it, and strips Observable's default insets,
 *  the (now parent-rendered) TOC gutter and the footer. */
const THEME_STYLE = `
<style>
  :root {
    --theme-background: #f5f4ef;
    --theme-background-alt: #fbfbf9;
    --theme-foreground: #201f1e;
    --theme-foreground-alt: #2e2d28;
    --theme-foreground-muted: #797263;
    --theme-foreground-faint: #9c9686;
    --theme-foreground-faintest: #dcd7cb;
    --theme-foreground-focus: #2f6bff;
  }
  html, body { background: #f5f4ef !important; color: #201f1e; }

  /* The parent page owns the outer gutter and the sticky Contents rail, so the
     framed document only needs a little breathing room, not Observable's large
     default margins. */
  #observablehq-center {
    margin: 0 auto !important;
    padding: 0 0 1.25rem !important;
    max-width: var(--observablehq-max-width, 1152px);
  }
  /* No sidebar/header in the embed -> drop the big reserved top offset. The
     default min-height is viewport-relative, which is circular inside a
     height-to-fit iframe (and leaves empty space under short articles), so it
     is cleared; the parent enforces a sensible minimum height instead. */
  #observablehq-main {
    margin-top: 0.25rem !important;
    padding-right: 0 !important;
    min-height: 0 !important;
  }
  /* TOC is rendered by the parent (sticky), never inside the iframe. */
  #observablehq-toc { display: none !important; }
  /* Remove Observable's default page footer (its build credit line) entirely. */
  #observablehq-footer { display: none !important; }
  /* Never let a wide figure/table punch a horizontal scrollbar the parent hides
     with scrolling="no" (this is what read as "content cut on the right"). */
  #observablehq-main img,
  #observablehq-main svg,
  #observablehq-main canvas { max-width: 100%; height: auto; }
  /* Let prose use the full width of the (parent-sized) iframe rather than
     Observable's default ~640px measure. That cap left a large empty gutter now
     that the table of contents lives in the parent, on the left. Headings are
     left out so an article's own hero/centred headings keep their design. */
  #observablehq-main :is(p, ul, ol, blockquote, table, pre, .katex-display),
  #observablehq-main .observablehq { max-width: none; }
</style>`;

/** The parent<->iframe bridge. Kept dependency-free and defensive so it runs in
 *  the sandboxed frame regardless of the article's own code. */
const EMBED_BRIDGE = `
<script>
  (function () {
    function tocItems() {
      // Only real section headings. The ones Observable gives an id + anchor to
      // (Markdown "##" / "###"). This deliberately excludes <h2> used for card
      // labels and the hero subtitle, matching the original in-page outline.
      var nodes = document.querySelectorAll("#observablehq-main h2[id], #observablehq-main h3[id]");
      var items = [];
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (!el.id) continue;
        // NOTE: this source lives inside a template literal, so the regex is
        // written with a DOUBLE backslash — "\\s" — so the emitted script keeps
        // a real "\s" (a bare "\s" here collapses to "s" and would strip every
        // "s" from the heading text).
        var text = (el.textContent || "").replace(/\\s+/g, " ").trim();
        if (!text) continue;
        // getBoundingClientRect().top is the offset from the top of the (never
        // internally scrolled) iframe document. Exactly what the parent needs
        // to translate a click into a window scroll position.
        var top = Math.round(el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0));
        items.push({ id: el.id, text: text, level: el.tagName === "H3" ? 3 : 2, top: top });
      }

      return items;
    }

    function send(type, payload) {
      try { parent.postMessage(Object.assign({ type: type }, payload), "*"); } catch (e) {}
    }

    function postHeight() {
      var h = Math.max(
        document.body ? document.body.scrollHeight : 0,
        document.documentElement.scrollHeight
      );
      send("cf-article-height", { height: h });
    }

    function postToc() { send("cf-article-toc", { items: tocItems() }); }
    function post() { postHeight(); postToc(); }

    // Forward article interactions to analytics running in the parent (Umami).
    // Article code can call: cfTrack("slider_changed", { name: "throughput" }).
    window.cfTrack = function (name, data) {
      send("cf-article-event", { name: String(name), data: data || {} });
    };

    window.addEventListener("load", post);
    window.addEventListener("resize", post);
    document.addEventListener("DOMContentLoaded", post);
    if (window.ResizeObserver) {
      try { new ResizeObserver(post).observe(document.body); } catch (e) {}
    }

    // Interactive cells (charts, inputs) settle asynchronously. Resample a few
    // times so height + outline converge without a scroll listener.
    [120, 400, 900, 1800, 3200].forEach(function (t) { setTimeout(post, t); });
  })();
</script>`;

export const sharedHead = `${NOINDEX}${THEME_STYLE}${EMBED_BRIDGE}`;

/**
 * Build an Observable Framework config for a Computeflux article.
 *
 * @param {object} [options] Per-article overrides. `title` is expected. Any
 *   other Observable config key is passed through. `head` is *appended* to the
 *   shared head. `theme` defaults to "air" (the light paper theme).
 * @returns {import("@observablehq/framework").Config}
 */
export function defineArticle(options = {}) {
  const { head: extraHead = "", theme = "air", ...rest } = options;
  return {
    root: "src",
    theme,
    // Empty string removes the default footer text. The CSS above also hides the
    // element so no empty footer gap remains.
    footer: "",
    // The parent page renders a sticky Contents rail from the outline we post,
    // so the in-iframe TOC (which cannot stay fixed in a height-to-fit iframe)
    // is disabled everywhere.
    toc: false,
    sidebar: false,
    pager: false,
    ...rest,
    head: `${sharedHead}${extraHead}`,
  };
}

export default defineArticle;
