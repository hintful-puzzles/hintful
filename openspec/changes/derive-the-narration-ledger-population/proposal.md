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

**Expect the fix to find more.** Ten of the eleven entries are single-game,
where the entry-level check is equivalent to the per-game one — so the hole can
only have hidden listings on the one multi-game entry, the shared Latin chain,
which after the Mathrax removal still lists six. Whether all six reach it in the
walk is exactly the open question, and the honest prediction is that some do
not.

## What changes

- **`ledgerUsed` is keyed by `(entry, game)`**, and the close-out case asserts
  every *listed game* reached its entry, not just every entry. The failure
  message says to delete the listing with the measurement that justified it.
- **Dead listings the stricter check finds are removed**, each with the walk
  that found nothing recorded beside the entry — the shape the Mathrax removal
  already uses, so the next reader can re-run it rather than re-derive it.
- **The doc comment says which half is which**, because "a rename cannot leave a
  dead exemption behind" is currently claimed for a field the guard does not
  check per game.

## What this does not do

- **Not a derivation of the `games` field.** The tempting move is to drop the
  roster and let the regex scope the exemption alone. For a *shared engine*
  sentence that would be sound; for the ten game-specific entries the roster is
  what stops a Palisade exemption excusing a Towers sentence, and an exemption
  that travels is worse than one that rots. The roster stays; what changes is
  that it is held to what the walk actually speaks.
- **Not the 120-character limit**, and not any sentence's wording.
