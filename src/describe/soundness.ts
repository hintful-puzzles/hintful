/**
 * What a technique was checked sound against, as a fingerprint: its
 * statement, the rules of the description it was checked under, and the
 * board sizes. The checker (`research/technique-check/describe-check.test.ts`)
 * records the fingerprint of every technique it finds sound in
 * `soundness.json`, and `compile.test.ts` fails where a compiled technique's
 * fingerprint is not there: a technique edited, or its rules, since it was
 * last checked.
 */

import {
  type DescriptionJson,
  edgeMarkOf,
  type LibraryJson,
  type PlanningJson,
  type StatedTechnique,
} from "./description.ts";

/** The board orders a technique is checked at, from the least up to the
 * first where each of its planted defects comes out unsound. */
export const CHECKED_ORDERS: readonly number[] = [3, 4];

/** The most positions a world of a planning game may have for the dead-end
 * checker to search it whole: a world with more is not checked. */
export const CHECKED_POSITIONS = 400_000;

/** How long the checker spends on one technique, its planted defects
 * included: past it, a technique whose plants were caught and on which no
 * defect was found is taken as holding. */
export const CHECK_BUDGET_MS = 10 * 60_000;

/** A verdict for a technique checked on sampled answers alone, where the
 * whole check did not finish within {@link CHECK_BUDGET_MS}: its
 * fingerprint, marked. One proved on every answer is the fingerprint bare. */
export const heldVerdict = (fp: string): string => `${fp} held`;

/** Whether `recorded`, where a verdict is, is one, proved or held, for
 * fingerprint `fp`. */
export const checkedAs = (fp: string, recorded?: string): boolean =>
  recorded === fp || recorded === heldVerdict(fp);

/** Where a technique's verdict is kept: its description's path and its id. */
export const soundnessKey = (source: string, id: string): string => `${source}#${id}`;

/** Where a dead-end claim's verdict is kept. */
export const deadEndKey = (source: string, id: string): string =>
  `${source}#deadEnd:${id}`;

export const isDeadEndKey = (key: string): boolean => key.includes("#deadEnd:");

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

/** A library technique's fingerprint: it is checked on a plain Latin square,
 * and on one whose last value appears twice in a line. */
export function libraryFingerprint(lib: LibraryJson, id: string): string {
  return fingerprint(
    canonical({
      technique: statement(lib.techniques[id]),
      rules: ["latin", "latin with a value twice a line"],
      orders: CHECKED_ORDERS,
    }),
  );
}

/** A dead-end claim's fingerprint: the claim, and every part of the rules a
 * search of the positions reads, under the cap it searched to. */
export function deadEndFingerprint(d: PlanningJson, src: string): string {
  return fingerprint(
    canonical({
      claim: src,
      rules: {
        space: d.space,
        sizes: d.sizes,
        position: d.position,
        freedom: d.freedom,
        define: d.define ?? {},
        moves: d.moves,
        finish: d.finish,
        lose: d.lose ?? [],
        ...(d.variations === undefined ? {} : { variations: d.variations }),
      },
      positions: CHECKED_POSITIONS,
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
        ...(d.variations === undefined ? {} : { variations: d.variations }),
        // A mark that means something of the answer is checked against it.
        ...(edgeMarkOf(d) === null ? {} : { marks: d.marks }),
      },
      orders: CHECKED_ORDERS,
    }),
  );
}
