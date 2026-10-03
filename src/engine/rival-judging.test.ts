import { describe, expect, it } from "vitest";
import {
  type Allowance,
  claimRelation,
  judgeRivals,
  type Verdict,
} from "./rival-judging.ts";

/** Judge rivals named by their verdicts, each costing what it says. */
const judgeAll = (verdicts: readonly Verdict[], allowance = 100) =>
  judgeRivals(verdicts, allowance, (v) => v);

describe("judgeRivals", () => {
  it("says what the verdicts allow, and nothing past them", () => {
    expect(judgeAll([]).claim.kind).toBe("none");
    expect(judgeAll(["lost", "lost"]).claim.kind).toBe("only");
    expect(judgeAll(["finishes", "lost"]).claim).toMatchObject({
      kind: "onlyThese",
      goods: ["finishes"],
    });
    expect(judgeAll(["finishes", "lost", "unknown"]).claim).toMatchObject({
      kind: "alsoThese",
      goods: ["finishes"],
    });
    expect(judgeAll(["finishes", "finishes"]).claim.kind).toBe("every");
    // An unsettled rival leaves nothing to say unless one was lost and another
    // finishes beside it.
    expect(judgeAll(["finishes", "unknown"]).claim.kind).toBe("unsettled");
    expect(judgeAll(["lost", "unknown"]).claim.kind).toBe("unsettled");
  });

  it("lets only a judging that lost every rival say so", () => {
    const forced = { relation: "forced", rivals: "lost" };
    const oneOf = { relation: "oneOf" };
    const form = (vs: Verdict[]) => {
      const r = claimRelation(judgeAll(vs).claim);
      if (r === null) return null;
      return r.kind === "forced"
        ? { relation: r.kind, rivals: r.rivals ? "lost" : null }
        : { relation: r.kind };
    };
    expect(form(["lost"])).toEqual(forced);
    expect(form([])).toEqual(forced);
    expect(form(["finishes", "lost"])).toEqual(oneOf);
    expect(form(["finishes"])).toEqual(oneOf);
    expect(form(["unknown"])).toBeNull();
  });

  it("shares one allowance across the rivals, in order", () => {
    const seen: number[] = [];
    const { verdicts } = judgeRivals([30, 30, 30], 50, (cost, a: Allowance) => {
      seen.push(a.left);
      if (a.left < cost) return "unknown";
      a.left -= cost;
      return "finishes";
    });
    expect(seen).toEqual([50, 20, 20]);
    expect(verdicts).toEqual(["finishes", "unknown", "unknown"]);
  });
});
