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

## `exists fill`, sorted (2026-11-13, from the four descriptions)

The witness covers `or`, `exists` over a set and `with` (done: `compile.ts`
`witnessOf`). `exists fill` is sorted by what a player needs said:

- **Pattern** (`line`): the reason a square is the same in every filling is
  the overlap of the line's runs: a technique of its own stated ahead of
  `line` (the leftmost and rightmost fit of each run). No witness; a new
  technique, whose soundness the gate checks.
- **Tents** (`fits`, with `spread`): the reason is counting (`k` tents in
  `|O|` open squares, none side by side). The specific techniques state that
  count ahead of the general fill. No witness.
- **Net and Pearl**: the descriptions are already layered: `fits`, then
  `loopFits`, `sealFits`, `strandFits` each add one conjunct to the one
  before, and each layer is a technique's rung. What the words need is, per
  filling that failed, the first conjunct it failed and where, which is a
  witness of a `not exists fill`, a **refutation**: for each filling, the
  index of the first false conjunct. Net's `explain.ts` is that, by hand.
  Step 4 builds it for Net and checks it by the hint-walk fingerprint; Pearl
  follows.

So `exists fill` needs a refutation witness only where its conjuncts are
layered and each way's failure is named (Net, Pearl); the two other games
take a technique of their own.
