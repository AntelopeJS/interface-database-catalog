# Interface Database Catalog

## Reaching a provider

A module that implements `@antelopejs/interface-database` over a database it does not own may also implement this interface. A consumer reaches it through a connection declared in the project configuration, one per database:

```ts
"dms-ai": {
  importOverrides: [
    { interface: "@antelopejs/interface-database-catalog", source: "postgres-erp", id: "erp" },
  ],
},
```

`GetInterfaceInstances(interfaceID)` lists connections visible to the calling module. `GetInterfaceInstance(interfaceID, connectionID)` returns connection metadata, including its loadable `path`, or `undefined`; it does not return the catalog exports. Resolve the connection by package name and load its path using AntelopeJS's established CommonJS loader pattern:

```ts docs-check
import { GetInterfaceInstance } from "@antelopejs/interface-core";

export async function inspectErp() {
  const connection = GetInterfaceInstance(
    "@antelopejs/interface-database-catalog",
    "erp",
  );
  if (!connection) throw new Error("Missing erp catalog connection");

  const catalog: typeof import("@antelopejs/interface-database-catalog") = require(
    connection.path,
  );
  return await catalog.ListRelations(["public"]);
}
```

Run this inside the consuming AntelopeJS module, with the provider loaded and the connection configured. A plain package import uses that module's default binding; loading `connection.path` selects the named binding. These calls do not create database connections themselves.

## Functions

| Function                          | Answers                                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Info()`                          | engine, version, database and role of the connection                                                                                                   |
| `ListRelations(schemas?)`         | every relation, partitions left out: kind, row estimate and its source, key, write privileges, comment, and why it cannot be registered when it cannot |
| `DescribeRelations(relations)`    | the named relations in full: columns with their native types and the declarations they accept, indexes, foreign keys out and in                        |
| `Profile({ relation, columns? })` | aggregates per column and per foreign key, and the traits they imply                                                                                   |
| `CheckReference({ from, to })`    | how much of one column's values another column holds, for a reference the database does not declare                                                    |

Relations are named `"schema.name"`.

## What a profile answers

A profile holds aggregates, never rows:

- counts, null counts and distinct counts;
- the ends of number, date and enum columns, never of text columns;
- rows per month for date columns;
- lengths of text values;
- children per parent over each foreign key.

Values appear only as enum labels and as **categories**: the most frequent values of a column with few distinct values, each counted often enough to be a category rather than a record. Rarer values are folded into `other` and never named.

Every measure has a time bound. A measure that does not finish answers `{ status: "timeout" }`, and the rest of the profile stands. A large relation is sampled, and `sample` says by how much. A distinct count from a sample is then a lower bound.

## Refusals

Every function refuses:

- outside development;
- on a provider instance that owns its tables.
