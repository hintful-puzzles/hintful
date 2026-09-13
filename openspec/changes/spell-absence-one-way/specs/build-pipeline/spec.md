## ADDED Requirements

### Requirement: The gate holds absence to one spelling

The repository SHALL carry `scripts/checks/absence-spelling.mjs`, run in the gate's fast prefix, and it SHALL fail on two shapes across every tracked TypeScript file. The first is `undefined` written as a member of a union type anywhere but inside a cast, which is the `ts-engine` rule "Absence has one spelling" held by syntax. The second is a strict comparison against `null` or `undefined` whose other operand's type holds the other word and not this one. That comparison is always false, the typechecker accepts it, and it is exactly what a respelling leaves behind.

Its exceptions SHALL be derived from syntax and never listed: a cast describes a value the language produced, a comparison against an index read is a bounds check while `noUncheckedIndexedAccess` is off, and an operand whose type is generic, `any` or `unknown` has no absent word the checker can know. It SHALL prove both halves on every run against fixtures parsed in memory, and SHALL floor the files, unions and comparisons it examined, so a scan that stops matching fails instead of reporting a clean tree.

#### Scenario: a respelled helper leaves a dead comparison

- **WHEN** a function's declared return moves from `T | undefined` to `T | null` and a caller still tests `=== undefined`
- **THEN** the gate fails naming the comparison and the operand's type, although `tsgo` passes

#### Scenario: a cast is not a declaration

- **WHEN** a render function reads `hint?.highlights as MyHint | undefined`
- **THEN** the guard does not report it, however deep inside an inline type the union sits

#### Scenario: the guard stops seeing the tree

- **WHEN** the file listing, the parse or the program load examines fewer files, unions or comparisons than its floor
- **THEN** the guard fails and says which floor, rather than passing
