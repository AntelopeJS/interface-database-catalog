---
title: Inspect an existing database
description: Discover, describe and profile the relations of a database that an interface-database provider is connected to but does not own.
mode: how-to
---

Use `@antelopejs/interface-database-catalog` to discover relations, inspect their structure, and profile aggregate characteristics before mapping an existing database into an application. The catalog describes a provider's connection. It does not open a new connection or register tables. It returns no raw records, except through `SampleRows`, which answers a few rows for a person to look at.

## Before you begin

Run inside an AntelopeJS module in development, connected to a provider that implements this catalog and does not own its tables. Every catalog function refuses outside development or on an instance that owns its tables. These refusals are safety boundaries. Do not work around them in production.

## Explore in increasing detail

| Step                                      | Call                             | Use the answer to…                                               |
| ----------------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| 1. Identify the connection                | `Info()`                         | Confirm the engine, database, and role before inspecting data.   |
| 2. Select a relation                      | `ListRelations(schemas?)`        | Review names, keys, write privileges, and mapping refusals.      |
| 3. Understand its structure               | `DescribeRelations(relations)`   | Inspect field declarations, indexes, and declared relationships. |
| 4. Measure only what you need             | `Profile({ relation, columns })` | Inspect aggregates and traits for selected columns.              |
| 5. Investigate an undeclared relationship | `CheckReference({ from, to })`   | Measure value containment without declaring a foreign key.       |

Read the metadata before you request a profile. Name relations with their schema, such as `"public.orders"`. A profile without `columns` covers every column of the relation.

## Inspect one relation

This example uses the consuming module's default catalog binding. First inspect the relation list, then pass a name it returned to `inspectRelation`, such as `"public.orders"`. It reads metadata only. A profile is a separate step, and it can cost more.

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

Before you generate table declarations, review `unmappable`, each column's `accepts` and `lossy` notes, and the write permissions. A relation without a key is not refused for that reason alone. It registers without `_id`. Reading the catalog grants no permission and adds no constraint.

## Advanced: select a named provider

A module that implements `@antelopejs/interface-database` over a database it does not own may also implement this interface. Each consumer reaches it through a connection declared on its own module entry in the project configuration, one per database. Two consumers of the same database give their connections the same id:

```ts fragment
"dms-builder": {
  importOverrides: [
    { interface: "@antelopejs/interface-database-catalog", source: "postgres-erp", id: "erp" },
  ],
},
"dms-ai": {
  importOverrides: [
    { interface: "@antelopejs/interface-database-catalog", source: "postgres-erp", id: "erp" },
  ],
},
```

`GetInterfaceInstances(interfaceID)` lists connections visible to the calling module. `GetInterfaceInstance(interfaceID, connectionID)` returns the connection's metadata, including the `path` to load, or `undefined`. It does not return the catalog exports. Look the connection up by package name, then `require` its `path`:

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

Run this inside the consuming AntelopeJS module, with the provider loaded and the connection configured. `require` returns an untyped value, and the annotation states its shape without checking it. It holds because `connection.path` resolves to this interface package, bound to the connection's provider. A plain package import uses the module's default binding, and loading `connection.path` selects the named binding. These calls do not open database connections.

## Functions

| Function                                    | Answers                                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Info()`                                    | engine, version, database and role of the connection                                                                            |
| `ListRelations(schemas?)`                   | visible relations (excluding child partitions), row estimates, keys, write privileges, and mapping refusals                     |
| `DescribeRelations(relations)`              | the named relations in full: columns with their native types and the declarations they accept, indexes, foreign keys out and in |
| `Profile({ relation, columns? })`           | aggregates per column and per foreign key, and the traits they imply                                                            |
| `CheckReference({ from, to })`              | whether one column's non-null values occur in another, without assuming a declared foreign key                                  |
| `SampleRows({ relation, columns?, limit })` | a few rows, each value as text, for a person to look at; never for a generator or a model                                       |

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

Every measure has its own time bound. Check its status before you read a value. A failed measure leaves the rest of the profile standing.

| Status      | Available data | Interpretation                                                                      |
| ----------- | -------------- | ----------------------------------------------------------------------------------- |
| `"ok"`      | `value`        | The measure completed. Check sampling and exactness before treating it as a census. |
| `"timeout"` | No value       | The time bound expired. This is not a zero count.                                   |
| `"error"`   | `code`         | The database refused the measure; only its error code is exposed.                   |

A large relation is sampled, and `sample` reports the percentage and the row count. A distinct count from a sample is a lower bound. Row counts also carry an `exact` flag. `CheckReference` answers a `Measure` too. Its value reports containment and whether the target is a key. It does not prove that the database enforces a foreign key.

## What a sample answers

`SampleRows` is the one function that answers row values. It is meant for a person who decides what a relation's columns hold, never for a generator or a model:

- at most `SAMPLE_ROWS_LIMIT` (20) rows;
- every value as text, cut at `SAMPLE_TEXT_LENGTH` (200) characters, and `truncated` when it was;
- a binary value as its length only;
- a large relation is sampled as a profile is, and `sample` says so.

The interface does not fix how the provider reads the rows. `@antelopejs/postgres` reads them in one read-only transaction under the time bound of a measure, and throws when the read does not finish.

## Refusals

Every function refuses:

- outside development;
- on a provider instance that owns its tables.
