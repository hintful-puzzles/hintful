/**
 * The boards upstream's C dealt, against the compiled ladder.
 *
 * Upstream kept a clue only where its solver could not do without it, so the
 * ladder solving every board says it reaches as far as upstream's solver did
 * on them. The ladder is not upstream's (its rulings out read the board
 * where upstream's candidate elimination did not), so it strips a different
 * set of clues and no seed is asked to deal its board again.
 *
 * The fixture is **frozen and cannot be regenerated**: the C harness that
 * recorded it is gone (see `engine/testing/differential.ts`).
 */
import { describe, expect, it } from "vitest";
import cReference from "./__fixtures__/filling-c-reference.json" with { type: "json" };
import { solveFilling } from "./solver.ts";
import { decodeParams, isSolved, newState } from "./state.ts";

interface Fixture {
  w: number;
  h: number;
  seed: string;
  desc: string;
}
const data = cReference as { version: number; fixtures: Fixture[] };

describe("filling's ladder on upstream's boards (frozen C reference)", () => {
  it.each(
    data.fixtures.map((f) => [`${f.w}x${f.h} seed=${f.seed}`, f] as const),
  )("solves %s", (_label, f) => {
    const st = newState(decodeParams(`${f.w}x${f.h}`), f.desc);
    const { solved, board } = solveFilling(st.clues, f.w, f.h);
    expect(solved).toBe(true);
    expect(isSolved(board, st.clues, f.w, f.h)).toBe(true);
  });
});
