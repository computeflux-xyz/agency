---
title: "Replacing a Python ingestion pipeline with Rust: 22× throughput"
description: "A data platform's nightly ingestion was blowing its window. Instead of scaling out more workers, we rewrote the hot path in Rust — 22× throughput on the same hardware, at a fraction of the cost."
publishDate: 2025-12-11
topics: ["Performance", "Rust", "Data"]
client: "Analytics scale-up (anonymized)"
industry: "Data / Analytics"
featured: false
outcomes:
  - value: "22×"
    label: "ingestion throughput"
  - value: "-71%"
    label: "compute cost"
  - value: "4h → 11m"
    label: "nightly batch window"
---

## The problem

An analytics scale-up's nightly ingestion job was taking four hours and
regularly overran into business hours. The instinctive fix — add more workers —
was getting expensive fast, and the Python pipeline was already memory-bound.

## The approach

We profiled the pipeline and found the bottleneck concentrated in a narrow hot
path: parsing, validation and columnar encoding of a high-volume event stream.
Rather than rewrite everything, we replaced **only that hot path** with a Rust
component, keeping the surrounding orchestration in Python.

The Rust stage used zero-copy parsing, careful memory reuse and data-parallel
processing across cores — none of which was practical in the original code.

## The outcome

Throughput increased **22×** on the same hardware. The nightly window collapsed
from **four hours to eleven minutes**, and compute cost fell **71%** because the
job now finished on far fewer instances. The team kept its familiar Python
orchestration; only the part that mattered was rewritten.

## Takeaway

You rarely need to rewrite a system to make it fast. You need to find the 5% of
code doing 95% of the work — and give *that* the right tool.
