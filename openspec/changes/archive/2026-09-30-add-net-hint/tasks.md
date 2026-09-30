## 1. Engine

- [x] 1.1 `deduce.ts`: facts from notes, locks and walls; side, loop and seal
      exclusions; easiest-first steps; `finishes` (design.md D1, D3).
- [x] 1.2 Measured soundness and reach per preset (D2).

## 2. Hint

- [x] 2.1 `hint.ts`: the plan through the declared verbs, lock journeys,
      keep-track, the mistakes refusal (D5).
- [x] 2.2 `hint-text.ts`: sentences bound to marks; `hintMarks` (D3).
- [x] 2.3 The marks on the frame: ring, outline, stripes, the placed note.
- [x] 2.4 Two long templates ledgered in `LONG_NARRATIONS`.

## 3. Generation

- [x] 3.1 Keep only boards the engine finishes; `net-trace-4` retired from the
      byte-match and asserted as such a board (D4).

## 4. Tests, help, spec

- [x] 4.1 `net-hint.test.ts`: every preset hinted to the end soundly;
      keep-track; refusal; the frame. Cross-game hint guards pass for Net
      (quality, binding, resume, marks).
- [x] 4.2 Help: the Hints section and `{{hint-marks}}`.
- [x] 4.3 `net` delta: the hint; generation keeps hint-finishable boards.
- [x] 4.4 Ran the app: a turn-and-lock journey through two presses of Hint;
      note and loop frames rendered and read.
- [x] 4.5 Owner playtest (2026-09-30): the seal-off wording rewritten (design.md
      D3a); accepted. The touch lock gap goes to `afford-every-hint-action`.
