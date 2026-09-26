# derive-the-capability-flags

**Status: scaffolded, not started.** Found while removing `isTimed`
(`turn-the-timer-on-everywhere`, 2026-09-26).

## Why

Three required `Game` booleans repeat, in every game, whether the game has a
method:

| Flag | Method it restates |
| --- | --- |
| `wantsStatusbar` | `statusbarText` |
| `canSolve` | `solve` |
| `canFormatAsText` | `textFormat` |

Measured 2026-09-26 over every registered game (57): **no game disagrees**.
The query was a throwaway vitest file that read each flag against
`typeof game[method] === "function"`. Nothing holds them equal, though: a new
game can declare `canSolve: true` without a `solve`, and the app shows a Solve
button that returns "This game does not support solving". The midend guards
against exactly that by checking both (`midend.ts`, `solve()`:
`!this.game.canSolve || !this.game.solve`; `formatAsText()` does the same).

`canHint`, `canFindMistakes` and `hasReference` are already derived from
their methods (`Midend.getStaticProperties`). These three are the same
convention, made once for some capabilities and not for the others. That is
AGENTS.md's "a game joins a shared mechanic by *having* it", and
`isTimed` was the fourth member of the family until it went.

## What Changes

- `getStaticProperties` derives `canSolve`, `canFormatAsText` and
  `wantsStatusbar` from the methods, as it does `canHint`; the midend's
  double checks collapse to the method check.
- The three members leave `Game`, and every game drops its three lines. That is
  about 170 lines, removable by the shape-verified script technique
  `turn-the-timer-on-everywhere` used for `isTimed` (every removed line one
  of the three declarations, nothing added).
- The specs that "SHALL report `wantsStatusbar = …`, `canSolve = …`,
  `canFormatAsText = …`" (about three dozen, by
  `git grep -l "canSolve\|wantsStatusbar\|canFormatAsText" openspec/specs`)
  get `MODIFIED` deltas that restate the capability as the method's presence.
  Generate them and verify them the way that change did: whitespace folded,
  each block differing from the live text only by the clauses removed.

## Things to check first

- **Any game whose method exists but may return nothing.** Loopy's
  `textFormat` returns `null` off the square grid (docs/games/mechanics.md,
  "Capability flags": "widen the return, don't add a hook"). Deriving from the
  method keeps that behavior, since the flag is `true` for Loopy today anyway.
  Read the table's other rows for the same shape before assuming no other case
  exists.
- **Tests that build a `Game` literal** (`fake-game.ts`, `midend-prefs.test.ts`
  and others) set these flags. The type change finds them all.
- `wantsStatusbar` is read by the chrome through `PuzzleStaticAttributes` and
  must keep its name there, or the rename goes into the app shell as well.

## Player-visible

No: the derived values equal today's declared ones for every game.
