/**
 * A firing's witness (`says.witness`, docs/descriptions.md § "A firing's
 * reason is built from its binding") on Path's `lineBreaks`: an edge a line
 * on which would leave a square short, read under a `with` that places the
 * edge. The left arm of its `or` (the ends already one piece) is not met on a
 * hint's path: a placing technique crosses such an edge as the line that
 * closes it is placed, so no firing of `lineBreaks` is left to name it.
 */
import { describe, expect, it } from "vitest";
import { type Witness, witnessOfDef } from "../../engine/describe-runtime.ts";
import {
  ladderTechniques,
  runLadder,
  type Said,
  TIERS,
  techniqueFirings,
} from "../../engine/ladder-runtime.ts";
import { randomNew } from "../../engine/random/index.ts";
import { pathGame } from "./index.ts";
import type { LineBreaksBinding, LineBreaksSays } from "./path.compiled.ts";
import { pathWalk } from "./solver.ts";
import { DIFF_NORMAL, MODE_PAIRS, MODE_PATH, newState } from "./state.ts";

/** Every node of `w`, outermost first. */
function nodes(w: Witness | null): Witness[] {
  if (w === null) return [];
  return [w, ...(w.held === "all" ? w.of.flatMap(nodes) : nodes(w.of))];
}

describe("a lineBreaks firing's witness", () => {
  it("names the edge supposed, and the squares read under it", () => {
    let seen = 0;
    for (const mode of [MODE_PATH, MODE_PAIRS])
      for (const n of [6, 7])
        for (let seed = 0; seed < 25; seed++) {
          const p = { w: n, h: n, diff: DIFF_NORMAL, mode };
          const state = newState(p, pathGame.newDesc(p, randomNew(`w${seed}`)).desc);
          const { marks, entries } = pathWalk(state);
          // Every other technique first: `lineBreaks` then fires on what they leave.
          const others = entries.filter((e) => e.id !== "lineBreaks");
          runLadder(marks, ladderTechniques(marks, others, { [TIERS]: 99 }, {}));
          const firings = techniqueFirings(
            { entries, placing: [], striking: [] },
            "lineBreaks",
            marks,
          );
          for (const f of firings) {
            const said = f.reasons[0] as Said<LineBreaksBinding, LineBreaksSays>;
            const { witness } = said.says;
            // The `where` is `live(a, b) and (b in piece(a) or with ...)`: the
            // `and`'s parts are `live`'s definition, which has an `or` of its
            // own, and the technique's `or`.
            if (witness === null || witness.held !== "all")
              throw new Error("no witness");
            const arm = witness.of.find((x) => x.held === "arm");
            if (arm === undefined || arm.held !== "arm") throw new Error("no arm");
            expect(arm.arm).toBe(1);
            seen++;
            // The edge the firing crosses out is the one supposed to hold a line.
            const [s] = nodes(arm).filter((x) => x.held === "supposing");
            if (s === undefined || s.held !== "supposing") throw new Error("no with");
            expect(s.cell).toBe(said.binding.e);
            expect(s.value).toBe(1);
            expect(witnessOfDef(s, "shortNear")).not.toBeNull();
          }
        }
    // What the check looked at.
    expect(seen).toBeGreaterThan(20);
  });
});
