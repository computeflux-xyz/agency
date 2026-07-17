---
title: eBPF: tracing without instrumentation
toc: false
---

```js
const cover = FileAttachment("cover.svg");
```

# eBPF: tracing without instrumentation

The usual way to understand a service is to litter it with logs and metrics, ship, and hope you measured the right thing. **eBPF** flips that: you attach small verified programs to kernel and user-space hooks of an *already-running* process and observe it directly — syscalls, function entry/exit, network, scheduling — with overhead measured in nanoseconds.

For a Go service you can trace request latency, GC pauses and lock contention without recompiling or restarting anything. The trade is that you are now programming against the kernel's rules: the verifier is strict, and portability across kernels takes care.

It is the closest thing we have to a debugger for production — one that never stops the world.
