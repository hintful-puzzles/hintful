# Design

## D1. Retire the option; do not declare it

The scaffold's declaration would have been consumed by the engine, so it was the
healthy kind. It was still the wrong thing to declare. The test in `AGENTS.md`
is whether two games could reasonably answer differently, and here the answer
is no: the box means "skip the generator's checks", inherited from upstream,
where it bought generation speed on large boards. It says nothing about the
puzzle.

Keeping it would also have kept a board class the engine's other rule forbids.
A board with several answers has no mistake check, and in three of the five
games the unticked box is the only way to deal one.

## D2. Mines retires its box too

Mines is the one game where the unticked board is a real puzzle: one answer,
and a guess needed to find it, which is what Unreasonable means. An
`Easy · Unreasonable` ladder would have expressed that inside the engine's
vocabulary. The owner left the choice to consistency with the other four, and
retiring is the consistent one: a guess in Mines can kill, so "a saved board
can always be finished" would hold there only with luck, and naming the
deducible game "Easy" says something the game does not mean.

## D3. Where the load check lives, and what it asks

`loadDesc`, beside the answer count, so a pasted ID, a link and a save are
judged alike and `upstream-descs.test.ts` covers the rule without change.

**Tiered games: the difficulty contract, with nothing new declared.** Some cap
must solve the board. The stated tier is tried first, which is one solve for
every board a generator dealt; `withBoardTier` then repeats that solve to place
the board's tier. The duplicate is one solver run per load and was not worth a
shared result type.

**Untiered games: `Game.finishesByDeduction(state)`.** Two cheaper hooks were
tried on paper and dropped:

- *Reuse `solve`*, refusing a board whose `solve` says `PUZZLE_NOT_REASONABLE`.
  Some thirty games say that sentence, with thirty meanings of "could not", and
  Rectangles' and Net's `solve` would have had to start refusing boards they
  can show an answer for.
- *Give untiered games a `difficulty` contract with one cap.*
  `difficulty-contract.test.ts` holds "a contract means a difficulty choice",
  and every consumer of the contract reads a tier off params.

**Dominosa is not asked at all.** A shared ID omits the tier, so an Ambiguous
board arrives looking like the default tier, and asking it would refuse a link
the app itself wrote.

## D4. The door asks the solver, not the hint

The first cut asked Rectangles and Net whether the *hint* finishes the board,
which is what their generators ask. `upstream-descs.test.ts` went red on one
Net fixture: a wrapping board upstream dealt with its checks on, which the
solver settles and the hint does not. Measured, that is a quarter of upstream's
wrapping 5x5 boards. Refusing them would be a compatibility break nobody had
agreed to, so the door asks the solver and the gap is written down
(`close-the-solver-hint-gap-in-net-and-rect`).

Mines has no solver verdict that runs without a perturbation callback, so its
door plays the hint's plan. Its measured gap is zero.

## D5. What replaces the retired fixtures

Nothing replaces the eight byte-match fixtures for the unchecked paths, because
the paths are gone: Same Game's random-scatter generator is deleted, and the
other four games' unchecked branch was "skip the solver". The checked paths
keep every fixture they had.

What the change adds instead is the load verdict's own tests: a fake tiered and
untiered game in `desc-error.test.ts`, and a pinned refused board in each of
Rectangles, Net, Pearl and Mines. Each pin was seen to fail first: two of
upstream's unchecked boards turned out deducible, and the assertion said so.
