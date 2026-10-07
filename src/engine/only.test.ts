/*
 * What a ruleset offers (`Ruleset.only`) and what a modifier leaves
 * (`modifierItem`'s `only`) are declared once, and the dialog, the refusal and
 * the help are built from it.
 *
 * The first half reads small configs of its own. The second holds every game
 * that declares an `only` to the claim the declaration exists for: **the
 * Custom dialog cannot submit what the refusal would refuse**. Its population
 * is every game whose `getCustomParamsConfig` carries a narrowing, so a game
 * joins by declaring one.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { offeredOf, offeredValues } from "./config-narrowing.ts";
import { difficultyItem, tierNames } from "./difficulty.ts";
import type { Game, ParamConfigItem } from "./game.ts";
import { Midend } from "./midend.ts";
import { modifierItem } from "./modifier.ts";
import { configNarrowing, onlyError, onlySentences } from "./only.ts";
import { parametersMarkdown } from "./param-help.ts";
import { paramsError } from "./params.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { type Ruleset, rulesetItem } from "./ruleset.ts";
import { leafPresets } from "./testing/presets.ts";
import type { ConfigDescription, ConfigItem, ConfigValues } from "./types.ts";

beforeAll(registerAllGames);
registerAllGames();

interface P {
  mode: number;
  diff: number;
  kind: number;
  mirror: boolean;
}

const FANCY: Ruleset = {
  name: "Fancy",
  rule: "corners count twice.",
  only: { difficulty: [1, 2], kind: [0], mirror: false },
};

function configOf(fancy: Ruleset): ParamConfigItem<P>[] {
  return [
    rulesetItem<P>([{ name: "Plain", rule: "nothing is added." }, fancy], "mode"),
    difficultyItem<P>(tierNames(3), "diff"),
    {
      kw: "kind",
      name: "Grid type",
      type: "choices",
      choices: ["Square", "Hexagon"],
      doc: "The grid.",
      get: (p) => p.kind,
      set: (p, v) => {
        p.kind = v;
      },
    },
    {
      kw: "mirror",
      name: "Mirrored clues",
      type: "boolean",
      doc: "Whether the clues mirror.",
      label: { slot: "tail", words: (p) => (p.mirror ? "mirrored" : null) },
      get: (p) => p.mirror,
      set: (p, v) => {
        p.mirror = v;
      },
    },
  ];
}

const config = configOf(FANCY);
const game = { paramConfig: config };
const fancy: P = { mode: 1, diff: 1, kind: 0, mirror: false };

describe("a params set is refused what its ruleset does not offer", () => {
  it("passes what the ruleset offers, and anything in a ruleset with no `only`", () => {
    expect(paramsError(game, fancy, true)).toBeNull();
    expect(
      paramsError(game, { mode: 0, diff: 0, kind: 1, mirror: true }, true),
    ).toBeNull();
  });

  it.each([
    [{ diff: 0 }, "Difficulty must be Normal or Tricky for Fancy."],
    [{ kind: 1 }, "Grid type must be Square for Fancy."],
    [{ mirror: true }, "Mirrored clues must be off for Fancy."],
  ])("names the field and what it must be: %o", (change, sentence) => {
    expect(paramsError(game, { ...fancy, ...change }, true)).toBe(sentence);
  });

  it("holds a deal to it, and not a board that arrives written out", () => {
    expect(paramsError(game, { ...fancy, diff: 0 }, false)).toBeNull();
  });

  it("reads a dialog's values through the same check", () => {
    const values: ConfigValues = { ruleset: 1, difficulty: 1, kind: 1, mirror: false };
    expect(onlyError(config, (item) => values[item.kw] ?? 0)).toBe(
      "Grid type must be Square for Fancy.",
    );
  });
});

describe("a declaration that names what the game does not have throws", () => {
  it.each([
    [{ nothing: [0] }, /no other field/],
    [{ ruleset: [0] }, /no other field/],
    [{ kind: false }, /not a checkbox/],
    [{ mirror: [0] }, /has no choices/],
    [{ kind: [2] }, /choices it does not have/],
    [{ kind: [] }, /choices it does not have/],
  ])("%o", (only, why) => {
    const bad = configOf({ ...FANCY, only });
    expect(() => paramsError({ paramConfig: bad }, fancy, true)).toThrow(why);
    expect(() => configNarrowing(bad)).toThrow(why);
    expect(() => parametersMarkdown(bad)).toThrow(why);
  });
});

describe("the help says what a ruleset offers of a field, in that field's entry", () => {
  it("writes a sentence for a narrowed choice and for a checkbox", () => {
    expect(onlySentences(config, "difficulty")).toEqual([
      "Fancy offers only Normal and Tricky.",
    ]);
    expect(onlySentences(config, "mirror")).toEqual(["Fancy always has it off."]);
    expect(onlySentences(config, "ruleset")).toEqual([]);
  });

  it("puts it after the field's own words", () => {
    expect(parametersMarkdown(config)).toContain(
      "<dd>The grid. Fancy offers only Square.</dd>",
    );
  });
});

describe("a form shows and submits a narrowed field at a value it is offered", () => {
  const narrowing = configNarrowing(config);
  const form: ConfigDescription = {
    items: Object.fromEntries(
      config.map((i): [string, ConfigItem] => [
        i.kw,
        i.type === "choices"
          ? { type: "choices", name: i.name, choicenames: i.choices }
          : { type: "boolean", name: i.name },
      ]),
    ),
    narrowing,
  };

  it("carries each ruleset's `only`, and nothing for a game that has none", () => {
    expect(narrowing).toEqual([
      {
        by: "ruleset",
        only: [{}, { difficulty: [1, 2], kind: [0], mirror: false }],
      },
    ]);
    expect(configNarrowing(configOf({ ...FANCY, only: undefined }))).toEqual([]);
  });

  it("offers a field whole until its ruleset is chosen", () => {
    expect(offeredOf(form, { ruleset: 0 }, "kind")).toBeNull();
    expect(offeredOf(form, { ruleset: 1 }, "kind")).toEqual([0]);
    expect(offeredOf(form, { ruleset: 1 }, "mirror")).toBe(false);
    expect(offeredOf(form, { ruleset: 1 }, "ruleset")).toBeNull();
  });

  it("moves a choice to the nearest one offered, and a checkbox to its value", () => {
    const chosen = { ruleset: 1, difficulty: 0, kind: 1, mirror: true };
    expect(offeredValues(form, chosen)).toEqual({
      ruleset: 1,
      difficulty: 1,
      kind: 0,
      mirror: false,
    });
    expect(offeredValues(form, { ...chosen, ruleset: 0 })).toEqual({
      ...chosen,
      ruleset: 0,
    });
  });
});

interface M {
  diff: number;
  shown: boolean;
  max: number;
  mirror: boolean;
}

/** A checkbox whose rule applies when off, and a choice, each leaving out a
 * tier: `shown` off has no Easy, and `max` at 1 has no Tricky. */
function modifierConfig(
  maxOnly: Record<number, Record<string, number[] | boolean>> = {
    0: { difficulty: [0, 1] },
  },
): ParamConfigItem<M>[] {
  return [
    difficultyItem<M>(tierNames(3), "diff"),
    modifierItem<M>({
      kw: "shown",
      name: "Show corners",
      type: "boolean",
      when: false,
      words: "corners hidden",
      slot: "tail",
      rule: "the corners are yours to find.",
      only: { difficulty: [1, 2] },
      get: (p) => p.shown,
      set: (p, v) => {
        p.shown = v;
      },
    }),
    modifierItem<M>({
      kw: "max",
      name: "Most lines",
      type: "choices",
      choices: ["1", "2"],
      words: "most lines",
      rule: "at most two lines join a pair.",
      label: { slot: "tail", words: (p) => (p.max === 1 ? null : "one line") },
      only: maxOnly,
      get: (p) => p.max,
      set: (p, v) => {
        p.max = v;
      },
    }),
    {
      kw: "mirror",
      name: "Mirrored clues",
      type: "boolean",
      doc: "Whether the clues mirror.",
      label: { slot: "tail", words: (p) => (p.mirror ? "mirrored" : null) },
      get: (p) => p.mirror,
      set: (p, v) => {
        p.mirror = v;
      },
    },
  ];
}

describe("a modifier says what it leaves, as a ruleset says what it offers", () => {
  const modifiers = modifierConfig();
  const plain: M = { diff: 1, shown: true, max: 1, mirror: false };
  const error = (change: Partial<M>, full = true) =>
    paramsError({ paramConfig: modifiers }, { ...plain, ...change }, full);

  it("refuses a deal the tier a modifier leaves out, naming the field and its value", () => {
    expect(error({})).toBeNull();
    expect(error({ diff: 0 })).toBeNull();
    expect(error({ shown: false, diff: 0 })).toBe(
      "Difficulty must be Normal or Tricky while Show corners is off.",
    );
    expect(error({ max: 0, diff: 2 })).toBe(
      "Difficulty must be Easy or Normal while Most lines is 1.",
    );
    expect(error({ shown: false, diff: 0 }, false)).toBeNull();
  });

  it("carries a checkbox as a deciding field, off then on", () => {
    expect(configNarrowing(modifiers)).toEqual([
      { by: "shown", only: [{ difficulty: [1, 2] }, {}] },
      { by: "max", only: [{ difficulty: [0, 1] }, {}] },
    ]);
  });

  it("leaves of a field what both deciding fields do", () => {
    const form: ConfigDescription = {
      items: {
        difficulty: { type: "choices", name: "Difficulty", choicenames: tierNames(3) },
      },
      narrowing: configNarrowing(modifiers),
    };
    const at = (shown: boolean, max: number) =>
      offeredOf(form, { shown, max }, "difficulty");
    expect(at(true, 1)).toBeNull();
    expect(at(false, 1)).toEqual([1, 2]);
    expect(at(true, 0)).toEqual([0, 1]);
    expect(at(false, 0)).toEqual([1]);
    expect(offeredValues(form, { shown: false, max: 0, difficulty: 2 })).toEqual({
      shown: false,
      max: 0,
      difficulty: 1,
    });
  });

  it("says it in the narrowed field's help entry", () => {
    expect(onlySentences(modifiers, "difficulty")).toEqual([
      "While Show corners is off, only Normal and Tricky are offered.",
      "While Most lines is 1, only Easy and Normal are offered.",
    ]);
    expect(
      onlySentences(modifierConfig({ 0: { difficulty: [1] } }), "difficulty"),
    ).toContain("While Most lines is 1, only Normal is offered.");
    expect(onlySentences(modifierConfig({ 1: { mirror: true } }), "mirror")).toEqual([
      "While Most lines is 2, it is always on.",
    ]);
  });

  it.each([
    [{ 2: { difficulty: [0] } }, /choice 2 leaves, and has none/],
    [{ 0: { max: [1] } }, /no other field/],
    [{ 0: { shown: true } }, /narrows fields itself/],
    [{ 0: { difficulty: [0] } }, /leave nothing of "difficulty" between them/],
  ])("throws on a declaration no form could show: %o", (only, why) => {
    expect(() => configNarrowing(modifierConfig(only))).toThrow(why);
    expect(() =>
      paramsError({ paramConfig: modifierConfig(only) }, plain, true),
    ).toThrow(why);
  });
});

type AnyGame = Game<unknown, unknown, unknown>;

/** Every game whose dialog narrows a field. */
const narrowing = registeredGameIds().flatMap((id) => {
  const g = getTsGame(id) as AnyGame | null;
  if (!g) throw new Error(`${id} is not registered`);
  const form = new Midend(g).getCustomParamsConfig();
  return form.narrowing ? [{ id, g, form }] : [];
});

/** Every assignment of the values in `axes`, one field at a time. */
function assignments(axes: [string, (number | boolean)[]][]): ConfigValues[] {
  return axes.reduce<ConfigValues[]>(
    (rows, [id, values]) =>
      rows.flatMap((row) => values.map((v) => ({ ...row, [id]: v }))),
    [{}],
  );
}

describe("the Custom dialog cannot submit what an `only` refusal would refuse", () => {
  it("has a game to hold", () => {
    expect(narrowing.map((n) => n.id)).toEqual(
      expect.arrayContaining(["ascent", "bridges", "group"]),
    );
  });

  it.each(narrowing)("$id", ({ g, form }) => {
    const config = g.paramConfig ?? [];
    // The deciding fields and every field one of them narrows, at every value
    // a form control can hold.
    const ids = new Set(
      (form.narrowing ?? []).flatMap((n) => [n.by, ...n.only.flatMap(Object.keys)]),
    );
    const axes = [...ids].map((id): [string, (number | boolean)[]] => {
      const item = form.items[id];
      if (item?.type === "choices") return [id, item.choicenames.map((_, i) => i)];
      if (item?.type === "boolean") return [id, [false, true]];
      throw new Error(`${id} is not a field a form narrows`);
    });

    /** Every sentence an `only` refusal says of this game. */
    const refusals = new Set<string>();
    /** What the engine answered a form's submission with, where it refused. */
    const answers = new Set<string>();
    let submitted = 0;
    for (const { params } of leafPresets(g)) {
      const midend = new Midend(g);
      expect(midend.setParams(g.encodeParams(params, true))).toBeNull();
      const dealt = midend.getCustomParams();
      for (const change of assignments(axes)) {
        const chosen = { ...dealt, ...change };
        const refusal = onlyError(config, (item) => chosen[item.kw] ?? 0);
        if (refusal !== null) {
          refusals.add(refusal);
          // The engine does refuse it: the form is what keeps it away.
          expect(midend.encodeCustomParams(chosen)).toEqual({
            ok: false,
            error: refusal,
          });
        }
        const result = midend.encodeCustomParams(offeredValues(form, chosen));
        if (!result.ok) answers.add(result.error);
        submitted++;
      }
    }
    // A sweep that met nothing to refuse would pass with the form doing
    // nothing at all.
    expect(refusals.size).toBeGreaterThan(0);
    expect(submitted).toBeGreaterThan(0);
    // What the engine still refuses is the game's own to say, about a size or
    // a tier: never a field at a value another field does not leave of it.
    expect([...answers].filter((a) => refusals.has(a))).toEqual([]);
  });
});
