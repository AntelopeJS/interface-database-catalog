# Interface Database Catalog

<div align="center">
<a href="https://www.npmjs.com/package/@antelopejs/interface-database-catalog"><img src="https://img.shields.io/npm/v/@antelopejs/interface-database-catalog?style=for-the-badge&labelColor=000000&color=000000" alt="npm"></a>
<a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/sjK28QHrA7"><img src="https://img.shields.io/badge/Discord-18181B?logo=discord&style=for-the-badge&color=000000" alt="Discord"></a>
<a href="./docs/index.md"><img src="https://img.shields.io/badge/Docs-18181B?style=for-the-badge&color=000000" alt="Documentation"></a>
</div>

Describes and profiles a database that a provider of `@antelopejs/interface-database` is connected to but does not own: its relations, columns, keys, references and row estimates, and aggregates over its data. It is a development tool: a generator reads it to propose and write a module whose tables mirror the database, and every function refuses outside development.

The answers are the provider's own registration rules. A relation the catalog calls mappable registers, the declarations it lists for a column are the ones registration accepts, and the key it names is the one `_id` aliases.

## Installation

```bash
pnpm add @antelopejs/interface-database-catalog
```

## Documentation

- [Overview](./docs/index.md)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
