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
  type VariationJson,
  variationWord,
  withEveryVariation,
  withVariations,
} from "../../src/describe/description.ts";
import { loadDescriptionFile } from "../../src/describe/load.ts";
import {
  CHECKED_ORDERS,
  gameFingerprint,
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
 * Each technique sound in every world at every order where the world has an
 * answer, and its planted defect unsound in at least one of them.
 */
async function checkAll(worlds: readonly World[], ids: readonly string[]) {
  const bad: string[] = [];
  for (const id of ids) {
    const name = id.includes(".") ? id.slice(id.indexOf(".") + 1) : id;
    const game = worlds[0]?.d.json.game;
    const plants = [
      { label: "planted", plant: PLANTS[`${game}.${name}`] ?? PLANTS[name] },
      { label: "planted once", plant: ONCE[name] },
    ].filter((p): p is { label: string; plant: Plant } => p.plant !== undefined);
    for (const order of ORDERS) {
      const caught = plants.map(() => false);
      let tried = false;
      // Each world at each assignment of the sizes the order leaves free.
      const boards = worlds.flatMap(({ where, d }) =>
        sizings(d, order).map((sizes) => ({
          where: [where, ...[...sizes].map(([n, v]) => `${n}=${v}`)].join(" "),
          d,
          sizes,
        })),
      );
      for (const { where, d, sizes } of boards) {
        // A technique a modifier adds is checked where the modifier is on.
        const t = d.techniques.find((x) => x.id === id);
        const cells = await regionCells(d, order, sizes);
        if (t === undefined || !(await hasAnswer(d, order, sizes, cells))) continue;
        const v = await checkTechnique(d, t, order, sizes, SPLIT, cells, {
          shard: SHARD ?? undefined,
          progress: (done, of, at) =>
            trace(`..  ${where} ${id} ${order}: ${done} of ${of}, at ${at}`),
        });
        line(where, v, "sound");
        if (v.verdict !== "sound") bad.push(`${id} ${order}`);
        if (order === 3 && (name === "set" || name === "fish" || name === "digitSet"))
          continue;
        for (const [i, { label, plant }] of plants.entries()) {
          tried = true;
          const p = await checkTechnique(
            d,
            { ...planted(t, plant), id: `${t.id} (${label})` },
            order,
            sizes,
            1,
            cells,
          );
          line(
            where,
            p,
            p.verdict === "unsound" || boards.length === 1 ? "unsound" : "either",
          );
          if (p.verdict === "unsound") caught[i] = true;
        }
      }
      for (const [i, c] of caught.entries())
        if (tried && !c) bad.push(`${id} ${plants[i].label} ${order}`);
    }
  }
  return bad;
}

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
    (recorded[key] !== fp && recorded[at(key)] !== fp);
  const record = (key: string, fp: string): void => {
    let now = { ...readVerdicts(), [at(key)]: fp };
    if (SHARD === null) verdicts[key] = fp;
    else {
      const shards = Array.from(
        { length: SHARD.of },
        (_, i) => `${key}@${i}/${SHARD.of}`,
      );
      if (shards.every((s) => now[s] === fp)) {
        now = Object.fromEntries(
          Object.entries(now).filter(([k]) => !shards.includes(k)),
        );
        now[key] = fp;
        verdicts[key] = fp;
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
    const k = recorded[key] === fp ? key : at(key);
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
        const failed = await checkAll(worlds, [id]);
        bad.push(...failed);
        if (failed.length === 0) record(key, fp);
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
          const at = [where, ...[...sizes].map(([n, v]) => `${n}=${v}`)].join(" ");
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
      const failed = await checkAll(worlds, [stated.id]);
      bad.push(...failed);
      if (failed.length === 0) record(key, fp);
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
