# hold-the-game-skeleton-to-the-compiler

**Status: scaffolded 2026-10-12, not started.** First of the five pieces of
`fit-a-new-game-in-one-session`, whose proposal holds the measurements.

## Why

`scripts/new-game-port.sh` stamps a new game's files from text inside a shell
script. It stopped compiling against `Game` on 2026-09-15 and nothing
noticed for four weeks, though `repo-layout` requires its output to
type-check. It also stamps none of what the collection has since settled: a
hand-written params codec where 34 games call `paramsCodec`, bare `throw`
stubs for the solver and generator, no input declaration, and nothing for a
hint. A new game's author therefore learns the shape of a game by reading
other games, and the games disagree
(`fit-a-new-game-in-one-session`, "What was measured", 3).

## What Changes

- **The skeleton becomes TypeScript the gate's typecheck reads**, so it
  cannot fall behind `Game` again. Where it lives, and how a stamped copy is
  renamed, is `design.md`'s first decision. It must not be registered, must
  not be picked up by any guard that takes its population from the registry
  or from `src/games/*`, and must not ship in the bundle.
- **It is the shared way, for every concern that has one**: params through
  `paramConfig` and `paramsCodec`, presets through `presetGrid`, the desc
  through `readDesc`, input through `interpretTargetVerbs` on `squareGrid`,
  the solver on `runDeductionFixpoint`, a `DifficultyContract`, `findMistakes`
  through `entryMistakes`, the hint through `deduceHintPlan` with its rung
  list, `hintMarks` legend, `say` in `hint-text.ts`, `hintKeepTrack` through
  `trackTargets` and `hintGesture` through `verbClicks`, and a `render.ts`
  with the tile cache, the diff key and the marks packed the one way
  `rendering.md` settles on.
- **One skeleton first, for the commonest kind**: a square grid of cells the
  player marks, solved by deduction. It plays as a trivial but real game, so
  that its tests run.
- **The tests a game ships are stamped with it**, and pass: the save round
  trip, a render scenario, the generation invariant, the hint pins.
- **Where the skeleton has to choose between two ways the guides both
  allow, the choice is made there and the guide is changed to say so.** The
  open choices are in `fit-a-new-game-in-one-session` and in the five audit
  findings quoted in `design.md`.

Not in this change: moving any existing game onto the shared way, and any
new engine helper. A helper the skeleton shows to be missing is filed.

## Capabilities

### Modified Capabilities

- `repo-layout`: "A scaffolding script stamps out a new game-port skeleton"
  and the requirement after it.

## Impact

`scripts/new-game-port.sh`, a new skeleton directory, `tsconfig`, the guards
that enumerate games, `docs/games/README.md` § "The lifecycle of a game
change" and § "File anatomy".
