---
covers:
  - src/index.ts
docs:
  - docs/index.md
journeys:
  - answer-shapes
---

# Sample

A module author imports `SampleRows` to show a person a few rows of a relation. It is the one function that answers row values; [sample-limits](sample-limits.md) covers the bounds.

## Sub-features

- `answer-shapes`: a probe compiled against the packed declarations reads back the structure of `RowSample`: `rows` is one array of sampled values per row (`SampledValue[][]`), each value a `{ text, truncated }`, a `{ bytes }` or `null`, next to `relation`, `columns` and `sample`.
- `SampleRows` resolving through core to the stub provider with the consumer's arguments is `smoke`'s `every-function`.

## How to get to it (user POV)

- `await SampleRows({ relation: "public.orders", limit: 5 })`, and `SAMPLE_ROWS_LIMIT` to cap a limit before asking.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" sample
```

## Gotchas

- A type-only change to `RowSample` is invisible to the stub (it echoes) and to `minor-bump` when the change title releases a new minor; only `answer-shapes` reads the structure.
