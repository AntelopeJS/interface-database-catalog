---
covers:
  - src/index.ts
docs:
  - docs/index.md
journeys:
  - answer-shapes
---

# Profile

A module author imports `Profile` and `CheckReference` and measures one relation's columns, or tests whether one column's values occur in another without a declared foreign key.

## Sub-features

- `answer-shapes`: a probe compiled against the packed declarations reads back the structure of `RelationProfile` (rows, sample, per-column measures and traits, fan-out, inbound references) and of `CheckReference`'s `Measure<ReferenceMatch>`.
- Each function resolving through core to the stub provider with the consumer's arguments is `smoke`'s `every-function`. A measure that times out or fails (`timeout`, `error`) is the provider's answer; this interface only declares its shape.

## How to get to it (user POV)

- `await Profile({ relation: "public.orders", columns: ["status"] })` and `await CheckReference({ from, to })` in a module whose project loads a catalog provider.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" profile
```

## Gotchas

- Omitting `columns` profiles every column. The stub answers whatever it receives, so no journey here can tell the two apart.
