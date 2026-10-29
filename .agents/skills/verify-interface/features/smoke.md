---
covers:
docs:
  - docs/index.md
journeys:
  - every-function
  - minor-bump
---

# Smoke

The fixed journeys every verdict runs, whatever the diff touches: pack the interface, load it in `ajs project dev` with a stub provider and a consumer, and call every declared function through core; then compare the declared functions with the published version.

## Sub-features

- `every-function`: all six functions answer through core from the stub provider.
- `minor-bump`: an added, changed or removed function (or type it answers) releases as at least a new minor.

## How to get to it (user POV)

- A project with a catalog provider and a module that imports `@antelopejs/interface-database-catalog`.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" smoke
```

## Gotchas

- The smoke feature covers no glob, so it never marks a file as mapped.
- `minor-bump` needs the npm registry; without it the journey is not verified.
