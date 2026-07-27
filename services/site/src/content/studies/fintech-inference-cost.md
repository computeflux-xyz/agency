---
title: "Bringing an over-provisioned support copilot's cost back under control"
description: "A fintech support copilot everyone loved had a cost curve finance did not. We re-architected the serving stack behind an evaluation gate, so cost came down without touching answer quality."
publishDate: 2026-02-18
topics: ["Inference", "Cost"]
client: "Series-C fintech (anonymized)"
industry: "Financial services"
featured: true
outcomes:
  - value: "Lower cost"
    label: "cost per request brought back under control"
  - value: "Faster"
    label: "tail latency improved"
  - value: "No regression"
    label: "quality held, proven by an evaluation gate"
---

## The problem

A Series-C fintech had shipped an internal support copilot that engineers and
agents loved, and finance did not. Inference spend had become a meaningful
monthly line item and was scaling with headcount. Leadership wanted the cost
curve bent **without** degrading answer quality, which had become a trusted part
of the support workflow.

## What we found

A short audit surfaced three compounding issues:

1. **Over-provisioned model.** The largest available model was serving every
   request, including trivial classification and routing steps that a much
   smaller model handled just as well.
2. **No batching discipline.** Requests were served one at a time, leaving the
   hardware idle between tokens and wrecking throughput economics.
3. **Repeated work.** The same system prompt and retrieved context were
   re-encoded on every call.

## What we built

- **Model routing.** A cheap classifier routes each request to the smallest
  model that meets the quality bar, reserving the largest model for the
  genuinely hard queries.
- **Continuous batching.** Reconfigured serving for continuous batching and
  tuned the cache, lifting hardware utilization substantially.
- **A prefix cache.** A small, memory-safe cache in front of the server
  deduplicates shared prompt prefixes and retrieved context.

Every change shipped behind an **evaluation gate**: a fixed benchmark of real
support queries with automated scoring, so no optimization could regress
quality without failing CI.

## The outcome

Cost per request came back under control and tail latency improved, with no
measurable quality regression.

> The most valuable deliverable wasn't a number, it was the benchmark. The
> team can now optimize aggressively because they can *prove* quality holds.
