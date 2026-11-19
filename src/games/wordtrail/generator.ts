/**
 * Wordtrail's generator: choose the words' lengths, lay a common word of
 * each length as a random trail on the grid, leave the squares no word
 * covers dark, and keep the board only if the ladder finishes it, which
 * proves that the letters divide into words only one way, each read only
 * one way.
 */

import { drawRejected } from "../../engine/deal-census.ts";
import { type CappedSolve, solvableAtExactlyTier } from "../../engine/difficulty.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { squareEdges } from "../../engine/square-edges.ts";
import { drawAnswer, isGuess } from "../../engine/word-list/index.ts";
import { solveWordtrail } from "./solver.ts";
import {
  encodeDesc,
  LONGEST,
  letterRange,
  SHORTEST,
  type WordtrailParams,
} from "./state.ts";
import { neighbors, type Trail, trailsOf } from "./trails.ts";

/** `p.words` lengths, each a list's word length, that add up to a letter
 * count the board takes, spread as evenly as chance allows. */
function drawLengths(p: WordtrailParams, rng: RandomState): number[] {
  const { least, most } = letterRange(p);
  const total = least + randomUpto(rng, most - least + 1);
  const lengths = new Array<number>(p.words).fill(SHORTEST);
  for (let left = total - SHORTEST * p.words; left > 0; left--) {
    const room = lengths.flatMap((n, i) => (n < LONGEST ? [i] : []));
    lengths[room[randomUpto(rng, room.length)]]++;
  }
  return lengths.sort((a, b) => b - a);
}

/** A trail of `length` squares through the free squares, from a random
 * one, each step a random free neighbor, backing up out of a dead end; or
 * `null` where a few starts all fail. */
function layTrail(
  p: WordtrailParams,
  used: Uint8Array,
  length: number,
  rng: RandomState,
): number[] | null {
  const free = [...used.keys()].filter((i) => !used[i]);
  for (let tries = 0; tries < 8 && free.length >= length; tries++) {
    const path = [free[randomUpto(rng, free.length)]];
    used[path[0]] = 1;
    const grow = (): boolean => {
      if (path.length === length) return true;
      const next = neighbors(p.w, p.h, path[path.length - 1]).filter((j) => !used[j]);
      shuffle(next, rng);
      for (const j of next) {
        used[j] = 1;
        path.push(j);
        if (grow()) return true;
        path.pop();
        used[j] = 0;
      }
      return false;
    };
    if (grow()) return path;
    used[path[0]] = 0;
  }
  return null;
}

export function newWordtrailDesc(
  p: WordtrailParams,
  rng: RandomState,
): { desc: string } {
  const attempt = retryLimit("wordtrail: generation");
  for (;;) {
    attempt();
    const lengths = drawLengths(p, rng);
    const used = new Uint8Array(p.w * p.h);
    const laid: Trail[] = [];
    for (const length of lengths) {
      const trail = layTrail(p, used, length, rng);
      if (trail === null) break;
      laid.push(trail);
    }
    if (laid.length < lengths.length) {
      drawRejected("no room for a word's trail");
      continue;
    }
    const letters = new Uint8Array(p.w * p.h);
    const words = laid.map((trail) => drawAnswer(trail.length, rng));
    if (new Set(words).size < words.length) {
      drawRejected("a word drawn twice");
      continue;
    }
    // Such a word's trail reads as a word either way round, so no deduction
    // could say which way its lines run: the ladder would refuse the board
    // after its whole run.
    if (words.some((word) => isGuess([...word].reverse().join("")))) {
      drawRejected("a word that is a guess read backwards");
      continue;
    }
    for (const [j, trail] of laid.entries())
      for (const [k, i] of trail.entries()) letters[i] = words[j].charCodeAt(k) - 96;
    const board = {
      w: p.w,
      h: p.h,
      letters,
      lengths,
      trails: trailsOf(p.w, p.h, letters, lengths),
      edges: new Uint8Array(squareEdges(p.w, p.h).edgeCount),
    };
    const capped: CappedSolve = (cap) =>
      solveWordtrail({ ...board, edges: board.edges.slice() }, cap);
    if (solvableAtExactlyTier(capped, p.diff))
      return { desc: encodeDesc({ letters, lengths }) };
  }
}
