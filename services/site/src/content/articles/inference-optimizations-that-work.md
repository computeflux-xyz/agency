---
title: "Five inference optimizations that actually move the numbers"
description: "A field guide to the inference optimizations we reach for first — ranked by how reliably they cut cost and latency without hurting quality."
publishDate: 2026-01-12
topics: ["Inference", "Performance"]
featured: false
---

Most teams leave enormous inference savings on the table. Here are the five
levers we reach for first, roughly in order of return-on-effort.

## 1. Route to the smallest model that passes the bar

Not every request needs a frontier model. A cheap classifier in front of a
routing layer can send the easy 70% to a small, fast model and reserve the big
one for genuinely hard queries. This is almost always the single biggest win.

## 2. Turn on continuous batching

If you're serving requests one at a time, your GPUs are idle most of the time.
Continuous batching (vLLM, TensorRT-LLM) keeps them busy and can multiply
throughput several times over with no quality impact.

## 3. Cache aggressively

Shared prompt prefixes, system prompts and retrieved context get re-encoded on
every call unless you cache them. Prefix/KV caching turns repeated work into a
lookup.

## 4. Quantize — but gate on evals

INT8/FP8 quantization shrinks memory and speeds up serving. The catch is
quality: **always** benchmark before and after on a fixed eval set so you know
exactly what (if anything) you traded away.

## 5. Move the hot path to a systems language

Tokenizers, samplers, caches and rate limiters written in Rust or Zig can
remove latency that no amount of Python tuning will. Reserve this for the parts
of the path that profiling proves are hot.

---

The theme across all five: **measure first, gate on evaluation, optimize the
hot path.** Guessing is how you either overspend or quietly break quality.
