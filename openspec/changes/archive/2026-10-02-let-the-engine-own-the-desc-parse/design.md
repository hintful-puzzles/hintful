# Design: let-the-engine-own-the-desc-parse

## Task 0, measured (2026-10-02)

Every game's `validateDesc` and `newState` were read (the definitions, not a
name grep: `rg` over every `function validateDesc|newState` and object member,
then the four games whose builder has another name — Ascent's
`newAscentState`, Bridges' `newStateFromDesc`, Mines' `decodeDesc`, Map's
`newMapData`, Slant's `decodeClues`).

- **validateDesc**: in all 57 games it is the one line
  `descVerdict(<parse>(p, desc))`, and the parse is the one `newState` reaches
  through `descValue` (Net and Netslide call it `parseWireDesc`).
- **newState**, sorted as the proposal asked:
  (a) `descValue(parse…)` and nothing else — 9: Boats, Bricks, Galaxies,
  Lightup, Pattern, Rome, Sokoban, Subsets, Undead.
  (b) builds from the parse value and params only — 47, Mines (opens the
  square a desc names) and Loopy (builds its grid from the parsed grid desc)
  included.
  (c) needs more than the parse gives — 1: Map, whose outline smoothing seeds
  an RNG from the desc string itself (the parse could carry the string, so this
  is not a blocker).
- **Callers outside the games' own objects**, by `npm run refs`:
  `Game.validateDesc` — the midend once, the fake games, and about sixty test
  references in thirteen files; `Game.newState` — the midend twice and about
  190 test and harness references. Each game's own exported `newState` is
  called **787** times from its tests besides.

## The falsifier, and why the proposal's shape is not the one built

The proposal's sketch — `Game.parseDesc(p, desc): DescParse<State>` replacing
`newState` — does trip the falsifier: every game's builder changes signature,
and ~980 call sites repoint, to remove two lines per game. The owner said the
repointing is no objection (2026-10-02: *"What's important is simplicity and
future maintainability"*), so the shapes were compared on that alone. The
typed shape still leaves every one of the 48 games whose parse value is not a
state writing a `descMap(parse, build)` wrapper as its contract member, and
every caller unwrapping a result; the shape below leaves a game writing
`newState` and nothing else. It is the simpler one for the next game to write.

The falsifier's premise was also wrong. It said the pairing is "already uniform
and enforced by the near-miss test's generator check"; that test's own header
says it sees a disagreement only where a parser throws, and that agreement is
what the single parse guarantees, not the test. So the pair was a convention
with nothing structural behind it, which AGENTS.md says is not the finish line.

**The shape built: the verdict is derived from `newState`.** Every `newState`
already reads its desc through `descValue`. `descValue` now throws a
`DescRejection` carrying the parse's `DescError`, and the engine's
`loadDesc(game, p, desc): DescParse<State>` runs `newState` and turns that one
throw back into a result; `validateDesc(game, p, desc)` is its verdict. Any
other throw propagates, because it is a bug. So:

- no game changes a signature; 57 validators are deleted outright;
- the verdict and the board are one reading by construction, for every future
  game, with no idiom to copy;
- the midend builds state 0 from the same call that judged the desc.

The precedent is `decodeParams`, which already refuses by throwing and is
caught at the same boundary. The exception never escapes the engine: inside a
game it is the existing `descValue` call, and outside it is a `DescParse`.

**What keeps a game from accepting everything**: a `newState` that never
reaches `descValue` would accept every desc. `desc-error-games.test.ts`'s junk
case already fails a game that refuses none of its malformed descs.

## A save whose board no longer loads

`loadGame` never validated the saved desc: a save written before a parser
became stricter threw out of `newState` rather than being refused. It now
loads the desc (and the public one, when a private one rebuilt state 0) and
refuses the save with the reason, which is the clean rejection the owner asked
for of saves that are no longer valid.

## Parsing once at runtime

`newGameFromId` and `loadGame` build the board before `withBoardTier`, since
the tier check needs a desc it can read. When the tier check keeps the params
(the common case), that board is state 0; when it changes them, the board is
rebuilt under the tiered params, because a state may carry its tier.

## Naming

The engine function keeps the name `validateDesc`, so the per-game specs that
say "`validateDesc` SHALL reject …" stay true unedited: they now name the
engine's verdict on that game.
