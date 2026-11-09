# Tasks

- [x] 1. Census: every game's `findMistakes` shape, and every refusal each game can give. The query is `registerGame`'s two checks (a game with `findMistakes` and no `clearMistakes`, a game with a trial-and-error tier and no `revealOne`), which refused every such game on 2026-11-09 until it had its hook.
- [x] 2. Design: a game declares `clearMistakes` and `revealOne` (`game.ts`); a dead end or a lost game is rewound by the midend alone, to the latest position the hint, Solve and the mistake check let stand; a board with no one answer is the named exception. The owner chose revealing one piece of the answer over showing it whole (2026-11-09). A search game past its reach (Sixteen, Twiddle, Netslide, Pegs, Sokoban) has no piece to give from the player's position, and shows the answer whole.
- [x] 3. The engine: applying the wrong-board hint clears the mistakes, in one step of Undo (`check.test.ts`)
- [x] 4. Each other refusal with a way forward carries its move (`WAY_FORWARD` in `hint-refusal.ts`; the Hint control arms on it in `puzzle.ts`)
- [x] 5. The guard: `hint-finishes-any-board.test.ts`, every game with a hint, a randomly played board and a trial-and-error board. With each way forward planted away it failed: the clear in 44 games, the reveal in 28, the rewind in 4 (Flood, Inertia, Mines, Sokoban). Signpost's and Net's random play makes no mistake; their clearing was checked by hand.
- [x] 6. The help's hints page (`help/features.md` §"When there's no hint to give")
- [x] 7. Played in Chrome: Path 6x6 Easy with a line from the 4 into the 6 (cleared, one Undo restores it, the next press is a step); Light Up 7x7 Unreasonable (a bulb revealed, then reasoning resumes); Mines 9x9 after opening a mine (rewound, Redo lit)
- [x] 8. The owner tries it on their phone (accepted 2026-11-09)
