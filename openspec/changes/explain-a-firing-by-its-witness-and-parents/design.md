# Design

Written 2026-11-13 from reading `games/loopy/record.ts`, `games/slant/solver.ts`
(`SlantTrace`, `VWhy`, `MergeWhy`) and `engine/deduction-record.ts` /
`engine/candidate-hint.ts`. Re-check each claim before relying on it.

## The three models, side by side

| | Loopy | Slant | Candidate games |
|---|---|---|---|
| A fact | `CornerFact`, `RelationFact` (ids) | a v-shape struck (`vWhy[sq*4+bit]`), a same-slant merge | a struck candidate (`DeductionRecord`, kind `elim`) |
| Its why | `CornerWhy` / `RelationWhy`, a tagged union per fact | `VWhy`, `MergeWhy` | `reason: unknown`, the game's own |
| Its parents | `parents: number[]` (fact ids) plus ids inside `BoundWitness` | ids inside `VWhy.two.from`, `MergeWhy.clue.pair` | none: the candidate plan re-derives what a struck note rests on |
| Where placed | `hint.ts`: before the step that cites it, dropped if none does | `hint.ts`: the same, by `tick` | the walk's populate/strike steps |
| Made by | hand-written recording solver | hand-written trace | hand-written recording solver |

What is the same: a fact has an **id**, a **kind** (the arm that made it), the
**elements it is about**, and a **parent list of fact ids**. What differs is
only the vocabulary of kinds and the words, and the words are the description's
(`says`). So one model serves all three:

    Fact   = { id, firing, about: elements, parents: fact ids }
    Firing = { technique, arm?, witness, reads: elements, facts: Fact[] }

`witness` is the compiler's: which arm of an `or` held, which member an
`exists` held for, which `with` rule broke and at which element. `reads` is the
elements the formula read. `parents` is *derived*: a firing's parents are the
facts, earlier in the walk, that made any element in its `reads` what it is.
No game writes a `parents` list again.

## What each model would lose

- **Loopy** keeps its `BoundWitness` (edges counted singly vs corners counted
  as one). `reads` carries the edges; the corner-as-one distinction is a *term*
  of the technique (`says.terms`), not a parent. Nothing is lost if the term is
  stated; check by the fingerprint.
- **Slant** keeps `tick` as the engine's firing order. `vWhy`'s `from` link is
  a parent. `{ kind: "note" }` (a player's own mark) is a fact with no firing,
  which the graph needs as a root: a **root fact** is a mark on the live board.
- **Candidate games** gain parents. Their `reason: unknown` stays for games
  that have not moved (`hint-candidate-games-from-firings` moves them).

## Placing a note (the engine's rule)

A firing that only makes marks is not a step. Walk the steps in order; for each
step collect the facts its firing rests on (transitively, through parents) that
the player cannot see as marks on the board; place each such fact's firing as a
note step just before the first step citing it, in firing order, grouped as one
journey with the step. A fact cited by no step produces nothing. A note whose
sentence quotes the board is placed at its own tick, while the sentence holds.

## Order of work (cheapest evidence first)

1. **Witness** on the hint path only (`compile.ts`, `ladder-runtime.ts`): the
   solve path emits no extra code. Prove with a planted-defect test that a
   firing reports the arm / member / broken rule, and that a solve's compiled
   output is byte-identical for a game with no witness consumer.
2. **Reads and the fact graph** in `ladder-runtime.ts`; the answer to "what
   does this fact rest on?" is a function of the graph. Measure the walk's
   cost with reads recorded on the longest walks against the commit before.
3. **Placement** in `described-firing-hint.ts`, proved on Slant (the smaller
   trace) by its fingerprint, then Loopy.
4. **Net** (`explain.ts`), after sorting its `exists fill` case apart
   (proposal § "Before it starts" 2).
5. **Candidates a player cannot write** (Magnets, Ascent, Filling, Salad):
   a clause a technique that strikes states.
6. **The candidate plan on any space** (Map, Undead).

## Left open

`exists fill` (Net, Pattern, Tents, Pearl). Decide in step 4 whether to state
the specific technique ahead of the general one instead of a witness; this
design assumes the witness covers `or`, `exists` over a set, and `with`, and
not `exists fill`.
