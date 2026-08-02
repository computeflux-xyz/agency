---
title: Template Study
toc: false
---

```js
// Referenced so the cover ships in dist/ — site-api resolves it to the study's
// cover image.
const cover = FileAttachment("cover.svg");
```

# Template Study

A minimal [Observable Framework](https://observablehq.com/framework) case study.
Replace this content, update `../study.json`, then publish with the
`publish-content` GitHub Action.

<!-- Localization: this project is bilingual. `src/index.md` is the English
     entrypoint (dist/index.html). `src/fr/index.md` is the French one
     (dist/fr/index.html). Components and data under src/ are shared. Translate
     only the prose and any string labels in charts. Each locale's title/summary
     and entrypoint live under `locales` in study.json. The publisher ships one
     version per locale under studies/<type>/<slug>/<lang>/vN/. -->

<div class="client-strip">
  <div class="field"><span class="k">Sector</span><span class="v">—</span></div>
  <div class="field"><span class="k">Market</span><span class="v">—</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">—</span></div>
  <div class="field"><span class="k">Engagement</span><span class="v">—</span></div>
</div>

A study is a *customer* story, so the reader must always know where a statement
comes from. Three callouts carry that, and they are the reason `studies/_shared`
exists at all:

<div class="verified">Anything inside this callout was read off the shipped
codebase — a file, a migration, a config key, a function.</div>

<div class="modelled">Anything inside this callout is driven by the inputs on
this page. It is a teaching model, not a measurement of the client's traffic.</div>

<div class="proposed">Anything inside this callout is a design we are proposing
on top of what shipped. It is not running in production.</div>

<div class="card">
  Interactive Observable content renders here — plots, inputs, data loaders and
  all its assets ship as a self-contained <code>dist/</code> tree.
</div>
