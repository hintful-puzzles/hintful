# Design: building from a game's description

Written 2026-10-29, when the work began, and revised as it went. The
proposal's candidates are piloted on the Latin family. Nothing the app runs
changes; the code is `research/describe/`, run by hand.

## Sections

| Section | What it holds |
| --- | --- |
| The form of a description | JSON, its schema, and the formula syntax |
| What a game still writes | the binding from a game's state to an instance |
| The answer check | what is compared with `status()` and `findMistakes` |
| The ladder | the stated techniques run as a fixpoint, compared with the game's |
| The checker | z3's WebAssembly build, measured before any port |
| Where the code lives | and how it is run |

## The form of a description

**JSON, with a JSON Schema, and formulas as strings in one expression
syntax.** The owner asked for JSON or YAML with a strong schema in place of
the investigation's notation. JSON is chosen over YAML for three reasons:

- If any of this is adopted, the techniques are data the app's deduction
  fixpoint runs, so a description ships in the bundle. Vite imports JSON
  natively; YAML needs a parser in the bundle or a build plugin.
- The owner's model is configuration written and kept by tools and agents,
  not by hand (their comparison was C#'s and Java's XML dependency-injection
  files). JSON's lack of comments and of multi-line strings costs a person
  more than it costs an agent, and a `note` field holds what a comment would.
- Editors validate and complete a JSON file against the schema its `$schema`
  key names, with no plugin.

A formula is a string, not a JSON tree: a tree of `{"forall": …}` objects is
unreadable at the size of one Keen cage rule, and every expression would be
four times as long. The schema names the syntax (`research/describe/README.md`
§ "The formula syntax"), and the loader parses every formula, so a formula
that does not parse fails the load as a schema violation does. The syntax is
the investigation's `language.md` § "Expressions", with aggregates written as
calls (`count(c in L where P)`) so that precedence needs no rule.

The schema states the blocks of `language.md` § "The shape of a
description" that the pilot consumes: sizes, space, answer, givens, marks,
definitions, shape and rules, clue kinds, techniques and tiers. Freedom,
deal and variations are stated as in the notation and consumed by nothing
here.

## What a game still writes

A description says what an instance is in the abstract: a grid of cells,
lines, slots, clues of a kind at elements. A game's state holds the same
facts in its own arrays (`clues: Int32Array` of `4w`, `flags` bits per
cell). The **binding** reads one into the other: the instance's sizes, its
dealt clues, its givens, and a board's values and marks. It is the one thing
each game writes for the description to be consumed, and its size is the
measure of task 2.3.

## The answer check

Three things, compared on boards each game's generator deals at every tier
and size the pilot covers:

1. **`status()` from the rules**: every rule and dealt clue evaluated on a
   full board, against the game's `status()`, on the solution and on mutants
   of it (two cells of a row swapped, one value changed), so that each rule
   is seen to fail where the game says it fails.
2. **The answer from the rules**: a generic search over the description
   finds every answer (up to two) of the dealt board. It must find exactly
   one, the game's solution. `findMistakes` compares the player's entries
   with that answer (`engine/entry-mistakes.ts`), so the description gives
   it once it gives the answer, and the pilot compares the two on boards with
   planted wrong entries and notes.
3. The search is independent of the techniques, so it can judge them. It
   uses one native propagator, for the library predicate `latin`, and
   otherwise evaluates each rule instance on partial boards by trying the
   completions of the cells it reads.

## The ladder

The stated techniques are run as the game's ladder: at a tier cap, every
technique of that tier and below to a fixpoint, lowest tier first. Since every
technique stated is monotone (striking a candidate can only make a premise
truer), the closure at a cap is the same whatever the order, so the pilot
compares **the closures themselves**, cell by cell, with the candidate cube
the game's own solver ends at (`cubeOut`), and not only the grade. A
difference names the technique, the board and the cell.

Unequal is the pilot game: both its modes, and a ladder that is the Latin
engine's (singles, sets, fish, the wing) with one clue technique a mode.

## The checker

The owner's decision on the checker: if this goes ahead, it is ported to
TypeScript with `z3-solver`, and the WebAssembly build's speed on the
heaviest checks (Solo's `wing`, Range's `connect` on 6×6) is measured first.
The measurement is made here, outside the repository's dependencies; the
port is not, since it waits on the owner's decision to go ahead.

## Where the code lives

`research/describe/`, beside the technique checker: a development tool, never
part of the app, run by hand and not by the gate's tests. It is TypeScript
that imports the games, so it joins `tsconfig.node.json`, which the gate
compiles, as `scripts/` does. Its tests run with their own vitest config
(`npx vitest run -c research/describe/vitest.config.ts`), which the gate's
does not include.
