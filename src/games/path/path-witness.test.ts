/**
 * A firing's witness (`says.witness`, docs/descriptions.md § "A firing's
 * reason is built from its binding") on Path's `lineBreaks`: an edge a line
 * on which would leave a square short, read under a `with` that places the
 * edge. The left arm of its `or` (the ends already one piece) is not met on a
 * hint's path: a placing technique crosses such an edge as the line that
 * closes it is placed, so no firing of `lineBreaks` is left to name it.
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import {
  brokeAt,
  witnessNodes,
  witnessOfDef,
} from "../../engine/solve/describe-runtime.ts";
import {
  ladderTechniques,
  runLadder,
  type Said,
  TIERS,
  techniqueFirings,
} from "../../engine/solve/ladder-runtime.ts";
import type {
  LineBreaksBinding,
  LineBreaksSays,
} from "../../generated/games/path/path.compiled.ts";
import { pathGame } from "./index.ts";
import { pathWalk } from "./solver.ts";
import { DIFF_NORMAL, MODE_PAIRS, MODE_PATH, newState } from "./state.ts";

/** The `lineBreaks` firings left once every other technique has run, on each
 * board of a mode: dealt once for both tests, since dealing is their cost. */
const firingsOf = (() => {
  const dealt = new Map<number, ReturnType<typeof techniqueFirings>[]>();
  return (mode: number): ReturnType<typeof techniqueFirings>[] => {
    let got = dealt.get(mode);
    if (got === undefined) {
      got = [];
      for (const n of [6, 7])
        for (let seed = 0; seed < 25; seed++) {
          const p = { w: n, h: n, diff: DIFF_NORMAL, mode };
          const state = newState(p, pathGame.newDesc(p, randomNew(`w${seed}`)).desc);
          const { marks, entries } = pathWalk(state);
          // Every other technique first: `lineBreaks` then fires on what they leave.
          const others = entries.filter((e) => e.id !== "lineBreaks");
          runLadder(marks, ladderTechniques(marks, others, { [TIERS]: 99 }, {}));
          got.push(
            techniqueFirings(
              { entries, placing: [], striking: [] },
              "lineBreaks",
              marks,
            ),
          );
        }
      dealt.set(mode, got);
    }
    return got;
  };
})();

describe("a lineBreaks firing's witness", () => {
  it("names the edge supposed, and the squares read under it", () => {
    let seen = 0;
    for (const mode of [MODE_PATH, MODE_PAIRS])
      for (const firings of firingsOf(mode)) {
        for (const f of firings) {
          const said = f.reasons[0] as Said<LineBreaksBinding, LineBreaksSays>;
          const { witness } = said.says;
          // The `where` is `live(a, b) and (b in piece(a) or with ...)`: the
          // `and`'s parts are `live`'s definition, which has an `or` of its
          // own, and the technique's `or`.
          if (witness === null || witness.held !== "all") throw new Error("no witness");
          const arm = witness.of.find((x) => x.held === "arm");
          if (arm === undefined || arm.held !== "arm") throw new Error("no arm");
          expect(arm.arm).toBe(1);
          seen++;
          // The edge the firing crosses out is the one supposed to hold a line.
          const [s] = witnessNodes(arm).filter((x) => x.held === "supposing");
          if (s === undefined || s.held !== "supposing") throw new Error("no with");
          expect(s.cell).toBe(said.binding.e);
          expect(s.value).toBe(1);
          expect(witnessOfDef(s, "shortNear")).not.toBeNull();
        }
      }
    // What the check looked at.
    expect(seen).toBeGreaterThan(20);
  });

  it("says the square its break left short, read where the break held", () => {
    let seen = 0;
    for (const mode of [MODE_PATH, MODE_PAIRS])
      for (const firings of firingsOf(mode))
        for (const f of firings) {
          const { witness, terms } = (
            f.reasons[0] as Said<LineBreaksBinding, LineBreaksSays>
          ).says;
          const broke = brokeAt(witness, ["closes", "joins", "stuck"]);
          if (broke === null) throw new Error("no break held");
          // The left arm, a loop, is not met on a hint's path (above).
          expect(broke.name).toBe("stuck");
          expect(terms.brokeCloses).toBe(false);
          // `shortNear` names the square as a member, `t` or `s` under it.
          const members = witnessNodes(witness).flatMap((w) =>
            w.held === "member" ? [w.member] : [],
          );
          const last = members.at(-1);
          expect(terms.sq).toBe(last?.["s"] ?? last?.["t"]);
          expect(broke.says["sq"]).toBe(terms.sq);
          seen++;
        }
    expect(seen).toBeGreaterThan(20);
  });

  it("carries the elements read, each once, the firing's own edge among them", () => {
    let seen = 0;
    let reads = 0;
    for (const firings of firingsOf(MODE_PATH)) {
      for (const f of firings) {
        const said = f.reasons[0] as Said<LineBreaksBinding, LineBreaksSays>;
        const { cells } = said.says.reads;
        expect(new Set(cells).size).toBe(cells.length);
        // `live` reads the edge's own mark before the `with` supposes it.
        expect(cells).toContain(said.binding.e);
        reads += cells.length;
        seen++;
      }
    }
    expect(seen).toBeGreaterThan(20);
    expect(reads).toBeGreaterThan(seen);
  });
});
