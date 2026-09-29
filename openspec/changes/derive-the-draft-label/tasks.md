## 0. Measure

- [x] 0.1 Classify every absence of every optional member (`design.md` §
      "Task 0"). `hint`, `findMistakes`, `solve` and `transposeParams` tell
      apart: 16 of 17 `findMistakes` and 13 of 14 `transposeParams` absences
      have a puzzle reason; the four `solve` absences are history, not reasons.
      The falsifier fires for `difficulty`, `textFormat` and the affordances,
      which stay outside. The drafts come out as exactly the eleven hintless
      games.

## 1. Engine

- [x] 1.1 `src/engine/sections.ts`: the section list, `sectionState`,
      `draftSections`, `notApplicableMarkdown`, `SQUARE_GRID`. A game that
      implements and excuses a section is refused.
- [x] 1.2 `Game.notApplicable`, keyed by section; `hint` is not a key (design
      D1).

## 2. Games

- [x] 2.1 25 games declare their reasons: `findMistakes` for the rearranging,
      many-solution and hidden-answer games; `transposeParams` for gravity, a
      fixed exit, a square grid or a layout.

## 3. Ledgers

- [x] 3.1 `NOT_TURNED` moved onto Bricks, Same Game and Slide;
      `orientation.test.ts` reads the section, and holds a `SQUARE_GRID` reason
      to every menu board drawing square (proven red).
- [x] 3.2 `OPENS_ITS_OWN_REFUSAL`'s Fifteen, Flood and Sixteen derived from
      their `findMistakes` reason, in a new `hint-refusal-opening.test.ts` so
      `hint-refusal.test.ts` stays a source scan (proven red).
- [x] 3.3 `NO_FLAG`'s "no solver" entries derived from the `solve` section;
      Black Box's and Guess's false "no solver" reasons rewritten.
- [x] 3.4 `KEYPAD_WITHOUT_PENCIL` stays: it explains a presence (design D4).

## 4. Surfaces

- [x] 4.1 `virtual:draft-puzzles` (`vite-plugins/draft-puzzles.ts`), in the
      build and in vitest; `catalog-card` shows "Draft" with what is still to
      come; `catalog-card.test.ts` holds the map to `draftSections`.
- [x] 4.2 The help's "Not in this game" section (`vite-plugins/not-applicable.ts`);
      `help/features.md` explains the label.
- [x] 4.3 Deleted the "No `unfinished` flag" comments in `catalog-data.ts` and
      `puzzle-screen.ts`, and the dead `__PUZZLE_IDS__` declaration.

## 5. Close

- [x] 5.1 Spec deltas re-read against the code; headings checked with
      `rg -F -x`. Docs: `mechanics.md`, `testing.md`, `engine-catalog.md`,
      AGENTS.md.
- [x] 5.2 Ran the app (Chromium, dev server): the eleven hintless games carry
      the label at desktop and phone width, no other game does; Fifteen's help
      shows its reason above its parameters.
- [ ] 5.3 **Owner acceptance**: the label's wording and placement on the home
      screen, and the "Not in this game" wording.
