/**
 * What a fill board's look is, read once from its compiled module and its
 * `play:`: which clues it draws where, its palette and its geometry. Every
 * layer and site of the renderer reads it; none reads the module itself.
 */

import type { Painter } from "../../render/pieces/index.ts";
import type { Partition } from "../../solve/describe-runtime.ts";
import { rulesOf } from "../answer.ts";
import { type Clues, type FillBoard, listOf } from "../board.ts";
import { cornerKindsOf } from "../corners.ts";
import { type ClueMax, partKindsOf } from "../game-id.ts";
import { gapKindsOf } from "../gaps.ts";
import { tallyIn } from "../params/tally.ts";
import type { FillPlay, FillUi } from "../play.ts";
import type { FillLook } from "../render.ts";
import type { SearchedFillModule } from "../search.ts";
import { type FillMetrics, fillMetrics } from "./geometry.ts";
import { type FillPalette, fillPalette } from "./palette.ts";

/** What a fill board is drawn from, beside its look. */
export type FillRenderModule<C> = SearchedFillModule<C> & {
  /** The rules over a dealt partition's parts, which break at the cells
   * they count however those lie. */
  readonly partRules?: readonly string[];
  /** Each clue kind's most value at an element, which a corner's clue of
   * one value is drawn as its sign alone by. */
  readonly clueMax?: ClueMax<C>;
};

export type FillSetup<C extends Clues<C>> = ReturnType<typeof fillSetup<C>>;

export function fillSetup<C extends Clues<C>>(
  module: FillRenderModule<C>,
  look: FillLook<C>,
  previewed: (board: FillBoard<C>, ui: FillUi) => FillBoard<C>,
) {
  const play: FillPlay = look.play;
  const { lineClues, labels } = look;
  const lineLists = look.lineLists ?? [];
  const slotClues = look.slotClues ?? [];
  const slotted = slotClues.length > 0;
  const labelStart = labels?.start;
  // The partition drawn as walls and fills: the one among the units where
  // the board has one (a Sudoku's blocks), else the first it deals.
  const boxes = module.boxes;
  const walled = (boxes?.name ?? module.deal?.partitions?.[0]) as
    | (keyof C & string)
    | undefined;
  // A dealt partition beside those blocks is drawn inset inside its walls
  // (Solo's Killer cages), and its parts hold the board's part clues.
  const inset = (
    boxes === undefined
      ? undefined
      : module.deal?.partitions?.find((r) => r !== boxes.name)
  ) as (keyof C & string) | undefined;
  /** The partition whose parts the part clues sit at. */
  const labeledBy = inset ?? walled;
  const partRules: readonly string[] = module.partRules ?? [];
  const rules = rulesOf(module);
  const numbers = (module.numbers ?? []) as readonly (keyof C & string)[];
  const clueCells = module.clueCells ?? {};
  /** The kinds at the dealt partition's parts, each drawn at its part's
   * first cell as its number and its sign. */
  const partKinds = partKindsOf(module.deal) as (keyof C & string)[];
  const labeled = partKinds.length > 0;
  /** The kinds at corners, each drawn on a disc where its four cells meet. */
  const cornerKinds = cornerKindsOf(module.deal) as (keyof C & string)[];
  const cornered = cornerKinds.length > 0;
  const gapKinds = gapKindsOf<C>(play);
  const gapped = gapKinds.length > 0;
  const hexagon = module.hexagon !== undefined;
  /** On a board of numbers (`play.numbers`), each value is drawn as its
   * numeral. */
  const typed = play.numbers !== undefined;
  const notes = play.notes === true;
  /** Where the board draws its values raised (`play.numbers.raised`). */
  const raises = play.numbers?.raised === true;
  /** The clue kind a link from a cell names the clue of. */
  const linkClues = play.links === undefined ? null : (play.links.clue as keyof C);
  const pal: FillPalette = fillPalette(play, numbers.length > 0, walled !== undefined);
  const metrics: FillMetrics = fillMetrics({
    notes,
    covers: play.covers !== undefined,
    lineLabels: labelStart !== undefined,
    listed: lineLists.length > 0,
    lineClued: lineClues.length > 0,
    slotted,
    gapped,
    hexagon,
  });

  /** The board's tally of pieces (`deal.tally`), drawn beneath it as the
   * piece whose painter runs; `null` where it deals none. */
  const tallied = ((): {
    kind: keyof C;
    count: string;
    value: number;
    piece: { painter: Painter; slot: readonly number[] };
  } | null => {
    const t = module.deal === undefined ? null : tallyIn(module.deal);
    if (t === null) return null;
    const run = [...pal.byValue.entries()].find(([, p]) => p.painter.runs === true);
    if (run === undefined) throw new Error("play: a tally, and no piece that runs");
    return { kind: t.id as keyof C, count: t.count, value: run[0], piece: run[1] };
  })();
  /** The counts of a board's tally, the pieces of each length. */
  const tallyCounts = (
    b: FillBoard<C>,
    kind: keyof C,
    count: string,
  ): readonly number[] =>
    (b.dealt[kind] as unknown as Readonly<Record<string, readonly number[]>>)[count];

  /** The number on cell `c`, its kind and its index in the kind's list, or
   * `null`. */
  const numberAt = (
    b: FillBoard<C>,
    c: number,
  ): { kind: keyof C & string; k: number } | null => {
    for (const kind of numbers) {
      const k = listOf(b.dealt, kind).byAt[c];
      if (k >= 0) return { kind, k };
    }
    return null;
  };

  /** The partition the part clues sit at on board `b`: absent from a board a
   * variation that deals it is off on. */
  const labelParts = (b: FillBoard<C>): Partition | null =>
    labeledBy === undefined
      ? null
      : ((b.dealt[labeledBy] as Partition | undefined) ?? null);

  return {
    module,
    play,
    previewed,
    lineClues,
    lineLists,
    slotClues,
    slotted,
    labelStart,
    walled,
    inset,
    labeledBy,
    partRules,
    rules,
    numbers,
    clueCells,
    partKinds,
    labeled,
    cornerKinds,
    cornered,
    gapKinds,
    gapped,
    hexagon,
    typed,
    notes,
    raises,
    linkClues,
    pal,
    metrics,
    tallied,
    tallyCounts,
    numberAt,
    labelParts,
    /** Each part clue's size, by tile size, walls and length
     * (`cell-text.ts`'s `labelText`). */
    labelSizes: new Map<string, number>(),
  };
}
