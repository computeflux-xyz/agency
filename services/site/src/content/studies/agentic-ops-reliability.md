---
title: "Making an autonomous ops agent reliable enough for production"
description: "A promising internal ops agent kept failing silently in production. We rebuilt it on a graph architecture with explicit state, fallbacks and trajectory evaluation — cutting incidents by an order of magnitude."
publishDate: 2026-01-29
topics: ["Agentic", "Reliability", "Evaluation"]
client: "B2B SaaS platform (anonymized)"
industry: "SaaS"
featured: false
outcomes:
  - value: "10×"
    label: "fewer production incidents"
  - value: "92%"
    label: "task completion rate"
  - value: "100%"
    label: "runs now traced & evaluable"
---

## The problem

The platform team had a prototype ops agent that could triage alerts, gather
context and draft remediations. In demos it was magic. In production it failed
in ways nobody could explain — hanging on flaky tools, looping, or confidently
taking the wrong action.

## The root cause

The agent was a single free-running loop with implicit state and no
observability. When something went wrong, there was no trace to inspect and no
way to reproduce it. "Reliability" was impossible because failure wasn't even
*measurable*.

## What we built

- **Graph orchestration.** We modeled the workflow as an explicit state graph:
  each node is a bounded step with typed inputs/outputs, retries and a timeout.
- **Reliable tool-calling.** Tools got strict contracts, circuit breakers and
  fallbacks, so one flaky dependency no longer sinks the whole run.
- **Human-in-the-loop checkpoints.** High-impact actions pause for approval,
  with all context surfaced to the on-call engineer.
- **Trajectory evaluation.** Every run is traced end to end and scored against
  a growing suite of real incidents, catching regressions before deploy.

## The outcome

Production incidents attributable to the agent dropped **10×**, task completion
rose to **92%**, and — most importantly — **every run is now traceable and
evaluable**. The team ships changes to the agent with the same confidence they
ship the rest of their platform.
