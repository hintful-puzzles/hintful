/**
 * Ball Sort's own behavior: the codecs, the pour, the search held to the
 * description and to a plain search, the input, and Solve to a sorted board.
 */
import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/index.ts";
import {
  CURSOR_RIGHT,
  CURSOR_SELECT,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
} from "../../engine/input/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { ballsortGame } from "./index.ts";
import { newDrawState, tubeCenter } from "./render.ts";
import { Reach, Tubes } from "./solver.ts";
import {
  type BallsortState,
  decodeParams,
  encodeDesc,
  encodeParams,
  legalPour,
  legalPours,
  newState,
  newUi,
  poured,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

const G = ballsortGame;
const P = decodeParams("3h3e1");

describe("Ball Sort's params", () => {
  it("round-trip through their string", () => {
    const p = { colors: 7, capacity: 5, spare: 1 };
    expect(encodeParams(p, true)).toBe("7h5e1");
    expect(decodeParams("7h5e1")).toEqual(p);
    expect(decodeParams("9")).toEqual({ colors: 9, capacity: 4, spare: 2 });
  });

  it("refuse a deal of more balls than one or three empty tubes deal, and load it", () => {
    expect(validateParams(decodeParams("9h6e1"), true)).toMatch(/at most 48 balls\.$/);
    expect(validateParams(decodeParams("8h6e1"), true)).toBeNull();
    expect(validateParams(decodeParams("8h4e3"), true)).toMatch(/at most 30 balls\.$/);
    expect(validateParams(decodeParams("10h6e2"), true)).toBeNull();
    expect(validateParams(decodeParams("9h6e1"), false)).toBeNull();
  });
});

describe("Ball Sort's desc", () => {
  it("lists each tube from the bottom up", () => {
    const s = newState(P, "abc,bca,cab,");
    expect(textFormat(s)).toBe("cab.\nbca.\nabc.");
    expect(encodeDesc(s)).toBe("abc,bca,cab,");
  });

  it.each([
    ["a tube over its capacity", "abca,bc,cab,b"],
    ["a color short", "abc,bca,ca,"],
    ["a color the board does not have", "abd,bca,cab,c"],
    ["a tube too few", "abc,bca,cab"],
    ["a tube too many", "abc,bca,cab,,"],
  ])("refuses %s", (_, desc) => {
    expect(() => newState(P, desc)).toThrow();
  });
});

describe("Ball Sort's pour", () => {
  it("moves the top run, as much of it as fits", () => {
    const p = decodeParams("2h4e1");
    // Three b's on top of tube 0: all three go into an empty tube, and only
    // one onto a b with room for one.
    const empty = newState(p, "abbb,aaab,");
    expect(encodeDesc(poured(empty, { type: "pour", from: 0, to: 2 }))).toBe(
      "a,aaab,bbb",
    );
    const room = newState(p, "abbb,aab,a");
    expect(encodeDesc(poured(room, { type: "pour", from: 0, to: 1 }))).toBe(
      "abb,aabb,a",
    );
  });

  it("goes only onto its color or into an empty tube, never into a full one", () => {
    const s = newState(decodeParams("2h2e1"), "ab,ba,");
    expect(legalPour(s, { type: "pour", from: 0, to: 1 })).toBeNull();
    expect(legalPour(s, { type: "pour", from: 0, to: 2 })).not.toBeNull();
    expect(legalPour(s, { type: "pour", from: 2, to: 0 })).toBeNull();
    expect(legalPour(s, { type: "pour", from: 0, to: 0 })).toBeNull();
  });

  it("plays to a sorted board, which then shows solved", () => {
    let s = newState(decodeParams("2h2e1"), "ab,ba,");
    for (const [from, to] of [
      [0, 2],
      [1, 0],
      [1, 2],
    ])
      s = G.executeMove(s, { type: "pour", from, to });
    expect(status(s)).toBe("solved");
  });
});

/** Positions met on random walks from a few deals. */
function walked(params: string, n: number): BallsortState[] {
  const p = decodeParams(params);
  const out: BallsortState[] = [];
  for (const seed of ["w1", "w2", "w3"]) {
    const rng = randomNew(seed);
    let s = newState(p, G.newDesc(p, rng).desc);
    for (let k = 0; k < n; k++) {
      out.push(s);
      const pours = legalPours(s);
      if (pours.length === 0) break;
      s = poured(s, pours[(k * 5 + seed.length) % pours.length]);
    }
  }
  return out;
}

describe("Ball Sort's search", () => {
  it("pours as the description's rules do", () => {
    let checked = 0;
    for (const s of walked("5h4e1", 30)) {
      const tubes = new Tubes(s.w, s.h);
      const packed = tubes.pack(s);
      for (let from = 0; from < s.w; from++) {
        for (let to = 0; to < s.w; to++) {
          const n = tubes.amount(packed, from, to);
          const m = { type: "pour", from, to } as const;
          expect(n > 0).toBe(legalPour(s, m) !== null);
          if (n > 0) {
            expect(tubes.pour(packed, from, to, n)).toEqual(tubes.pack(poured(s, m)));
            checked++;
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(50);
  });

  it("measures every distance as a search that tells the tubes apart does", () => {
    // The search takes boards that differ only in the order of their tubes
    // as one; a plain breadth-first search over the boards themselves is the
    // instrument it is checked against.
    for (const s0 of walked("3h3e1", 4).concat(walked("4h3e1", 3))) {
      const dist = new Map<string, number>();
      const parents = new Map<string, Set<string>>();
      const queue = [s0];
      const seen = new Map([[encodeDesc(s0), s0]]);
      for (let head = 0; head < queue.length; head++) {
        const s = queue[head];
        for (const m of legalPours(s)) {
          const next = poured(s, m);
          const k = encodeDesc(next);
          if (!parents.has(k)) parents.set(k, new Set());
          parents.get(k)?.add(encodeDesc(s));
          if (seen.has(k)) continue;
          seen.set(k, next);
          queue.push(next);
        }
      }
      const back = [...seen.values()].filter((s) => status(s) === "solved");
      for (const s of back) dist.set(encodeDesc(s), 0);
      for (let head = 0; head < back.length; head++) {
        const k = encodeDesc(back[head]);
        for (const pk of parents.get(k) ?? []) {
          if (dist.has(pk)) continue;
          dist.set(pk, (dist.get(k) ?? 0) + 1);
          back.push(seen.get(pk) as BallsortState);
        }
      }
      const reach = Reach.of(s0);
      for (const [k, s] of seen) expect(reach?.distance(s)).toBe(dist.get(k) ?? null);
    }
  });

  it("finds a line as long as the distance, that sorts the board", () => {
    for (const s of walked("5h4e2", 2)) {
      const reach = Reach.of(s);
      const line = reach?.line(s) ?? [];
      expect(line.length).toBe(reach?.distance(s));
      let at = s;
      for (const m of line) at = poured(at, m);
      expect(status(at)).toBe("solved");
    }
  });
});

describe("Ball Sort's input", () => {
  const s = newState(decodeParams("2h2e1"), "ab,ba,");
  const ds = newDrawState(s, 40);
  const at = (t: number) => tubeCenter(s, 40, t);
  const tap = (ui: ReturnType<typeof newUi>, t: number) => {
    G.interpretMove(s, ui, ds, at(t), LEFT_BUTTON);
    return G.interpretMove(s, ui, ds, at(t), LEFT_RELEASE);
  };

  it("pours with a tap on one tube and then another", () => {
    const ui = newUi(s);
    expect(tap(ui, 0)).toBe(UI_UPDATE);
    expect(ui.held).toBe(0);
    expect(tap(ui, 2)).toEqual({ type: "pour", from: 0, to: 2 });
  });

  it("lifts the run as the finger goes down, with nothing picked up, and keeps it up on the release", () => {
    const ui = newUi(s);
    expect(G.interpretMove(s, ui, ds, at(0), LEFT_BUTTON)).toBe(UI_UPDATE);
    expect(ui.held).toBe(0);
    G.interpretMove(s, ui, ds, at(0), LEFT_RELEASE);
    expect(ui.held).toBe(0);
    // With a run up, a press decides nothing until its release.
    G.interpretMove(s, ui, ds, at(1), LEFT_BUTTON);
    expect(ui.held).toBe(0);
  });

  it("puts the run down with a second tap on its tube, and picks another up where it cannot pour", () => {
    const ui = newUi(s);
    tap(ui, 0);
    expect(tap(ui, 0)).toBe(UI_UPDATE);
    expect(ui.held).toBeNull();
    tap(ui, 0);
    expect(tap(ui, 1)).toBe(UI_UPDATE);
    expect(ui.held).toBe(1);
  });

  it("pours with a drag from one tube to another", () => {
    const ui = newUi(s);
    G.interpretMove(s, ui, ds, at(1), LEFT_BUTTON);
    G.interpretMove(s, ui, ds, at(2), LEFT_DRAG);
    expect(ui.drag?.moved).toBe(true);
    expect(G.interpretMove(s, ui, ds, at(2), LEFT_RELEASE)).toEqual({
      type: "pour",
      from: 1,
      to: 2,
    });
  });

  it("pours from the keyboard: select, move, select", () => {
    const ui = newUi(s);
    expect(G.interpretMove(s, ui, ds, { x: 0, y: 0 }, CURSOR_SELECT)).toBe(UI_UPDATE);
    expect(ui.cursor.visible).toBe(true);
    G.interpretMove(s, ui, ds, { x: 0, y: 0 }, CURSOR_SELECT);
    expect(ui.held).toBe(0);
    G.interpretMove(s, ui, ds, { x: 0, y: 0 }, CURSOR_RIGHT);
    G.interpretMove(s, ui, ds, { x: 0, y: 0 }, CURSOR_RIGHT);
    expect(G.interpretMove(s, ui, ds, { x: 0, y: 0 }, CURSOR_SELECT)).toEqual({
      type: "pour",
      from: 0,
      to: 2,
    });
  });
});

describe("Ball Sort's Solve", () => {
  it("shows the sorted board a shortest line ends on", () => {
    const p = decodeParams("4h4e2");
    const s = newState(p, G.newDesc(p, randomNew("solve")).desc);
    const r = G.solve(s, s);
    if (!r?.ok) throw new Error("no solve");
    expect(status(G.executeMove(s, r.move))).toBe("solved");
  });
});
