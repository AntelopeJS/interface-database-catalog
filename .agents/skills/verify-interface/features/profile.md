---
covers:
  - src/index.ts
docs:
  - docs/index.md
journeys:
  - profile-calls
---

# Profile

A module author imports `Profile` and `CheckReference` and measures one relation's columns, or tests whether one column's values occur in another without a declared foreign key.

## Sub-features

- `profile-calls`: each function resolves through core to the stub provider with its request object intact (`relation`, `columns`, `from`, `to`). A measure that times out or fails (`timeout`, `error`) is the provider's answer; this interface only declares its shape.

## How to get to it (user POV)

- `await Profile({ relation: "public.orders", columns: ["status"] })` and `await CheckReference({ from, to })` in a module whose project loads a catalog provider.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" profile
```

## Gotchas

- Omitting `columns` profiles every column; the journey sends them, because the stub answers whatever it receives.
