# own-the-select-or-drag-gesture — tasks

**Nothing here is started.**

## 1. Pin the difference before removing it

- [ ] 1.1 Decide the repeat-tap answer (proposal § "What the owner requires"):
      either is acceptable if all members agree. Then write the cross-game
      guard first, over the derived population, and watch it fail on whichever
      games answer differently: a repeat tap on the selected cell or region
      does the one agreed thing; a sticky right tap on a cell that can take no
      mark leaves the highlight where it was. Drive both through the
      game's own `interpretMove`, press and release, so a drag game cannot
      pass by answering a direct call it never receives.
- [ ] 1.2 Read Rome's and Map's press, drag and release paths side by side and
      list what differs between them for a reason about the puzzle and what
      does not (§ "Recommended fix", the open questions).

## 2. Move the gesture into the engine

- [ ] 2.1 Design the engine side against both games at once, not one then
      the other. Record the shape chosen and the ones declined in a
      `design.md`.
- [ ] 2.2 Selection identity comes from the game; Map's region is not a
      special case in the engine.
- [ ] 2.3 Rome and Map move to it; their tap comments and any per-game
      highlight bookkeeping go.
- [ ] 2.4 Apart from the repeat-tap answer, if §1.1 chose to change it for
      them, the click-select games are unchanged: their tests and
      `note-taking-cell-render.test.ts` snapshots pass without re-baselining.

## 3. Prove it

- [ ] 3.1 §1.1's guard passes for every member.
- [ ] 3.2 Plant a regression (a drag game that hides the highlight at press
      again) and watch the guard name it.
- [ ] 3.3 Run the app: Rome and Map, tap, repeat tap, drag, sticky and
      non-sticky right tap, keyboard.

## 4. Record

- [ ] 4.1 Replace the `ts-engine` requirement's last sentence (the one that
      specifies the re-select). A `MODIFIED` block must reproduce every
      scenario; grep the live spec for the sentence first (`AGENTS.md` §
      "Work management").
- [ ] 4.2 `docs/games/mechanics.md` § "Pencil marks: the full note-taking UX",
      the "If your press starts a drag" bullet, and `engine-catalog.md`'s
      `note-taking-cell.ts` entry.
