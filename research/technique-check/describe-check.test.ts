/**
 * Every technique the app compiles, checked sound against its description's
 * rules (`describe-check.ts`), and a planted defect in each that must come
 * out unsound. Writes `results-describe.txt`.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { globSync } from "tinyglobby";
import { expect, it } from "vitest";
import {
  type DescriptionJson,
  isFormal,
  isLibrary,
  type LibraryJson,
  loadDescription,
  type Technique,
  type VariationJson,
  variationWord,
  withEveryVariation,
  withVariations,
} from "../../src/describe/description.ts";
import { loadDescriptionFile } from "../../src/describe/load.ts";
import {
  CHECK_BUDGET_MS,
  CHECKED_ORDERS,
  checkedAs,
  gameFingerprint,
  heldVerdict,
  isDeadEndKey,
  libraryFingerprint,
  soundnessKey,
} from "../../src/describe/soundness.ts";
import {
  checkTechnique,
  hasAnswer,
  impossibleKinds,
  libraryDescription,
  planted,
  regionCells,
  type Sample,
  sampleAnswers,
  sizeLabel,
  sizings,
  unbuilt,
  type Verdict,
} from "./describe-check.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** The orders each is checked at: 4 is the least a set or fish of two fits. */
const ORDERS = CHECKED_ORDERS;

type Plant = { conclude?: string; for?: string };

/** The library's techniques with a value's multiplicity read as one: each
 * is its statement on a Latin square, so it must come out unsound where a
 * value repeats. */
const ONCE: Record<string, Plant> = {
  // A repeated value's placed copies not counted among its places.
  hiddenSingle: {
    for: "u in units, placed = set(value(c) over c in cells(u) where known(c) and times(value(c)) = 1), d in domain - placed, n = count(c in cells(u) where d in cand(c) and not known(c)) where n <= times(d)",
  },
  // The repeated value's surplus copies not counted.
  set: {
    for: "u in units, V = domain - set(value(c) over c in cells(u) where known(c) and times(value(c)) = 1), open = {c in cells(u) where not known(c)}, R = {d in V where times(d) > 1}, extra = |open| - |V|, T in subsets(V) where |T| = 0 or (2 <= |T| and |T| <= |V| - 2), S = {c in open where not (exists d in T: d in cand(c))} where |S| >= |V| - |T|",
    conclude:
      "(|T| > 0 or (forall c in cells(u): |cand(c)| > 0)) and |S| = |V| - |T| and (forall c in open where c not in S, d in V - T where d in cand(c): strike(c, d))",
  },
  // A repeated value's columns counted as lines, not copies.
  fish: {
    for: "d in domain, k = times(d), X0 = {L in cols where not (exists c in cells(L): value(c) = d) or (k > 1 and count(c in cells(L) where value(c) = d) < k)}, Y0 = range(0, h - 1) - set(y(c) over c in cells where value(c) = d and (k = 1 or count(p in cells(row(c)) where value(p) = d) >= k)), T in subsets(Y0) where |T| = 0 or (2 <= |T| and |T| <= |X0| - 2), X = {L in X0 where not (exists c in cells(L): y(c) in T and d in cand(c) and (k = 1 or not known(c)))} where |X| >= |X0| - |T|",
    conclude:
      "(|T| > 0 or (forall L in cols: exists c in cells(L): d in cand(c))) and |X| = |X0| - |T| and (forall L in X0 - X, c in cells(L) where y(c) in Y0 - T and d in cand(c) and (k = 1 or not known(c)): strike(c, d))",
  },
  // The repeated value weighed as x.
  wing: {
    for: "m in cells where not known(m), x in domain, R = cand(m) - {x} where |R| >= 1 and (forall a in R: exists k in peers(m): not known(k) and cand(k) = {a, x}), k0 in peers(m) where not known(k0) and cand(k0) = {min(a in R), x}, t in peers(k0) where t != m and not known(t) and x in cand(t) and (x not in cand(m) or t in peers(m)) and (forall a in R: exists k in peers(m): not known(k) and cand(k) = {a, x} and k != t and k in peers(t)), E = set(first({k in peers(m) where not known(k) and cand(k) = {a, x} and k != t and k in peers(t)}) over a in R)",
  },
};

/** Planted defects: one condition loosened in each, so each claims a strike
 * or a contradiction the rules do not force. A loosening that only makes a
 * technique strike less, or that drops a condition consistency already
 * gives, is not a defect, and the checker rightly calls it sound. Keyed by
 * technique id, or `<game>.<id>` where two games state one id. */
const PLANTS: Record<string, Plant> = {
  placed: { conclude: "forall p in cells(col(c)): strike(p, value(c))" },
  hiddenSingle: {
    for: "u in units, placed = set(value(c) over c in cells(u) where known(c)), d in domain - placed, n = count(c in cells(u) where d in cand(c)) where n < 3",
    conclude: "n >= 1 and place(first({c in cells(u) where d in cand(c)}), d)",
  },
  single: {
    for: "L in cols, c in cells(L) where not known(c) and |cand(c)| < 3",
    conclude: "place(c, first(cand(c)))",
  },
  set: {
    conclude:
      "(|T| > 0 or (forall c in cells(u): |cand(c)| > 0)) and |S| >= |V| - |T| and (forall c in open where c not in S, d in V - T where d in cand(c): strike(c, d))",
    for: "u in units, V = domain - set(value(c) over c in cells(u) where known(c)), open = {c in cells(u) where not known(c)}, T in subsets(V) where |T| = 0 or (2 <= |T| and |T| <= |V| - 2), S = {c in open where not (exists d in T: d in cand(c))} where |S| >= |V| - |T| - 1",
  },
  fish: {
    for: "d in domain, X0 = {L in cols where not (exists c in cells(L): value(c) = d)}, Y0 = range(0, h - 1) - set(y(c) over c in cells where value(c) = d), T in subsets(Y0) where |T| = 0 or (2 <= |T| and |T| <= |X0| - 2), X = {L in X0 where not (exists c in cells(L): y(c) in T and d in cand(c))} where |X| >= |X0| - |T| - 1",
    conclude:
      "(|T| > 0 or (forall L in cols: exists c in cells(L): d in cand(c))) and (forall L in X0 - X, c in cells(L) where y(c) in Y0 - T and d in cand(c): strike(c, d))",
  },
  wing: {
    for: "m in cells where not known(m), x in domain, R = cand(m) - {x} where |R| >= 1 and (forall a in R: exists k in peers(m): not known(k) and cand(k) = {a, x}), k0 in peers(m) where not known(k0) and cand(k0) = {min(a in R), x}, t in peers(k0) where t != m and not known(t) and x in cand(t) and (forall a in R: exists k in peers(m): not known(k) and cand(k) = {a, x} and k != t and k in peers(t)), E = set(first({k in peers(m) where not known(k) and cand(k) = {a, x} and k != t and k in peers(t)}) over a in R)",
  },
  sign: {
    conclude:
      "forall d in domain: ((forall d2 in cand(small): d <= d2 + 1) implies strike(big, d)) and ((forall d2 in cand(big): d >= d2) implies strike(small, d))",
  },
  adjacent: {
    conclude: "forall d in cand(b) where fits(e, value(a), d): strike(b, d)",
  },
  associativity: {
    conclude:
      "((known(l) and value(l) in cand(r)) implies place(r, value(q))) and ((known(r) and value(r) in cand(l)) implies place(l, value(r)))",
  },
  identity: {
    for: "w0 = first({c in cells where known(c)}) where w0 != none, e in domain where (value(w0) = left(w0) and e = right(w0)) or (value(w0) != left(w0) and e = left(w0))",
  },
  notIdentity: {
    for: "a in domain, o = min(j in domain where known(mul(j, a)) or (known(mul(a, j)) and value(mul(a, j)) != j)) where o != none",
  },
  facing: {
    conclude:
      "forall s in P, c = nth(sight(s), clue(sees, s)): w in cand(c) and place(c, w)",
  },
  bounds: {
    conclude:
      "(near implies (forall h in short(L, far(L, R)): strike(c0, h))) and (near or (forall K = (domain - P) + set(value(c) over c in L where known(c) and not (exists c2 in before(c, L): value(c2) > value(c) + 1)), i in domain, h = w + 1 - i where h in K, j in range(0, v - |K - range(1, h)| - 1): strike(nth(L, j), h)))",
  },
  arrangement: {
    conclude:
      "forall d in cand(c) where not (exists fill f of L from cand where distinct(f(x) over x in L) and f(c) = d: seen(f, L) = v + 1): strike(c, d)",
  },
  cageEasy: {
    for: "r in cage, K = cells(r), D = set(f(x) over fill f of K from cand where apart(f, K) and makes(f, r), x in K where x != first(K))",
  },
  // Keen lets a value repeat in a cage where its cells share no line.
  cage: {
    conclude:
      "forall c in K, d in cand(c) where not (exists fill f of K from cand where distinct(f(x) over x in K) and makes(f, r) and f(c) = d: true): strike(c, d)",
  },
  cageLine: {
    conclude:
      "forall d in domain where (forall fill f of K from cand where apart(f, K) and makes(f, r): exists x in cells(L): x in K and f(x) = d), c in cells(L): strike(c, d)",
  },
  // Mathrax's clues read against the cell's own candidates, not those across
  // the corner.
  clueEasy: {
    conclude:
      "|M| > 0 and (forall d in cand(c) where not (matches(k, d) and (not arithmetic(k) or (exists e in cand(c): makes(k, d, e)))): strike(c, d))",
  },
  clue: {
    conclude:
      "|M| > 0 and (forall d in cand(c) where not (matches(k, d) and (not arithmetic(k) or (exists e in cand(c): makes(k, d, e)))): strike(c, d))",
  },
  // A diagonal pair read as never equal, though its cells share no line.
  clueTricky: {
    conclude:
      "|M| > 0 and (forall d in cand(c) where not (matches(k, d) and (not arithmetic(k) or (exists e in cand(across(k, c)) where e != d: makes(k, d, e)))): strike(c, d))",
  },
  // Solo: a box's value placed with two places left.
  boxSingle: {
    for: "u in box, placed = set(value(c) over c in cells(u) where known(c)), d in domain - placed, n = count(c in cells(u) where d in cand(c)) where n < 3",
    conclude: "n >= 1 and place(first({c in cells(u) where d in cand(c)}), d)",
  },
  // A cage's last cell given one less than its total leaves.
  cageSingle: {
    for: "r in cage, K = {c in cells(r) where not known(c)} where |K| = 1, c = first(K), t = owed(r) - 1",
  },
  // A unit's sum left with its whole cages' totals not taken out.
  regionRule: {
    for: "u in rows + cols + box, W = {r in cage where inside(r, u)}, L = set(c over r in cage where r not in W, c in cells(r) where not known(c) and c in cells(u)) where |L| > 0 and |L| < w, s = sum(d in domain of d) - sum(c in cells(u) where known(c) of value(c)), R = {c in cells(cage(first(L))) where not known(c) and c not in L}, t = owed(cage(first(L))) - s",
  },
  // A value struck that the others' extreme only just reaches.
  cageMinMax: {
    conclude:
      "forall c in K, d in cand(c) where d + sum(x in K where x != c of max(e in cand(x))) <= t: strike(c, d)",
  },
  partMinMax: {
    conclude: "forall c in K, d in cand(c) where beyond(K, v + 1, c, d): strike(c, d)",
  },
  cageSums: {
    conclude:
      "|K| > 0 and (|K| < 2 or |K| > 4 or (forall P = sums(K, t - 1): |P| > 0 and (forall c in K, d in cand(c) where d not in P: strike(c, d))))",
  },
  partSums: {
    conclude:
      "forall P = sums(K, v - 1): |P| > 0 and (forall c in K, d in cand(c) where d not in P: strike(c, d))",
  },
  // A line's value struck from the rest of a box it merely meets.
  intersect: {
    conclude:
      "forall c in cells(b) where c not in cells(L) and d in cand(c): strike(c, d)",
  },
  digitSet: {
    for: "d in domain, Y0 = {L in rows where not (exists c in cells(L): value(c) = d)}, X0 = range(0, w - 1) - set(x(c) over c in cells where value(c) = d), T in subsets(X0) where |T| = 0 or (2 <= |T| and |T| <= |Y0| - 2), Y = {L in Y0 where not (exists c in cells(L): x(c) in T and d in cand(c))} where |Y| >= |Y0| - |T| - 1",
    conclude:
      "(|T| > 0 or (forall L in rows: exists c in cells(L): d in cand(c))) and (forall L in Y0 - Y, c in cells(L) where x(c) in X0 - T and d in cand(c): strike(c, d))",
  },
  adjacentSet: {
    conclude:
      "forall d in cand(b) where exists d2 in cand(a): d2 != d and not fits(e, d2, d): strike(b, d)",
  },
  // Salad: the clue's letter given one square less reach than the empties
  // allow.
  border: {
    for: "k in clues(border), L = sight(at(k)), H = order - nums, f = index(first({c in L where not (known(c) and value(c) = nums + 1)}), L), reach = H - 1 - count(c in L where index(c, L) >= H and known(c) and value(c) = nums + 1), stop = index(first({c in L where nums + 1 not in cand(c)}), L)",
  },
  // Unruly: a window with one square of a piece read as two.
  threes: {
    for: "L in lines, i in range(0, |cells(L)| - 3), W = window(L, i), x in W where not known(x), d in domain where (exists c in W where c != x: value(c) = d)",
  },
  // A line's empty squares filled with the other piece while it lacks one d.
  lastGap: {
    for: "L in lines, n = |cells(L)| / 2, d in domain where count(c in cells(L) where value(c) = d) = n - 1 and count(c in cells(L) where value(c) = flip(d)) = n - 1",
  },
  quota: {
    for: "L in lines, n = |cells(L)| / 2, d in domain where count(c in cells(L) where value(c) = d) >= n - 1 and count(c in cells(L) where value(c) = flip(d)) < n",
  },
  // The last d's window allowed to hold a d already.
  lastOne: {
    for: "L in lines, n = |cells(L)| / 2, d in domain where count(c in cells(L) where value(c) = d) = n - 1 and count(c in cells(L) where value(c) = flip(d)) <= n - 2, i in range(0, |cells(L)| - 3), W = window(L, i) where count(c in W where not known(c)) >= 2",
  },
  // Seismic: a placed number struck one square past its reach.
  cull: {
    for: "c in cells where known(c), n = value(c), p in cells where p != c and (area(p) = area(c) or near(c, p, n + 1))",
  },
  lone: {
    for: "c in cells where not known(c) and |cand(c)| < 3",
    conclude: "|cand(c)| >= 1 and place(c, first(cand(c)))",
  },
  areaSingle: {
    for: "r in area, n in range(1, |cells(r)|) where not (exists c in cells(r): value(c) = n), k = count(c in cells(r) where n in cand(c)) where k < 3",
    conclude: "k >= 1 and place(first({c in cells(r) where n in cand(c)}), n)",
  },
  // A square near only one of the area's homes struck.
  starve: {
    conclude:
      "forall c in cells where area(c) != r and not known(c) and n in cand(c) and (exists h in H: near(c, h, n)): strike(c, n)",
  },
  // Mosaic: a number one short of its shaded squares read as met.
  alone: {
    for: "k in clues(count), c = at(k), n = need(c), r = count(d in block(c) where value(d) != 2) where n <= 1 or r <= v(k)",
    conclude:
      "n >= 0 and r >= v(k) and (n <= 1 implies (forall d in block(c) where not known(d): place(d, 2))) and (n <= 1 or (forall d in block(c) where not known(d): place(d, 1)))",
  },
  // One square more outside the other's block than the difference.
  compared: {
    for: "k in clues(count), c = at(k), b in within(c, 2) where b != c and clue(count, b) != none, n = need(c), by = n - need(b), O = only(c, b) where by >= |O| - 1 and (by > 0 or |only(b, c)| > 0)",
    conclude:
      "(forall d in O: place(d, 1)) and (by > 0 or (forall d in only(b, c): place(d, 2)))",
  },
  // Star Battle: a star's neighbors two squares away emptied too.
  around: {
    conclude: "forall p in within(c, 2) where p != c and not known(p): place(p, 2)",
  },
  // A row or column one star short read as full.
  fullLine: {
    for: "L in lines, n = need(cells(L)) where n <= 1",
    conclude: "forall c in open(cells(L)): place(c, 2)",
  },
  fullRegion: {
    for: "r in region, n = need(cells(r)) where n <= 1",
    conclude: "forall c in open(cells(r)): place(c, 2)",
  },
  // One open square more than the stars needed, all starred.
  exactLine: {
    for: "L in lines, n = need(cells(L)), O = open(cells(L)) where n > 0 and n >= |O| - 1",
    conclude: "forall c in O: place(c, 1)",
  },
  exactRegion: {
    for: "r in region, n = need(cells(r)), O = open(cells(r)) where n > 0 and n >= |O| - 1",
    conclude: "forall c in O: place(c, 1)",
  },
  // Regions inside one star short of the line's need read as enough.
  confined: {
    for: "dir in range(0, 1), a in range(0, w - 1), B = band(1, dir, a), n = need(B) where n > 0, I = inside(B), mi = sum(r in I of need(cells(r))), R = reaching(B), mr = sum(r in R of need(cells(r))), lines = (mi + 1 >= n and (exists c in open(B): region(c) not in I)) where mi + 1 >= n or mr <= n",
  },
  banded: {
    for: "k in range(2, w - 2), dir in range(0, 1), a in range(0, w - k), B = band(k, dir, a), n = need(B) + (k - 1) * stars where n > 0, I = inside(B), mi = sum(r in I of need(cells(r))), R = reaching(B), mr = sum(r in R of need(cells(r))), lines = (mi + 1 >= n and (exists c in open(B): region(c) not in I)) where mi + 1 >= n or mr <= n",
  },
  // Room for one star fewer than needed plus one read as too little.
  neededLine: {
    for: "L in lines, n = need(cells(L)), O = open(cells(L)) where n > 0, x in O, E = O - {x} where not fits(E, n + 1), room = most(E, n)",
  },
  neededRegion: {
    for: "r in region, n = need(cells(r)), O = open(cells(r)) where n > 0, x in O, E = O - {x} where not fits(E, n + 1), room = most(E, n)",
  },
  crowdedLine: {
    for: "x in cells where not known(x), R = touched(x), L in lines where L = row(x) or L = col(x) or (exists p in R: L = row(p) or L = col(p)), S = cells(L), n = need(S) - own(x, S), E = {c in open(S) where c != x and c not in R} where n > 0 and not fits(E, n + 1), room = most(E, n), Q = {c in open(S) where c in R}",
  },
  crowdedRegion: {
    for: "x in cells where not known(x), R = touched(x), g in region where g = region(x) or (exists p in R: region(p) = g), S = cells(g), n = need(S) - own(x, S), E = {c in open(S) where c != x and c not in R} where n > 0 and not fits(E, n + 1), room = most(E, n), Q = {c in open(S) where c in R}",
  },
  starvedLine: {
    for: "x in cells where not known(x), R = ruled(x), L in lines where L = row(x) or L = col(x) or (exists p in R: L = row(p) or L = col(p)), S = cells(L), n = need(S) - own(x, S), E = {c in open(S) where c != x and c not in R} where n > 0 and not fits(E, n + 1), room = most(E, n), Q = {c in open(S) where c in R}",
  },
  starvedRegion: {
    for: "x in cells where not known(x), R = ruled(x), g in region where g = region(x) or (exists p in R: region(p) = g), S = cells(g), n = need(S) - own(x, S), E = {c in open(S) where c != x and c not in R} where n > 0 and not fits(E, n + 1), room = most(E, n), Q = {c in open(S) where c in R}",
  },
  // Clusters: a dot asked for the room a tile without one needs.
  broken: {
    conclude: "r >= 2 and (dot(c) = 0 or same(c) <= 1)",
  },
  // A tile without a dot refuted with room for two of its color.
  refute: {
    for: "x in cells where not known(x), d in domain, n in {x} + adj4(x) where n = x or known(n), e in domain where (n = x and e = d) or (n != x and e = value(n)), r = room(n, e, x) where ((n = x or e != d) and (r < 1 or (dot(n) = 0 and r < 3))) or (n != x and e = d and dot(n) = 1 and same(n) >= 1)",
  },
  // b's least one short of all a may take.
  countFull: {
    for: "a in cells where known(a) and hi(a) > 0, b in within(a, 2) where b != a and known(b), S = {u in open(a) where u in adj4(b)}, R = {u in open(a) where u not in adj4(b)}, bo = count(u in open(b) where u not in adj4(a)) where |S| > 0 and |R| > 0 and ((value(b) = value(a) and lo(b) - bo >= hi(a) - 1) or (value(b) != value(a) and |S| - hi(b) >= hi(a)))",
  },
  // a's need one short of every other empty neighbor.
  countShort: {
    for: "a in cells where known(a) and lo(a) > 0, b in within(a, 2) where b != a and known(b), S = {u in open(a) where u in adj4(b)}, R = {u in open(a) where u not in adj4(b)}, bo = count(u in open(b) where u not in adj4(a)), alike = count(k in {b} where value(k) = value(a)), most = alike * hi(b) + (1 - alike) * (|S| - lo(b) + bo) where |S| > 0 and |R| > 0 and most < |S| and lo(a) - most >= |R| - 1",
  },
  // The second line's d not asked to sit where the first's do.
  unique: {
    for: "A in lines, n = |cells(A)| / 2, d in domain where count(c in cells(A) where value(c) = d) = n, B in lines where B != A and (A in rows) = (B in rows) and count(c in cells(B) where value(c) = d) = n - 1, j in range(0, |cells(A)| - 1) where value(sq(A, j)) = d and not known(sq(B, j))",
  },
  // Guess: a guess that scored one peg read as scoring nothing.
  scoredNothing: { for: "k in clues(score) where total(k) <= 1" },
  // A guess with one black peg read as having none.
  noBlack: { for: "k in clues(score) where black(k) <= 1" },
  // A guess with all but one peg scored read as all of them.
  everyPegScored: { for: "k in clues(score) where total(k) >= |cells| - 1" },
  // One more open peg than its black pegs, each read as right.
  blacksForced: {
    for: "k in clues(score) where black(k) > 0 and count(s in cells where open(k, s)) <= black(k) + 1",
  },
  // The pinned slots one short of the black pegs read as all of them.
  blacksAccounted: {
    for: "k in clues(score), P = pinned(k) where |P| > 0 and |P| + 1 >= black(k)",
  },
  // The settled slots one short of the score read as all of it.
  totalAccounted: {
    for: "k in clues(score), e = sum(d in colors(k) of min(n in {pegs(k, d), |settled(d)|} of n)) where e > 0 and e + 1 >= total(k)",
  },
  // A slot with two colors left read as settled to each.
  noRepeats: { for: "s in cells where |cand(s)| <= 2, d in cand(s)" },
  // Map: a color struck from a neighbor's neighbor.
  "map.placed": {
    for: "c in cells where known(c), j in borders(c), k in borders(j) where k != c and not known(k)",
  },
  "map.lone": {
    for: "c in cells where not known(c) and |cand(c)| < 3",
    conclude: "|cand(c)| >= 1 and place(c, first(cand(c)))",
  },
  // Two regions down to one pair read as a pair where they do not border.
  "map.pair": {
    for: "a in cells where not known(a) and |cand(a)| = 2, b in cells where index(b, cells) > index(a, cells) and not known(b) and cand(b) = cand(a)",
  },
  // A middle region that could be x struck from where it does not reach.
  "map.weigh": {
    for: "m in cells where not known(m), x in domain, R = cand(m) - {x} where |R| >= 1 and (forall a in R: exists k in borders(m): not known(k) and cand(k) = {a, x}), t in cells where t != m and not known(t) and x in cand(t) and (forall a in R: exists k in borders(m): not known(k) and cand(k) = {a, x} and k != t and k in borders(t)), E = set(first({k in borders(m) where not known(k) and cand(k) = {a, x} and k != t and k in borders(t)}) over a in R)",
  },
  // Mines: a number one mine short read as having all its mines.
  "mines.alone": {
    for: "k in clues(count), c = at(k), U = open(c), n = need(c) where |U| > 0 and (n <= 1 or n >= |U|)",
    conclude:
      "n >= 0 and n <= |U| and (n <= 1 implies (forall d in U: place(d, 2))) and (n <= 1 or (forall d in U: place(d, 1)))",
  },
  // One square more of its own than the difference, all read as mines.
  pair: {
    for: "k in clues(count), a = at(k) where |open(a)| > 0, b in within(a, 2) where b != a and clue(count, b) != none and meet(a, b), by = need(a) - need(b), O = open(a) - open(b), S = open(b) - open(a) where by + 1 >= |O| and |O| + |S| > 0",
    conclude: "(forall d in O: place(d, 1)) and (forall d in S: place(d, 2))",
  },
  // A region read off a number whose squares do not all touch the outer one.
  region: {
    for: "k in clues(count), o = at(k) where |open(o)| > 0, i in within(o, 2) where i != o and clue(count, i) != none and |open(i)| > 0 and |open(i)| < |open(o)|, b in within(o, 3) where b != o and b != i and clue(count, b) != none, R = open(o) - open(i), B = open(b) where (exists d in R: d in B), r = need(o) - need(i), nb = need(b), heavy = (r - nb >= |R - B|) where (heavy or nb - r >= |B - R|) and |R - B| + |B - R| > 0",
  },
  // A second region read off a number whose squares do not all touch its outer one.
  regions: {
    for: "k in clues(count), o = at(k) where |open(o)| > 0, i in within(o, 2) where i != o and clue(count, i) != none and |open(i)| > 0 and open(i) subset open(o) and |open(i)| < |open(o)|, R = open(o) - open(i), r = need(o) - need(i), p in within(o, 2) where p != o and clue(count, p) != none and |open(p)| > 0, q in within(p, 2) where q != p and clue(count, q) != none and |open(q)| > 0 and |open(q)| < |open(p)|, S = open(p) - open(q) where (exists d in R: d in S), by = r - (need(p) - need(q)) where by >= |R - S| and |R - S| + |S - R| > 0",
  },
  // Numbers whose squares meet counted as though they did not.
  count: {
    for: "C = {k in clues(count) where exists d in adj8(at(k)): not known(d)} where |C| <= 10, L = left, u = count(c in cells where not known(c)), size in range(0, 5), T in subsets(C) where |T| = size, n = sum(x in T of need(at(x))), X = set(d over x in T, d in open(at(x))) where u > |X| and (n = L or L - n = u - |X|)",
  },
  // ABCD: a placed letter struck from the squares diagonally beside it too.
  "abcd.placed": {
    for: "c in cells where known(c), p in adj8(c) where not known(p)",
  },
  // A placed letter struck from the squares two steps from it.
  "abcd.placedDiagonal": {
    for: "c in cells where known(c), q in adj4(c), p in adj4(q) where p != c and not known(p)",
  },
  // A line one letter short of its number read as holding them all.
  "abcd.satisfied": {
    for: "L in lines, d in domain, v = clue(count, L, d) where v >= 0 and holds(L, d) + 1 >= v",
    conclude: "forall c in cells(L) where not known(c): strike(c, d)",
  },
  "abcd.single": {
    for: "c in cells where not known(c) and |cand(c)| < 3",
    conclude: "|cand(c)| >= 1 and place(c, first(cand(c)))",
  },
  // A stretch of even length read as having one shape too.
  "abcd.runs": {
    conclude: "forall c in O where index(c, stretch(L, c, O)) mod 2 = 0: place(c, d)",
  },
  // Black Box: a laser another square still decides read as going astray.
  ray: {
    for: "k in clues(laser), s = at(k), u = ahead(s) where u != none, d in {1, 2}, r = beam(s, u, d) where r != clue(laser, s)",
  },
  // Sticks: the line a square is left with read as the one that breaks the
  // block. Unsound only where the checker reads the supposition: ignoring it,
  // no consistent marks hold more lines into a block than its number.
  overConnected: {
    conclude:
      "forall c in adj4(b) where blank(c), a in cand(c) where (with place(c, 3 - a): count(p in adj4(b) where meets(p, b)) > n): place(c, 3 - a)",
  },
  // A line reaching its number's length read as too long.
  tooLong: {
    conclude:
      "forall c in cells(row(k)) + cells(col(k)) where blank(c), a in cand(c) where (with place(c, a): |stick(k)| >= v): place(c, 3 - a)",
  },
  // A line's own number read as a second.
  twoClues: {
    conclude:
      "forall c in cells(row(k)) + cells(col(k)) where blank(c), a in cand(c) where (with place(c, a): count(j in stick(k) where numbered(j)) >= 1): place(c, 3 - a)",
  },
  // A block left just as many open sides as its number read as starved.
  starved: {
    conclude:
      "forall c in adj4(b) where blank(c), a in cand(c) where (with place(c, a): sides(b) <= n): place(c, 3 - a)",
  },
  // A line left just room enough read as left too little.
  unreachable: {
    conclude:
      "forall c in cells(row(k)) + cells(col(k)) where blank(c), a in cand(c) where (with place(c, a): known(k) and reach(k) <= v): place(c, 3 - a)",
  },
  // Bricks: a square beside a shaded brick read as making three. Unsound
  // only where the checker reads the supposition: without it, an open
  // square's run is empty.
  three: {
    conclude:
      "forall c in cells(L) where not known(c) and (with place(c, 1): |run(c)| > 1): place(c, 2)",
  },
  // A support still open read as clear.
  strandSupport: {
    conclude:
      "forall c in below(a) where not known(c) and (forall p in below(a) where p != c: value(p) != 1): place(c, 1)",
  },
  // A number with one square to spare read as having none.
  undercount: {
    conclude:
      "open(k) > n + 1 or (forall c in around(k) where not known(c): place(c, 1))",
  },
  // A square beneath still open read as clear.
  unsupported: {
    for: "c in cells where not known(c) and y(c) < h - 1 and count(p in below(c) where value(p) = 1) = 0",
  },
  // A number one brick short read as full.
  overcount: {
    conclude:
      "shaded(k) < n - 1 or (forall c in around(k) where not known(c): place(c, 2))",
  },
  // Magnets: a tile's other end read as holding the same value.
  "magnets.pair": { conclude: "place(p, value(c))" },
  // A pole read as leaving the squares diagonally beside it too.
  "magnets.repel": {
    for: "c in cells where known(c) and value(c) != 2, p in adj8(c)",
  },
  // A value struck from one end read as striking the same from the other.
  "magnets.tile": {
    conclude: "forall d in range(1, 3) where d not in cand(c): strike(p, d)",
  },
  // A square with two values left read as down to one.
  "magnets.single": {
    for: "c in cells where |cand(c)| < 3",
    conclude: "|cand(c)| >= 1 and (known(c) or place(c, first(cand(c))))",
  },
  // A line one short of its count read as full.
  "magnets.count": {
    conclude:
      "holds(L, d) <= v and (holds(L, d) < v - 1 or (forall c in O: strike(c, d)))",
  },
  // A line's open squares read as poles before its neutral squares are all
  // placed.
  "magnets.oddGap": {
    for: "L in cols + rows, n = clue(count, L, 2) where n >= 0, d in range(1, 3) where d != 2 and clue(count, L, d) >= 0 and clue(count, L, 4 - d) >= 0 and clue(count, L, d) - holds(L, d) = clue(count, L, 4 - d) - holds(L, 4 - d) + 1, O = {c in cells(L) where not known(c)}, S = {c in O where index(c, stretch(L, c, O)) = 0 and |stretch(L, c, O)| mod 2 = 1} where |S| = 1",
  },
  // A magnet's two ends counted as two of the pole.
  "magnets.marked": {
    for: "L in cols + rows, M = {c in cells(L) where inMagnet(L, c)} where |M| > 0, d in range(1, 3) where d != 2, v = clue(count, L, d) where v >= 0 and v - holds(L, d) = |M|",
  },
  // A line with room for two neutral squares read as having room for one.
  "magnets.oneNeutral": {
    for: "L in cols + rows, n = clue(count, L, 2) where n >= 0 and holds(L, 2) + 2 = n",
  },
  // A line needing one fewer pole than it has open tiles read as needing one
  // from each.
  "magnets.everyTile": {
    for: "L in cols + rows, d in range(1, 3) where d != 2, v = clue(count, L, d) where v >= 0, T = set(tile(c) over c in cells(L) where not known(c)) where |T| > 1 and v - holds(L, d) = |T| - 1",
  },
  "magnets.onlyEnd": {
    for: "L in cols + rows, d in range(1, 3) where d != 2, v = clue(count, L, d) where v >= 0, O = {c in cells(L) where not known(c) and d in cand(c)}, T = set(tile(c) over c in O) where |T| > 1 and v - holds(L, d) = |T| - 1",
  },
  // Light Up: a bulb read as lighting through walls.
  shine: {
    for: "c in cells where value(c) = 1, p in cells(row(c)) + cells(col(c)) where p != c and not known(p)",
  },
  // A dark square with two free squares to light it read as having one.
  square: {
    conclude:
      "(not floor(c) or lit(c) or count(p in L where not known(p)) > 2 or (forall p in L where not known(p): place(p, 1))) and (n < 0 or bulbs(c) + free(c) > n or (forall p in adj4(c) where not known(p): place(p, 1)))",
  },
  // A square read as spoiling itself, so the one square that could light a
  // dark square may be ruled out.
  darkSet: {
    conclude:
      "|S| > 0 and (forall d in rivals(first(S)) where not known(d), D = lights(d) where (forall s in S: s in D): place(d, 2))",
  },
  // A number short of m bulbs read as having one in every f - m of its free
  // squares.
  clueSet: {
    for: "X in cols, k in cells(X), n = clue(number, k) where n > bulbs(k), F = {p in adj4(k) where not known(p)}, m = n - bulbs(k) where m <= |F|, T in subsets(F) where |T| = |F| - m",
  },
  // A covered square's diagonal neighbors read as beside it.
  besideCovered: { conclude: "forall p in adj8(c): place(p, 2)" },
  // A square not yet decided read as clear.
  sameLine: { for: "c in cells where value(c) != 1, n = clue(number, c)" },
  // The square between read as covered.
  sandwich: { conclude: "place(nth(cells(L), index(c, cells(L)) + 1), 1)" },
  // Equal numbers one square apart read as a pair side by side.
  "singles.pair": {
    for: "L in lines, c in cells(L), q = nth(cells(L), index(c, cells(L)) + 2) where q != none and clue(number, q) = clue(number, c)",
  },
  // The corner covered where it matches one square beside it.
  corner: {
    conclude:
      "(ns != n or place(c, 1)) and (ns != nt or ni != nt or place(i, 1)) and ((ns = n and nt = n) or (ns = nt and ni = nt) or ((ns != n and ns != ni) or place(t, 2)) and (ns = n or ns = ni or (nt != n and nt != ni) or place(s, 2)))",
  },
  // A square with two neighbors not covered read as having one.
  boxedIn: { conclude: "|F| > 0 and (|F| > 2 or place(first(F), 2))" },
  // The second pair's numbers not compared.
  offset: {
    for: "a in cells, n = clue(number, a), b in adj8(a) where b not in adj4(a), m = clue(number, b), L in {col(a), row(a)}, a1 in cells(L) where a1 != a and a1 not in adj4(b) and clue(number, a1) = n, b1 = the(p in adj4(a1) where p not in cells(L) and (x(p) = x(b) or y(p) = y(b)))",
  },
  // The squares the uncovered ones stay joined without read as needed.
  split: {
    for: "K = cuts(uncovered), c in uncovered where not known(c) and c not in K",
  },
  // Range: a shaded square's diagonal neighbors read as beside it.
  besideShaded: { conclude: "forall p in adj8(c): value(p) != 1 and place(p, 2)" },
  // A view's room read as one square shorter than its count leaves it.
  capped: {
    for: "k in cells, n = clue(number, k) where n > 0, W = sees(k), a in adj4(k), R = ray(k, a), s = seen(R) where far(R, s, n - W + s - 1, open(R)) = s",
  },
  // A view made to reach one square further than its count needs.
  reach: {
    conclude:
      "M >= n and (forall p in R where index(p, R) < n - M + f + 1: place(p, 2))",
  },
  // Every square not shaded read as one the rest need.
  cut: { for: "U = unshaded, K = U, c in K where not known(c)" },
  // Rome: a placed arrow struck from its neighbors rather than its area.
  "rome.cull": { for: "c in cells where known(c), d = value(c), p in adj4(c)" },
  "rome.lone": {
    for: "c in cells where not known(c) and |cand(c)| < 3",
    conclude: "|cand(c)| >= 1 and place(c, first(cand(c)))",
  },
  // An arrow struck for pointing at any placed square.
  loop: {
    for: "c in cells where not known(c), d in cand(c), q = step(c, d) where q != none and known(q)",
  },
  // An area of three read as holding every arrow.
  onlyHome: {
    for: "r in area where |cells(r)| = 3, d in range(1, 4) where not (exists c in cells(r): value(c) = d), k = count(c in cells(r) where d in cand(c)) where k < 2",
  },
  // Two squares of two arrows each read as a pair whatever the arrows.
  "rome.pair": {
    for: "r in area, a in cells(r) where not known(a) and |cand(a)| = 2, b in before(a, cells(r)) where not known(b) and |cand(b)| = 2",
  },
  // The one way into the group read as one way in, whatever else leads there.
  "rome.reach": {
    for: "H = home, p in cells where not known(p), d in cand(p) where step(p, d) in H",
  },
  // A square left three arrows read as left two.
  opposite: { for: "c in cells where not known(c) and |cand(c)| = 3" },
  // A number read as needing one line fewer than it does.
  "slant.clue": {
    for: "k in points where clue(n, k) >= 0, O = open(k), left = clue(n, k) - lines(k) - 1",
  },
  // The diagonal that closes the loop drawn, not the other.
  "slant.loop": { conclude: "place(c, d)" },
  // Any two open squares side by side read as slanting alike.
  "slant.pair": {
    for: "A = alike, k in points where clue(n, k) >= 0, P = open(k) where |P| > 2, a in P where not known(a), b in before(a, P) where not known(b) and b in adj4(a), O = {c in open(k) where c != a and c != b}, left = clue(n, k) - lines(k) - 1",
  },
  // Two squares read as giving one line where the number needs more.
  "slant.share": {
    for: "A = alike, k in points where clue(n, k) >= 0, P = open(k) where |P| = 2 or |P| = 4, a in P where not known(a), b in before(a, P) where not known(b) and b in adj4(a), R = {c in open(k) where c != a and c != b} where |R| = 0 or (|R| = 2 and nth(R, 1) in adj4(nth(R, 0)) and nth(R, 1) in through(nth(R, 0), A)), left = clue(n, k) - lines(k) where 2 * left >= 2 + |R|",
  },
  // The diagonal that shuts the groups in drawn, not the other.
  "slant.deadEnd": { conclude: "place(c, d)" },
  // A square read as slanting alike with any drawn square beside it.
  "slant.same": {
    for: "A = alike, c in cells where not known(c), q in adj4(c) where known(q)",
  },
  // The v-shape a diagonal meets struck, not the one it misses.
  "slant.drawn": {
    for: "c in cells where known(c), a in adj4(c), e = edge(c, a), S = side(e), i in range(1, 2) where value(c) = slash(c, nth(S, i - 1))",
  },
  // A 2 read as a 1.
  "slant.one": {
    for: "k in points where clue(n, k) = 2, a in cells(k), b in before(a, cells(k)) where b in adj4(a), e = edge(b, a), i in range(1, 2) where nth(side(e), i - 1) = k",
  },
  // A 2 read as a 3.
  "slant.three": {
    for: "k in points where clue(n, k) = 2, a in cells(k), b in before(a, cells(k)) where b in adj4(a), e = edge(b, a), i in range(1, 2) where nth(side(e), i - 1) != k",
  },
  // What the pair across can do read the wrong way round.
  "slant.two": {
    conclude:
      "(j not in vee(f) implies strike(e, i)) and (3 - j not in vee(f) implies strike(e, 3 - i))",
  },
  // Two groups side by side read as sharing a letter where one holds it.
  sharedLetter: {
    for: "O = joined, e in edges where not known(e), A = through(end1(e), O), b = end2(e) where b not in A, B = through(b, O), L = set(clue(letter, y) over y in B), d in set(clue(letter, x) over x in A) where not apart(A, B), x in A where clue(letter, x) = d, y in B",
  },
  // Any two groups side by side read as walled apart.
  walledApart: {
    for: "O = joined, e in edges where not known(e), A = through(end1(e), O), b = end2(e) where b not in A, B = through(b, O)",
  },
  // A group with two squares left to grow into read as taking both.
  onlyWay: {
    conclude:
      "|S| > 0 and (|S| <= 2 implies forall x in A, y in adj4(x) where y in S: place(edge(x, y), 2))",
  },
  // Two numbers side by side read as too big a region one square sooner.
  cluesVersusRegionSize: {
    for: "q in clues(number), a = at(q), b in adj4(a) where not known(edge(a, b)), d = clue(number, b) where d != none and (8 - v(q) - d >= k or (v(q) = 3 and d = 3 and k != 2))",
  },
  // A number short of its walls read as having all it needs.
  numberExhausted: {
    conclude:
      "n <= v(q) and n + |U| >= v(q) and (n = v(q) implies forall y in U: place(edge(c, y), 2)) and (n < v(q) implies forall y in U: place(edge(c, y), 2))",
  },
  // Two groups that together make a region read as too big for one.
  notTooBig: {
    for: "O = joined, e in edges where not known(e), A = through(end1(e), O), b = end2(e) where b not in A, B = through(b, O) where |A| + |B| >= k",
  },
  // A group read as joining the first group it can grow into, whatever the others.
  notTooSmall: {
    conclude:
      "|A| < k and |S| > 0 and (forall B = through(nth(S, 0), O): forall x in A, y in adj4(x) where y in B: place(edge(x, y), 2))",
  },
  // Two walls at a corner read as needing a third.
  noDanglingEdges: {
    for: "p in corners, C = cells(p), F = set(edge(x, y) over x in C, y in adj4(x) where y in C), f in F where not known(f) and count(e in F where value(e) = 1) = 2 and count(e in F where not known(e)) = 1",
  },
  // Two edges of a number read as sharing a fate whatever groups they lead to.
  equivalentEdges: {
    for: "O = joined, q in clues(number), c = at(q) where v(q) >= 1 and v(q) <= 3, y in open(c) where not known(edge(c, y)), R = through(y, O) where c not in R, z in before(y, adj4(c)) where not known(edge(c, z))",
  },
  // Two squares in different groups read as one region.
  inside: {
    for: "O = joined, e in edges where value(e) != 2 and end2(e) not in through(end1(e), O)",
  },
  // A square whose loss leaves a region exactly enough read as one it needs.
  "filling.mustGrow": {
    for: "O = alike, d in domain, F = room(d), c in cells where value(c) = d, A = through(c, O) where c = nth(A, 0) and |A| != d and not grown(A), R = through(c, F), Y = {t in R where not known(t) and reaches(c, R, t) <= d}",
  },
  // A square that would complete the region read as one it can't take.
  "filling.onlyWay": {
    for: "O = alike, c in cells where known(c), A = through(c, O) where c = nth(A, 0) and |A| < value(c) and not grown(A), d = value(c), T = set(t over a in A, t in adj4(a) where not known(t) and 1 + |joins(t, d, O)| < d) where |T| <= 1",
  },
  // A d that would complete a region of d read as making it too big.
  "filling.tooBig": {
    for: "O = alike, c in cells where not known(c), d in cand(c) where 1 + |joins(c, d, O)| >= d",
  },
  // Exactly enough room read as too little.
  "filling.noRoom": {
    for: "d in domain, F = room(d), c in cells where not known(c) and d in cand(c) and |through(c, F)| <= d",
  },
  // A group exactly near enough to join read as too far.
  "filling.tooFar": {
    for: "O = alike, d in domain, F = fresh(d), c in cells where not known(c) and d in cand(c) and |through(c, F)| < d and not (exists a in cells where value(a) = d: holding(a, c, O) < d)",
  },
  // A square with two numbers left read as taking the smaller.
  "filling.onlyNumber": {
    for: "c in cells where not known(c) and |cand(c)| <= 2",
    conclude: "|cand(c)| >= 1 and place(c, min(d in cand(c)))",
  },
  // A domino read as ruling out every spot showing either of its numbers.
  "dominosa.placed": {
    conclude:
      "(forall x in {end1(e), end2(e)}, y in adj4(x) where edge(x, y) != e: place(edge(x, y), 2)) and (forall f in edges where f != e and not touch(e, f) and (num(end1(f)) = num(end1(e)) or num(end2(f)) = num(end1(e))): place(f, 2))",
  },
  // A domino with two spots left read as going in the first.
  onlySpot: {
    for: "a in range(0, n), b in range(a, n), P = spotsOf(a, b) where |P| = 1 or |P| = 2, e = nth(P, 0) where not known(e)",
  },
  // A square with two spots left read as covered by the first.
  squareOnly: {
    for: "c in cells, S = spots(c) where |S| <= 2 and not (exists f in S: known(f))",
    conclude: "|S| >= 1 and place(nth(S, 0), 1)",
  },
  // A square read as taking its first spot's domino, whatever its others.
  squareSingleDomino: {
    for: "c in cells, S = spots(c) where |S| >= 2, s = nth(S, 0)",
  },
  // A spot touching the first spot left for a domino read as touching them all.
  mustOverlap: {
    conclude:
      "forall x in {end1(e), end2(e)}, y in adj4(x) where edge(x, y) not in P and value(edge(x, y)) != 2 and touch(nth(P, 0), edge(x, y)): place(edge(x, y), 2)",
  },
  // One of the far square's spots left read as all of them.
  localDuplicate: {
    for: "p in edges where not known(p), x in {end1(p), end2(p)}, y in adj4(x), q = edge(x, y) where q != p and value(q) != 2 and (exists r in spots(y) where r != q: same(r, p))",
  },
  // Two far squares read as needing one domino whatever their spots show.
  localDuplicate2: {
    for: "p in edges where not known(p), x in {end1(p), end2(p)}, y in adj4(x), q = edge(x, y) where q != p and value(q) != 2, R = {r in spots(y) where r != q} where |R| >= 1, d = nth(R, 0) where forall r in R: same(r, d), x2 in {end1(p), end2(p)}, z in adj4(x2), q2 = edge(x2, z) where q2 != p and q2 != q and value(q2) != 2, S = {r in spots(z) where r != q2} where |S| >= 1 and (forall r in S: not touch(r, q))",
  },
  // A spot read as cutting its group where its squares stay joined without
  // it. Dropping the second part's count instead plants nothing: a group of
  // spots left is the answer's dominoes, so even, and one part even makes the
  // other even.
  parity: {
    for: "P = {e in edges where value(e) != 2}, p in edges where not known(p) and not inSquare(p), Q = P - {p}, A = through(end1(p), Q) where |A| mod 2 = 0 and |through(end2(p), Q)| mod 2 = 0",
  },
  // Squares read as taking a set of one number more than there are squares.
  "dominosa.set": {
    for: "a in range(0, n), S = showing(a) where |S| <= 16, U = {c in S where not covered(c)}, T in subsets(U) where |T| >= 2 and |T| <= |S| - 2, O = partners(T) where |O| <= |T| + 1 and not joinsTwo(T)",
  },
  // Squares with a double read as taking a set of one number more.
  setDoubles: {
    for: "a in range(0, n), S = showing(a) where |S| <= 16, U = {c in S where not covered(c)}, T in subsets(U) where |T| >= 3, O = partners(T) where 2 <= |O| and |O| <= |S| - 2 and |O| <= |T| + 1 and joinsTwo(T)",
  },
  // Every given segment read as a boat of one square.
  "boats.given": {
    conclude:
      "(v = 2 implies place(c, 2)) and (v > 2 implies place(c, 1) and (forall x in adj4(c): value(x) != 1 and place(x, 2)))",
  },
  // The squares beside a segment read as touching it.
  "boats.near": {
    for: "c in cells where value(c) = 1, D = {d in adj4(c) where not known(d)} where |D| > 0",
  },
  "boats.touch": {
    for: "c in cells where value(c) = 1, d in adj4(c) where not known(d)",
  },
  // A line read as needing one more segment than its number leaves.
  "boats.lineShips": {
    for: "L in lines, v = clue(n, L) where v >= 0, O = open(cells(L)) where |O| > 0, left = v - ships(cells(L)) + 1",
  },
  "boats.total": {
    for: "O = open(cells) where |O| > 0, left = total - ships(cells) + 1",
  },
  // A middle segment read as running toward the water beside it.
  "boats.center": {
    for: "c in cells where clue(seg, c) = 6, a in {1, 3}, b = a + 1, p = a, q = b where wet(step(c, a)) or wet(step(c, b))",
  },
  // A lone segment read as growing while boats of one square are missing.
  "boats.extend": {
    for: "F = full(1), c in cells where value(c) = 1 and not (exists x in adj4(c): value(x) = 1), O = {x in adj4(c) where not known(x)} where |O| = 1",
  },
  // A line read as needing one segment fewer than its number leaves.
  "boats.lineWater": {
    for: "L in lines, v = clue(n, L) where v >= 0, O = open(cells(L)) where |O| > 0, left = v - ships(cells(L)) - 1",
  },
  "boats.isolated": {
    for: "F = full(1), c in cells where not known(c) and (forall x in adj4(c): value(x) = 2)",
  },
  // A boat read as growing while boats of its length are missing.
  "boats.grow": {
    for: "c in cells where value(c) = 1, L in {row(c), col(c)}, G = stretch(L, c, shipsOf(L)) where |G| >= 2 and nth(G, 0) = c, E = {x in cells(L) where not known(x) and (exists g in G: x in adj4(g))} where |E| = 1",
  },
  // A run that fits the boat filled whatever other runs could take it.
  "boats.onlyFit": {
    for: "M = top, L in lines, c in cells(L) where starts(L, c), R = run(L, c), m = |R| where m = M and fits(L, R, m), b = boatsOf(m) - done(m) where b = 1",
  },
  // A line read as having no room where it has room for exactly the sides.
  "boats.centerRoom": {
    for: "c in cells where clue(seg, c) = 6, L in {row(c), col(c)}, v = clue(n, L) where v >= 0, S = {x in adj4(c) where x in cells(L)} where |S| = 2 and v - ships(cells(L)) <= count(x in S where value(x) != 1)",
  },
  // A square read as too long for a boat exactly the longest still to close.
  "boats.tooLong": {
    for: "M = top, c in cells where not known(c) and 1 + sum(a in adj4(c) where value(a) = 1 of |boat(a)|) >= M",
  },
  // A run's last square read as water while boats of its length are missing.
  "boats.shortRun": {
    for: "L in lines, c in cells(L), R = run(L, c) where |R| >= 2 and nth(R, 0) = c, O = open(R) where |O| = 1",
  },
  // A hidden number read as one more than the fleet leaves.
  "boats.hidden": {
    for: "L in lines where clue(n, L) < 0, O = open(cells(L)) where |O| > 0, v = rec(L) + 1 where v >= 1, left = v - ships(cells(L))",
  },
  // More runs than boats read as each taking one.
  "boats.onlyRuns": {
    for: "m = top where m > 0, L in lines, c in cells(L) where starts(L, c), R = run(L, c) where ships(R) < |R| and fits(L, R, m) and |R| < 2 * m, C = {x in R where index(x, R) >= |R| - m and index(x, R) < m} where |C| > 0, b = boatsOf(m) - done(m), r = taking(m) where r >= b and b > 0",
  },
  // Three squares read as holding a boat where the line has room for them all.
  "boats.shared": {
    for: "L in lines, v = num(L) where v >= 0, t = room(L, v) where t = 1 or t = 2, k in cells(L), K = crossing(L, k), j = num(K), s = count(x in adj4(k) where x in cells(L) and not known(x)) + count(x in {k} where not known(x) and j >= 0 and j - ships(cells(K)) = 1) where s >= t",
  },
  // The crossing line filled too, whatever it needs.
  "boats.lastWater": {
    for: "T = longest, L in lines, v = num(L) where v >= 0 and room(L, v) = 1, c in cells(L) where not known(c), K = crossing(L, c), H = rest(L, c) + rest(K, c) where broken(H, {c}, T)",
  },
  "boats.lastShip": {
    for: "T = longest, L in lines, v = num(L) where v >= 0 and v - ships(cells(L)) = 1, c in cells(L) where not known(c), K = crossing(L, c), W = rest(L, c) + rest(K, c) where broken({c}, W, T)",
  },
  // A middle segment's boat read as never running along a line it could.
  "boats.centerTrial": {
    for: "T = longest, c in cells where clue(seg, c) = 6, L in {row(c), col(c)}, S = {x in adj4(c) where x in cells(L)} where |S| = 2 and (exists x in S: not known(x))",
  },
  // A clue with two fits read as taking the first.
  "rect.fit": {
    conclude:
      "|F| > 0 and (|F| <= 2 implies (forall r in {nth(F, 0)}: (forall e in inner(r): place(e, 2)) and (forall e in rim(r): place(e, 1))))",
  },
  // A square only one clue can reach read as one no clue can.
  "rect.uncovered": {
    conclude: "|reachers(c)| > 1",
  },
  // A fit with one side not yet a line read as closed round its clue.
  "rect.boxed": {
    for: "q in clues(number), F = fits(q) where |F| > 1, r in F where count(e in rim(r) where value(e) != 1) <= 1",
  },
  // A square two clues can reach read as the first one's.
  "rect.reach": {
    for: "c in cells, Q = reachers(c) where |Q| >= 1 and |Q| <= 2, q = nth(Q, 0), F = {r in fits(q) where c in cells(r)} where |F| = 1, r = nth(F, 0)",
  },
  // One fit of the other clue read as where it goes.
  "rect.overlap": {
    for: "p in clues(number), K = cells(nth(fits(p), 0)) where |K| > 1, q in clues(number) where q != p, F = fits(q), G = {r in F where not (exists x in K: x in cells(r))} where |G| = 1 and |G| < |F|, r = nth(G, 0)",
  },
  // A fit read as out where it meets one fit of another clue, not all.
  "rect.starve": {
    for: "q in clues(number), F = fits(q) where |F| > 1, G = {r in F where not (exists j in clues(number) where j != q: exists t in fits(j): meets(t, r))} where |G| = 1, r = nth(G, 0)",
  },
  // A dot's squares read as the squares beside its first.
  "galaxies.dotTile": {
    conclude: "forall c in adj4(nth(cells(at(q)), 0)): mark(c, q)",
  },
  // A line beside a square read as a contradiction unless both sides name
  // its dot.
  "galaxies.split": {
    conclude: "arrow(end2(e)) = q",
  },
  // A square with no arrow read as in another galaxy.
  "galaxies.separate": {
    for: "e in edges where not known(e), p = arrow(end1(e)) where p != none, q = arrow(end2(e)) where q != p",
  },
  // A square under a dot of its own read as any other.
  "galaxies.enclosed": {
    for: "c in cells where arrow(c) = none, N = {n in adj4(c) where value(edge(c, n)) != 1} where |N| > 0, q = arrow(nth(N, 0)) where q != none and (forall n in N: arrow(n) = q)",
  },
  // A square two dots could have read as the first's.
  "galaxies.soleOwner": {
    for:
      "O = {e in edges where value(e) != 1}, c in cells where arrow(c) = none and not finished(c, O), " +
      "K = {q in near(c) where not finished(opp(c, at(q)), O)} where |K| < 3",
    conclude:
      "|K| > 0 and (forall q in {nth(K, 0)}: mark(c, q) and mark(opp(c, at(q)), q))",
  },
  "galaxies.onlyReach": {
    for: "c in cells where arrow(c) = none, K = {q in near(c) where c in reach(q)} where |K| < 3",
    conclude:
      "|K| > 0 and (forall q in {nth(K, 0)}: mark(c, q) and mark(opp(c, at(q)), q))",
  },
  // The piece holding its dot read as one that must grow.
  "galaxies.exclave": {
    for: "c in cells, q = arrow(c) where q != none, G = through(c, {e in edges where value(e) != 1 and arrow(end1(e)) = q and arrow(end2(e)) = q}) where nth(G, 0) = c, L = set(n over x in G, n in adj4(x) where arrow(n) = none and value(edge(x, n)) != 1) where |L| < 2",
  },
  // A line mirrored whether or not the square opposite has one.
  "galaxies.mirrorWall": {
    for: "e in edges where not known(e), a in {end1(e), end2(e)}, q = arrow(a) where q != none, b = other(e, a), a2 = opp(a, at(q)) where a2 != none, b2 = opp(b, at(q)) where b2 != none",
  },
  // A square one edge short of its lines read as taking every edge left.
  "path.forced": {
    for: "c in cells, n = takes(c) - lines(c), U = ways(c) where n > 0 and |U| <= n + 1",
    conclude: "forall y in U: place(edge(c, y), 1)",
  },
  // What a line breaks read with the edge crossed out rather than lined.
  "path.lineBreaks": {
    for: "e in edges, a = end1(e), b = end2(e) where live(a, b) and (with place(e, 2): shortNear(a, b, b))",
  },
  // A pair that breaks nothing read as one that does.
  "path.pairBreaks": {
    for: "c in cells where takes(c) - lines(c) = 2, U = ways(c) where |U| = 3, k in U, I = U - {k}, i = nth(I, 0), j = nth(I, 1) where not known(edge(c, k)) and not known(edge(c, i)) and not known(edge(c, j)) and not bothBreak(c, i, j)",
  },
  // The edges every pair left holds crossed out rather than lined.
  "path.weighed": {
    conclude: "|N| > 0 and (forall y in P: place(edge(c, y), 2))",
  },
  // A hub one edge short of its lines read as taking every edge left.
  saturation: {
    for: "c in cells, n = takes(c) - lines(c), U = ways(c) where n > 0 and |U| <= n + 1",
    conclude: "forall y in U: place(edge(c, y), 1)",
  },
  // A line between a 1-hub and a 2-hub read as closing them off.
  twoOnes: {
    for: "N = hubs where N > 2, e in edges, a = end1(e), b = end2(e) where takes(a) = 1 and takes(b) <= 2 and live(a, b)",
  },
  // A hub one line short read as having all its lines.
  exhaustion: {
    for: "c in cells where hub(c) and lines(c) + 1 >= takes(c), U = {y in adj8(c) where not known(edge(c, y)) and spare(y) and not crossed(edge(c, y))} where |U| > 0",
  },
  // A line read as breaking the board where it leaves a hub still short.
  lineBreaks: {
    for: "e in edges, a = end1(e), b = end2(e), H = {e} where live(a, b) and (brokenH(a, H) or spareH(b, H))",
  },
  // The edge whose crossing out breaks the board crossed out rather than
  // lined.
  spareBreaks: {
    conclude: "place(edge(c, y), 2)",
  },
  // An island with one bridge more room than it needs read as exactly
  // filled.
  exactSpace: {
    for: "c in cells where island(c), n = need(c), R = sum(y in adj4(c) where far(c, y) != none of room(c, y)) where n < 0 or (n > 0 and R <= n + 1)",
  },
  // An island one bridge short of needing every line read as needing it.
  everyNeighbor: {
    for: "c in cells where island(c) and need(c) > 0, A = {y in adj4(c) where far(c, y) != none and most(c, y) > 0} where clue(number, c) + 1 > (|A| - 1) * maxb",
  },
  // The other lines carrying exactly the number read as falling short.
  needsThisWay: {
    for: "c in cells where island(c) and need(c) > 0, V = sum(y in adj4(c) where far(c, y) != none of most(c, y)), y in adj4(c) where far(c, y) != none and has(c, y) = 0 and more(c, y) > 0 and V - more(c, y) <= clue(number, c)",
  },
  // A group read as shut off when it holds every island.
  sealing: {
    for: "N = islands, c in cells where island(c) and need(c) = 1, y in adj4(c), f = far(c, y) where f != none and need(f) = 1 and has(c, y) = 0 and more(c, y) > 0, G = group(c, run(c, y)) where closed(G) and (forall x in G where island(x) and x != c and x != f: need(x) = 0)",
  },
  // The fewest bridges that break the board read as one too few.
  tooMany: {
    conclude: "forall e in H, d in cand(e) where d >= k: strike(e, d)",
  },
  // The line read as taking the most it could, not one bridge at least.
  mustReachOut: {
    conclude: "forall e in run(c, y), d in cand(e) where d <= maxb: strike(e, d)",
  },
  // Any line two islands could still bridge read as closing a loop.
  "bridges.loop": {
    for: "L = {e in edges where drawn(e) > 0}, c in cells where island(c), y in adj4(c), f = far(c, y) where f != none and has(c, y) = 0 and more(c, y) > 0",
  },
  // A clue one line short read as full.
  "loopy.clueFull": {
    for: "f in faces where clue(number, f) != none, n = need(f) - 1 where n < 0 or (n = 0 and faceOpen(f) > 0)",
  },
  // A clue with one edge open more than it needs read as needing them all.
  "loopy.clueStarved": {
    for: "f in faces where clue(number, f) != none, n = need(f), o = faceOpen(f) where n > 0 and o <= n + 1",
    conclude: "forall e in edges(f) where not known(e): place(e, 1)",
  },
  // An edge blocked at one of its dots read as blocked at both.
  "loopy.clueBlockedPair": {
    for: "f in faces where clue(number, f) != none and need(f) = faceOpen(f) - 1 and faceOpen(f) > 2, e in edges(f) where not known(e) and (exists c in ends(e): dotLines(c) > 0 and (forall g in edges(f) where g != e and c in ends(g): not known(g)))",
  },
  // Any two open edges of the clue side by side read as not both lines.
  "loopy.clueOneShort": {
    for: "f in faces where clue(number, f) != none and need(f) = faceOpen(f) - 1 and faceOpen(f) > 2, a in angles(f) where bare(a)",
  },
  // A dot with two edges open read as a dead end.
  "loopy.deadEnd": {
    for: "c in cells where dotLines(c) = 0 and dotOpen(c) = 2",
  },
  // A line with two ways on read as going on along both.
  "loopy.lineContinues": {
    for: "c in cells, o = dotOpen(c) where dotLines(c) = 1 and o <= 2",
    conclude: "forall e in edges(c) where not known(e): place(e, 1)",
  },
  // A dot with one line read as full.
  "loopy.dotFull": {
    for: "c in cells, k = dotLines(c) + 1 where k > 2 or (k = 2 and dotOpen(c) > 0)",
  },
  // An edge closing the only loop, every clue met, read as closing it early.
  "loopy.earlyLoop": {
    for: "L = {e in edges where value(e) = 1}, e in edges where not known(e), G = through(end1(e), L) where end2(e) in G",
  },
  // One path of lines, not yet closed, read as the loop.
  "loopy.closed": {
    for: "L = {e in edges where value(e) = 1}, g = first(L) where g != none and (exists e in edges: not known(e)) and (forall x in L: end1(x) in through(end1(g), L))",
  },
  // A pair read the other way round.
  "loopy.related": {
    conclude:
      "(pair(e, g) = {1} implies place(e, 3 - value(g))) and (pair(e, g) = {2} implies place(e, value(g)))",
  },
  // A line with three edges open read as needing a line at each corner.
  "loopy.cornerAtDot": {
    conclude: "strike(a, 2) and (dotOpen(c) = 3 implies strike(a, 0))",
  },
  // A corner's at most and at least read the wrong way round.
  "loopy.cornerOther": {
    for: "a in angles where corner(a) != {0, 1, 2}, e in edges(a), g in edges(a) where g != e and known(e) and not known(g) and ((value(e) = 1 and 0 not in corner(a)) or (value(e) = 2 and 2 not in corner(a)))",
  },
  // A corner at a dot with three edges open read as all or nothing.
  "loopy.cornerBoth": {
    for: "a in angles where corner(a) != {0, 1, 2} and bare(a), c = apex(a) where dotLines(c) = 0 and dotOpen(c) = 3",
  },
  // The two counts the edge decides read the wrong way round.
  "loopy.clueBound": {
    for: "f in faces where clue(number, f) != none and (exists a in angles(f): bare(a) and corner(a) != {0, 1, 2}), n = clue(number, f), e in edges(f) where not known(e), S = edges(f) - {e}, P = holds(f, S, n - 1), Q = holds(f, S, n) where not P or not Q",
  },
  // The two counts the corner decides read the wrong way round.
  "loopy.cornerFromClue": {
    for: "f in faces where clue(number, f) != none, n = clue(number, f), k = need(f), o = faceOpen(f) where k <= 1 or k >= o - 1 or (exists b in angles(f): corner(b) != {0, 1, 2}), a in angles(f) where bare(a), S = edges(f) - edges(a), P = holds(f, S, n), Q = holds(f, S, n - 2) where (not P and 2 in corner(a)) or (not Q and 0 in corner(a))",
  },
  // A corner sharing an edge with the one with a line read as across it.
  "loopy.cornerAcross": {
    for: "a in angles where 0 not in corner(a) and bare(a), b in angles(apex(a)) where 2 in corner(b)",
  },
  // A dot with four edges open read as having three.
  "loopy.cornerExit": {
    for: "a in angles where corner(a) = {1} and bare(a), c = apex(a) where dotLines(c) = 0 and dotOpen(c) = 4",
  },
  // A corner sharing an edge with the one with a line read as opposite it.
  "loopy.cornerOppositeExit": {
    for: "a in angles where corner(a) = {1} and bare(a), c = apex(a) where dotLines(c) = 0 and dotOpen(c) = 4, b in angles(c) where bare(b) and corner(b) != {1}",
  },
  // Opposite edges read as matching.
  "loopy.matchingPair": {
    for: "f in faces where clue(number, f) != none, n = need(f), o = faceOpen(f) where n = 1 or o - n = 1, e in edges(f) where not known(e), g in edges(f) where not known(g) and index(g, edges(f)) > index(e, edges(f)) and pair(e, g) = {2}",
  },
  // A clue's last two edges related the wrong way.
  "loopy.pairAtClue": { conclude: "relate(e, g, 2 - need(f) mod 2)" },
  "loopy.parityClue": {
    conclude: "place(k, 1 + (need(f) + first(pair(e, g)) - 1) mod 2)",
  },
  "loopy.linkClue": {
    conclude: "relate(h, k, 2 - (need(f) + first(pair(e, g)) - 1) mod 2)",
  },
  // A corner with exactly one line read as its edges matching.
  "loopy.pairFromCorner": { conclude: "relate(e, g, 1)" },
  // Matching edges read as a corner with exactly one line.
  "loopy.cornerFromPair": {
    for: "a in angles where corner(a) != {1} and bare(a), e = nth(edges(a), 0), g = nth(edges(a), 1) where pair(e, g) = {1}",
  },
  // A dot's last two edges related the wrong way.
  "loopy.pairAtDot": { conclude: "relate(e, g, 2 - dotLines(c) mod 2)" },
  "loopy.parityDot": {
    conclude: "place(k, 1 + (dotLines(c) + first(pair(e, g)) - 1) mod 2)",
  },
  "loopy.linkDot": {
    conclude: "relate(h, k, 2 - (dotLines(c) + first(pair(e, g)) - 1) mod 2)",
  },
  // The first fit across an edge left out of the reasons it is out.
  "rect.line": {
    for: "e in edges where not known(e), a = end1(e), b = end2(e), C = {q in reachers(a) where exists r in fits(q): a in cells(r) and b in cells(r)} where |C| > 0 and (forall q in C, r in fits(q) where a in cells(r) and b in cells(r) and r != nth(fits(q), 0): owned(q, r) or (exists x in sole(q): x not in cells(r)))",
  },
  // A dead end read as fitting no wire.
  "net.fitLock": {
    for: "c in cells, F = {e in edges(c) where not known(e)} where |F| > 0, W = {e in F where fits(c, e, 1) and arms(c) > 1}, N = {e in F where fits(c, e, 2)} where (forall e in F: e not in W or e not in N)",
  },
  "net.fitNote": {
    for: "c in cells, e in edges(c) where not known(e), A = fits(c, e, 1), B = fits(c, e, 2) where not A or not B or arms(c) = 1",
    conclude:
      "(A or B) and ((not A or arms(c) = 1) implies place(e, 2)) and (not B implies place(e, 1))",
  },
  // A side known empty read as a wire a loop could close through.
  "net.loopLock": {
    for: "L = {e in edges where known(e)}, c in cells, F = {e in edges(c) where not known(e)} where |F| > 0, G = through(c, L), W = {e in F where loopFits(c, e, 1, L, G)}, N = {e in F where loopFits(c, e, 2, L, G)} where (forall e in F: e not in W or e not in N)",
  },
  "net.loopNote": {
    for: "L = {e in edges where known(e)}, c in cells, G = through(c, L), e in edges(c) where not known(e), A = loopFits(c, e, 1, L, G), B = loopFits(c, e, 2, L, G) where not A or not B",
  },
  // No square leads a wire on.
  "net.sealLock": {
    for: "L = {e in edges where value(e) = 1}, U = {e in edges where usable(end1(e), e) and usable(end2(e), e)}, P = {e in U where arms(end1(e)) > 4}, c in cells, F = {e in edges(c) where not known(e)} where |F| > 0, G = through(c, L), K = open(c, P, U), W = {e in F where sealFits(c, e, 1, L, G, P, U, K)}, N = {e in F where sealFits(c, e, 2, L, G, P, U, K)} where (forall e in F: e not in W or e not in N)",
  },
  "net.sealNote": {
    for: "L = {e in edges where value(e) = 1}, U = {e in edges where usable(end1(e), e) and usable(end2(e), e)}, P = {e in U where arms(end1(e)) > 4}, c in cells, G = through(c, L), K = open(c, P, U), e in edges(c) where not known(e), A = sealFits(c, e, 1, L, G, P, U, K), B = sealFits(c, e, 2, L, G, P, U, K) where not A or not B",
  },
  // A side known empty read as a wire the square beside would loop through.
  "net.strandLock": {
    for: "L = {e in edges where known(e)}, U = {e in edges where usable(end1(e), e) and usable(end2(e), e)}, P = {e in U where arms(end1(e)) > 1 and arms(end2(e)) > 1}, c in cells, F = {e in edges(c) where not known(e)} where |F| > 0, G = through(c, L), K = open(c, P, U), W = {e in F where strandFits(c, e, 1, L, G, P, U, K)}, N = {e in F where strandFits(c, e, 2, L, G, P, U, K)} where (forall e in F: e not in W or e not in N)",
  },
  "net.strandNote": {
    for: "L = {e in edges where known(e)}, U = {e in edges where usable(end1(e), e) and usable(end2(e), e)}, P = {e in U where arms(end1(e)) > 1 and arms(end2(e)) > 1}, c in cells, G = through(c, L), K = open(c, P, U), e in edges(c) where not known(e), A = strandFits(c, e, 1, L, G, P, U, K), B = strandFits(c, e, 2, L, G, P, U, K) where not A or not B",
  },
  // A white pearl read as taking no line.
  "pearl.square": {
    for: "c in cells where clue(pearl, c) != 1, F = {e in edges(c) where not known(e)} where |F| > 0, W = {e in F where fits(c, e, 1) and clue(pearl, c) != 2}, N = {e in F where fits(c, e, 2)} where (exists e in F: e not in W or e not in N)",
  },
  // A black pearl read as taking no line until it has one.
  "pearl.blackPearl": {
    for: "c in cells where clue(pearl, c) = 1, e in edges(c) where not known(e), A = (turnsAt(c, e, 1) and drawn(c) > 0), B = turnsAt(c, e, 2) where not A or not B",
  },
  // The line through the next square read as turning there.
  "pearl.blackRunsOn": {
    conclude:
      "(exists x in edges(j): x != e and not bent(x, e)) and (forall x in edges(j) where x != e: (bent(x, e) implies place(x, 1)) and (not bent(x, e) implies place(x, 2)))",
  },
  // The next square read as having to turn, not run straight.
  "pearl.blackCannotRunOn": {
    for: "c in cells where clue(pearl, c) = 1, e in edges(c) where not known(e), j = other(e, c) where not turns(j, e)",
  },
  // One square that cannot turn read as enough.
  "pearl.whiteCannotTurn": {
    for: "c in cells where clue(pearl, c) = 2 and (exists x in edges(c): not known(x)), e in edges(c) where value(e) != 2, f in edges(c) where index(f, edges(c)) > index(e, edges(c)) and not bent(e, f) and value(f) != 2 and not turns(other(e, c), e), P = {x in edges(c) where x != e and x != f}",
  },
  // The other square read as having to turn whatever the first does.
  "pearl.whiteTurnsOpposite": {
    for: "c in cells where clue(pearl, c) = 2, e in edges(c) where value(e) = 1, f in edges(c) where f != e and value(f) = 1 and not bent(e, f), k = other(f, c) where runs(k, f), F = {x in edges(k) where not known(x)} where |F| > 0, W = {x in F where turnFits(k, f, x, 1)}, N = {x in F where turnFits(k, f, x, 2)} where (exists x in F: x not in W or x not in N)",
  },
  // The lines read as closed while one still has a loose end.
  "pearl.closed": {
    for: "L = {e in edges where value(e) = 1}, g = first(L) where g != none and (exists e in edges: not known(e)), G = through(end1(g), L)",
  },
  // The edge that closes the whole loop read as closing it early.
  "pearl.earlyLoop": {
    for: "L = {e in edges where value(e) = 1}, e in edges where not known(e), G = through(end1(e), L) where end2(e) in G",
  },
  // Every square read as left out of the loop a way through would close.
  "pearl.earlyThrough": {
    for: "L = {e in edges where value(e) = 1}, Q = {q in cells where true}, c in cells where drawn(c) = 0, F = {e in edges(c) where not known(e)} where |F| > 1, W = {e in F where loopFits(c, e, 1, L, Q)}, N = {e in F where loopFits(c, e, 2, L, Q)} where (exists e in F: e not in W or e not in N)",
  },
  // A tent with two trees beside it still without their tent read as the
  // first one's.
  "tents.tentLink": {
    for: "c in cells where value(c) = 1 and link(c) = none, K = free(c) where |K| < 3",
    conclude: "|K| > 0 and mark(c, nth(K, 0))",
  },
  // A square beside one tree read as beside none.
  "tents.noTree": {
    for: "S = {c in cells where blank(c) and |trees(c)| < 2} where |S| > 0",
  },
  // A square beside a tree with its tent read as grass whatever else is
  // beside it.
  "tents.treesDone": {
    for: "q in clues(tree) where has(q), S = {c in adj4(at(q)) where blank(c)} where |S| > 0",
  },
  // A tent read as touching the squares two along its row too.
  "tents.nextToTent": {
    for: "t in cells where value(t) = 1, S = {x in cells where blank(x) and abs(x(x) - x(t)) <= 2 and abs(y(x) - y(t)) <= 1} where |S| > 0",
  },
  // A tent linked to no tree read as no room for the tree's own.
  "tents.treeSingle": {
    for: "q in clues(tree) where not has(q), R = {x in adj4(at(q)) where blank(x)} where |R| = 1",
  },
  // An open square beside the tree read as no room for its tent.
  "tents.treeLink": {
    for: "q in clues(tree) where not has(q), R = {x in adj4(at(q)) where value(x) = 1 and link(x) = none} where |R| = 1, x = nth(R, 0) where value(x) = 1",
  },
  // A tree with three squares left read as two round a corner.
  "tents.treeDiagonal": {
    for: "q in clues(tree) where not has(q), R = room(q) where |R| = 3, a = nth(R, 0), b = nth(R, 1) where x(a) != x(b) and y(a) != y(b), z = cell(x(a) + x(b) - x(at(q)), y(a) + y(b) - y(at(q))) where blank(z)",
  },
  // A line read as needing one tent more than its count.
  "tents.lineCount": {
    for: "L in lines, k = need(L) + 1, O = open(L) where |O| > 0, T = {x in O where fits(O, k, x, 1)}, G = {x in O where fits(O, k, x, 2)} where (exists x in O: x not in T or x not in G)",
  },
  // A square with two sides left read as left one.
  "tracks.oneWayIn": {
    for: "c in cells where not off(c) and |open(c)| + drawn(c) < 3",
  },
  // A track square with three sides left read as crossing them all.
  "tracks.bothSidesLeft": {
    for: "c in cells where on(c) and drawn(c) < 2, F = open(c) where |F| > 0 and |F| + drawn(c) <= 3",
    conclude: "forall y in F: place(edge(c, y), 1)",
  },
  // A line one track square short read as full.
  "tracks.clueFull": {
    for: "L in lines, O = undecided(L) where |O| > 0 and laid(L) + 1 >= clue(count, L)",
    conclude: "forall c in O: strike(c, 1)",
  },
  // A line one empty square short read as having them all.
  "tracks.clueExact": {
    for: "L in lines, O = undecided(L) where |O| > 0 and |cells(L)| - emptied(L) <= clue(count, L) + 1",
    conclude: "forall c in O: strike(c, 2)",
  },
  // Any open side between two track squares read as closing a loop.
  "tracks.closeLoop": {
    for: "R = {e in edges where value(e) = 1}, e in edges where not known(e) and on(end1(e)) and on(end2(e)) and not shut(end1(e), end2(e)), G = through(end1(e), R)",
  },
  // The side that joins the two ends read as stranding track with none off
  // them.
  "tracks.strand": {
    for: "R = {e in edges where value(e) = 1}, e in edges where not known(e) and on(end1(e)) and on(end2(e)) and not shut(end1(e), end2(e)), G = through(end1(e), R), H = through(end2(e), R) where end2(e) not in G and ended(G) and ended(H)",
  },
  // A line its finished track meets read as short of it.
  "tracks.finishEarly": {
    for: "R = {e in edges where value(e) = 1}, e in edges where not known(e) and on(end1(e)) and on(end2(e)) and not shut(end1(e), end2(e)), G = through(end1(e), R), H = through(end2(e), R) where end2(e) not in G and ended(G) and ended(H) and (exists L in lines: count(c in cells(L) where c in G or c in H) <= clue(count, L))",
  },
  // A line the track could still cross read as one it cannot.
  "tracks.looseEnd": {
    for: "L in lines, F = {c in cells(L) where drawn(c) = 2} where clue(count, L) - |F| = 2, P = {c in cells(L) where drawn(c) = 1 and (endAlong(c, L) or (exists y in adj4(c) where y in cells(L): value(edge(c, y)) = 1))} where |P| = 1, p = nth(P, 0), Q = {y in adj4(p) where y in cells(L) and value(edge(p, y)) != 1}",
  },
  // A square with two ways on besides the next read as having one.
  "tracks.sharedFate": {
    for: "L in lines where clue(count, L) - laid(L) = 1, p in undecided(L), q in adj4(p) where q in undecided(L) and count(y in adj4(p) where y != q and not shut(p, y)) < 3",
  },
  // The same, one empty square short.
  "tracks.sharedFateEmpties": {
    for: "L in lines where |cells(L)| - clue(count, L) - emptied(L) = 1, p in undecided(L), q in adj4(p) where q in undecided(L) and count(y in adj4(p) where y != q and not shut(p, y)) < 3",
  },
  // A side another open side joins the squares of read as the only one.
  "tracks.parity": {
    for: "e in edges where not known(e) and not shut(end1(e), end2(e)), G = through(end1(e), {x in edges where x != e and not known(x) and not shut(end1(x), end2(x))}), k = sum(c in G of count(y in adj4(c) where y not in G and value(edge(c, y)) = 1) + exits(c))",
  },
  // A square with two monsters left read as down to one.
  "undead.single": {
    for: "c in cells where |cand(c)| < 3",
    conclude: "|cand(c)| >= 1 and (known(c) or place(c, first(cand(c))))",
  },
  // A ghost read as showing before the first mirror, as a vampire does.
  "undead.sightline": {
    conclude: `forall c in L, d in cand(c) where not (exists fill f of L from cand
      where f(c) = d: (a < 0 or count(x in sight_direct(s, mirror) where f(x) != 2)
      + count(x in sight_bent(s, mirror) where f(x) != 2)
      + count(x in sight_twice(s, mirror) where f(x) != 2) = a)
      and (b < 0 or shows(f, t) = b)
      and count(x in L where f(x) = 1 and |cand(x)| > 1) <= g
      and count(x in L where f(x) = 2 and |cand(x)| > 1) <= v
      and count(x in L where f(x) = 3 and |cand(x)| > 1) <= z):
      strike(c, d)`,
  },
  // A monster one short of its count read as all placed.
  "undead.total": {
    conclude:
      "|P| <= n and |O| >= n and (|P| < n - 1 or (forall c in O - P: strike(c, d)))",
  },
  // An unnumbered square's links read as fitting after a number only with
  // room to spare.
  "signpost.onlyNext": {
    for: `c in cells where not known(c) and 1 not in cand(c),
      U = {d in cand(c) where may(c, compass(c, clue(arrow, c), d - 1))
      and (num(c) = none or num(compass(c, clue(arrow, c), d - 1)) != none
      or |chain(compass(c, clue(arrow, c), d - 1))| < roomAfter(c))}
      where |U| < 2`,
  },
  // An arrow from a numbered square read as unable to lead in.
  "signpost.onlyBefore": {
    for: `j in cells where clue(number, j) != 1 and not entered(j),
      P = {p in aims(j) where not known(p) and 1 not in cand(p) and may(p, j)
      and clue(number, p) = none}
      where |P| < 2`,
  },
  // A square no fitting of its line can make d read as one every fitting does.
  "pattern.line": {
    for: `L in lines, R = clue(runs, L), d in domain,
      O = {x in cells(L) where not known(x)
      and not (exists fill f of cells(L) from cand where f(x) = d: fits(f, L, R))},
      c in O where index(c, stretch(L, c, O)) = 0`,
  },
  // A line read as needing one tent more than its count.
  "tents.lineNeighbors": {
    for: "L in lines, k = need(L) + 1, O = open(L) where |O| > 0 and k > 0, N = set(z over y in O, z in adj8(y) where blank(z) and z not in cells(L)) where |N| > 0, U = set(z over fill f of O from cand where spread(f, O, k), z in N where (forall y in O where y in adj8(z): f(y) = 2)) where (exists z in N: z not in U)",
  },
};

/** How many of a technique's first binders each query fixes, one query a
 * value of them: `CHECK_SPLIT`, 1 by default. A deeper split makes more,
 * smaller queries, for a technique whose one query a value of its first
 * binder outgrows z3's heap (Mines' `region` on a 4×4 board). */
const SPLIT = Number(process.env["CHECK_SPLIT"] ?? 1);

/** `CHECK_SHARD=i/n`: only every nth of a technique's split queries, from the
 * ith, so that a check too long for one z3 heap, which only grows, runs as n
 * processes, each recorded as it passes and the n folded into the verdict. */
const SHARD = ((s) => {
  if (s === undefined) return null;
  const [index, of] = s.split("/").map(Number);
  if (!(Number.isInteger(index) && Number.isInteger(of) && 0 <= index && index < of))
    throw new Error(`CHECK_SHARD wants i/n with 0 <= i < n, not ${s}`);
  return { index, of };
})(process.env["CHECK_SHARD"]);

const lines: string[] = [];
/** A result line, and to `CHECK_LOG` as it comes, for a long run's watching. */
const say = (s: string): void => {
  console.log(s);
  lines.push(s);
  const log = process.env["CHECK_LOG"];
  if (log) appendFileSync(log, `${s}\n`);
};
/** A progress line, to `CHECK_LOG` only: no part of the results. */
const trace = (s: string): void => {
  const log = process.env["CHECK_LOG"];
  if (log) appendFileSync(log, `${s}\n`);
};
const line = (where: string, v: Verdict, want: string): void => {
  const ok = v.verdict === want || want === "either";
  say(
    `${ok ? "ok " : "BAD"} ${where.padEnd(10)} ${v.technique.padEnd(30)} ${String(v.order).padEnd(2)} ${v.verdict.padEnd(8)} (want ${want.padEnd(8)}) ${String(v.queries).padStart(5)} queries ${v.seconds.toFixed(1).padStart(6)}s${v.at ? `   at ${v.at}` : ""}`,
  );
};

/** A description under one set of its variations. */
interface World {
  where: string;
  d: ReturnType<typeof loadDescription>;
}

/**
 * Each technique sound in every world where the world has an answer, from the
 * least order up to the first where each of its planted defects comes out
 * unsound: the least board on which the check is shown to catch a defect. A
 * larger one costs many times more and, on every game checked to 2026-11-07,
 * caught nothing the least such board did not. A defect still uncaught at the
 * last order fails. A library's techniques are planted {@link ONCE} as well,
 * where `library` says the worlds are its.
 *
 * The whole is held to {@link CHECK_BUDGET_MS}. Where a technique is not
 * proved whole by {@link WHOLE} of it, it is asked on sampled boards, their
 * answers and clues fixed and every position of the marks on each, until
 * {@link SAMPLED} of it; with no defect found it is taken as holding
 * (`held`). A planted defect is caught the same way in the rest, or the check
 * fails: a check that cannot catch a defect in the time says nothing.
 */
async function checkAll(
  worlds: readonly World[],
  id: string,
  library = false,
): Promise<{ failed: string[]; held: boolean }> {
  const bad: string[] = [];
  let held = false;
  const start = performance.now();
  const deadline = start + CHECK_BUDGET_MS;
  const name = id.includes(".") ? id.slice(id.indexOf(".") + 1) : id;
  const game = worlds[0]?.d.json.game;
  const plants = [
    { label: "planted", plant: PLANTS[`${game}.${name}`] ?? PLANTS[name] },
    { label: "planted once", plant: library ? ONCE[name] : undefined },
  ].filter((p): p is { label: string; plant: Plant } => p.plant !== undefined);
  for (const order of ORDERS) {
    const caught = plants.map(() => false);
    let tried = false;
    // Each world at each assignment of the sizes the order leaves free.
    const boards = worlds.flatMap(({ where, d }) =>
      sizings(d, order).map((sizes) => ({
        where: [where, ...[...sizes].map(([n, v]) => sizeLabel(order, n, v))].join(" "),
        d,
        sizes,
      })),
    );
    for (const { where, d, sizes } of boards) {
      // A technique a modifier adds is checked where the modifier is on.
      const t = d.techniques.find((x) => x.id === id);
      const cells = await regionCells(d, order, sizes);
      if (t === undefined || !(await hasAnswer(d, order, sizes, cells))) continue;
      // The boards sampled so far, shared by the technique and its plants.
      const pool: Sample[] = [];
      let exhausted = false;
      // Asked on SAMPLES boards at a time, fresh ones drawn as each batch
      // passes, until a defect, the last answer or `by`.
      const pinned = async (
        tp: Technique,
        split: number,
        by: number,
      ): Promise<Verdict> => {
        const t0 = performance.now();
        let asked = 0;
        let queries = 0;
        let v: Verdict = {
          technique: tp.id,
          order,
          verdict: "sound",
          queries: 0,
          seconds: 0,
        };
        while (performance.now() < by) {
          if (asked === pool.length && !exhausted) {
            const more = await sampleAnswers(d, order, sizes, cells, SAMPLES, by, pool);
            exhausted = more.every;
            pool.push(...more.samples);
          }
          // Every answer asked, or none found in the time left.
          if (asked === pool.length) break;
          const batch = pool.slice(asked, asked + SAMPLES);
          v = await checkTechnique(d, tp, order, sizes, split, cells, {
            shard: SHARD ?? undefined,
            deadline: by,
            pin: batch,
          });
          queries += v.queries;
          if (v.outOfTime) break;
          asked += batch.length;
          if (v.verdict !== "sound") break;
        }
        v = { ...v, queries, seconds: (performance.now() - t0) / 1000 };
        say(
          `..  ${where.padEnd(10)} ${tp.id}: not proved whole in time, asked on ${asked} boards${exhausted && asked === pool.length ? ", one an answer, every answer" : ""}: ${v.verdict === "sound" || v.outOfTime ? "no defect" : v.verdict}`,
        );
        // Out of time after a batch with no defect is no defect found.
        return v.outOfTime ? { ...v, verdict: "sound", outOfTime: undefined } : v;
      };
      let v = await checkTechnique(d, t, order, sizes, SPLIT, cells, {
        shard: SHARD ?? undefined,
        progress: (done, of, at) =>
          trace(`..  ${where} ${id} ${order}: ${done} of ${of}, at ${at}`),
        deadline: Math.min(deadline, start + CHECK_BUDGET_MS * WHOLE),
      });
      if (v.outOfTime) {
        held = true;
        v = await pinned(
          t,
          SPLIT,
          Math.min(deadline, start + CHECK_BUDGET_MS * SAMPLED),
        );
      }
      line(where, v, "sound");
      // Out of time with no defect found holds; a defect, or a verdict z3
      // could not reach for another reason, does not.
      if (v.verdict === "unsound" || (v.verdict === "unknown" && !v.outOfTime))
        bad.push(`${id} ${order}`);
      for (const [i, { label, plant }] of plants.entries()) {
        tried = true;
        // A plant one board of the order has caught is not asked again: the
        // check is shown to catch it, and a later board's whole query may
        // outgrow the heap (Bridges' `tooMany` at three bridges a line).
        if (caught[i]) continue;
        const tp = { ...planted(t, plant), id: `${t.id} (${label})` };
        let p = await checkTechnique(d, tp, order, sizes, 1, cells, {
          deadline: Math.min(deadline, performance.now() + CHECK_BUDGET_MS / 10),
        });
        if (p.outOfTime) p = await pinned(tp, 1, deadline);
        line(
          where,
          p,
          p.verdict === "unsound" || boards.length === 1 ? "unsound" : "either",
        );
        if (p.verdict === "unsound") caught[i] = true;
      }
    }
    if (tried && caught.every((c) => c)) break;
    if (order === ORDERS[ORDERS.length - 1] || performance.now() > deadline)
      for (const [i, c] of caught.entries())
        if (tried && !c) bad.push(`${id} ${plants[i].label} ${order}`);
    if (performance.now() > deadline) break;
  }
  return { failed: bad, held };
}

/** The boards a technique not proved in time is asked on, a batch. */
const SAMPLES = 8;

/** The shares of {@link CHECK_BUDGET_MS} by which a technique's whole proof,
 * and then its asking on sampled boards, stop: the rest is its plants'. */
const WHOLE = 0.4;
const SAMPLED = 0.6;

/**
 * The worlds a description's techniques are checked in: every modifier that
 * deals a partition or a clue always applied, since a partition into single
 * cells and clues that say nothing are among what it deals; each other
 * modifier on and off; and all of it on the description's own board and
 * each ruleset's, so that a ruleset's techniques and the plain game's are
 * each checked on the other's boards.
 */
function worldsOf(file: DescriptionJson, libraries: readonly LibraryJson[]): World[] {
  const variations = Object.entries(file.variations ?? {});
  const modifiers = variations.filter(([, v]) => variationWord(v) === "modifier");
  const rulesets = variations
    .filter(([, v]) => variationWord(v) === "ruleset")
    .map(([n]) => [n]);
  const dealing = (v: VariationJson): boolean =>
    Object.values(v.add?.space?.regions ?? {}).includes("dealt") ||
    Object.keys(v.add?.clues ?? {}).length > 0;
  const always = modifiers.filter(([, v]) => dealing(v)).map(([n]) => n);
  const toggled = modifiers.filter(([, v]) => !dealing(v)).map(([n]) => n);
  return [[], ...rulesets].flatMap((ruleset) =>
    Array.from({ length: 1 << toggled.length }, (_, mask) => {
      const on = [...ruleset, ...always, ...toggled.filter((_, i) => mask & (1 << i))];
      const where = [file.game, ...on.map((n) => `+${n}`)].join(" ");
      const d = loadDescription(withVariations(file, on), libraries);
      const why = unbuilt(d);
      if (why === null) return [{ where, d }];
      say(`--  ${where}: not checked, since ${why}`);
      return [];
    }).flat(),
  );
}

it("the techniques the app compiles are sound, and each planted defect is not", async () => {
  const bad: string[] = [];
  const verdicts: Record<string, string> = {};
  const sources = globSync("src/**/*.description.yaml", { cwd: ROOT }).sort();
  const files = new Map(
    sources.map((s) => [
      s,
      loadDescriptionFile(readFileSync(`${ROOT}${s}`, "utf8"), s),
    ]),
  );
  const libraries = [...files.values()].filter(isLibrary);
  // CHECK_GAMES narrows the run to some descriptions, by game or library
  // name, comma-separated; their verdicts then join the others recorded.
  const only = process.env["CHECK_GAMES"]?.split(",") ?? null;
  // CHECK_TECHNIQUES narrows a game's run further, by technique id.
  const techniques = process.env["CHECK_TECHNIQUES"]?.split(",") ?? null;
  // A technique whose recorded verdict is current is not checked again, unless
  // CHECK_AGAIN=1 or CHECK_TECHNIQUES names it; each verdict is recorded as
  // it is proved, so a run cut short keeps what it finished.
  const path = `${ROOT}src/describe/soundness.json`;
  const readVerdicts = (): Record<string, string> =>
    JSON.parse(readFileSync(path, "utf8")) as Record<string, string>;
  const recorded = readVerdicts();
  const again = process.env["CHECK_AGAIN"] === "1";
  // A shard records under its own key, and a shard run checks only the
  // shards not yet recorded, CHECK_TECHNIQUES or not, so it resumes.
  const at = (key: string): string =>
    SHARD === null ? key : `${key}@${SHARD.index}/${SHARD.of}`;
  const due = (key: string, fp: string, id: string): boolean =>
    again ||
    (SHARD === null && (techniques?.includes(id) ?? false)) ||
    (!checkedAs(fp, recorded[key]) && !checkedAs(fp, recorded[at(key)]));
  /** Record a technique found sound, or found holding on sampled answers
   * alone where `held` says so. */
  const record = (key: string, fp: string, held: boolean): void => {
    const v = held ? heldVerdict(fp) : fp;
    let now = { ...readVerdicts(), [at(key)]: v };
    if (SHARD === null) verdicts[key] = v;
    else {
      const shards = Array.from(
        { length: SHARD.of },
        (_, i) => `${key}@${i}/${SHARD.of}`,
      );
      if (shards.every((s) => checkedAs(fp, now[s]))) {
        const all = shards.every((s) => now[s] === fp) ? fp : heldVerdict(fp);
        now = Object.fromEntries(
          Object.entries(now).filter(([k]) => !shards.includes(k)),
        );
        now[key] = all;
        verdicts[key] = all;
        say(`ok  ${key}: all ${SHARD.of} shards sound, recorded`);
      }
    }
    writeFileSync(
      path,
      `${JSON.stringify(Object.fromEntries(Object.entries(now).sort()), null, 2)}\n`,
    );
  };
  /** Keep a current verdict without checking it, and say so in the results. */
  const keep = (key: string, fp: string, id: string, where: string): void => {
    const k = checkedAs(fp, recorded[key]) ? key : at(key);
    if (k === key) verdicts[key] = recorded[key];
    say(
      `ok  ${where.padEnd(10)} ${id.padEnd(30)} current: recorded ${k} ${recorded[k]}`,
    );
  };
  for (const [source, file] of files) {
    const name = isLibrary(file) ? file.library : file.game;
    if (only !== null && !only.includes(name)) continue;
    if (isLibrary(file)) {
      const square = libraryDescription(file);
      const repeated = libraryDescription(file, true);
      const worlds = [
        { where: file.library, d: { ...square.d, techniques: square.techniques } },
        {
          where: `${file.library} +repeat`,
          d: { ...repeated.d, techniques: repeated.techniques },
        },
      ];
      for (const id of Object.keys(file.techniques)) {
        const key = soundnessKey(source, id);
        const fp = libraryFingerprint(file, id);
        if (!due(key, fp, id)) {
          keep(key, fp, id, file.library);
          continue;
        }
        const { failed, held } = await checkAll(worlds, id, true);
        bad.push(...failed);
        if (failed.length === 0) record(key, fp, held);
      }
      continue;
    }
    if (!isFormal(file) || file.techniques === undefined) continue;
    const worlds = worldsOf(file, libraries);
    // A world or a clue kind no board of an order can hold goes unchecked
    // there, which the verdicts alone would not say.
    const note = say;
    for (const { where, d } of worlds)
      for (const order of ORDERS)
        for (const sizes of sizings(d, order)) {
          const at = [
            where,
            ...[...sizes].map(([n, v]) => sizeLabel(order, n, v)),
          ].join(" ");
          const cells = await regionCells(d, order, sizes);
          if (!(await hasAnswer(d, order, sizes, cells))) {
            note(
              `--  ${at}: no board of order ${order} has an answer, so nothing is checked there`,
            );
            continue;
          }
          for (const kind of await impossibleKinds(d, order, sizes, cells))
            note(
              `--  ${at.padEnd(10)} no board of order ${order} holds a ${kind} clue, so no reading of one is checked there`,
            );
        }
    const own = new Set(
      worlds.flatMap(({ d }) =>
        d.techniques
          .filter((t) => !t.id.includes(".") && (techniques?.includes(t.id) ?? true))
          .map((t) => t.id),
      ),
    );
    for (const stated of withEveryVariation(file).techniques ?? []) {
      if ("use" in stated || !own.has(stated.id)) continue;
      const key = soundnessKey(source, stated.id);
      const fp = gameFingerprint(file, stated);
      if (!due(key, fp, stated.id)) {
        keep(key, fp, stated.id, file.game);
        continue;
      }
      const { failed, held } = await checkAll(worlds, stated.id);
      bad.push(...failed);
      if (failed.length === 0) record(key, fp, held);
    }
  }
  writeFileSync(
    fileURLToPath(
      new URL(
        only === null && techniques === null
          ? "results-describe.txt"
          : `results-describe-${[...(only ?? []), ...(techniques ?? [])].join("-")}.txt`,
        import.meta.url,
      ),
    ),
    `${lines.join("\n")}\n`,
  );
  // Only the planted defects may fail; a verdict is recorded only for a
  // technique found sound. A narrowed run keeps the others' verdicts, less
  // those of the descriptions it checked, or of the techniques where it
  // names them, so runs of one game's techniques may go side by side; every
  // run keeps the dead-end checker's. A verdict written as it was proved is
  // kept by the same rule.
  const checked = [...files]
    .filter(
      ([, f]) => only === null || only.includes(isLibrary(f) ? f.library : f.game),
    )
    .map(([s]) => `${s}#`);
  const isChecked = (k: string): boolean =>
    checked.some((s) =>
      techniques === null
        ? k.startsWith(s)
        : techniques.some((id) => k === `${s}${id}`),
    );
  const kept: Record<string, string> = Object.fromEntries(
    Object.entries(
      JSON.parse(readFileSync(path, "utf8")) as Record<string, string>,
    ).filter(
      ([k]) =>
        isDeadEndKey(k) || ((only !== null || techniques !== null) && !isChecked(k)),
    ),
  );
  writeFileSync(
    path,
    `${JSON.stringify(Object.fromEntries(Object.entries({ ...kept, ...verdicts }).sort()), null, 2)}\n`,
  );
  expect(bad).toEqual([]);
});
