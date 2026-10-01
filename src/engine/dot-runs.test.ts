import { describe, expect, it } from "vitest";
import { DESC_TOO_LONG, DESC_TOO_SHORT, descBadCharacter } from "./desc-error.ts";
import { readDesc } from "./desc-reader.ts";
import { type DotKind, readDotRuns, writeDotRuns } from "./dot-runs.ts";

function read(desc: string, s: number) {
  return readDesc(desc, (r) => {
    const cells: (DotKind | null)[] = new Array(s).fill(null);
    readDotRuns(r, s, (i, kind) => {
      cells[i] = kind;
    });
    return cells;
  });
}

describe("dot runs", () => {
  it("writes a run as the letter's offset and a dot's kind as its case", () => {
    const cells: (DotKind | null)[] = [null, 0, null, null, 1, null];
    expect(writeDotRuns(6, (i) => cells[i])).toBe("bCb");
    expect(read("bCb", 6)).toEqual({ ok: true, value: cells });
  });

  it("chunks 25 blanks per z, in the case of the dot ending the run", () => {
    expect(writeDotRuns(60, (i) => (i === 30 ? 1 : null))).toBe("ZFze");
    expect(writeDotRuns(25, () => null)).toBe("za");
  });

  it("round-trips every board of a few sizes and densities", () => {
    for (const s of [1, 7, 26, 51, 80]) {
      for (const seed of [1, 2, 3]) {
        const cells = Array.from({ length: s }, (_, i): DotKind | null => {
          const v = (i * 7919 * seed + seed) % 11;
          return v === 0 ? 0 : v === 1 ? 1 : null;
        });
        const desc = writeDotRuns(s, (i) => cells[i]);
        expect(read(desc, s), desc).toEqual({ ok: true, value: cells });
      }
    }
  });

  it("refuses what the writer never produces", () => {
    expect(read("Zfd", 60).ok).toBe(false); // a Z chunk ending in a lowercase dot
    expect(read("bCB", 6)).toEqual({ ok: false, error: descBadCharacter("B") });
    expect(read("bCc", 6)).toEqual({ ok: false, error: DESC_TOO_LONG });
    expect(read("bCbx", 6)).toEqual({ ok: false, error: DESC_TOO_LONG });
    expect(read("bC", 6)).toEqual({ ok: false, error: DESC_TOO_SHORT });
    expect(read("b!", 6)).toEqual({ ok: false, error: descBadCharacter("!") });
  });
});
