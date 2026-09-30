# Design: every action reachable by each input

## D1. The route is a field on the verb, not a sentence about it

`one-pointer-for-mouse-and-touch` left the rule in prose: `docs/games/input.md`
said a key-only verb "still owes the pointer a route". Nothing consumed that
sentence, so nothing noticed when a verb had none. A `KeyOnlyVerb` now carries
`pointer: PointerRoute`, required, so omitting it is a type error — which the
model test's own example proved when the field landed.

The route has three forms, which between them cover every key-only verb in the
tree:

| Form | Meaning | Used by |
| --- | --- | --- |
| `repeat` | the button pressed `times` times on the target | Net's half turn (two quarter turns) |
| `cycle` | the button's cycle passes through the result | every erase and reset key (Slant, Unruly, Loopy, Subsets); Slant's `\` and `/` |
| `notes` | the button pressed in notes mode, at `where` on the target | Net's lock |

It is healthy as a declaration because three things consume it: the Controls
paragraph says it (so the help cannot describe a key without its tap), the
test checks it, and `afford-every-hint-action` can replay it for a hint step
that makes a key-only move. The last is why the route names a button and a
count rather than a sentence.

## D2. The test compares what the player sees

For each key-only verb, `target-verb.test.ts` compares the boards its keys
reach at every cursor target with the boards its route reaches at every probe
point: equal for `repeat`; for `cycle` and `notes`, every board the key reaches
is one the route passes through. The comparison is **by the painted frame**
(`ProbeBoard.seen`, `boardsReached` with `bySight`): Net records which way its
last turn went, so a half turn and two quarter turns leave the same picture and
different states, and a state comparison would fail a correct route. Both a
planted `times: 3` and a planted `cycle` for the lock fail it, naming the verb.

## D3. Net: three routes, chosen by the owner

- **Source**: a keypad key (and `C`) arms Source mode; the next press on a
  square, or a select at the cursor, lights the network from there and ends the
  mode; Escape ends it without moving. The status line says the mode is on,
  since a keypad key shows no pressed state.
- **Jumble**: a keypad key sending the existing `J`.
- **Scroll**: on a wrapping grid, a press in the margin starts a drag that
  scrolls the grid by whole squares, following the pointer, as Shift+arrow
  does. The margin is at least 24 px (it holds the notes indicator), enough to
  aim at. A bounded grid's margin starts nothing, as Shift+arrow does nothing
  there.

Rejected alternatives the owner saw: dropping each feature, or recording each
as a keyboard-only exemption; and for scrolling, four keypad arrows. The new
`Ui` fields (`placingSource`, `scroll`) are transient and not encoded, so
saves are unchanged.

## D4. Ascent: a number keypad

A tap places the number after or before a highlighted one, beside it. Any
other number in any empty square is typed, and the hint's "within reach" steps
place exactly such numbers (10 within two steps of 8, with 9 not yet placed),
so before this a touch player was told to make a move they could not. The
keypad is `1`–`9`, `0` and Clear (`numberKeys` in `key-labels.ts`, beside
`digitKeys`, which offers one key per value and so has no `0`). Typing needed
no change: the digits arrive as keys at the origin, and Clear's code is an
erase key, which rubs out the last digit typed. Ascent joins the
`KEYPAD_WITHOUT_PENCIL` ledger with that reason.

## D5. Group: keys for the heading gestures

Group's order and subgroup lines were pointer-only. Its cursor already lives in
element space (the element a row or column stands for), so moving an element
carries the cursor with it, and the keyboard route needs no new state:

- Shift+Left/Right moves the cursor's column one place; Shift+Up/Down its row.
  Rows and columns share one order, so either keeps both in sync. As an arrow
  that is itself an action, the first press on a hidden cursor only shows it.
- `|` toggles the line after the cursor's column, `-` the line below its row.
  Neither is a letter, so neither can be an element.

Shift+arrow did nothing but move the cursor before, and neither symbol was
bound, so no existing control changed. The test holds each key's move equal to
the drag or click that makes it.

## D6. What is structural, and what is not

Inside the target-verb model a key-only verb cannot lack a pointer route, and
`primary`/`secondary` are pointer and keyboard by construction. An arm of a
game's own is outside, and every gap this audit found was in one. Bringing the
drag games into the model is `declare-drag-games-click-half`; hint steps are
`afford-every-hint-action`. Until then, the inventory in `audit.md` is the
record of what was measured, and `docs/games/input.md` says that an arm is
where a gap can hide.

## D7. The probe was not kept

The walk that produced `audit.md` was built as a scratch instrument and
deleted. It took over two hours for the collection, could not see app controls
or reproduce randomness, and ran out of budget on a fifth of the games; as a
guard it would be slow, partial, and after the fact. What survived into the
tree is the part the structural test needed: `ProbeBoard.seen` and
`boardsReached`'s `bySight` and `presses`.
