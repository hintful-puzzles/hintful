## 1. Census

- [x] 1.1 Run the query in `design.md` and list every per-game table, with
      what each entry claims about the game.
- [x] 1.2 Sort each into derive, declare, or keep, with the fact it keys on.

Census of 2026-11-19 (re-run the query before relying on it). Of about 35
per-game tables, few repeat a fact the game states:

- **Derived.** `move-judge-games` `UNJUDGED`: its fifteen "not marks" entries
  were exactly the games declaring `notApplicable.findMistakes`, which is now
  read. `ladder-continuity` `NOT_CONTINUING` restated `hint-frontier`'s
  `OWN_FRONTIER` (a `new HintFrontier` in the game's code), now read off the
  code.
- **Already derived in membership, a reason or fixture kept by hand**:
  `UPSTREAM`, `SEARCH_REACH`, `OWN_FRONTIER`, `NO_UI_STATE`, `NOT_FINISHED`,
  `NO_OVERLAY_TEST`.
- **Kept, judgments a person gives**: `UNBREAKABLE`, `UNREACHED` (wrong-entry,
  warm-repaint), `UNEVEN_FRAME`, `WIDE_BY_NATURE`, `KEYPAD_WITHOUT_PENCIL`,
  `BINDS_A_SHORTCUT_LETTER`, `CLOSE_ON_PURPOSE`, `DECLARED`, `NOT_A_PIECE`,
  `NOT_A_CELL`, `TIERS_NOT_OFFERED`, `NARRATES_MOVES`, `IDIOMS`,
  `LONG_NARRATIONS`, `LET_THROUGH`, `ALWAYS_SOLVABLE`, the upstream-descs
  translation tables.
- **Kept, fixtures**: `PINNED`, `WRONG`, `REFUSED`, `HATCHES_ON`,
  `ANSWERS_NOTHING_AND_CHANGES_THE_FRAME`, research tools' `EXTRA`.
- **Declare: none moved.** No kept table is consumed by anything but its
  guard, and `design.md` keeps such a declaration beside the guard.

## 2. Derive and declare

- [x] 2.1 Replace each derivable table with a read of what the game declares;
      see each guard fail on a planted game that lacks the fact.
      (`UNJUDGED` planted: `guess` removed, the failure named the table and
      the entry.)
- [x] 2.2 Move each declared exception into the game's directory; the guard
      reads all games' declarations. Wordguess dropped its mistake check
      without declaring why, which made it a Draft on the home screen; it
      now declares `notApplicable.findMistakes`.
- [x] 2.3 For each table that stays, make its failure name the table and the
      line to add (`testing/ledger.ts`'s `expectLedger`).

## 3. Tools and help

- [x] 3.1 A command that prints a game's ID for params and seed or desc
      (`npm run game-id`).
- [x] 3.2 Generate `help/puzzles.md`'s table; remove hand-kept lists of games
      from `help/features.md`.
- [x] 3.3 Check the help pages in the running app.

## 4. Record

- [x] 4.1 Update `docs/testing.md` § "What a game owes the cross-game guards"
      and `docs/new-game.md` where it names the tables.
- [x] 4.2 Spec deltas for any new declaration.
