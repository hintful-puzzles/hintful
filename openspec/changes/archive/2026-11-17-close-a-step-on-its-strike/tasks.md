## 1. The engine

- [x] Re-derive the games that build a strike's closing (proposal's query):
  Crossing, Undead and Subsets, as filed (2026-11-17).
- [x] A step given `strikes` closes on them in the engine's strike words, with
  where the notes are and "too" on a later leg; tests in
  `engine/stated.test.ts`, seen to fail first. A value that is a word says
  which mark it is ("the struck ghost", the bound-words guard's rule), in
  its plural where struck from several squares.

## 2. The games

- [x] Crossing: its `noteStrike` closing goes. Dump before and after:
  identical, words and marks.
- [x] Undead: `speak.ts`'s closings go; `speak.ts` stays, as the voice and the
  step calls. Dump before and after: identical, words and marks. Read in the
  running app: a sightline strike's chip and crossed-out notes as before.
- [x] Subsets: its rule-out rings a set in the tally, not a note, so the
  strike closing does not fit it; its move is a declared step instead
  (`ruledOut`). Dump before and after: identical.

## 3. The exception

- [x] Remove the exception from `docs/hints.md` § "The sentences live in
  the description" and, with a delta, from the engine-hints requirement
  "A game's hint sentences SHALL be stated in its description".
