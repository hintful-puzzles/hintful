# Design

Every figure here was taken on 2026-10-12.

## What the skeleton is taken from

The proposal asked for two games that are on every shared way. There is none.
Intersecting `git grep -lw <helper> -- 'src/games/*/*.ts' ':!*.test.ts'` over
eleven helpers (`paramsCodec`, `presetGrid`, `readDesc`,
`interpretTargetVerbs`, `squareGrid`, `runDeductionFixpoint`,
`DifficultyContract`, `entryMistakes`, `deduceHintPlan`, `trackTargets`,
`verbClicks`), the nearest are Tents (all but `presetGrid` and
`entryMistakes`) and Clusters (all but `presetGrid` and `trackTargets`).
Between them they cover the list, so the skeleton is their union, and it is
the first place in the tree where the whole shared way is in one directory.
Tents gave the hint's shape (`hint.ts`, `hint-text.ts`, a recording pass,
`trackTargets`); Clusters gave the input, the mistake check and the renderer.

## D1. Where it lives: `src/skeleton/<kind>/`

`src/skeleton/grid/` holds the one skeleton there is. It is under `src`, so
`tsconfig.json`'s `include` and vitest's `src/**/*.test.ts` already read it:
no config changes, and the gate's typecheck and test run hold it with no step
of their own. It is two directories below `src`, as `src/games/<id>/` is, so
every `../../engine/…` import is the same text in the copy and stamping
rewrites no path. The directory is named for the kind so that a second
skeleton sits beside the first.

Declined: `src/games/_skeleton/`. Some two dozen guards take their population
from `src/games/*` (`git grep -l 'games/\*/' -- src scripts`), and each would
need to learn the exception or the skeleton would need a catalog entry, a
help page and icons.

**It does not register.** `registerGame` at module load would put it in the
live registry of any worker that ran its tests, and the suite runs with
`isolate: false`, so `catalog-registry.test.ts` would fail by file order. The
skeleton exports its `Game` object and its tests take that object; the script
adds the two registration lines to the copy.

**It does not ship.** Nothing under `src/games/` or the app imports
`src/skeleton/`, so the bundle does not hold it:
`git grep -l "skeleton/" -- src vite.config.ts vite-plugins ':!src/skeleton'`
finds only `src/screens/puzzle-screen.ts`, whose import is the UI library's
placeholder component of the same name.

## D2. How a copy is made: a rename of three spellings

`scripts/new-game.sh <gameId> [kind]` copies every file of the skeleton to
`src/games/<gameId>/`, and its `help.md` to `help/games/<gameId>.md`,
replacing `skeleton`, `Skeleton` and `SKELETON` in file names and contents
with the game's id in the same case. The skeleton is written so that this is
the whole transformation: its id, its type prefix, its test titles and its
snapshot keys all carry the word, and no comment in it says "skeleton" of
anything but the game. The script then adds the registration to the copy's
`index.ts`, lets biome reflow the lines the longer name pushed past the
width, and **checks its own output**: typecheck, lint, and the copy's tests.

That last step is how "the emitted files type-check and lint clean, and its
tests pass" is held. The compiler holds the skeleton between stampings, and a
rename cannot break what compiles; what a rename can break (a line width, an
import order, a snapshot key) the script finds on the spot, before the author
has changed a line.

Declined: a gate step that stamps a game into a temporary directory on every
commit. It would cost a second typecheck (about 3 s) on every commit to
re-prove what the rename leaves true.

## D3. The skeleton is a game the author owns, not a layer

`openspec/postmortems/2026-09-06-game-definition-adapter-withdrawal.md` and
`2026-09-09-tile-loop-inversion-withdrawal.md` were read first. Both withdrew
a layer a game would be compiled or drawn through. The skeleton is neither:
after stamping, nothing in the game refers to it, and the engine has no
knowledge of it. It carries the repeated shape of a `render.ts` without
owning it, which is what the tile-loop postmortem left as the open way.

## D4. The puzzle it plays

Shade squares so that every number counts the shaded squares sharing a side
with it. It was chosen to exercise each shared way with the least puzzle:

- two marks a player makes (shaded, crossed out), so the hint's premises are
  marks;
- a ladder of two rungs on two tiers, because `tierNames` refuses a game of
  one tier: `count` (one number) on Easy, `shared` (two numbers whose open
  squares nest) on Normal;
- a solver-gated generator that takes clues away while the ladder still
  solves the board.

Measured over 20 seeds a cell, every size from 3x3 to 20x20 deals at both
tiers with no retry limit reached; 10x10 takes 13 to 27 ms and 20x20 about
0.8 s, so the area is capped at 400.

## D5. Where two ways were allowed, the one taken

| Concern | Taken | Was also allowed |
| --- | --- | --- |
| Params | `paramConfig` once, `paramsCodec(dims, choice)` reading it | a hand-written `encodeParams`/`decodeParams` |
| Presets | `presetGrid(paramConfig, BOARDS)`: sizes named, tiers derived | a literal list of every size at every tier |
| Desc | one `readDesc` parse, digits through `decimal.ts` | a validator beside a parser |
| Input | `interpretMove` is one call to `interpretTargetVerbs`; a drag is the declared `sweep` | arms of the game's own before the call |
| Where `executeMove` lives | `state.ts` | `index.ts`, which `hint.ts` cannot import without a cycle |
| Solver | a board class, and one `ladder()` of declared techniques that `runDeductionFixpoint` and `singleFirings` both run | a second, recording copy of the loop |
| What a firing carries | the reason with every count the sentence says | counts recomputed by the hint from a board before the firing |
| Rung list | `as const satisfies readonly Reason["kind"][]`, so a rung is a reason kind | a list kept beside the reasons |
| Tier gate | `retryLimit` and `solvableAtExactlyTier` | a comparison spelled in the loop |
| `findMistakes` | `entryMistakes` with `gridCell` | a loop over the answer |
| Where the hint lives | `hint.ts`, always | `index.ts` or `solver.ts` while it is short |
| Hint plan | `deduceHintPlan` over the recording pass | a loop of the game's own |
| `hintKeepTrack` | `trackTargets` with `changedCells`, shrinking the step and narrowing its words | comparing the move's ops with the step's |
| `hintGesture` | `verbClicks` | clicks built by hand |
| Hint marks | read from the step's words by `OverlaySidecar.pack(stepMarks(hint), …)`; ring and outline drawn by `HintMarks` on a band astride the grid line | a `highlights` object the renderer reads |
| Tile cache | one `Int32Array` key a square, the sidecar's `stale` beside it | a second cache for a cue |
| Board look | `SHADED` piece, `drawRuledOutCross`, `givenSurface` under a number | colors of the game's own |
| Tests | three files: behavior with save and frame, generation (`describeDealtTiers`, `describeLadderCensus`), hint (`describeHintPins`, plan properties, a pinned frame) | one file a concern, or one file in all |

The guides are changed where they offered the second column to a new game:
`docs/games/README.md` § "File anatomy" and § "The lifecycle of a game
change", and `docs/games/testing.md` § "What a new game ships". The other
guides describe the existing games, which this change does not move, and are
`make-the-guides-a-lookup`'s to route.

## D6. What holds the skeleton, and what does not

| Held by | What |
| --- | --- |
| The gate's typecheck | every member of `Game`, and every engine helper's signature |
| Its own tests, in the gate's run | that it deals, plays, hints, saves and draws |
| The script's self-check | that a copy compiles, lints and passes |
| Nothing, between stampings | the source scans that read `src/games/*` only |

The last row is what task 2.4 measures: a copy was registered and the gate's
guards run against it. § "The first day" below lists what refused it.

## D7. "Port" is retired from the script

The owner asked during this change (2026-10-12) that the script and the
prose about it stop saying "port": new games are written here, not ported.
`scripts/new-game-port.sh` is `scripts/new-game.sh`, and the `repo-layout`
requirement is renamed to "A scaffolding script stamps out a new game from
the skeleton".

## The first day

Task 2.4, run on 2026-10-12.

**The planted defect.** `Game.statusbarText` was made required. The gate's
typecheck reported 43 errors, one of them
`src/skeleton/grid/index.ts(185,14): error TS2741: Property 'statusbarText'
is missing`. Reverted, and the typecheck was clean again.

**A copy, registered.** `scripts/new-game.sh probe` made a game; its 64
copied tests passed as stamped. It was imported in `src/games/index.ts` and
given a catalog entry, and three things were run: the gate's node checks
(clean), its source-scan pass (15 files, 1,757 tests), and its main pass
narrowed to the game with `GATE_GAME_SCOPE=probe` (192 files, 7,737 tests).
It was also played in Chrome from the dev server: marks by both buttons, the
keyboard cursor, a hint with its ring and outline, the hint followed to the
end of the board and the win, and its help page. The copy and its
registration were then removed.

Nine tests refused it. Three were faults of the skeleton, mended there and
confirmed on a second copy:

| Guard | Fault | Mend |
| --- | --- | --- |
| `note-vocabulary.test.ts` | the board field was named `marks`, a retired spelling of candidate notes | the field is `grid` |
| `warm-repaint.test.ts` | `OverlaySidecar.pack` reads a ringed note, a mark the renderer could then paint and no hint draws | the renderer packs the two kinds its sentences name, ring and outline on a cell |
| `hint-quality.test.ts` | the `shared` sentence ran to 188 characters, over the 120 line | 110 at the pin, and the skeleton's plan test now holds every sentence it walks to 120 |

Six asked for something only the new game's author can supply, and the
script's checklist names each: the two icons (`asset-integrity.test.ts`),
the game's row in `help/puzzles.md` (`help-coverage.test.ts`, two tests),
its params strings in `params-read-whole.test.ts`, the pinned count of
renderers in `hint-mark.test.ts`, and the snapshots of
`capability-surface.test.ts` and `params-stability.test.ts`. Four of those
are records kept by hand, which the doctrine is against;
`give-a-game-its-verdict-in-one-command` now holds the finding, since
deriving them is that change's subject.

**What this did not run**: the production build with the copy in it, and
the copy on a touch screen. Input goes through `interpretTargetVerbs` alone,
so the touch path is the engine's.
