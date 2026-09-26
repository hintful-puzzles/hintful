/*
 * Pearl's `runDeductionFixpoint` ladder, proved equivalent to upstream's
 * hand-written loop (`pearlWorkspaceLegacy`). The harness and the argument for
 * it are `engine/testing/ladder-equivalence.ts`; this file is the declaration.
 *
 * **What needed proving.** Upstream's loop runs its first two stages in one
 * pass, and its shortcut-loop stage sits behind a `continue` inside an
 * Easy-only branch, which reads as a Tricky pass that does not restart after
 * an earlier stage fires. Neither is a difference from the runner: the first
 * stage leaves nothing for itself to find straight after, and the clue stage's
 * own `continue` means the shortcut stage is only reached with nothing fired.
 * The comparison is of the whole workspace (every square's surviving states
 * and every edge), at both caps.
 *
 * Pearl generation is costly (a 10x10 fixture alone takes tens of seconds in
 * the differential), so the corpus is small boards: the census below is what
 * says they are enough.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderEquivalence } from "../../engine/testing/ladder-equivalence.ts";
import { newDesc } from "./generator.ts";
import { pearlWorkspace, pearlWorkspaceLegacy } from "./solver.ts";
import { DIFF_EASY, DIFF_TRICKY, newState, type PearlParams } from "./state.ts";

const SHAPES: PearlParams[] = [
  { w: 6, h: 6, difficulty: DIFF_EASY, nosolve: false },
  { w: 6, h: 6, difficulty: DIFF_TRICKY, nosolve: false },
  { w: 7, h: 7, difficulty: DIFF_TRICKY, nosolve: false },
  { w: 8, h: 6, difficulty: DIFF_TRICKY, nosolve: false },
];

const SEEDS = ["lad-a", "lad-b", "lad-c"];

interface Board {
  p: PearlParams;
  clues: Uint8Array;
}

const cases = SHAPES.flatMap((p) =>
  SEEDS.map((seed) => {
    const label = `${p.w}x${p.h} d${p.difficulty} ${seed}`;
    const { desc } = newDesc(p, randomNew(`pearl-ladder-${label}`));
    const { clues } = newState(p, desc);
    return { label, board: (): Board => ({ p, clues }) };
  }),
);

const verdict = ({ ret, ws }: { ret: number; ws: Int32Array }) => ({
  ret,
  ws: ws.join(","),
});

describeLadderEquivalence<Board>({
  game: "pearl",
  rungs: [
    "shapes-from-edges",
    "edges-from-shapes",
    "pearl-clues",
    "closed-loop",
    "shortcut-loop",
  ],
  unreached: {},
  caps: [DIFF_EASY, DIFF_TRICKY],
  cases,
  viaRunner: ({ p, clues }, cap, firings) =>
    verdict(pearlWorkspace(p.w, p.h, clues, cap, firings)),
  viaLegacy: ({ p, clues }, cap) => verdict(pearlWorkspaceLegacy(p.w, p.h, clues, cap)),
  // The solvers build their own workspace from the clues, so the whole working
  // state travels in the verdict above rather than on the input board.
  key: ({ clues }) => clues.join(","),
});
