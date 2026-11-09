/*
 * A ladder is compiled from a description, or it does not run.
 *
 * The runner takes `CompiledTechniques` and a ladder's entries are `Rung`s,
 * both brands only `ladder-runtime.ts` gives, so a technique a game writes by
 * hand does not typecheck. A cast is the one way past that, and this refuses
 * it outside the runtime and the test tools that wrap a compiled ladder.
 */
import { expect, it } from "vitest";

const sources = import.meta.glob<string>(["../**/*.ts", "!../**/*.test.ts"], {
  eager: true,
  query: "?raw",
  import: "default",
});

/** Where a brand is given: the runtime, and a tool wrapping what it gave. */
const BRANDING = ["./ladder-runtime.ts", "./testing/ladder-continuity.ts"];

// Read as written: transpiling the comments away (`stripComments`) erases
// every cast with them.
const CAST = /\bas\s+(CompiledTechniques|Rung)\b/;

it("casts to a compiled ladder's brand only where the brand is given", () => {
  const files = Object.keys(sources);
  expect(files.length).toBeGreaterThan(100);
  for (const b of BRANDING) expect(CAST.test(sources[b]), b).toBe(true);
  const casting = files.filter((f) => !BRANDING.includes(f) && CAST.test(sources[f]));
  expect(casting).toEqual([]);
});
