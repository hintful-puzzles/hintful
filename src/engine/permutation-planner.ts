/**
 * A staged planner for permutation puzzles: put the pieces in place in reading
 * order, keeping every finished piece where it is, the way a person solves one.
 *
 * The game hands over its moves as what they do to any board (an `Effect`:
 * which cell's piece lands on each cell, and how far it turns), the board, and
 * the finished board. Nothing else here is the game's.
 *
 * A stage is the first cell whose piece is wrong. Its piece travels home by
 * **moves that leave the finished cells alone**, and where no such move reaches
 * (the end of a row, the last rows) by a **sequence**: a run of moves whose net
 * effect leaves every finished cell as it was. The sequences come from a
 * library built once per move set:
 *
 * - commutators of two moves (`a b a⁻¹ b⁻¹`), which move only a few pieces
 *   near where the two overlap;
 * - commutators of two of those that move exactly one piece in common, which
 *   is always a three-piece cycle;
 * - where pieces turn, two sequences that move the same pieces the same way but
 *   turn them differently, one undone after the other: a twist in place;
 * - where a move is an odd permutation of some set of cells the moves keep to
 *   themselves, which no commutator is, that move times small sequences inside
 *   it, and a twist where it also turns a piece it leaves in place;
 * - and every placing of those small sequences that conjugating by single
 *   moves reaches (`s c s⁻¹`), each by its shortest word.
 *
 * A sequence leaves the finished cells alone however the rest of the board
 * lies, so what it does to a stage is where it carries one piece. For each
 * stage a backward Dijkstra over the piece's (cell, turn) gives the cheapest
 * way home and its first sequence, independent of the board.
 *
 * **Recompute-stable, by a potential.** A plan is ranked by the prefix it
 * leaves in place and then by its length. Halfway through a sequence the
 * finished cells are disturbed, so the plan from there is found among the
 * *remainders* of the sequences the stage plans use, each tried on the board:
 * one that restores the prefix continues where the interrupted plan left off,
 * one move shorter. Every hinted move therefore lowers the rank, and a hint
 * recomputed after each move arrives (`hints-search.md` § "Recompute-stable
 * plans"); `permutation-planner.test.ts` walks it on a game-free fixture.
 */

/** A move by its index: `2i` is generator `i`, and `2i + 1` undoes it, so the
 * inverse of move `m` is `m ^ 1`. */
export type Move = number;

/** What a run of moves does to any board: the piece that ends on cell `c`
 * started on `src[c]` and turned `spin[c]` more steps. */
export interface Effect {
  readonly src: Int32Array;
  readonly spin: Uint8Array;
}

/**
 * A move's part in the technique its sequence was built by, which is what a
 * hint teaches:
 *
 * - `turn`: a single move;
 * - a **cycle** `X Y X⁻¹ Y⁻¹` of two moves: `first`, `second`, `firstBack`,
 *   `secondBack` (cut after `firstBack` it is a **tuck**);
 * - a cycle of two smaller cycles: `small1`, `small2`, `small1Back`,
 *   `small2Back`;
 * - **lining up** `S C S⁻¹`: `lineUp`, the inner roles, `lineBack`;
 * - a **twist**, two routes to the same pieces, one played back: `twist`,
 *   `twistBack`;
 * - a **swap**, a single move (`swap`) and then small sequences inside it,
 *   which keep their own roles: together they leave two of its pieces
 *   exchanged;
 * - `learned`, a searched sequence, which has no technique to name.
 */
export type Role =
  | "turn"
  | "first"
  | "second"
  | "firstBack"
  | "secondBack"
  | "small1"
  | "small2"
  | "small1Back"
  | "small2Back"
  | "lineUp"
  | "lineBack"
  | "twist"
  | "twistBack"
  | "swap"
  | "learned";

/** The problem the planner is handed. */
export interface PermutationPuzzle {
  /** What each generator move does; the planner adds their inverses. */
  readonly generators: readonly Effect[];
  /** How many ways a piece can face: 1 where pieces only move. A piece is in
   * place facing turn 0. */
  readonly spins: number;
  /** The board, one value a cell. Pieces of one value are interchangeable. */
  readonly values: Int32Array;
  /** Each cell's piece's turn, or null where pieces do not turn. */
  readonly turned: Uint8Array | null;
  /** The finished board's values. */
  readonly goal: Int32Array;
}

/**
 * A run of the plan: the moves one sequence (or one free move) makes, all for
 * the stage `stage`, the cell being filled.
 */
export interface Segment {
  readonly stage: number;
  readonly moves: readonly Move[];
  /** Each move's part in the technique: a remainder keeps its sequence's
   * roles from where it starts, and a cut drops the roles it cuts. */
  readonly roles: readonly Role[];
  /** The segment is the rest of a sequence, whose first moves it lacks. */
  readonly remainder: boolean;
}

export interface PermutationPlan {
  readonly segments: readonly Segment[];
  /** Whether the segments end on the finished board, as opposed to where the
   * library runs out. */
  readonly solves: boolean;
}

/** The effect of `play` on a board of `size` cells, each piece facing turn 0
 * on its own cell: what a game's own move function does, as the planner
 * takes it. */
export function effectOf(
  size: number,
  play: (src: Int32Array, spin: Uint8Array) => void,
): Effect {
  const src = Int32Array.from({ length: size }, (_, i) => i);
  const spin = new Uint8Array(size);
  play(src, spin);
  return { src, spin };
}

interface Word {
  readonly effect: Effect;
  readonly moves: readonly Move[];
  /** Each move's part, one for one with `moves`. */
  readonly roles: readonly Role[];
}

/**
 * The moves with every move canceled by its own inverse next to it, which a
 * conjugate's setup and its inner word can bring together: such a pair does
 * nothing, and a hint would say "turn it" and then "turn it back".
 */
function reduced(moves: readonly Move[], roles: readonly Role[]): [Move[], Role[]] {
  const ms: Move[] = [];
  const rs: Role[] = [];
  moves.forEach((m, i) => {
    if (ms.length > 0 && ms[ms.length - 1] === (m ^ 1)) {
      ms.pop();
      rs.pop();
    } else {
      ms.push(m);
      rs.push(roles[i]);
    }
  });
  return [ms, rs];
}

const fill = (n: number, r: Role): Role[] => Array.from({ length: n }, () => r);

/** A library sequence, with what the planner reads off it. */
interface Sequence extends Word {
  /** Where the piece on each cell ends up. */
  readonly dest: Int32Array;
  /** The first cell the sequence changes: it leaves every cell before it. */
  readonly fix: number;
  /** The cells it changes. */
  readonly support: readonly number[];
}

const INF = 1 << 29;

/** The largest set of small sequences a library holds, against a board large
 * enough to make one unaffordable. No preset comes near it. */
const CLOSURE_CAP = 200_000;

/** How many cells a small sequence may change. Four is what the last cells
 * need: three for a cycle, four for a pair of swaps. */
const SMALL = 4;

/** The boards a learning search may hold, both ends together. A move set the
 * library covers never learns; this bounds what a hint on one it does not
 * costs, at about a second. */
const LEARN_BUDGET = 400_000;

/** How many small sequences inside a move it is multiplied by, for the
 * sequences of a parity commutators keep. */
const ODD_FACTORS = 48;

/** How many pieces a twist the library keeps may turn: the piece a stage
 * places, and one after it that a later stage turns right. Keeping the
 * twists of four made 5×5 n3 orientable's library twenty times larger. */
const TWIST_CELLS = 2;

function compose(g: Effect, h: Effect, spins: number): Effect {
  const size = g.src.length;
  const src = new Int32Array(size);
  const spin = new Uint8Array(size);
  for (let c = 0; c < size; c++) {
    src[c] = g.src[h.src[c]];
    spin[c] = (g.spin[h.src[c]] + h.spin[c]) % spins;
  }
  return { src, spin };
}

function inverse(e: Effect, spins: number): Effect {
  const size = e.src.length;
  const src = new Int32Array(size);
  const spin = new Uint8Array(size);
  for (let c = 0; c < size; c++) {
    src[e.src[c]] = c;
    spin[e.src[c]] = (spins - e.spin[c]) % spins;
  }
  return { src, spin };
}

function keyOf(e: Effect): string {
  return String.fromCharCode(...e.src) + String.fromCharCode(...e.spin);
}

function supportOf(e: Effect): number[] {
  const out: number[] = [];
  for (let c = 0; c < e.src.length; c++)
    if (e.src[c] !== c || e.spin[c] !== 0) out.push(c);
  return out;
}

/** The cells whose piece `e` moves elsewhere. */
function movedOf(e: Effect): number[] {
  const out: number[] = [];
  for (let c = 0; c < e.src.length; c++) if (e.src[c] !== c) out.push(c);
  return out;
}

const undo = (moves: readonly Move[]): Move[] => moves.toReversed().map((m) => m ^ 1);

/** A word as the library holds it, or null for one that changes nothing. */
function sequenceOf(c: Word): Sequence | null {
  const support = supportOf(c.effect);
  if (support.length === 0) return null;
  const dest = new Int32Array(c.effect.src.length);
  for (let cell = 0; cell < dest.length; cell++) dest[c.effect.src[cell]] = cell;
  return { ...c, dest, fix: support[0], support };
}

/**
 * Whether some move is an odd permutation of a set of cells the moves keep to
 * themselves (an orbit). A commutator is even on every orbit, so such a move
 * needs the products of a move with small sequences inside it. Twiddle's
 * block of side 2 mod 4 is odd on the whole board, and its odd block a
 * four-cycle on each square color; Sixteen's even-length line is odd.
 */
function hasOddMove(generators: readonly Effect[], size: number): boolean {
  const orbit = Int32Array.from({ length: size }, (_, i) => i);
  const find = (c: number): number => {
    while (orbit[c] !== c) c = orbit[c] = orbit[orbit[c]];
    return c;
  };
  for (const g of generators)
    for (let c = 0; c < size; c++) orbit[find(c)] = find(g.src[c]);
  return generators.some((g) => {
    // Each cycle of length L flips the orbit's sign L - 1 times.
    const flips = new Map<number, number>();
    const seen = new Uint8Array(size);
    for (let c = 0; c < size; c++) {
      if (seen[c]) continue;
      let length = 0;
      for (let at = c; !seen[at]; at = g.src[at]) {
        seen[at] = 1;
        length++;
      }
      const o = find(c);
      flips.set(o, (flips.get(o) ?? 0) + length - 1);
    }
    return [...flips.values()].some((f) => f % 2 === 1);
  });
}

/** Which pieces an effect moves where, whatever it turns them by. */
const permutationKey = (e: Effect): string => String.fromCharCode(...e.src);

function shortestByPermutation(words: readonly Word[]): Map<string, Word> {
  const shortest = new Map<string, Word>();
  for (const c of words) {
    const k = permutationKey(c.effect);
    const had = shortest.get(k);
    if (!had || had.moves.length > c.moves.length) shortest.set(k, c);
  }
  return shortest;
}

/**
 * Each move times one or two small sequences inside it, which is how a
 * parity no commutator keeps is changed: the shortest of each effect that
 * changes few cells (`products`), and of those that needed a twist to turn
 * back a piece the move turned where it stands, an odd block's center
 * (`cleaned`). A pure twist moves nothing, so it is no factor.
 */
function parityProducts(
  single: readonly Word[],
  closure: readonly Word[],
  spins: number,
  word: (moves: readonly Move[], roles: readonly Role[]) => Word,
): { products: Word[]; cleaned: Word[] } {
  const size = single[0].effect.src.length;
  const products = new Map<string, Word>();
  const cleaned = new Map<string, Word>();
  /** Products that move few pieces but turn a piece or two more where they
   * stand, by the shortest factors found for each permutation and turn of
   * those pieces. */
  const rough = new Map<string, { effect: Effect; length: number; factors: Word[] }>();
  const consider = (e: Effect, factors: Word[], into = products) => {
    let changed = 0;
    let moved = 0;
    for (let c = 0; c < size && changed <= SMALL + 2; c++)
      if (e.src[c] !== c) {
        changed++;
        moved++;
      } else if (e.spin[c] !== 0) changed++;
    if (changed === 0 || moved > SMALL || changed > SMALL + 2) return;
    if (changed <= SMALL) {
      const [g, ...xs] = factors;
      const w = word(
        [...g.moves, ...xs.flatMap((x) => x.moves)],
        ["swap", ...xs.flatMap((x) => x.roles)],
      );
      const k = keyOf(e);
      const had = into.get(k);
      if (!had || had.moves.length > w.moves.length) into.set(k, w);
      return;
    }
    const length = factors.reduce((n, f) => n + f.moves.length, 0);
    const k =
      permutationKey(e) +
      String.fromCharCode(...e.spin.map((o, c) => (e.src[c] === c ? o : 0)));
    const had = rough.get(k);
    if (!had || had.length > length) rough.set(k, { effect: e, length, factors });
  };
  // Factors by permutation, the shortest placing first: which pieces a
  // product moves depends only on its factors' permutations, and only a
  // product that moves few is worth trying every way of turning.
  const variants = new Map<string, Word[]>();
  for (const c of closure) {
    if (movedOf(c.effect).length === 0) continue;
    const k = permutationKey(c.effect);
    variants.set(k, [...(variants.get(k) ?? []), c]);
  }
  for (const vs of variants.values())
    vs.sort((a, b) => a.moves.length - b.moves.length);
  const movesFew = (e: Effect) => {
    let moved = 0;
    for (let c = 0; c < size && moved <= SMALL; c++) if (e.src[c] !== c) moved++;
    return moved <= SMALL;
  };
  for (const g of single) {
    const inG = new Set(supportOf(g.effect));
    const inside = [...variants.values()]
      .filter(([c]) => supportOf(c.effect).every((cell) => inG.has(cell)))
      .sort(([a], [b]) => a.moves.length - b.moves.length)
      .slice(0, ODD_FACTORS);
    for (const xs of inside) {
      const gx = compose(g.effect, xs[0].effect, spins);
      if (movesFew(gx))
        for (const x of xs) consider(compose(g.effect, x.effect, spins), [g, x]);
      for (const ys of inside) {
        if (!movesFew(compose(gx, ys[0].effect, spins))) continue;
        for (const x of xs) {
          const gxv = compose(g.effect, x.effect, spins);
          for (const y of ys) consider(compose(gxv, y.effect, spins), [g, x, y]);
        }
      }
    }
  }
  const pure = closure
    .filter((c) => movedOf(c.effect).length === 0)
    .map((t) => ({ t, on: supportOf(t.effect) }));
  for (const r of [...rough.values()]) {
    const inR = new Set(supportOf(r.effect));
    for (const { t, on } of pure)
      if (on.every((c) => inR.has(c)))
        consider(compose(r.effect, t.effect, spins), [...r.factors, t], cleaned);
  }
  return { products: [...products.values()], cleaned: [...cleaned.values()] };
}

/** Everything the planner needs for one move set. */
class Library {
  readonly size: number;
  readonly spins: number;
  /** Each single move's effect, and where it sends each cell's piece. */
  private readonly moves: readonly Effect[];
  private readonly moveDest: readonly Int32Array[];
  private readonly identity: Effect;
  readonly sequences: Sequence[];
  /** Per stage, per piece state `cell * spins + turn`: the cost home. */
  readonly cost: Int32Array[];
  /** Per stage, per piece state: the sequence to play first, or -1. */
  readonly policy: Int32Array[];
  /** The remainders of the sequences some stage plan uses, by `fix`. */
  readonly restByFix: Sequence[][];
  /** The same remainders, by each cell they move a piece off. */
  readonly restByCell: Sequence[][];
  private readonly restKeys = new Map<string, Sequence>();
  /** The sequences whose remainders are in. */
  private readonly restsOf = new Set<Sequence>();

  constructor(generators: readonly Effect[], spins: number) {
    const size = generators[0].src.length;
    this.size = size;
    this.spins = spins;
    const identity = effectOf(size, () => {});
    this.identity = identity;
    const moves = generators.flatMap((g) => [g, inverse(g, spins)]);
    this.moves = moves;
    this.moveDest = moves.map((e) => {
      const d = new Int32Array(size);
      for (let c = 0; c < size; c++) d[e.src[c]] = c;
      return d;
    });
    const word = (ms: readonly Move[], roles: readonly Role[]): Word =>
      this.word(ms, roles);
    /** `a b a⁻¹ b⁻¹`: a cycle of two moves, or of two smaller cycles. */
    const commutator = (a: Word, b: Word, of: "moves" | "cycles"): Word => {
      const [r1, r2, r3, r4]: Role[] =
        of === "moves"
          ? ["first", "second", "firstBack", "secondBack"]
          : ["small1", "small2", "small1Back", "small2Back"];
      return word(
        [...a.moves, ...b.moves, ...undo(a.moves), ...undo(b.moves)],
        [
          ...fill(a.moves.length, r1),
          ...fill(b.moves.length, r2),
          ...fill(a.moves.length, r3),
          ...fill(b.moves.length, r4),
        ],
      );
    };
    const conjugate = (s: Word, c: Word): Word => {
      const [ms, roles] = reduced(
        [...s.moves, ...c.moves, ...undo(s.moves)],
        [
          ...fill(s.moves.length, "lineUp"),
          ...c.roles,
          ...fill(s.moves.length, "lineBack"),
        ],
      );
      return {
        effect: compose(
          compose(s.effect, c.effect, spins),
          inverse(s.effect, spins),
          spins,
        ),
        moves: ms,
        roles,
      };
    };
    const single: Word[] = moves.map((effect, m) => ({
      effect,
      moves: [m],
      roles: ["turn"],
    }));
    const setups: Word[] = [{ effect: identity, moves: [], roles: [] }, ...single];

    // Commutators of two generators' single and double steps.
    const powers = (g: number): Move[][] => [[2 * g], [2 * g + 1], [2 * g, 2 * g]];
    const first: Word[] = [];
    {
      const seen = new Set<string>();
      for (let a = 0; a < generators.length; a++)
        for (let b = 0; b < generators.length; b++) {
          if (a === b) continue;
          for (const x of powers(a))
            for (const y of powers(b)) {
              const c = commutator(
                word(x, fill(x.length, "turn")),
                word(y, fill(y.length, "turn")),
                "moves",
              );
              const k = keyOf(c.effect);
              if (seen.has(k) || supportOf(c.effect).length === 0) continue;
              seen.add(k);
              first.push(c);
            }
        }
    }

    // Commutators of the smallest of those with a placing of another that
    // moves exactly one piece in common with it: a three-piece cycle. Small
    // by the pieces they move, not by the cells they change: a commutator's
    // turns cancel on every cell neither part moves a piece off, so the
    // pieces an odd block turns where they stand drop out here.
    const second: Word[] = [];
    if (first.length > 0) {
      const least = Math.min(...first.map((c) => movedOf(c.effect).length));
      const narrow = first.filter((c) => movedOf(c.effect).length <= least + 1);
      const seen = new Set<string>();
      for (const a of narrow) {
        const inA = new Set(movedOf(a.effect));
        for (const s of setups)
          for (const b0 of narrow) {
            const b = conjugate(s, b0);
            let meet = 0;
            for (const c of movedOf(b.effect)) if (inA.has(c) && ++meet > 1) break;
            if (meet !== 1) continue;
            const c = commutator(a, b, "cycles");
            const k = keyOf(c.effect);
            if (seen.has(k)) continue;
            seen.add(k);
            second.push(c);
          }
      }
    }

    const small = [...first, ...second].filter((c) => supportOf(c.effect).length <= 6);
    // Twists: two small sequences that move the same pieces the same way.
    const twists: Word[] = [];
    if (spins > 1) {
      const byPerm = new Map<string, Word[]>();
      for (const c of small) {
        const k = permutationKey(c.effect);
        byPerm.set(k, [...(byPerm.get(k) ?? []), c]);
      }
      for (const same of byPerm.values())
        for (const a of same)
          for (const b of same)
            if (a !== b)
              twists.push(
                word(
                  [...a.moves, ...undo(b.moves)],
                  [
                    ...fill(a.moves.length, "twist"),
                    ...fill(b.moves.length, "twistBack"),
                  ],
                ),
              );
    }

    // Every placing of the small sequences, by conjugating with single moves.
    const closure = new Map<string, Word>();
    /** Close `from` under conjugation. `onePerPermutation` keeps the shortest
     * placing of each permutation however it turns the pieces, where twists
     * turn them after. */
    const close = (from: readonly Word[], onePerPermutation = false) => {
      const keyFor = onePerPermutation ? permutationKey : keyOf;
      let front: Word[] = [];
      for (const c of from) {
        if (supportOf(c.effect).length > SMALL) continue;
        const k = keyFor(c.effect);
        const had = closure.get(k);
        if (had && had.moves.length <= c.moves.length) continue;
        closure.set(k, c);
        front.push(c);
      }
      while (front.length > 0 && closure.size < CLOSURE_CAP) {
        const next: Word[] = [];
        for (const c of front)
          for (const s of single) {
            const d = conjugate(s, c);
            const k = keyFor(d.effect);
            const had = closure.get(k);
            if (had && had.moves.length <= d.moves.length) continue;
            closure.set(k, d);
            next.push(d);
          }
        front = next;
      }
    };
    /** Twists from every placing: two placings that move the same pieces
     * but turn them differently, one undone after the other. The first
     * commutators alone may show none (an odd block turns its center in
     * place, so none is small), and a parity product turns pieces in ways no
     * commutator does. */
    const twistsAmong = (words: readonly Word[]): Word[] => {
      const shortest = shortestByPermutation(words);
      const out: Word[] = [];
      for (const c of words) {
        const base = shortest.get(permutationKey(c.effect)) as Word;
        if (
          base !== c &&
          supportOf(compose(c.effect, inverse(base.effect, spins), spins)).length <=
            TWIST_CELLS
        )
          out.push(
            word(
              [...c.moves, ...undo(base.moves)],
              [
                ...fill(c.moves.length, "twist"),
                ...fill(base.moves.length, "twistBack"),
              ],
            ),
          );
      }
      return out;
    };
    const twistPlacings = () => close(twistsAmong([...closure.values()]));
    close([...small, ...twists]);
    if (spins > 1) twistPlacings();
    if (hasOddMove(generators, size)) {
      const { products, cleaned } = parityProducts(
        single,
        [...closure.values()],
        spins,
        word,
      );
      close(products);
      if (cleaned.length > 0) {
        // Two products that move the same pieces, placed by different moves,
        // differ by a twist no commutator gives: the parity a product changes
        // turns them too. Then one placing of each permutation: every turned
        // placing of these is hundreds of thousands of sequences on 5×5.
        const pool = [...cleaned];
        for (const p of cleaned) for (const s of single) pool.push(conjugate(s, p));
        close(twistsAmong(pool));
        close([...shortestByPermutation(cleaned).values()], true);
      }
    }

    // The library: single moves, the first commutators placed by one move,
    // and the small sequences.
    const library = new Map<string, Sequence>();
    const offer = (c: Word) => {
      const s = sequenceOf(c);
      if (!s) return;
      const k = keyOf(c.effect);
      const had = library.get(k);
      if (!had || had.moves.length > c.moves.length) library.set(k, s);
    };
    for (const s of single) offer(s);
    for (const s of setups) for (const c of first) offer(conjugate(s, c));
    for (const c of closure.values()) offer(c);
    this.sequences = [...library.values()];

    this.cost = [];
    this.policy = [];
    for (let stage = 0; stage < size; stage++) {
      const [c, p] = this.stageTable(stage);
      this.cost.push(c);
      this.policy.push(p);
    }

    // The remainders of the sequences a stage plan plays.
    this.restByFix = Array.from({ length: size }, () => []);
    this.restByCell = Array.from({ length: size }, () => []);
    const used = new Set<number>();
    for (const p of this.policy) for (const i of p) if (i >= 0) used.add(i);
    for (const i of used) this.addRests(this.sequences[i]);
  }

  /** What one move does. */
  moveEffect(m: Move): Effect {
    return this.moves[m];
  }

  private word(moves: readonly Move[], roles: readonly Role[]): Word {
    const [ms, rs] = reduced(moves, roles);
    return {
      effect: ms.reduce<Effect>(
        (e, m) => compose(e, this.moves[m], this.spins),
        this.identity,
      ),
      moves: ms,
      roles: rs,
    };
  }

  /** The remainders of `s` after each of its moves but the last, so that a
   * plan asked halfway along it can carry on. */
  private addRests(s: Sequence): void {
    if (this.restsOf.has(s)) return;
    this.restsOf.add(s);
    for (let k = 1; k < s.moves.length; k++) {
      const rest = sequenceOf(this.word(s.moves.slice(k), s.roles.slice(k)));
      if (!rest) continue;
      const key = keyOf(rest.effect);
      const had = this.restKeys.get(key);
      if (had && had.moves.length <= rest.moves.length) continue;
      if (had) {
        this.restByFix[had.fix] = this.restByFix[had.fix].filter((r) => r !== had);
        for (const cell of had.support) {
          const off = had.effect.src[cell];
          this.restByCell[off] = this.restByCell[off].filter((r) => r !== had);
        }
      }
      this.restKeys.set(key, rest);
      this.restByFix[rest.fix].push(rest);
      for (const cell of rest.support)
        if (rest.effect.src[cell] !== cell)
          this.restByCell[rest.effect.src[cell]].push(rest);
    }
  }

  /** Take a learned way into the library for `stage`. */
  private adopt(moves: readonly Move[], stage: number): void {
    const s = sequenceOf(this.word(moves, fill(moves.length, "learned")));
    if (!s) return;
    this.sequences.push(s);
    const [c, p] = this.stageTable(stage);
    this.cost[stage] = c;
    this.policy[stage] = p;
    for (const i of p) if (i >= 0) this.addRests(this.sequences[i]);
  }

  /**
   * Learn a way to put the piece on `from` into the cell `stage`, leaving the
   * cells before it alone, where the library holds none, by a search from
   * both ends that follows only those pieces. The way joins the
   * library, the stage's table is worked out again, and its remainders join
   * the rest, so a hint asked halfway along it carries on. A library that only
   * gains sequences only lowers what a plan costs, so the potential still
   * falls with every hinted move. Returns whether it found one in budget.
   */
  learn(b: Board, stage: number, from: number): boolean {
    // Tracked pieces: the finished cells' and the one from `from`, each as
    // `cell * spins + turn`.
    const spins = this.spins;
    const k = stage + 1;
    const start = new Uint16Array(k);
    const goal = new Uint16Array(k);
    for (let t = 0; t < stage; t++) {
      start[t] = t * spins;
      goal[t] = t * spins;
    }
    start[stage] = from * spins + b.turned[from];
    goal[stage] = stage * spins;
    const moves = this.moves;
    const step = (a: Uint16Array, m: Move): Uint16Array => {
      const e = moves[m];
      const out = new Uint16Array(k);
      for (let i = 0; i < k; i++) {
        const cell = Math.floor(a[i] / spins);
        const to = this.moveDest[m][cell];
        out[i] = to * spins + ((a[i] + e.spin[to]) % spins);
      }
      return out;
    };
    const key = (a: Uint16Array) => String.fromCharCode(...a);
    type Seen = Map<string, { prev: string | null; move: Move }>;
    const fwd: Seen = new Map([[key(start), { prev: null, move: -1 }]]);
    const bwd: Seen = new Map([[key(goal), { prev: null, move: -1 }]]);
    if (fwd.has(key(goal))) return false;
    let ff: Uint16Array[] = [start];
    let fb: Uint16Array[] = [goal];
    while (ff.length > 0 && fb.length > 0 && fwd.size + bwd.size < LEARN_BUDGET) {
      const forward = ff.length <= fb.length;
      const [mine, other, front] = forward ? [fwd, bwd, ff] : [bwd, fwd, fb];
      const next: Uint16Array[] = [];
      let meet: string | null = null;
      for (const a of front) {
        const ka = key(a);
        for (let m = 0; m < moves.length && meet === null; m++) {
          // Backward, a state's predecessor is reached by the inverse move.
          const b2 = step(a, forward ? m : m ^ 1);
          const kb = key(b2);
          if (mine.has(kb)) continue;
          mine.set(kb, { prev: ka, move: m });
          if (other.has(kb)) meet = kb;
          next.push(b2);
        }
        if (meet !== null) break;
      }
      if (meet !== null) {
        const path: Move[] = [];
        for (let c: string | null = meet; c !== null; ) {
          const e = fwd.get(c) as { prev: string | null; move: Move };
          if (e.prev === null) break;
          path.unshift(e.move);
          c = e.prev;
        }
        for (let c: string | null = meet; c !== null; ) {
          const e = bwd.get(c) as { prev: string | null; move: Move };
          if (e.prev === null) break;
          path.push(e.move);
          c = e.prev;
        }
        this.adopt(path, stage);
        return true;
      }
      if (forward) ff = next;
      else fb = next;
    }
    return false;
  }

  /** The cheapest way home for the piece of `stage` from every state, over the
   * sequences that leave the cells before `stage` alone. */
  private stageTable(stage: number): [Int32Array, Int32Array] {
    const spins = this.spins;
    const states = this.size * spins;
    // Edges into each state: (from state, cost, sequence).
    const into: number[][] = Array.from({ length: states }, () => []);
    this.sequences.forEach((s, i) => {
      if (s.fix < stage) return;
      for (const cell of s.support) {
        const to = s.dest[cell];
        for (let o = 0; o < spins; o++)
          into[to * spins + ((o + s.effect.spin[to]) % spins)].push(
            cell * spins + o,
            s.moves.length,
            i,
          );
      }
    });
    const cost = new Int32Array(states).fill(INF);
    const policy = new Int32Array(states).fill(-1);
    cost[stage * spins] = 0;
    const buckets: number[][] = [[stage * spins]];
    for (let d = 0; d < buckets.length; d++) {
      for (const u of buckets[d] ?? []) {
        if (cost[u] !== d) continue;
        const edges = into[u];
        for (let k = 0; k < edges.length; k += 3) {
          const v = edges[k];
          const nd = d + edges[k + 1];
          if (nd < cost[v]) {
            cost[v] = nd;
            policy[v] = edges[k + 2];
            buckets[nd] ??= [];
            buckets[nd].push(v);
          }
        }
      }
    }
    return [cost, policy];
  }
}

const libraries = new Map<string, Library>();

/** The library for a move set, built on first use and kept. */
function libraryFor(generators: readonly Effect[], spins: number): Library {
  const key = `${spins}:${generators.map(keyOf).join("|")}`;
  let lib = libraries.get(key);
  if (!lib) {
    // A session plays one shape at a time; keep the last couple.
    if (libraries.size >= 2) libraries.delete(libraries.keys().next().value as string);
    lib = new Library(generators, spins);
    libraries.set(key, lib);
  }
  return lib;
}

/** A board as the planner moves it. */
interface Board {
  values: Int32Array;
  turned: Uint8Array;
}

function played(b: Board, e: Effect, spins: number): Board {
  const size = b.values.length;
  const values = new Int32Array(size);
  const turned = new Uint8Array(size);
  for (let c = 0; c < size; c++) {
    values[c] = b.values[e.src[c]];
    turned[c] = (b.turned[e.src[c]] + e.spin[c]) % spins;
  }
  return { values, turned };
}

/**
 * The plan from this board: each segment a library sequence or a remainder of
 * one, in the order they are played.
 */
export function planByStage(puzzle: PermutationPuzzle): PermutationPlan {
  const { spins, goal } = puzzle;
  const lib = libraryFor(puzzle.generators, spins);
  const size = lib.size;
  let board: Board = {
    values: Int32Array.from(puzzle.values),
    turned: puzzle.turned ? Uint8Array.from(puzzle.turned) : new Uint8Array(size),
  };
  const segments: Segment[] = [];

  /** How many cells, from the start, `e` leaves right on `b`; it is known to
   * leave the cells before `from` alone. */
  const prefix = (b: Board, e: Effect | null, from: number): number => {
    let c = from;
    for (; c < size; c++) {
      const s = e ? e.src[c] : c;
      if (b.values[s] !== goal[c]) break;
      if ((b.turned[s] + (e ? e.spin[c] : 0)) % spins !== 0) break;
    }
    return c;
  };

  /** The cheapest piece state for `stage` on `b` after `e`: any piece of the
   * stage's value not yet among the finished cells. */
  const stageState = (b: Board, e: Sequence | null, stage: number) => {
    let best = INF;
    let at = -1;
    for (let q = 0; q < size; q++) {
      if (b.values[q] !== goal[stage]) continue;
      const cell = e ? e.dest[q] : q;
      if (cell < stage) continue;
      const o = (b.turned[q] + (e ? e.effect.spin[cell] : 0)) % spins;
      const c = lib.cost[stage][cell * spins + o];
      if (c < best) {
        best = c;
        at = cell * spins + o;
      }
    }
    return { cost: best, at };
  };

  /** `moves` played from `b` up to the first move that leaves every cell to
   * `stage` right: a sequence's last moves can only put back pieces after the
   * stage's, which the plan from there does not need. */
  const cutAt = (
    b: Board,
    moves: readonly Move[],
    roles: readonly Role[],
    stage: number,
  ) => {
    let at = b;
    for (let k = 0; k < moves.length; k++) {
      at = played(at, lib.moveEffect(moves[k]), spins);
      if (prefix(at, null, 0) > stage)
        return {
          moves: moves.slice(0, k + 1),
          roles: roles.slice(0, k + 1),
          board: at,
        };
    }
    return { moves, roles, board: at };
  };

  // Where pieces repeat a value, a remainder can rebuild a finished cell with
  // another piece of its value: it may start anywhere.
  const identical = new Set(goal).size < size;
  let learned = false;

  for (let guard = 0; guard < 4 * size * size; guard++) {
    const done = prefix(board, null, 0);
    if (done === size) return { segments, solves: true };

    // The direct plan: this stage's piece home. Its rank is (stage + 1, cost).
    const direct = stageState(board, null, done);
    let bestReach = direct.cost < INF ? done + 1 : -1;
    let bestCost = direct.cost;
    let bestRest: Sequence | null = null;

    // A remainder first, where one restores the prefix or carries the piece.
    const tried = new Set<Sequence>(lib.restByFix[done]);
    for (let q = done; q < size; q++)
      if (board.values[q] === goal[done])
        for (const r of lib.restByCell[q]) if (r.fix > done) tried.add(r);
    if (identical)
      for (let f = 0; f < done; f++) for (const r of lib.restByFix[f]) tried.add(r);
    for (const r of tried) {
      const reached = prefix(board, r.effect, Math.min(done, r.fix));
      if (reached < done) continue;
      let reach: number;
      let cost: number;
      if (reached === size) {
        reach = size + 1;
        cost = r.moves.length;
      } else {
        const next = stageState(board, r, reached);
        if (next.cost < INF) {
          reach = reached + 1;
          cost = r.moves.length + next.cost;
        } else if (reached > done) {
          reach = reached;
          cost = r.moves.length;
        } else continue;
      }
      if (reach > bestReach || (reach === bestReach && cost < bestCost)) {
        bestReach = reach;
        bestCost = cost;
        bestRest = r;
      }
    }
    if (bestReach < 0) {
      // The library holds no way on from here: learn one for this stage's
      // piece, and plan again. At most once a plan, and only where it has
      // nothing yet to offer: the moves so far are a plan, and the hint asked
      // at their end learns the next.
      if (learned || segments.length > 0) return { segments, solves: false };
      learned = true;
      let from = -1;
      for (let q = done; q < size && from < 0; q++)
        if (board.values[q] === goal[done]) from = q;
      if (from >= 0 && lib.learn(board, done, from)) continue;
      return { segments, solves: false };
    }

    let stage = done;
    if (bestRest) {
      const before = board;
      board = played(board, bestRest.effect, spins);
      stage = prefix(board, null, 0);
      // The remainder serves the piece it carries on toward home, where the
      // stage plan goes on with it; else the last piece it put in place.
      const carried =
        stage < size &&
        stageState(board, null, stage).cost > 0 &&
        before.values.some((v, q) => v === goal[stage] && bestRest?.dest[q] !== q);
      if (carried)
        segments.push({
          stage,
          moves: bestRest.moves,
          roles: bestRest.roles,
          remainder: true,
        });
      else {
        const cut = cutAt(before, bestRest.moves, bestRest.roles, stage - 1);
        segments.push({
          stage: stage - 1,
          moves: cut.moves,
          roles: cut.roles,
          remainder: true,
        });
        board = cut.board;
        stage = prefix(board, null, 0);
      }
      if (stage === size) return { segments, solves: true };
    }
    // The stage plan: sequences off the policy until the piece is home.
    for (;;) {
      const at = stageState(board, null, stage);
      if (at.cost === 0 || at.cost >= INF) break;
      const s = lib.sequences[lib.policy[stage][at.at]];
      const after = played(board, s.effect, spins);
      if (stageState(after, null, stage).cost === 0) {
        const cut = cutAt(board, s.moves, s.roles, stage);
        segments.push({ stage, moves: cut.moves, roles: cut.roles, remainder: false });
        board = cut.board;
      } else {
        segments.push({ stage, moves: s.moves, roles: s.roles, remainder: false });
        board = after;
      }
    }
  }
  throw new Error("permutation-planner: the plan did not finish");
}
