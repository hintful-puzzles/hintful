/*
 * The run-length grammar's own tests.
 *
 * A desc is a player promise: a `params:desc` game ID must decode to the same
 * board for ever. Most games in this family carry a frozen differential that
 * would catch a byte moving, but Palisade does not, so the bytes are pinned here
 * at the boundaries where an encoder can round a run differently (26, 27, 52,
 * 53 blanks), and a fuzz holds encoding and scanning to each other. When the
 * grammar was extracted, the encoder was fuzzed against Palisade's own, 4,000
 * trials byte for byte (`7308155b`).
 */

import { describe, expect, it } from "vitest";
import { encodeRunLength, scanRunLength } from "./run-length.ts";

/** Decode a desc back to one entry per square, `null` for a blank. */
function decode(desc: string): (string | null)[] {
  const read: (string | null)[] = [];
  for (const tok of scanRunLength(desc)) {
    if ("blanks" in tok) for (let k = 0; k < tok.blanks; k++) read.push(null);
    else read.push(tok.value);
  }
  return read;
}

describe("scanRunLength", () => {
  it("reads letters as blank runs and everything else as a value", () => {
    expect([...scanRunLength("a3z0")]).toEqual([
      { blanks: 1 },
      { value: "3" },
      { blanks: 26 },
      { value: "0" },
    ]);
  });

  it("hands back characters a game will reject, rather than judging them", () => {
    // The scanner reports what it read and never what is legal — which value
    // characters are allowed is the game's rule, and its error message is too.
    expect([...scanRunLength("!")]).toEqual([{ value: "!" }]);
    expect([...scanRunLength("")]).toEqual([]);
  });
});

describe("encodeRunLength", () => {
  it("drops a trailing run of blanks", () => {
    expect(encodeRunLength(5, (i) => (i === 0 ? "1" : null))).toBe("1");
  });

  it("splits a run longer than 26 into whole-alphabet chunks, at every boundary", () => {
    const afterBlanks = (blanks: number): string =>
      encodeRunLength(blanks + 1, (i) => (i === blanks ? "1" : null));
    expect(afterBlanks(1)).toBe("a1");
    expect(afterBlanks(26)).toBe("z1");
    expect(afterBlanks(27)).toBe("za1");
    expect(afterBlanks(52)).toBe("zz1");
    expect(afterBlanks(53)).toBe("zza1");
  });

  it("round-trips through the scanner, over runs past 26 and 52", () => {
    let seed = 12345;
    const rnd = (): number => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    let longRuns = 0;
    for (let trial = 0; trial < 4000; trial++) {
      const wh = 1 + Math.floor(rnd() * 200);
      // Biased hard toward blanks, so runs past 26 and 52 occur constantly.
      const values = Array.from({ length: wh }, () =>
        rnd() < 0.9 ? null : String(Math.floor(rnd() * 5)),
      );
      const desc = encodeRunLength(wh, (i) => values[i]);
      if (desc.includes("z")) longRuns++;
      const read = decode(desc);
      // The trailing blank run is dropped by design, so compare the prefix and
      // check the rest was blank.
      expect(read).toEqual(values.slice(0, read.length));
      expect(values.slice(read.length).every((v) => v === null)).toBe(true);
    }
    expect(longRuns).toBeGreaterThan(1000);
  });
});
