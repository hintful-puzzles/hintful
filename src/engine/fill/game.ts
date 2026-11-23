/**
 * A fill game built whole from its compiled description: every hook of the
 * game contract from the engine's fill board, so a game born from its
 * description writes no TypeScript (`openspec/changes/a-game-from-its-description-alone`,
 * design.md § 2). The compiler writes the module that calls this and
 * registers the game (`describe/sources.ts`, `bornFiles`).
 */

import { descValue } from "../contract/desc-error.ts";
import type { Game, GamePref, HintStep, PresetBoards } from "../contract/game.ts";
import type { MarkRole } from "../contract/hint-words.ts";
import { HEXAGON, SQUARE_GRID } from "../contract/sections.ts";
import type { Point } from "../contract/types.ts";
import { transposeDimensions } from "../game-id/params.ts";
import { drag, type PointerAction } from "../input/hint-gesture.ts";
import { verbClicks } from "../input/target-verb.ts";
import { PAINTERS, type PainterName } from "../render/pieces/index.ts";
import { searchTiers } from "../solve/answer-search.ts";
import { inHexagon } from "../solve/describe-runtime.ts";
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
import {
  boardSizeOf,
  type Clues,
  type FillBoard,
  newBoard,
  solveBoard,
  spaceOf,
} from "./board.ts";
import { type DealtFillModule, dealFill } from "./deal.ts";
import type { Edit } from "./edit.ts";
import {
  type ClueMax,
  decodeDesc,
  type FillBounds,
  type FillDeal,
  type FillModifier,
  type FillParams,
  fillParams,
  sizesOf,
  tallyClue,
  tallyDefault,
  variationsOf,
  withThorough,
} from "./game-id.ts";
import { type FillHint, type FillHintModule, fillHint, linkedCell } from "./hint.ts";
import {
  applyMove,
  type FillMove,
  fillMoveOf,
  isCandidateMove,
  markAll,
} from "./notes.ts";
import { type NumberInput, numberInput, numeral, typedUi } from "./numbers.ts";
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

/** What a game born from its description's compiled module holds. */
export interface BornModule<C> extends FillHintModule<C>, DealtFillModule<C> {
  readonly play: FillPlay;
  readonly lineClues: readonly (keyof C)[];
  readonly lineLists?: readonly (keyof C)[];
  readonly labels?: { readonly start?: (i: number) => string };
  readonly deal: FillDeal;
  readonly clueMax: ClueMax<C>;
  readonly boards: readonly Board[];
  /** The preset menu beside its grid of `boards`. */
  readonly menu?: {
    readonly default?: Board;
    readonly tiers: readonly (Board & {
      readonly first: number;
      readonly last: number;
    })[];
    readonly variants: readonly (Size & {
      readonly variations: readonly string[];
      readonly diff: number;
    })[];
  };
  readonly modifiers?: Readonly<Record<string, FillModifier>>;
  /** What the sizes alone cannot say of a board (`play.bounds`). */
  readonly bounds?: FillBounds;
  readonly hintMarks: Readonly<Partial<Record<MarkRole, string>>>;
}

type Size = { readonly w: number; readonly h: number };

/** A preset board: its size, and the sizes beyond the grid's it gives, by
 * name, where the params have any, and the deal's options it names. */
type Board = Size & {
  readonly sizes?: Readonly<Record<string, number>>;
  readonly options?: Readonly<Record<string, number>>;
  /** The tally's size, its counts the size's default. */
  readonly tally?: number;
};

/** Whether params `p` are those of the board `b`. */
const isBoard = (p: FillParams, b: Board): boolean =>
  p.w === b.w &&
  p.h === b.h &&
  Object.entries(b.sizes ?? {}).every(([n, v]) => p.sizes?.[n] === v) &&
  (b.tally === undefined || p.tally?.length === b.tally);

export type FillGame<C> = Game<
  FillParams,
  FillBoard<C>,
  FillMove,
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
  // A board gives each size beyond the grid's, its least where it names none,
  // and each option, its default where it names none.
  const sized = ({ w, h, sizes, options, tally }: Board, diff = 0): FillParams =>
    withThorough(deal, {
      w,
      h,
      diff,
      ...(deal.tally === undefined
        ? {}
        : { tally: tallyDefault(tally ?? deal.tally.size.default) }),
      ...(deal.hideFlag === undefined ? {} : { hides: false }),
      ...(deal.settings === undefined
        ? {}
        : {
            sizes: Object.fromEntries(
              deal.settings.map((s) => [s.size, sizes?.[s.size] ?? s.min]),
            ),
          }),
      ...(deal.options === undefined
        ? {}
        : {
            options: Object.fromEntries(
              Object.entries(deal.options).map(([n, o]) => [
                n,
                options?.[n] ?? o.default,
              ]),
            ),
          }),
    });
  const defaultParams = (): FillParams => sized(byDefault);
  const params = fillParams(
    deal,
    module.tiers,
    defaultParams,
    module.modifiers,
    module.bounds,
    // A preset's option where the board is one, else the option's default.
    (p, name) =>
      boards.find((b) => isBoard(p, b))?.options?.[name] ??
      deal.options?.[name]?.default ??
      0,
  );
  const boardTiers = module.menu?.tiers ?? [];
  const variants = module.menu?.variants ?? [];
  const menu: PresetBoards<FillParams> = {
    boards: boards.map((b) => sized(b)),
    ...(boardTiers.length === 0
      ? {}
      : {
          tiers: (p: FillParams) => {
            const got = boardTiers.find((b) => isBoard(p, b));
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
  /** A boolean preference on the Ui, by its field. */
  const flag = (
    { kw, name }: { readonly kw: string; readonly name: string },
    field: "washedMarks" | "hiddenShown",
  ): GamePref<FillUi> => ({
    kw,
    name,
    type: "boolean",
    get: (ui) => ui[field],
    set: (ui, v) => {
      ui[field] = v;
    },
  });
  const prefs = [
    ...(play.wash?.pref === undefined ? [] : [flag(play.wash.pref, "washedMarks")]),
    ...(play.hides === undefined ? [] : [flag(play.hides.pref, "hiddenShown")]),
  ];
  const numbered = module.numbers ?? [];
  const reading: AnswerReading<C> = {
    blank: play.blank ?? null,
    numbers: numbered as readonly (keyof C)[],
    glyphs:
      play.numbers === undefined
        ? Object.fromEntries(
            Object.entries({ ...play.given, ...play.values }).map(([v, { glyph }]) => [
              Number(v),
              glyph,
            ]),
          )
        : // Every value a cell's domain mask can hold.
          Object.fromEntries(
            Array.from({ length: 31 }, (_, i) => [i + 1, ` ${numeral(i + 1)} `]),
          ),
    lineClues: module.lineClues,
    ...(module.lineLists === undefined ? {} : { lineLists: module.lineLists }),
    ...(deal.partitions === undefined
      ? {}
      : { partition: deal.partitions[0] as keyof C }),
  };
  // The board's clues are the desc's, beside the params' sizes beyond the
  // grid's.
  const newState = (p: FillParams, desc: string): FillBoard<C> => {
    const size = boardSizeOf(module, p);
    const sp = spaceOf(module, size);
    const sizes = sizesOf(p);
    const grown = module.growBy?.(sp, sizes) ?? null;
    const clues = descValue(decodeDesc<C>(deal, sp, module.clueMax, desc, grown));
    const tally =
      deal.tally === undefined ? {} : { [deal.tally.kind]: tallyClue(deal.tally, p) };
    return newBoard<C>(
      module,
      size.w,
      size.h,
      { ...clues, ...sizes, ...tally },
      variationsOf(p),
    );
  };
  // The renderer previews the input's drag, and the input reads the board
  // where the renderer puts it: each is read only once both are built.
  const render: FillRender<C> = fillRender(
    module,
    {
      play,
      lineClues: module.lineClues,
      ...(module.lineLists === undefined ? {} : { lineLists: module.lineLists }),
      ...(module.labels === undefined ? {} : { labels: module.labels }),
    },
    (b, ui) => buttons?.previewed(b, ui) ?? b,
  );
  // A board of numbers is typed into; one of buttons is clicked and dragged.
  const typed =
    play.numbers === undefined
      ? null
      : numberInput<C, FillDrawState>(module, render.origin);
  const buttons: FillInput<C, FillDrawState> | null =
    typed === null ? fillInput(module, play, render.origin) : null;
  const inputs =
    buttons !== null
      ? { targetVerbs: buttons.targetVerbs, interpretMove: buttons.interpretMove }
      : {
          interpretMove: (typed as NumberInput<C, FillDrawState>).interpretMove,
          requestKeys: (p: FillParams) =>
            (typed as NumberInput<C, FillDrawState>).requestKeys(
              boardSizeOf(module, p),
            ),
        };
  const notes = play.notes === true;
  const { hint, rulesOut } = fillHint(module);
  // The values whose piece grows when placed.
  const growing = new Set(
    Object.entries(play.values ?? {})
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
    ...(deal.square === true
      ? { notApplicable: { transposeParams: SQUARE_GRID } }
      : deal.hexagon !== undefined
        ? { notApplicable: { transposeParams: HEXAGON } }
        : { transposeParams: transposeDimensions() }),
    paramConfig: params.paramConfig,

    newDesc: (p, rs) => dealFill(module, deal, p, rs),
    newState,
    newUi: (b) => {
      const ui = typed === null ? newFillUi() : typedUi(newFillUi(), notes);
      // A hexagon's store has no cell at its top left; the cursor starts on
      // the first that is the board's.
      if (module.hexagon !== undefined)
        ui.cursor.x =
          Array.from({ length: b.w }, (_, x) => x).find((x) =>
            inHexagon(b.w, b.h, x, 0),
          ) ?? 0;
      return ui;
    },

    ...inputs,
    executeMove: (b, m) => applyMove(module, b, fillMoveOf(m, `${id}: executeMove`)),
    ...(!notes
      ? {}
      : {
          markAll: (b: FillBoard<C>) => markAll(module, b),
          // A cell selected for notes takes none once a value is on it,
          // unless the keyboard holds the highlight there.
          changedState: (ui: FillUi, _old: FillBoard<C> | null, b: FillBoard<C>) => {
            const { cursor } = ui;
            if (
              cursor.visible &&
              ui.pencilMode === true &&
              ui.cursorFromKeyboard !== true &&
              b.values[cursor.y * b.w + cursor.x] !== 0
            )
              cursor.visible = false;
          },
        }),
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
    ...(prefs.length === 0 ? {} : { prefs }),
    // A plain number has no cells to be done with, so is never counted.
    ...(!numbered.some((k) => module.clueCells?.[k] !== undefined)
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
      gesture: (b, ui, ds, move, step) => {
        if (typed !== null) return typed.gesture(b, ui, ds, move);
        // A board of buttons makes edits alone.
        if (isCandidateMove(move))
          throw new Error(`${id}: no gesture for ${JSON.stringify(move)}`);
        return buttonGesture(
          buttons as FillInput<C, FillDrawState>,
          b,
          ui,
          ds,
          move,
          step,
        );
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

  /** The hint's gesture on a board of buttons: a square is clicked with the
   * button whose verb the step keeps, and a link is dragged from its square
   * to its clue, which places the square's value too. */
  function buttonGesture(
    input: FillInput<C, FillDrawState>,
    b: FillBoard<C>,
    ui: FillUi,
    ds: FillDrawState,
    move: Edit,
    step: HintStep<FillMove, FillHint, string>,
  ): PointerAction[] {
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
          executeMove: (s, m) => applyMove(module, s, m),
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
  }
}
