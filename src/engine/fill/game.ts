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
import {
  autoPencilPref,
  candidateReadingPref,
  pencilKeepHighlightPref,
  stickyPencilPref,
} from "../hint/pencil-prefs.ts";
import { drag, type PointerAction } from "../input/hint-gesture.ts";
import { newCursor } from "../input/pointer.ts";
import { verbClicks } from "../input/target-verb.ts";
import { PAINTERS, type PainterName } from "../render/pieces/index.ts";
import { searchTiers } from "../solve/answer-search.ts";
import { inHexagon } from "../solve/describe-runtime.ts";
import {
  type AnswerReading,
  clearMistakes,
  edgeTextOf,
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
  paramSpaceOf,
  solveBoard,
  spaceOf,
  walledParts,
} from "./board.ts";
import { type CandidateFillModule, candidateFill } from "./candidates.ts";
import { cornerKindsOf, cornerRange } from "./corners.ts";
import type { DealtFillModule } from "./deal/context.ts";
import { dealFill } from "./deal.ts";
import { decodeDesc } from "./desc.ts";
import type { Edit } from "./edit.ts";
import {
  type ClueMax,
  type FillDeal,
  type FillParams,
  fillParams,
  givenOf,
  partitionOfKind,
  partKindsOf,
  sizesOf,
  startSettings,
} from "./game-id.ts";
import { gapClueAt, gapKindsOf } from "./gaps.ts";
import {
  type FillHint,
  type FillHintModule,
  type FiringFillHint,
  fillHint,
  linkedCell,
  tierOfBoard,
} from "./hint.ts";
import { applyMove, type FillMove, fillMoveOf, markAll } from "./notes.ts";
import { type NumberInput, numberInput, numeral, typedUi } from "./numbers.ts";
import type { FillBounds } from "./params/bounds.ts";
import { variationsOf } from "./params/flag.ts";
import type { PresetSettings } from "./params/setting.ts";
import {
  type FillInput,
  type FillPlay,
  type FillUi,
  fillInput,
  newFillUi,
} from "./play.ts";
import { PLACE_ANIM_TIME } from "./render/tile.ts";
import { type FillDrawState, type FillRender, fillRender } from "./render.ts";
import { answerSearched, searches } from "./search.ts";

/** What a game born from its description's compiled module holds. */
export interface BornModule<C>
  extends FillHintModule<C>,
    CandidateFillModule<C>,
    DealtFillModule<C> {
  readonly play: FillPlay;
  readonly lineClues: readonly (keyof C)[];
  readonly lineLists?: readonly (keyof C)[];
  readonly slotClues?: readonly (keyof C)[];
  readonly labels?: { readonly start?: (i: number) => string };
  readonly deal: FillDeal;
  readonly clueMax: ClueMax<C>;
  readonly boards: readonly Board[];
  /** The preset menu beside its grid of `boards`. */
  readonly menu?: {
    readonly default?: Board;
    /** The tier the default board is dealt at, where it is not the first the
     * menu offers it at. */
    readonly defaultTier?: number;
    readonly tiers: readonly (Board & {
      readonly first: number;
      readonly last: number;
    })[];
    readonly variants: readonly (Board & {
      readonly variations: readonly string[];
      readonly diff: number;
    })[];
  };
  /** What the sizes alone cannot say of a board (`play.bounds`). */
  readonly bounds?: FillBounds;
  readonly hintMarks: Readonly<Partial<Record<MarkRole, string>>>;
}

type Size = { readonly w: number; readonly h: number };

/** A preset board: its size, and the settings it names (`PresetSettings`),
 * the tally by its size, its counts the size's default. */
type Board = Size & PresetSettings;

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
  // A board gives each setting as it names it, else at its default.
  const sized = (
    board: Board,
    diff = 0,
    variations: readonly string[] = [],
  ): FillParams =>
    startSettings(
      deal,
      {
        w: board.w,
        h: board.h,
        diff,
        ...(variations.length === 0 ? {} : { variations }),
      },
      board,
    );
  // The default board is dealt at the first tier the menu offers it at,
  // unless the description names another, so a menu that starts a board above
  // Easy never opens on a board it hides.
  const defaultTier =
    module.menu?.defaultTier ??
    module.menu?.tiers.find((b) => isBoard(sized(byDefault), b))?.first ??
    0;
  const defaultParams = (): FillParams => sized(byDefault, defaultTier);
  const params = fillParams(
    deal,
    module.tiers,
    defaultParams,
    module.bounds,
    // A preset's setting where the board is one, else the setting's default.
    (p, id) =>
      boards.find((b) => isBoard(p, b))?.settings?.[id] ??
      sized({ w: p.w, h: p.h }).settings?.[id] ??
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
          variants: variants.map(({ variations, diff, ...board }) =>
            sized(board, diff, variations),
          ),
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
  const notes = play.notes === true;
  // A board that keeps notes has these fields on its Ui (`typedUi`).
  const noted = <U>(pref: GamePref<U>): GamePref<FillUi> =>
    pref as unknown as GamePref<FillUi>;
  const prefs = [
    ...(play.wash?.pref === undefined ? [] : [flag(play.wash.pref, "washedMarks")]),
    ...(play.covers === undefined ? [] : [flag(play.covers.pref, "hiddenShown")]),
    ...(!notes
      ? []
      : [
          // The candidate walk refuses any regions but rows and columns.
          noted(
            autoPencilPref(
              "When you place a number, remove it from pencil marks in its row and column",
            ),
          ),
          noted(stickyPencilPref()),
          noted(pencilKeepHighlightPref()),
          noted(candidateReadingPref()),
        ]),
    ...(play.numbers?.raised !== true
      ? []
      : [
          {
            kw: "appearance",
            name: "Puzzle appearance",
            type: "choices",
            choices: ["2D", "3D"],
            get: (ui: FillUi) => (ui.raised === false ? 0 : 1),
            set: (ui: FillUi, v: number) => {
              ui.raised = v === 1;
            },
          } satisfies GamePref<FillUi>,
        ]),
  ];
  const numbered = module.numbers ?? [];
  const gapKinds = gapKindsOf<C>(play);
  const partKinds = partKindsOf(deal) as (keyof C & string)[];
  const cornerKinds = cornerKindsOf(deal) as (keyof C & string)[];
  const reading: AnswerReading<C> = {
    blank: play.blank ?? null,
    numbers: numbered as readonly (keyof C)[],
    glyphs:
      play.numbers === undefined
        ? Object.fromEntries(
            Object.entries({ ...play.given, ...play.values }).flatMap(
              ([v, { glyph }]) => (glyph === undefined ? [] : [[Number(v), glyph]]),
            ),
          )
        : // Every value a cell's domain mask can hold.
          Object.fromEntries(
            Array.from({ length: 31 }, (_, i) => [i + 1, ` ${numeral(i + 1)} `]),
          ),
    lineClues: module.lineClues,
    ...(module.lineLists === undefined ? {} : { lineLists: module.lineLists }),
    ...(module.slotClues === undefined ? {} : { slotClues: module.slotClues }),
    ...(module.answerSort === "cell"
      ? {}
      : { edges: { text: edgeTextOf(play), space: (b) => spaceOf(module, b) } }),
    walls: (b) => walledParts(module, b),
    ...(deal.partitions === undefined
      ? {}
      : {
          partition: (partKinds.length === 0
            ? deal.partitions[0]
            : partitionOfKind(deal, partKinds[0])) as keyof C,
        }),
    ...(partKinds.length === 0
      ? {}
      : { partClues: { kinds: partKinds, signs: play.signs ?? {} } }),
    ...(cornerKinds.length === 0
      ? {}
      : {
          cornerClues: {
            kinds: cornerKinds,
            signs: play.signs ?? {},
            range: (kind: keyof C & string, b: FillBoard<C>) =>
              cornerRange(deal, module.clueMax, kind, spaceOf(module, b), b.dealt),
          },
        }),
    ...(gapKinds.length === 0
      ? {}
      : {
          gap: (b: FillBoard<C>, a: number, z: number) => {
            const sp = spaceOf(module, b);
            const clue = gapClueAt(gapKinds, b, sp, sp.edgeOf(a, z));
            return clue?.painter.glyph(clue.clue) ?? " ";
          },
        }),
  };
  // The board's clues are the desc's, beside the params' sizes beyond the
  // grid's.
  const newState = (p: FillParams, desc: string): FillBoard<C> => {
    const size = boardSizeOf(module, p);
    const sp = paramSpaceOf(module, p);
    const sizes = sizesOf(p);
    const grown = module.growBy?.(sp, sizes) ?? null;
    const clues = descValue(
      decodeDesc<C>(deal, sp, module.clueMax, desc, grown, variationsOf(p)),
    );
    return newBoard<C>(
      module,
      size.w,
      size.h,
      { ...clues, ...givenOf(deal, p) },
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
      ...(module.slotClues === undefined ? {} : { slotClues: module.slotClues }),
      ...(module.labels === undefined ? {} : { labels: module.labels }),
    },
    (b, ui) => buttons?.previewed(b, ui) ?? b,
  );
  // A board of numbers is typed into; one of buttons is clicked and dragged.
  const typed =
    play.numbers === undefined
      ? null
      : numberInput<C, FillDrawState>(
          module,
          render.origin,
          render.gap,
          render.partClueBox,
          module.slotClues ?? [],
        );
  const buttons: FillInput<C, FillDrawState> | null =
    typed === null ? fillInput(module, play, render.origin, render.gap) : null;
  const inputs =
    buttons !== null
      ? { targetVerbs: buttons.targetVerbs, interpretMove: buttons.interpretMove }
      : {
          interpretMove: (typed as NumberInput<C, FillDrawState>).interpretMove,
          requestKeys: (p: FillParams, board?: FillBoard<C>) =>
            (typed as NumberInput<C, FillDrawState>).requestKeys(p, board),
        };
  const newUi = (b: FillBoard<C>): FillUi => {
    const ui = typed === null ? newFillUi() : typedUi(newFillUi(), play);
    // On the edges the cursor is on the half grid (`edge-target.ts`), and
    // starts in the first square's middle.
    if (module.answerSort === "edge") ui.cursor = newCursor(1, 1);
    // A hexagon's store has no cell at its top left; the cursor starts on
    // the first that is the board's.
    if (module.hexagon !== undefined)
      ui.cursor.x =
        Array.from({ length: b.w }, (_, x) => x).find((x) =>
          inHexagon(b.w, b.h, x, 0),
        ) ?? 0;
    return ui;
  };
  const { hint, rulesOut } = fillHint(module);
  // A board that keeps notes is hinted by the candidate walk.
  const walked = notes ? candidateFill(module, tierOfBoard(module), newUi) : null;
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
    newUi,

    ...inputs,
    ...(typed === null || typed.done === null ? {} : { doneClues: typed.done.verbs }),
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
      ...(walked ?? hint),
      marks: { roles: module.hintMarks },
      gesture: (b, ui, ds, move, step) => {
        if (typed !== null) return typed.gesture(b, ui, ds, move);
        // A board of buttons makes edits alone.
        if ("type" in move)
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
        // A board of buttons keeps no notes, so its steps are the fill walk's.
        step as HintStep<FillMove, FiringFillHint, string>,
        clicks,
      ),
      ...drags,
    ];
  }
}
