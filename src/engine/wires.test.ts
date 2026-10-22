/**
 * Tier-1 tests for the shared Net/Netslide wire model.
 *
 * `wires.ts` is shared by both games, whose frozen differentials do catch its
 * defects, but only after a full generate-and-compare run, and only with a
 * diff that names a description string rather than the rule that broke.
 * Coverage several layers away is adequate protection and poor feedback; these
 * assertions are the feedback.
 *
 * They deliberately state the *rules* the module's doc comments claim — the
 * torus wrap, the desc codec's
 * round trip, the border fence, and what "powered" means — rather than pinning
 * particular values a refactor would have to chase.
 */
import { describe, expect, it } from "vitest";
import {
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  descValue,
  descVerdict,
} from "./desc-error.ts";
import { randomNew } from "./random/index.ts";
import { D, DIRECTIONS, dirCount, L, opposite, R, U } from "./square-edges.ts";
import {
  addBorderBarriers,
  computeActive,
  encodeWireDesc,
  growSpanningTree,
  offset,
  parseWireDesc,
  wireDistance,
  type Xyd,
  xydCmp,
} from "./wires.ts";

describe("offset", () => {
  it("steps one tile in the given direction", () => {
    expect(offset(1, 1, R, 4, 3)).toEqual({ x: 2, y: 1 });
    expect(offset(1, 1, L, 4, 3)).toEqual({ x: 0, y: 1 });
    expect(offset(1, 1, U, 4, 3)).toEqual({ x: 1, y: 0 });
    expect(offset(1, 1, D, 4, 3)).toEqual({ x: 1, y: 2 });
  });

  it("wraps unconditionally — a non-wrapping game is fenced by barriers, not here", () => {
    expect(offset(3, 0, R, 4, 3)).toEqual({ x: 0, y: 0 });
    expect(offset(0, 0, L, 4, 3)).toEqual({ x: 3, y: 0 });
    expect(offset(0, 0, U, 4, 3)).toEqual({ x: 0, y: 2 });
    expect(offset(0, 2, D, 4, 3)).toEqual({ x: 0, y: 0 });
  });

  it("is inverted by stepping back the opposite way, from every cell", () => {
    const w = 5;
    const h = 4;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        for (const d of DIRECTIONS) {
          const n = offset(x, y, d, w, h);
          expect(offset(n.x, n.y, opposite(d), w, h)).toEqual({ x, y });
        }
  });
});

describe("xydCmp", () => {
  it("orders lexicographically on x, then y, then direction", () => {
    // This is the order the RNG indexes into, so it is part of what decides
    // which boards exist — not merely a tidy convention.
    const xyd = (x: number, y: number, direction: number): Xyd => ({ x, y, direction });
    const shuffled = [xyd(1, 0, U), xyd(0, 2, R), xyd(1, 0, R), xyd(0, 1, D)];
    expect([...shuffled].sort(xydCmp)).toEqual([
      xyd(0, 1, D),
      xyd(0, 2, R),
      xyd(1, 0, R),
      xyd(1, 0, U),
    ]);
  });

  it("is antisymmetric and zero only on equal triples", () => {
    const a = { x: 2, y: 1, direction: D };
    const b = { x: 2, y: 1, direction: R };
    expect(Math.sign(xydCmp(a, b))).toBe(-Math.sign(xydCmp(b, a)));
    expect(xydCmp(a, { ...a })).toBe(0);
  });
});

describe("the description codec", () => {
  const verdict = (w: number, h: number, wrapping: boolean, desc: string) =>
    descVerdict(parseWireDesc(w, h, wrapping, desc));

  it("accepts a well-formed desc and names each way it can be malformed", () => {
    expect(verdict(2, 2, false, "1234")).toBeNull();
    expect(verdict(2, 2, false, "12h34")).toBeNull(); // barriers are optional suffixes
    expect(verdict(2, 2, true, "1v2h3v4h")).toBeNull();
    expect(verdict(2, 2, true, "1vh234")).toBeNull();
    expect(verdict(2, 2, false, "123")).toBe(DESC_TOO_SHORT);
    expect(verdict(2, 2, false, "12345")).toBe(DESC_TOO_LONG);
    expect(verdict(2, 2, false, "12z4")).toBe(descBadCharacter("z"));
    expect(verdict(2, 2, false, "12h3")).toBe(DESC_TOO_SHORT);
  });

  it("refuses what the encoder never writes", () => {
    expect(verdict(2, 2, false, "12A4")).toBe(descBadCharacter("A"));
    // At most one of each marker, `v` before `h`.
    expect(verdict(2, 2, false, "1vv234")).toBe(descBadCharacter("v"));
    expect(verdict(2, 2, false, "1hv234")).toBe(descBadCharacter("v"));
    // A non-wrapping grid's border is implied, so no tile names it.
    expect(verdict(2, 2, false, "12v34")).toBe(descBadCharacter("v"));
    expect(verdict(2, 2, false, "123h4")).toBe(descBadCharacter("h"));
    expect(verdict(2, 2, false, "1234h")).toBe(DESC_TOO_LONG);
  });

  it("reads tiles row-major as hex", () => {
    const { tiles } = descValue(parseWireDesc(3, 2, false, "12345a"));
    expect([...tiles]).toEqual([1, 2, 3, 4, 5, 10]);
  });

  it("records a barrier on both sides of the wall it names", () => {
    // `v` is a wall to the right of its tile, `h` a wall below it.
    const { barriers } = descValue(parseWireDesc(2, 2, false, "1v234"));
    expect(barriers[0] & R).toBeTruthy();
    expect(barriers[1] & L).toBeTruthy(); // its neighbor sees the same wall
    expect(barriers[0] & D).toBeFalsy();
  });

  it("round-trips a grid with barriers through encode/parse", () => {
    const w = 3;
    const h = 2;
    const tiles = Uint8Array.from([R, R | L, L | D, R, U | L, L]);
    const barriers = new Uint8Array(w * h);
    // A wall right of (0,0) and below (1,0), recorded on both sides.
    barriers[0] |= R;
    barriers[1] |= L;
    barriers[1] |= D;
    barriers[1 * w + 1] |= U;

    const desc = encodeWireDesc(tiles, barriers, w, h, false);
    const back = descValue(parseWireDesc(w, h, false, desc));
    expect([...back.tiles]).toEqual([...tiles]);
    expect([...back.barriers]).toEqual([...barriers]);
  });

  it("omits the outer edges of a non-wrapping grid, and keeps them when wrapping", () => {
    // The fence round a non-wrapping grid is implied, so encoding it would be
    // redundant; on a torus the same edges are real interior walls.
    const w = 2;
    const h = 2;
    const tiles = new Uint8Array(w * h);
    const barriers = new Uint8Array(w * h);
    addBorderBarriers(barriers, w, h);
    expect(encodeWireDesc(tiles, barriers, w, h, false)).toBe("0000");
    // A wall is written by the tile on its *left* (`v`) or *above* it (`h`), so
    // on the torus the four fence edges are emitted by the tiles on the far
    // side of each seam: (1,0) owns the right seam, (0,1) the bottom one, and
    // (1,1) owns both.
    expect(encodeWireDesc(tiles, barriers, w, h, true)).toBe("0" + "0v" + "0h" + "0vh");
  });

  it("fences a non-wrapping grid on all four sides", () => {
    const w = 3;
    const h = 3;
    const barriers = new Uint8Array(w * h);
    addBorderBarriers(barriers, w, h);
    for (let x = 0; x < w; x++) {
      expect(barriers[x] & U).toBeTruthy();
      expect(barriers[(h - 1) * w + x] & D).toBeTruthy();
    }
    for (let y = 0; y < h; y++) {
      expect(barriers[y * w] & L).toBeTruthy();
      expect(barriers[y * w + (w - 1)] & R).toBeTruthy();
    }
    expect(barriers[1 * w + 1]).toBe(0); // the interior is untouched
  });
});

/**
 * `growSpanningTree` builds the *solved* grid every Net/Netslide board is
 * scrambled from, and the games' frozen descs move for any reason at all, so
 * they pin none of its rules by name. What follows
 * asserts the three properties its doc comment claims — spanning, acyclic, no
 * full crosses — plus the boundary rule, as structure rather than as values, so
 * a deliberate change to the RNG draw order (which is the differential's
 * business) leaves them alone while a broken rule fails here by name.
 */
describe("growSpanningTree", () => {
  const grow = (w: number, h: number, wrapping: boolean, seed: string) => {
    const tiles = new Uint8Array(w * h);
    growSpanningTree(tiles, w, h, wrapping, w >> 1, h >> 1, randomNew(seed));
    return tiles;
  };

  const shapes = [
    [5, 5, false],
    [5, 5, true],
    [4, 7, false],
    [7, 4, true],
    [3, 3, false],
    [2, 2, true],
  ] as const;

  it.each(shapes)("wires %ix%i (wrapping=%s) as a spanning tree", (w, h, wrapping) => {
    for (const seed of ["a", "b", "c"]) {
      const tiles = grow(w, h, wrapping, `${seed}-${w}x${h}`);

      // Every arm is matched by its neighbor's facing arm. Without this the
      // counts below would be meaningless — half an edge is not an edge.
      let arms = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const t = tiles[y * w + x];
          expect(dirCount(t)).toBeLessThan(4); // a full cross reads the same in every orientation
          for (const d of DIRECTIONS) {
            if (!(t & d)) continue;
            arms++;
            const { x: nx, y: ny } = offset(x, y, d, w, h);
            expect(tiles[ny * w + nx] & opposite(d)).toBeTruthy();
          }
        }
      }

      // Spanning + exactly n−1 edges ⇒ acyclic. Neither alone would do: a
      // forest is acyclic without spanning, and a grid with one extra edge
      // spans without being a tree.
      expect(arms % 2).toBe(0);
      expect(arms / 2).toBe(w * h - 1);

      const seen = new Uint8Array(w * h);
      const queue = [(h >> 1) * w + (w >> 1)];
      seen[queue[0]] = 1;
      for (let i = 0; i < queue.length; i++) {
        const x = queue[i] % w;
        const y = (queue[i] / w) | 0;
        for (const d of DIRECTIONS) {
          if (!(tiles[queue[i]] & d)) continue;
          const n = offset(x, y, d, w, h);
          const idx = n.y * w + n.x;
          if (!seen[idx]) {
            seen[idx] = 1;
            queue.push(idx);
          }
        }
      }
      expect(queue.length).toBe(w * h);
    }
  });

  it("fences a non-wrapping grid: no tile on a rim wires off the edge", () => {
    // Upstream skips those frontier directions rather than relying on barriers
    // to hide them, so a wire that leaves the board is a generation bug, not a
    // display one. All four rims, because the guard is four separate lines.
    for (const seed of ["a", "b", "c", "d"]) {
      const [w, h] = [6, 5];
      const tiles = grow(w, h, false, `fence-${seed}`);
      for (let x = 0; x < w; x++) {
        expect(tiles[0 * w + x] & U).toBe(0);
        expect(tiles[(h - 1) * w + x] & D).toBe(0);
      }
      for (let y = 0; y < h; y++) {
        expect(tiles[y * w + 0] & L).toBe(0);
        expect(tiles[y * w + (w - 1)] & R).toBe(0);
      }
    }
  });

  it("lets a wrapping grid wire across the seam", () => {
    // The complement of the test above: with `wrapping`, the rim guard is
    // skipped, and over enough seeds the seam is used. Asserted as "some seed
    // wraps" rather than "this seed does", so it states the rule without
    // pinning a draw order the differential owns.
    const [w, h] = [4, 4];
    const wrapped = ["a", "b", "c", "d", "e", "f"].some((seed) => {
      const tiles = grow(w, h, true, `wrap-${seed}`);
      for (let x = 0; x < w; x++) if (tiles[0 * w + x] & U) return true;
      for (let y = 0; y < h; y++) if (tiles[y * w + 0] & L) return true;
      return false;
    });
    expect(wrapped).toBe(true);
  });
});

describe("computeActive", () => {
  const ACTIVE = 0x10; // each game owns its own high bit; this is the parameter

  /** A 3x1 row: source at (0,0) wired right, middle wired both ways, end left. */
  const row = (): { tiles: Uint8Array; barriers: Uint8Array } => ({
    tiles: Uint8Array.from([R, R | L, L]),
    barriers: new Uint8Array(3),
  });

  it("powers every tile reachable from the source", () => {
    const { tiles, barriers } = row();
    const active = computeActive(3, 1, tiles, barriers, 0, 0, ACTIVE);
    expect([...active]).toEqual([ACTIVE, ACTIVE, ACTIVE]);
  });

  it("needs the connection to exist from BOTH sides", () => {
    // The neighbor must point back. Note the discriminating case is a
    // neighbor wired to *nothing*: if the middle tile were merely wired the
    // wrong way (`L` only), the outward check on the far side would stop the
    // flood anyway and the test would pass with the both-sides check deleted.
    const { barriers } = row();
    const active = computeActive(
      3,
      1,
      Uint8Array.from([R, 0, L]),
      barriers,
      0,
      0,
      ACTIVE,
    );
    expect([...active]).toEqual([ACTIVE, 0, 0]);
  });

  it("needs the source side to be wired too", () => {
    const { barriers } = row();
    const active = computeActive(
      3,
      1,
      Uint8Array.from([0, R | L, L]),
      barriers,
      0,
      0,
      ACTIVE,
    );
    expect([...active]).toEqual([ACTIVE, 0, 0]);
  });

  it("does not flow through a barrier", () => {
    const { tiles, barriers } = row();
    barriers[0] |= R;
    const active = computeActive(3, 1, tiles, barriers, 0, 0, ACTIVE);
    expect([...active]).toEqual([ACTIVE, 0, 0]);
  });

  it("blanks a line that is mid-slide, so power does not leap across it", () => {
    const { tiles, barriers } = row();
    // Netslide passes the column currently in motion; Net passes -1.
    const active = computeActive(3, 1, tiles, barriers, 0, 0, ACTIVE, -1, 1);
    expect([...active]).toEqual([ACTIVE, 0, 0]);
  });

  it("powers the source itself even when it is wired to nothing", () => {
    const active = computeActive(
      2,
      1,
      new Uint8Array(2),
      new Uint8Array(2),
      1,
      0,
      ACTIVE,
    );
    expect([...active]).toEqual([0, ACTIVE]);
  });

  it("flows round a wrapping edge", () => {
    // (0,0) wired left and (2,0) wired right meet across the seam.
    const tiles = Uint8Array.from([L, 0, R]);
    const active = computeActive(3, 1, tiles, new Uint8Array(3), 0, 0, ACTIVE);
    expect([...active]).toEqual([ACTIVE, 0, ACTIVE]);
  });
});

describe("wireDistance", () => {
  it("counts tiles along the wires, not across the grid", () => {
    // A 2x2 board wired as a U: (0,0) down to (0,1), right to (1,1), up to
    // (1,0). The tile beside the source is three wires away.
    const tiles = Uint8Array.from([D, D, U | R, L | U]);
    const barriers = new Uint8Array(4);
    addBorderBarriers(barriers, 2, 2);
    const dist = wireDistance(2, 2, tiles, barriers, 0, 0);
    expect([...dist]).toEqual([0, 3, 1, 2]);
  });

  it("goes round a wrapping edge", () => {
    // (0,0) wired left meets (3,0) wired right across the seam, and the
    // tiles between are reached from there.
    const tiles = Uint8Array.from([L, R, R | L, R | L]);
    const dist = wireDistance(4, 1, tiles, new Uint8Array(4), 0, 0);
    expect([...dist]).toEqual([0, 3, 2, 1]);
  });

  it("stops at a barrier, and leaves a tile no wire reaches at -1", () => {
    // Wired end to end, with a barrier between the second and third tiles.
    const tiles = Uint8Array.from([R, R | L, R | L, L]);
    const barriers = new Uint8Array(4);
    barriers[1] = R;
    barriers[2] = L;
    expect([...wireDistance(4, 1, tiles, barriers, 0, 0)]).toEqual([0, 1, -1, -1]);
    // And a neighbor wired to nothing.
    const open = Uint8Array.from([R, 0, L, 0]);
    expect([...wireDistance(4, 1, open, new Uint8Array(4), 0, 0)]).toEqual([
      0, -1, -1, -1,
    ]);
  });
});
