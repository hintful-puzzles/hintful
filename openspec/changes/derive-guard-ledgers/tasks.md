## 1. Census

- [ ] 1.1 Run the query in `design.md` and list every per-game table, with
      what each entry claims about the game.
- [ ] 1.2 Sort each into derive, declare, or keep, with the fact it keys on.

## 2. Derive and declare

- [ ] 2.1 Replace each derivable table with a read of what the game declares;
      see each guard fail on a planted game that lacks the fact.
- [ ] 2.2 Move each declared exception into the game's directory; the guard
      reads all games' declarations.
- [ ] 2.3 For each table that stays, make its failure name the table and the
      line to add.

## 3. Tools and help

- [ ] 3.1 A command that prints a game's ID for params and seed or desc.
- [ ] 3.2 Generate `help/puzzles.md`'s table; remove hand-kept lists of games
      from `help/features.md`.
- [ ] 3.3 Check the help pages in the running app.

## 4. Record

- [ ] 4.1 Update `docs/testing.md` § "What a game owes the cross-game guards"
      and `docs/new-game.md` where it names the tables.
- [ ] 4.2 Spec deltas for any new declaration.
