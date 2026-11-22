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
import { PAINTERS, type PainterName } from "../render/pieces/index.ts";
import { searchTiers } from "../solve/answer-search.ts";
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
  type FillModifier,
  type FillParams,
  fillParams,
  variationsOf,
  withThorough,
} from "./game-id.ts";
import { type FillHint, type FillHintModule, fillHint, linkedCell } from "./hint.ts";
import {
  type FillInput,
  type FillPlay,
  type FillUi,
  fillInput,
  newFillUi,
} from "./play.ts";
import {
  type FillDrawState,
  type FillRender,
  fillRender,
  PLACE_ANIM_TIME,
} from "./render.ts";
import { answerSearched, searches } from "./search.ts";

/** A board's clues, by kind. */
type Clues<C> = { readonly [K in keyof C]: ClueList };

/** What a game born from its description's compiled module holds. */
export interface BornModule<C> extends FillHintModule<C>, DealtFillModule<C> {
  readonly play: FillPlay;
  readonly lineClues: readonly (keyof C)[];
  readonly labels?: { readonly start?: (i: number) => string };
  readonly deal: FillDeal;
  readonly clueMax: ClueMax<C>;
  readonly boards: readonly Size[];
  /** The preset menu beside its grid of `boards`. */
  readonly menu?: {
    readonly default?: Size;
    readonly tiers: readonly (Size & {
      readonly first: number;
      readonly last: number;
    })[];
    readonly variants: readonly (Size & {
      readonly variations: readonly string[];
      readonly diff: number;
    })[];
  };
  readonly modifiers?: Readonly<Record<string, FillModifier>>;
  readonly hintMarks: Readonly<Partial<Record<MarkRole, string>>>;
}

type Size = { readonly w: number; readonly h: number };

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
  const byDefault = module.menu?.default ?? boards[0];
  const sized = ({ w, h }: Size, diff = 0): FillParams =>
    withThorough(deal, { w, h, diff });
  const defaultParams = (): FillParams => sized(byDefault);
  const params = fillParams(deal, module.tiers, defaultParams, module.modifiers);
  const boardTiers = module.menu?.tiers ?? [];
  const variants = module.menu?.variants ?? [];
  const menu: PresetBoards<FillParams> = {
    boards: boards.map((b) => sized(b)),
    ...(boardTiers.length === 0
      ? {}
      : {
          tiers: (p: FillParams) => {
            const got = boardTiers.find((b) => b.w === p.w && b.h === p.h);
            return got === undefined ? null : [got.first, got.last];
          },
        }),
    ...(variants.length === 0
      ? {}
      : {
          variants: variants.map(({ w, h, variations, diff }) => ({
            ...sized({ w, h }, diff),
            variations,
          })),
        }),
  };
  const numbered = module.numbers ?? [];
  const reading: AnswerReading<C> = {
    blank: play.blank ?? null,
    numbers: numbered as readonly (keyof C)[],
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
      variationsOf(p),
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
  // The values whose piece grows when placed.
  const growing = new Set(
    Object.entries(play.values)
      .filter(
        ([, { paint }]) => paint in PAINTERS && PAINTERS[paint as PainterName].grows,
      )
      .map(([v]) => Number(v)),
  );

  return {
    id,
    defaultParams,
    menu,
    encodeParams: params.encodeParams,
    decodeParams: params.decodeParams,
    validateParams: params.validateParams,
    transposeParams: transposeDimensions(),
    paramConfig: params.paramConfig,

    newDesc: (p, rs) => dealFill(module, deal, p, rs),
    newState,
    newUi: () => newFillUi(module.play.stroke),

    targetVerbs: input.targetVerbs,
    interpretMove: input.interpretMove,
    executeMove: (b, m) => applyEdit(module, b, editOf(m, `${id}: executeMove`)),
    status: (b) => status(module, reading, b),

    solve: (orig, curr, aux) => solve(module, orig, curr, aux),
    rules: rulesOf(module),
    difficulty: searches(module)
      ? searchTiers(module.tiers).contract({
          newState,
          deductionFinishes: (b, cap) =>
            solveBoard(module, b, cap).verdict === "solved",
          answerOf: (b) => answerSearched(module, b),
        })
      : {
          solveAtCap: (p, desc, cap) =>
            solveBoard(module, newState(p, desc), cap).verdict,
        },
    findMistakes: (b) => findMistakes(module, b),
    clearMistakes,
    revealOne,
    textFormat: (b) => textFormat(reading, b),
    ...(numbered.length === 0
      ? {}
      : {
          // The numbers not yet done, while any is left.
          statusbarText: (b: FillBoard<C>) => {
            const left = render.numbersLeft(b);
            return left > 0 ? `Clues left: ${left}` : "";
          },
        }),
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
        // The squares the secondary value rules out go first: a placement
        // may bring that value onto them (`rulesOut`), and a click after
        // would take it off again.
        const clicks: Point[] = [];
        for (const ruling of [true, false])
          for (let i = 0; i < set.length; i += 2)
            if (!linked.has(set[i]) && (set[i + 1] === play.secondary) === ruling)
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
    // A piece placed or taken away on one cell grows or shrinks; a move that
    // changes more, a solve or a stroke, is instant, and so is one whose
    // pieces are drawn whole.
    animLength: (a, b) => {
      let at = -1;
      for (let c = 0; c < a.values.length; c++)
        if (a.values[c] !== b.values[c]) {
          if (at >= 0) return 0;
          at = c;
        }
      return at >= 0 && (growing.has(a.values[at]) || growing.has(b.values[at]))
        ? PLACE_ANIM_TIME
        : 0;
    },
  };
}
