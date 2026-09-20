# derive-the-narration-ledger-population

## Why

`hint-quality.test.ts`'s `LONG_NARRATIONS` is the collection's one exemption
ledger for a narration over the 120-character limit, and it is asserted **both
ways** on purpose: an unlisted long sentence fails, and an entry that matches
nothing fails too, so shortening a sentence means deleting its entry rather than
leaving a dead exemption behind. That is the right design. It has a hole.

**The "still needed" half is keyed by entry, not by entry *and* game.**
`ledgerUsed` is a `Set<number>` of entry indices, so an entry passes as soon as
*any* one of its listed games reaches the sentence. A game listed on an entry it
never reaches is invisible. The only other check on the `games` field is that
each names a game shipping a `hint()`, which every registered hinting game
passes.

**This is not hypothetical — `add-mathrax-hint` shipped one.** Mathrax was added
to the shared Latin chain entry on the inference that its solver records
`forcing` (it does, ~10 records across 16 boards). Measured afterwards over all
nine presets × 3 seeds × both auto-pencil settings: **100,249 plan steps, zero
chain sentences**. The frontier takes Mathrax's clue strikes and singles first
and the board finishes before a chain is ever the best candidate. The entry was
already used by six other games, so nothing noticed. The listing has been
removed (`hint-quality.test.ts`, with the measurement in a comment); what has
not been fixed is that the ledger could not see it.

## What changes

- **`ledgerUsed` is keyed by `(entry, game)`**, and the close-out case asserts
  every *listed game* reached its entry, not just every entry. The failure
  message says to delete the listing with the measurement that justified it,
  and the case collects every finding rather than stopping at the first, so one
  run reads as a census.
- **A second vacuity floor, per game.** The collection-wide `linted > 2000` is
  met many times over by the games that did walk, so it cannot tell "this
  game's walk found nothing" from "this game's walk *was* nothing" — which,
  with a negative asserted per listing, is the difference between a finding and
  a false one.
- **`lintCases` gains a third rule: the last preset at the hardest teachable
  tier.** This is the fix the work actually turned out to need — see below.
- **The doc comments say which half is which**, because "a rename cannot leave
  a dead exemption behind" was claimed for a field the guard did not check per
  game.

## What the stricter check found

**Not what this proposal predicted.** It expected dead listings on the shared
Latin chain entry and argued "the honest prediction is that some do not [reach
it]". There are **none**: five of the six listed games reach the sentence in the
gate's own walk, and the sixth, Group, reaches it too — at **12x12 Hard**, 44
times in 2,007 steps over 12 seeds, and nowhere else in its 7 presets × 5 tiers.

12x12 Hard is not a shipped preset. Group's presets stop at 8x8 Tricky and 12x12
Normal, so that board is reachable only through the Custom dialog, and the
walk's two rules — every tier of the *first* preset, every other preset at *its
own* tier — build it between them at neither. So the roster was right and the
walk was short, and the stricter check's first act was to demand that a live
listing be deleted.

That is the failure this change's own task list warned about, caught by its own
safeguard, and it makes the fix a fix to the **walk**: one board per tiered
game, the last preset at the hardest teachable tier, which is the one corner of
`presets × tiers` that neither existing rule reaches. It costs 47 s on a 36 s
block, four games hold ~40 s of it, and the measurement and the reasoning for
three seeds are in `tasks.md` and beside the code.

The general lesson, recorded in `LONG_NARRATIONS`' doc comment and
`docs/games/hints.md`: **a shared-engine sentence's roster is the games that
reach it in the walk, not the games that could.** Reading it off the solver is
an inference — Mathrax is the case where the inference was too generous, Group
the case where the walk was too narrow to check it.

## What this does not do

- **Not a derivation of the `games` field.** The tempting move is to drop the
  roster and let the regex scope the exemption alone. For a *shared engine*
  sentence that would be sound; for the ten game-specific entries the roster is
  what stops a Palisade exemption excusing a Towers sentence, and an exemption
  that travels is worse than one that rots. The roster stays; what changes is
  that it is held to what the walk actually speaks.
- **Not the 120-character limit**, and not any sentence's wording. No narration
  changed, and no ledger entry was deleted.
