// ============================================================================
//  Shared ObservableHQ template for every Computeflux case study.
// ============================================================================
//
//  A study is the same kind of artifact as an article — a standalone Observable
//  Framework app, embedded in a sandboxed iframe on computeflux.xyz — so all of
//  the chrome that makes an embed behave (theme tokens, trimmed layout, the
//  parent<->iframe height/TOC/analytics bridge) is *not* redefined here. It is
//  imported from the article base, which stays the single source of truth:
//
//      ../../articles/_shared/observable.base.js
//
//  What a study adds on top is editorial, not structural:
//
//    * .client-strip     — the anonymised "sector / market / surfaces" band that
//                          opens every study, standing in for a client logo we
//                          are not allowed to show
//    * .verified /
//      .modelled /
//      .proposed         — three callouts that keep the reader oriented on the
//                          only axis that matters in a customer story: what was
//                          read off the shipped codebase, what is a model driven
//                          by the inputs on the page, and what is a design we
//                          are proposing rather than something already running
//    * .kv / .field      — small monospace treatments for key/value facts
//
//  Usage: a study's observablehq.config.js becomes just:
//
//      import { defineStudy } from "../_shared/observable.base.js";
//      export default defineStudy({ title: "My study title" });
//
//  The leading "_" keeps this directory out of the build/publish loop (see
//  .github/workflows/publish-content.yml).

import { defineArticle, sharedHead as articleHead } from "../../articles/_shared/observable.base.js";

/** Case-study-only styles. Everything else (palette, layout resets, embed
 *  bridge) comes from the article head this is appended to. */
const STUDY_STYLE = `
<style>
  /* The band that opens a study. It carries the anonymised identity of the
     client — sector, market, surfaces — because the real one is withheld. */
  .client-strip {
    display: flex; flex-wrap: wrap; gap: 0 2.25rem;
    margin: 1.5rem 0 2.5rem; padding: 1rem 1.25rem;
    border: 1px solid var(--theme-foreground-faintest, #dcd7cb);
    border-left: 3px solid var(--theme-foreground-focus, #2f6bff);
    border-radius: 0 8px 8px 0;
    background: var(--theme-background-alt, #fbfbf9);
  }
  .client-strip .field { display: flex; flex-direction: column; gap: 0.15rem; padding: 0.25rem 0; }
  .client-strip .field > .k {
    font-family: ui-monospace, Menlo, monospace; font-size: 0.62rem;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--theme-foreground-muted);
  }
  .client-strip .field > .v { font-size: 0.95rem; font-weight: 600; }

  /* Provenance callouts. Colour is the only difference; the label carries the
     meaning, so they stay legible if the palette changes. */
  .verified, .modelled, .proposed {
    margin: 1.25rem 0; padding: 0.8rem 1rem 0.85rem;
    border-left: 3px solid; border-radius: 0 6px 6px 0;
    font-size: 0.92rem; line-height: 1.55;
  }
  .verified  { border-color: #2f8f5b; background: rgba(47,143,91,0.07); }
  .modelled  { border-color: #b07d17; background: rgba(176,125,23,0.07); }
  .proposed  { border-color: #2f6bff; background: rgba(47,107,255,0.07); }
  .verified::before, .modelled::before, .proposed::before {
    display: block; margin-bottom: 0.3rem;
    font-family: ui-monospace, Menlo, monospace; font-size: 0.62rem;
    text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600;
  }
  /* Labels come from custom properties so a translated page can restyle them
     without redefining the callouts: a locale's index.md sets --cb-* on :root. */
  .verified::before  { content: var(--cb-verified, "Read off the codebase"); color: #2f8f5b; }
  .modelled::before  { content: var(--cb-modelled, "A model, not a measurement"); color: #8a6210; }
  .proposed::before  { content: var(--cb-proposed, "Proposed, not shipped"); color: #2f6bff; }

  /* Inline monospace key/value pairs used inside prose for config and paths. */
  .kv { font-family: ui-monospace, Menlo, monospace; font-size: 0.88em; }

  /* Schematics are hand-authored inline SVG. They must never overflow the
     iframe, and they must not carry a numeric axis (see the studies README). */
  .schematic { width: 100%; height: auto; display: block; margin: 1.75rem 0; }
  .schematic-caption {
    margin: -1rem 0 1.75rem; text-align: center;
    font-size: 0.8rem; color: var(--theme-foreground-muted);
  }
</style>`;

export const sharedHead = `${articleHead}${STUDY_STYLE}`;

/**
 * Build an Observable Framework config for a Computeflux case study.
 *
 * Identical to `defineArticle` except that the study chrome is appended to the
 * head. `head` passed by the caller is appended after both, so a study can
 * still add its own.
 *
 * @param {object} [options] Per-study overrides. `title` is expected.
 * @returns {import("@observablehq/framework").Config}
 */
export function defineStudy(options = {}) {
  const { head: extraHead = "", ...rest } = options;
  return defineArticle({ ...rest, head: `${STUDY_STYLE}${extraHead}` });
}

export default defineStudy;
