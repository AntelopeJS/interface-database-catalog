---
covers:
  - src/index.ts
docs:
  - docs/index.md
journeys:
  - sample-calls
  - sample-limits
---

# Sample

A module author imports `SampleRows` to show a person a few rows of a relation. It is the one function that answers row values, bounded by `SAMPLE_ROWS_LIMIT` (20 rows) and `SAMPLE_TEXT_LENGTH` (200 characters per value).

## Sub-features

- `sample-calls`: `SampleRows` resolves through core to the stub provider with its request (`relation`, `limit`) intact.
- `sample-limits`: the packed `dist/index.js` exports the two constants with the values `docs/index.md` states, 20 and 200. A different value is a changed bound on how much data a consumer can see.

## How to get to it (user POV)

- `await SampleRows({ relation: "public.orders", limit: 5 })`, and `SAMPLE_ROWS_LIMIT` to cap a limit before asking.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" sample
```

## Gotchas

- The constants are values, not proxies: `every-function` cannot see them, so `sample-limits` reads them from the built package.
