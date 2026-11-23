/**
 * A game's test data, `<game>.cases.yaml` beside its description, and the
 * engine's check of each case: what a born game ships in place of a test file
 * (the `testing` spec's "A born game's tests are data the engine reads").
 * The file is read here and nowhere else; `guards/born-game-cases.test.ts`
 * runs it for every game born from its description.
 *
 * Every section is optional:
 *
 * - `values`: names for the game's cell values, so a case writes `shaded`
 *   where the board holds 1. A name stands for its number anywhere in a
 *   case's moves and in an array it expects.
 * - `hint`: the pinned positions `describeHintPins` takes (`params`, `seeds`,
 *   `unreached`, `pins`), and `kinds`, each a step shape ({@link KindShape}).
 *   `npm run hint-scan -- <the cases file>` writes `pins`.
 * - `tiers`: `absent` and `dealt`, the cells `describeAbsentTiers` and
 *   `describeDealtTiers` take.
 * - `ids`: a game ID, what it opens as (`opens`, the params the midend then
 *   holds, or `refused`) and what the board it deals `holds`.
 * - `params`: a params string read, with what it is written back as
 *   (`full`, `brief`), its menu `label`, and whether it is `refused` when a
 *   board is to be dealt or `loads` when one arrives with its desc.
 * - `positions`: a game ID, `moves` played on it and `solve` after them, and
 *   what the engine reports there: `status`, `text`, `statusbar`, `breaks`
 *   (the rules the live errors name), `mistakes` (what Check & Save
 *   counts), the hint's first `steps`, `holds`, and `draws` (ops counted by
 *   shape and color).
 *
 * A message expected is written whole, as `/a pattern/`, or as the name of a
 * refusal constant (`DESC_NOT_UNIQUE`). An expectation the engine wrote,
 * rather than one known apart from it, says `recorded: true`.
 *
 * Dev/test-only; never imported by production code.
 */

import { describe, expect, it } from "vitest";
import {
  isMap,
  isNode,
  isScalar,
  isSeq,
  LineCounter,
  type Node,
  parseDocument,
} from "yaml";
import * as roles from "../color/roles.ts";
import * as descErrors from "../contract/desc-error.ts";
import { loadDesc } from "../contract/desc-error.ts";
import type { HintStep } from "../contract/game.ts";
import { describeParams } from "../game-id/param-label.ts";
import { paramsError } from "../game-id/params.ts";
import { Midend } from "../midend/midend.ts";
import { describeAbsentTiers, describeDealtTiers } from "./absent-tiers.ts";
import type { AnyGame } from "./enrollment.ts";
import { describeHintPins, type HintKind } from "./hint-positions.ts";
import type { DrawOp } from "./recording-drawing.ts";
import { renderScenario } from "./render-scenario.ts";

/** A message as a case expects it. */
export type Said =
  | { readonly exact: string }
  | { readonly pattern: RegExp }
  | { readonly constant: string; readonly text: string };

/** Where a case is written, for its test's name and its failure. */
export interface At {
  readonly line: number;
}

/** A hint step as a kind or an expectation names it: its rung, the cells
 * and values it sets, whether it only marks, and what it says. */
export interface StepShape {
  readonly rung?: string;
  /** The step's `set` as written, or `false` for a step that sets nothing. */
  readonly set?: readonly number[] | false;
  /** A value some set cell takes. */
  readonly sets?: number;
  /** Whether the step marks something. */
  readonly marks?: boolean;
  readonly says?: Said;
}

/** A further kind of hint position, by its step's shape. */
export type KindShape = StepShape & {
  /** Held by any step of the plan, not only its first. */
  readonly leg?: boolean;
};

export interface HintCases extends At {
  readonly params: readonly Record<string, unknown>[];
  readonly seeds: number | null;
  readonly unreached: Readonly<Record<string, string>>;
  readonly kinds: Readonly<Record<string, KindShape>>;
  readonly pins: Readonly<Record<string, string | { id: string; moves: unknown[] }>>;
}

export interface IdCase extends At {
  readonly id: string;
  readonly opens: string | null;
  readonly refused: Said | null;
  readonly holds: Readonly<Record<string, unknown>>;
  readonly recorded: boolean;
}

export interface ParamsCase extends At {
  readonly read: string;
  readonly full: string | null;
  readonly brief: string | null;
  readonly label: string | null;
  /** The refusal when a board is to be dealt; `false`, accepted. */
  readonly refused: Said | false | null;
  /** Whether a board that arrives with its desc loads at these params. */
  readonly loads: boolean | null;
}

/** A count of ops: a number, or `> n`. */
export type Count = { readonly exactly: number } | { readonly over: number };

export interface PositionCase extends At {
  readonly id: string;
  readonly moves: readonly unknown[];
  readonly solve: boolean;
  readonly status: string | null;
  readonly text: string | null;
  readonly statusbar: string | null;
  readonly breaks: readonly string[] | null;
  readonly mistakes: number | null;
  readonly steps: readonly StepShape[] | null;
  readonly holds: Readonly<Record<string, unknown>>;
  /** By `<op> <color role>`, as `polygon error`. */
  readonly draws: Readonly<Record<string, Count>>;
  readonly recorded: boolean;
}

export interface GameCases {
  readonly path: string;
  readonly values: Readonly<Record<string, number>>;
  readonly hint: HintCases | null;
  readonly tiers: {
    readonly absent: readonly string[];
    readonly dealt: readonly string[];
  };
  readonly ids: readonly IdCase[];
  readonly params: readonly ParamsCase[];
  readonly positions: readonly PositionCase[];
}

/** Where the cases of the description at `source` are. */
export const casesPath = (source: string): string => {
  if (!source.endsWith(".description.yaml"))
    throw new Error(`${source} is not a description`);
  return source.replace(/\.description\.yaml$/, ".cases.yaml");
};

/** The refusal constants a case may name, by name. */
const CONSTANTS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(descErrors).flatMap(([name, v]) =>
    /^DESC_[A-Z_]+$/.test(name) && typeof v === "string" ? [[name, v]] : [],
  ),
);

/** The color roles a `draws` key may name, by the name after `COL_`. */
const COLORS: Readonly<Record<string, number>> = Object.fromEntries(
  Object.entries(roles).flatMap(([k, v]) =>
    k.startsWith("COL_") && typeof v === "number"
      ? [[k.slice(4).toLowerCase().replaceAll("_", "-"), v]]
      : [],
  ),
);

const SECTIONS = ["values", "hint", "tiers", "ids", "params", "positions"] as const;

/** Read `text`, the cases file at `path`. A malformed entry throws, naming
 * the file and the line. */
export function parseGameCases(text: string, path: string): GameCases {
  const lines = new LineCounter();
  const doc = parseDocument(text, {
    version: "1.2",
    schema: "core",
    uniqueKeys: true,
    lineCounter: lines,
  });
  if (doc.errors.length > 0) throw new Error(`${path}: ${doc.errors[0].message}`);
  const lineOf = (node: unknown): number =>
    node !== null && typeof node === "object" && "range" in node
      ? lines.linePos((node as Node).range?.[0] ?? 0).line
      : 1;
  const fail = (node: unknown, message: string): never => {
    throw new Error(`${path}:${lineOf(node)}: ${message}`);
  };

  /** A map node's entries, each key a string, with only `allowed` keys. */
  const entries = (
    node: unknown,
    where: string,
    allowed: readonly string[] | null,
  ): Map<string, Node> => {
    if (node === null || node === undefined) return new Map();
    if (!isMap(node)) return fail(node, `${where} is not a map`);
    const out = new Map<string, Node>();
    for (const pair of node.items) {
      const key = isScalar(pair.key) ? String(pair.key.value) : null;
      if (key === null) return fail(pair.key, `${where} has a key that is not a name`);
      if (allowed !== null && !allowed.includes(key))
        return fail(
          pair.key,
          `${where} has no "${key}" (it takes ${allowed.join(", ")})`,
        );
      out.set(key, pair.value as Node);
    }
    return out;
  };
  const items = (node: unknown, where: string): Node[] => {
    if (node === null || node === undefined) return [];
    if (!isSeq(node)) return fail(node, `${where} is not a list`);
    return node.items as Node[];
  };
  const js = (node: unknown): unknown =>
    node !== null && typeof node === "object" && "toJSON" in node
      ? (node as Node).toJSON()
      : node;
  const str = (node: unknown, where: string): string => {
    const v = js(node);
    if (typeof v !== "string") return fail(node, `${where} is not a string`);
    return v;
  };
  const num = (node: unknown, where: string): number => {
    const v = js(node);
    if (typeof v !== "number" || !Number.isInteger(v))
      return fail(node, `${where} is not a whole number`);
    return v;
  };
  const bool = (node: unknown, where: string): boolean => {
    const v = js(node);
    if (typeof v !== "boolean") return fail(node, `${where} is not true or false`);
    return v;
  };
  const opt = <T>(node: unknown, read: (n: Node) => T): T | null =>
    isNode(node) ? read(node) : null;

  const top = entries(doc.contents, path, SECTIONS);

  const values: Record<string, number> = {};
  for (const [name, node] of entries(top.get("values"), "values", null))
    values[name] = num(node, `values.${name}`);
  /** `v` with every value name in it read as its number. */
  const named = (v: unknown, node: unknown): unknown => {
    if (typeof v === "string" && v in values) return values[v];
    if (Array.isArray(v)) return v.map((x) => named(x, node));
    if (v !== null && typeof v === "object")
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, named(x, node)]));
    return v;
  };

  const said = (node: Node, where: string): Said => {
    const s = str(node, where);
    if (s.length > 1 && s.startsWith("/") && s.endsWith("/"))
      return { pattern: new RegExp(s.slice(1, -1)) };
    if (/^DESC_[A-Z_]+$/.test(s)) {
      const text = CONSTANTS[s];
      if (text === undefined) return fail(node, `${where}: no refusal ${s}`);
      return { constant: s, text };
    }
    return { exact: s };
  };

  const stepShape = (
    node: Node,
    where: string,
    allowed: readonly string[],
  ): StepShape => {
    const e = entries(node, where, allowed);
    const set = e.get("set");
    const setV = set === undefined ? undefined : named(js(set), set);
    if (setV !== undefined && setV !== false && !isNumbers(setV))
      return fail(set, `${where}.set is not a list of numbers or false`);
    const sets = e.get("sets");
    const setsV = sets === undefined ? undefined : named(js(sets), sets);
    if (setsV !== undefined && typeof setsV !== "number")
      return fail(sets, `${where}.sets is not a value`);
    return {
      ...(e.has("rung") ? { rung: str(e.get("rung"), `${where}.rung`) } : {}),
      ...(setV === undefined ? {} : { set: setV as readonly number[] | false }),
      ...(setsV === undefined ? {} : { sets: setsV as number }),
      ...(e.has("marks") ? { marks: bool(e.get("marks"), `${where}.marks`) } : {}),
      ...(e.has("says") ? { says: said(e.get("says") as Node, `${where}.says`) } : {}),
    };
  };

  const holds = (node: unknown, where: string): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [field, v] of entries(node, where, null)) out[field] = named(js(v), v);
    return out;
  };

  let hint: HintCases | null = null;
  const hintNode = top.get("hint");
  if (hintNode !== undefined) {
    const h = entries(hintNode, "hint", [
      "params",
      "seeds",
      "unreached",
      "kinds",
      "pins",
    ]);
    const params = items(h.get("params"), "hint.params").map((n, i) => {
      const v = js(n);
      if (v === null || typeof v !== "object" || Array.isArray(v))
        return fail(n, `hint.params[${i}] is not a map`);
      return v as Record<string, unknown>;
    });
    if (params.length === 0) fail(hintNode, "hint.params names no params to deal");
    const unreached: Record<string, string> = {};
    for (const [rung, why] of entries(h.get("unreached"), "hint.unreached", null))
      unreached[rung] = str(why, `hint.unreached.${rung}`);
    const kinds: Record<string, KindShape> = {};
    for (const [kind, node] of entries(h.get("kinds"), "hint.kinds", null)) {
      const shape = stepShape(node, `hint.kinds.${kind}`, [
        "rung",
        "set",
        "sets",
        "marks",
        "leg",
      ]);
      const leg = entries(node, `hint.kinds.${kind}`, null).get("leg");
      kinds[kind] = leg === undefined ? shape : { ...shape, leg: bool(leg, "leg") };
    }
    const pins: Record<string, string | { id: string; moves: unknown[] }> = {};
    for (const [kind, node] of entries(h.get("pins"), "hint.pins", null)) {
      if (isScalar(node)) {
        pins[kind] = str(node, `hint.pins.${kind}`);
        continue;
      }
      const p = entries(node, `hint.pins.${kind}`, ["id", "moves"]);
      const moves = items(p.get("moves"), `hint.pins.${kind}.moves`).map((m) => js(m));
      pins[kind] = { id: str(p.get("id"), `hint.pins.${kind}.id`), moves };
    }
    hint = {
      line: lineOf(hintNode),
      params,
      seeds: opt(h.get("seeds"), (n) => num(n, "hint.seeds")),
      unreached,
      kinds,
      pins,
    };
  }

  const t = entries(top.get("tiers"), "tiers", ["absent", "dealt"]);
  const cells = (key: string) =>
    items(t.get(key), `tiers.${key}`).map((n, i) => str(n, `tiers.${key}[${i}]`));
  const tiers = { absent: cells("absent"), dealt: cells("dealt") };

  const ids = items(top.get("ids"), "ids").map((node, i): IdCase => {
    const where = `ids[${i}]`;
    const e = entries(node, where, ["id", "opens", "refused", "holds", "recorded"]);
    const c: IdCase = {
      line: lineOf(node),
      id: str(e.get("id"), `${where}.id`),
      opens: opt(e.get("opens"), (n) => str(n, `${where}.opens`)),
      refused: opt(e.get("refused"), (n) => said(n, `${where}.refused`)),
      holds: holds(e.get("holds"), `${where}.holds`),
      recorded: opt(e.get("recorded"), (n) => bool(n, `${where}.recorded`)) ?? false,
    };
    if (c.opens !== null && c.refused !== null)
      fail(node, `${where} both opens and is refused`);
    if (c.refused !== null && Object.keys(c.holds).length > 0)
      fail(node, `${where} is refused, so holds no board`);
    return c;
  });

  const params = items(top.get("params"), "params").map((node, i): ParamsCase => {
    const where = `params[${i}]`;
    const e = entries(node, where, [
      "read",
      "full",
      "brief",
      "label",
      "refused",
      "loads",
    ]);
    const refused = e.get("refused");
    return {
      line: lineOf(node),
      read: str(e.get("read"), `${where}.read`),
      full: opt(e.get("full"), (n) => str(n, `${where}.full`)),
      brief: opt(e.get("brief"), (n) => str(n, `${where}.brief`)),
      label: opt(e.get("label"), (n) => str(n, `${where}.label`)),
      refused:
        refused === undefined
          ? null
          : js(refused) === false
            ? false
            : said(refused, `${where}.refused`),
      loads: opt(e.get("loads"), (n) => bool(n, `${where}.loads`)),
    };
  });

  const positions = items(top.get("positions"), "positions").map(
    (node, i): PositionCase => {
      const where = `positions[${i}]`;
      const e = entries(node, where, [
        "id",
        "moves",
        "solve",
        "status",
        "text",
        "statusbar",
        "breaks",
        "mistakes",
        "steps",
        "holds",
        "draws",
        "recorded",
      ]);
      const draws: Record<string, Count> = {};
      for (const [key, n] of entries(e.get("draws"), `${where}.draws`, null)) {
        const [op, color] = key.split(" ");
        if (op === undefined || color === undefined || !(color in COLORS))
          fail(n, `${where}.draws: "${key}" is not "<op> <color role>"`);
        const v = js(n);
        const over = typeof v === "string" ? /^> (\d+)$/.exec(v) : null;
        if (over) draws[key] = { over: Number(over[1]) };
        else draws[key] = { exactly: num(n, `${where}.draws.${key}`) };
      }
      const breaks = e.get("breaks");
      return {
        line: lineOf(node),
        id: str(e.get("id"), `${where}.id`),
        moves: items(e.get("moves"), `${where}.moves`).map((m) => named(js(m), m)),
        solve: opt(e.get("solve"), (n) => bool(n, `${where}.solve`)) ?? false,
        status: opt(e.get("status"), (n) => str(n, `${where}.status`)),
        text: opt(e.get("text"), (n) => str(n, `${where}.text`)),
        statusbar: opt(e.get("statusbar"), (n) => str(n, `${where}.statusbar`)),
        breaks:
          breaks === undefined
            ? null
            : items(breaks, `${where}.breaks`).map((n, k) =>
                str(n, `${where}.breaks[${k}]`),
              ),
        mistakes: opt(e.get("mistakes"), (n) => num(n, `${where}.mistakes`)),
        steps:
          e.get("steps") === undefined
            ? null
            : items(e.get("steps"), `${where}.steps`).map((n, k) =>
                stepShape(n, `${where}.steps[${k}]`, [
                  "rung",
                  "set",
                  "sets",
                  "marks",
                  "says",
                ]),
              ),
        holds: holds(e.get("holds"), `${where}.holds`),
        draws,
        recorded: opt(e.get("recorded"), (n) => bool(n, `${where}.recorded`)) ?? false,
      };
    },
  );

  return { path, values, hint, tiers, ids, params, positions };
}

const isNumbers = (v: unknown): v is number[] =>
  Array.isArray(v) && v.every((x) => typeof x === "number");

/** Whether `text` is what `want` says. */
const saysAs = (want: Said, text: string): boolean =>
  "pattern" in want
    ? want.pattern.test(text)
    : "exact" in want
      ? text === want.exact
      : text === want.text;

const shown = (want: Said): string =>
  "pattern" in want
    ? String(want.pattern)
    : "exact" in want
      ? JSON.stringify(want.exact)
      : want.constant;

/** Whether a hint step has the shape `want` names; the first difference, or
 * null. */
function stepDiffers(
  want: StepShape,
  step: HintStep<unknown, unknown, string>,
): string | null {
  const move = step.move as { set?: readonly number[]; mark?: unknown } | null;
  if (want.rung !== undefined && step.rung !== want.rung)
    return `rung ${step.rung}, not ${want.rung}`;
  const set = move?.set ?? [];
  if (want.set === false && set.length > 0) return `sets ${JSON.stringify(set)}`;
  if (want.set !== undefined && want.set !== false) {
    if (JSON.stringify(set) !== JSON.stringify(want.set))
      return `sets ${JSON.stringify(set)}, not ${JSON.stringify(want.set)}`;
  }
  if (want.sets !== undefined && !set.some((v, i) => i % 2 === 1 && v === want.sets))
    return `sets no cell to ${want.sets}`;
  if (want.marks !== undefined && (move?.mark !== undefined) !== want.marks)
    return want.marks ? "marks nothing" : "marks something";
  if (want.says !== undefined && !saysAs(want.says, step.explanation))
    return `says "${step.explanation}", not ${shown(want.says)}`;
  return null;
}

/** The field at `path` (`dealt.number.at`) of `state`, arrays read whole. */
function fieldOf(state: unknown, path: string): unknown {
  let at: unknown = state;
  for (const key of path.split(".")) {
    if (at === null || typeof at !== "object") return undefined;
    at = (at as Record<string, unknown>)[key];
  }
  return ArrayBuffer.isView(at) ? Array.from(at as unknown as ArrayLike<number>) : at;
}

/** What of `holds` `state` does not hold, one line a field. */
function holdsDiffers(
  holds: Readonly<Record<string, unknown>>,
  state: unknown,
): string[] {
  return Object.entries(holds).flatMap(([path, want]) => {
    const got = fieldOf(state, path);
    return JSON.stringify(got) === JSON.stringify(want)
      ? []
      : [`${path} is ${JSON.stringify(got)}, not ${JSON.stringify(want)}`];
  });
}

/** The board `id` deals, or the refusal. */
function load(game: AnyGame, id: string): { state: unknown } | { error: string } {
  const colon = id.indexOf(":");
  if (colon < 0) throw new Error(`${id} is not a game ID with a desc`);
  const loaded = loadDesc(
    game,
    game.decodeParams(id.slice(0, colon)),
    id.slice(colon + 1),
  );
  return loaded.ok ? { state: loaded.value } : { error: loaded.error };
}

/** What of an ID case the game does not do: empty when it holds. */
export function checkId(game: AnyGame, c: IdCase): string[] {
  const out: string[] = [];
  const loaded = load(game, c.id);
  if (c.refused !== null) {
    if (!("error" in loaded)) return ["loads, where it should be refused"];
    if (!saysAs(c.refused, loaded.error))
      out.push(`refused with "${loaded.error}", not ${shown(c.refused)}`);
    return out;
  }
  if ("error" in loaded) return [`refused: ${loaded.error}`];
  if (c.opens !== null) {
    const opened = openedAs(game, c.id);
    if (opened !== c.opens) out.push(`opens as ${opened}, not ${c.opens}`);
  }
  out.push(...holdsDiffers(c.holds, loaded.state));
  return out;
}

/** The params a midend holds once `id` is pasted, the tier a pasted board
 * needs settled by the app's own path; or its refusal. */
function openedAs(game: AnyGame, id: string): string {
  const m = new Midend(game);
  return m.newGameFromId(id) ?? m.getParams();
}

/** What of a params case the game does not do. */
export function checkParams(game: AnyGame, c: ParamsCase): string[] {
  const out: string[] = [];
  const p = game.decodeParams(c.read);
  const was = (what: string, got: unknown, want: unknown) =>
    got === want ? [] : [`${what} ${JSON.stringify(got)}, not ${JSON.stringify(want)}`];
  if (c.full !== null)
    out.push(...was("written whole as", game.encodeParams(p, true), c.full));
  if (c.brief !== null)
    out.push(...was("written brief as", game.encodeParams(p, false), c.brief));
  if (c.label !== null) out.push(...was("labeled", describeParams(game, p), c.label));
  if (c.refused !== null) {
    const refusal = paramsError(game, p, true);
    if (c.refused === false) {
      if (refusal !== null) out.push(`refused to deal: ${refusal}`);
    } else if (refusal === null) out.push("dealt, where it should be refused");
    else if (!saysAs(c.refused, refusal))
      out.push(`refused with "${refusal}", not ${shown(c.refused)}`);
  }
  if (c.loads !== null) {
    const refusal = paramsError(game, p, false);
    if (c.loads && refusal !== null) out.push(`refused to load: ${refusal}`);
    if (!c.loads && refusal === null) out.push("loads, where it should be refused");
  }
  return out;
}

/** How many of `ops` are `<op> <color role>`, by color or fill. */
function drawn(ops: readonly DrawOp[], key: string): number {
  const [op, role] = key.split(" ");
  const color = COLORS[role];
  return ops.filter(
    (o) =>
      o.op === op &&
      (("color" in o && o.color === color) || ("fill" in o && o.fill === color)),
  ).length;
}

/** What of a position case the game does not do. */
export function checkPosition(game: AnyGame, c: PositionCase): string[] {
  const loaded = load(game, c.id);
  if ("error" in loaded) return [`refused: ${loaded.error}`];
  let state = loaded.state;
  const moves = [...c.moves];
  for (const m of c.moves) state = game.executeMove(state, m);
  if (c.solve) {
    const solved = game.solve(state, state);
    if (!solved.ok) return [`no answer to play: ${solved.error}`];
    state = game.executeMove(state, solved.move);
    moves.push(solved.move);
  }
  const out: string[] = [];
  const was = (what: string, got: unknown, want: unknown) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      out.push(`${what} ${JSON.stringify(got)}, not ${JSON.stringify(want)}`);
  };
  if (c.status !== null) was("status", game.status(state), c.status);
  if (c.text !== null) was("text", game.textFormat?.(state) ?? null, c.text);
  if (c.statusbar !== null)
    was(
      "status bar",
      game.statusbarText?.(state, game.newUi(state)) ?? null,
      c.statusbar,
    );
  if (c.breaks !== null) {
    const rules = game.rules;
    if (rules === undefined) out.push("declares no rules to break");
    else {
      const broken = [
        ...new Set(rules.violations(state, rules.grid(state)).map((v) => v.rule)),
      ].sort();
      was("breaks", broken, [...c.breaks].sort());
    }
  }
  if (c.steps !== null) {
    const plan = game.hint?.plan(state);
    if (plan === undefined) out.push("has no hint");
    else if (!plan.ok) out.push(`the hint refuses: ${plan.error}`);
    else
      c.steps.forEach((want, i) => {
        const step = plan.steps[i];
        const differs =
          step === undefined ? "is not in the plan" : stepDiffers(want, step);
        if (differs !== null) out.push(`step ${i + 1} ${differs}`);
      });
  }
  out.push(...holdsDiffers(c.holds, state));
  if (c.mistakes !== null || Object.keys(c.draws).length > 0) {
    const frame = renderScenario({
      game,
      id: c.id,
      moves,
      showMistakes: c.mistakes !== null,
    });
    if (c.mistakes !== null) was("mistakes", frame.mistakeCount, c.mistakes);
    for (const [key, want] of Object.entries(c.draws)) {
      const n = drawn(frame.recording.ops, key);
      if ("exactly" in want ? n !== want.exactly : n <= want.over)
        out.push(
          `draws ${n} ${key}, not ${"exactly" in want ? want.exactly : `over ${want.over}`}`,
        );
    }
  }
  return out;
}

/** The hint kind a step shape is: a step of that shape opens the plan, or,
 * as a `leg`, is anywhere in it. */
function kindOf(shape: KindShape): HintKind<unknown, unknown, unknown, string> {
  const holds = (step: HintStep<unknown, unknown, string>) =>
    stepDiffers(shape, step) === null;
  return shape.leg === true ? { leg: holds } : holds;
}

/**
 * Declare the tests a game's cases are: its pinned hint positions, its tier
 * cells, and one test a case, named by the line it is written on.
 */
export function describeGameCases(game: AnyGame, cases: GameCases): void {
  const { hint } = cases;
  if (hint !== null)
    describeHintPins({
      game,
      params: hint.params,
      ...(hint.seeds === null ? {} : { seeds: hint.seeds }),
      kinds: Object.fromEntries(
        Object.entries(hint.kinds).map(([name, shape]) => [name, kindOf(shape)]),
      ),
      unreached: hint.unreached,
      pins: hint.pins,
      source: cases.path,
    });
  if (cases.tiers.absent.length > 0) describeAbsentTiers(game, cases.tiers.absent);
  if (cases.tiers.dealt.length > 0) describeDealtTiers(game, cases.tiers.dealt);
  const each = <C extends At>(
    section: string,
    list: readonly C[],
    name: (c: C) => string,
    check: (game: AnyGame, c: C) => string[],
  ) => {
    if (list.length === 0) return;
    describe(`${game.id}: ${section}`, () => {
      for (const c of list)
        it(`${cases.path}:${c.line} ${name(c)}`, () => {
          expect(check(game, c)).toEqual([]);
        });
    });
  };
  each("ids", cases.ids, (c) => c.id, checkId);
  each("params", cases.params, (c) => c.read, checkParams);
  each("positions", cases.positions, (c) => c.id, checkPosition);
}
