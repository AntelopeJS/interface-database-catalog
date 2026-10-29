---
covers:
  - src/index.ts
docs:
  - docs/index.md
journeys:
  - sample-limits
---

# Sample limits

`SAMPLE_ROWS_LIMIT` (20 rows) and `SAMPLE_TEXT_LENGTH` (200 characters per value) bound how much of a relation a consumer sees through `SampleRows`.

## Sub-features

- `sample-limits`: the packed `dist/index.js` exports the two constants with the values `docs/index.md` states, 20 and 200. A different value is a changed bound on how much data a consumer can see.

## How to get to it (user POV)

- `SAMPLE_ROWS_LIMIT` to cap a limit before calling `SampleRows`.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" sample-limits
```

## Gotchas

- The constants are values, not proxies: `every-function` cannot see them, so the journey reads them from the built package.
