# compose-guess-rows-without-dragging — tasks

**§1 was answered by the owner on 2026-09-21** and the rest was implemented in
the same session. `ux-report.md` beside this file is the analysis the answers
rest on, with its claim-status appendix intact.

## 1. The owner decided

- [x] 1.1 **Retire drag entry?** **Yes**, on redundancy — Guess's was the
      collection's only token-transport drag and carried one bit a panel key
      now carries in a tap.
- [x] 1.2 **Auto-submit?** **No.** Submit stays explicit and gains a panel key.
      The undo evidence is the reason: `changedState` rebuilds the working row
      from the holds alone, so undoing the first guess of a board yields an
      empty row rather than the one that was sent.
- [x] 1.3 **A player-placed strike-out notation?** **Not in this change.** The
      notation question stays with `add-guess-hint`, which holds the brute-forced
      rule table that points at per-slot marks.
- [x] 1.4 **And the palette column goes too**, which is a correction. §1.3 was
      put as "notation, and the column's fate follows from it", so a *no* on
      notation left the column standing as tap-to-place. That misread the
      owner's original words — *"retire the draggable ones entirely"* — which
      name the draggable color pegs themselves, not only the gesture. Asked
      directly (*"what is it still needed for?"*), the honest answer is
      **nothing**: it was a legend the panel now draws better, a tap-to-place
      that is a second spelling of a key, and the second axis of a cursor that
      existed to walk it. The column, that axis, and the `2` in `computeSize`'s
      horizontal multiplier are all gone.

## 2. The two defects, fixed

- [x] 2.1 **Next-empty advance.** A color lands in the first empty slot rather
      than at `cursor.x + 1`, and `changedState` parks the cursor on the first
      slot the holds left open. `guess.test.ts` § "guess next-empty entry"
      drives the reported repro end to end through the panel — compose, hold
      pegs 0 and 2, submit, press a color — and was confirmed to fail when the
      old `ui.cursor.x = 0` is put back.
- [x] 2.2 **Refuse and explain.** `wantsStatusbar` is on and `statusbarText`
      names the guess in progress and says *"this game allows no repeated
      colors"* when that is what is blocking the row.
- [x] 2.3 **`encodeUi` / `decodeUi`**, in upstream's format (`3_,0,5,2`). A
      color the params have no room for decodes as an empty slot, and the
      restored cursor lands where the next color goes.
- [x] 2.4 **`allowBlank` and what "empty" means.** Settled as a **board fact**
      (`currPegs[i] === 0`), not a `Ui` fact. The scaffold feared blanks would
      become unreachable; they do not, because selection survives — tapping
      slot 3 and pressing a color leaves slot 2 blank, from a finger or from
      the arrow keys. A `Ui`-side "the player meant this one to be blank" flag
      would be a second, invisible model of the row that `changedState` would
      have to rebuild and `encodeUi` persist, for a case one tap already covers.
      Held by a test under `allowBlank: true`.

## 3. Retiring drag

- [x] 3.1 The four drag `Ui` fields, the press and drag arms, the past-guess
      hit test and the blitter sprite are gone; Guess is no longer a
      `blitterNew` caller. Every pointer action happens on the release, keyed on
      the button **class**, and the press is declined — which is also what fixes
      the two long-press casualties the report found (a held finger on a color
      now places it; a held finger over the feedback pegs now submits).
- [x] 3.2 What drag did, respelled: clearing a peg is select + Clear, or
      Backspace; copying a color out of a past row is reading it and pressing
      that swatch. **A tap on a past row stays no move** — making it place that
      color would replace a deliberate gesture with an easy one, and a `Ui`
      change has no undo, so a stray tap on a row the player was only reading
      would cost them a peg with no way back.
- [x] 3.3 A marker on the next-empty slot. **Built out of the cursor rather
      than added beside it**: a color key reveals the ring and leaves it on the
      slot the next color will fill, so "where will this land" is answered by
      the affordance that was already there. A second faint marker would have
      been two mechanisms saying one thing.
- [x] 3.4 **The palette column is deleted** (§1.4), and with it the cursor's
      color axis — `CURSOR_SELECT` placed whichever color that axis rested on,
      and now submits or is declined. Reclaims the literal `2` in
      `computeSize`'s horizontal multiplier *and* the `max(column, rows)` in its
      vertical one. The one cost is stated in the spec rather than discovered:
      with the keypad turned off there is no pointer-only way to enter a peg,
      which is where Solo, Keen and Filling already are.
- [x] 3.5 A Submit key on the panel. **Not conditionally offered** — it cannot
      be: `requestKeys` takes params alone, because the panel reloads only on a
      param change. It is declined on a row that will not go, and §2.2 is what
      makes that legible rather than mute.

## 4. Spec

- [x] 4.1 `REMOVED` + `ADDED` for *"Guess accepts drag, hold, keyboard, and hint
      input"* (its three scenarios carried over unchanged) and for *"Guess never
      writes past the end of the working row"* (whose one scenario now describes
      a case the requirement no longer allows — Clear backspaces there instead
      of declining). `MODIFIED` for *"Guess offers one key per color, and a tap
      selects a peg"* and for *"Guess game implements the Game interface"*,
      which asserted `wantsStatusbar = false`. Three new requirements: the
      composition rules, the status line, and the saved `Ui`.
- [x] 4.2 Every `REMOVED`/`MODIFIED` heading checked against the live spec as a
      whole line (`rg -F -x`), all four matching once. The capability **Purpose**
      named drag too and is not expressible as a delta; it was edited in the
      live spec directly and re-checked after archiving.

## 5. Verify

- [x] 5.1 The two drag tests are gone, and their *behavior* is re-tested against
      what replaced them: the palette tap, the long-press fold, and Clear's
      backspace. New coverage for next-empty entry, the blank-in-the-middle
      case, the full-row refusal, the statusbar refusal and the `Ui` round trip.
- [x] 5.2 The help page rewritten for composition: press or tap a color, the
      ring shows where the next one goes, Submit sends the row, Clear rubs one
      out, holds keep a peg through the clear.
- [x] 5.3 Ran the app in Chrome and played a board through — see the change's
      **Verified in the browser** note in `proposal.md`. **Not on a real
      device**; every touch argument here is still reasoning from the frontend's
      promotion logic (`test-touch-on-a-real-device` is open and blocked on
      deployment), and the long-press behaviors this change adds are the things
      that most want it.
- [x] 5.4 Wordle's two load-bearing behaviors were **not** confirmed on a
      device, so no spec sentence leans on either. The auto-submit requirement
      is argued from this game's own undo, which is verified in code; Wordle is
      cited in the proposal as a design reference and nowhere in the spec.

## 6. Found while doing it, and fixed here

- [x] 6.1 `input-parity.test.ts`'s gesture sweep asked *"was the press
      consumed"* to decide whether a gesture was worth comparing, so a game that
      declines its press and acts on the release was skipped entirely — and its
      vacuity guard is what reported it, correctly, the moment Guess became one.
      It now asks whether the gesture **acted**, which is the question the guard
      is named for, and the comparison got stronger for every game rather than
      only unblocking this one.
- [x] 6.2 The same file's inert-panel-key probe primed the board with at most
      **one** press of the panel's first key, so a key whose precondition is
      several presses — Submit needs a whole row — read as inert. A third prime,
      a run of twelve, covers it. Measured at load 3.7: 20.97 s before, 21.00 s
      after, because `reached` short-circuits for almost every key.
- [x] 6.3 `input-probe.ts` and `docs/games/input.md` both cited Guess's holds as
      the example of a secondary meaning that never reaches the save. That
      stopped being true the moment §2.3 landed; both now cite Signpost and the
      pencil-mark games, and say why the population is an observation rather
      than a roster.
- [x] 6.4 **`encodeUi` was correct and reached nothing, which only the browser
      said.** The app autosaves when `puzzle-context` sees one of the values it
      watches change — game id, move index, checkpoints, and the status text for
      a *timed* game — and a `Ui` edit moves none of them. A composed row came
      back empty from a real reload with the whole suite green, which is
      AGENTS.md § "Acceptance bar" in one observation. The midend now reports the
      encoding itself on `game-state-change` and the app watches that, so the
      value compared **is** the part of the save that would differ; a game with
      no `encodeUi` reports nothing. `midend-ui-state.test.ts` holds it, derived
      from the hook, and was confirmed to fail (5 tests, 4 games) with the
      derivation removed. Carried as a `ts-engine` delta.
