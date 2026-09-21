# grade-a-board-shared-without-its-tier — design

## D1. When to grade: the string cannot tell tiers apart

The first cut graded when the params string was not the full encoding of what
it decodes to. The cross-game test convicted it on its first run: Solo's full
encoding leaves its default tier out, so `2x3` is both the full id of an Easy
board and the sharing id of a board at any tier, and a Normal board shared as
`2x3:…` reloaded Easy.

So the rule is about the string, not the form: grade when the string is the
sharing encoding (`encodeParams(withTier(p, t), false)`) of two or more tiers.
A string that pins its tier, such as Bridges' full `…d2` or Solo's `2x3dn`, is
trusted, and that is the form a player's own board is restored from
(`restoreGameId`). The ambiguous case where a full id and a sharing id coincide
is resolved by grading, which gives a generated board back its dealt tier.

## D2. What to grade with: the contract that already exists

`DifficultyContract.solveAtCap` and `lowestSolvingCap` are the cross-game
guard's own instruments, so the midend grades with exactly what
`difficulty-contract.test.ts` § "deals boards that need the tier the preset
claims" asserts. That test is what makes the grading safe: a generated board's
lowest solving cap is its dealt tier, for every preset of every tiered game.
When no cap solves the board (Dominosa's "Ambiguous", which promises no unique
solution), the decoded params stand, as before.

**Cost.** Up to one capped solve per tier, once, when an ambiguous id is opened,
and the scan stops at the first tier that solves. It runs in the worker with
the rest of `newGameFromId`.

## D3. The guard

The per-game tier-binding test now also reloads one board per game through a
real `Midend` by its sharing id, choosing a board whose short id decodes to a
tier other than its own, since only such a board can tell grading from the
default. A sweep-wide count asserts that more than ten games did.

The first gated commit failed on `contract-surface.test.ts`, correctly:
`Game.difficulty` was ledgered as a capability only tests read, and the
grading made the midend its first production consumer. The entry is deleted. Proved:
grading planted off turns the test red across many games. The owner's board is
pinned in `bridges-hint.test.ts`, loaded by its short id and hinted all the way
to solved.
