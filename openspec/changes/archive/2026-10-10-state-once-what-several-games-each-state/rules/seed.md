# Rules: seed

## add `engine-difficulty`

The rule that a generator given the same params and the same random state
writes the same board. The population is every registered game, since every
`Game` has a `newDesc(p, rng)` (`src/engine/game.ts`). What makes it true is
structural and not a test: the random state is `newDesc`'s only argument
beside the params, and
`git grep -n -E 'Math\.random|Date\.now|performance\.now|new Date|getRandomValues' -- src/games src/engine`
outside tests finds a second source in three places only, none of them in a
generator: `freshSeed` in `src/engine/deal.ts` (which makes the seed), the
deadline in `src/engine/retry-limit.ts`, and Net's `jumbleRs` in
`src/games/net/index.ts` (the Jumble key, not the deal). The
deadline cannot choose a board: `retryLimit`'s guard throws
`RetryLimitExceeded` and never returns a fallback, and `generate` in
`src/engine/deal.ts` turns that into "no board". The module-level state under
`src/games` and `src/engine` (`git grep -n -E '^(export )?let '`, and the
module-level `Map`/`WeakMap` constants) is memoization keyed by its input
(Loopy's `faceCountCache`, Spectre's `ROT_CACHE`, Galaxies' `lastDiff`,
Untangle's caches, the `answerCache` each search-tier solver keeps, keyed by
the board object) and no generator's draws depend on whether one is warm;
Map's module-level `col` buffer in `src/games/map/generator.ts` is written
whole by `extendOptions` before it is read. The one generator that catches a
run-out and goes on, Loopy's `newDesc`, calls its outer guard before anything
it could return, so a deadline that passes inside a patch ends the deal; and
`dealUnreasonable` in `src/engine/answer-search.ts` bounds its search by a
count of positions and reads no clock. The requirement says a clock SHALL NOT
choose the board, and not that a generator reads none, because the guard a
generator calls reads the deal's deadline. A
seed reaches a generator in two places, `Midend.newGame` and the
`<params>#<seed>` branch of the midend's id loader (`randomNew(rest)`,
`src/engine/midend.ts`), both through `Midend.deal`.

Measured as well as read, 2026-10-10, by a scratch test outside the tree:
every registered game, at each params of `paramsCorpus` it reached in four
seconds a game, three seeds, each dealt twice back to back and a third time
after every other game had dealt. Nothing differed; the note "nothing in the
suite holds this for every game" gives the counts and the sample's limits.

The home is `engine-difficulty` because its Purpose is "what a generator
promises of a board" and `docs/games/solver-and-generator.md` sends a session
writing a generator there. `random` holds the stream and `testing` the suite.
No requirement of `engine-difficulty` has this subject: "A deal is bounded by
one deadline, the same in every game" and "A generator called directly is
bounded by a count" say what ends a deal, and their scenario "The deadline
ends a deal and never chooses its board" stays where it is and is not
repeated here. The requirement says "the board `newDesc` returns" so that it
is not false of a deal a bound ends.

It does not promise the same board across builds.

after: A generator called directly is bounded by a count

### Requirement: A generator's board depends only on its params and its random state

The board `newDesc` returns SHALL depend on nothing but its params and the
random state it is handed: called again with the same params and a state at
the same point of its stream, it SHALL return the same description and the
same aux. A generator SHALL take every random choice from that state, and
no clock, no other source of randomness and nothing an earlier deal left
behind SHALL choose its board. The promise is of one build: a change to a
generator may change the board a seed deals.

#### Scenario: A game ID carrying a seed opens one board

- **WHEN** a `<params>#<seed>` game ID is loaded twice in one build, and each
  load finds a board
- **THEN** both loads show the same board
- **AND** Solve is handed the same aux on each

#### Scenario: A generator that draws again draws on

- **WHEN** a generator throws a candidate away and draws another, or one of
  its stages runs out and the stage before it is drawn again
- **THEN** the next draw continues the stream it was handed, so the board it
  ends on is still the seed's

#### Scenario: A generator keeps what it computed between deals

- **WHEN** a generator memoizes a value across calls, and the same params and
  seed are dealt before and after a deal of another board
- **THEN** both deals return the same description

#### Scenario: A change moves the board a seed deals

- **WHEN** a change to a generator makes a seed deal a different board
- **THEN** nothing a player holds is broken, since a saved game and a shared
  game ID carry the description

## edit `abcd`: ABCD's generator accepts only a uniquely solvable fill

The reproducibility clause is `engine-difficulty`, "A generator's board
depends only on its params and its random state". What stays is ABCD's own:
that an Easy board is the one upstream's generator deals from the same seed,
which is agreement with upstream and not reproducibility. Read
`src/games/abcd/` for a second source of randomness: none.

from: Generation from a seed SHALL be reproducible, and an Easy board
to: An Easy board

## drop-scenario `abcd`: ABCD's generator accepts only a uniquely solvable fill

It restates `engine-difficulty`, "A generator's board depends only on its
params and its random state". The requirement keeps "A board with clues
removed still has one solution".

scenario: Generation is reproducible from a seed

## edit `ascent`: Ascent's generator keeps every board soluble at its tier

The clause is `engine-difficulty`, "A generator's board depends only on its
params and its random state". "Its loop SHALL be bounded" is left for the
family that settles loop bounds.

from: , and generation from a seed SHALL be reproducible
to:

## drop-scenario `ascent`: Ascent's generator keeps every board soluble at its tier

It restates `engine-difficulty`, "A generator's board depends only on its
params and its random state". The requirement keeps "Every preset produces a
uniquely soluble board".

scenario: Generation is reproducible from a seed

## edit `crossing`: Crossing's generator keeps every board uniquely solvable

The reproducibility clause is `engine-difficulty`, "A generator's board
depends only on its params and its random state". The agreement with
upstream at Easy, and its exception, are Crossing's and stay.

from: Generation from a given seed SHALL be reproducible, and an Easy board
to: An Easy board

## drop-scenario `crossing`: Crossing's generator keeps every board uniquely solvable

It restates `engine-difficulty`, "A generator's board depends only on its
params and its random state". The requirement keeps "Every preset produces a
uniquely-solvable board".

scenario: Generation is reproducible from a seed

## edit `lightup`: Light Up generates solver-gated boards

The sentence is `engine-difficulty`, "A generator's board depends only on
its params and its random state".

from: Generation from a given seed SHALL be reproducible.
to:

## drop-scenario `lightup`: Light Up generates solver-gated boards

It restates `engine-difficulty`, "A generator's board depends only on its
params and its random state". The requirement keeps "A removal that breaks
the puzzle is put back".

scenario: Generation is reproducible from a seed

## edit `mathrax`: A Mathrax board has one solution at every difficulty

The sentence is `engine-difficulty`, "A generator's board depends only on
its params and its random state".

from: Generation from a given seed SHALL be reproducible.
to:

## drop-scenario `mathrax`: A Mathrax board has one solution at every difficulty

It restates `engine-difficulty`, "A generator's board depends only on its
params and its random state". The requirement keeps "Even the
guess-and-verify tier yields a unique solution".

scenario: Generation is reproducible from a seed

## edit `rome`: Rome's generator keeps every board soluble at its tier

The sentence is `engine-difficulty`, "A generator's board depends only on
its params and its random state". Rome had no scenario for it; "Every preset
produces a soluble board" stays.

from: Generation from a given seed SHALL be reproducible.
to:

## edit `seismic`: The generator strips clues and accepts only a board of its tier

The sentence is `engine-difficulty`, "A generator's board depends only on
its params and its random state".

from: Generation from a given seed SHALL be reproducible.
to:

## drop-scenario `seismic`: The generator strips clues and accepts only a board of its tier

It restates `engine-difficulty`, "A generator's board depends only on its
params and its random state". The requirement keeps "Every preset produces a
soluble board".

scenario: Generation is reproducible from a seed

## edit `singles`: Singles generates unique, difficulty-graded boards

The sentence is `engine-difficulty`, "A generator's board depends only on
its params and its random state".

from: Generation from a given seed SHALL be reproducible.
to:

## drop-scenario `singles`: Singles generates unique, difficulty-graded boards

It restates `engine-difficulty`, "A generator's board depends only on its
params and its random state". The requirement keeps "Generated boards are
uniquely solvable at their difficulty".

scenario: Generation is reproducible from a seed

## edit `slide`: Slide's generator keeps every board soluble

The sentence is `engine-difficulty`, "A generator's board depends only on
its params and its random state". The scenario's "and minimum move count" is
within it: the count is part of what `newSlideDesc` returns.

from: Generation from a given seed SHALL be reproducible.
to:

## drop-scenario `slide`: Slide's generator keeps every board soluble

It restates `engine-difficulty`, "A generator's board depends only on its
params and its random state". The requirement keeps "Every generated board
is soluble".

scenario: Generation is reproducible from a seed

## edit `loopy`: Loopy generation recovers from a degenerate grid patch

The retry draws its fresh description from the deal's own random state, which
is `engine-difficulty`, "A generator's board depends only on its params and
its random state", whose scenario "A generator that draws again draws on" is
this case. Nothing in the sentence was Loopy's own.

from: Retrying SHALL be deterministic, so that a seed always produces the same board.
to:

## drop-scenario `loopy`: Loopy generation recovers from a degenerate grid patch

It restates `engine-difficulty`, "A generator's board depends only on its
params and its random state". The requirement keeps "A degenerate patch
yields a playable board rather than an error".

scenario: Generation remains reproducible across retries

## reword `loopy`: A redraw changes only which description is drawn

The last sentence ("The draws SHALL come from the deal's own random stream,
so that a given seed always produces the same board") is `engine-difficulty`,
"A generator's board depends only on its params and its random state". What
is Loopy's own is that the grid a description builds does not change, and the
scenario is cut down to that half of itself and renamed for it.

### Requirement: A redraw changes only which description is drawn

The redraw of an aperiodic patch SHALL change only which description is drawn.
The grid a description builds SHALL NOT change, since saved games and shared
game IDs carry descriptions.

#### Scenario: A redrawn deal's description builds the grid it was dealt on

- **WHEN** a deal draws a patch again, at a size where the first patch drawn
  is far under its size
- **THEN** the description dealt builds the same grid when the game is loaded
  from it

## reword `signpost`: Signpost generates solver-gated boards reproducibly

Retitled without "reproducibly", and the first clause and the only scenario
go: both are `engine-difficulty`, "A generator's board depends only on its
params and its random state". Nothing cites the title
(`node scripts/checks/spec-citations.mjs --list`). The scenario that replaces
it is the Easy gate, read in `newGameStrip` of
`src/games/signpost/generator.ts`: numbers are made given until `solveState`
solves, then taken out again only while it still does.

### Requirement: Signpost generates solver-gated boards

At Easy the clues `newDesc` leaves SHALL be enough for the solver to solve the
board.

#### Scenario: A number the solver needs stays given

- **WHEN** `newDesc` strips an Easy board, and taking a number out leaves a
  board the solver does not finish
- **THEN** that number stays given

## reword `slant`: Slant generates solver-gated boards reproducibly

Retitled without "reproducibly", and the first sentence and its scenario go:
both are `engine-difficulty`, "A generator's board depends only on its params
and its random state". Nothing cites the title. The rest is unchanged.

### Requirement: Slant generates solver-gated boards

A generated board SHALL have a unique solution that its difficulty's solver
finds, and above Easy SHALL NOT be solvable one level down. A clue SHALL stay
removed only while that solver still finds the solution, and above Easy the
obvious starting points (4s, 0s, border 2s and corner 1s) SHALL be tried for
removal before the rest, so that few of them survive.

#### Scenario: A removal the solver cannot bear is undone

- **WHEN** removing a clue leaves a board the solver no longer solves uniquely
  at the board's difficulty
- **THEN** the clue is put back

## reword `tents`: Tents generates solver-gated boards reproducibly

Retitled without "reproducibly", and the first sentence and the only scenario
go: both are `engine-difficulty`, "A generator's board depends only on its
params and its random state". Nothing cites the title. The scenario that
replaces it is the empty-line rejection, read in `src/games/tents/generator.ts`
(`if (filled.includes(0)) continue;`, ahead of the solver).

### Requirement: Tents generates solver-gated boards

`newDesc` SHALL place `w*h/5` tents, rounded down, no two of them adjacent
even diagonally, and a tree beside each in a one-to-one matching; reject any
layout with a row or column that holds neither a tree nor a tent; and accept
only when the solver succeeds at the target difficulty and fails to converge
one level below.

#### Scenario: A layout with an empty column is thrown away

- **WHEN** a layout places every tent and tree and leaves one column with
  neither
- **THEN** it is thrown away before the solver is asked, and another layout
  is drawn

## reword `tracks`: Tracks generates solver-gated boards reproducibly

Retitled without "reproducibly", and the first clause and its scenario go:
both are `engine-difficulty`, "A generator's board depends only on its params
and its random state". Nothing cites the title. The rest is unchanged.

### Requirement: Tracks generates solver-gated boards

`newDesc` SHALL strip every clue the board solves at its tier without. It
SHALL lay the track by construction and not by throwing tracks away: a walk
that does not leave the board while a row or column holds no track, and that
never steps where the squares still free no longer reach every such row and
column and the bottom edge. Every clue of a dealt board SHALL therefore be at
least 1, at any size the params allow.

#### Scenario: A long thin board deals

- **WHEN** `newDesc` runs at 60x8, 8x60 or 40x12 at Easy
- **THEN** it returns a board that solves at Easy, with every clue at least 1,
  and does not throw `RetryLimitExceeded`

## reword `sokoban`: Sokoban generation is deterministic

The title and the purpose clause ("over the shared seeded RNG, so that a
given seed always produces the same board") are `engine-difficulty`, "A
generator's board depends only on its params and its random state", and so is
the scenario "The same seed reproduces the same board". What is Sokoban's own
is the reverse-move generator and what it buys, which the scenario that stays
already said. Nothing cites the title. Read `sokobanGenerate` in
`src/games/sokoban/generator.ts`: its only draws are `randomUpto` on the
state it is handed.

### Requirement: Sokoban generates a board by reversing a solution

Sokoban generation SHALL use a reverse-move generator, so that every board it
deals is solvable.

#### Scenario: A new game produces a solvable board

- **WHEN** a new game is generated at a legal size
- **THEN** a board is produced with exactly one player and at least one barrel and
  target, and the board is solvable (it is constructed by reversing a solution)

## reword `boats`: The Boats generator deals a unique board at exactly the requested difficulty

The last sentence and the only scenario go: both are `engine-difficulty`, "A
generator's board depends only on its params and its random state". A
reword and not an edit because the requirement would be left with no
scenario. The one that replaces it is the last gate of `newDesc` in
`src/games/boats/generator.ts`
(`if (verdict.kind !== "solved" || verdict.diff !== diff) continue;`).

### Requirement: The Boats generator deals a unique board at exactly the requested difficulty

The generator SHALL use the solver to guarantee a unique solution at exactly
the requested difficulty: it SHALL place a random fleet, derive the border
clues, optionally hide border numbers while the board stays soluble, and reject
any board not solvable at exactly the target difficulty.

#### Scenario: A board that needs less than its tier is dealt again

- **WHEN** a stripped board solves, and the solver needed only a difficulty
  below the one asked for
- **THEN** the board is thrown away and another fleet is placed

## reword `spokes`: Spokes' generator keeps every board uniquely soluble

The last sentence and the only scenario go: both are `engine-difficulty`, "A
generator's board depends only on its params and its random state". A
reword and not an edit because the requirement would be left with no
scenario. The one that replaces it is the strip loop of
`src/games/spokes/generator.ts`
(`if (linesAt(i) === 1 || linesAt(i2) === 1) continue;`, ahead of the solve).

### Requirement: Spokes' generator keeps every board uniquely soluble

The generator SHALL use the solver to keep every board uniquely soluble at the
target difficulty, and every hub of a generated board SHALL carry at least one
line.

#### Scenario: A hub's last line is never stripped

- **WHEN** the generator comes to strip a line that is the only one left at
  either of its hubs
- **THEN** the line stays, whether or not the board would solve uniquely
  without it

## reword `sticks`: The Sticks generator keeps only what the solver completes

The last sentence and the only scenario go: both are `engine-difficulty`, "A
generator's board depends only on its params and its random state". A
reword and not an edit because the requirement would be left with no
scenario. The one that replaces it is `stripClues` in
`src/games/sticks/generator.ts` (`if (!keeps()) numbers[i] = clue;`), under
the Easy board's `keeps`.

### Requirement: The Sticks generator keeps only what the solver completes

The generator SHALL place blocks under the chosen symmetry, fill and clue
the board, and retain a candidate only while the deductive solver deduces it to a
unique completion; it SHALL then remove clues in a randomized order. At Easy
it SHALL keep each removal only while the solver still completes the board.

#### Scenario: A clue the solver needs is put back

- **WHEN** an Easy board is stripped, and taking a clue out leaves a board the
  solver does not complete
- **THEN** that clue is put back, and the strip goes on to the next

## reword `subsets`: Subsets generates uniqueness-gated boards

The last sentence and the only scenario go: both are `engine-difficulty`, "A
generator's board depends only on its params and its random state". A
reword and not an edit because the requirement would be left with no
scenario. The one that replaces it is the blanking loop of
`src/games/subsets/generator.ts`
(`if (subsetsSolveGame(solved, p.diff) !== "complete") state.immutable[i] = 1;`).

### Requirement: Subsets generates uniqueness-gated boards

The generator SHALL assign every set-value to the grid by a single shuffle,
derive all arrow clues from the subset relation, then blank cells in a shuffled
order, keeping a cell blank only while the solver, capped at the requested
tier, still reaches a complete solution.

#### Scenario: A cell the capped solver needs stays given

- **WHEN** blanking a cell leaves a board the solver, capped at the requested
  tier, does not complete
- **THEN** that cell is given again, and the blanking goes on to the next

## keep `filling`: Filling generates uniquely solvable boards

"An Easy board SHALL be the one upstream's generator deals from the same
seed" is agreement with upstream, which the shared requirement does not
promise of any game. Filling never stated reproducibility by itself.

## keep `mines`: One seed lays out the same board for the same first square

Not a departure the shared requirement must name. Mines' `newDesc`
(`src/games/mines/index.ts`) draws twice and writes the random state into the
description (`r<n>,u,<state>`), so it is a function of its params and state
like any other. This requirement is about what happens after the deal: the
first square opened lays the mines out from the state the description
carries, the same layout for the same square. That is Mines' own rule about
a move.

## keep `latin-solver`: The engine provides a shared, seeded Latin-square generator

"Given the same random state it SHALL produce the same square" is a promise
of an engine helper that takes a random state, to the generators that call
it. The shared requirement is about `newDesc`; a helper's own promise is
what lets a generator built on it keep the shared one. The same holds of
`grid`, "Seeded random loop generation" and the aperiodic-tiling
requirements there, which also promise stability across builds, which the
shared requirement does not.

## keep `mathrax`: Recording does not change what the Mathrax solver commits

"The solver-gated generator produces the same boards" is about the recorder
changing nothing, with and without it, and not about two deals from one seed.

## not-shared a board agrees with upstream's from the same seed

ABCD, Crossing and Filling each say an Easy board is the one upstream's
generator deals from the same seed. That is agreement with upstream, a
different promise from reproducibility, and one the project makes game by
game and tier by tier where it chose to keep it (upstream is not tracked). I
did not derive which other games it is true of. The three keep theirs.

## not-shared determinism that is not a generator's

Net's "Jumble is deterministic on replay" (a move replays without the RNG),
Blackbox's "Black Box traces lasers through the arena deterministically",
Flip's `crosses` matrix, and the hint requirements that fix a scan order
(Bricks, Clusters, Untangle, Spokes' look-ahead) are each about something
other than `newDesc`, one game states each, and they stay.

## note nothing in the suite holds this for every game

No cross-game test deals every registered game twice from one seed and
compares, and no source scan refuses `Math.random` or a clock under
`src/games`: the tests under `src/engine/` that walk every game's `newDesc`
(`save-round-trip.test.ts`, `deal.test.ts`, `testing/dealt.ts`) each deal
once. The rule is held game by game, by a test that deals twice in the games
that have one and by the frozen differentials, and for the rest by nobody
having written a second source. The rule is true
today by reading and by the measurement in the `add` entry. A guard would be
cheap in either form: a source scan keyed on the references `Math.random`,
`Date.now`, `performance.now` and `crypto` under `src/games`, or a cross-game
case that deals `dealt`'s board a second time and compares.

The measurement: 57 registered games, 1,707 triples of game, full params
encoding and seed, 5,193 deals, description and aux compared. No deal
differed from another of the same params and seed. The run reported three
differences, all at Mathrax `5de`, and they were the instrument's: two
entries of `paramsCorpus` share that encoding (the default, `options: 63`,
and the perturbation `options: 64`) and my key was the encoding, so one was
compared with the other. Dealt apart, each gives its own board every time.
The sample is small beside what would find a rare leak: at most three seeds
a params, and the dear params of a game (those past four seconds) not at
all.

## note Mathrax params with `options: 64` pass validation and encode as the default

Found by the measurement above: `{o: 5, diff: "easy", options: 64}` is
accepted by `validateParams` (`src/games/mathrax/state.ts` refuses only
`options` of 0), encodes to `5de` as `options: 63` does (`encodeParams`
writes a letter for each of the six bits and 64 has none of them), and deals
a different kind of board (`newMathraxDesc` falls back to every clue type
only where `options` is 0).

No player can build it. `decodeParams` starts from 0, sets only the six bits
it has letters for and turns 0 into 63, so a pasted id and a loaded save give
1 to 63. The Custom dialog's six booleans (`paramConfig` in
`src/games/mathrax/index.ts`) each set or clear one of those bits of a
decoded or default value, and all six off is 0, which `validateParams`
refuses. The presets are all 63. The value comes only from
`paramsCorpus`'s `bump:options` case (`src/engine/testing/params-corpus.ts`),
which adds 1 to the default's 63: a case that measures the corpus and not
the codec, as that module says of Boats' `fleet`. So a game ID does carry
every params a player can reach, and the shared requirement needs no
departure. What is left is a test corpus entry that is not a round trip, and
a `validateParams` that does not refuse bits past the mask: for whoever owns
Mathrax's params, and `paramsCorpus`.

## note `testing`, "The test suite is deterministic under parallel load"

Its sentence "Heavy generator and solver tests … SHALL be seed-deterministic"
is about a test fixing its seed, and stays. Its last clause, "a generator's
retry loop SHALL have a finite iteration cap rather than rely on
probabilistic termination within a timeout", is what `engine-difficulty`,
"Every generate-until-success loop is bounded by the shared retry limit"
states: for the family that settles loop bounds.

## note a generator's order must not hang on the JavaScript engine

The shared requirement promises one build and does not say "in every
browser". `Array.prototype.sort` is stable by the standard, so a sort's order
is the JavaScript engine's to choose only where its comparator is
inconsistent. The comparators under `src/games` and `src/engine` outside
tests and hints (`git grep -n -E '\.(sort|toSorted)\('`) are differences of
numeric keys or the default order of a typed array, which are consistent. A
board that differed between browsers would be a defect in the code and not a
gap in the requirement.

## note a guard with no count, under Loopy's catch

`generateLoop` in `src/engine/loopgen.ts` guards its tendril passes with a
`retryLimit` that states no count, and Loopy's `newDesc` calls it inside the
`try` whose `RetryLimitExceeded` it answers, on an aperiodic tiling, by
drawing another patch. Called directly that guard would hand the patch back
at the house count of passes; under the app's deadline it counts nothing and
would go on. A seed that needed more passes than the house count would then
deal one board directly and another in the app, which `engine-difficulty`,
"A count on a retry loop is the algorithm's and not a budget" exists to
prevent (Loopy's own two guards under that catch state their counts for this
reason). I did not find such a seed and do not expect one: every pass but the
last flips a face. For the family that settles loop bounds.

## note Clusters and Bricks lost the sentence earlier

The note in `verdicts/boats.md` of the archived regrouping says the sentence
was cut from Clusters and Bricks as covered by `testing`, "The test suite is
deterministic under parallel load". That requirement is about a test's seed
and not a generator's promise; with the `add` above the rule is stated, and
neither spec needs anything put back.
