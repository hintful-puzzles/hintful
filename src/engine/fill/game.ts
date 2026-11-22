/**
 * A fill game built whole from its compiled description: every hook of the
 * game contract from the engine's fill board, so a game born from its
 * description writes no TypeScript (`openspec/changes/a-game-from-its-description-alone`,
 * design.md § 2). The compiler writes the module that calls this and
 * registers the game (`describe/sources.ts`, `bornFiles`).
 */

import { descValue } from "../contract/desc-error.ts";
import type { Game, PresetBoards } from "../contract/game.ts";
import type { MarkRole } from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import { transposeDimensions } from "../game-id/params.ts";
import { drag, type PointerAction } from "../input/hint-gesture.ts";
import { verbClicks } from "../input/target-verb.ts";
import type { ClueList } from "../solve/describe-runtime.ts";
import {
  type AnswerReading,
  clearMistakes,
  type FillMistake,
  findMistakes,
  revealOne,
  rulesOf,
  solve,
  status,
  textFormat,
} from "./answer.ts";
import { type FillBoard, newBoard, solveBoard, spaceOf } from "./board.ts";
import { type DealtFillModule, dealFill } from "./deal.ts";
import { applyEdit, type Edit, editOf } from "./edit.ts";
import {
  type ClueMax,
  decodeDesc,
  type FillDeal,
  type FillParams,
  fillParams,
} from "./game-id.ts";
import { type FillHint, type FillHintModule, fillHint, linkedCell } from "./hint.ts";
import {
  type FillInput,
  type FillPlay,
  type FillUi,
  fillInput,
  newFillUi,
} from "./play.ts";
import { type FillDrawState, type FillRender, fillRender } from "./render.ts";

/** A board's clues, by kind. */
type Clues<C> = { readonly [K in keyof C]: ClueList };

/** What a game born from its description's compiled module holds. */
export interface BornModule<C> extends FillHintModule<C>, DealtFillModule<C> {
  readonly play: FillPlay;
  readonly lineClues: readonly (keyof C)[];
  readonly labels?: { readonly start?: (i: number) => string };
  readonly deal: FillDeal;
  readonly clueMax: ClueMax<C>;
  readonly boards: readonly { readonly w: number; readonly h: number }[];
  readonly hintMarks: Readonly<Partial<Record<MarkRole, string>>>;
}

export type FillGame<C> = Game<
  FillParams,
  FillBoard<C>,
  Edit,
  FillUi,
  FillDrawState,
  FillMistake,
  FillHint,
  string
>;

export function fillGame<C extends Clues<C> & object>(
  id: string,
  module: BornModule<C>,
): FillGame<C> {
  const { play, deal, boards } = module;
  const [first] = boards;
  const defaultParams = (): FillParams => ({ w: first.w, h: first.h, diff: 0 });
  const params = fillParams(deal, module.tiers, defaultParams);
  const menu: PresetBoards<FillParams> = {
    boards: boards.map(({ w, h }) => ({ w, h, diff: 0 })),
  };
  const reading: AnswerReading<C> = {
    blank: play.blank ?? null,
    glyphs: Object.fromEntries(
      Object.entries({ ...play.given, ...play.values }).map(([v, { glyph }]) => [
        Number(v),
        glyph,
      ]),
    ),
    lineClues: module.lineClues,
  };
  const newState = (p: FillParams, desc: string): FillBoard<C> =>
    newBoard(
      module,
      p.w,
      p.h,
      descValue(decodeDesc(deal, spaceOf(module, p), module.clueMax, desc)),
    );
  // The renderer previews the input's drag, and the input reads the board
  // where the renderer puts it: each is read only once both are built.
  const render: FillRender<C> = fillRender(
    module,
    {
      play,
      lineClues: module.lineClues,
      ...(module.labels === undefined ? {} : { labels: module.labels }),
    },
    (b, ui) => input.previewed(b, ui),
  );
  const input: FillInput<C, FillDrawState> = fillInput(module, play, render.origin);
  const { hint, rulesOut } = fillHint(module);

  return {
    id,
    defaultParams,
    menu,
    encodeParams: params.encodeParams,
    decodeParams: params.decodeParams,
    transposeParams: transposeDimensions(),
    paramConfig: params.paramConfig,

    newDesc: (p, rs) => dealFill(module, deal, p, rs),
    newState,
    newUi: () => newFillUi(),

    targetVerbs: input.targetVerbs,
    interpretMove: input.interpretMove,
    executeMove: (b, m) => applyEdit(module, b, editOf(m, `${id}: executeMove`)),
    status: (b) => status(module, reading, b),

    solve: (orig, curr, aux) => solve(module, orig, curr, aux),
    rules: rulesOf(module),
    difficulty: {
      solveAtCap: (p, desc, cap) => solveBoard(module, newState(p, desc), cap).verdict,
    },
    findMistakes: (b) => findMistakes(module, b),
    clearMistakes,
    revealOne,
    textFormat: (b) => textFormat(reading, b),
    ...(rulesOut === undefined ? {} : { rulesOut }),
    hint: {
      ...hint,
      marks: { roles: module.hintMarks },
      // A square is clicked with the button whose verb the step keeps, and a
      // link is dragged from its square to its clue, which places the
      // square's value too.
      gesture: (b, ui, ds, move, step) => {
        const { geometry } = input.targetVerbs;
        const at = (c: number) =>
          geometry.pointAt(b, ds, { x: c % b.w, y: Math.floor(c / b.w) }, ui);
        const marks = move.mark ?? [];
        const linked = new Set(marks.filter((_, i) => i % 2 === 0));
        const set = move.set ?? [];
        const clicks: Point[] = [];
        for (let i = 0; i < set.length; i += 2)
          if (!linked.has(set[i]))
            clicks.push({ x: set[i] % b.w, y: Math.floor(set[i] / b.w) });
        const drags: PointerAction[] = [];
        if (play.links !== undefined)
          for (let i = 0; i < marks.length; i += 2)
            drags.push(drag(at(marks[i]), at(linkedCell(b, play.links, marks[i + 1]))));
        return [
          ...verbClicks(
            input.targetVerbs,
            {
              executeMove: (s, m) => applyEdit(module, s, m),
              keepTrack: hint.keepTrack,
            },
            b,
            ui,
            ds,
            step,
            clicks,
          ),
          ...drags,
        ];
      },
    },

    colors: render.colors,
    preferredTileSize: render.preferredTileSize,
    computeSize: render.computeSize,
    newDrawState: render.newDrawState,
    redraw: render.redraw,
  };
}
