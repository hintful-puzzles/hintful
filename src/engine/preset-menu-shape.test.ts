/**
 * The shape every game's preset menu has (`docs/mechanics.md` § "The
 * preset menu is a grid"), read off the menu itself, so it holds for a game
 * that calls `presetGrid` and for one that writes its list out.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { difficultyChoiceItem, withTier } from "./difficulty.ts";
import type { Game, ParamConfigItem } from "./game.ts";
import { presetMenu, type TitledPresetMenu } from "./param-label.ts";
import { paramsError } from "./params.ts";
import { MENU_LINES, MENU_SECTION_LINES } from "./preset-grid.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { rulesetField } from "./ruleset.ts";
import { leafPresets, rectangleShortfall, takesRectangles } from "./testing/presets.ts";
import { itOverWholeSweep } from "./testing/slow.ts";

beforeAll(registerAllGames);
registerAllGames();

type AnyGame = Game<unknown, unknown, unknown>;
type Item = ParamConfigItem<unknown>;
const ids = registeredGameIds();
const game = (id: string): AnyGame => {
  const g = getTsGame(id);
  if (!g) throw new Error(`${id} is not registered`);
  return g as AnyGame;
};

/** Each heading's own lines, the menu's top level among them. */
function sections(menu: TitledPresetMenu<unknown>): TitledPresetMenu<unknown>[][] {
  const subs = menu.submenu ?? [];
  const lines = subs.filter((m) => !m.submenu);
  return [lines, ...subs.filter((m) => m.submenu).flatMap(sections)].filter(
    (s) => s.length > 0,
  );
}

/** A choices field that is neither the tier nor the ruleset: a kind of board. */
function kindItems(g: AnyGame): Item[] {
  const tier = difficultyChoiceItem(g);
  const ruleset = rulesetField(g);
  return (g.paramConfig ?? []).filter(
    (i) => i.type === "choices" && i.kw !== tier?.kw && i.kw !== ruleset?.kw,
  );
}

/**
 * Tiers a game's menu leaves out, with why. A tier every board of the menu
 * refuses needs no entry: the check finds that by asking `paramsError`. A
 * ruleset that offers fewer tiers than another needs none either, since
 * rulesets can be very different puzzles (the owner, 2026-10-31).
 */
const TIERS_NOT_OFFERED: Record<string, Record<string, string>> = {
  path: {
    Unreasonable:
      "the menu is as long as a menu may be with the three tiers the ladder deals; the tier came so that boards dealt before 2026-10-28 still open",
  },
  group: {
    Hard: "the menu's 6x6 and 8x8 refuse it with the identity shown, and a 12x12 takes eleven seconds",
  },
};

describe("a section of a menu is short enough to read", () => {
  it.each(ids)("%s", (id) => {
    const g = game(id);
    for (const lines of sections(presetMenu(g))) {
      // A section with one line for each kind of board is as long as the
      // kinds are many: Loopy's tilings, Cube's solids.
      const listsKinds = kindItems(g).some(
        (i) => new Set(lines.map((m) => i.get(m.params))).size === lines.length,
      );
      if (listsKinds) continue;
      expect(
        lines.length,
        `${id}: ${lines.length} lines under one heading, from "${lines[0]?.title}"`,
      ).toBeLessThanOrEqual(MENU_SECTION_LINES);
    }
  });
});

describe("a whole menu is short enough to choose from", () => {
  it.each(ids)("%s", (id) => {
    expect(leafPresets(game(id)).length).toBeLessThanOrEqual(MENU_LINES);
  });
});

describe("a tiered game's menu is a grid", () => {
  const tiered = ids.filter((id) => difficultyChoiceItem(game(id)) !== null);

  it.each(tiered)("%s: a board's tiers are one run of lines, easiest first", (id) => {
    const g = game(id);
    const tier = difficultyChoiceItem(g);
    if (tier === null) throw new Error("unreachable");
    const ruleset = rulesetField(g);
    const leaves = leafPresets(g);
    const rulesetOf = (params: unknown): number => (ruleset ? ruleset.get(params) : 0);
    // A ruleset's tiers are its own: the run is of the tiers its lines offer,
    // so one that has no use for a tier leaves it out of every board's run.
    const offered = new Map<number, number[]>();
    for (const leaf of leaves) {
      const r = rulesetOf(leaf.params);
      const held = offered.get(r) ?? [];
      const t = tier.get(leaf.params);
      if (!held.includes(t)) held.push(t);
      offered.set(r, held);
    }
    // Each board with the line it starts on, the tiers it is offered at, and
    // the tiers its ruleset offers, easiest first.
    const rows = new Map<string, { from: number; tiers: number[]; ladder: number[] }>();
    leaves.forEach((leaf, line) => {
      const key = g.encodeParams(withTier(g, leaf.params, 0), true);
      const ladder = (offered.get(rulesetOf(leaf.params)) ?? []).toSorted(
        (a, b) => a - b,
      );
      const row = rows.get(key) ?? { from: line, tiers: [], ladder };
      rows.set(key, row);
      // A board met again after another board's lines is out of its run.
      expect(line, `${id}: "${leaf.title}" is apart from its board`).toBe(
        row.from + row.tiers.length,
      );
      row.tiers.push(tier.get(leaf.params));
    });
    for (const [key, { tiers, ladder }] of rows) {
      const from = ladder.indexOf(tiers[0] ?? 0);
      const run = ladder.slice(from, from + tiers.length);
      expect(
        tiers,
        `${id}: ${key} is offered at ${tiers.map((t) => tier.choices[t]).join(", ")}`,
      ).toEqual(run);
    }
  });

  it.each(tiered)("%s: every tier is on the menu", (id) => {
    const g = game(id);
    const tier = difficultyChoiceItem(g);
    if (tier === null) throw new Error("unreachable");
    const leaves = leafPresets(g);
    const held = new Set(leaves.map((l) => tier.get(l.params)));
    const missing = tier.choices.filter(
      (_, t) =>
        !held.has(t) &&
        leaves.some((l) => paramsError(g, withTier(g, l.params, t), true) === null),
    );
    expect(missing.sort()).toEqual(Object.keys(TIERS_NOT_OFFERED[id] ?? {}).sort());
  });

  it("looked at the tiered games", () => {
    expect(tiered.length).toBeGreaterThan(20);
    for (const id of Object.keys(TIERS_NOT_OFFERED)) expect(tiered).toContain(id);
  });
});

describe("a rule modifier has one line of the menu", () => {
  let modifiers = 0;

  it.each(ids)("%s", (id) => {
    const g = game(id);
    const leaves = leafPresets(g);
    for (const item of g.paramConfig ?? []) {
      // A choice modifier bounds its rule at every value, so no value of it is
      // the plain game and none is owed a line.
      if (item.type !== "boolean" || item.modifier?.when === undefined) continue;
      modifiers++;
      const { when, words } = item.modifier;
      const lines = leaves.filter((l) => item.get(l.params) === when);
      expect(
        lines.map((l) => l.title),
        `${id}: "${words}" is on ${lines.length} lines`,
      ).toHaveLength(1);
    }
  });

  // A floor over every game: a commit the hook narrows to a few games looks
  // at a few games' modifiers.
  itOverWholeSweep("looked at the modifiers", () => {
    expect(modifiers).toBeGreaterThan(6);
  });
});

describe("a game that takes rectangles offers them", () => {
  it.each(ids)("%s", (id) => {
    expect(rectangleShortfall(game(id)), id).toBeNull();
  });

  // The population is read off each game's dimension pair, so a renamed field
  // would empty it without a sound.
  it("looked at the games that take rectangles", () => {
    expect(ids.filter((id) => takesRectangles(game(id))).length).toBeGreaterThan(30);
  });
});

describe("a game with a size offers at least three boards", () => {
  it.each(ids)("%s", (id) => {
    const g = game(id);
    const sized = (g.paramConfig ?? []).some((i) => i.label?.slot === "size");
    if (!sized) return;
    expect(leafPresets(g).length, id).toBeGreaterThanOrEqual(3);
  });

  it("looked at the collection", () => {
    expect(ids.length).toBeGreaterThan(50);
  });
});
