/**
 * Cube's planner: a line of rolls that gathers every painted square onto the
 * solid.
 *
 * **A position is the square the solid stands on, which of its face places
 * carry paint, and which squares do.** The solid sits on a square of a given
 * shape in one pose whatever face is down, and a roll only carries each face's
 * paint to another place on it (`executeMove`), so which physical face is where
 * is not part of the position. Read off the game's own roll once per arena,
 * each roll is a destination and a permutation of the face places
 * ({@link Rolls}).
 *
 * **Every hinted roll lowers one number, so a hint asked again after any roll
 * cannot go round in circles** (docs/hints-search.md § "Recompute-stable
 * plans"). Picking a square up lowers the count of painted squares by one and
 * putting paint down raises it, and many boards cannot be finished without
 * putting some down, so the count alone is no such number. The number is
 * {@link potential}: the least, over a window of targets a few squares below
 * the count, of `ROLLS_PER_SQUARE` for each square still painted at the target
 * plus the rolls to reach it, where the line to a target may put paint down
 * but never more than the window above the target. A roll along the line to
 * the target that sets the least lowers the rolls to that target by one, and
 * that target is still in the window of the position it leads to, because the
 * line never rises past it; so the number falls by at least one. The proof
 * needs every line to be a shortest one, which the breadth-first search gives.
 */

import { hashWords, PositionStore } from "../../engine/position-store.ts";
import type { SearchOutcome } from "../../engine/search-outcome.ts";
import type { GridSquare } from "./grid.ts";
import { DIR_CHARS, executeMove, findMoveDest } from "./roll.ts";
import { lowestFace, SOLIDS } from "./solids.ts";
import type { CubeState } from "./state.ts";

/** A roll, by its `Direction`: one of the four orthogonal ones a move holds. */
export type Roll = 0 | 1 | 2 | 3;
const ROLLS: readonly Roll[] = [0, 1, 2, 3];

/**
 * What one roll does, for every square of an arena: `dest[sq * 4 + r]` is the
 * square rolling `r` lands on (-1 off the arena), and the paint on face place
 * `i` afterwards is what place `perm[(sq * 4 + r) * nfaces + i]` held before.
 */
interface Rolls {
  readonly nfaces: number;
  readonly nsquares: number;
  /** The face place resting on the square, which swaps paint with it. */
  readonly bottom: number;
  readonly dest: Int32Array;
  readonly perm: Int8Array;
}

const rollsByArena = new WeakMap<readonly GridSquare[], Rolls>();

/** The arena's rolls, read off `executeMove` by rolling a solid whose faces
 * are numbered: every face counts as painted, so no roll swaps any paint. */
function rollsOf(state: CubeState): Rolls {
  const known = rollsByArena.get(state.grid);
  if (known) return known;
  const nfaces = state.faceColors.length;
  const nsquares = state.grid.length;
  const labels = Int32Array.from({ length: nfaces }, (_, i) => i + 1);
  const dest = new Int32Array(nsquares * 4).fill(-1);
  const perm = new Int8Array(nsquares * 4 * nfaces);
  for (let sq = 0; sq < nsquares; sq++) {
    const at: CubeState = { ...state, current: sq, faceColors: labels };
    for (const r of ROLLS) {
      if (!findMoveDest(at, r)) continue;
      const after = executeMove(at, { dir: DIR_CHARS[r] });
      dest[sq * 4 + r] = after.current;
      for (let i = 0; i < nfaces; i++)
        perm[(sq * 4 + r) * nfaces + i] = after.faceColors[i] - 1;
    }
  }
  const rolls = {
    nfaces,
    nsquares,
    bottom: lowestFace(SOLIDS[state.solidIndex]),
    dest,
    perm,
  };
  rollsByArena.set(state.grid, rolls);
  return rolls;
}

// --- positions --------------------------------------------------------

/**
 * A position packed into words: the square and the count of painted squares
 * in the first, the painted face places as a mask in the second, and the
 * painted squares as a bit set in the rest.
 */
class Packer {
  readonly words: number;
  readonly buf: Int32Array;

  constructor(readonly rolls: Rolls) {
    this.words = 2 + Math.ceil(rolls.nsquares / 32);
    this.buf = new Int32Array(this.words);
  }

  /** The position `state` shows, into `buf`. */
  packState(state: CubeState): void {
    const buf = this.buf;
    buf.fill(0);
    let painted = 0;
    state.blue.forEach((b, sq) => {
      if (!b) return;
      painted++;
      buf[2 + (sq >> 5)] |= 1 << (sq & 31);
    });
    buf[0] = state.current | (painted << 16);
    state.faceColors.forEach((f, i) => {
      if (f) buf[1] |= 1 << i;
    });
  }

  /**
   * Into `buf`, the position rolling `r` from `from` leads to, or false where
   * the roll leaves the arena. A solid with every face painted swaps no paint,
   * as `executeMove` has it.
   */
  roll(from: Int32Array, r: Roll): boolean {
    const { dest, perm, nfaces, bottom } = this.rolls;
    const sq = from[0] & 0xffff;
    const to = dest[sq * 4 + r];
    if (to < 0) return false;
    const buf = this.buf;
    for (let k = 2; k < this.words; k++) buf[k] = from[k];
    let painted = from[0] >>> 16;
    let faces = 0;
    const base = (sq * 4 + r) * nfaces;
    for (let i = 0; i < nfaces; i++)
      if (from[1] & (1 << perm[base + i])) faces |= 1 << i;
    if (painted > 0) {
      const word = 2 + (to >> 5);
      const bit = 1 << (to & 31);
      const square = (buf[word] & bit) !== 0;
      const face = (faces & (1 << bottom)) !== 0;
      if (square !== face) {
        buf[word] ^= bit;
        faces ^= 1 << bottom;
        painted += square ? -1 : 1;
      }
    }
    buf[0] = to | (painted << 16);
    buf[1] = faces;
    return true;
  }
}

/** The painted squares a packed position has. */
const paintedOf = (words: Int32Array): number => words[0] >>> 16;

// --- the search -------------------------------------------------------

/** Positions one hint request may store, across every search it runs. Far
 * above what a preset needs: measured 2026-10-16 over six boards a preset, a
 * whole plan stored at most 434,000, on the octahedron (see `WINDOW`). */
const HINT_ALLOWANCE = 2_000_000;

/** What is left of a request's allowance; a search draws on it. */
export interface Allowance {
  left: number;
}

/**
 * The shortest line from `start` to a position with at most `target` painted
 * squares, never passing one with more than `ceiling`, and shorter than
 * `limit` rolls; null where there is none so short, and "spent" where the
 * allowance ran out first.
 */
function reach(
  packer: Packer,
  start: Int32Array,
  target: number,
  ceiling: number,
  limit: number,
  allowance: Allowance,
): Roll[] | null | "spent" {
  const store = new PositionStore(packer.words);
  store.add(start, hashWords(start, 0, packer.words), -1, -1, 0);
  const node = new Int32Array(packer.words);
  let from = 0;
  for (let depth = 1; depth < limit && from < store.count; depth++) {
    const until = store.count;
    for (let ni = from; ni < until; ni++) {
      store.read(ni, node);
      for (const r of ROLLS) {
        if (!packer.roll(node, r)) continue;
        const painted = paintedOf(packer.buf);
        if (painted > ceiling) continue;
        const hash = hashWords(packer.buf, 0, packer.words);
        if (store.find(packer.buf, hash) >= 0) continue;
        if (--allowance.left < 0) return "spent";
        const added = store.add(packer.buf, hash, ni, r, depth);
        if (painted <= target) return store.lineTo(added) as Roll[];
      }
    }
    from = until;
  }
  return null;
}

/**
 * Rolls a painted square is worth: more than any line to the next square
 * takes, so that a position always has a target that lowers the
 * {@link potential}. The longest such line measured 2026-10-16 was 23 rolls,
 * on the icosahedron's last square.
 */
const ROLLS_PER_SQUARE = 64;

/**
 * How far below the count of painted squares a target may lie, indexed by
 * `SolidType`; a line to a target may put paint down until the count is this
 * far above it. On the tetrahedron and the cube the window reaches the
 * finished board, so the line is a shortest solution. A wider window gives
 * shorter plans and costs searches far larger. Measured 2026-10-16 over six
 * boards a preset, a request stored at most 434,000 positions on the
 * octahedron at 5, where 6 took 1.7 million for plans a roll or two shorter,
 * and 41,000 on the icosahedron at 3, where 4 ran past two million.
 */
const WINDOW: readonly number[] = [4, 6, 5, 3];

/**
 * The number every hinted roll lowers (see the header), and the line to the
 * target that sets it: empty where no target in the window lowers it, or where
 * the board is finished.
 */
function potential(
  packer: Packer,
  start: Int32Array,
  window: number,
  allowance: Allowance,
): { value: number; line: Roll[] } | "spent" {
  const painted = paintedOf(start);
  let best = { value: ROLLS_PER_SQUARE * painted, line: [] as Roll[] };
  for (let target = painted - 1; target >= Math.max(0, painted - window); target--) {
    const limit = best.value - ROLLS_PER_SQUARE * target;
    const line = reach(packer, start, target, target + window, limit, allowance);
    if (line === "spent") return "spent";
    if (line) best = { value: ROLLS_PER_SQUARE * target + line.length, line };
  }
  return best;
}

/**
 * The rolls that finish the board from `state`, made of the line to each
 * position's target in turn. Where the allowance runs out after the first
 * line, or no target lowers the potential, the plan stops there, and the next
 * request carries on from wherever the player is. Out of reach where it stops
 * before its first roll; never "lost", which nothing here could prove.
 */
export function planRolls(
  state: CubeState,
  allowance: Allowance = { left: HINT_ALLOWANCE },
): SearchOutcome<Roll> {
  const packer = new Packer(rollsOf(state));
  const window = WINDOW[state.solidIndex];
  packer.packState(state);
  const at = packer.buf.slice();
  const line: Roll[] = [];
  while (paintedOf(at) > 0) {
    const next = potential(packer, at, window, allowance);
    if (next === "spent" || next.line.length === 0) break;
    for (const r of next.line) {
      packer.roll(at, r);
      at.set(packer.buf);
    }
    line.push(...next.line);
  }
  if (line.length === 0 && paintedOf(at) > 0) return { kind: "out-of-reach" };
  return { kind: "found", line };
}

/**
 * Whether some painted square can be picked up from `state` without putting
 * any paint down first: a search of the rolls that change no paint, ending at
 * the first that picks some up. Every position on the way has the same paint
 * on the arena, so it is the square and the face places alone, and the search
 * is exhaustive.
 */
export function canCollectWithoutDropping(state: CubeState): boolean {
  const packer = new Packer(rollsOf(state));
  packer.packState(state);
  const painted = paintedOf(packer.buf);
  if (painted === 0) return false;
  const store = new PositionStore(packer.words);
  store.add(packer.buf, hashWords(packer.buf, 0, packer.words), -1, -1, 0);
  const node = new Int32Array(packer.words);
  for (let ni = 0; ni < store.count; ni++) {
    store.read(ni, node);
    for (const r of ROLLS) {
      if (!packer.roll(node, r)) continue;
      const after = paintedOf(packer.buf);
      if (after < painted) return true;
      if (after > painted) continue;
      const hash = hashWords(packer.buf, 0, packer.words);
      if (store.find(packer.buf, hash) < 0) store.add(packer.buf, hash, ni, r, 0);
    }
  }
  return false;
}
