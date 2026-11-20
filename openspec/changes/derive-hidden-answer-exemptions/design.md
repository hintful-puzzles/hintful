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
