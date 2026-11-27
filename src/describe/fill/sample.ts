/**
 * The answer a fill game's deal samples (`engine/fill/deal/samplers.ts`):
 * what each sample lays, and what a sample's settings need of the rest of
 * the deal.
 */

import type { WallsSample } from "../../engine/fill/sample.ts";
import { SET_BLACKS_SYMM } from "../../engine/generate/symmetry.ts";
import { CompileError } from "../compile-sorts.ts";
import {
  type Description,
  type DescriptionJson,
  type SampleJson,
  sampleOf,
} from "../description.ts";
import type { SettingOut } from "./settings.ts";
import { sizeSettings } from "./sizes.ts";

/** The value a sample lays, 0 where it lays no one value: it builds the
 * answer, draws a Latin square, or searches one. */
export function sampledValue(sample: SampleJson | null): number {
  if (
    sample === null ||
    "build" in sample ||
    "latin" in sample ||
    "search" in sample ||
    "walls" in sample
  )
    return 0;
  if ("dominoes" in sample) return sample.dominoes.value;
  if ("lines" in sample) return sample.lines.value;
  if ("picture" in sample) return sample.picture.value;
  if ("pieces" in sample) return sample.pieces.value;
  return sample.scatter.value;
}

/**
 * The sample as the deal reads it (`engine/fill/sample.ts`' `Sample`): a
 * partition's walls take the value the play paints `wall` between two parts
 * and its one other value inside one, so the deal and the drawing cannot
 * disagree on which is the wall. Refused where the answer is not on the
 * edges, where no value or more than one is painted a wall, or where the
 * play has no one other value; and a division into equal parts of a size
 * the params do not give.
 */
export function dealtSample(
  json: DescriptionJson,
  sample: SampleJson | null,
): Exclude<SampleJson, { walls: unknown }> | WallsSample | null {
  if (sample === null || !("walls" in sample)) return sample;
  if (json.answer.value.sort !== "edge")
    throw new CompileError("deal sample walls: the answer is not on the edges");
  const values = Object.entries(json.play?.values ?? {});
  const walls = values.filter(([, v]) => v.paint === "wall");
  const others = values.filter(([, v]) => v.paint !== "wall");
  if (walls.length !== 1 || others.length !== 1)
    throw new CompileError(
      "deal sample walls: the play places two values, one painted wall",
    );
  const { equal } = sample.walls;
  if (typeof equal === "string" && equal !== "w" && json.sizes[equal] === undefined)
    throw new CompileError(
      `deal sample walls: equal parts of ${equal}, which is no size`,
    );
  return {
    walls: {
      division: { equal },
      value: Number(walls[0][0]),
      rest: Number(others[0][0]),
    },
  };
}

/** Refuses a sample of lines counted by no size the params give, an unpair
 * of a board not graded by a climb, and a scatter's mend, climb or first
 * cells where it does not redraw a cell at a time. */
export function checkSample(
  json: DescriptionJson,
  d: Description,
  sample: SampleJson | null,
  settings: readonly SettingOut[],
  hides: boolean,
): void {
  if (sample !== null && "lines" in sample) {
    const { count } = sample.lines;
    if (
      typeof count === "string" &&
      !sizeSettings(settings).some((s) => s.id === count)
    )
      throw new CompileError(`deal sample: ${count} is no size the params give`);
  }
  const unpair = json.deal?.unpair;
  if (unpair !== undefined) {
    if (d.clueKinds.get(unpair)?.at !== "cell")
      throw new CompileError(`deal unpair: ${unpair} is no clue kind at a cell`);
    if (hides)
      throw new CompileError(
        "deal unpair: a board's answer is the ladder's, and a hide",
      );
    const s = sampleOf(json);
    if (s === null || !("scatter" in s) || s.climb !== true)
      throw new CompileError("deal unpair: a board unpaired is graded by a climb");
  }
  if (sample !== null && "scatter" in sample) {
    if ((sample.mend === true || sample.climb === true) && sample.scatter.each !== true)
      throw new CompileError(
        "deal sample: a mend and a climb redraw a cell at a time, so take `each`",
      );
    if (sample.climb === true && hides)
      throw new CompileError(
        "deal sample: a climb keeps what the ladder decided, and a hide",
      );
    if (
      sample.first !== undefined &&
      (sample.scatter.each !== true || sample.climb === true)
    )
      throw new CompileError(
        "deal sample: first cells are kept by a scatter of `each` that does not climb",
      );
  }
}

/** Refuses first cells whose share is no number the options give, or whose
 * symmetry is no option of the symmetries first cells keep. */
export function checkFirst(
  sample: SampleJson | null,
  settings: readonly SettingOut[],
  hides: boolean,
): void {
  if (sample === null || !("first" in sample) || sample.first === undefined) return;
  const { share, symmetry } = sample.first;
  if (!settings.some((s) => s.id === share && s.kind === "number"))
    throw new CompileError(
      `deal sample first: ${share} is no number the settings give`,
    );
  const chosen = settings.find((s) => s.id === symmetry);
  const kept =
    chosen?.kind === "choice" && chosen.gives === undefined
      ? chosen.choices.map((c) => c.symmetry)
      : undefined;
  if (
    kept === undefined ||
    kept.some((s) => s === undefined || SET_BLACKS_SYMM[s] === undefined)
  )
    throw new CompileError(
      `deal sample first: ${symmetry} is no option of the symmetries first cells keep (${Object.keys(SET_BLACKS_SYMM).join(", ")})`,
    );
  if (!hides && "build" in sample)
    throw new CompileError(
      "deal sample first: the build is on the first cells' clues with every hidden one hidden, and no hide",
    );
}
