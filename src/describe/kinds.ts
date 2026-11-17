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
      /** An expression a term reads, or one the engine supplies a leg. */
      terms: Record<string, string | { supplied: string }>;
      /** The marks, or `$name` where the game gives them whole. */
      marks: Record<string, string> | string;
      look?: string;
      /** Absent where the game's walk says the move (a strike's "must go"). */
      move?: string;
      /** What a later leg of the firing (`shown: legs`) says its move is for. */
      again?: string;
      /** What a later leg says as its move, where it differs from `move`. */
      later?: string;
      wordings?: readonly { when?: string; long?: string; look: string }[];
      arms?: Record<
        string,
        {
          when: string;
          look?: string;
          move?: string;
          later?: string;
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
  // (`zero`) is said to take none of its `items`. A later leg of a firing
  // walked in legs says the move again (`restLater`: "can't be one either"
  // where "too" would not read) for this `unit`.
  "count.met": {
    params: ["group", "set", "unit", "has", "items", "restWord"],
    defaults: {
      rest: null,
      need: "need($set)",
      restMove: "place(c, $rest)",
      restLater: "$restWord too",
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
        later: "{ring: the ringed {noun} | each ringed {noun}} $restLater",
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
  // counted, not bound, as `count.both`'s are. `fillLater` as `restLater`.
  "count.exact": {
    params: ["group", "set", "unit", "items", "fillWord"],
    defaults: {
      fill: null,
      need: "need($set)",
      fillMove: "place(c, $fill)",
      fillLater: "$fillWord too",
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
        later: "{ring: the ringed {noun} | each ringed {noun}} $fillLater",
      },
    },
    plant: {
      for: "$group, n = $need, m = |open($set)| where n > 0 and n >= m - 1",
      conclude: "forall c in open($set): $fillMove",
    },
  },
  // `count.both` read of one value by its candidates: a group owing `need`
  // more of `value` has it struck from its other squares where it owes none,
  // and placed in them where they are as many as it owes, `open` saying
  // which squares may still take it (by default, any not decided that has it
  // among its candidates). For a game whose squares hold several values,
  // each counted (Magnets' poles in a line, Undead's monsters on the board),
  // so a set's undecided squares are not the value's. It carries no words:
  // each game's walk speaks its two readings.
  "count.value": {
    params: ["group", "set", "value", "need"],
    defaults: { open: "not known(c) and $value in cand(c)" },
    technique: {
      for: "$group, n = $need, m = count(c in $set where $open) where (n <= 0 or n >= m) and (n != 0 or m > 0)",
      conclude:
        "n >= 0 and n <= m and (n = 0 implies (forall c in $set where $open: strike(c, $value))) and (n = 0 or (forall c in $set where $open: place(c, $value)))",
    },
    plant: {
      for: "$group, n = $need, m = count(c in $set where $open) where (n <= 1 or n >= m) and (n != 0 or m > 0)",
      conclude:
        "(n <= 1 implies (forall c in $set where $open: strike(c, $value))) and (n <= 1 or (forall c in $set where $open: place(c, $value)))",
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
      restLater: "$restWord too",
      fillLater: "$fillWord too",
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
            later: "{ring: the ringed {noun} | each ringed {noun}} $restLater",
            wordings: [
              { when: "$zero", look: "{$mark: $unit} takes no $items" },
              { look: "{$mark: $unit} already has $has" },
            ],
          },
          exact: {
            when: "n > 0",
            look: "{$mark: $unit} needs {if placed: {n} more | {n}} $items and has only {n} $slots",
            move: "{ring: the ringed {noun} | each ringed {noun}} $fillWord",
            later: "{ring: the ringed {noun} | each ringed {noun}} $fillLater",
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
  // A group that, without one of its open squares, would have room for too
  // few of what it still needs has that square hold the value. Room is the
  // game's: `fits(S, n)`, whether n fit in the open squares S, and `most(S,
  // n)`, the most up to n that do, read only where the room is too little.
  // With too little room whatever is left out, the marks are inconsistent.
  // `need`, `mark`, `marks`, `items` and `fillWord` as the count kinds'; a
  // game whose room is short beside squares it outlines says so (`given`,
  // which reads the marks), as the look ends ", given {outline}".
  "room.needed": {
    params: ["group", "set", "unit", "items", "fillWord"],
    defaults: {
      fill: null,
      need: "need($set)",
      fillMove: "place(c, $fill)",
      given: "false",
      mark: "stripes",
      marks: { stripes: "$set", reads: "$set" },
    },
    technique: {
      for: "$group, n = $need, O = open($set) where n > 0, c in O, E = O - {c} where not fits(E, n), room = most(E, n)",
      conclude: "$fillMove",
      says: {
        terms: { n: "n", room: "room", none: "room = 0" },
        marks: "$marks",
        move: "{ring: that {noun}} $fillWord",
        wordings: [
          {
            when: "$given",
            long: "a group short of room beside squares it outlines names three things: the square left out, the group, and the squares that close its room",
            look: "{$mark: $unit} needs {if placed: {n} more | {n}} $items and without {ring} has room for {if none: none | only {room}}, given {outline}",
          },
          {
            look: "{$mark: $unit} needs {if placed: {n} more | {n}} $items and without {ring} has room for {if none: none | only {room}}",
          },
        ],
      },
    },
    // Room for one more than is needed read as too little.
    plant: {
      for: "$group, n = $need, O = open($set) where n > 0, c in O, E = O - {c} where not fits(E, n + 1), room = most(E, n)",
    },
  },
  // A piece tried in an open square `x` rules out the open squares `ruled`
  // names (R, read of `x`); where that leaves a group near it (`near`: one
  // holding `x` or a square of R) room for too few of what it still needs,
  // `x` is the rest. Room is the game's `fits` and `most`, read with `x`
  // holding the piece, as the count kinds' `need` is the game's. The look
  // says what the piece on {ring} (`tried`) would do to the squares it rules
  // out (`act`: "touch"), which are outlined, and what that leaves; or, where
  // `cause` holds, that it would complete a group of its own (`causeWords`).
  // A group with nothing left to hold its piece (`a`) is said so.
  "room.crowded": {
    params: ["group", "set", "unit", "items", "ruled", "tried", "act", "a", "restWord"],
    defaults: {
      fill: null,
      rest: null,
      need: "need($set)",
      near: "x in $set or (exists p in R: p in $set)",
      cause: "false",
      causeWords: null,
      mark: "stripes",
      marks: { stripes: "$set", outline: "Q", reads: "Q + $set" },
    },
    technique: {
      for: "x in cells where not known(x), R = $ruled, $group where $near, S = $set, n = $need - count(c in {x} where c in S), E = {c in open(S) where c != x and c not in R} where n > 0 and (with place(x, $fill): not fits(E, n)), room = (with place(x, $fill): most(E, n)), Q = {c in open(S) where c in R}",
      conclude: "place(x, $rest)",
      says: {
        terms: { n: "n", room: "room", mine: "x in S", exhausted: "|E| = 0" },
        marks: "$marks",
        move: "it $restWord",
        wordings: [
          {
            when: "$cause",
            look: "$tried {ring} would complete its $causeWords, leaving {$mark: $unit} {if exhausted: {if mine: nowhere for {n} more $items | no open {noun}} | room for {if mine: {room} more | {room}}, not {n}}",
          },
          {
            when: "exhausted and mine",
            look: "$tried {ring} would $act the rest of {$mark: $unit}, which would still need {n} $items",
          },
          {
            when: "exhausted",
            look: "$tried {ring} would $act every open {noun} of {$mark: $unit}, leaving it no room for $a",
          },
          {
            look: "$tried {ring} would $act {outline}, leaving {$mark: $unit} room for {if mine: {room} more | {room}}, not {n}",
          },
        ],
      },
    },
    // Room for one more than is needed read as too little.
    plant: {
      for: "x in cells where not known(x), R = $ruled, $group where $near, S = $set, n = $need - count(c in {x} where c in S), E = {c in open(S) where c != x and c not in R} where n > 0 and (with place(x, $fill): not fits(E, n + 1)), room = (with place(x, $fill): most(E, n)), Q = {c in open(S) where c in R}",
    },
  },
  // Two counts over sets that overlap: A holds at least `least` of the value
  // in its open squares `openA`, B at most `most` in `openB`. The squares
  // they share hold at most `most`, so A's own squares, RA, hold at least the
  // difference, `by`. Where that is all of them, they hold the value, the
  // shared squares hold all of B's, and B's own squares, RB, hold the rest.
  // More than all of them makes the marks inconsistent. The game's `group`
  // binds the two. Its look says what each needs, which only the game can
  // name; the kind says the move, where RA lies (`outsideB`: "outside the
  // 3's block") and RB (`outsideA`), as the count kinds say theirs. Where A
  // has no squares of its own (`same`), its look says they all lie in B's.
  "count.compare": {
    params: ["group", "openA", "openB", "least", "most"],
    defaults: {
      fill: null,
      rest: null,
      fillMove: "place(c, $fill)",
      restMove: "place(c, $rest)",
      // The words, needed only where the game gives its look.
      fillWord: null,
      restWord: null,
      outsideA: null,
      outsideB: null,
    },
    // `by` is read before either set is made, and B's own squares only where
    // A has none: made for every pair on every pass, they doubled the time
    // of Mosaic's Unreasonable deals.
    technique: {
      for: "$group, by = $least - ($most) where by >= 0, RA = $openA - $openB where by >= |RA| and (|RA| > 0 or |$openB - $openA| > 0)",
      conclude:
        "by = |RA| and (forall c in RA: $fillMove) and (forall c in $openB - $openA: $restMove)",
    },
    saysBeneath: {
      terms: { by: "by" },
      arms: {
        more: {
          when: "|RA| > 0",
          move: "{ring 1: the ringed {noun} | each ringed {noun}} $outsideB $fillWord{has 2: , and {ring 2: the ringed {noun} | each ringed {noun}} $outsideA $restWord}",
          long: "a step that fills one count's squares and clears the other's says where each of the two lies, so the player can tell which ringed square takes which",
        },
        // The look has said that A's squares all lie in B's.
        same: {
          when: "|RA| = 0",
          move: "{ring 2: the ringed {noun} | each ringed {noun}} $restWord",
        },
      },
    },
    // One square of A's own more than the difference, all read as the value.
    plant: {
      for: "$group, RA = $openA - $openB, RB = $openB - $openA, by = $least - ($most) where by >= |RA| - 1 and |RA| + |RB| > 0",
      conclude: "(forall c in RA: $fillMove) and (forall c in RB: $restMove)",
    },
  },
  // A thing down to one option takes it. One with none left makes the marks
  // inconsistent. By default the thing is a square `c` and its options its
  // values; a game names another (`group`: Crossing's run, with the numbers
  // that still fit it as `options`), and `move` takes the one option left of
  // them, bound as `U`. `square` says which are read, where a game leaves
  // some out (Ascent's walls and arrows, which hold no number).
  "one.cell": {
    params: [],
    defaults: {
      group: "c in cells",
      square: "not known(c)",
      options: "cand(c)",
      move: "place(c, first(U))",
    },
    technique: {
      for: "$group where $square, U = $options where |U| < 2",
      conclude: "|U| = 1 and $move",
    },
    plant: {
      for: "$group where $square, U = $options where |U| < 3",
      conclude: "|U| >= 1 and $move",
    },
  },
  // A value a unit still owes with one open square of the unit left that may
  // hold it goes there. One with none left makes the marks inconsistent.
  // `group` binds the unit and the value, `value`, leaving out a value the
  // unit already holds; `set` is the unit's squares. `may` says whether the
  // square `c` of the set may still take it, where that is more than its
  // candidates (Signpost's arrow into a square, Dominosa's spot), and `move`
  // gives it, where a game does so by striking the others (Rome, whose solver
  // places only a square down to one value).
  "one.place": {
    params: ["group", "set"],
    defaults: {
      value: null,
      may: "not known(c) and $value in cand(c)",
      move: "place(c, $value)",
    },
    technique: {
      for: "$group, k = count(c in $set where $may) where k < 2",
      conclude: "k = 1 and (forall c in $set where $may: $move)",
    },
    plant: {
      for: "$group, k = count(c in $set where $may) where k < 3",
      conclude: "forall c in $set where $may: $move",
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
  // No two squares holding `fill` touch: every square `adj` names round one
  // holding it is the rest, and one holding it too makes the marks
  // inconsistent. `square` says which of them are open (`not known(c)`, or a
  // game's own: Tents' trees). The sentence names what may not touch (`piece`,
  // `pieces` where several are outlined) and how (`how`: ", even diagonally"
  // where `adj` is `adj8`), and the move as the count kinds do.
  "peer.touch": {
    params: ["adj", "piece", "pieces", "restWord"],
    defaults: {
      fill: null,
      rest: null,
      square: "not known(c)",
      restMove: "place(c, $rest)",
      how: "",
    },
    technique: {
      for: "t in cells where value(t) = $fill",
      conclude:
        "(forall c in $adj(t): value(c) != $fill) and (forall c in $adj(t) where $square: $restMove)",
      says: {
        terms: { t: "t" },
        marks: { outline: "{t}", reads: "{t} + $adj(t)" },
        look: "no $piece may touch {outline: the outlined $piece | the outlined $pieces}$how",
        move: "{ring: the ringed {noun} | each ringed {noun}} $restWord",
      },
    },
    // The rest reaching one square further: a neighbor's neighbor.
    plant: {
      conclude:
        "forall q in $adj(t): (forall c in $adj(q) where c != t and $square: $restMove)",
    },
  },
  // A value of one end of a pair that no value at the other end can stand
  // beside is struck. `rel` reads the struck end's value `d` and the partner's
  // `u`. An end left with no value makes the marks inconsistent. The sentence
  // names what joins the two (`link`), the struck end as the game marks it
  // (`cell`), what the partner has open (`none`) and the relation in words
  // (`fits`, before the struck value); the game's walk says the strike. A
  // game that words each end itself (Unequal's bound on a sign's other end)
  // gives its own `says` and none of these words.
  "rel.support": {
    params: ["group", "end", "partner", "rel", "marks"],
    defaults: { link: null, cell: null, none: null, fits: null },
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
  // A value no filling of a set from its candidates that keeps the rule
  // puts in a square of it is struck there: each square's values checked
  // against every way the whole set could be filled. `group` binds the set,
  // `set` names it, and `fits` is the rule a filling `f` of it keeps; `each`
  // is the squares read in one firing, the whole set unless the game reads a
  // square a firing (Towers'). A square left with no value makes the marks
  // inconsistent. `fits` sits in the filling's `where`, beside `f(c) = d`, so
  // the compiler prunes a part-filling by it.
  "fill.support": {
    params: ["group", "set", "fits"],
    defaults: { each: "$set" },
    technique: {
      for: "$group",
      conclude:
        "forall c in $each, d in cand(c) where not (exists fill f of $set from cand where f(c) = d and ($fits): true): strike(c, d)",
    },
    // A value some filling does put there read as struck.
    plant: {
      conclude:
        "forall c in $each, d in cand(c) where (exists fill f of $set from cand where f(c) = d and ($fits): true): strike(c, d)",
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
  // The region kinds read a board divided by walls on its edges, a wall
  // `wall` and none `gap`, whose regions are the groups the game's `joined`
  // (its edges known to be no wall) runs `through`.
  //
  // Two groups side by side across an undecided edge that `apart` says can
  // never be one region (it reads the groups `A` and `B`) have a wall on every
  // edge between them. The look, why they are apart, is the game's. `more`
  // binds what else the game reads of the two, after them (", d = …").
  "region.apart": {
    params: ["apart"],
    defaults: { wall: 1, wallNoun: "wall", more: "" },
    technique: {
      for: "O = joined, e in edges where not known(e), A = through(end1(e), O), b = end2(e) where b not in A, B = through(b, O) where $apart$more",
      conclude: "forall x in A, y in adj4(x) where y in B: place(edge(x, y), $wall)",
    },
    saysBeneath: {
      terms: { anchor: "A" },
      move: "{ring: the edge between them | every edge between them} must be a $wallNoun",
    },
    // Any two groups side by side read as apart.
    plant: {
      for: "O = joined, e in edges where not known(e), A = through(end1(e), O), b = end2(e) where b not in A, B = through(b, O)",
    },
  },
  // A group short of `size` squares grows across an edge still to decide.
  // Where every such edge leads into one other group, it joins that group:
  // every edge between them is open. With no edge to grow across, or past
  // `size`, the marks are inconsistent. A lone square with one way out is
  // named as the game names a square (`lone`). Its counts are said as
  // numerals: a game's values may be said as letters (Separate's).
  "region.grow": {
    params: ["size"],
    defaults: {
      wall: 1,
      gap: 2,
      wallNoun: "wall",
      wallNouns: "walls",
      lone: "this square",
    },
    technique: {
      for: "O = joined, c in cells, A = through(c, O) where c = nth(A, 0) and |A| != $size, S = set(s over x in A, s in adj4(x) where not known(edge(x, s)))",
      conclude:
        "|A| < $size and |S| > 0 and (forall B = through(nth(S, 0), O): (forall s in S: s in B) implies forall x in A, y in adj4(x) where y in B: place(edge(x, y), $gap))",
      says: {
        terms: {
          anchor: "A",
          have: "|A|",
          size: "$size",
          ways: "|S|",
          // Whether the firing sets several edges, which the engine says.
          multi: { supplied: "several" },
        },
        marks: { stripes: "A", reads: "A" },
        wordings: [
          {
            when: "have = 1 and ways = 1",
            look: "{stripes: $lone} is walled in on every side but one",
          },
          {
            look: "{stripes: this region} has {numeral have} of its {numeral size} squares and {if multi: only one region left to grow into | just one way left to grow}",
          },
        ],
        again: "{stripes: the same striped region}",
        move: "{if multi: {ring: these edges} can't be $wallNouns | {ring: this edge} can't be a $wallNoun}",
      },
    },
    // A group read as joining the first group it can grow into, whatever the
    // others.
    plant: {
      conclude:
        "|A| < $size and |S| > 0 and (forall B = through(nth(S, 0), O): forall x in A, y in adj4(x) where y in B: place(edge(x, y), $gap))",
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

/** `says` and its arms with each wording whose `when` is `false` left out. */
function dropNever(says: unknown): void {
  if (!isRecord(says)) return;
  const w = says["wordings"];
  if (Array.isArray(w))
    says["wordings"] = w.filter((x) => !(isRecord(x) && x["when"] === "false"));
  if (isRecord(says["arms"]))
    for (const arm of Object.values(says["arms"])) dropNever(arm);
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
  // A clause of the kind's sentence reading words the game did not give is
  // left out, the game's own `says` wording the step (Unequal's sign).
  const unsaid = (v: unknown): boolean =>
    [...JSON.stringify(v).matchAll(/\$(\w+)/g)].some((m) => takes.includes(m[1]));
  if (t.says !== undefined && gameSays !== undefined)
    t.says = Object.fromEntries(
      Object.entries(t.says).filter(([k, v]) => k === "marks" || !unsaid(v)),
    ) as typeof t.says;
  // The game's `says` beside the placement is laid over the kind's own (Range
  // shows its touch a square at a time), or over its frame.
  // A frame is laid only under a game's words: a game whose hint narrates
  // the firing itself (Mines') gives none, and so takes no words.
  const beneath =
    t.says !== undefined
      ? { ...t.says, terms: { ...t.says.terms, ...(terms as Record<string, unknown>) } }
      : kind.saysBeneath === undefined || gameSays === undefined
        ? undefined
        : fill(kind.saysBeneath, args);
  const says = beneath === undefined ? gameSays : laidOver(beneath, gameSays ?? {});
  // A wording whose condition a game's parameters left `false` is never said,
  // and may name marks or words that game does not have (Star Battle's
  // `given`, a cause only its starved trial names).
  if (says !== undefined) dropNever(says);
  const left = new Set(
    [...JSON.stringify(says ?? {}).matchAll(/\$(\w+)/g)]
      .map((m) => m[1])
      .filter((p) => takes.includes(p)),
  );
  if (left.size > 0) throw refuse([...left]);
  const { says: _s, ...statement } = t;
  return {
    id: as,
    ...placing,
    ...statement,
    ...(says === undefined ? {} : { says }),
    plant: fill(kind.plant, args),
  };
}
