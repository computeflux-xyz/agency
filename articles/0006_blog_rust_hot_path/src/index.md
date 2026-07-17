---
title: Rust in the inference hot path
toc: false
---

```js
const cover = FileAttachment("cover.svg");
```

# Rust in the inference hot path

Not everything belongs in Python. Around a model there is a ring of small, brutally hot components — tokenizers, logit processors, samplers, KV-cache management, admission control — that run on every single token. Shaving microseconds there compounds across billions of tokens.

This is where **Rust** pays off: predictable latency with no garbage-collector pauses, memory safety without a runtime, and clean FFI back into the Python or Go serving layer. You keep the ergonomics of a high-level stack for orchestration and drop to Rust exactly where the profiler tells you to — not before.
