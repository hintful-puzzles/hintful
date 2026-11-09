import { expect, it } from "vitest";
import { describedSpace } from "./describe-runtime.ts";
import {
  type Caps,
  CellMarks,
  compiledRung,
  type LadderEntry,
  ladderTechniques,
  runLadder,
  TIERS,
} from "./ladder-runtime.ts";

const marks = (): CellMarks =>
  new CellMarks(describedSpace([], 1, 1), 0b10, new Uint8Array(1));

/** An entry whose technique answers `run()`, noting each attempt in `tried`. */
const entry = (
  id: string,
  tier: number,
  run: () => number,
  tried: string[] = [],
  scale?: string,
): LadderEntry => ({
  id,
  tier,
  scale,
  run: compiledRung(
    () => {
      tried.push(id);
      return run();
    },
    null,
    () => ({}),
  ),
});

/** Run `entries` at `caps` to a fixpoint, and give the grades it reached. */
function grade(entries: readonly LadderEntry[], caps: Caps = { [TIERS]: 9 }) {
  const m = marks();
  const grades: Record<string, number> = {};
  const impossible = runLadder(m, ladderTechniques(m, entries, caps, grades));
  return { grades, impossible };
}

it("grades by the hardest tier that fired, not the last", () => {
  // The hard entry fires first and leaves easy work behind, which is the
  // usual shape: the ladder restarts from the top after every firing. A grade
  // taken from the last firing would score this board easy, and a generator
  // gated on the grade would accept it as such.
  let hard = 1;
  let easy = 0;
  const { grades } = grade([
    entry("easy", 0, () => (easy-- > 0 ? 1 : 0)),
    entry("normal", 1, () => 0),
    entry("hard", 2, () => {
      if (hard-- > 0) {
        easy = 2;
        return 1;
      }
      return 0;
    }),
  ]);
  expect(grades).toEqual({ [TIERS]: 2 });
});

it("grades two entries sharing a tier alike, whatever their positions", () => {
  let once = 1;
  const { grades } = grade([
    entry("threes", 0, () => 0),
    entry("single-gap", 0, () => (once-- > 0 ? 1 : 0)),
    entry("complete-nums", 1, () => 0),
  ]);
  expect(grades).toEqual({ [TIERS]: 0 });
});

it("caps by tier, never by position: a cheap entry after a dear one still runs", () => {
  // `hard` is bounded, so a runtime capping by position fails on the
  // assertion rather than spinning.
  const tried: string[] = [];
  let hard = 1;
  let loop = 1;
  const { grades } = grade(
    [
      entry("trivial", 0, () => 0, tried),
      entry("hard", 2, () => (hard-- > 0 ? 1 : 0), tried),
      entry("loop", 0, () => (loop-- > 0 ? 1 : 0), tried),
    ],
    { [TIERS]: 1 },
  );
  expect(tried).toEqual(["trivial", "loop", "trivial", "loop"]);
  expect(grades).toEqual({ [TIERS]: 0 });
});

it("grades each scale apart, and runs no entry of a scale without a cap", () => {
  const tried: string[] = [];
  let cage = 1;
  let plain = 1;
  const entries = [
    entry("plain", 1, () => (plain-- > 0 ? 1 : 0), tried),
    entry("cage", 3, () => (cage-- > 0 ? 1 : 0), tried, "killer"),
  ];
  expect(grade(entries, { [TIERS]: 9, killer: 9 }).grades).toEqual({
    [TIERS]: 1,
    killer: 3,
  });
  tried.length = 0;
  cage = 1;
  plain = 1;
  expect(grade(entries).grades).toEqual({ [TIERS]: 1 });
  expect(tried).not.toContain("cage");
});
