# add-magnets-hint — tasks

Read [`docs/games/hints.md`](../../../docs/games/hints.md) first — in particular
§ "Give the facts a notation (Loopy)", which is the worked precedent for this
change's hard part — and keep the guide current as you go.

## 1. Read the census before designing anything

- [x] 1.1 Read `magnets-ladder.test.ts`'s firing census and write down, per
      tier, **which of the ten rungs the generator actually reaches, and which
      of the two call sites each belongs to**. Every graded rung but `neither`
      fires (its `unreached` ledger argues `neither` is subsumed by `force`);
      the unnumbered ladder is `force`/`neither` only. The hint's own census
      (`magnets-hint.test.ts`) reaches every premise the recorder names.
- [x] 1.2 Count what the census looked at. Its corpus is every shape × eight
      seeds at both caps, with a sizing argument for the tier plant; ours
      asserts its board count and a floor on bits examined.
- [x] 1.3 What each call site is *for*: design D1. `solveUnnumbered` runs only
      inside the generator before any clue exists, so the hint sees one ladder.

## 2. Settle the notation question — it gates the rest

- [x] 2.1 Only three rungs conclude a negative a player cannot write
      (`checkfull` on a met pole count, `advancedfull`, and `set`'s
      neighbors), and every one is a rule over things on the board (design D2).
- [x] 2.2 No extension of the flag cycle: the board already says every NOT-±,
      measured (46,502 bits, none unreadable) and held by
      `magnets-reading.test.ts`. The `?` stays the only note, and the hint
      places every `?` its deductions rest on.
- [x] 2.3 No tier falls back: both tiers hint to completion on every preset.
- [x] 2.4 Every `?` a step rests on is placed by an earlier step as a move, and
      the player's own `?` marks are seeded as facts, vouched for by
      `findMistakes`.

## 3. One plan, two ladders

- [x] 3.1 One ladder (D1). The runner composed with no seam, using the Tracks
      single-firing driver; `solve`'s technique list moved into `ladder()` so
      the solve and the hint share one declaration.
- [x] 3.2 No seam needed, so no engine change and no `ts-engine` delta.
- [x] 3.3 Domino coupling narrated: "can't go at the other end", "Neither end
      of this domino", "This domino can't hold a −: it would …".

## 4. Tests

- [x] 4.1 Enrollment derived; the one count to move was `hint-mark.test.ts`'s
      `CHECKED.length`, 34 → 35.
- [x] 4.2 Tier-2.5 frames for a placement and a `?` step, targeted shape
      assertions (a ring, one contour per domino, recolored clues) plus
      snapshots.
- [x] 4.3 The existing opener snapshot did not move; the two new frames are the
      only snapshot additions.

## 5. Player-visible: this one is the owner's call

- [x] 5.1 Moot as scoped: no new notation and no change to the flag cycle. The
      player-visible changes are the hint itself and `findMistakes` flagging a
      `?` on a neutral domino (D2), both run in Chrome.
- [x] 5.2 The press cycle is followed by `hintKeepTrack` whichever button
      drives it; a touch long-press arrives as the same secondary press.

## 6. Close out

- [x] 6.1 Cost in the design's § "Cost".
- [x] 6.2 Spec delta: `magnets` (the hint, and the `?` mistake). No `ts-engine`
      delta.
- [x] 6.3 `docs/games/hints.md`: Magnets as the fourth notation case, the first
      needing no new mark, and its row in the color legend.
