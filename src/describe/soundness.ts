/**
 * What a technique was checked sound against, as a fingerprint: its
 * statement, the rules of the description it was checked under, and the
 * board sizes. The checker (`research/technique-check/describe-check.test.ts`)
 * records the fingerprint of every technique it finds sound in
 * `soundness.json`, and `compile.test.ts` fails where a compiled technique's
 * fingerprint is not there: a technique edited, or its rules, since it was
 * last checked.
 */

import type { DescriptionJson, LibraryJson, StatedTechnique } from "./description.ts";

/** The board orders every technique is checked at. */
export const CHECKED_ORDERS: readonly number[] = [3, 4];

/** Where a technique's verdict is kept: its description's path and its id. */
export const soundnessKey = (source: string, id: string): string => `${source}#${id}`;

/** FNV-1a over a canonical rendering, as sixteen hex digits from two lanes. */
function fingerprint(text: string): string {
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    a = Math.imul(a ^ ch, 0x01000193) >>> 0;
    b = Math.imul(b ^ ch, 0x811c9dc5) >>> 0;
  }
  return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");
}

/** Every key sorted, so the rendering does not depend on the JSON's order. */
function canonical(x: unknown): string {
  if (Array.isArray(x)) return `[${x.map(canonical).join(",")}]`;
  if (x !== null && typeof x === "object")
    return `{${Object.keys(x)
      .filter((k) => k !== "note")
      .sort()
      .map(
        (k) => `${JSON.stringify(k)}:${canonical((x as Record<string, unknown>)[k])}`,
      )
      .join(",")}}`;
  return JSON.stringify(x);
}

const statement = (t: StatedTechnique) => ({
  for: t.for,
  premise: t.premise ?? null,
  conclude: t.conclude,
  on: t.on ?? null,
});

/** A library technique's fingerprint: it is checked on a plain Latin square. */
export function libraryFingerprint(lib: LibraryJson, id: string): string {
  return fingerprint(
    canonical({
      technique: statement(lib.techniques[id]),
      rules: "latin",
      orders: CHECKED_ORDERS,
    }),
  );
}

/** A game's own technique's fingerprint, under its description's rules. */
export function gameFingerprint(d: DescriptionJson, t: StatedTechnique): string {
  return fingerprint(
    canonical({
      technique: statement(t),
      rules: {
        answer: d.answer,
        define: d.define ?? {},
        shape: d.shape ?? [],
        rules: d.rules ?? {},
        clues: d.clues ?? {},
        space: d.space,
      },
      orders: CHECKED_ORDERS,
    }),
  );
}
