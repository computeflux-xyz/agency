---
title: "Rewriting the hot path of a nightly ingestion job that kept overrunning"
description: "A data platform's nightly ingestion was blowing its window. Instead of scaling out more workers, we profiled it and rewrote only the hot path, so the job finished comfortably on the same hardware."
publishDate: 2025-12-11
topics: ["Performance", "Data"]
client: "Analytics scale-up (anonymized)"
industry: "Data / Analytics"
featured: false
outcomes:
  - value: "In-window"
    label: "nightly batch finishes well inside its window"
  - value: "Lower cost"
    label: "same work on far fewer instances"
  - value: "Targeted"
    label: "only the hot path rewritten, orchestration untouched"
---

## The problem

An analytics scale-up's nightly ingestion job was overrunning into business
hours. The instinctive fix, adding more workers, was getting expensive fast,
and the pipeline was already memory-bound.

## The approach

We profiled the pipeline and found the bottleneck concentrated in a narrow hot
path: parsing, validation and columnar encoding of a high-volume event stream.
Rather than rewrite everything, we replaced **only that hot path** with a
performance-focused component, keeping the surrounding orchestration in place.

The rewritten stage used zero-copy parsing, careful memory reuse and
data-parallel processing across cores, none of which was practical in the
original code.

## The outcome

The nightly window collapsed back to a comfortable margin, and compute cost fell
because the job now finished on far fewer instances. The team kept its familiar
orchestration; only the part that mattered was rewritten.

## Takeaway

You rarely need to rewrite a system to make it fast. You need to find the small
fraction of code doing most of the work, and give *that* the right tool.
