## The direction: schema to types

The schema is the source and the TypeScript is generated from it.

- **It keeps the JSDoc an editor shows on both sides.** A description is
  written in YAML, where the YAML language server shows each key's schema
  `description`; `json-schema-to-typescript` writes each one as the JSDoc of
  the generated field, so the code that reads the key shows the same words.
  Generating the other way would make the TS comments the source and the
  schema's descriptions their copy, read by the writer of the file, the
  more frequent reader.
- **The schema says what a type cannot**: minimums, patterns, `if`/`then`,
  `dependentRequired`, a branch that only requires. Types to schema would
  need each restated as a JSDoc annotation, a second language for the same
  statement; schema to types drops them (`schema-types.ts`'s `typed`), and
  the validator still holds a file to them.

## No committed copy, so nothing to hold together

The types are written by `npm run describe` into `src/generated/`, as the
compiled modules are: never committed, written by every command that reads
them (the typecheck's `pretypecheck` among them). There is no second copy to
drift, so the check the task named is the typecheck itself: a field the code
reads that the schema lacks fails it, naming the field. Seen to fail on a
plant (2026-11-24): `deal.unpair` renamed in the schema failed
`compile-fill.ts` and `fill/sample.ts` at `unpair`.

## What `description.ts` keeps by hand

Only what `load.ts` adds to a file: a technique a kind of rule expanded to
(`plant`, `fromKind`), the terms `{broke}` adds, the techniques of a
variation as loaded; and which fields a formal, planning or help-only
description states (`Stated`). Every other type is a name for a part of the
generated ones.

`SettingJson` is the schema's union of kinds with each kind's absent fields
readable as `undefined` (`Readable`), since the settings code reads fields
several kinds share without first asking the kind.

## What the generator is given

`json-schema-to-typescript` reads a subset of 2020-12, so `typed` rewrites
the schema first: validation-only keywords dropped, a node's `required`
pushed into its branches, a `$ref` with siblings written as the `allOf` it
is, and an index signature widened to the named fields beside it. Each is
a comment there.
