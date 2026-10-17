# Inspect an existing database

Use `@antelopejs/interface-database-catalog` to discover relations, inspect their structure, and profile aggregate characteristics before mapping an existing database into an application. The catalog describes a provider's connection; it does not open a new connection, register tables, or return raw records.

## Before you begin

Run inside an AntelopeJS module in development, connected to a provider that implements this catalog and does not own its tables. Every catalog function refuses outside development or on an instance that owns its tables. These are safety boundaries, not configuration errors to work around in production.

## Explore in increasing detail

| Step                                      | Call                             | Use the answer to…                                               |
| ----------------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| 1. Identify the connection                | `Info()`                         | Confirm the engine, database, and role before inspecting data.   |
| 2. Select a relation                      | `ListRelations(schemas?)`        | Review names, keys, write privileges, and mapping refusals.      |
| 3. Understand its structure               | `DescribeRelations(relations)`   | Inspect field declarations, indexes, and declared relationships. |
| 4. Measure only what you need             | `Profile({ relation, columns })` | Inspect aggregates and traits for selected columns.              |
| 5. Investigate an undeclared relationship | `CheckReference({ from, to })`   | Measure value containment without declaring a foreign key.       |

Start with metadata before requesting profiles. Use qualified relation names such as `"public.orders"`; omitting `columns` profiles all columns of the selected relation.

## Inspect one relation

This example uses the consuming module's default catalog binding. First inspect the relation list, then pass a name it returned to `inspectRelation`, such as `"public.orders"`. It reads metadata only; profiling is a separate, potentially more expensive step.

```ts docs-check
import {
  Info,
  ListRelations,
  DescribeRelations,
} from "@antelopejs/interface-database-catalog";

export async function listDatabase() {
  return { connection: await Info(), relations: await ListRelations() };
}

export async function inspectRelation(relation: string) {
  const descriptions = await DescribeRelations([relation]);
  return descriptions.map((description) => ({
    relation: `${description.schema}.${description.name}`,
    key: description.key,
    writes: description.writes,
    columns: description.columns,
    unmappable: description.unmappable,
  }));
}
```

Review `unmappable`, each column's `accepts` and `lossy` notes, and write permissions before generating table declarations. A missing key is not automatically a mapping refusal: such a relation can register without `_id`. Introspection does not grant permissions or add constraints.

## Advanced: select a named provider

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

| Function                          | Answers                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Info()`                          | engine, version, database and role of the connection                                                                            |
| `ListRelations(schemas?)`         | visible relations (excluding child partitions), row estimates, keys, write privileges, and mapping refusals                     |
| `DescribeRelations(relations)`    | the named relations in full: columns with their native types and the declarations they accept, indexes, foreign keys out and in |
| `Profile({ relation, columns? })` | aggregates per column and per foreign key, and the traits they imply                                                            |
| `CheckReference({ from, to })`    | whether one column's non-null values occur in another, without assuming a declared foreign key                                  |

Relations are named `"schema.name"`.

## What a profile answers

A profile holds aggregates, never rows:

- counts, null counts and distinct counts;
- the ends of number, date and enum columns, never of text columns;
- rows per month for date columns;
- lengths of text values;
- children per parent over each foreign key.

Values appear only as enum labels and as **categories**: the most frequent values of a column with few distinct values, each counted often enough to be a category rather than a record. Rarer values are folded into `other` and never named.

### Interpret incomplete measurements

Every measure has its own time bound. Handle its status before reading a value; a failed measure does not invalidate the rest of a profile.

| Status      | Available data | Interpretation                                                                      |
| ----------- | -------------- | ----------------------------------------------------------------------------------- |
| `"ok"`      | `value`        | The measure completed. Check sampling and exactness before treating it as a census. |
| `"timeout"` | No value       | The time bound expired; this is not a zero count.                                   |
| `"error"`   | `code`         | The database refused the measure; only its error code is exposed.                   |

A large relation is sampled, and `sample` reports the percentage and row count. A distinct count from a sample is a lower bound. Row counts also carry an `exact` flag. `CheckReference` reports containment and whether the target is a key; it does not prove that the database enforces a foreign key.

## Refusals

Every function refuses:

- outside development;
- on a provider instance that owns its tables.
