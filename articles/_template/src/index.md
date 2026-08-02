---
title: Template Article
toc: false
---

# Template Article

This is a minimal [Observable Framework](https://observablehq.com/framework)
article. Replace this content, update `../article.json`, then publish with the
`publish-content` GitHub Action.

<!-- Localization: this project is bilingual. `src/index.md` is the English
     entrypoint (dist/index.html). `src/fr/index.md` is the French one
     (dist/fr/index.html). Components and data under src/ are shared. Translate
     only the prose and any string labels in charts. Each locale's title/summary
     and entrypoint live under `locales` in article.json. The publisher ships
     one version per locale under articles/<type>/<slug>/<lang>/vN/. -->


```js
const data = FileAttachment("data/example.json").json();
```

<div class="card">
  Interactive Observable content renders here — plots, inputs, data loaders and
  all its assets ship as a self-contained <code>dist/</code> tree.
</div>
