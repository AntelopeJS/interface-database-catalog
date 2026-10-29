---
covers:
  - src/index.ts
docs:
  - docs/index.md
journeys:
  - inspect-calls
  - inspect-shapes
---

# Inspect

A module author imports `Info`, `ListRelations` and `DescribeRelations` from `@antelopejs/interface-database-catalog` and reads the connected database's identity, its relations and one relation in full. The implementing module answers; this interface only routes the call.

## Sub-features

- `inspect-calls`: the packed interface loads in `ajs project dev` next to a stub provider; each of the three functions resolves through core and the stub receives the arguments the consumer sent. An empty list of schemas and an unknown relation are the provider's to answer, not this interface's.
- `inspect-shapes`: a probe compiled against the packed declarations reads back what each function answers: `Info` four strings, `ListRelations` an array of relation summaries (kind, estimate source, key, writes, comment), `DescribeRelations` the summary plus columns, indexes and the foreign keys out and in. A dropped, added, retyped or re-nested field fails the compile.

## How to get to it (user POV)

- `await Info()`, `await ListRelations(["public"])` and `await DescribeRelations(["public.orders"])` in a module whose project loads a catalog provider (`docs/index.md`, "Inspect one relation").

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" inspect
```

## Gotchas

- A call with no provider waits forever; the driver gives up after 15 seconds and the step fails.
- Changing a type the three functions answer (`CatalogInfo`, `RelationSummary`, `RelationDescription`) changes the declared surface: `smoke` runs `minor-bump` against the published version.
