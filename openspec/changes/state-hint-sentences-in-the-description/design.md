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

### Unequal (2026-11-14, `59c6af093`)

- **Stated whole, no override.** Its two sentences became four fact arms,
  because which sentence a struck square takes is a fact of that square
  (which end of the sign it is, and whether the bound is the value's
  extreme). The technique was restated so the struck end is a `forall`
  binder (`forall c in {big, small}`); the word dump stayed byte-identical.
- **The sign's two cells are a per-fact term** (`{c, the(p in {big, small}
  where p != c)}`), so the outline lists the struck end first as before; a
  firing term `{big, small}` moved the highlight's cell order on every
  `lesser` step, which is invisible but moves the fingerprint.
- **The compiler cannot import `hint-words.ts`** (the describe script runs
  under Node's type stripping, which refuses parameter properties), so the
  clause grammar is its own module, `stated-clauses.ts`.
- **Library modules carry no `STATED`**: a library technique's words are for
  later, when a library technique brings one wording to every game.

### Singles, stated (2026-11-14)

- **Stated whole, no override**; its `hint-text.ts` goes. The word dump is
  byte-identical to HEAD's at 8 deals (10,584 lines) and at 80 (105,828
  lines, every rung met, `corner.across` only at 80).
- **Wordings, as read below, with one addition**: a part a wording leaves
  out is the clauses beside the list. `corner.four` then states its look
  once and `offset` its four combinations in three wordings. Unequal's fact
  `arms` became fact `wordings`, and `STATED` holds both by index.
- **`offset` gained two terms**, `p` and `q`, the numbers of the squares it
  decides, for "both 3s": `{each}` lists every number ("3 and 3"), so an
  equal pair needs its number named. Its `along` and `beside` terms went:
  the words read its outline. A reference word that says "both 3s" for an
  equal pair would make the two terms unneeded; not grown yet, one game
  wants it.
- **`{unit}` is the engine's**: a striped line of squares is a row or a
  column by its squares, so no game declares it.
- **`corner.four`'s second and third wordings are met by no walk** at 80
  deals: when the corner or the square across is already decided,
  `besideCovered` and `sameLine` fire first. The old code had the same
  branches; the clauses were checked against it by reading.
- **Nothing the form could not state.**

### Singles, read before it is stated (2026-11-14)

Every Singles sentence fits the form with one growth: **wordings**, an
ordered list of clause sets, each with an optional `when` over the binding,
the technique's terms and its marks (by role name), the first that holds
winning, and **not a new step kind**. An arm is a different deduction (its
own rung, `corner.apex`); a wording is the same deduction said for what the
board shows. Singles needs it three ways:

- `sameLine`: whether a line is striped (`when: "|stripes| > 0"`).
- `corner.four`: which of the corner and the square across the firing
  decides (`not known(c)`, `not known(i)`), which picks ring or outline for
  each and whether the move says "like the outlined …".
- `offset`: whether the two pairs' numbers are equal ("the outlined 3s"
  against "the outlined 3s and 4s"), and whether the two ringed squares'
  are ("both 3s" against "the 3 and 4").

The fact `arms` Unequal uses are the same thing at the fact, so they become
the fact's `wordings`, and `STATED` holds a kind's wordings by index
(`says.wording`, `fact.wording`). Terms must be in scope for a `when`, so the
compiler binds each term and mark to a `const` where a technique has
wordings. The engine side: `describedFiringHint` takes the module's `STATED`
and the game's words (`shows`: the number a square shows; `unit`: row or
column), speaks every kind the table states, and the game's `sentences`
keeps only overrides.

The clauses, drafted against `singles/hint-text.ts`:

```yaml
besideCovered:
  look: "{outline: a {shaded} square (outlined)} touches {ring: this {each} | these squares ({each})}"
  move: "{ring: that {each} | those squares} must be {unshaded}"
sameLine:
  wordings:
    - when: "|stripes| > 0"
      look: "{outline: the outlined {unshaded} {n}} already holds {stripes}'s {n}"
      move: "{ring: the ringed {n} | the ringed {n}s} must be {shaded}"
    - look: "{outline: the outlined {unshaded} {n}} shares a line with {ring: the ringed {n} | each ringed {n}}"
      move: "{ring: that {n} | those {n}s} must be {shaded}"
sandwich:
  look: "{outline: the outlined {n} | the outlined {n}s} sit one square apart"
  follows: "one of them must be {shaded}"
  move: "{ring: the {each} between them | the squares between them} must be {unshaded}"
pair:
  look: "{outline: the outlined {n} | the outlined {n}s} touch"
  follows: "one of them stays {unshaded} and uses up the {n} in {stripes}"
  move: "{ring: the ringed {n} | the ringed {n}s} must be {shaded}"
corner.four:            # terms n, corner, sides, inner
  wordings:
    - when: "not known(c) and not known(i)"
      look: "Left {unshaded}, {ring corner: this corner {n}} would box itself in with {outline sides: its two {n}s} {shaded}"
      move: "it and {ring inner: the {n} diagonally inside} must be {shaded}"
    - when: "not known(c)"
      look: "(the same)"
      move: "it must be {shaded}, like {outline inner: the outlined {n} diagonally inside}"
    - look: "Left {unshaded}, {outline corner: the outlined corner {n}} would box itself in with {outline sides: its two {n}s} {shaded}"
      move: "{ring inner: the {n} diagonally inside} must be {shaded}"
corner.apex:
  look: "Left {unshaded}, {ring: this corner {corner}} would box itself in with {outline: both {beside}s beside it} {shaded}"
  move: "it must be {shaded}"
corner.across:
  look: "Left {unshaded}, {ring: this inner {inner}} would make {outline: both {beside}s} flanking {strand: corner {corner}} {shaded} and box the corner in"
  move: "it must be {shaded}"
corner.pairAtS/T:
  look: "{outline pair: the corner's {number}s} need a {shaded}; shading {ring: this {each}} forces {outline side: the side {number}}, boxing {strand: the corner} in"
  move: "it must stay {unshaded}"
boxedIn:
  look: "{ring: this {number}} is {outline: the outlined {unshaded} square}'s last neighbor that isn't {shaded}"
  move: "it must be {unshaded} to keep that square joined"
split:
  look: "Shading {ring: this {number}} would cut some of {outline: the outlined square | the outlined squares} off from the rest of the {unshaded} region"
  move: "it must be {unshaded}"
offset:                 # wordings by first = second, and by the ringed pair's numbers
```
