---
title: Speculative decoding, visually
toc: false
---

```js
const cover = FileAttachment("cover.svg");
```

# Speculative decoding, visually

A big model spends most of its time waiting on memory, not maths. **Speculative decoding** exploits that: a cheap *draft* model guesses the next few tokens, and the large *target* model verifies them all in a single forward pass. Every accepted guess is a token you got almost for free.

The win is governed by one number — the **acceptance rate**. Drag it:

```js
const accept = view(Inputs.range([0.3, 0.95], {value: 0.7, step: 0.01, label: "Acceptance rate"}));
const k = view(Inputs.range([2, 8], {value: 4, step: 1, label: "Draft tokens per step (k)"}));
```

```js
// Expected accepted tokens per verification ≈ (1 - p^(k+1)) / (1 - p).
const expected = (1 - Math.pow(accept, k + 1)) / (1 - accept);
```

<div class="card" style="max-width:22rem">
  <h2 style="font:600 0.72rem/1 ui-monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--theme-foreground-muted)">Expected tokens / step</h2>
  <span style="font-size:2rem;font-weight:800">${expected.toFixed(2)}×</span>
</div>

Above roughly 70% acceptance the method pays for the draft model several times over. Below it, you are burning compute verifying bad guesses — which is why draft-model choice and prompt alignment matter as much as the trick itself.
