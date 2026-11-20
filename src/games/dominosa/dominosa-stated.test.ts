/**
 * The wordings of Dominosa's stated hint that no walk of the word dump reaches:
 * a later leg of a firing that rules out several spots, for the kinds whose
 * firings the dump only ever meets with one spot (`localDuplicate`,
 * `localDuplicate2`, `parity`, `setDoubles`). Each is rendered from the
 * compiled module's clauses, as the engine renders it.
 */
import { describe, expect, it } from "vitest";
import { CELL } from "../../engine/contract/hint-words.ts";
import { statedSentence } from "../../engine/stated.ts";
import { STATED } from "../../generated/games/dominosa/dominosa.compiled.ts";
import { SPOT } from "./kinds.ts";

const cx = (later: boolean, outline: number[]) => ({
  kind: CELL,
  ringKind: SPOT,
  at: (c: number) => ({ x: c, y: 0 }),
  ring: [[0, 1]] as [number, number][],
  marks: { outline: outline.map((c) => ({ x: c, y: 0 })), stripes: [] },
  terms: { lo: 2, hi: 5 },
  value: String,
  later,
});

describe("dominosa hint — the wordings no walk reaches", () => {
  it.each([
    "localDuplicate",
    "localDuplicate2",
    "setDoubles",
  ] as const)("%s: a later leg points back at the evidence", (kind) => {
    const said = statedSentence(STATED[kind].step[0], cx(true, [3])).text;
    expect(said).toBe(
      "…and this spot can't hold a domino either, for the same reason about the outlined square.",
    );
  });

  it("parity: a later leg has no evidence to point at", () => {
    expect(statedSentence(STATED.parity.step[0], cx(true, [])).text).toBe(
      "…and this spot can't hold a domino either, for the same reason.",
    );
  });
});
