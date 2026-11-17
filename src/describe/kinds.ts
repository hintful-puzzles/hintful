/**
 * The kinds of rule whose techniques a game places by naming its nouns
 * (`kind: count.met`, `with: {...}`), where it would otherwise state each
 * technique's formula and words. A loader step, not a library: a kind is
 * expanded into the technique it stands for as the file is read, so the
 * compiler, the soundness check and the hint see a technique stated in the
 * game's own description, and the game's `define`s (`need`, `open`) are the
 * ones the kind reads.
 *
 * Dev/test-only, like the loader that reads it.
 */

import type { TechniquePlant } from "./plants.ts";

/** A kind's technique with `$name` where a game's `with` fills in: a string
 * that is exactly `$name` is replaced by the value, whatever its type, and
 * `$name` inside a longer string by the value's text. The `with` key `terms`
 * is not substituted: its entries are added to the step's `says.terms`. */
export interface Kind {
  /** The parameters a game must give. */
  params: readonly string[];
  technique: {
    on?: string;
    for: string;
    conclude: string;
    /** Absent where the words are the game's own, which it gives as `says`
     * beside the placement. */
    says?: {
      terms: Record<string, string>;
      marks: Record<string, string>;
      look: string;
      move: string;
    };
  };
  /** The defect planted in it, the same under any game's nouns. */
  plant: TechniquePlant;
}

export const KINDS: Readonly<Record<string, Kind>> = {
  // A group holding as many as it should holds no more, so the rest is the
  // other value. One holding more makes the marks inconsistent.
  "count.met": {
    params: ["group", "set", "rest", "unit", "has", "restWord"],
    technique: {
      for: "$group, n = need($set) where n <= 0",
      conclude: "n = 0 and forall c in open($set): place(c, $rest)",
      says: {
        terms: {},
        marks: { stripes: "$set", reads: "$set" },
        look: "{stripes: $unit} has $has",
        move: "{ring} must $restWord",
      },
    },
    plant: {
      for: "$group, n = need($set) where n <= 1",
      conclude: "forall c in open($set): place(c, $rest)",
    },
  },
  // A group with exactly as many open squares as it still needs has them all
  // hold the value. One with fewer makes the marks inconsistent.
  "count.exact": {
    params: ["group", "set", "fill", "unit", "items", "fillWord"],
    technique: {
      for: "$group, n = need($set), O = open($set) where n > 0 and n >= |O|",
      conclude: "n = |O| and forall c in O: place(c, $fill)",
      says: {
        terms: { n: "n" },
        marks: { stripes: "$set", reads: "$set" },
        look: "{stripes: $unit} needs {if placed: {n} more | {n}} $items and has only {n} open {n: square | squares}",
        move: "{ring: the ringed square | each ringed square} must $fillWord",
      },
    },
    plant: {
      for: "$group, n = need($set), O = open($set) where n > 0 and n >= |O| - 1",
      conclude: "forall c in O: place(c, $fill)",
    },
  },
  // A square down to one value holds it. One with none left makes the marks
  // inconsistent.
  "one.cell": {
    params: [],
    technique: {
      for: "c in cells where not known(c) and |cand(c)| < 2",
      conclude: "|cand(c)| = 1 and place(c, first(cand(c)))",
    },
    plant: {
      for: "c in cells where not known(c) and |cand(c)| < 3",
      conclude: "|cand(c)| >= 1 and place(c, first(cand(c)))",
    },
  },
  // A placed value leaves every square `peer` names, a binder that reads the
  // placed square `c` and its value `n` and binds `p`.
  "peer.placed": {
    params: ["peer"],
    technique: {
      on: "place",
      for: "c in cells where known(c), n = value(c), $peer",
      conclude: "strike(p, n)",
    },
    plant: {
      conclude: "strike(p, n + 1)",
    },
  },
  // A value of one end of a pair that no value at the other end can stand
  // beside is struck. `rel` reads the struck end's value `d` and the partner's
  // `u`. An end left with no value makes the marks inconsistent.
  "rel.support": {
    params: ["group", "end", "partner", "rel"],
    technique: {
      for: "$group",
      conclude:
        "forall d in cand($end) where not (exists u in cand($partner): $rel): strike($end, d)",
    },
    plant: {
      conclude:
        "forall d in cand($end) where (exists u in cand($partner): $rel): strike($end, d)",
    },
  },
  // An open edge whose ends the lines already join would close a loop, which
  // is the answer only once nothing else needs it: `elsewhere` says what
  // still does, reading the lines `L`, the edge `e` and the lines' group `G`
  // through it. A line is 1 and an empty edge 2. Closing the last loop is the
  // defect.
  "loop.early": {
    params: ["elsewhere"],
    technique: {
      for: "L = {e in edges where value(e) = 1}, e in edges where not known(e), G = through(end1(e), L) where end2(e) in G and ($elsewhere)",
      conclude: "place(e, 2)",
    },
    plant: {
      for: "L = {e in edges where value(e) = 1}, e in edges where not known(e), G = through(end1(e), L) where end2(e) in G",
    },
  },
  // A square of two values where one would break a rule at once holds the
  // other. `holds` is what must stay true of the group, and `scope` the
  // squares that could break it. A position that breaks it makes the marks
  // inconsistent.
  "fit.flip": {
    params: ["group", "holds", "scope"],
    technique: {
      for: "$group",
      conclude:
        "($holds) and (forall c in $scope where blank(c), a in cand(c) where (with place(c, a): not ($holds)): place(c, 3 - a))",
    },
    plant: {
      conclude:
        "($holds) and (forall c in $scope where blank(c), a in cand(c) where (with place(c, a): $holds): place(c, 3 - a))",
    },
  },
};

export class KindError extends Error {}

/** `v` with each `$name` of `with` filled in. */
function fill(v: unknown, args: Readonly<Record<string, unknown>>): unknown {
  if (typeof v === "string") {
    const whole = /^\$(\w+)$/.exec(v);
    if (whole !== null && whole[1] in args) return args[whole[1]];
    return v.replace(/\$(\w+)/g, (m, name: string) =>
      name in args ? String(args[name]) : m,
    );
  }
  if (Array.isArray(v)) return v.map((x) => fill(x, args));
  if (v === null || typeof v !== "object") return v;
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x, args)]));
}

/** The technique a placed kind stands for: `id`, its placing, the statement
 * with the game's nouns, and the plant that stays with it. */
export function expandKind(
  placed: {
    kind: string;
    as: string;
    with?: Readonly<Record<string, unknown>>;
  } & Record<string, unknown>,
  path: string,
  words: Readonly<Record<string, unknown>> = {},
): Record<string, unknown> {
  const kind = KINDS[placed.kind];
  if (kind === undefined)
    throw new KindError(`${path}: ${placed.as}: no kind ${placed.kind}`);
  const { terms, ...own } = placed.with ?? {};
  const shared = Object.fromEntries(
    Object.entries(words).filter(([p]) => kind.params.includes(p)),
  );
  const args = { ...shared, ...own };
  const missing = kind.params.filter((p) => !(p in args));
  const extra = Object.keys(args).filter((p) => !kind.params.includes(p));
  if (missing.length > 0 || extra.length > 0)
    throw new KindError(
      `${path}: ${placed.as}: ${placed.kind} wants ${kind.params.join(", ")}` +
        `${missing.length > 0 ? `; missing ${missing.join(", ")}` : ""}` +
        `${extra.length > 0 ? `; no ${extra.join(", ")}` : ""}`,
    );
  const { kind: _k, as, with: _w, ...placing } = placed;
  const t = fill(kind.technique, args) as Kind["technique"];
  return {
    id: as,
    ...placing,
    ...t,
    ...(t.says === undefined
      ? {}
      : {
          says: {
            ...t.says,
            terms: {
              ...t.says.terms,
              ...(terms as Record<string, string> | undefined),
            },
          },
        }),
    plant: fill(kind.plant, args),
  };
}
