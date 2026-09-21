# compose-guess-rows-without-dragging — tasks

**Nothing here is started.** §1 is the owner's to answer; §2 is not, and should
not wait for it.

## 1. The owner decides

- [ ] 1.1 **Retire drag entry?** The analysis says yes, on redundancy — Guess's
      is the collection's only token-transport drag and carries one bit a button
      now carries. It is **player-visible and changes how a shipped game is
      played**, so it is not ours to decide.
- [ ] 1.2 **Auto-submit?** The analysis says no, and the undo evidence is the
      reason. If the owner wants it regardless, the honest vehicle is a per-game
      preference shipped **off** — noting that a `Ui`-backed preference in a game
      with no `encodeUi` needs its persistence built first.
- [ ] 1.3 **A player-placed strike-out notation?** This is the same question
      `add-guess-hint` §1.1 asks, and the two changes must answer it once. It
      also decides §3.4 below, because the column's fate hangs on it.

## 2. Do these regardless of §1 — they are defects today

- [ ] 2.1 **Next-empty advance.** A color key places at the next *empty* slot
      rather than `cursor.x + 1`, and the post-submit cursor lands on the first
      slot the holds left open. Fixes the verified defect where the first key
      after a hold overwrites it. This is the keystone of every option in §1, so
      it is not premature under any of them.
- [ ] 2.2 **Refuse and explain.** Turn on `wantsStatusbar` and say why a full
      row cannot be submitted — "This game allows no repeated colors" — instead
      of a silent `null`. Wordle's answer to the invalid word, and a shortfall
      independent of everything else here.
- [ ] 2.3 **`encodeUi` / `decodeUi`.** A half-composed row and an unsubmitted
      hold are lost on save/restore today; upstream persists both on purpose.
      This is a prerequisite for any notation and it is owed anyway.
- [ ] 2.4 Re-check 2.1's fix against `allowBlank`, where a deliberate blank in
      the middle of a row must survive "next empty" — the rule must mean *next
      slot the player has not filled*, not *next slot that is zero*, or blanks
      become unreachable. **Settle this before writing 2.1**, because it decides
      whether "empty" is a `Ui` fact or a board fact.

## 3. If §1.1 goes ahead

- [ ] 3.1 Remove the four drag `Ui` fields, the three press arms and two release
      arms, and the blitter sprite; Guess then stops being a `blitterNew`
      caller. The tap-to-select release arm **stays** and becomes the only
      pointer arm on a slot.
- [ ] 3.2 Replace what drag did that a key does not: clearing a peg becomes
      select + Clear (or Backspace-last), and copying a color from a past row
      becomes reading it and pressing that swatch. **Holds do not cover the
      copy** — they carry only from the immediately preceding row, across a
      submit.
- [ ] 3.3 A faint marker on the next-empty slot when no cursor is shown, so
      "where will this color land" is answerable by looking. Wordle needs none
      because its row is always a clean prefix; Guess with holds is not.
- [ ] 3.4 The palette column, per §1.3: convert to tap-to-**place** if no
      notation ships, delete if one does. Deleting reclaims the literal `2` in
      `computeSize`'s horizontal multiplier — about a quarter of the board's
      width at standard params, by arithmetic rather than by measurement.
- [ ] 3.5 A Submit key on the panel, disabled unless the row is markable. It
      also fixes a second long-press casualty: a 350 ms hold over the feedback
      strip drops the submit, because the arm tests `LEFT_RELEASE`.

## 4. Spec work, which has a trap in it

- [ ] 4.1 Drag is named in **three** places in `openspec/specs/guess/spec.md`:
      the capability Purpose, the requirement *"Guess accepts drag, hold,
      keyboard, and hint input"*, and a paragraph inside *"Guess offers one key
      per color, and a tap selects a peg"*. Retiring it needs `REMOVED` +
      `ADDED` under a new name for the second (three scenarios survive
      unchanged), and an ordinary `MODIFIED` for the third.
- [ ] 4.2 Before archiving, check every `REMOVED`/`MODIFIED` heading against the
      live spec as a whole line (`rg -F -x`), and grep for the *sentence* being
      changed — drag is asserted in two requirements, and a delta faithful to
      the wrong one passes every check.

## 5. Verify

- [ ] 5.1 Retire or rewrite the two drag tests in `guess.test.ts`; the
      drag-out-to-clear one needs its *behavior* re-tested against whatever
      replaces it.
- [ ] 5.2 The help page was corrected on 2026-09-21 to describe the keypad; if
      drag goes, it changes again.
- [ ] 5.3 Run the app, and **on a real device if one is available** — every
      touch argument behind this change is reasoning from the frontend's
      promotion logic, and nobody has held this game in a hand
      (`test-touch-on-a-real-device` is open and blocked on deployment).
- [ ] 5.4 Confirm the two load-bearing Wordle claims on a device before any spec
      sentence leans on them: that Enter is explicit, and that an invalid word
      refuses without consuming the guess or clearing the row.
