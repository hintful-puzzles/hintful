/**
 * The answer a fill game's deal samples (`engine/fill/deal/samplers.ts`):
 * what each sample lays, and what a sample's settings need of the rest of
 * the deal.
 */

import { SET_BLACKS_SYMM } from "../../engine/generate/symmetry.ts";
import { CompileError } from "../compile-sorts.ts";
import {
  type Description,
  type DescriptionJson,
  type SampleJson,
  sampleOf,
} from "../description.ts";
import { type SettingOut, sizeSettings } from "./settings.ts";

/** The value a sample lays, 0 where it lays no one value: it builds the
 * answer, draws a Latin square, or searches one. */
export function sampledValue(sample: SampleJson | null): number {
  if (sample === null || "build" in sample || "latin" in sample || "search" in sample)
    return 0;
  if ("dominoes" in sample) return sample.dominoes.value;
  if ("lines" in sample) return sample.lines.value;
  if ("picture" in sample) return sample.picture.value;
  if ("pieces" in sample) return sample.pieces.value;
  return sample.scatter.value;
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
  const unpair = json.deal?.["unpair"];
  if (unpair !== undefined) {
    if (typeof unpair !== "string" || d.clueKinds.get(unpair)?.at !== "cell")
      throw new CompileError(
        `deal unpair: ${String(unpair)} is no clue kind at a cell`,
      );
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
