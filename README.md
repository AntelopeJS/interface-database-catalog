# @antelopejs/interface-database-catalog

<div align="center">
<a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache_2.0-000000?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/sjK28QHrA7"><img alt="Discord" src="https://img.shields.io/badge/Discord-18181B?logo=discord&style=for-the-badge&color=000000"></a>
<a href="https://github.com/AntelopeJS/interface-database-catalog/tree/main/docs"><img alt="Docs" src="https://img.shields.io/badge/Docs-18181B?style=for-the-badge&color=000000"></a>
</div>

Describes and profiles a database that an [`@antelopejs/interface-database`](https://github.com/AntelopeJS/interface-database) provider is connected to but does not own, so a generator can propose a module whose tables mirror it. It is a development tool: every function refuses outside development.

## What it offers

- `Info` returns the engine, version, database and role of the connection.
- `ListRelations` lists every relation with its kind, row estimate, key and write privileges, and says why a relation cannot be registered when it cannot.
- `DescribeRelations` details columns with their native types and the `@Field` declarations they accept, indexes and foreign keys.
- `Profile` aggregates a relation per column and per foreign key, never returning rows.
- `CheckReference` measures how much of one column's values another column holds, for references the database does not declare.

The answers follow the provider's own registration rules: a relation the catalog calls mappable registers, and the key it names is the one `_id` aliases.

## Implementations

No public module implements this interface yet. A provider of `@antelopejs/interface-database` that connects to a database it does not own can implement it as well.

## Install

The package is not published to npm yet. Once it is, add it to the module that reads the catalog:

```bash
pnpm add @antelopejs/interface-database-catalog
```

## Quick start

```ts
import { ListRelations } from "@antelopejs/interface-database-catalog";

export async function listMappableRelations() {
  const relations = await ListRelations(["public"]);
  return relations
    .filter((relation) => !relation.unmappable)
    .map((relation) => `${relation.schema}.${relation.name}`);
}
```

Relations are named `"schema.name"`, the form `DescribeRelations` and `Profile` take.

## Documentation

- [Overview](https://github.com/AntelopeJS/interface-database-catalog/blob/main/docs/index.md)

## Compatibility

| Package                             | Range            |
| ----------------------------------- | ---------------- |
| `@antelopejs/interface-core` (peer) | `>=0.2.0 <1.0.0` |
| `@antelopejs/core`                  | `>=1.14.0`       |

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before you open a pull request. The local checks are:

```bash
pnpm install
pnpm lint
pnpm typecheck
```

## License

[Apache-2.0](./LICENSE)
