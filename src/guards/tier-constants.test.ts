/**
 * A game names a tier the way its description does (`engine-difficulty`,
 * "Code names a tier by its description's name"). The compiled module's `TIER`
 * holds each tier's index by its name, so a tier the description does not
 * have is a type error; what a type cannot see is a constant that reads one
 * tier under another's name, as Tents' `DIFF_TRICKY` once held its Normal, or
 * an index written as a number. This scan refuses both.
 */
import { describe, expect, it } from "vitest";

const sources = import.meta.glob<string>(
  ["../games/*/*.ts", "!../games/**/*.test.ts"],
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);

/** `const DIFF_X = rhs;`, typed or not, exported or not. */
const DECLARED = /\bconst (DIFF_[A-Z_]+)\s*(?::[^=]+)?=\s*([^;]+);/g;
/** A tier read off the compiled module, or off `searchTiers`' record. */
const FROM_TIER = /^(?:\w+\.)?TIERS?\.([a-z]+)$/;
/** A tier of another of the description's scales. */
const FROM_SCALE = /^(?:\w+\.)?SCALE\.\w+\.([a-z]+)$/;

interface Finding {
  file: string;
  constant: string;
  rhs: string;
  why: string;
}

function findings(): { scanned: number; declared: number; out: Finding[] } {
  const out: Finding[] = [];
  let declared = 0;
  for (const [file, text] of Object.entries(sources)) {
    for (const [, constant, raw] of text.matchAll(DECLARED)) {
      declared++;
      const rhs = raw.trim();
      const suffix = constant.slice("DIFF_".length);
      const tier = FROM_TIER.exec(rhs)?.[1];
      const scaled = FROM_SCALE.exec(rhs)?.[1];
      if (/^-?\d+$/.test(rhs))
        out.push({
          file,
          constant,
          rhs,
          why: "an index written as a number: read it from TIER",
        });
      else if (tier !== undefined && tier.toUpperCase() !== suffix)
        out.push({ file, constant, rhs, why: `holds ${tier} under another name` });
      else if (scaled !== undefined && !suffix.endsWith(scaled.toUpperCase()))
        out.push({ file, constant, rhs, why: `holds ${scaled} under another name` });
    }
  }
  return { scanned: Object.keys(sources).length, declared, out };
}

describe("tier constants", () => {
  it("each names the tier it holds, read from the description", () => {
    const { scanned, declared, out } = findings();
    // Vacuity: an unmatched glob, or a pattern that stopped matching, would
    // pass with nothing read.
    expect(scanned).toBeGreaterThanOrEqual(200);
    expect(declared).toBeGreaterThanOrEqual(60);
    expect(out).toEqual([]);
  });
});
