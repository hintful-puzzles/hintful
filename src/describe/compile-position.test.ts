import { describe, expect, it } from "vitest";
import { CompileError } from "./compile.ts";
import { compilePlanning } from "./compile-position.ts";
import type { MoveJson, PlanningJson } from "./description.ts";

/** A one-layer game on any grid, its one move `move`. */
const game = (
  move: MoveJson,
  finish = "forall c in cells: value(c) = 0",
): PlanningJson => ({
  game: "toy",
  name: "Toy",
  family: "test",
  sizes: { w: { min: 2, max: 4 }, h: { min: 2, max: 4 } },
  space: { grid: { w: "w", h: "h" }, units: [] },
  position: { value: { domain: "range(0, 1)" } },
  freedom: { kind: "transition" },
  moves: { flip: move },
  finish: [finish],
});

const compile = (d: PlanningJson): string =>
  compilePlanning(d, "toy", "./runtime.ts", "./position.ts");

describe("the position compiler refuses an ill-formed move", () => {
  it.each([
    [
      "a binding that is a set",
      { for: "L in lines, S = cells(L)", set: [{ for: "c in S", value: "0" }] },
    ],
    [
      "a layer it does not have",
      { for: "c in cells", set: [{ for: "d = c", shade: "0" }] },
    ],
    [
      "an assignment to no cell",
      { for: "L in lines", set: [{ for: "M = L", value: "0" }] },
    ],
    [
      "a mark read in place of a layer",
      { for: "c in cells where known(c)", set: [{ for: "d = c", value: "1" }] },
    ],
  ])("%s", (_, move) => {
    expect(() => compile(game(move as MoveJson))).toThrow(CompileError);
  });

  it("and a finish that is no truth", () => {
    expect(() =>
      compile(
        game({ for: "c in cells", set: [{ for: "d = c", value: "1" }] }, "|cells|"),
      ),
    ).toThrow(CompileError);
  });

  it.each([
    ["under a negation", "value(c) = 1 or not r(c)"],
    ["on the left of implies", "r(c) implies value(c) = 1"],
    ["inside an aggregate", "value(c) = 1 or count(d in adj4(c) where r(d)) > 1"],
    [
      "in a forall's where",
      "value(c) = 1 or forall d in adj4(c) where r(d): value(d) = 1",
    ],
    ["compared with =", "value(c) = 1 or r(c) = false"],
  ])("and a definition that reads itself %s", (_, body) => {
    const d = game({ for: "c in cells", set: [{ for: "d = c", value: "1" }] });
    expect(() =>
      compile({ ...d, define: { "r(c)": body }, finish: ["forall c in cells: r(c)"] }),
    ).toThrow(/r reads itself/);
  });

  it("and a carried layer read by a rule", () => {
    const d = game({
      for: "c in cells where tag(c) = 0",
      set: [{ for: "d = c", tag: "tag(c)" }],
    });
    const carried = {
      ...d,
      position: {
        ...d.position,
        tag: { domain: "range(0, 3)", carried: true as const },
      },
    };
    expect(() => compile(carried)).toThrow(/tag is carried/);
    // Read only in its own assignment, it compiles.
    expect(
      compile({
        ...carried,
        moves: { flip: { for: "c in cells", set: [{ for: "d = c", tag: "tag(c)" }] } },
      }),
    ).toContain("q.tag[v_d] = p.tag[v_c];");
  });

  it("and the geometry on a board of cells alone", () => {
    const d = game({ for: "c in cells", set: [{ for: "d in adj4(c)", value: "1" }] });
    expect(() => compile({ ...d, space: { cells: "w", units: [] } })).toThrow(
      /adj4: the board is cells alone/,
    );
  });

  it("and a face layer assigned at a cell, or read at one", () => {
    const d = game({ for: "c in cells", set: [{ for: "d = c", paint: "1" }] });
    const faced: PlanningJson = {
      ...d,
      sizes: { ...d.sizes, n: { min: 4, max: 4 } },
      space: { ...d.space, faces: "n" },
      position: { ...d.position, paint: { domain: "{0, 1}", over: "faces" } },
    };
    expect(() => compile(faced)).toThrow(/not a face/);
    const fine: PlanningJson = {
      ...faced,
      moves: { flip: { for: "f in faces", set: [{ for: "g = f", paint: "1" }] } },
    };
    expect(() =>
      compile({ ...fine, finish: ["forall c in cells: paint(c) = 0"] }),
    ).toThrow(/expected a face/);
    expect(compile(fine)).toContain("facesOf(cl.n)");
  });

  it("compiles a well-formed one", () => {
    expect(
      compile(
        game({
          for: "c in cells where value(c) = 0",
          set: [{ for: "d in adj4(c)", value: "1 - value(d)" }],
        }),
      ),
    ).toContain("export function rules(");
  });
});
