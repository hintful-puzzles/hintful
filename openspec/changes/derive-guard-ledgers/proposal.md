## Why

Filed on the owner's word, 2026-11-19, from the review of the Wordguess and
Wordtrail session logs.

The cross-game guards derive which games they cover, but most of their
exemptions are tables written by hand, keyed by game id, in the guard's own
test file. A new game, or a game that changes what it is, has to be entered
or removed in each by hand, and it learns which ones only by failing them.

From the logs (2026-11-18 and 19):

- Registering Wordguess failed 14 tests in 10 files; Wordtrail's first
  verdict gave 12 refusals. Most were fixed by adding a line to a table:
  `BINDS_A_SHORTCUT_LETTER`, `KEYPAD_WITHOUT_PENCIL`, `UNBREAKABLE`,
  `UNJUDGED`, `UNREACHED`, `UNEVEN_FRAME`, `ALWAYS_SOLVABLE` and the like.
- Dropping Wordguess's answer row later broke seven guards at once, about
  20 minutes and 15 edits across 8 files, each removing an entry that said
  Wordguess took notes or had a mistake check.
- `warm-repaint.test.ts`'s pins need a real game ID, and no command encodes
  one: an agent wrote a throwaway test that threw the ID as an error.
- `help/features.md` names games by hand in prose, and `help/puzzles.md`'s
  table is "manually generated for now"; each new game edits both.
- Two engine guards (`move-judge-games`, `wrong-entry-check`) do not run on a
  commit that stages only a game, so their missing entries surfaced only on
  the next commit that touched the engine, 40 minutes into a later commit.

The doctrine already says it: "a guard derives its population from what each
game is", and a hand-kept list of games rots.

## What Changes

- Each exemption table is either derived from what the game already
  declares (a game with no `findMistakes` has no wrong entry to reach; a
  game whose answer is hidden is judged as hidden), or moved onto a
  declaration in the game's own directory that the guard reads, so a game
  states its exception once beside its code.
- `help/puzzles.md`'s table is generated from the catalog, and
  `help/features.md`'s lists of games are generated from what the games
  declare, or reworded so they name none.
- A command prints a game's ID for given params and seed (or desc), so a pin
  is written without a throwaway test.
- Where a table must stay a judgment (a reason only a person can give), its
  guard says so in its failure message, naming the table and the line to
  add.

## Impact

The cross-game tests under `src/engine/`, `src/puzzle/` and `src/`, possibly
`Game` in `src/engine/game.ts`, `help/`, `scripts/`, `docs/testing.md` §
"What a game owes the cross-game guards".
