---
title: "Cutting LLM inference cost 63% for a fintech copilot"
description: "How we re-architected a customer-support copilot's serving stack — quantization, continuous batching and a Rust token cache — to slash cost per request without touching answer quality."
publishDate: 2026-02-18
topics: ["Inference", "Cost", "Rust"]
client: "Series-C fintech (anonymized)"
industry: "Financial services"
featured: true
outcomes:
  - value: "-63%"
    label: "cost per 1k requests"
  - value: "-48%"
    label: "p99 latency"
  - value: "0"
    label: "quality regression (eval-gated)"
---

## The problem

A Series-C fintech had shipped an internal support copilot that engineers and
agents loved — and finance did not. Inference spend had grown to a six-figure
monthly line item and was scaling linearly with headcount. Leadership wanted
the cost curve bent **without** degrading answer quality, which had become a
trusted part of the support workflow.

## What we found

A two-week audit surfaced three compounding issues:

1. **Over-provisioned model.** A frontier model was serving every request,
   including trivial classification and routing steps that a much smaller model
   handled just as well.
2. **No batching discipline.** Requests were served one at a time, leaving the
   GPUs idle between tokens and wrecking throughput economics.
3. **Repeated work.** The same system prompt and retrieved context were
   re-tokenized and re-encoded on every call.

## What we built

- **Model routing.** A cheap classifier routes each request to the smallest
  model that meets the quality bar, with the frontier model reserved for the
  genuinely hard queries.
- **Continuous batching on vLLM.** Reconfigured serving for continuous batching
  and tuned the KV-cache, lifting GPU utilization from ~30% to ~80%.
- **A Rust token/prefix cache.** A small, memory-safe cache in front of the
  server deduplicates shared prompt prefixes and retrieved context.

Every change shipped behind an **evaluation gate**: a fixed benchmark of real
support queries with automated scoring, so no optimization could regress
quality without failing CI.

## The outcome

Cost per 1,000 requests fell **63%**, p99 latency dropped **48%**, and the eval
suite showed **no measurable quality regression**. The savings paid back the
engagement in the first month.

> The most valuable deliverable wasn't the number — it was the benchmark. The
> team can now optimize aggressively because they can *prove* quality holds.
