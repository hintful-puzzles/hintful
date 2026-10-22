# Tasks — share-line-drawing-drag

Starts after `share-square-edge-geometry` is archived.

## 1. The module

- [x] 1.1 The line drag over `square-edges.ts`: Ui shape, step, cut, erase,
      release, click, keyboard, cross sweep declaration, preview state, with
      the options of design D1; tests. (`engine/line-drawing.ts`, which also
      owns `OPEN`/`LINE`/`CROSS`; `squareAt` joins `square-edges.ts`.)
- [x] 1.2 Path onto it; `moves.ts`'s drag and `index.ts`'s arms reduced to
      the declaration.

## 2. Pearl

- [x] 2.1 Ask the owner D2's questions, written into `design.md`, and wait
      for the answers. (Three, with the erase rule; all answered 2026-10-22.)
- [x] 2.2 Pearl onto the module, its ops and saves unchanged (D4), its
      behavior as the owner decided.
- [x] 2.3 Tracks, Ascent, Bridges: re-read against the module (D3), decision
      recorded.

## 3. Close-out

- [x] 3.1 `docs/input.md` § "Drag models": the line drag, with the module as
      exemplar; `engine-catalog.md` entry.
- [x] 3.2 Play Pearl and Path in the app with mouse, touch and keyboard;
      `npm run game -- pearl` and `-- path` green; commit, push; bring Pearl's
      changed behavior to the owner; archive on acceptance. (Played
      2026-10-22: drag, preview, carry-on, erase, loop, over-full refusal by
      drag, click and Ctrl+arrow, Ctrl+Shift, cross sweep, a touch drag. Pearl
      no longer makes a move that leaves the board as it was, so it comes off
      `input-answers.test.ts`'s list. The owner decided each change D2 names
      before it was made, so the archive goes in with the work.)
