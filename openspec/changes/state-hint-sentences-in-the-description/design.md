# Design

Written 2026-11-14 at `cab3810d2`, from reading `engine/hint-words.ts`,
`engine/described-firing-hint.ts`, `engine/described-hint.ts`,
`describe/compile.ts` (the `says` emission) and the three trial games'
`hint-text.ts`. Each claim about the code is a reading; re-check it before
relying on it.

## Where the trial games stand

| Game | How its sentences are reached | Sentences | What a sentence branches on |
| --- | --- | --- | --- |
| Unequal | candidate walk; `techniqueRung` turns the `sign` firing into a leg a struck cell, `premise` switches on a reason the game builds from `says.terms` | 2 | which end of the sign is struck (a fact), the bound at the value's extreme |
| Singles | `describedFiringHint`, `sentences[id](FiringSpoken)` | 9 functions, 7 techniques | arm (`corner`), how many ringed squares are left (narrowing), whether a line is striped, the numbers squares show |
| Loopy | its own plan; `narrate` switches on a hand-built `LoopyReason` | 26 | the clue's value (0, 1, k), what a corner meets at its dot, opposite or matching pairs, how many cited corners |

**Loopy has no `says` at all** (none of its techniques states terms or
marks; `build-hint-steps-in-the-engine` left it, with Slant, Net, Ascent,
Mines, Filling, Pattern, Subsets, Guess and Black Box). So the trial's third
game needs its `says` first: that is `build-hint-steps-in-the-engine`'s
work, done here for Loopy because the trial needs it, and kept separate in
the tasks so it is judged by the walk fingerprint before any word moves.

## The form

A sentence is stated where the terms and marks it reads are: on a `says`,
on each of its `arms`, and on its `fact` (the parts a square the firing
decides has of its own). The parts are `Said`'s:

```yaml
says:
  terms: { n: "clue(number, c)" }
  marks: { outline: "{c, e}" }
  look: "{outline: the {n}s} sit one square apart"
  follows: "one of them must be {shaded}"
  move: "{ring: the {n} between them | the squares between them} must be {unshaded}"
  # relation: so          (the default; any Relation the engine knows)
```

- **A part is a clause with slots**, whole, never assembled from fragments
  by English grammar, so a second language is a second file of clauses.
- **`{term}`** is a term, rendered by its sort: a number by the game's value
  words (Unequal's 10 is `A`), a cell by the game's name for a square
  (§ "A game's nouns").
- **`{role}` and `{role: words}`** is a reference to the step's marks of
  that role: `ring` (what the firing decides), `outline`, `stripes`,
  `strand`, and a mark kind the game declares. Bare, its words are the
  lexicon's for the role and the kind's noun: "this square" / "these
  squares" for a ring, "the outlined square" / "the outlined squares" for an
  outline, "this row" / "this column" / "this region" for stripes on a unit.
  With words, `|` splits the form for one element from the form for
  several, chosen by the reference's live elements, so a step the player
  has partly made re-renders (`Narration.narrow`); a slot inside the words
  is a term, or `{each}`, the number each element shows.
- **Lexicon words** a clause names by slot: `{shaded}`, `{unshaded}` (the
  engine's piece names), and a game's value words (`{offMark}`), so a
  clause holds no word the lexicon holds.
- **The slots are checked when the description is compiled**: a slot that
  names no term, role or lexicon word is a describe error, so a clause
  cannot read a value its technique does not state.

The compiled module carries the clauses as data (`SENTENCES`, by kind and
arm), and the engine's `stated.ts` renders them against a firing's
`FiringSpoken`. The arms' `when` stays a compiled formula: which clause a
firing speaks is the description's logic, the words are data.

## The closing clause comes from the fact

Where `move` is not stated, the engine writes it from what the firing
concludes: a `place` of value `v` is "{ring} must be {v's word}", and a
strike is the candidate walk's ", so the {v} must go". A technique states
`move` only where its closing says more than the fact (Singles' `boxedIn`:
"to keep that square joined"; Loopy's "that edge can't be one and the rest
must be lines").

## A game's nouns

A description's `words` block, read by the engine, holds what a game says
that is not the lexicon's:

```yaml
words:
  cell: cell                            # only where the theme needs it; why beside it
  name: "clue(number, c)"               # a square is named by what it shows
  values: { 1: "{shaded}", 2: "{unshaded}" }
```

This replaces the per-game declarations `standardize-hint-vocabulary` left in
code (`LatinVocab.cell`, `notes.cell`, `thisCellNamed("cell")`).

## What stays code

A sentence the form cannot state is an override: the game's `sentences`
entry for that kind, with a comment saying why. The engine speaks the stated
form where one exists, and an override wins only where it is declared, so a
kind cannot have both by accident. Each override found in the trial is
listed in § "What the trial found" with its decision: the form grows, the
technique is restated, or it stays an override.

## Order of work

1. The form in the describe layer and the engine, with Unequal (two clauses,
   per fact). Compared by the hint walk: the words of every step before and
   after.
2. Singles (arms, narrowing, line or no line, value naming).
3. Loopy's `says` (terms and marks only, fingerprint unchanged), then its
   clauses.
4. The comparison for the owner: each trial game's steps, old words beside
   new, on the walks, read in the running app; and the list of what the
   form could not state.

## What the trial found

To be filled in as each game is stated.
