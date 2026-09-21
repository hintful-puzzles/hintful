# grade-a-board-shared-without-its-tier

## Why

Reported by the owner, 2026-09-21: a Bridges board opened by the id
`10x10m2:a2a4e31c2a4a1l1b1e5b4b4a1m1f43j2a4e43d4a2b` showed as "10x10 Easy",
and its hint ran out at move 10 with "Nothing further follows by deduction
here". The board is Tricky (it solves only with stage 3), and the hint had
capped itself at Easy's rules.

The cause is not in Bridges. The id offered for sharing a board omits the
difficulty, as upstream's does, because the desc already fixes the board. But
`Midend.newGameFromId` sets the params from that prefix alone, so every such
board loads at the game's **default** tier, whatever it was dealt at. The label
then misnames it, the hint is capped below the rules the board needs, and the
next New game is dealt at the default. Every tiered game whose sharing id omits
the difficulty is affected. It is not a regression of
`bridges-hint-cites-an-unwritable-cap`: the same refusal at the same move
reproduces on the commit before it.

## What changes

The owner chose, from three options, to grade the board on load. When a `:desc`
id's params string cannot tell tiers apart (it is the sharing encoding of more
than one tier), the midend takes the lowest tier at which the game's own solver
solves the board (`lowestSolvingCap` over `DifficultyContract.solveAtCap`), and
loads at that. An id whose string pins its tier keeps it.

Old links are fixed along with new ones, the id format does not change, and a
board a generator dealt comes back at exactly the tier it was dealt at, which
`difficulty-contract.test.ts` already asserts for every preset of every tiered
game.

The app-shell requirement that explains why the sharing id omits the
difficulty gave a reason ("a link should not over-constrain the recipient's
next game") that loading never honored: the recipient got the default tier, not
their own. It is restated to say what now happens.
