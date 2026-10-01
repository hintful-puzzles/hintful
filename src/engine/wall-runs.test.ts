import { describe, expect, it } from "vitest";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescParse,
  descBadCharacter,
} from "./desc-error.ts";
import { readDesc } from "./desc-reader.ts";
import { Dsf } from "./dsf.ts";
import { randomNew, randomUpto } from "./random/index.ts";
import {
  encodeRegionWalls,
  encodeWallRuns,
  gapLetters,
  readRegionWalls,
  readWallRuns,
} from "./wall-runs.ts";

function decode(desc: string, count: number): DescParse<number[]> {
  return readDesc(desc, (r) => {
    const walls = readWallRuns(r, count);
    r.end();
    return [...walls];
  });
}

describe("wall runs", () => {
  it("writes upstream's characters for runs of 25 or fewer", () => {
    // `a` is one gap then a wall; a number is that many walls.
    expect(encodeWallRuns([0, 1, 1, 0, 0, 1])).toBe("a1b");
    expect(encodeWallRuns([1, 1, 1])).toBe("3");
    expect(encodeWallRuns([0, 0, 0])).toBe("c");
    expect(encodeWallRuns([0, 1, 0, 1])).toBe("aa");
    expect(encodeWallRuns([...Array(25).fill(0), 1])).toBe("y");
  });

  it("chunks a gap run of 26 or more into `z`s, which carry no wall", () => {
    expect(encodeWallRuns([...Array(26).fill(0), 1, 1])).toBe("z2");
    expect(encodeWallRuns([...Array(27).fill(0), 1])).toBe("za");
    expect(encodeWallRuns(Array(52).fill(0))).toBe("zz");
    expect(gapLetters(0)).toBe("");
    expect(gapLetters(53)).toBe("zza");
  });

  it("reads back every wall list it writes, long gap runs included", () => {
    const rng = randomNew("wall-runs");
    const lists: number[][] = [
      [...Array(26).fill(0), 1, 1, 0, 0],
      [...Array(30).fill(0), 1, 0],
      Array(60).fill(0),
      [],
    ];
    for (let k = 0; k < 300; k++) {
      const n = 1 + randomUpto(rng, 80);
      // A biased coin, so both long gap runs and long wall runs occur.
      const odds = 1 + randomUpto(rng, 9);
      lists.push(Array.from({ length: n }, () => (randomUpto(rng, 10) < odds ? 1 : 0)));
    }
    for (const walls of lists) {
      expect(decode(encodeWallRuns(walls), walls.length)).toEqual({
        ok: true,
        value: walls,
      });
    }
  });

  it("lets only a final letter's wall fall off the end", () => {
    expect(decode("c", 3)).toEqual({ ok: true, value: [0, 0, 0] });
    expect(decode("d", 3)).toEqual({ ok: false, error: DESC_TOO_LONG });
    expect(decode("z", 25)).toEqual({ ok: false, error: DESC_TOO_LONG });
    expect(decode("4", 3)).toEqual({ ok: false, error: DESC_OUT_OF_RANGE });
  });

  it("refuses an empty run, a stray character and a list cut short", () => {
    expect(decode("0a", 2)).toEqual({ ok: false, error: DESC_OUT_OF_RANGE });
    expect(decode("a!", 3)).toEqual({ ok: false, error: descBadCharacter("!") });
    expect(decode("a", 3)).toEqual({ ok: false, error: DESC_TOO_SHORT });
    expect(decode("c1", 3)).toEqual({ ok: false, error: DESC_TOO_LONG });
  });

  it("round-trips a region layout through the border list", () => {
    // 3×2: the left column one region, the rest another.
    const w = 3;
    const h = 2;
    const regions = new Dsf(w * h);
    regions.merge(0, 3);
    regions.merge(1, 2);
    regions.merge(4, 5);
    regions.merge(1, 4);
    const desc = encodeRegionWalls(regions, w, h);
    // Borders: row 0 (wall, gap), row 1 (wall, gap), then down (gap, gap, gap).
    expect(desc).toBe("1ad");
    const back = readDesc(desc, (r) => {
      const out = new Dsf(w * h);
      readRegionWalls(r, out, w, h);
      r.end();
      return out;
    });
    if (!back.ok) throw new Error(back.error);
    for (let a = 0; a < w * h; a++) {
      for (let b = 0; b < w * h; b++) {
        expect(back.value.equivalent(a, b)).toBe(regions.equivalent(a, b));
      }
    }
  });
});
