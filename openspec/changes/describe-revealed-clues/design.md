# Design: clues revealed during play

## Sections

| Section | What it holds |
| --- | --- |
| What X is | the vocabulary, and what turned out to need none |
| Guess | its ladder, and what moved |
| Mines | its ladder, and the generator's certificate |
| Black Box | its ladder |

## What X is

**A revealed clue is a dealt clue to everything that reads one.** The
compiler, the runtime and the checker read a clue list, and none of them
asks where it came from: a game whose clues come from play builds its
`Dealt` from its state on each hint and solve, as every other game builds it
from its board. So the "clue kind the state reveals" the proposal names has
no declaration of its own: nothing would read one (`docs/doctrine.md`,
"Declare what the engine consumes"), and the checker already covers every
layout of a kind, each clue present or not, which is every set of reveals.

What the three games needed that the language lacked is each one construct:

- **A clue at the board** (Guess): a clue that sits at no element, one a
  query, whose value is fields, each read as a function of the clue
  (`black(k)`) and of a cell where it is one a cell (`peg(k, s)`). It
  compiles to plain arrays in `Dealt`; its meaning reads the clue as `k`.
  The checker deals two of a kind, each present or not with every field
  unknown in its range: a technique reading one clue is checked as it reads
  any number of them, since another clue only removes answers.

## Guess

The hand-written `Rules` class stated as seven techniques, one a modifier's
(`noRepeats`, under "no duplicates"). Its order moved in two ways:

- **A variation's technique runs after its tier's**, so `noRepeats` comes
  last, where the hand ladder ran it between the one-row readings and the
  ones leaning on settled slots. Guess has one tier, and inventing a second
  to place it would give a grade nothing reads.
- **The hint takes firings in the ladder's own order**, one a pass, which
  is the hand ladder's order but for `noRepeats`. It does not walk by
  `ladderWalk`, whose rule takes the firing continuing from the last one's
  cells: a Guess plan is a few firings over one row, and over every preset,
  eight seeds each played to the end, the rule had a choice to make 6 times,
  too few for it to shape a plan or for `ladder-continuity.test.ts` to read
  (it wants 30). Walked by it, Guess failed that guard with 0 of 30 on its
  dealt boards, which show no score yet.

The probe stays the game's: choosing a guess is an information question,
not a deduction. Its enumeration judges each whole answer by the compiled
rules (`isAnswer`); its pruning of a partial one stays the game's.
