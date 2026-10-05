/**
 * The **rule** behind the per-commit preset slice, against a hand-written menu.
 *
 * `hint-enrollment.test.ts` asserts the slice over the real collection, which is
 * what catches a game slipping out of it — but it can only see the shapes the
 * collection happens to offer today, and it cannot fail on a case no game has
 * yet. Every game's scalar params are numeric, for instance, so the branch that
 * treats a non-numeric `"string"` item as a selection is unreachable there and
 * would stay green however it behaved.
 *
 * So the split that does the work — a `"string"` item is a dimension and gets
 * its ends, a `"boolean"` / `"choices"` item is a closed set and gets every
 * value — is pinned here, where the menu can be written to order.
 */
import { describe, expect, it } from "vitest";
import type { ParamConfigItem } from "../game.ts";
import { axisSlice, dealtBoards, presetAxes, unofferedValues } from "./presets.ts";

interface P {
  size: number;
  mode: number;
  extra: boolean;
  /** Constant across every menu below: a field a player cannot move from the
   * presets menu is not an axis. */
  fixed: number;
  /** Non-numeric free text, which no game in the collection has. */
  name: string;
}

const item = <K extends keyof P>(
  kw: string,
  type: ParamConfigItem<P>["type"],
  key: K,
): ParamConfigItem<P> =>
  ({
    kw,
    name: kw,
    type,
    doc: kw,
    choices: ["a", "b", "c"],
    get: (p: P) => p[key],
    set: () => {},
  }) as ParamConfigItem<P>;

const CONFIG: ParamConfigItem<P>[] = [
  item("size", "string", "size"),
  item("mode", "choices", "mode"),
  item("extra", "boolean", "extra"),
  item("fixed", "string", "fixed"),
];

const game = { paramConfig: CONFIG };

/** A preset, defaulting everything the case under test is not about. */
const p = (title: string, o: Partial<P>): { title: string; params: P } => ({
  title,
  params: { size: 1, mode: 0, extra: false, fixed: 7, name: "x", ...o },
});

const titles = (menu: { title: string; params: P }[]): string[] =>
  axisSlice(game, menu).map((e) => e.title);

describe("presetAxes", () => {
  it("ignores a field every preset holds one value at", () => {
    const menu = [p("a", { size: 1 }), p("b", { size: 9 })];
    expect(presetAxes(game, menu).map((a) => a.kw)).toEqual(["size"]);
  });

  it("wants both ends of a numeric scalar and nothing between", () => {
    const menu = [p("a", { size: 1 }), p("b", { size: 5 }), p("c", { size: 9 })];
    const [axis] = presetAxes(game, menu);
    expect([...axis.wanted].sort()).toEqual([1, 9]);
  });

  it("wants every value of a closed set, however many", () => {
    const menu = [p("a", { mode: 0 }), p("b", { mode: 1 }), p("c", { mode: 2 })];
    const [axis] = presetAxes(game, menu);
    expect([...axis.wanted].sort()).toEqual([0, 1, 2]);
  });

  it("treats a non-numeric text field as a selection, not a dimension", () => {
    // Unreachable through any game in the collection today, which is exactly
    // why it is asserted here: ordering values that have no order would pick
    // two of them arbitrarily and drop the rest in silence.
    const named = { paramConfig: [item("name", "string", "name")] };
    const menu = [
      p("a", { name: "red" }),
      p("b", { name: "green" }),
      p("c", { name: "blue" }),
    ];
    const [axis] = presetAxes(named, menu);
    expect([...axis.wanted].sort()).toEqual(["blue", "green", "red"]);
  });
});

describe("axisSlice", () => {
  it("takes the smallest board carrying each mode, not the first of each tier", () => {
    // The shape that motivated the change: a mode's presets sit *after* the
    // plain ones and share their other params, so a slice keyed on anything
    // else de-duplicates them away.
    const menu = [
      p("plain small", { size: 1, mode: 0 }),
      p("plain large", { size: 9, mode: 0 }),
      p("mode small", { size: 1, mode: 1 }),
      p("mode large", { size: 9, mode: 1 }),
    ];
    expect(titles(menu)).toEqual(["plain small", "plain large", "mode small"]);
  });

  it("keeps one preset when the game varies nothing", () => {
    const menu = [p("only", {})];
    expect(titles(menu)).toEqual(["only"]);
  });

  it("keeps the first preset alone when several presets are identical", () => {
    // No axis at all: identical params vary nothing, whatever the titles say.
    const menu = [p("one", {}), p("two", {}), p("three", {})];
    expect(titles(menu)).toEqual(["one"]);
  });

  it("lets one preset settle several axes at once", () => {
    const menu = [
      p("base", { size: 1, mode: 0, extra: false }),
      p("everything else", { size: 9, mode: 1, extra: true }),
    ];
    expect(titles(menu)).toEqual(["base", "everything else"]);
  });

  it("never walks a board for an interior scalar value", () => {
    const menu = [
      p("small", { size: 1 }),
      p("middle", { size: 5 }),
      p("big", { size: 9 }),
    ];
    expect(titles(menu)).toEqual(["small", "big"]);
  });

  it("de-duplicates a value a later preset repeats", () => {
    const menu = [
      p("first true", { extra: true, size: 1 }),
      p("second true", { extra: true, size: 1 }),
      p("false", { extra: false, size: 1 }),
    ];
    expect(titles(menu)).toEqual(["first true", "false"]);
  });
});

describe("unofferedValues", () => {
  /** A game whose `mode` 2 needs a `size` of at least 5, the shape of ABCD's
   * rule that needs five letters. */
  const writable = {
    paramConfig: [
      item("size", "string", "size"),
      {
        kw: "mode",
        name: "Mode",
        type: "choices",
        doc: "mode",
        choices: ["a", "b", "c"],
        get: (q: P) => q.mode,
        set: (q: P, v: number) => {
          q.mode = v;
        },
      },
      {
        kw: "extra",
        name: "Extra",
        type: "boolean",
        doc: "extra",
        get: (q: P) => q.extra,
        set: (q: P, v: boolean) => {
          q.extra = v;
        },
      },
    ] satisfies ParamConfigItem<P>[],
    validateParams: (q: P): string | null =>
      q.mode === 2 && q.size < 5 ? "Mode c needs a size of at least 5." : null,
  };

  const found = (menu: { title: string; params: P }[]) =>
    unofferedValues(writable, menu).map((v) => [v.kw, v.words, v.board?.title ?? null]);

  it("finds nothing when the menu holds every value", () => {
    const menu = [
      p("a off", { mode: 0, extra: false }),
      p("b on", { mode: 1, extra: true }),
      p("c", { mode: 2, size: 9 }),
    ];
    expect(found(menu)).toEqual([]);
  });

  it("writes a value no preset holds onto the first preset, and names it", () => {
    const menu = [p("small", { size: 6, extra: true }), p("big", { size: 9, mode: 1 })];
    expect(found(menu)).toEqual([["mode", "c", "small, Mode: c"]]);
    const [{ board }] = unofferedValues(writable, menu);
    expect(board?.params).toEqual({ ...menu[0].params, mode: 2 });
  });

  it("leaves the preset it wrote onto as it was", () => {
    const menu = [p("only", { size: 6 })];
    unofferedValues(writable, menu);
    expect(menu[0].params).toEqual(p("only", { size: 6 }).params);
  });

  it("passes over a preset that refuses the value for the next that takes it", () => {
    const menu = [
      p("small", { size: 1, mode: 0, extra: true }),
      p("small b", { size: 1, mode: 1 }),
      p("big", { size: 9, mode: 0 }),
    ];
    expect(found(menu)).toEqual([["mode", "c", "big, Mode: c"]]);
  });

  it("reports a value every preset refuses, with no board", () => {
    const menu = [p("small", { size: 1, mode: 0, extra: true }), p("b", { mode: 1 })];
    expect(found(menu)).toEqual([["mode", "c", null]]);
  });

  it("takes a checkbox's other state as a value like any other", () => {
    const menu = [
      p("a", { mode: 0 }),
      p("b", { mode: 1 }),
      p("c", { mode: 2, size: 9 }),
    ];
    expect(found(menu)).toEqual([["extra", "on", "a, Extra: on"]]);
  });
});

describe("dealtBoards", () => {
  it("deals the slice and then the values the menu left out", () => {
    interface Q {
      size: number;
      hard: boolean;
    }
    const game = {
      paramConfig: [
        {
          kw: "size",
          name: "Size",
          type: "string",
          doc: "size",
          get: (q: Q) => String(q.size),
          set: (q: Q, v: string) => {
            q.size = Number(v);
          },
        },
        {
          kw: "hard",
          name: "Hard",
          type: "boolean",
          doc: "hard",
          get: (q: Q) => q.hard,
          set: (q: Q, v: boolean) => {
            q.hard = v;
          },
        },
      ] satisfies ParamConfigItem<Q>[],
      presets: () => ({
        submenu: [1, 5, 9].map((size) => ({
          title: `size ${size}`,
          params: { size, hard: false },
        })),
      }),
    };
    const titles = (opts?: { every: boolean }) =>
      dealtBoards(game, opts).map((e) => e.title);
    expect(titles()).toEqual(["size 1", "size 9", "size 1, Hard: on"]);
    expect(titles({ every: true })).toEqual([
      "size 1",
      "size 5",
      "size 9",
      "size 1, Hard: on",
    ]);
  });
});
