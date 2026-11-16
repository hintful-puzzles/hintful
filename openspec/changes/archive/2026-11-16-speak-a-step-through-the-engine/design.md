# Design

Written 2026-11-16 against the four games' `speak.ts`, the three other callers
of `plannedSentence` (Loopy, Slide, the engine's Latin singles in
`hint-text.ts`), and Solo's and Rome's `hint-text.ts`.

## The call

A compiled module that declares `steps` exports `voice`, bound to its own
`STEPS` and `WORDS`:

```ts
const speak = voice<Point>({ kind: CELL, value: String });
speak.sentence("fullLine", { ring: [at], terms: { v, n }, marks, later });
speak.premise("lineFull", { terms, marks });      // the look a strike joins
speak.part("borderFarWhere", "move", { terms });  // one part, as a fragment
```

- **What is declared once a game** (`Voice<E>`): `kind`, what a reference is
  drawn on; `kinds`, by sort, only where a sort is drawn on another kind (a
  sort the game does not name is drawn on `kind`); `nouns`, by a step's
  `ring` sort, where a step decides something other than the game's cell
  (Loopy's edges, corners and pairs); `value`, `valueNoun`, `regions`,
  `unit`. The module fills `noun` and `alongside` from `WORDS`.
- **What a step is told by** (`Said`): `terms` and `marks` as `StepsById`
  types them, each optional where the step declares none; `ring`, what it
  decides; `later`, `struck` and `closing`.
- **The ring is drawn on the step's `ring` sort**: `kinds[ring] ?? kind`, and
  named `nouns[ring] ?? noun`.
- A game whose words vary by the board (Salad's mode, the Latin singles'
  regions) makes a voice for them; it costs an object.

Rejected: a context argument per call (what the four adapters did, and why
each held one), and one engine function taking `STEPS` (the casts were there
because `STEPS` is typed over `unknown`; the module's `voice` instantiates it
at the game's `E`, which is assignable since a `when` only reads).

Solo's `intersect` and `set` stripe a region named by its kind, and Rome's
words name a direction and its neighbor: both fit (`stripes` with a unit term;
a game's `value` printer for the direction). Rome's neighbor ("the square
above") is a second word for one value, which a phrase over a unit-like term
would not give; it waits for Rome.

## A unit term

A step's term may be of kind `unit`: one of `row`, `column`, `block`,
`diagonal`, said as that word. `StepsById` types it as that union, so a
mistyped name is a type error. `{if col: column | row}` becomes `{line}`, and
the other axis, where a sentence names both, is a second term.

## Phrases

A description's `phrases:` maps a name to clause source. `{name}` in any
clause (a step's or a technique's) is replaced by it before the clause is
checked or emitted, so a phrase may hold anything a clause holds and is
checked where it is used. A term or a lexicon word named like a phrase is
refused, and so is a phrase that names itself.

## Supplied terms

`# supplied` becomes `{ supplied: flag | number | element | elements }` in a
`says`'s `terms`, `{ supplied: elements }` in its `marks`. The compiler writes
the placeholder itself and types what each technique is supplied in
`SuppliedById`; the hook that supplies them (Boats' reason callback,
`describedEdgeHint`'s `supplied`, one function a technique) is typed to
return them, so leaving one out does not compile.

`multi` was a supplied flag the engine set by its name. It is declared
`{ supplied: several }`, the engine's kind: `STATED` lists such terms by
kind, and the engine sets each to whether the firing decides more than one
element (several legs, or one leg ringing several), which is what Palisade's
legs and Path's and Pearl's own `multi` had each said.

A term the game re-reads from a formula (Tracks adds the rim's sides to the
sides a formula finds) is two terms: the description's, under its own name,
and the supplied one the sentence names.

## Wording

A sentence that changes is listed in `tasks.md` with its before and after,
from the word dumps.
