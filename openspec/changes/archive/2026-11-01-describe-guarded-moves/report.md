# Report: jumps, toggles and runs described

Measured 2026-11-01 against `508ed4b8` (HEAD before this change).

## Deals and hint walks

A trace dealt four boards of every preset of Pegs, Flip and Inertia (72
deals) and walked each by the hint's first step, up to 400 steps, recording
each deal, each step's rung, move and sentence, and each refusal with the
dead-end verdict beside it. It ran on HEAD in a scratchpad worktree and on
the working tree after each game moved. The traces are byte-identical: Pegs
1,210 lines (36 deals), Flip 231 (24), Inertia 876 (12). Every walk ends
solved on both trees. Inertia's walks took 14.8 s against 13.3 s, the cost
of the compiled slide and claim.

Every existing test and snapshot of the three games passes. The tests that
built a state by hand were retyped to the description's `Int32Array` layers.

## Saves and links

Desc and move encodings are unchanged, so every save and link loads. Two
moves that no interface makes are now refused rather than played: a Flip
press of a square whose pattern is empty (it flipped nothing and counted a
move) and an Inertia slide from a dead ball (already refused).

## Dead-end claims

`research/technique-check/results-dead-end.txt` has the per-world counts.

- **Pegs frozen**: sound on every board from 2×3 to 5×2 and 3×3 (the cap
  stops at 3^11 positions). It holds of 9,060 of 3×3's 19,683 positions.
- **Inertia stranded**: sound on 2×2, 2×3 and 3×2, the boards a five-valued
  layer and a token reach under the cap. It holds of 3,712 positions of each
  2×3 world. The checker reaches no bigger board, so `inertia.test.ts` and
  the game's own hint tests carry the rest: a comparison over 1,264
  positions of random games on the presets found the compiled claim's
  witnesses equal to the move graph's stranded gems on every one, 5 of them
  stranded.
- **Flip** states no claim: its unsolvable test is the GF(2) rank, which no
  formula states. The checker passes it by, and deals no relation.
- A planted unsound claim beside each came out unsound.

## What each game kept, and why

| Game | Compiled and called | Kept, with the reason |
| --- | --- | --- |
| Pegs | jump legality (drag, keyboard, `executeMove`), `play`, finish, `frozen` and its witnesses (the banner, the hint's cut-off reasons), `legalJumps` | the searches' packed board: a proof of loss fed the compiled jumps took 229 ms against 87 ms over 272,603 jumps on a 6×6 Random board (2.6×); `pegs.test.ts` "Pegs' searches" holds its jumps and frozen pegs to the compiled ones, and planted defects in each failed it |
| Flip | press legality, `play` (moves, Solve, the hint's walk), finish | the GF(2) solver, which answers `hasNoSolution` and plans the hint |
| Inertia | slide legality and `play`, the dead ball (`lose`), finish, `stranded` and its witnesses (the banner, the hint's stranding reasons) | `slidePath`, which the hint narrates and the animation measures, held to the compiled slide by `inertia.test.ts` "inertia's slide path" (a planted defect failed it); the route search's move graph, whose gem nodes make a tour, not a move list; the generator's candidate search |

Inertia's compiled claim is about 0.8 ms a call on the presets against the
move graph's 0.1 ms. It is called a few times a hint and once per dead-end
check, so it replaced the move graph there.

## The running app

These checks ran in Chrome against the dev server, with no console error:

- **Pegs**: on `9x1:PPHOHHHPP`, a dragged jump from the right played, and
  the hint then refused with the cut-off peg outlined.
- **Flip**: a 3×3 Crosses board and a 4×5 Random board walked by the hint to
  the finish, the win dialog shown.
- **Inertia**: on the stranding fixture of `inertia-hint.test.ts`, a slide
  onto a mine showed the dead ball and "DEAD!", the arrow keys then did
  nothing, Undo brought it back, and the line that strands the last gem made
  the hint refuse with that gem outlined. A hand-made board stranded from the
  start was refused at load as having no solution.
