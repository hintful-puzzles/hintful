# derive-the-draft-label — design

Measured 2026-09-29 at `532b405c`, over the 57 registered games, by reading
each optional `Game` member off the registered object.

## Task 0: which absences are the puzzle's, and which are unfinished work

The rule that decides every entry: **`notApplicable` states a fact about the
puzzle**, one a player can check against the rules. "Upstream never wrote one"
is history, not such a fact; an absence whose only reason is history is
unfinished work, and the game is a draft.

### `hint`: 11 absent, all draft

Black Box, Cube, Flip, Mines, Mosaic, Net, Pegs, Same Game, Slide, Sokoban,
Twiddle. A hint is never not applicable (owner, 2026-09-28).

### `findMistakes`: 17 absent, 16 not applicable, 1 draft

The member's contract is "cells of the current state that contradict the
puzzle's unique solution". Three puzzle reasons cover sixteen of the games:

- **Every position is a step on the way.** Fifteen, Sixteen, Twiddle, Netslide
  and Slide rearrange pieces, Cube rolls, and Flip's presses commute and undo
  themselves. No arrangement can contradict the answer; it can only be further
  from it.
- **There is no single answer.** Inertia, Flood, Pegs, Same Game, Sokoban and
  Untangle are won by any of many routes or layouts, so nothing on the board
  can be compared with *the* solution. A dead-end detector ("this gem can no
  longer be reached") is a different feature from this member, and none of the
  six has one.
- **The answer is hidden.** Black Box, Guess and Mines. Checking the player's
  marks against the answer would reveal it, and each game already has its own
  check: Black Box's final reveal, Guess's feedback pegs, Mines' explosion.

**Net is the draft.** Its generator ensures a unique solution by default, so a
check against it is buildable. Net is also hintless, so this costs no game its
standing.

### `solve`: 4 absent, all draft

Cube, Pegs, Same Game and Sokoban. The recorded reason is "no solver", which is
history: Cube's state space is small enough to search, and the three others'
generators build their boards backwards from a finished position, so a solution
is known at generation time. All four are hintless.

### `transposeParams`: 14 absent, 13 not applicable, 1 draft

- **Gravity or a fixed side** (the old `NOT_TURNED` ledger): Bricks, Same Game,
  Slide.
- **The board is square whatever the params**: Group, Keen, Mathrax, Salad,
  Solo, Towers and Unequal (Latin squares, where `computeSize` takes one side),
  Subsets (one legal board, 4×4) and Untangle (a square play area).
- **The board is a layout rather than a grid**: Guess, whose rows of guesses
  run down the board in the order they were made.

**Cube is the draft.** Its cube-on-squares solid rolls on a plain grid that
could be turned (`transposeParams` may return `null` for the three triangle
solids). Hintless.

### The members that stay out of the draft computation

The falsifier fires for these: their absences cannot be told apart without
reading intent that no reason states, or they are affordances rather than parts
of the contract.

- **`difficulty`** (28 absent). The permutation games have no tiers by nature,
  but for the logic games among the 28 (Palisade, Range, Rect, Pattern and
  others) the question is whether a solver has a gradable ladder. Answering it
  is a measurement per game, not a reading, and none of it is written down.
- **`textFormat`** (12 absent). The share dialog's text panel; nothing states
  why a game lacks one.
- **Affordances**: `hover`, `reference`, `prefs`, `requestKeys`,
  `statusbarText`, `animLength`, `flashLength`, `supersededDesc`,
  `changedState`, `encodeUi`. A game has these when its design calls for them.
- **Hint plumbing** (`hintKeepTrack`, `refreshHintStep`, `uiUpdateClearsHint`)
  and `hintMarks`, which `hint-quality.test.ts` already requires of every
  hinted game.
- **`paramConfig`** is absent nowhere, and `custom-params.test.ts` fails the
  gate without it. A draft passes the gate; a game without `paramConfig` does
  not.

### Result

The drafts are the eleven hintless games, and only those. Every hinted game
either implements the sections or declares them not applicable. That is the
proposal's expectation, arrived at from the members and not assumed.

## D1: a map of reasons on the game, not a union in each member's place

The scaffold describes `notApplicable(reason)` as a value "a `Game` member may
hold in place of an implementation". Taken literally, `solve` would become
`SolveFn | NotApplicable`. `Game.solve` has 163 references in 115 files, most of
them `game.solve?.(…)` or `game.solve!(…)`, and every one would need to narrow
the union before calling. The narrowing would add no checking: what the union
excludes (implemented *and* not applicable) is exactly what the draft
computation checks at build time.

So the game carries one member:

```ts
notApplicable: {
  findMistakes: "Every arrangement of the tiles is a step on the way …",
}
```

keyed by section, and typed so that `hint` cannot be a key. The state is still
first-class: it is on the game object, it is typed, and three consumers read
it. `sectionState(game, section)` returns implemented, not applicable (with the
reason) or absent, and **throws** for a game that does both, which the build
reaches through the draft computation and the help page.

## D2: the catalog learns drafts at build time

The home screen never loads game code: each game runs in its puzzle page's
worker. But `vite.config.ts` already imports every game, for the help's
generated sections (`vite-plugins/hint-marks.ts`, `parameters.ts`). A plugin
serves `virtual:draft-puzzles`, a map from each draft game to the sections it
lacks, computed from the registry when the module is loaded. The home screen
imports it and passes `draft` to each `catalog-card`.

Rejected: a `draft` field in `catalog-data.ts` held equal to the derivation by
a test. It would be a copy the porter has to maintain, and the change's premise
is that draft is computed, never set by hand.

The plugin loads the games lazily, inside the module's `load` hook, so a
vitest run that never imports the home screen pays nothing for it.

## D3: the help shows the reasons in a generated section

A game page's reasons are rendered as a section of their own, inserted by the
help build immediately above `## <Name> parameters` (which
`help-coverage.test.ts` holds to be the last section). It is generated rather
than placeholder-driven, because the whole section comes from the contract and
there is nothing for a page author to place or write. Each line names the
feature the player would look for, in the app's own words ("Check & save",
"Show solution…"), and gives the reason.

## D4: which ledgers move, and which stay

- **`NOT_TURNED`** (`orientation.test.ts`) moves onto the three games as
  `notApplicable.transposeParams`. The guard now asks the section state. What
  changes in behavior: a new game with a width and a height and no
  `transposeParams` used to fail the gate. Now it is a draft, labeled in the
  catalog, like a game without a hint. A stale reason still fails, because a
  game that turns *and* declares a reason throws.
- **`OPENS_ITS_OWN_REFUSAL`** (`hint-refusal.test.ts`): Fifteen, Flood and
  Sixteen were excused because they have no mistake concept. That is now their
  `findMistakes` declaration, and the guard derives the exemption from it. The
  two entries whose reasons are about hint code (Bricks and Clusters' second,
  conditional refusal) stay in the ledger.
- **`NO_FLAG`** (`completion-vocabulary.test.ts`): a state without `cheated` is
  excused when the game has no `solve`, derived, rather than by four "no
  solver" entries. Two of the recorded reasons were false: Black Box and Guess
  do have a Solve, a give-up that reveals the answer and scores a loss. They are
  rewritten. The ledger stays, because its subject is a state field, not a
  contract section.
- **`KEYPAD_WITHOUT_PENCIL`** (`input-parity.test.ts`) stays. It records why a
  game *has* something the derivation did not predict, not why a game lacks a
  section.

## D5: the old rule in the specs

Three live requirements gave "never a manifest" as a reason. The mechanism each
describes survives, and the reason is restated under the rule that replaced it:
a declaration is healthy when a mechanism consumes it, and a list that only a
check reads is not. A fourth, the `transposeParams` requirement, named the
`NOT_TURNED` ledger and a scenario failing the gate on a game that neither
turns nor says why. That scenario no longer holds, so the requirement is
`REMOVED` and re-`ADDED` under a new name rather than modified. See the deltas.
