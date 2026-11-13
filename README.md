<a href="https://github.com/AntelopeJS/antelopejs"><img data-illustration src="./.github/readme/strip.svg" width="100%" alt="INTERFACE · DATABASE CATALOG: part of AntelopeJS, hexagonal architecture beyond your own code. A glowing button reads Star AntelopeJS."></a>

<div align="center">

# `@antelopejs/interface-database-catalog`

<a href="https://www.npmjs.com/package/@antelopejs/interface-database-catalog"><img data-illustration alt="npm" src="https://img.shields.io/npm/v/@antelopejs/interface-database-catalog?style=for-the-badge&labelColor=000000&color=000000"></a> <a href="./LICENSE"><img data-illustration alt="License" src="https://img.shields.io/badge/License-Apache_2.0-000000?style=for-the-badge&labelColor=000000"></a> <a href="https://discord.gg/g4pFt6eXqu"><img data-illustration alt="Discord" src="https://img.shields.io/badge/Discord-18181B?logo=discord&style=for-the-badge&color=000000"></a> <a href="https://github.com/AntelopeJS/interface-database-catalog/tree/main/docs"><img data-illustration alt="Docs" src="https://img.shields.io/badge/Docs-18181B?style=for-the-badge&color=000000"></a> <a href="https://github.com/AntelopeJS/antelopejs"><img data-illustration alt="Star AntelopeJS" src="https://img.shields.io/github/stars/AntelopeJS/antelopejs?label=Star%20AntelopeJS&style=for-the-badge&labelColor=000000&color=000000&logo=github"></a>

**Describes and profiles a database that an AntelopeJS database provider is connected to but does not own, so a generator can propose matching tables.**

[Documentation](./docs/index.md) · [Implementations](#implementations) · [All interfaces and providers](https://github.com/AntelopeJS/antelopejs#ecosystem)

</div>

Describes and profiles a database that an [`@antelopejs/interface-database`](https://github.com/AntelopeJS/interface-database) provider is connected to but does not own, so a generator can propose a module whose tables mirror it. It is a development tool: every function refuses outside development.

## What it offers

- `Info` returns the engine, version, database and role of the connection.
- `ListRelations` lists every relation with its kind, row estimate, key and write privileges, and says why a relation cannot be registered when it cannot.
- `DescribeRelations` details columns with their native types and the `@Field` declarations they accept, indexes and foreign keys.
- `Profile` aggregates a relation per column and per foreign key, never returning rows.
- `CheckReference` measures how much of one column's values another column holds, for references the database does not declare.
- `SampleRows` answers a few rows of a relation, each value as text, for a person to look at. It is the one function that returns rows, and it is never meant for a generator or a model.

The answers follow the provider's own registration rules. A relation the catalog calls mappable registers, and the key it names is the one `_id` aliases.

## Implementations

`@antelopejs/postgres`, `@antelopejs/mongodb` and `@antelopejs/rethinkdb` implement this interface next to `@antelopejs/interface-database`. Each lists it under `antelopeJs.implements` in its `package.json`. Another provider of `@antelopejs/interface-database` that connects to a database it does not own can implement it as well.

## Install

Add the package to the module that reads the catalog:

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

- [Overview and provider connections](./docs/index.md)

## Compatibility

The interface has one AntelopeJS peer dependency:

<!-- antelopejs-docs-compat:start -->

| Package                      | Supported        | Tested with |
| ---------------------------- | ---------------- | ----------- |
| `@antelopejs/interface-core` | `>=0.2.4 <1.0.0` | `0.4.0`     |

<!-- antelopejs-docs-compat:end -->

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before you open a pull request. The local checks are:

```bash
pnpm install
pnpm run checks
```

## Part of AntelopeJS

[AntelopeJS](https://github.com/AntelopeJS/antelopejs) is a TypeScript framework where modules depend on contracts and the application chooses the provider behind each one. [AntelopeJS DMS](https://github.com/AntelopeJS/dms), the open-source back office, is built on it.

<!-- antelopejs-framework-modules:start -->

| Area         | Contracts                                                                                                                                                                                                                                                                                                                                                          | Providers                                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API          | [`interface-api`](https://github.com/AntelopeJS/interface-api) · [`interface-api-util`](https://github.com/AntelopeJS/interface-api-util) · [`interface-data-api`](https://github.com/AntelopeJS/interface-data-api)                                                                                                                                               | [`api`](https://github.com/AntelopeJS/api)                                                                                                                                                                                                          |
| Auth         | [`interface-auth`](https://github.com/AntelopeJS/interface-auth)                                                                                                                                                                                                                                                                                                   | [`auth-jwt`](https://github.com/AntelopeJS/auth-jwt)                                                                                                                                                                                                |
| Database     | [`interface-database`](https://github.com/AntelopeJS/interface-database) · [`interface-database-decorators`](https://github.com/AntelopeJS/interface-database-decorators) · **`interface-database-catalog`** · [`interface-mongodb`](https://github.com/AntelopeJS/interface-mongodb) · [`interface-rethinkdb`](https://github.com/AntelopeJS/interface-rethinkdb) | [`postgres`](https://github.com/AntelopeJS/postgres) · [`mysql`](https://github.com/AntelopeJS/mysql) · [`mongodb`](https://github.com/AntelopeJS/mongodb) · [`rethinkdb`](https://github.com/AntelopeJS/rethinkdb)                                 |
| Redis        | [`interface-redis`](https://github.com/AntelopeJS/interface-redis) · [`interface-redis-scheduler`](https://github.com/AntelopeJS/interface-redis-scheduler)                                                                                                                                                                                                        | [`redis`](https://github.com/AntelopeJS/redis)                                                                                                                                                                                                      |
| Email        | [`interface-email`](https://github.com/AntelopeJS/interface-email)                                                                                                                                                                                                                                                                                                 | [`nodemailer`](https://github.com/AntelopeJS/nodemailer) · [`brevo`](https://github.com/AntelopeJS/brevo)                                                                                                                                           |
| File storage | [`interface-file-storage`](https://github.com/AntelopeJS/interface-file-storage)                                                                                                                                                                                                                                                                                   | [`file-storage-local`](https://github.com/AntelopeJS/file-storage-local) · [`file-storage-s3`](https://github.com/AntelopeJS/file-storage-s3)                                                                                                       |
| Payments     | [`interface-payment`](https://github.com/AntelopeJS/interface-payment) · [`interface-subscriptions`](https://github.com/AntelopeJS/interface-subscriptions) · [`interface-stripe`](https://github.com/AntelopeJS/interface-stripe)                                                                                                                                 | [`stripe`](https://github.com/AntelopeJS/stripe) · [`mollie`](https://github.com/AntelopeJS/mollie) · [`checkout-com`](https://github.com/AntelopeJS/checkout-com) · [`payment-subscriptions`](https://github.com/AntelopeJS/payment-subscriptions) |

<!-- antelopejs-framework-modules:end -->

## License

[Apache-2.0](./LICENSE)
