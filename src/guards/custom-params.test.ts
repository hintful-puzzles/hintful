import { describe, expect, it } from "vitest";
import {
  DRAFT_HINT,
  type Game,
  type ParamConfigItem,
  type PresetMenu,
} from "../engine/game.ts";
import { Midend } from "../engine/midend.ts";
import { presetMenu } from "../engine/param-label.ts";
import { SOLUTION_UNKNOWN } from "../engine/solve-failure.ts";
import {
  REGISTERED_GAME_COUNT,
  REGISTERED_GAMES,
} from "../engine/testing/enrollment.ts";

// A tiny game exercising all three `paramConfig` types (string / boolean
// / choices) over a params object, so the midend round-trip can be
// asserted end-to-end without depending on any real game's shape.
interface TParams {
  w: number;
  flag: boolean;
  mode: number;
}
type TState = { done: boolean };
type TMove = "noop";

const paramConfig: ParamConfigItem<TParams>[] = [
  {
    kw: "width",
    name: "Width",
    type: "string",
    doc: "How wide.",
    get: (p) => String(p.w),
    set: (p, v) => {
      p.w = Number.parseInt(v || "0", 10);
    },
  },
  {
    kw: "flag",
    name: "Flag",
    type: "boolean",
    doc: "A flag.",
    get: (p) => p.flag,
    set: (p, v) => {
      p.flag = v;
    },
  },
  {
    kw: "mode",
    name: "Mode",
    type: "choices",
    choices: ["Alpha", "Beta", "Gamma"],
    doc: "Alpha, Beta or Gamma.",
    get: (p) => p.mode,
    set: (p, v) => {
      p.mode = v;
    },
  },
];

function makeGame(
  overrides: Partial<Game<TParams, TState, TMove, null, null>> = {},
): Game<TParams, TState, TMove, null, null> {
  return {
    id: "__cfg__",
    defaultParams: () => ({ w: 5, flag: false, mode: 1 }),
    menu: { boards: [{ w: 5, flag: false, mode: 1 }] },
    encodeParams: (p) => `${p.w}${p.flag ? "f" : ""}m${p.mode}`,
    decodeParams: (s) => {
      const m = /^(\d+)(f?)m(\d+)$/.exec(s);
      if (!m) throw new Error(`bad params "${s}"`);
      return { w: Number(m[1]), flag: m[2] === "f", mode: Number(m[3]) };
    },
    validateParams: (p) => (p.w > 0 ? null : "Width must be at least one"),
    paramConfig,
    newDesc: () => ({ desc: "d" }),
    newState: () => ({ done: false }),
    newUi: () => null,
    interpretMove: () => null,
    executeMove: (s) => s,
    status: () => "ongoing",
    solve: () => ({ ok: false, error: SOLUTION_UNKNOWN }),
    hint: DRAFT_HINT,
    colors: () => [
      [1, 1, 1],
      [0, 0, 0],
    ],
    preferredTileSize: 32,
    computeSize: () => ({ w: 10, h: 10 }),
    // Required on `Game`: a game that draws nothing is not a game. This double
    // genuinely draws nothing, so its DrawState is `null`.
    newDrawState: () => null,
    redraw: () => {},
    ...overrides,
  };
}

describe("Midend custom-params round-trip", () => {
  it("builds a ConfigDescription from paramConfig (one item per field, typed)", () => {
    const m = new Midend(makeGame());
    const cfg = m.getCustomParamsConfig();
    expect(cfg.items["width"]).toEqual({ type: "string", name: "Width" });
    expect(cfg.items["flag"]).toEqual({ type: "boolean", name: "Flag" });
    expect(cfg.items["mode"]).toEqual({
      type: "choices",
      name: "Mode",
      choicenames: ["Alpha", "Beta", "Gamma"],
    });
  });

  it("says a field's max in its label where the field shows it, and names the bare field in a refusal", () => {
    const game = makeGame();
    const [width] = game.paramConfig;
    if (width?.type !== "string") throw new Error("the double's first field is Width");
    const shown = { ...width, bounds: { min: 1, max: 12, maxShown: true } };
    const m = new Midend({
      ...game,
      paramConfig: [shown, ...game.paramConfig.slice(1)],
    });
    expect(m.getCustomParamsConfig().items["width"]).toEqual({
      type: "string",
      name: "Width (up to 12)",
    });
    expect(m.setCustomParams({ ...m.getCustomParams(), width: "13" })).toBe(
      "Width must be at most 12.",
    );
  });

  it("reads the current params as initial values", () => {
    const m = new Midend(makeGame());
    expect(m.getCustomParams()).toEqual({ width: "5", flag: false, mode: 1 });
  });

  it("applies valid submitted values and adopts the new params", () => {
    const m = new Midend(makeGame());
    const err = m.setCustomParams({ width: "12", flag: true, mode: 2 });
    expect(err).toBeNull();
    expect(m.getParams()).toBe("12fm2");
    expect(m.getCustomParams()).toEqual({ width: "12", flag: true, mode: 2 });
  });

  it("rejects invalid values with the game's validateParams message, unchanged", () => {
    const m = new Midend(makeGame());
    const before = m.getParams();
    const err = m.setCustomParams({ width: "0" });
    expect(err).toBe("Width must be at least one");
    expect(m.getParams()).toBe(before);
  });

  it("applies only submitted keys, leaving the rest at their current value", () => {
    const m = new Midend(makeGame());
    // Only width submitted: flag/mode keep the current params' values.
    expect(m.setCustomParams({ width: "7" })).toBeNull();
    expect(m.getParams()).toBe("7m1");
  });

  it("does not mutate the live params when validation fails", () => {
    // A rejected edit that touches several fields must leave ALL of them
    // as they were — the midend applies onto a copy, not live params.
    const m = new Midend(makeGame());
    m.setCustomParams({ width: "0", flag: true, mode: 2 });
    expect(m.getCustomParams()).toEqual({ width: "5", flag: false, mode: 1 });
  });

  it("encodeCustomParams returns the encoded id, or the refusal on invalid", () => {
    const m = new Midend(makeGame());
    expect(m.encodeCustomParams({ width: "9", flag: true, mode: 0 })).toEqual({
      ok: true,
      params: "9fm0",
    });
    expect(m.encodeCustomParams({ width: "0" })).toEqual({
      ok: false,
      error: "Width must be at least one",
    });
    // A preview never adopts the params.
    expect(m.getParams()).toBe("5m1");
  });

  it("coerces loosely-typed values at the boundary (DB/JSON strings)", () => {
    const m = new Midend(makeGame());
    // The app form submits typed values, but a persisted/legacy value may
    // arrive as a string; boolean and choices coerce like applyPrefs.
    expect(m.setCustomParams({ width: "8", flag: "true", mode: "2" })).toBeNull();
    expect(m.getParams()).toBe("8fm2");
  });
});

describe("A game with no custom fields keeps an empty custom dialog", () => {
  it("yields empty items and setCustomParams is a no-op", () => {
    const m = new Midend(makeGame({ paramConfig: [] }));
    const cfg = m.getCustomParamsConfig();
    expect(cfg.items).toEqual({});
    expect(m.getCustomParams()).toEqual({});
    const before = m.getParams();
    expect(m.setCustomParams({ width: "99" })).toBeNull();
    expect(m.getParams()).toBe(before);
  });
});

// --- guard over every registered game ------------------------------

type AnyGame = Game<unknown, unknown, unknown, unknown, unknown>;

/** Every leaf preset's params, plus the default, for one game. */
function allPresetParams(game: AnyGame): unknown[] {
  const out: unknown[] = [game.defaultParams()];
  const walk = (menu: PresetMenu<unknown>): void => {
    if (menu.submenu) {
      for (const child of menu.submenu) walk(child);
    } else if (menu.params !== undefined) {
      out.push(menu.params);
    }
  };
  walk(presetMenu(game));
  return out;
}

// A sweep driven by a list can only be as good as the list, so the count is
// asserted below rather than assumed: an empty registry would generate no
// `it()` at all and the file would pass in silence.
describe("Every registered game with paramConfig round-trips its presets", () => {
  it("swept a populated registry, so the cases below are not vacuous", () => {
    expect(REGISTERED_GAME_COUNT).toBeGreaterThan(50);
  });

  it("no game ships a blank Custom type… dialog", () => {
    // The type menu offers "Custom type…" for every game unconditionally, and
    // `paramConfig` is required but may be empty, so a port that writes `[]`
    // ships a dialog with no fields in it and nothing else objects.
    //
    // If a genuinely preset-only game ever arrives, this is the prompt to
    // decide what its menu should say, rather than to add an exception.
    const blank = REGISTERED_GAMES.filter(([, g]) => g.paramConfig.length === 0).map(
      ([id]) => id,
    );
    expect(blank, "games whose custom-params dialog would open empty").toEqual([]);
  });

  for (const [id, game] of REGISTERED_GAMES) {
    it(`${id}: getCustomParams∘setCustomParams ≡ identity through ConfigValues`, () => {
      // Deliberately typed loose: this guard drives the non-generic
      // engine surface only.
      const m = new Midend(game as AnyGame);
      for (const p of allPresetParams(game)) {
        const encoded = game.encodeParams(p, true);
        const setErr = m.setParams(encoded);
        expect(setErr, `${id} rejected its own preset ${encoded}`).toBeNull();
        const values = m.getCustomParams();
        // Feeding the read-back values into setCustomParams must validate
        // and reproduce the same param id — no drift between get and set.
        const err = m.setCustomParams(values);
        expect(
          err,
          `${id} rejected its own values ${JSON.stringify(values)}`,
        ).toBeNull();
        expect(m.getParams()).toBe(encoded);
      }
    });
  }
});
