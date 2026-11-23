/**
 * A fill game's deal, on the `linking` fixture: its sample places a partner
 * beside each piece and draws again an answer that leaves a line bare, and a
 * dealt board finishes at its tier and not below. On the `sizing` fixture, an
 * answer is laid a line at a time, as many in each as the params' size says.
 * On `fleet`, a piece at a time as a tally says, a value no deal gives and a
 * flag that hides more; on `walling`, walls laid first at an option's share
 * and symmetry, each left where its number is hidden; on `mirroring`, a hide
 * symmetric under a half turn, one less thorough, and a kind no deal deals;
 * on `climbing`, draws mended until no rule breaks and climbing toward the
 * tier, with dots alike side by side taken off; on `growing`, regions read
 * from walls and grown round dominoes sampled densely, some closed as
 * regions of their own; on `picturing`, an answer sampled as a picture.
 * Upstream's game ID
 * grammar is each game's own cases' (`tents.cases.yaml`'s `ids` and
 * `params`).
 */

import { describe, expect, it } from "vitest";
import * as climbing from "../../generated/engine/testing/fixtures/climbing/climbing.compiled.ts";
import * as fleet from "../../generated/engine/testing/fixtures/fleet/fleet.compiled.ts";
import * as growing from "../../generated/engine/testing/fixtures/growing/growing.compiled.ts";
import * as linking from "../../generated/engine/testing/fixtures/linking/linking.compiled.ts";
import * as mirroring from "../../generated/engine/testing/fixtures/mirroring/mirroring.compiled.ts";
import * as picturing from "../../generated/engine/testing/fixtures/picturing/picturing.compiled.ts";
import * as sizing from "../../generated/engine/testing/fixtures/sizing/sizing.compiled.ts";
import * as walling from "../../generated/engine/testing/fixtures/walling/walling.compiled.ts";
import { newDealCensus, takingCensus } from "../contract/deal-census.ts";
import { descValue } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { clueList } from "../solve/describe-runtime.ts";
import { partners } from "../testing/symmetry-partners.ts";
import { newBoard, solveBoard, spaceOf } from "./board.ts";
import { dealFill } from "./deal.ts";
import { decodeDesc, encodeDesc, givenOf, partitionOf } from "./game-id.ts";
import {
  sampleAnswer,
  sampleDominoes,
  sampleLines,
  samplePicture,
  samplePieces,
} from "./sample.ts";

const PIECE = 1;
const SHADED = 1;
const EMPTY = 2;
const ANCHOR = 3;

const read = (w: number, h: number, desc: string) =>
  descValue(
    decodeDesc<linking.Dealt>(
      linking.deal,
      spaceOf(linking, { w, h }),
      linking.clueMax,
      desc,
    ),
  );

describe("a fill game's deal", () => {
  it("samples pieces none touching, each with a partner of its own beside it", () => {
    const sp = spaceOf(linking, { w: 8, h: 8 });
    // A draw may find no room, or leave a line bare: the first that holds.
    const answer = ["sample-a", "sample-b", "sample-c", "sample-d"]
      .map((seed) => sampleAnswer(linking.deal.sample, sp, randomNew(seed)))
      .find((g) => g !== null);
    if (answer === undefined) throw new Error("no draw held");
    const pieces = sp.cells.filter((c) => answer[c] === PIECE);
    expect(pieces).toHaveLength(Math.floor(64 / 5));
    for (const c of pieces)
      expect(sp.adj8[c].some((o) => answer[o] === PIECE)).toBe(false);
    expect(sp.cells.filter((c) => answer[c] === ANCHOR)).toHaveLength(pieces.length);
    expect(linking.isAnswer(answer, sp, linking.deriveClues(answer, sp))).toBe(true);
  });

  it("draws again an answer that leaves a line bare, with `noBareLine`", () => {
    // On 4x4 a fifth is three pieces, and their partners leave a line bare
    // often.
    const sp = spaceOf(linking, { w: 4, h: 4 });
    const bare = (g: Uint8Array) =>
      sp.lines.some((L) => sp.lineCells[L].every((c) => g[c] === EMPTY));
    const { noBareLine: _, ...loose } = linking.deal.sample;
    let looseBare = 0;
    for (let i = 0; i < 200; i++) {
      // The same draws, so the two differ only by the refusal.
      const g = sampleAnswer(linking.deal.sample, sp, randomNew(`bare-${i}`));
      const h = sampleAnswer(loose, sp, randomNew(`bare-${i}`));
      const wasBare = h !== null && bare(h);
      if (wasBare) looseBare++;
      expect(g).toEqual(wasBare ? null : h);
    }
    expect(looseBare).toBeGreaterThan(0);
  });

  it("deals a board the ladder finishes at its tier and not below", () => {
    for (const diff of [linking.TIER.easy, linking.TIER.normal]) {
      const p = { w: 8, h: 8, diff };
      const { desc, aux } = dealFill(
        linking,
        linking.deal,
        p,
        randomNew(`deal-${diff}`),
      );
      const board = newBoard(linking, 8, 8, read(8, 8, desc));
      const solved = solveBoard(linking, board, diff);
      expect(solved.verdict).toBe("solved");
      expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
      if (diff > 0)
        expect(solveBoard(linking, board, diff - 1).verdict).not.toBe("solved");
    }
  });
});

describe("an answer laid a line at a time", () => {
  it("puts the size's count in every row and column, none side by side", () => {
    const sp = spaceOf(sizing, { w: 6, h: 6 });
    for (const n of [1, 2]) {
      // A draw may find no way on: the first that holds.
      const answer = ["lines-a", "lines-b", "lines-c", "lines-d"]
        .map((seed) => sampleLines(sizing.deal.sample, sp, { n }, randomNew(seed)))
        .find((g) => g !== null);
      if (answer === undefined) throw new Error(`no draw held at ${n} a line`);
      for (const L of sp.lines)
        expect(sp.lineCells[L].filter((c) => answer[c] === SHADED)).toHaveLength(n);
      for (const c of sp.cells.filter((c) => answer[c] === SHADED))
        expect(sp.adj4[c].some((o) => answer[o] === SHADED)).toBe(false);
    }
  });

  it("deals a board of the size the ladder finishes at its tier and not below", () => {
    for (const diff of [sizing.TIER.easy, sizing.TIER.normal]) {
      const p = { w: 5, h: 5, diff, sizes: { n: 2 } };
      const { desc, aux } = dealFill(
        sizing,
        sizing.deal,
        p,
        randomNew(`sized-${diff}`),
      );
      const sp = spaceOf(sizing, { w: 5, h: 5 });
      const clues = descValue(
        decodeDesc<sizing.Dealt>(sizing.deal, sp, sizing.clueMax, desc),
      );
      const board = newBoard(sizing, 5, 5, { ...clues, n: 2 });
      const solved = solveBoard(sizing, board, diff);
      expect(solved.verdict).toBe("solved");
      expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
      if (diff > 0)
        expect(solveBoard(sizing, board, diff - 1).verdict).not.toBe("solved");
    }
  });
});

describe("an answer laid a piece at a time", () => {
  /** Each piece of `g` on a `w`-wide board by its first cell, and its length. */
  const pieces = (g: Uint8Array, w: number): number[] => {
    const at = (c: number, dx: number, dy: number) => {
      const x = (c % w) + dx;
      const y = Math.floor(c / w) + dy;
      return x >= 0 && y >= 0 && x < w && y * w < g.length ? y * w + x : null;
    };
    const run = (c: number, dx: number, dy: number): number => {
      const n = at(c, dx, dy);
      return n !== null && g[n] === PIECE ? 1 + run(n, dx, dy) : 1;
    };
    const lengths: number[] = [];
    g.forEach((v, c) => {
      const up = at(c, 0, -1);
      const left = at(c, -1, 0);
      if (v !== PIECE || (up !== null && g[up] === PIECE)) return;
      if (left !== null && g[left] === PIECE) return;
      lengths.push(Math.max(run(c, 1, 0), run(c, 0, 1)));
    });
    return lengths.sort();
  };

  it("lays the tally's pieces, straight, none touching even at a corner", () => {
    const sp = spaceOf(fleet, { w: 6, h: 6 });
    for (const seed of ["pieces-a", "pieces-b", "pieces-c"]) {
      const g = samplePieces(fleet.deal.sample, 6, 6, [2, 1, 1], randomNew(seed));
      if (g === null) throw new Error(`no room on ${seed}`);
      expect(pieces(g, 6)).toEqual([1, 1, 2, 3]);
      for (const c of sp.cells.filter((c) => g[c] === PIECE))
        for (const o of sp.adj8[c].filter((o) => !sp.adj4[c].includes(o)))
          expect(g[o]).not.toBe(PIECE);
    }
  });

  it("never deals the value only an ID writes, though it holds on every piece", () => {
    const sp = spaceOf(fleet, { w: 6, h: 6 });
    const g = samplePieces(fleet.deal.sample, 6, 6, [2, 1, 1], null);
    if (g === null) throw new Error("no room");
    const { seg } = fleet.deriveClues(
      g,
      sp,
      {},
      {
        fleet: { n: 3, length: [1, 2, 3], boats: [2, 1, 1] },
      },
    );
    // Each piece square is given its shape, a lone one, an end or a middle.
    expect(seg.at.length).toBe(36);
    expect(new Set(seg.v)).toEqual(new Set([2, 4, 5, 6]));
    // An ID gives it, and the board reads it.
    const read = descValue(
      decodeDesc<fleet.Dealt>(
        fleet.deal,
        spaceOf(fleet, { w: 2, h: 2 }),
        fleet.clueMax,
        "1,0,1,0,Vc",
      ),
    );
    expect(Array.from(read.seg.v)).toEqual([3]);
  });

  it("hides the flag's kind too where the flag is on, and only there", () => {
    const sp = spaceOf(fleet, { w: 5, h: 5 });
    const shown = (hides: boolean, seed: string): number => {
      const p = { w: 5, h: 5, diff: 0, tally: [2, 1], hides };
      const { desc, aux } = dealFill(fleet, fleet.deal, p, randomNew(seed));
      const clues = descValue(
        decodeDesc<fleet.Dealt>(fleet.deal, sp, fleet.clueMax, desc),
      );
      const board = newBoard(fleet, 5, 5, { ...clues, ...givenOf(fleet.deal, p) });
      const solved = solveBoard(fleet, board, 0);
      expect(solved.verdict).toBe("solved");
      expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
      return clues.n.at.length;
    };
    for (const seed of ["flag-a", "flag-b", "flag-c"]) {
      expect(shown(false, seed)).toBe(sp.lines.length);
      expect(shown(true, seed)).toBeLessThan(sp.lines.length);
    }
  });
});

describe("walls laid first, at the share and the symmetry the options give", () => {
  const W = 6;
  const sp = spaceOf(walling, { w: W, h: W });
  /** A board dealt with `options`, its clues as read back and its answer. */
  const dealt = (options: Record<string, number>, seed: string) => {
    const p = { w: W, h: W, diff: 0, options };
    const { desc, aux } = dealFill(walling, walling.deal, p, randomNew(seed));
    const clues = descValue(
      decodeDesc<walling.Dealt>(walling.deal, sp, walling.clueMax, desc),
    );
    const solved = solveBoard(walling, newBoard(walling, W, W, clues), 0);
    expect(solved.verdict).toBe("solved");
    expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
    const walls = sp.cells.filter((c) => aux[c] === "3");
    return { clues, walls };
  };

  it("matches each wall at each symmetry", () => {
    for (const symmetry of [0, 1, 2, 3, 4]) {
      const { walls } = dealt({ walls: 20, symmetry }, `symmetry-${symmetry}`);
      expect(walls.length).toBeGreaterThan(0);
      for (const c of walls)
        for (const q of partners(symmetry, W, W, c % W, Math.floor(c / W)))
          expect(walls).toContain(q);
    }
  });

  it("lays more walls at a higher share", () => {
    const at = (walls: number) =>
      dealt({ walls, symmetry: 0 }, `share-${walls}`).walls.length;
    expect(at(10)).toBeLessThan(at(50));
  });

  it("writes a bare wall where its number is hidden, and only there", () => {
    let left = 0;
    for (const seed of ["leaves-a", "leaves-b", "leaves-c"]) {
      const { clues, walls } = dealt({ walls: 30, symmetry: 2 }, seed);
      const marked = [...clues.wall.at, ...clues.number.at].sort((a, b) => a - b);
      expect(marked).toEqual(walls);
      left += clues.wall.at.length;
    }
    expect(left).toBeGreaterThan(0);
  });
});

describe("a hide that keeps its clues symmetric, and may go less far", () => {
  /** A board of `w` dealt from `seed`, its clues read back from its ID and
   * checked to finish on its answer. */
  const dealt = (w: number, thorough: boolean, seed: string) => {
    const sp = spaceOf(mirroring, { w, h: w });
    const p = { w, h: w, diff: 0, thorough };
    const { desc, aux } = dealFill(mirroring, mirroring.deal, p, randomNew(seed));
    const clues = descValue(
      decodeDesc<mirroring.Dealt>(mirroring.deal, sp, mirroring.clueMax, desc),
    );
    const solved = solveBoard(mirroring, newBoard(mirroring, w, w, clues), 0);
    expect(solved.verdict).toBe("solved");
    expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
    return { sp, clues, desc };
  };
  const seeds = ["mirror-a", "mirror-b", "mirror-c", "mirror-d"];

  it("shows each number with its partner under a half turn", () => {
    for (const seed of seeds) {
      const { sp, clues } = dealt(5, true, seed);
      const shown = Array.from(clues.number.at);
      expect(shown.length).toBeGreaterThan(0);
      for (const c of shown) expect(shown).toContain(sp.cells.length - 1 - c);
    }
  });

  it("hides every pair it can where thorough, and leaves some it could where not", () => {
    /** The shown numbers whose pair the board still finishes without. */
    const spare = (w: number, thorough: boolean, seed: string): number => {
      const { clues } = dealt(w, thorough, seed);
      const at = Array.from(clues.number.at);
      const v = Array.from(clues.number.v);
      const n = w * w;
      return at.filter((c) => {
        const keep = at.flatMap((d, i) => (d === c || d === n - 1 - c ? [] : [i]));
        const without = {
          ...clues,
          number: clueList(
            keep.map((i) => at[i]),
            keep.map((i) => v[i]),
            n,
          ),
        };
        return (
          solveBoard(mirroring, newBoard(mirroring, w, w, without), 0).verdict ===
          "solved"
        );
      }).length;
    };
    for (const seed of seeds) expect(spare(8, true, seed)).toBe(0);
    expect(seeds.reduce((s, seed) => s + spare(8, false, seed), 0)).toBeGreaterThan(0);
  });

  it("never deals a kind only a game ID carries, and reads one from an ID", () => {
    for (const seed of seeds)
      expect(dealt(5, true, seed).clues.given.at).toHaveLength(0);
    const sp = spaceOf(mirroring, { w: 3, h: 3 });
    const { number } = mirroring.deriveClues(new Uint8Array(9).fill(2), sp);
    const given = clueList([4], [2], 9);
    const desc = encodeDesc(mirroring.deal, sp, { number, given });
    const read = descValue(
      decodeDesc<mirroring.Dealt>(mirroring.deal, sp, mirroring.clueMax, desc),
    );
    expect(Array.from(read.given.at)).toEqual([4]);
    expect(Array.from(read.given.v)).toEqual([2]);
  });
});

describe("draws mended and climbing toward the tier, alike dots unpaired", () => {
  type Deal = typeof climbing.deal;
  const seeds = Array.from({ length: 8 }, (_, i) => `climb-${i}`);
  const sample = climbing.deal.sample as Readonly<Record<string, unknown>>;
  /** The deal with `sample` and the rest changed as given. */
  const changed = (s: Readonly<Record<string, unknown>>, rest = {}): Deal =>
    ({ ...climbing.deal, sample: { ...sample, ...s }, ...rest }) as unknown as Deal;
  /** The middle of the tries every retry guard took to deal a board of `w`
   * at `diff` from each seed, under `deal`: a climb caught where it cannot get
   * out tries a hundred times before it starts over, which a total would
   * read. */
  const triesMid = (deal: Deal, w: number, diff: number): number => {
    const each = seeds.map((seed) => {
      const census = newDealCensus();
      takingCensus(census, () =>
        dealFill(climbing, deal, { w, h: w, diff }, randomNew(seed)),
      );
      return [...census.tries.values()].reduce((s, n) => s + n, 0);
    });
    return each.sort((a, b) => a - b)[seeds.length / 2];
  };
  /** The dots alike side by side on boards of `w` dealt under `deal`, and
   * each board checked to finish on its answer at the lowest tier. */
  const pairs = (deal: Deal, w: number): number => {
    const sp = spaceOf(climbing, { w, h: w });
    let n = 0;
    for (const seed of seeds) {
      const { desc, aux } = dealFill(
        climbing,
        deal,
        { w, h: w, diff: 0 },
        randomNew(seed),
      );
      const { dot } = descValue(
        decodeDesc<climbing.Dealt>(climbing.deal, sp, climbing.clueMax, desc),
      );
      const solved = solveBoard(climbing, newBoard(climbing, w, w, { dot }), 0);
      expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
      for (const [i, c] of dot.at.entries())
        for (const o of sp.adj4[c])
          if (o > c && dot.byAt[o] >= 0 && dot.v[dot.byAt[o]] === dot.v[i]) n++;
    }
    return n;
  };

  it("mends a draw until no rule breaks, in place of drawing again", () => {
    // 3, and 47 unmended, 2026-11-23.
    expect(triesMid(climbing.deal, 6, 0) * 4).toBeLessThan(
      triesMid(changed({ mend: undefined }), 6, 0),
    );
  });

  it("keeps what the ladder decided on a draw it refused", () => {
    // 3, and 22 with every draw sampled afresh, 2026-11-23.
    expect(triesMid(climbing.deal, 6, 0)).toBeLessThan(8);
  });

  it("turns a cell of a board the tier below finishes", () => {
    // 24, and 202 with no cell turned, 2026-11-23.
    expect(triesMid(climbing.deal, 5, 1)).toBeLessThan(100);
  });

  it("takes off two dots alike side by side, and finishes without them", () => {
    expect(pairs(climbing.deal, 6)).toBe(0);
    expect(pairs(changed({}, { unpair: undefined }), 6)).toBeGreaterThan(0);
  });
});

describe("a partition grown round dominoes, some closed as regions of their own", () => {
  const W = 6;
  const sp = spaceOf(growing, { w: W, h: W });
  const seeds = Array.from({ length: 8 }, (_, i) => `grow-${i}`);
  /** The board dealt at `diff` from `seed`, read back from its ID and checked
   * to finish on its answer at its tier and not below. */
  const dealt = (seed: string, diff: number) => {
    const { desc, aux } = dealFill(
      growing,
      growing.deal,
      { w: W, h: W, diff },
      randomNew(seed),
    );
    const clues = descValue(
      decodeDesc<growing.Dealt>(growing.deal, sp, growing.clueMax, desc),
    );
    const board = newBoard(growing, W, W, clues);
    const solved = solveBoard(growing, board, diff);
    expect(solved.verdict).toBe("solved");
    expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
    if (diff > 0)
      expect(solveBoard(growing, board, diff - 1).verdict).not.toBe("solved");
    return { regions: clues.region.cells, answer: solved.values };
  };
  /** The regions that are a domino of the answer and nothing else. */
  const closed = (regions: readonly (readonly number[])[], answer: Uint8Array) =>
    regions.filter((r) => r.length === 2 && r.every((c) => answer[c] === SHADED))
      .length;

  it("samples dominoes none side by side, until no other fits", () => {
    for (const seed of seeds) {
      const g = sampleDominoes(growing.deal.sample, sp, randomNew(seed));
      if (g === null) throw new Error("no domino fits");
      const lit = (c: number) => sp.adj4[c].filter((d) => g[d] === SHADED).length;
      for (const c of sp.cells) if (g[c] === SHADED) expect(lit(c)).toBe(1);
      // Two squares side by side, neither beside a shaded one, would take one more.
      for (const c of sp.cells)
        for (const d of sp.adj4[c])
          expect(g[c] === SHADED || g[d] === SHADED || lit(c) + lit(d) > 0).toBe(true);
    }
  });

  it("grows regions holding two shaded squares each, none under three squares but a closed domino", () => {
    for (const seed of seeds)
      for (const diff of [0, 1]) {
        const { regions, answer } = dealt(seed, diff);
        for (const r of regions) {
          expect(r.filter((c) => answer[c] === SHADED)).toHaveLength(2);
          if (r.length < 3) expect(r.every((c) => answer[c] === SHADED)).toBe(true);
        }
      }
  });

  it("closes more dominoes at the tier that asks one in fewer, at most one region in three", () => {
    const count = (diff: number): number =>
      seeds.reduce((n, seed) => {
        const { regions, answer } = dealt(seed, diff);
        // At most one region in three is closed (`atMostOneIn`).
        expect(closed(regions, answer) * 3).toBeLessThanOrEqual(regions.length);
        return n + closed(regions, answer);
      }, 0);
    expect(count(0)).toBeGreaterThan(count(1));
  });

  it("reads a region from the walls an ID writes, and holds the rules to it", () => {
    // Two regions, the left two columns and the rest, on a 4x2 board.
    const parts = partitionOf([0, 0, 1, 1, 0, 0, 1, 1]);
    const small = spaceOf(growing, { w: 4, h: 2 });
    const desc = encodeDesc(growing.deal, small, { region: parts });
    const read = descValue(
      decodeDesc<growing.Dealt>(growing.deal, small, growing.clueMax, desc),
    );
    expect(read.region.cells).toEqual([
      [0, 1, 4, 5],
      [2, 3, 6, 7],
    ]);
    const g = (s: string) => Uint8Array.from(s, Number);
    expect(growing.isAnswer(g("11211212"), small, read)).toBe(false);
    expect(growing.isAnswer(g("12212121"), small, read)).toBe(false);
    expect(growing.isAnswer(g("12121212"), small, read)).toBe(true);
  });
});

describe("an answer sampled as a picture", () => {
  /** The pictures drawn on a board of `w` by `h` from 200 seeds, and how
   * many draws came to none. */
  const drawn = (w: number, h: number) => {
    const sp = spaceOf(picturing, { w, h });
    const out: Uint8Array[] = [];
    let none = 0;
    for (let i = 0; i < 200; i++) {
      const g = samplePicture(picturing.deal.sample, sp, randomNew(`pic-${i}`));
      if (g === null) none++;
      else out.push(g);
    }
    return { sp, pictures: out, none };
  };
  /** The share of the pairs of squares side by side, down the columns or
   * along the rows, that hold the same value. */
  const alike = (w: number, h: number, down: boolean): number => {
    const { sp, pictures } = drawn(w, h);
    let same = 0;
    let all = 0;
    for (const g of pictures)
      for (const c of sp.cells) {
        const d = down ? c + w : c % w < w - 1 ? c + 1 : -1;
        if (d < 0 || d >= sp.cells.length) continue;
        all++;
        if (g[c] === g[d]) same++;
      }
    return same / all;
  };

  it("shades half the squares, cut at the median", () => {
    for (const [w, h] of [
      [10, 10],
      [7, 5],
    ]) {
      const n = w * h;
      for (const g of drawn(w, h).pictures)
        expect([Math.floor(n / 2), Math.ceil(n / 2)]).toContain(
          g.filter((v) => v === SHADED).length,
        );
    }
  });

  it("draws none where a row or column over two squares is all one value", () => {
    const { sp, pictures, none } = drawn(7, 5);
    expect(none).toBeGreaterThan(0);
    const mixed = (cells: readonly number[], g: Uint8Array) =>
      cells.some((c) => g[c] !== g[cells[0]]);
    for (const g of pictures) {
      for (let y = 0; y < sp.h; y++)
        expect(
          mixed(
            sp.cells.filter((c) => Math.floor(c / sp.w) === y),
            g,
          ),
        ).toBe(true);
      for (let x = 0; x < sp.w; x++)
        expect(
          mixed(
            sp.cells.filter((c) => c % sp.w === x),
            g,
          ),
        ).toBe(true);
    }
  });

  it("smooths the noise, so squares side by side are more often alike", () => {
    // 0.72 down and across, 2026-11-23; unsmoothed noise is alike half the time.
    expect(alike(10, 10, true)).toBeGreaterThan(0.6);
    expect(alike(10, 10, false)).toBeGreaterThan(0.6);
  });

  it("smooths a side of two only along its length", () => {
    // 0.68 down the columns and 0.44 across them, 2026-11-23.
    expect(alike(2, 8, true)).toBeGreaterThan(0.6);
    expect(alike(2, 8, false)).toBeLessThan(0.55);
  });
});
