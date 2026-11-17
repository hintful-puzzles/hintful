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
 * is not substituted: its entries, over the game's `kindWords` terms, are
 * added to the step's `says.terms`. */
export interface Kind {
  /** The parameters a game must give. */
  params: readonly string[];
  /** The parameters a game may give, each with what it is where the game
   * gives none (itself filled from the others); one whose default is `null`
   * is needed only where another default reads it. */
  defaults?: Readonly<Record<string, unknown>>;
  technique: {
    on?: string;
    for: string;
    conclude: string;
    /** Absent where the words are the game's own, which it gives as `says`
     * beside the placement. */
    says?: {
      terms: Record<string, string>;
      /** The marks, or `$name` where the game gives them whole. */
      marks: Record<string, string> | string;
      look?: string;
      /** Absent where the game's walk says the move (a strike's "must go"). */
      move?: string;
      /** What a later leg of the firing (`shown: legs`) says its move is for. */
      again?: string;
      wordings?: readonly { when?: string; look: string }[];
      arms?: Record<
        string,
        {
          when: string;
          look?: string;
          move?: string;
          wordings?: readonly { when?: string; look: string }[];
        }
      >;
    };
  };
  /** What every game's `says` beside the placement shares, which the game's
   * own words are laid over (an object merged key by key, anything else
   * replaced): for a kind whose sentence is the game's but whose frame is
   * the kind's. */
  saysBeneath?: Record<string, unknown>;
  /** The defect planted in it, the same under any game's nouns. */
  plant: TechniquePlant;
}

export const KINDS: Readonly<Record<string, Kind>> = {
  // A group holding as many as it should holds no more, so the rest is the
  // other value. One holding more makes the marks inconsistent. `need` is
  // how many the group still wants, the game's `need` of the set unless its
  // number is the group's own (a line's clue); `restMove` sets an open
  // square `c` to the rest, where the game's squares are struck, not placed.
  // The sentence names the group (`unit`, drawn as `mark`), what it holds
  // (`has`), and the move (`restWord`); a group whose number may be 0
  // (`zero`) is said to take none of its `items`.
  "count.met": {
    params: ["group", "set", "unit", "has", "items", "restWord"],
    defaults: {
      rest: null,
      need: "need($set)",
      restMove: "place(c, $rest)",
      zero: "false",
      mark: "stripes",
      marks: { stripes: "$set", reads: "$set" },
    },
    technique: {
      for: "$group, n = $need where n <= 0",
      conclude: "n = 0 and forall c in open($set): $restMove",
      says: {
        terms: { n: "n" },
        marks: "$marks",
        again: "{$mark: $unit}",
        move: "{ring: the ringed {noun} | each ringed {noun}} $restWord",
        wordings: [
          { when: "$zero", look: "{$mark: $unit} takes no $items" },
          { look: "{$mark: $unit} already has $has" },
        ],
      },
    },
    plant: {
      for: "$group, n = $need where n <= 1",
      conclude: "forall c in open($set): $restMove",
    },
  },
  // A group with exactly as many open squares as it still needs has them all
  // hold the value. One with fewer makes the marks inconsistent. `need`,
  // `mark` and `marks` as `count.met`'s; `fillMove` sets an open square `c`
  // to the value, and `slots` names the open squares. The game's term
  // `placed` says whether the group holds some already. The open squares are
  // counted, not bound, as `count.both`'s are.
  "count.exact": {
    params: ["group", "set", "unit", "items", "fillWord"],
    defaults: {
      fill: null,
      need: "need($set)",
      fillMove: "place(c, $fill)",
      slots: "open {n: square | squares}",
      mark: "stripes",
      marks: { stripes: "$set", reads: "$set" },
    },
    technique: {
      for: "$group, n = $need, m = |open($set)| where n > 0 and n >= m",
      conclude: "n = m and forall c in open($set): $fillMove",
      says: {
        terms: { n: "n" },
        marks: "$marks",
        again: "{$mark: $unit}",
        look: "{$mark: $unit} needs {if placed: {n} more | {n}} $items and has only {n} $slots",
        move: "{ring: the ringed {noun} | each ringed {noun}} $fillWord",
      },
    },
    plant: {
      for: "$group, n = $need, m = |open($set)| where n > 0 and n >= m - 1",
      conclude: "forall c in open($set): $fillMove",
    },
  },
  // `count.met` and `count.exact` read as one technique, each group's both
  // readings before the next group's, as a game whose order rests on it
  // states them (Mosaic, whose generator hides the numbers its deduction
  // never read). The arms are the two kinds' sentences; the parameters are
  // both kinds'.
  "count.both": {
    params: ["group", "set", "unit", "has", "items", "restWord", "fillWord"],
    defaults: {
      rest: null,
      fill: null,
      need: "need($set)",
      restMove: "place(c, $rest)",
      fillMove: "place(c, $fill)",
      zero: "false",
      slots: "open {n: square | squares}",
      mark: "stripes",
      marks: { stripes: "$set", reads: "$set" },
    },
    // The open squares are counted, and walked only by the conclusion that
    // decides them: bound as a set, they are gathered for every group on
    // every pass, which made Mosaic's Easy deals 1.4 times as slow.
    technique: {
      for: "$group, n = $need, m = |open($set)| where (n <= 0 or n >= m) and (n != 0 or m > 0)",
      conclude:
        "n >= 0 and n <= m and (n = 0 implies (forall c in open($set): $restMove)) and (n = 0 or (forall c in open($set): $fillMove))",
      says: {
        terms: { n: "n" },
        marks: "$marks",
        again: "{$mark: $unit}",
        arms: {
          met: {
            when: "n = 0",
            move: "{ring: the ringed {noun} | each ringed {noun}} $restWord",
            wordings: [
              { when: "$zero", look: "{$mark: $unit} takes no $items" },
              { look: "{$mark: $unit} already has $has" },
            ],
          },
          exact: {
            when: "n > 0",
            look: "{$mark: $unit} needs {if placed: {n} more | {n}} $items and has only {n} $slots",
            move: "{ring: the ringed {noun} | each ringed {noun}} $fillWord",
          },
        },
      },
    },
    plant: {
      for: "$group, n = $need, m = |open($set)| where (n <= 1 or n >= m) and (n != 0 or m > 0)",
      conclude:
        "(n <= 1 implies (forall c in open($set): $restMove)) and (n <= 1 or (forall c in open($set): $fillMove))",
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
  // `u`. An end left with no value makes the marks inconsistent. The sentence
  // names what joins the two (`link`), the struck end as the game marks it
  // (`cell`), what the partner has open (`none`) and the relation in words
  // (`fits`, before the struck value); the game's walk says the strike.
  "rel.support": {
    params: ["group", "end", "partner", "rel", "marks", "link", "cell", "none", "fits"],
    technique: {
      for: "$group",
      conclude:
        "forall d in cand($end) where not (exists u in cand($partner): $rel): strike($end, d)",
      says: {
        terms: { partner: "$partner" },
        marks: "$marks",
        look: "$link joins $cell to {outline partner: its neighbor} with $none $fits {struckOr}",
      },
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
  // defect. The sentence names the line the edge would close and what the
  // loop would leave out: other lines, or where `off` holds, `offWords`;
  // `line` is the mark reference that draws the line (`outline`, or a sort's).
  // The ring is named an edge outright: a game's own noun for it may be its
  // square's (Pearl's).
  "loop.early": {
    params: ["elsewhere", "marks", "line", "off", "offWords"],
    technique: {
      for: "L = {e in edges where value(e) = 1}, e in edges where not known(e), G = through(end1(e), L) where end2(e) in G and ($elsewhere)",
      conclude: "place(e, 2)",
      says: {
        terms: {},
        marks: "$marks",
        move: "it can't be a line",
        wordings: [
          {
            when: "$off",
            look: "{ring: this edge | these edges} would close {$line: the outlined line} into a loop that $offWords",
          },
          {
            look: "{ring: this edge | these edges} would close {$line: the outlined line} into a loop that leaves other lines out",
          },
        ],
      },
    },
    plant: {
      for: "L = {e in edges where value(e) = 1}, e in edges where not known(e), G = through(end1(e), L) where end2(e) in G",
    },
  },
  // A square of two values where one would break a rule at once holds the
  // other. `holds` is what must stay true of the group, and `scope` the
  // squares that could break it. A position that breaks it makes the marks
  // inconsistent. Its sentence says, square by square, how the tried value
  // `a` breaks the rule, which is the game's; the kind says the move, that
  // the square `flipCell` must be the other value (`flipped`), reading the
  // game's `flipTerms` of the leg.
  "fit.flip": {
    params: ["group", "holds", "scope", "flipTerms", "flipCell", "flipped"],
    technique: {
      for: "$group",
      conclude:
        "($holds) and (forall c in $scope where blank(c), a in cand(c) where (with place(c, a): not ($holds)): place(c, 3 - a))",
    },
    saysBeneath: {
      shown: "legs",
      fact: { terms: "$flipTerms", move: "$flipCell must be $flipped" },
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

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** `top` laid over `under`: objects merged key by key, anything else `top`'s. */
function laidOver(under: unknown, top: unknown): unknown {
  if (!isRecord(under) || !isRecord(top)) return top;
  const out: Record<string, unknown> = { ...under };
  for (const [k, v] of Object.entries(top))
    out[k] = k in under ? laidOver(under[k], v) : v;
  return out;
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
  const { terms: ownTerms, ...own } = placed.with ?? {};
  const terms = {
    ...(words["terms"] as object | undefined),
    ...(ownTerms as object | undefined),
  };
  const defaults = kind.defaults ?? {};
  const takes = [...kind.params, ...Object.keys(defaults)];
  const shared = Object.fromEntries(
    Object.entries(words).filter(([p]) => takes.includes(p)),
  );
  const args: Record<string, unknown> = { ...shared, ...own };
  const missing = kind.params.filter((p) => !(p in args));
  const extra = Object.keys(args).filter((p) => !takes.includes(p));
  const refuse = (missing: readonly string[]): KindError =>
    new KindError(
      `${path}: ${placed.as}: ${placed.kind} wants ${kind.params.join(", ")}` +
        `${missing.length > 0 ? `; missing ${missing.join(", ")}` : ""}` +
        `${extra.length > 0 ? `; no ${extra.join(", ")}` : ""}`,
    );
  if (missing.length > 0 || extra.length > 0) throw refuse(missing);
  // A default reads the game's parameters, never another default's.
  const given = { ...args };
  for (const [p, d] of Object.entries(defaults))
    if (!(p in args) && d !== null) args[p] = fill(d, given);
  const unfilled = Object.keys(defaults).filter(
    (p) => !(p in args) && JSON.stringify(Object.values(args)).includes(`$${p}`),
  );
  if (unfilled.length > 0) throw refuse(unfilled);
  const { kind: _k, as, with: _w, says: gameSays, ...placing } = placed;
  const t = fill(kind.technique, args) as Kind["technique"];
  const says =
    kind.saysBeneath === undefined
      ? gameSays
      : laidOver(fill(kind.saysBeneath, args), gameSays ?? {});
  return {
    id: as,
    ...placing,
    ...(says === undefined ? {} : { says }),
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
