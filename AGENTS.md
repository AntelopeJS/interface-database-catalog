# interface-database-catalog

`@antelopejs/interface-database-catalog` declares an AntelopeJS interface that describes and profiles a database an `@antelopejs/interface-database` provider is connected to but does not own. The whole contract is `src/index.ts`: types, constants, and `InterfaceFunction` declarations, with no implementation. Providers implement it elsewhere.

## Layout

- `src/index.ts` is the published contract, built to `dist/`.
- `docs/` ships in the npm package and is the documentation the README links to. The fenced `ts docs-check` blocks in `docs/` compile in CI against `docs/tsconfig.json`, which maps the package name onto `src/index.ts`. Change a signature, and update the examples that call it.

## Versioning

`@antelopejs/interface-core` is a peer dependency, not a dependency: the consuming module supplies it. The README's compatibility table, under the `docs-compat` marker, mirrors its range, and the CI documentation check fails when the two differ. Every `@antelopejs/*` range stops below the next minor of its floor: `>=0.5.0 <0.6.0` on a 0.x package, `~1.23.3` on a 1.x one. The `dependency:ranges` step of `pnpm run checks` enforces it.

## Tests

There is no test suite. `pnpm test` runs `pnpm run build`, so `pnpm run checks` proves the package builds with its declarations.

`pnpm run checks` does not run the documentation check (docs examples and the compatibility table); only CI does. To run it locally, clone AntelopeJS/tooling-configs at `v0.0.9`, run `npm ci --prefix actions/docs` in the clone, then from this repository run `node <clone>/actions/docs/check.mjs --files $'README.md\ndocs' --typescript-project docs/tsconfig.json`.

<!-- antelopejs-guardrails:start -->
<!-- Managed by @antelopejs/tooling-configs. `antelopejs-sync` rewrites everything between these markers; write repository-specific guidance outside them. -->

## Guardrails

CI runs `pnpm run checks` in full on every pull request and reports what failed. The commit hook formats and lints the staged files. Locally, check only what you touched, one test file and not the suite, as the [`verify-changes`](.agents/skills/verify-changes/SKILL.md) skill says.

### Comments

Say it in code: a constraint in a type, a lint rule or a test, a public item's contract in TSDoc. Other comments are lint directives naming their rules, `@ts-expect-error <reason>`, `SAFETY: <reason>` above a type assertion, and license or tool directives. A reason states what the code does now.

### Tests

Each test names the wrong implementation it fails on, or is deleted. Drive behaviour through the public interface. An invariant over many files is a lint rule.

### Review

No tool checks these:

- A type guard checks the nested elements and values it claims.
- A no-upward import rule rejects same-tier peers; probe it with an import.
- A finding only an evasion or a patched internal can trigger goes under Attention and never blocks.

### Suppressions

`guardrails.suppressions.json` caps lint directives, `@ts-expect-error`, `SAFETY:` comments and rules a lint config turns off. Over a cap, fix the code or remove another suppression of that kind; only the operator raises a number. After removing suppressions, run `pnpm run suppressions:update` and commit the file.

<!-- antelopejs-guardrails:end -->
