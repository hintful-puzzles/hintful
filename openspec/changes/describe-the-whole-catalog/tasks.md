## Next

1.2.2, `born-candidate-note-family-last`; and 1.1.2, a measurement any
session may take between flips. § 0 is done. Open: none.

## 0. The refactor first

The owner, 2026-11-24, after a review of the migration's sessions: the
refactoring below goes before any other open change, the migration
included (`born-candidate-note-family-rest`, `zoom-and-pan-the-board`,
`show-a-solved-board-on-first-open` and `one-model-for-moving-pieces`
wait). Each session picks the change of these it judges best to take
next; `fill-engine-by-concern` goes before `a-fill-board-of-any-slot`,
which goes last.

**The session that archives the last of them does not hand on.** It
halts and debriefs the owner: what each change did, what it measured,
what is left, and whether the migration is good to proceed.

- [x] 0.1 `the-commit-catches-what-ci-would`
- [x] 0.2 `session-tools-for-the-flip` (for the debrief: its archived
      tasks.md 4.1; and 0.1's 2.3, whether the push runs its fitted plan)
- [x] 0.3 `fill-engine-by-concern`
- [x] 0.4 `one-way-to-say-a-setting`
- [x] 0.5 `the-compiler-reads-meaning`
- [x] 0.6 `the-description-documented-once`
- [x] 0.7 `a-fill-board-of-any-slot`
- [x] 0.8 The debrief (2026-11-27): go ahead. The owner's still, blocking
      nothing: the push's fitted plan unasked (0.1's 2.3), the handoff cap.

## 1. The route

Each task files a group's change when the one before it is archived, never
ahead, with a gap list as its first task, and the rules in design.md
§ "What every group does" in its design. The task is done when that change
is archived, with its figures recorded in its own design.md.

- [x] 1.1 `measure-cost-by-instructions` archived (filed 2026-11-23).
- [x] 1.1.1 `a-game-is-tested-by-its-data` archived (filed 2026-11-23).
- [ ] 1.1.2 The plain-cell family's deals timed board by board: its
      design.md gave one median a game. On 2026-11-28, 100 seeds (20 for
      Star Battle): Sticks 8x10 Unreasonable 157 ms, Star Battle 8 one-star
      Normal 114 to 10 two-star Tricky 1,436. Time each against
      `294a20616` (`compare-cost --baseline`, a worktree carrying this
      tree's lockfile) and fix in the engine any past the bar.
- [x] 1.2 Latin squares and candidate notes: `born-candidate-note-family`
      (filed 2026-11-23), archived with its figures in its design.md
      § "The figures (3.1)".
  - [x] 1.2.1 Solo, ABCD, Salad, Group: `born-candidate-note-family-rest`,
        archived with its figures in its design.md.
  - [ ] 1.2.2 Undead, Rome, Magnets, Crossing, Map:
        `born-candidate-note-family-last` (filed 2026-11-28).
- [ ] 1.3 Regions and partitions.
- [ ] 1.4 Lines and loops.
- [ ] 1.5 Moving pieces: re-plan `one-model-for-moving-pieces` against
      the fill board first, then take it up as this group's first change.
- [ ] 1.6 Hidden information.
- [ ] 1.7 The query in design.md § "Context" finds no hand-written game,
      and the `game-lines` ceiling stands at the TypeScript that is left
      under `src/games/`, if any.
