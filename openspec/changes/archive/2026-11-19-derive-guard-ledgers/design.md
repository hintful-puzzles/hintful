## Context

The population of tables is the query, not a list here. Every per-game
entry outside a game's own directory, in a test file:

    git grep -n -E '^[[:space:]]+[a-z]+:' -- '*.test.ts' ':!src/games/'

then keep the hits whose key is a game id (compare with the registry). The
names seen in the 2026-11-18/19 logs are a starting point, not the census.

## Decisions

**Derive first, declare second, keep a table last.** For each table, ask in
order:

1. Does the game already say this? A missing `findMistakes`, an empty
   `requestKeys`, a hidden answer, a keypad with no pencil key. If so, the
   guard reads that, and the table goes.
2. Is it a fact about the game a guard cannot see? Then it is declared once
   in the game's directory, typed, where the porter writes the rest of the
   game, and the guard reads every game's declaration. Prefer one small
   per-game declaration record over a new `Game` field per guard; weigh that
   against "declare what the engine consumes": a declaration only a test
   reads is the kind that rots, so it stays beside the guard's test unless
   it can be consumed.
3. Is it a judgment with a reason? Then the table stays, and the guard's
   failure names it and the line to add.

**Warm-repaint and mark-collisions pins** are mostly about which board a
seed deals; that fragility is `guards-independent-of-one-deal`'s. This change
gives them only the ID command.

**The ID command** encodes `params:desc` or `params#seed` for a registered
game from the command line, reusing the codecs the app uses, never a second
encoder.

**Help pages.** `help/puzzles.md` becomes generated from the catalog's names,
help links and "similar" column, by the same pipeline that renders help. A
prose list of games in `help/features.md` is replaced by a generated list or
by wording that names none.

**Why the late surfacing is in scope.** Moving exemptions onto what a game
declares means a game-only commit's own guards see its change. That some
engine guards do not run on a game-only commit is a gate-narrowing question,
and `commit-tests-what-it-commits` owns it; this change removes most of the
reasons a game-only change would fail them.

## Risks

- A derived exemption is broader than the hand-written one: it may exempt a
  future game that should have been caught. Each derivation says what fact
  it keys on, and sees a planted game fail it.
