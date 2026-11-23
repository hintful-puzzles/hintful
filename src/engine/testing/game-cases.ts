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
 *   `describeDealtTiers` take. An absent cell written
 *   `{ cell, exhaustive: true }` is shown absent over every answer of its
 *   size in place of the generator's tries, with `unfinished` the count of
 *   those no lower tier finishes (`every-answer.ts`).
 * - `ids`: a game ID, what it opens as (`opens`, the params the midend then
 *   holds, or `refused`), what its desc reads as (`holds`), refused or
 *   not, and whether the desc is written back byte for byte (`writesBack`).
 * - `params`: a params string read, with what it is written back as
 *   (`full`, `brief`), its menu `label`, and whether it is `refused` when a
 *   board is to be dealt (or read at all) or `loads` when one arrives with
 *   its desc.
 * - `positions`: a game ID, `moves` played on it and `solve` after them, and
 *   what the engine reports there: `status`, `text`, `statusbar`, `breaks`
 *   (the rules the live errors name), `mistakes` (what Check & Save
 *   counts), the hint's `steps` (from the first, or each at the `step` it
 *   names), `holds`, `brings` (what the last
 *   move's placement rules out, `Game.rulesOut`), `draws` (ops counted by
 *   shape and color: a role, or one of the collection's colors) and
 *   `circled` (the text inside each circle the hint draws), the frame drawn
 *   under the `preferences` given, and with the hint shown where it says
 *   `showHint`.
 * - `input`: a game ID, `moves` played on it, the `cursor` it starts on,
 *   and `events` sent in turn (`input-cases.ts`), each a `key` by name or a
 *   `press`, `drag`, `release` or `click` at a cell or the `margin`, and
 *   what holds once it is sent: `values`, `holds`, `cursor`, `returns` and
 *   `preferences`. An entry with no event says what holds as it stands.
 * - `wordings`: a technique's stated wording rendered from `terms`, on cells
 *   numbered on a grid `width` wide (`ring`, and `marks` by role), and what
 *   it `says`: for a wording no walk reaches.
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
import * as collection from "../color/colors.ts";
import * as roles from "../color/roles.ts";
import * as descErrors from "../contract/desc-error.ts";
import { loadDesc, readBoard } from "../contract/desc-error.ts";
import type { HintStep } from "../contract/game.ts";
import { CELL } from "../contract/hint-words.ts";
import type { Color, ConfigValues, Point } from "../contract/types.ts";
import { type Clues, type FillBoard, type FillModule, spaceOf } from "../fill/board.ts";
import { encodeDesc, type FillDeal } from "../fill/game-id.ts";
import { type FillHintModule, pairPieces } from "../fill/hint.ts";
import { describeParams } from "../game-id/param-label.ts";
import { paramsError, UnreadableParams } from "../game-id/params.ts";
import { statedSentence } from "../hint/stated.ts";
import { Midend } from "../midend/midend.ts";
import { describeAbsentTiers, describeDealtTiers } from "./absent-tiers.ts";
import { holdsDiffers } from "./case-fields.ts";
import type { AnyGame } from "./enrollment.ts";
import { everyAnswer } from "./every-answer.ts";
import { describeHintPins, type HintKind } from "./hint-positions.ts";
import {
  checkInput,
  type InputCase,
  type InputEvent,
  type InputStep,
  keyButton,
  POINTER,
} from "./input-cases.ts";
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

/** A step of a plan expected, and which step it is, counted from 1. */
export type PlanStep = StepShape & { readonly step: number };

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
  /** Whether the desc is written back byte for byte. */
  readonly writesBack: boolean;
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
  /** The text written, `null` where the game writes none; absent, not
   * checked. */
  readonly text?: string | null;
  /** The status bar's words, `null` where the game shows none; absent, not
   * checked. */
  readonly statusbar?: string | null;
  readonly breaks: readonly string[] | null;
  readonly mistakes: number | null;
  readonly steps: readonly PlanStep[] | null;
  readonly holds: Readonly<Record<string, unknown>>;
  /** What the last of `moves` brings (`Game.rulesOut`), `null` for nothing;
   * absent, not checked. */
  readonly brings?: unknown;
  /** By `<op> <color role>`, as `polygon error`, or `<op> any` for every op
   * of the shape, whatever its color: a piece in the game's own colors. */
  readonly draws: Readonly<Record<string, Count>>;
  /** The preferences the frame is drawn under, keyed as the Preferences
   * dialog keys them. */
  readonly preferences: ConfigValues;
  /** Whether the frame `draws` counts is drawn with the hint shown. */
  readonly showHint: boolean;
  /** The text drawn at the center of each unfilled circle, sorted: what the
   * hint circles, where it circles a number. Read with the hint shown. */
  readonly circled: readonly string[] | null;
  readonly recorded: boolean;
}

/** A technique's stated wording rendered from terms, for a wording no walk
 * reaches. Its cells are numbered on a grid `width` wide. */
export interface WordingCase extends At {
  readonly technique: string;
  /** Which of the technique's step wordings, from 0. */
  readonly wording: number;
  readonly width: number;
  readonly ring: readonly number[];
  /** The cells each other role marks, by role. */
  readonly marks: Readonly<Record<string, readonly number[]>>;
  readonly terms: Readonly<Record<string, number | boolean>>;
  readonly says: Said;
}

/** A size refused a tier. Where `every` is given its absence is shown over
 * every answer of the size ({@link everyAnswer}) in place of the
 * generator's tries, and `unfinished` is how many of them no lower tier
 * finishes, where the file states it. */
export interface AbsentCell {
  readonly cell: string;
  readonly every: { readonly unfinished: number | null } | null;
  readonly line: number;
}

export interface GameCases {
  readonly path: string;
  readonly values: Readonly<Record<string, number>>;
  readonly hint: HintCases | null;
  readonly tiers: {
    readonly absent: readonly AbsentCell[];
    readonly dealt: readonly string[];
  };
  readonly ids: readonly IdCase[];
  readonly params: readonly ParamsCase[];
  readonly positions: readonly PositionCase[];
  readonly input: readonly InputCase[];
  readonly wordings: readonly WordingCase[];
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

/** The collection's colors a `draws` key may name instead (`yellow-wash`),
 * for a surface a game paints in one with no role: matched by the palette
 * slot holding that very color. */
const NAMED: Readonly<Record<string, Color>> = Object.fromEntries(
  Object.entries(collection).flatMap(([k, v]) =>
    /^[A-Z_]+$/.test(k) &&
    Array.isArray(v) &&
    v.length === 3 &&
    v.every(Number.isFinite)
      ? [[k.toLowerCase().replaceAll("_", "-"), v as Color]]
      : [],
  ),
);

const SECTIONS = [
  "values",
  "hint",
  "tiers",
  "ids",
  "params",
  "positions",
  "input",
  "wordings",
] as const;

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
  /** `key` of `e` as words, or `null` written for none; nothing where the
   * key is absent. */
  const orNone = <K extends string>(
    e: Map<string, Node>,
    key: K,
    where: string,
  ): Partial<Record<K, string | null>> => {
    if (!e.has(key)) return {};
    const node = e.get(key);
    const v = js(node);
    return { [key]: v === null ? null : str(node, `${where}.${key}`) } as Partial<
      Record<K, string | null>
    >;
  };

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

  /** A plan's steps expected, each the one after the last unless it names
   * its `step`, counted from 1. */
  const planSteps = (node: unknown, where: string): PlanStep[] => {
    let last = 0;
    return items(node, where).map((n, k) => {
      const at = `${where}[${k}]`;
      const step =
        isMap(n) && n.has("step") ? num(n.get("step", true), `${at}.step`) : last + 1;
      if (step <= last) return fail(n, `${at}.step ${step} is not after step ${last}`);
      last = step;
      return {
        step,
        ...stepShape(n, at, ["step", "rung", "set", "sets", "marks", "says"]),
      };
    });
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
      const moves = items(p.get("moves"), `hint.pins.${kind}.moves`).map((m) =>
        named(js(m), m),
      );
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
  const absent = items(t.get("absent"), "tiers.absent").map((n, i): AbsentCell => {
    const where = `tiers.absent[${i}]`;
    if (!isMap(n)) return { cell: str(n, where), every: null, line: lineOf(n) };
    const e = entries(n, where, ["cell", "exhaustive", "unfinished"]);
    if (js(e.get("exhaustive")) !== true)
      return fail(n, `${where} is a map only to say exhaustive: true`);
    return {
      cell: str(e.get("cell"), `${where}.cell`),
      every: {
        unfinished: opt(e.get("unfinished"), (u) => num(u, `${where}.unfinished`)),
      },
      line: lineOf(n),
    };
  });
  const tiers = { absent, dealt: cells("dealt") };

  const ids = items(top.get("ids"), "ids").map((node, i): IdCase => {
    const where = `ids[${i}]`;
    const e = entries(node, where, [
      "id",
      "opens",
      "refused",
      "holds",
      "writesBack",
      "recorded",
    ]);
    const c: IdCase = {
      line: lineOf(node),
      id: str(e.get("id"), `${where}.id`),
      opens: opt(e.get("opens"), (n) => str(n, `${where}.opens`)),
      refused: opt(e.get("refused"), (n) => said(n, `${where}.refused`)),
      holds: holds(e.get("holds"), `${where}.holds`),
      writesBack:
        opt(e.get("writesBack"), (n) => bool(n, `${where}.writesBack`)) ?? false,
      recorded: opt(e.get("recorded"), (n) => bool(n, `${where}.recorded`)) ?? false,
    };
    if (c.opens !== null && c.refused !== null)
      fail(node, `${where} both opens and is refused`);
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
        "brings",
        "draws",
        "preferences",
        "showHint",
        "circled",
        "recorded",
      ]);
      const preferences: Record<string, string | boolean | number> = {};
      for (const [kw, n] of entries(
        e.get("preferences"),
        `${where}.preferences`,
        null,
      )) {
        const v = js(n);
        if (typeof v !== "string" && typeof v !== "boolean" && typeof v !== "number")
          fail(n, `${where}.preferences.${kw} is not a word, number, or true or false`);
        preferences[kw] = v as string | boolean | number;
      }
      const draws: Record<string, Count> = {};
      for (const [key, n] of entries(e.get("draws"), `${where}.draws`, null)) {
        const [op, color] = key.split(" ");
        if (
          op === undefined ||
          color === undefined ||
          !(color in COLORS || color in NAMED || color === "any")
        )
          fail(
            n,
            `${where}.draws: "${key}" is not "<op> <color role, collection color or any>"`,
          );
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
        ...orNone(e, "text", where),
        ...orNone(e, "statusbar", where),
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
            : planSteps(e.get("steps"), `${where}.steps`),
        holds: holds(e.get("holds"), `${where}.holds`),
        ...(e.has("brings")
          ? { brings: named(js(e.get("brings")), e.get("brings")) }
          : {}),
        draws,
        preferences,
        showHint: opt(e.get("showHint"), (n) => bool(n, `${where}.showHint`)) ?? false,
        circled:
          e.get("circled") === undefined
            ? null
            : items(e.get("circled"), `${where}.circled`).map((n, k) =>
                str(n, `${where}.circled[${k}]`),
              ),
        recorded: opt(e.get("recorded"), (n) => bool(n, `${where}.recorded`)) ?? false,
      };
    },
  );

  const cellList = (node: unknown, where: string): number[] =>
    items(node, where).map((n, k) => num(n, `${where}[${k}]`));
  const wordings = items(top.get("wordings"), "wordings").map(
    (node, i): WordingCase => {
      const where = `wordings[${i}]`;
      const e = entries(node, where, [
        "technique",
        "wording",
        "width",
        "ring",
        "marks",
        "terms",
        "says",
      ]);
      const marks: Record<string, number[]> = {};
      for (const [role, n] of entries(e.get("marks"), `${where}.marks`, null))
        marks[role] = cellList(n, `${where}.marks.${role}`);
      const terms: Record<string, number | boolean> = {};
      for (const [term, n] of entries(e.get("terms"), `${where}.terms`, null)) {
        const v = named(js(n), n);
        if (typeof v !== "number" && typeof v !== "boolean")
          fail(n, `${where}.terms.${term} is not a number or true or false`);
        terms[term] = v as number | boolean;
      }
      const says = e.get("says");
      if (says === undefined) return fail(node, `${where} says nothing`);
      return {
        line: lineOf(node),
        technique: str(e.get("technique"), `${where}.technique`),
        wording: opt(e.get("wording"), (n) => num(n, `${where}.wording`)) ?? 0,
        width: num(e.get("width"), `${where}.width`),
        ring: cellList(e.get("ring"), `${where}.ring`),
        marks,
        terms,
        says: said(says, `${where}.says`),
      };
    },
  );

  const cell = (node: unknown, where: string): [number, number] => {
    const v = js(node);
    if (!Array.isArray(v) || v.length !== 2 || !v.every(Number.isInteger))
      return fail(node, `${where} is not a cell, [x, y]`);
    return [v[0], v[1]];
  };
  const pointerKinds = Object.keys(POINTER) as (keyof typeof POINTER)[];
  const input = items(top.get("input"), "input").map((node, i): InputCase => {
    const where = `input[${i}]`;
    const e = entries(node, where, ["id", "moves", "cursor", "events"]);
    const events = items(e.get("events"), `${where}.events`).map((n, k): InputStep => {
      const at = `${where}.events[${k}]`;
      const s = entries(n, at, [
        "key",
        ...pointerKinds,
        "button",
        "values",
        "holds",
        "cursor",
        "returns",
        "preferences",
      ]);
      const kinds = ["key", ...pointerKinds].filter((kind) => s.has(kind));
      if (kinds.length > 1)
        return fail(n, `${at} sends ${kinds.join(" and ")} at once`);
      let event: InputEvent | null = null;
      if (s.has("key")) {
        const key = str(s.get("key"), `${at}.key`);
        const button = keyButton(key);
        if (button === null) return fail(s.get("key"), `${at}.key: no key "${key}"`);
        event = { key, button };
      } else if (kinds.length === 1) {
        const kind = kinds[0] as keyof typeof POINTER;
        const node = s.get(kind);
        const button = opt(s.get("button"), (b) => str(b, `${at}.button`)) ?? "left";
        if (button !== "left" && button !== "right")
          return fail(s.get("button"), `${at}.button is not left or right`);
        event = {
          pointer: kind,
          right: button === "right",
          at: js(node) === "margin" ? "margin" : cell(node, `${at}.${kind}`),
        };
      }
      const returns = opt(s.get("returns"), (r) => str(r, `${at}.returns`));
      if (
        returns !== null &&
        returns !== "move" &&
        returns !== "ui" &&
        returns !== "none"
      )
        return fail(s.get("returns"), `${at}.returns is not move, ui or none`);
      const preferences: Record<string, string | boolean | number> = {};
      for (const [kw, p] of entries(s.get("preferences"), `${at}.preferences`, null)) {
        const v = js(p);
        if (typeof v !== "string" && typeof v !== "boolean" && typeof v !== "number")
          return fail(
            p,
            `${at}.preferences.${kw} is not a word, number, or true or false`,
          );
        preferences[kw] = v;
      }
      const values = s.get("values");
      const values_ = values === undefined ? undefined : named(js(values), values);
      if (values_ !== undefined && !isNumbers(values_))
        return fail(values, `${at}.values is not a list of values`);
      return {
        line: lineOf(n),
        event,
        ...(values_ === undefined ? {} : { values: values_ as number[] }),
        ...(s.has("holds") ? { holds: holds(s.get("holds"), `${at}.holds`) } : {}),
        ...(s.has("cursor")
          ? {
              cursor:
                js(s.get("cursor")) === null
                  ? null
                  : cell(s.get("cursor"), `${at}.cursor`),
            }
          : {}),
        ...(returns === null ? {} : { returns }),
        ...(Object.keys(preferences).length === 0 ? {} : { preferences }),
      };
    });
    return {
      line: lineOf(node),
      id: str(e.get("id"), `${where}.id`),
      moves: items(e.get("moves"), `${where}.moves`).map((m) => named(js(m), m)),
      cursor: opt(e.get("cursor"), (n) => cell(n, `${where}.cursor`)),
      events,
    };
  });

  return { path, values, hint, tiers, ids, params, positions, input, wordings };
}

/** What of a wording case the compiled module's words do not say. */
function checkWording(
  compiled: Readonly<Record<string, unknown>>,
  c: WordingCase,
): string[] {
  const stated = (compiled as Pick<FillHintModule<object>, "STATED">).STATED;
  const clauses = stated?.[c.technique]?.step?.[c.wording];
  if (clauses === undefined)
    return [`no wording ${c.wording} of ${c.technique} is stated`];
  const at = (i: number): Point => ({ x: i % c.width, y: Math.floor(i / c.width) });
  const pieces = pairPieces((compiled as Pick<FillHintModule<object>, "play">).play);
  const { text } = statedSentence(clauses, {
    kind: CELL,
    at,
    ring: c.ring.map(at),
    marks: Object.fromEntries(
      Object.entries(c.marks).map(([role, cells]) => [role, cells.map(at)]),
    ),
    terms: c.terms,
    value: String,
    ...(pieces === null ? {} : { piece: (v: number) => pieces[v] }),
  });
  return saysAs(c.says, text) ? [] : [`says "${text}", not ${shown(c.says)}`];
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

/** The board `id` deals, or the refusal. */
function load(game: AnyGame, id: string): { state: unknown } | { error: string } {
  const [params, desc] = splitId(id);
  const loaded = loadDesc(game, game.decodeParams(params), desc);
  return loaded.ok ? { state: loaded.value } : { error: loaded.error };
}

/** A game ID's params and desc. */
function splitId(id: string): [string, string] {
  const colon = id.indexOf(":");
  if (colon < 0) throw new Error(`${id} is not a game ID with a desc`);
  return [id.slice(0, colon), id.slice(colon + 1)];
}

/** The desc a born game writes for the board `desc` reads as under
 * `params`, through the codec its description compiles to; or why none. */
export function writtenBack(
  game: AnyGame,
  compiled: Readonly<Record<string, unknown>>,
  params: string,
  desc: string,
): string {
  const deal = compiled["deal"] as FillDeal | undefined;
  if (deal === undefined) return "nothing: no desc codec is compiled";
  const read = readBoard(game, game.decodeParams(params), desc);
  if (!read.ok) return `nothing: ${read.error}`;
  const b = read.value as FillBoard<Clues<object>>;
  const module = compiled as unknown as FillModule<Clues<object>>;
  return encodeDesc(deal, spaceOf(module, b), b.dealt);
}

/** What of an ID case the game does not do: empty when it holds. What the
 * board `holds` is the codec's reading of the desc, so a case may say what a
 * board refused as unplayable reads as. */
export function checkId(
  game: AnyGame,
  c: IdCase,
  compiled: Readonly<Record<string, unknown>> = {},
): string[] {
  const out: string[] = [];
  if (c.writesBack) {
    const [params, desc] = splitId(c.id);
    const written = writtenBack(game, compiled, params, desc);
    if (written !== desc) out.push(`written back as ${written}`);
  }
  const loaded = load(game, c.id);
  if (c.refused !== null) {
    if (!("error" in loaded)) out.push("loads, where it should be refused");
    else if (!saysAs(c.refused, loaded.error))
      out.push(`refused with "${loaded.error}", not ${shown(c.refused)}`);
  } else if ("error" in loaded) return [`refused: ${loaded.error}`];
  if (c.opens !== null) {
    const opened = openedAs(game, c.id);
    if (opened !== c.opens) out.push(`opens as ${opened}, not ${c.opens}`);
  }
  if (Object.keys(c.holds).length > 0) {
    const [params, desc] = splitId(c.id);
    const read = readBoard(game, game.decodeParams(params), desc);
    if (!read.ok) out.push(`reads as no board: ${read.error}`);
    else out.push(...holdsDiffers(c.holds, read.value));
  }
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
  let p: ReturnType<AnyGame["decodeParams"]>;
  try {
    p = game.decodeParams(c.read);
  } catch (e) {
    // A string the codec cannot read is refused by its sentence.
    if (!(e instanceof UnreadableParams) || c.refused === null || c.refused === false)
      throw e;
    return saysAs(c.refused, e.message)
      ? []
      : [`unreadable with "${e.message}", not ${shown(c.refused)}`];
  }
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

/** How many of `ops` are `<op> <color>`, by color, fill or outline, the
 * color a role or a slot of `palette` holding the collection's color of that
 * name. */
function drawn(ops: readonly DrawOp[], key: string, palette: readonly Color[]): number {
  const [op, name] = key.split(" ");
  const named = NAMED[name];
  const slots = new Set(
    name in COLORS
      ? [COLORS[name]]
      : palette.flatMap((c, i) =>
          named !== undefined && sameColor(c, named) ? [i] : [],
        ),
  );
  return ops.filter(
    (o) =>
      o.op === op &&
      (name === "any" ||
        ("color" in o && slots.has(o.color)) ||
        ("fill" in o && slots.has(o.fill)) ||
        ("outline" in o && slots.has(o.outline))),
  ).length;
}

const sameColor = (a: Color, b: Color): boolean => a.every((v, i) => v === b[i]);

/** The text drawn at the center of each unfilled circle, one per center,
 * sorted; "none" where no text is. */
function circledTexts(ops: readonly DrawOp[]): string[] {
  const centers = new Set<string>();
  for (const o of ops)
    if (o.op === "circle" && o.fill === -1) centers.add(`${o.cx},${o.cy}`);
  return [...centers]
    .map((c) => {
      const text = ops.find((o) => o.op === "text" && `${o.x},${o.y}` === c);
      return text?.op === "text" ? text.text : "none";
    })
    .sort();
}

/** What of a position case the game does not do. */
export function checkPosition(game: AnyGame, c: PositionCase): string[] {
  const loaded = load(game, c.id);
  if ("error" in loaded) return [`refused: ${loaded.error}`];
  let state = loaded.state;
  let before = state;
  const moves = [...c.moves];
  for (const m of c.moves) {
    before = state;
    state = game.executeMove(state, m);
  }
  const brought = ((): string[] => {
    if (c.brings === undefined) return [];
    if (game.rulesOut === undefined) return ["declares nothing a placement rules out"];
    if (c.moves.length === 0) return ["has no move to bring anything"];
    const got = JSON.stringify(game.rulesOut.bring(before, state));
    return got === JSON.stringify(c.brings)
      ? []
      : [`brings ${got}, not ${JSON.stringify(c.brings)}`];
  })();
  if (c.solve) {
    const solved = game.solve(state, state);
    if (!solved.ok) return [`no answer to play: ${solved.error}`];
    state = game.executeMove(state, solved.move);
    moves.push(solved.move);
  }
  const out: string[] = [...brought];
  const was = (what: string, got: unknown, want: unknown) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      out.push(`${what} ${JSON.stringify(got)}, not ${JSON.stringify(want)}`);
  };
  if (c.status !== null) was("status", game.status(state), c.status);
  if (c.text !== undefined) was("text", game.textFormat?.(state) ?? null, c.text);
  if (c.statusbar !== undefined)
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
      for (const want of c.steps) {
        const step = plan.steps[want.step - 1];
        const differs =
          step === undefined ? "is not in the plan" : stepDiffers(want, step);
        if (differs !== null) out.push(`step ${want.step} ${differs}`);
      }
  }
  out.push(...holdsDiffers(c.holds, state));
  const { circled } = c;
  if (c.mistakes !== null || Object.keys(c.draws).length > 0 || circled !== null) {
    const frame = renderScenario({
      game,
      id: c.id,
      moves,
      preferences: c.preferences,
      showMistakes: c.mistakes !== null,
      showHint: c.showHint || circled !== null,
    });
    if (circled !== null)
      was("circles", circledTexts(frame.recording.ops), [...circled].sort());
    if (c.mistakes !== null) was("mistakes", frame.mistakeCount, c.mistakes);
    for (const [key, want] of Object.entries(c.draws)) {
      const n = drawn(frame.recording.ops, key, frame.palette);
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
export function describeGameCases(
  game: AnyGame,
  cases: GameCases,
  compiled: Readonly<Record<string, unknown>> = {},
): void {
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
  const { absent } = cases.tiers;
  if (absent.length > 0)
    describeAbsentTiers(
      game,
      absent.map((a) => a.cell),
      { everyAnswer: absent.flatMap((a) => (a.every === null ? [] : [a.cell])) },
    );
  const proven = absent.filter((a) => a.every !== null);
  if (proven.length > 0)
    describe(`${game.id}: a size with no board at a tier, over every answer`, () => {
      for (const a of proven)
        it(`${cases.path}:${a.line} ${a.cell}`, () => {
          const got = everyAnswer(game, compiled, a.cell);
          expect(got.needing, "boards that need the tier").toEqual([]);
          expect(got.answers, "answers tried").toBeGreaterThan(0);
          const unfinished = a.every?.unfinished ?? null;
          if (unfinished !== null)
            expect(got.unfinished, "answers no lower tier finishes").toBe(unfinished);
        });
    });
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
  each(
    "ids",
    cases.ids,
    (c) => c.id,
    (g, c) => checkId(g, c, compiled),
  );
  each("params", cases.params, (c) => c.read, checkParams);
  each("positions", cases.positions, (c) => c.id, checkPosition);
  each("input", cases.input, (c) => c.id, checkInput);
  each(
    "wordings",
    cases.wordings,
    (c) => `${c.technique} ${c.wording}`,
    (_game, c) => checkWording(compiled, c),
  );
}
