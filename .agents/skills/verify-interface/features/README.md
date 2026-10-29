# Feature map

One file per feature. `covers:` lists the source globs it owns, `docs:` the pages a verdict judges, `journeys:` the journeys it runs, and `seeded-breaks/<feature>.patch` the break its journeys must catch. `pnpm exec antelopejs-verify map` checks that every user-facing file is covered.

| Feature | What the user does | Journeys |
|---|---|---|
| [inspect](inspect.md) | A module author asks which database the provider is connected to, which relations it holds and how one is built. | inspect-calls, inspect-shapes |
| [profile](profile.md) | A module author measures a relation's columns and checks an undeclared reference. | profile-calls, profile-shapes |
| [sample](sample.md) | A module author shows a person a few rows of a relation. | sample-calls, sample-shapes |
| [sample-limits](sample-limits.md) | The bounds on rows and text length a sample answers. | sample-limits |
| [smoke](smoke.md) | The fixed journey every verdict runs: load the packed interface with a stub provider, call every function, check the release rule. | every-function, minor-bump |
