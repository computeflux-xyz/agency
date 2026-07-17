---
title: Designing agents that survive production
toc: false
---

```js
const cover = FileAttachment("cover.svg");
```

# Designing agents that survive production

Most agent demos work once, on the happy path, in front of a friendly audience. Production is none of those things. The difference is rarely the model — it is the **engineering around it**.

Four things carry most of the reliability:

- **Bounded reasoning loops.** Cap steps and cost; never let an agent spin.
- **Dependable tool-calling.** Validate arguments, type the results, and make tools idempotent.
- **Fallbacks everywhere.** A flaky tool or a timeout should degrade, not derail.
- **Trajectory-level evaluation.** Score whole runs, not single responses, and gate releases on it.

None of this is exciting, and all of it is why an agent still behaves at 3am under load it never saw in the demo.
