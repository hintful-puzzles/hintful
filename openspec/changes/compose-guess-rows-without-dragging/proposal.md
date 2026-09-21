# compose-guess-rows-without-dragging

**Status: implemented 2026-09-21.** Opened the same day, out of
`give-guess-element-keys`. `ux-report.md` beside this file is the full analysis
it rests on, with a claim-status appendix separating what was verified from what
was reasoned; the analysis's conclusions all survived, and the two things that
changed on contact with the code are recorded under "What the build changed"
below.

**The owner answered the three §1 questions on 2026-09-21**, taking the
analysis's recommendation on each: retire drag entry, no auto-submit, and no
strike-out notation in this change. Everything below was written before those
answers and is left as it was argued.

## Why

The owner, 2026-09-21: *"the drag approach never felt right to me, as it's not
something players would encounter in other games, and now that we have proper
buttons, I think we may want to retire the draggable ones entirely, and just
make players add colors from left to right, with automatic submission after the
last one. But I'm not sure."* And: Wordle is welcome as a design reference,
being this game with letters.

Two separable proposals, and they do not get the same answer.

## The premise, corrected

**As worded it is wrong.** Drag is common here — **27 of the 57 games** use one.

**Sharpened it is right, and it is the whole case.** What is unique to Guess is
*token transport*: picking a **value** out of a legend and carrying it to a
slot. Only two games carry a `dragColor` at all, and Map has no palette — its
drag source is a region already wearing the color. Every other drag in the
collection carries information no tap could reproduce: a path (Clusters,
Bricks, Tents), a line fill (Boats), a rubber band (Rect, Pattern), an aim
(Inertia), or a piece whose position *is* the state (Pegs, Signpost, Untangle,
Slide, Sixteen).

**Guess's drag carries exactly one bit — which color — and a button now carries
the same bit in one tap.** A drag whose entire payload a button can deliver is
the one kind that is pure cost.

## Two defects found while answering the question, both verified

1. **The first key after a hold destroys the hold.** Panel keys only, holds on
   pegs 0 and 2, submit, then press a color:
   `[1,0,3,0]` with the cursor parked on peg **0** — a held, filled peg — so the
   press yields `[5,0,3,0]`. `changedState` resets the cursor to 0 and the digit
   arm advances by index, so a row pre-filled out of order is entered wrong.
   Latent upstream, but it needed a keyboard until yesterday; the panel made it
   the primary touch path, and a touch player has no arrow keys to escape it.
2. **A full row the game refuses says nothing.** With `allowMultiple: false` a
   complete row containing a repeat is not markable, and the submit arm returns
   `null` in silence. `Game.statusbarText` exists and five games use it; Guess
   sets `wantsStatusbar: false`.

Both are reproduced against a real `Midend`, and **(1) is the strongest argument
in the whole analysis** — not against drag, but *for* the next-empty rule.

## Verdict on drag: retire it — for redundancy, not for unfixability

The argument that must **not** be used is "it cannot work on touch". It can:
Guess handles no `RIGHT_DRAG`/`RIGHT_RELEASE`, and keying the drag off the
**button class** as Boats and Map do would make it survive a 350 ms hold while
leaving the hold toggle alone — roughly ten lines. A proposal resting on
unfixability will not survive review.

The argument that carries is redundancy plus a mechanical wart: **a tap on the
palette column arms a drag, places nothing, and clears `cursor.visible`** — so
the intuitive "tap a color, tap a slot" fails *and* hides the thing the panel
acts on. That is visible on a mouse, not only a finger.

## Verdict on auto-submit: no

- **Undo does not undo it.** Verified: `changedState` rebuilds the working row
  from holds alone, and at `nextGo = 0` there is no previous row, so undoing a
  submit returns `[0,0,0,0]`. It is retype-from-scratch, not take-it-back.
- **It cannot replace the submit control**, so it adds a mode. Fill a row, edit
  a peg, and the empty→full transition never re-fires.
- **`allowMultiple: false` makes the rule lie**, and **`allowBlank` has no last
  peg** (one suffices). Both presets are `allowBlank: false, allowMultiple:
  true`, so these two bite Custom-dialog players only; the first two bite
  everyone.
- **Wordle settles it in the strong direction.** Every condition that would make
  auto-submit safe holds there and holds *more* strongly — fixed known length,
  always a clean prefix, no pre-filled cells — and NYT still requires Enter.

## Wordle: adopt the entry path, not the abolition of the cursor

**Adopt.** A color lands in the next **empty** slot, not at an index; Clear with
nothing selected becomes Backspace-last; Enter stays explicit.

**Do not adopt.** Keep tap-to-select available, for two reasons specific to this
game:

- **`allowBlank` makes a blank's *position* part of the probe.** "Blank at 2,
  red at 3" is a different guess from "red at 2, blank at 3" — Mastermind scores
  position — and prefix-only filling can express blanks only as a suffix. The
  cursorless model is strictly **less expressive** there. A Wordle row is always
  exactly full, so NYT never met this.
- **Single-position perturbation is Mastermind's canonical move.** "Same guess,
  swap 2 and 3" is how you separate a black from a white. Backspace-only makes
  that four keystrokes; selection makes it two taps. Wordle players never do it
  because the result must remain a real word.

## The panel must never derive feedback

Wordle's feedback is **addressed** — each tile carries its own verdict, so its
keyboard coloring is a transcription of something already shown. Guess gives two
integers over the whole row, and the black and white pegs are **unordered and
unattached**. `markPegs` packs blacks at the front of the feedback array
regardless of which positions produced them, so **no channel exists by which a
verdict reaches a color or a position**.

So there is no analog of green and none of yellow; only the gray survives.
`add-guess-hint`'s proposal carries the four sound one-row readings and the
brute-force that checked them over all 65,536 pairs at 4×4 — and the ranking
matters here: the useful rule is **positional**.

A key grayed by running `computeHint`'s enumeration to exhaustion would be
sound but **unauditable** — a solver's verdict the player cannot perform, cannot
check and learns nothing from. That is quality-bar rule 6's prohibited overlay,
made permanent rather than hint-time, and it contradicts the only aid doctrine
written down in the tree: `ReferenceItem.status` is *"derived purely from the
player's own placements"*.

**So a strike-out, if it ships, is player-placed.** The game records, renders
and saves it; a later `hint()` may then rest a deduction on it, because it is a
fact the player put there.

## What this forces, and the knock-on for the board's palette column

**A notation cannot ship before `encodeUi`.** Guess implements neither
`encodeUi` nor `decodeUi`, so a half-composed row and any unsubmitted hold are
**already lost on save/restore today** — upstream persists both deliberately
(`encode_ui`: *"For this game it's worth storing the contents of the current
guess, and the current set of holds"*). That gets worse if composing becomes the
only interaction.

**And the column's fate is conditional on the notation:**

> If a player-placed strike-out ships on the panel, **delete** the board's
> palette column. If no notation ships, **keep** it and convert it from a drag
> source to tap-to-**place**.

Tap-to-place is safe only because the column and the panel are then two
spellings of one keypress, with no state of their own. A notation breaks that
equivalence: the panel would carry the player's marks and the column would not,
leaving two palettes of which only one shows what has been ruled out.

## What it costs to retire drag

**Nothing a saved game notices.** Every drag field is transient, and a Guess
save carries only the move log. There is no format change and nothing to raise
as a compatibility break.

**One real capability loss, and its mitigation is weaker than it looked.**
`showPuzzleKeyboard` is a player setting (default on); with both drag and the
column gone, a player who turned the panel off could not enter a peg. The report
offered as mitigation that the five digit games are already in that position —
**that was flagged as unverified, and checking it found it only partly true.**
Sweeping every pointer gesture over a real board: Solo, Keen and Filling commit
**zero** moves by pointer alone, so three shipped games genuinely are already
there. Towers (72/576) and Unequal (32/676) do commit pointer-only moves — those
look like clue toggles rather than value entry, which this sweep cannot tell
apart, so the honest statement is **three verified, not five**.

## What has never been checked, and should gate the touch claims

**Nobody has held this game in a hand.** Every touch argument here — and in
`give-guess-element-keys` — is reasoning from the frontend's promotion logic,
not observation. `openspec/changes/test-touch-on-a-real-device` is open and
blocked on deployment.

Every Wordle behavior cited is from the analyst's memory of the product, not
from a source. Two carry real argumentative weight and should be confirmed on a
device before a spec leans on either: **that Enter is explicit**, and **that an
invalid word shakes the row, explains, and does not consume the guess.**

**Neither was confirmed, so no spec sentence leans on either.** The
no-auto-submit requirement is argued from *this* game's undo, which is verified
in code; Wordle appears in this proposal as a design reference and nowhere in
the spec. The refuse-and-explain requirement is argued from the silent `null`,
which is likewise verified here. Both would be worth confirming if either is
ever cited as evidence rather than as inspiration.

---

## What the build changed

Two of the report's recommendations were overtaken by the code, and one defect
appeared that no amount of reading would have found.

- **§5.4's faint next-empty marker was not built**, because the cursor ring
  already is one. A color key reveals the cursor and leaves it on the slot the
  next color will fill, so "where will this land" is answered by an affordance
  that was already there; a second marker would have been two mechanisms saying
  one thing. Confirmed by eye in Chrome.
- **§2.4's "is *empty* a `Ui` fact or a board fact?"** resolved to the board
  fact. The scaffold feared that a deliberate mid-row blank under `allowBlank`
  would become unreachable, but selection survives, so tapping slot 3 and
  pressing a color leaves slot 2 blank — from a finger or from the arrow keys.
  A `Ui`-side "the player meant this one to be blank" flag would have been a
  second, invisible model of the row for a case one tap already covers.
- **The `encodeUi` this change owed was correct and reached nothing.** The app
  takes an autosave when `puzzle-context` sees one of the values it watches
  change, and a `Ui` edit is not a move: a half-composed row came back empty
  from a real page reload while the whole suite was green. The midend now
  reports the encoding on `game-state-change` and the app watches that. This is
  the acceptance bar doing its job — nothing short of opening the app would
  have said so — and it is written up in `tasks.md` §6.4 and in the `ts-engine`
  delta.

## Verified in the browser

Chrome, `npm run dev`, 2026-09-21. Played the default board and a
`allowMultiple: false` board through the panel and the pointer:

- Colors land in the first empty slot and the ring walks ahead of them; the row
  fills and the submit box lights.
- **The defect this change was opened on is gone**: with holds on pegs 0 and 2,
  the first color pressed after the submit landed in peg 1 and both held pegs
  kept their colors.
- A tap on the board's palette column places that color, as its key does.
- Clear backspaces on a full row and visibly walks *past* a held peg.
- On a no-duplicates board, Submit is refused and the status line reads *"Guess
  1 of 10: this game allows no repeated colors."*; one key fixes the row and it
  goes.
- A half-composed row with a hold survives a page reload.

**Not on a real device.** Every touch argument in this change is still reasoning
from the frontend's promotion logic, and the long-press behaviors it adds — a
held finger placing a color, a held finger submitting — are exactly what wants
a hand. `test-touch-on-a-real-device` is open.
