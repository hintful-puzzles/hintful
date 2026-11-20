## The fact the guards read: the working row, not `freedom: query`

Decided 2026-11-20 (task 1.1). The four ledgers' code-breaking entries are
read off the working row of `engine/code-rows.ts` on the game's `Ui`
(`workingRowGames` in `testing/enrollment.ts`, keyed by the `WorkingRow`
type's fields), and not off a description's `freedom: query`:

- **`freedom: query` has no consumer.** The schema requires it, and only a
  planning game's `permute` is read (the dead-end checker). Keying four
  guards on it would make it a statement only checks read.
- **`query` is the wrong population.** Mines is a query game, and its probes
  are forced: a safe square is deduced. "No probe is forced" (`UNJUDGED`) is
  false of it, so a derivation from `query` would excuse Mines for a reason
  untrue of it. Black Box is a query game with no working row, and its
  entries are its own mechanic's (a revealed arena takes no move; a ray is
  fired where the player chooses).
- **Joining by `Ui` fields is the spec's own form** (`ts-engine`, "A shared
  mechanic is joined by having it"), and every reason moved is a fact of the
  mechanic: a value is named by its own key (`code-rows.ts` says so of the
  cursor), a guess is a probe and the only claim a rule-out
  (`ruleOutMistakes`), and a won game takes no more guesses.

| Ledger | Code-breaking entries | Now |
|---|---|---|
| `KEYPAD_WITHOUT_PENCIL` | guess, wordguess | working row |
| `UNJUDGED` | guess | working row; blackbox's own reason kept |
| `UNBREAKABLE` | guess, wordguess | working row; blackbox, mines kept |
| `UNREACHED` (wrong-entry) | guess | working row; the ledger is empty |

**A kind exemption is held both ways** (`KindExemption`, `testing/ledger.ts`):
a member the guard no longer finds fails with the kind's reason, so the
exemption is a claim about the mechanic the guard keeps testing, not a skip.
A ledger entry for a game the kind already excuses fails too.

## The wider entries (task 1.3)

Settled 2026-11-20, each by reading its guard:

- **`ALWAYS_SOLVABLE.wordguess`: derived** from the working row (the desc is
  the hidden answer, and guessing it wins). Seen to fail: a `hasNoSolution`
  planted in Wordguess.
- **`BINDS_A_SHORTCUT_LETTER.wordguess`: derived** from the game's own
  keypad: a bare letter it offers as a key is the game's, and one it offers
  but lets through to the app now fails. Seen to fail: N dropped from
  Wordguess's keypad.
- **Mines in `untiered-load.test.ts`: the game's own.** `NOT_FINISHED` pins
  a board, and Mines is there because its hint is its own test.
- **`KEYPAD_WITHOUT_PENCIL.filling`: the game's own.** No other game places
  a number only by typing with no pencil array.
- **`OWN_SOLVER` (Ascent, Mines, Undead): the games' own.** It is the state
  of each one's hint (`move-judge.ts` has a judge for a hint built from a
  game's own walk), not a kind; derived, it would excuse every new
  hand-built hint in silence.
- **`NARRATES_MOVES`: the games' own.** All seven declare
  `nothingToDeduce`, but ten more games that do are held to the necessity
  voice, so deriving it would drop them from the rule.
- **The bevels: derived.** A close pair with one edge of a declared
  `darkSwaps` bevel, whose other edge stands off the same neighbor by the
  floor, is carried by that edge (`bevelCarried`). That covers all six
  entries (Fifteen ×3, Sixteen, Twiddle, Slide), whose other edges stood
  0.20 to 0.24 off. Seen to fail: Fifteen's lowlight planted equal to its
  highlight.
- **`color-dark-check`'s `SETS`: retired.** Every set in it is painted from
  named colors whose dark values `darkModePalette` uses as authored, so
  `colors.test.ts` ("a set meant to be told apart is designed as a set")
  already measures each in both schemes, in the gate.
- **Hint-resume's `LATIN`: derived** from the compiled ladders that place
  `latin.single`. That widens it from four games to eight (Adjacent,
  Mathrax, Salad, Solo). Mathrax failed at once: the walk read the width as
  `params.w ?? params.order`, and Mathrax calls it `o`. The width is now
  read off the grid. The note-less branch counted candidates by row and
  column, which agreed with a real single everywhere but Solo, so it could
  not see `single` said on a note-less cell, which is the library's
  `regionsFull`. The walk now asks for notes. With "naked" planted for
  every single in `candidate-plan.ts`, five of the eight fail where Solo
  alone did. Solo's walk costs 36 s, about 2% of the file on CI.
- **`MOVED`: retired.** The three migrations it tracked are archived, and
  the test is part of `test:hint-sweeps`, which is run after a change to
  shared code. A roster is no reason for its bounds, so every hinting game
  is walked now, which adds about 4 s. Writing the slow tier's new
  snapshots found 17 `-more` snapshots stale since 2026-11-17. 30 of their
  33 lines differ in the hash alone. Star Battle's 12x12 Easy boards also
  changed route, as its per-commit board did in `319d42d5a`. Both are
  intended changes whose slow-tier twins went unwritten, so they were
  written, and `docs/testing.md` § "Running the slow tier" now says to
  write them with their twins.

## Seen to fail (task 2.1)

Planted in Guess at once, each guard failed naming Guess: its keypad removed
(input-parity, citing the working row); a `judgeMove` added (move-judge: "the
reason no longer holds of the game"); a `won` field on the state
(position-status's record scan); a hint that refuses once a rule-out is made
(wrong-entry's "finishes from every right entry"). Un-planted by checkout.

## The stamp's first verdict (task 2.2)

`scripts/new-game.sh stampx code`, then `npm run game -- stampx`: refused
by its spec, its icons, the two kept snapshots and a warm-repaint `WRONG`
pin, and by none of the four ledgers. The stamp was deleted.
