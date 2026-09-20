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
import { axisSlice, presetAxes } from "./hint-games.ts";

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
