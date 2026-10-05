/**
 * What every game's `paramConfig` owes, now that the Custom dialog, the preset
 * titles, the type header, the bounds check and the help's Parameters section
 * are all built from it (`declare-params-in-one-place`).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { difficultyChoiceItem, difficultyTiers, withTier } from "./difficulty.ts";
import type { Game, PresetMenu } from "./game.ts";
import { describeParams, presetMenu, type TitledPresetMenu } from "./param-label.ts";
import { paramsError } from "./params.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { itOverWholeSweep } from "./testing/slow.ts";

beforeAll(registerAllGames);
registerAllGames();

type AnyGame = Game<unknown, unknown, unknown>;
const ids = registeredGameIds();
const game = (id: string): AnyGame => {
  const g = getTsGame(id);
  if (!g) throw new Error(`${id} is not registered`);
  return g as AnyGame;
};

/** Each leaf preset, with its declared name if it has one. */
function leaves(menu: PresetMenu<unknown>): { name: string | null; params: unknown }[] {
  if (menu.submenu) return menu.submenu.flatMap(leaves);
  return [{ name: menu.title ?? null, params: menu.params }];
}

function labels(menu: TitledPresetMenu<unknown>): string[] {
  return menu.submenu ? menu.submenu.flatMap(labels) : [menu.label ?? ""];
}

/** Each section's lines, as the menu shows them. */
function sections(menu: TitledPresetMenu<unknown>): string[][] {
  const subs = menu.submenu ?? [];
  const lines = subs.filter((m) => !m.submenu).map((m) => m.title);
  return [lines, ...subs.filter((m) => m.submenu).flatMap(sections)];
}

describe("every paramConfig item says what it means", () => {
  it.each(
    ids,
  )("%s: a doc on every item, and a shared doc follows its partner", (id) => {
    const config = game(id).paramConfig ?? [];
    config.forEach((item, i) => {
      if (typeof item.doc === "string") {
        expect(item.doc.trim(), `${id}: ${item.kw} has an empty doc`).not.toBe("");
      } else {
        expect(config[i - 1]?.kw, `${id}: ${item.kw} shares a doc`).toBe(item.doc.with);
      }
    });
  });

  // The help's "names every mode" guard, moved from the page to the field: a
  // choice that is a word is a mode the player picks, and the doc beside it is
  // where the page says what it is (Unequal's Adjacent went unexplained).
  it.each(ids)("%s: a choices field's doc names each word choice", (id) => {
    const g = game(id);
    const tiers = difficultyChoiceItem(g);
    for (const item of g.paramConfig ?? []) {
      if (item.type !== "choices" || item === tiers || typeof item.doc !== "string")
        continue;
      const doc = item.doc.toLowerCase();
      const missing = item.choices.filter(
        (c) => /[a-z]/i.test(c) && !doc.includes(c.toLowerCase()),
      );
      expect(missing, `${id}: ${item.kw}'s doc never names`).toEqual([]);
    }
  });

  it.each(ids)("%s: bounds are a range, and the defaults are inside them", (id) => {
    const g = game(id);
    for (const item of g.paramConfig ?? []) {
      if (item.type !== "string" || !item.bounds) continue;
      const { min, max } = item.bounds;
      if (min !== undefined && max !== undefined) expect(min).toBeLessThanOrEqual(max);
    }
    expect(paramsError(g, g.defaultParams(), true), `${id}: default params`).toBeNull();
  });

  it.each(ids)("%s: the difficulty item is the engine's", (id) => {
    const item = difficultyChoiceItem(game(id));
    if (item === null) return;
    expect(item.label?.slot).toBe("tier");
    expect(item.name).toBe("Difficulty");
  });
});

describe("one describer labels every params set", () => {
  let labeled = 0;

  it.each(ids)("%s: every preset is valid and has a label of its own", (id) => {
    const g = game(id);
    const menu = presetMenu(g);
    const all = labels(menu);
    for (const title of [...all, ...sections(menu).flat()]) {
      expect(title, `${id}: an empty label`).not.toBe("");
      expect(/NaN|undefined|null/.test(title), `${id}: "${title}"`).toBe(false);
    }
    const seen = new Set<string>();
    for (const title of all) {
      expect(seen.has(title), `${id}: two presets are both "${title}"`).toBe(false);
      seen.add(title);
    }
    // A line may be shorter than its label, never so short that two lines
    // under one heading read the same.
    for (const lines of sections(menu))
      expect(new Set(lines).size, `${id}: ${lines.join(" | ")}`).toBe(lines.length);
    for (const leaf of leaves(g.presets())) {
      labeled++;
      expect(paramsError(g, leaf.params, true), `${id}: preset refused`).toBeNull();
      // A name is for what no field says; one that repeats the label is a
      // second copy of it.
      if (leaf.name !== null)
        expect(leaf.name, `${id}: a named preset its label already says`).not.toBe(
          describeParams(g, leaf.params),
        );
    }
  });

  it.each(ids)("%s: a tiered game's label names the tier", (id) => {
    const g = game(id);
    const tiers = difficultyTiers(g);
    if (tiers === null) return;
    tiers.forEach((tier, i) => {
      const label = describeParams(g, withTier(g, g.defaultParams(), i));
      expect(label.split(/[ ,:]+/), `${id}: "${label}"`).toContain(tier);
    });
  });

  it("looked at the collection", () => {
    expect(ids.length).toBeGreaterThan(50);
  });

  // A floor over every game's presets: a commit the hook narrows to a few
  // games labels a few games' worth.
  itOverWholeSweep("labeled the collection's presets", () => {
    expect(labeled).toBeGreaterThan(400);
  });
});
