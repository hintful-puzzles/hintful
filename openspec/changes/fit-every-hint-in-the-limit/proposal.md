# fit-every-hint-in-the-limit

## Why

The owner (2026-10-18), asked whether the hint text could be more concise: "It'd
be a massive success if they can all fit into the current 120 without
exceptions", and of the engine's shared wording (the conclusions, the setup
step, the hidden single and the numbered chain): "I do really want to keep the
engine controlling these elements of the hint, but if they can be made shorter
and still clear, that's amazing."

A census of the length walk with the ledger set aside (`hint-quality.test.ts`,
every step over 120 collected instead of failing) found 800 distinct sentences
over the limit in 20 games, under 28 ledger entries. Most of the length is each
game's own reasoning; the engine's shared endings recur in a dozen games but
move the median little.

The pills that now point at each reference (`show-what-a-hint-names`) change
what words must do: a sentence no longer has to describe what it points at for
the player to find it. The cut rule is to delete the words that describe what
the marks show, and keep the premise and the reason.

## What Changes

- **The engine's strike ending keeps the necessity voice in fewer words**:
  "so we must cross out the 4" becomes "so the 4 must go" in every candidate
  game. An imperative ("so cross out the 4") was tried first and refused by the
  necessity-voice rule (`engine-hints`, "The necessity-voice rule applies to
  every hinting game not ledgered as narrating moves"), which is right: a
  forced step must read as forced.
- **The engine's numbered chain** states the case split, both ends, the rule
  and the tie in one clause: "Cell 1 is 4 or the numbered chain forces cell 4
  to 4, both in line with this cell, so the 4 must go" (258 characters before,
  about 105 after). "The chain forces" is the propagation rule; "in turn",
  tried first, is what the speculative-chain guard reads as a chain left
  unshown.
- **Each game's long sentences are cut** to what the marks do not show, game by
  game, and each ledger entry whose sentences now fit is deleted.

## Impact

- `engine-hints`: the strike ending and the chain sentence, and the ledger.
- Every candidate game's wording through the engine; Mosaic, Salad, Singles,
  Mines, Magnets, Towers, Solo and Undead through their own `hint-text.ts`,
  and, after a copy-editor's pass (owner, 2026-10-19), Net, Pearl and Rect.
- Specs whose scenarios quote a sentence: `keen`, `solo`, `palisade`,
  `magnets`, `net` and `pearl` (Pearl's quoted run-on was already stale).
- Help pages are unaffected: none quotes a hint sentence.
