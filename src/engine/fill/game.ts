/**
 * A fill game built whole from its compiled description: every hook of the
 * game contract from the engine's fill board, so a game born from its
 * description writes no TypeScript (`openspec/changes/a-game-from-its-description-alone`,
 * design.md § 2). The compiler writes the module that calls this and
 * registers the game (`describe/sources.ts`, `bornFiles`).
 */

import { descValue } from "../contract/desc-error.ts";
import type { Game, HintStep, PresetBoards } from "../contract/game.ts";
import type { MarkRole } from "../contract/hint-words.ts";
import { HEXAGON, SQUARE_GRID } from "../contract/sections.ts";
import type { Point } from "../contract/types.ts";
import { transposeDimensions } from "../game-id/params.ts";
import { drag, type PointerAction } from "../input/hint-gesture.ts";
import { LEFT_BUTTON, newCursor, stripModifiers } from "../input/pointer.ts";
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
import { bandKey, pressBadge, pressBand } from "./band.ts";
import {
  boardSizeOf,
  type Clues,
  type FillBoard,
  newBoard,
  paramSpaceOf,
  perValuesOf,
  solveBoard,
  spaceOf,
  walledParts,
} from "./board.ts";
import { type FillInput, fillInput } from "./buttons.ts";
import { type CandidateFillModule, candidateFill } from "./candidates.ts";
import { cornerKindsOf, cornerRange } from "./corners.ts";
import { countedOf, countRecords } from "./counts.ts";
import type { DealtFillModule } from "./deal/context.ts";
import { dealFill } from "./deal.ts";
import { decodeDesc, glyphsIn } from "./desc.ts";
import { pointOfElement } from "./edge-target.ts";
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
import { boardGlyphs } from "./glyphs.ts";
import {
  type FillHint,
  type FillHintModule,
  type FiringFillHint,
  fillHint,
  linkedCell,
  tierOfBoard,
} from "./hint.ts";
import {
  applyMove,
  type FillMove,
  fillMoveOf,
  markAll,
  settleFullNotes,
} from "./notes.ts";
import { type NumberInput, numberInput, typedUi } from "./numbers.ts";
import {
  boardCellOf,
  followedCursor,
  interpretOnView,
  orderOf,
  toView,
  viewOf,
} from "./order.ts";
import type { FillBounds } from "./params/bounds.ts";
import { variationsOf } from "./params/flag.ts";
import type { PresetSettings } from "./params/setting.ts";
import { offKinds } from "./params/settings.ts";
import { partsAim } from "./parts-aim.ts";
import { geometryOfParts, partsRender } from "./parts-render.ts";
import { type FillPlay, type FillUi, newFillUi } from "./play.ts";
import { fillPrefs } from "./prefs.ts";
import { listedOf, listRecords } from "./record-list.ts";
import { recordPanel } from "./record-panel.ts";
import { PLACE_ANIM_TIME } from "./render/tile.ts";
import {
  type FillDrawState,
  type FillLabels,
  type FillLook,
  type FillRender,
  fillRender,
} from "./render.ts";
import { answerSearched, searches } from "./search.ts";
import { marginSidesOf } from "./value-margin.ts";

/** What a game born from its description's compiled module holds. */
export interface BornModule<C>
  extends FillHintModule<C>,
    CandidateFillModule<C>,
    DealtFillModule<C> {
  readonly play: FillPlay;
  readonly lineClues: readonly (keyof C)[];
  readonly lineLists?: readonly (keyof C)[];
  readonly slotClues?: readonly (keyof C)[];
  readonly valueMargins?: readonly (keyof C)[];
  /** The clue kinds whose number is one of the answer's values, drawn and
   * printed as its glyph (a clue's `glyph`). */
  readonly glyphClues?: readonly (keyof C)[];
  readonly labels?: FillLabels;
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
    /** The tiers between a board's first and last the menu leaves out. */
    readonly skips?: readonly (Board & { readonly tiers: readonly number[] })[];
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
  const skips = module.menu?.skips ?? [];
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
    ...(skips.length === 0
      ? {}
      : { skips: (p: FillParams) => skips.find((b) => isBoard(p, b))?.tiers ?? [] }),
    ...(variants.length === 0
      ? {}
      : {
          variants: variants.map(({ variations, diff, ...board }) =>
            sized(board, diff, variations),
          ),
        }),
  };
  const notes = play.notes === true;
  const ordered = play.order === true;
  const prefs = fillPrefs(module, play);
  const numbered = module.numbers ?? [];
  const gapKinds = gapKindsOf<C>(play);
  const partKinds = partKindsOf(deal) as (keyof C & string)[];
  const cornerKinds = cornerKindsOf(deal) as (keyof C & string)[];
  const valueGlyphs = Object.fromEntries(
    Object.entries({ ...play.given, ...play.values }).flatMap(([v, { glyph }]) =>
      glyph === undefined ? [] : [[Number(v), glyph]],
    ),
  );
  const counted = countedOf(play);
  const listed = listedOf(play);
  const reading: AnswerReading<C> = {
    blank: play.blank ?? null,
    numbers: numbered as readonly (keyof C)[],
    ...(play.numbers?.empty?.ball === undefined
      ? {}
      : { ball: play.numbers.empty.ball as keyof C }),
    glyphs:
      play.numbers === undefined
        ? () => valueGlyphs
        : // Every value a cell's domain mask can hold that has a glyph, and
          // each the deal alone places as its own.
          (b) => {
            const { draw, top } = boardGlyphs(module, spaceOf(module, b), b.dealt);
            return {
              ...Object.fromEntries(
                Array.from({ length: top }, (_, i) => [i + 1, ` ${draw(i + 1)} `]),
              ),
              ...valueGlyphs,
            };
          },
    ...(module.glyphClues === undefined ? {} : { glyphClues: module.glyphClues }),
    lineClues: module.lineClues,
    ...(module.lineLists === undefined ? {} : { lineLists: module.lineLists }),
    ...(module.slotClues === undefined ? {} : { slotClues: module.slotClues }),
    ...(counted === null ? {} : { counts: (b) => countRecords(b, counted) }),
    ...(listed === null ? {} : { list: (b) => listRecords(b, listed) }),
    off: (b) => offKinds(deal, b.dealt as Readonly<Record<string, number>>),
    ...(module.valueMargins === undefined
      ? {}
      : {
          valueMargins: {
            kinds: module.valueMargins,
            sides: (b: FillBoard<C>) => marginSidesOf(module, b),
          },
        }),
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
    const given = givenOf(deal, p) as C;
    const clues = descValue(
      decodeDesc<C>(
        deal,
        sp,
        module.clueMax,
        desc,
        grown,
        variationsOf(p),
        perValuesOf(module, sp, given),
        sizes,
        glyphsIn(module, sp, given),
        deal.parts === undefined ? null : { w: p.w, h: p.h },
      ),
    );
    const board = newBoard<C>(
      module,
      size.w,
      size.h,
      { ...clues, ...givenOf(deal, p) },
      variationsOf(p),
    );
    // Full notes leave out what the givens rule out from the start.
    return module.play?.fullNotes === true
      ? settleFullNotes(module, board, board)
      : board;
  };
  // The renderer previews the input's drag, and the input reads the board
  // where the renderer puts it: each is read only once both are built.
  const look: FillLook<C> = {
    play,
    lineClues: module.lineClues,
    ...(module.lineLists === undefined ? {} : { lineLists: module.lineLists }),
    ...(module.slotClues === undefined ? {} : { slotClues: module.slotClues }),
    ...(module.valueMargins === undefined ? {} : { valueMargins: module.valueMargins }),
    ...(module.glyphClues === undefined ? {} : { glyphClues: module.glyphClues }),
    ...(module.labels === undefined ? {} : { labels: module.labels }),
  };
  // A board whose cells are parts is drawn and aimed at over its squares.
  const partsOf = deal.parts === undefined ? null : geometryOfParts(module, deal.parts);
  const render: FillRender<C> =
    partsOf === null
      ? fillRender(module, look, (b, ui) => (buttons ?? typed)?.previewed(b, ui) ?? b)
      : partsRender(module, look, partsOf);
  // A board of numbers is typed into; one of buttons is clicked and dragged.
  const typed =
    play.numbers === undefined
      ? null
      : numberInput<C, FillDrawState>(module, render.origin, render.gap, {
          clues: {
            partClue: render.partClueBox,
            slotKinds: module.slotClues ?? [],
            marginKinds: module.valueMargins ?? [],
          },
          recordPoint: render.recordPoint,
          ...(play.numbers.features === undefined
            ? {}
            : {
                features: {
                  slotsOf: render.featureSlots,
                  lettersOf: render.featureLetters,
                  bandGrid: render.bandGrid,
                  bandPoint: render.bandPoint,
                  badgePoint: render.badgePoint,
                },
              }),
          ...(partsOf === null ? {} : { parts: partsAim(partsOf, render.origin) }),
          keySwatch: render.keySwatch,
        });
  const buttons: FillInput<C, FillDrawState> | null =
    typed === null ? fillInput(module, play, render.origin, render.gap) : null;
  const inputs =
    buttons !== null
      ? { targetVerbs: buttons.targetVerbs, interpretMove: buttons.interpretMove }
      : {
          ...(typed === null || typed.targetVerbs === null
            ? {}
            : { targetVerbs: typed.targetVerbs }),
          interpretMove: (
            b: FillBoard<C>,
            ui: FillUi,
            ds: FillDrawState,
            p: Point,
            button: number,
          ) =>
            interpretOnView(b, ui, (v) =>
              (typed as NumberInput<C, FillDrawState>).interpretMove(
                v,
                ui,
                ds,
                p,
                button,
              ),
            ),
          // A board of features types nothing: its notes are its slots'.
          ...(play.numbers?.features === undefined
            ? {
                requestKeys: (p: FillParams, board?: FillBoard<C>) =>
                  (typed as NumberInput<C, FillDrawState>).requestKeys(p, board),
              }
            : { notesWithoutMode: true as const }),
        };
  /** The key that places value `v` on board `b`: a button board's own key
   * for it, a typed board's glyph's. */
  const keyOf = (b: FillBoard<C>, v: number): number => {
    const key = play.values?.[v]?.key;
    if (key !== undefined)
      return (typeof key === "string" ? key : key[0]).charCodeAt(0);
    return boardGlyphs(module, spaceOf(module, b), b.dealt).keyCode(v);
  };
  const along = typed?.along ?? null;
  const takeRecord = along === null ? null : along.take;
  /** The input, a left press on a record of the row of counts typing its
   * value's key (`counts.ts`), one on a record of the list taking it where
   * typing goes along the list's sites (`along.ts`), one on a value of the
   * band striking it from the square in focus or spotlighting its squares,
   * and one on a badge putting its square in focus (`band.ts`), whose keys
   * the band takes while the keyboard is in it; a right one is the right
   * button's anywhere, which under the sticky preference switches notes on
   * and off. */
  const interpretMove =
    counted === null && takeRecord === null && play.band !== true
      ? inputs.interpretMove
      : (b: FillBoard<C>, ui: FillUi, ds: FillDrawState, p: Point, button: number) => {
          const grid = render.bandGrid(b);
          const keyed =
            grid === null ? "pass" : bandKey(b, ui, stripModifiers(button), grid);
          if (keyed !== "pass") return keyed;
          const left = stripModifiers(button) === LEFT_BUTTON;
          const spot = left ? render.bandPressed(b, ds, p) : null;
          if (spot !== null) return pressBand(b, ui, spot);
          const badge = left ? render.badgePressed(b, ds, p) : null;
          if (badge !== null) return pressBadge(ui, badge);
          const k = left && takeRecord !== null ? render.recordPressed(b, ds, p) : null;
          if (k !== null && takeRecord !== null) return takeRecord(b, ui, k);
          const v = left ? render.countPressed(b, ds, p) : null;
          return inputs.interpretMove(b, ui, ds, p, v === null ? button : keyOf(b, v));
        };
  const newUi = (b: FillBoard<C>): FillUi => {
    const ui = typed === null ? newFillUi() : typedUi(newFillUi(), play);
    if (play.highlights !== undefined) ui.highlights = play.highlights.map((h) => h.on);
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
    interpretMove,
    ...(typed === null || typed.done === null ? {} : { doneClues: typed.done.verbs }),
    executeMove: (b, m) => applyMove(module, b, fillMoveOf(m, `${id}: executeMove`)),
    // Full notes are never unnoted and strike a placed value as it is
    // placed, so Mark-all would find nothing to do.
    ...(!notes || module.play?.fullNotes === true
      ? {}
      : { markAll: (b: FillBoard<C>) => markAll(module, b) }),
    ...(!notes && !ordered
      ? {}
      : {
          changedState: (ui: FillUi, old: FillBoard<C> | null, b: FillBoard<C>) => {
            const { cursor } = ui;
            // The cursor stays on its row and column wherever the order
            // moved them, and a selection and a header drag end.
            const before = old?.order ?? null;
            if (
              before !== null &&
              b.order !== null &&
              before.some((l, i) => l !== b.order?.[i])
            ) {
              const { x, y } = followedCursor(before, b.order, cursor);
              cursor.x = x;
              cursor.y = y;
              if (ui.selected !== undefined) ui.selected = [];
              ui.reorder = null;
            }
            // A cell selected for notes takes none once a value is on it,
            // unless the keyboard holds the highlight there.
            const at = cursor.y * b.w + cursor.x;
            if (
              cursor.visible &&
              ui.pencilMode === true &&
              ui.cursorFromKeyboard !== true &&
              b.values[b.order === null ? at : boardCellOf(b.order, b.w, at)] !== 0
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
    clearMistakes: (b, mistakes) => clearMistakes(module, b, mistakes),
    revealOne,
    textFormat: (b) => textFormat(reading, b),
    ...(prefs.length === 0 ? {} : { prefs }),
    ...(along === null || play.along?.panel === undefined || play.list === undefined
      ? {}
      : { reference: recordPanel(module, play.list, along, play.along.panel) }),
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
        if (typed !== null) {
          // On a board in an order, the step is shown where its view draws it.
          const lines = orderOf(b, ui);
          return lines === null
            ? typed.gesture(b, ui, ds, move)
            : typed.gesture(viewOf(b, lines), ui, ds, toView(b, lines, move));
        }
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
    // An edge is clicked at its half-grid point, the target its input aims.
    const targetOf = (e: number): Point =>
      module.answerSort === "edge"
        ? pointOfElement(spaceOf(module, b), e)
        : { x: e % b.w, y: Math.floor(e / b.w) };
    const clicks: Point[] = [];
    for (const ruling of [true, false])
      for (let i = 0; i < set.length; i += 2)
        if (!linked.has(set[i]) && (set[i + 1] === play.secondary) === ruling)
          clicks.push(targetOf(set[i]));
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
