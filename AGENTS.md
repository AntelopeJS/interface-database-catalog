# interface-database-catalog

`@antelopejs/interface-database-catalog` declares an AntelopeJS interface that describes and profiles a database an `@antelopejs/interface-database` provider is connected to but does not own. The whole contract is `src/index.ts`: types, constants, and `InterfaceFunction` declarations, with no implementation. Providers implement it elsewhere.

## Layout

- `src/index.ts` is the published contract, built to `dist/`.
- `docs/` ships in the npm package and is the documentation the README links to. The fenced `ts docs-check` blocks in `docs/` compile in CI against `docs/tsconfig.json`, which maps the package name onto `src/index.ts`. Change a signature, and update the examples that call it.

## Versioning

`@antelopejs/interface-core` is a peer dependency, not a dependency: the consuming module supplies it. The README's compatibility table, under the `docs-compat` marker, mirrors its range, and the CI documentation check fails when the two differ.

## Tests

There is no test suite. `pnpm test` runs `pnpm run build`, so `pnpm run checks` proves the package builds with its declarations.

`pnpm run checks` does not run the documentation check (docs examples and the compatibility table); only CI does. To run it locally, clone AntelopeJS/tooling-configs at `v0.0.9`, run `npm ci --prefix actions/docs` in the clone, then from this repository run `node <clone>/actions/docs/check.mjs --files $'README.md\ndocs' --typescript-project docs/tsconfig.json`.

<!-- antelopejs-guardrails:start -->
<!-- Managed by @antelopejs/tooling-configs. `antelopejs-sync` rewrites everything between these markers; write repository-specific guidance outside them. -->

## Guardrails

Finish every change with `pnpm run checks`. It runs typecheck, lint, format, knip, tests, size, ratchet, and sync, and prints only what failed. The change is done when it prints no failure.

The tools enforce most rules, listed in the table at the end. The sections below hold the rules no tool checks.

### Comments

Say it in code. A constraint belongs in a type, a lint rule, or a test. A public item's contract belongs in TSDoc (`/** */`) on that item. The only other comments are lint directives that name their rules, `@ts-expect-error <reason>`, `SAFETY: <reason>` above a type assertion, `/*!` license headers, and bundler or formatter directives.

### Tests

Hold every test you write or keep to this checklist:

- Name the wrong implementation this test fails on. A test with no answer is deleted, not kept.
- No test reads the file it tests. Drive the behaviour through the public interface.
- An invariant over many files is a lint rule, not a test.

### Debt

`guardrails.ratchet.json` records the lint findings and oversize files this repository already had. Its numbers only go down. After you remove debt, run `pnpm run ratchet:update` and commit the lowered file. A rule listed there is off for `oxlint`. The ratchet counts it instead, and the pre-commit hook rejects it on every line you add.

### What enforces what

| Rule                                                                           | Enforced by                               |
| ------------------------------------------------------------------------------ | ----------------------------------------- |
| Formatting                                                                     | oxfmt                                     |
| Lint findings are errors; no rule warns                                        | oxlint preset                             |
| Comments are TSDoc, directives, or `SAFETY:` only                              | `antelopejs/no-comments`                  |
| Every test asserts                                                             | `antelopejs/require-assertion`            |
| Tests read no files outside fixtures, helpers, locales                         | `antelopejs/no-fs-read-in-tests`          |
| No assertion that restates a constant                                          | `antelopejs/no-constant-value-assertion`  |
| No test whose only check is "is a function"                                    | `antelopejs/no-typeof-function-only-test` |
| Params ≤ 5, function ≤ 120 lines, file ≤ 500 lines, depth ≤ 4, complexity ≤ 20 | `eslint/max-*`, `eslint/complexity`       |
| Files ≤ 20,000 bytes, tests included                                           | `antelopejs-check-size` (pre-commit)      |
| Existing debt only shrinks                                                     | `antelopejs-ratchet`                      |
| Types check                                                                    | `tsc` (pre-push)                          |
| No dead files, exports, or dependencies                                        | knip                                      |
| Managed files match the pack                                                   | `antelopejs-sync --check`                 |
| A test names the wrong implementation it catches                               | review; no tool                           |

<!-- antelopejs-guardrails:end -->
