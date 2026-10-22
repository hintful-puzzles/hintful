/**
 * Skeleton's generator: draw a loop through every square at random, wall
 * every edge it does not use, take walls away while the ladder still
 * finishes the board, and keep the board only if it needs exactly the tier
 * asked for.
 */

import { type CappedSolve, solvableAtExactlyTier } from "../../engine/difficulty.ts";
import { Dsf } from "../../engine/dsf.ts";
import { LINE } from "../../engine/line-drawing.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { edgeBetween, squareEdges } from "../../engine/square-edges.ts";
import { SkeletonBoard, solveSkeleton } from "./solver.ts";
import { encodeDesc, type SkeletonParams } from "./state.ts";

/** Whether the ladder, capped at `cap`, finishes the board `walls` give. */
function solves(p: SkeletonParams, walls: Uint8Array, cap: number): boolean {
  const board = new SkeletonBoard(p.w, p.h, walls, new Uint8Array(walls.length));
  return solveSkeleton(board, cap) === "solved";
}

/**
 * A loop through every square: each 2 × 2 block of squares is a small loop of
 * its own, and the blocks are joined along a random spanning tree. Joining two
 * side by side takes away the edge each has facing the other and puts in the
 * two between them, which makes their two loops one.
 */
function randomLoop(p: SkeletonParams, rng: RandomState): Uint8Array {
  const g = squareEdges(p.w, p.h);
  const [bw, bh] = [p.w / 2, p.h / 2];
  const sq = (x: number, y: number): number => y * p.w + x;
  const loop = new Uint8Array(g.edgeCount);
  const put = (i: number, j: number, mark: number): void => {
    loop[edgeBetween(g, i, j)] = mark;
  };
  for (let by = 0; by < bh; by++)
    for (let bx = 0; bx < bw; bx++) {
      const [x, y] = [2 * bx, 2 * by];
      put(sq(x, y), sq(x + 1, y), LINE);
      put(sq(x, y + 1), sq(x + 1, y + 1), LINE);
      put(sq(x, y), sq(x, y + 1), LINE);
      put(sq(x + 1, y), sq(x + 1, y + 1), LINE);
    }

  // Every pair of blocks side by side, as the first block and whether the
  // second is to its right or below it.
  const pairs: { block: number; right: boolean }[] = [];
  for (let b = 0; b < bw * bh; b++) {
    if (b % bw < bw - 1) pairs.push({ block: b, right: true });
    if (b + bw < bw * bh) pairs.push({ block: b, right: false });
  }
  shuffle(pairs, rng);
  const tree = new Dsf(bw * bh);
  for (const { block, right } of pairs) {
    const other = block + (right ? 1 : bw);
    if (tree.equivalent(block, other)) continue;
    tree.merge(block, other);
    const [x, y] = [2 * (block % bw), 2 * Math.floor(block / bw)];
    if (right) {
      put(sq(x + 1, y), sq(x + 1, y + 1), 0);
      put(sq(x + 2, y), sq(x + 2, y + 1), 0);
      put(sq(x + 1, y), sq(x + 2, y), LINE);
      put(sq(x + 1, y + 1), sq(x + 2, y + 1), LINE);
    } else {
      put(sq(x, y + 1), sq(x + 1, y + 1), 0);
      put(sq(x, y + 2), sq(x + 1, y + 2), 0);
      put(sq(x, y + 1), sq(x, y + 2), LINE);
      put(sq(x + 1, y + 1), sq(x + 1, y + 2), LINE);
    }
  }
  return loop;
}

export function newSkeletonDesc(p: SkeletonParams, rng: RandomState): { desc: string } {
  const attempt = retryLimit("skeleton: generation");
  for (;;) {
    attempt();
    const loop = randomLoop(p, rng);
    const walls = Uint8Array.from(loop, (m) => (m === LINE ? 0 : 1));

    // Take walls away in a random order, keeping each one the ladder cannot
    // do without at this tier.
    const order = Array.from(walls.keys()).filter((e) => walls[e]);
    shuffle(order, rng);
    for (const e of order) {
      walls[e] = 0;
      if (!solves(p, walls, p.diff)) walls[e] = 1;
    }

    // Removing walls can only have made the board harder, never easier, but
    // it need not have reached the tier.
    const capped: CappedSolve = (cap) =>
      solves(p, walls, cap) ? "solved" : "unsolved";
    if (solvableAtExactlyTier(capped, p.diff)) return { desc: encodeDesc(walls) };
  }
}
