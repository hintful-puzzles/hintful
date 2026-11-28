/**
 * The `Game` interface every game implements: the sole contract between a game
 * and the engine, since a game never depends on the `Midend`.
 *
 * An idiomatic TypeScript rendering of upstream's `struct game`
 * (puzzles/puzzles.h): generic over a game's params / state / move / UI /
 * draw-state types, with **immutable** state transitions (`executeMove`
 * returns a new state, never mutates), GC instead of `dup_*`/`free_*`, and
 * union/boolean types instead of integer sentinels.
 *
 * A member every game has is required. An absent optional member means "this
 * game does not have that capability" (no preferences, no `prefs`), and the
 * midend runs without it. For the members `sections.ts` names, it also means
 * the game is a draft, unless the game gives the puzzle's reason in
 * `notApplicable`; the hint, which every game has, is a draft's when it is
 * {@link DRAFT_HINT}.
 */

import type { Modifier } from "../game-id/modifier.ts";
import type { OnlyOf } from "../game-id/only.ts";
import type { Ruleset } from "../game-id/ruleset.ts";
import type { PointerAction } from "../input/hint-gesture.ts";
import type { TargetVerbs } from "../input/target-verb.ts";
import type { RandomState } from "../random/index.ts";
import type { RingClear } from "../render/ring.ts";
import type { Flash } from "../render/win-wave.ts";
import type { DifficultyContract } from "./difficulty.ts";
import type { HintRefusal, MarkedDeadEnd } from "./hint-refusal.ts";
import type { MarkRole, Sentence } from "./hint-words.ts";
import type { RulesOf } from "./rules.ts";
import type { NotApplicableReasons } from "./sections.ts";
import type { SolveFailure } from "./solve-failure.ts";
import type {
  Color,
  DrawTextOptions,
  GameStatus,
  KeyLabel,
  KeyStatus,
  PaletteScheme,
  Point,
  Rect,
  ReferenceModel,
  Size,
} from "./types.ts";

/** Returned by `interpretMove` when input changed UI/cursor state in
 * place but produced no history move (upstream's `MOVE_UI_UPDATE`).
 * The midend redraws and notifies but pushes no history entry. A
 * unique symbol so it can never be confused with a game's `Move`. */
export const UI_UPDATE: unique symbol = Symbol("ui-update");
export type UiUpdate = typeof UI_UPDATE;

/** Result of a solver attempt — discriminated so a string `Move`
 * cannot be mistaken for an error message. The error is one of the
 * collection's own ({@link SolveFailure}), never a game's sentence. */
export type SolveResult<Move> =
  | { ok: true; move: Move }
  | { ok: false; error: SolveFailure };

/** One step of a hint plan: a move plus a human-readable explanation
 * and optional visual highlights, narrated for the state the step
 * applies to (i.e. the state after every earlier step of the plan).
 * The current step is what the renderer displays and the status bar
 * narrates. */
/** A game's reference aid ({@link Game.reference}). One object, so a game
 * cannot have a model without a name or a selection. */
export interface ReferenceAid<State, Ui, Move = never> {
  /** What the aid is in this game ("Dominoes", "Dictionary"): the toggle's
   * label and the panel's title. Static, since the toggle shows it before the
   * model is fetched, and a fetched model counts as help. */
  readonly title: string;
  /** The checklist, derived from the board as the player has it, never from
   * the solution. Pure. `ui` lets it echo the spotlighted item (`selected`). */
  model(state: State, ui: Ui): ReferenceModel;
  /** The part of `ui` that `model` reads, as a string: the panel fetches the
   * model again when it changes, as it does after a move, so a spotlight a
   * board press clears, or Crossing's selected square, shows at once. */
  watches(ui: Ui): string;
  /** The player picked an item, or cleared the pick for null: answered as
   * `interpretMove` answers an input. Spotlighting an item mutates `ui` and
   * returns `UI_UPDATE`; `null` is "nothing changed". A move is played as the
   * player's own, so an item the board already has a place for (Crossing's
   * number, with a square selected) goes in as a click on the list would. */
  select(state: State, ui: Ui, key: string | null): Move | UiUpdate | null;
}

/** What a check says of a move ({@link GameHint.judgeMove}): whether a deduction
 * reached it, and the words that name it. It marks nothing on the board. */
export interface MoveVerdict {
  readonly followed: boolean;
  readonly words: Sentence;
}

export interface HintStep<Move, Highlights = unknown, Rung extends string = string> {
  move: Move;
  /** Which of the game's deductions this step is: one of {@link GameHint.rungs}.
   * Whatever needs to know reads this and never the sentence, so rewording a
   * step moves nothing that is not about its wording
   * (docs/hints.md § "Name the rung a step speaks"). */
  rung: Rung;
  /** The sentence, as the status bar shows it: `words.text` when the step has
   * words. The only part of a step that crosses the worker boundary. */
  explanation: string;
  /** The sentence with its references to the marks the step draws
   * (`hint-words.ts`), with the roles of {@link GameHint.marks}. Every step
   * has them, its game's renderer paints its marks from them (`stepMarks`), and
   * `testing/hint-binding.ts` holds the rendered frame to them. A
   * {@link Sentence}, so they were built from their parts or declared an
   * exception. */
  words?: Sentence;
  highlights?: Highlights;
  /** The keys of the reference items the step reasons from (Wordtrail's
   * words), which an open reference panel marks while the step is shown
   * (`ReferenceModel.hinted`). */
  reference?: readonly string[];
  /** True when this step is the continuation of the journey the
   * previous step previewed (e.g. the "then to column 5" leg of
   * "Working on tile 10: move it to row 2, then column 5"). The midend counts
   * a displayed step's place in its journey from it ("Step 2 of 3"). It does
   * not decide when a step is shown: every step waits to be asked for. */
  continuesPrevious?: boolean;
}

/** Result of a hint attempt — the whole computed plan as a non-empty
 * ordered sequence of steps, or an error. No move is auto-applied;
 * the midend stores the plan as the active hint, displays one step
 * at a time, and advances as steps complete. Returning the full plan
 * (rather than one move per request) avoids replan drift between
 * steps and pays any expensive search once.
 *
 * The midend asks only about an unfinished board on which `findMistakes`
 * finds nothing, and refuses the rest itself; a game's error is the
 * collection's own ({@link HintRefusal}), and a dead end of the game's own may
 * carry the words that mark its cause ({@link MarkedDeadEnd}). */
export type HintResult<Move, Highlights = unknown, Rung extends string = string> =
  | { ok: true; steps: HintStep<Move, Highlights, Rung>[] }
  | { ok: false; error: HintRefusal; words?: never }
  | MarkedDeadEnd;

/** The hint plan currently being followed. Stored in the midend (not
 * in game state, never persisted); `steps[index]` is the step being
 * displayed. Advanced by `GameHint.keepTrack` verdicts and executed-hint
 * animation settles; cleared on undo/redo/restart/new game/solve,
 * when the last step completes, and when the board is solved. */
export interface ActiveHint<Move, Highlights = unknown> {
  steps: HintStep<Move, Highlights>[];
  index: number;
}

/** How a player move relates to the current hint step:
 * - `"completed"` — the move finishes the step; the midend advances
 *   the plan. By returning this the game asserts the resulting state
 *   matches what the plan expected after this step, so the remaining
 *   steps stay valid.
 * - `"onTrack"` — progress toward the step without finishing it; the
 *   midend keeps the step, and keeps it displayed where it was.
 * - `"off"` — the move deviates from the plan; the midend drops it
 *   (the next hint request recomputes). */
export type HintTrackVerdict = "completed" | "onTrack" | "off";

/** A step built from its words: the explanation is theirs. */
export function narratedStep<Move, Highlights, Rung extends string = string>(
  step: Omit<HintStep<Move, Highlights, Rung>, "explanation" | "words"> & {
    words: Sentence;
  },
): HintStep<Move, Highlights, Rung> {
  return { ...step, explanation: step.words.text };
}

/**
 * The marks a game's hint draws, as a section of its contract
 * (`hint-words.ts` has the roles). A game that declares it is **bound**: every
 * step carries `words`, and its renderer paints the step's marks from them
 * (`stepMarks`), so each mark on the board is one the words name.
 */
export interface HintMarkLegend {
  /** What each role marks in this game, in the words the help's list of marks
   * gives it: "the edges the step decides". Every role a step names is here. */
  readonly roles: Partial<Record<MarkRole, string>>;
}

/** One user preference a game exposes — the idiomatic-TS form of an
 * upstream `get_prefs`/`set_prefs` config item. The value lives on the
 * game's `Ui` (upstream stores prefs on `game_ui`, and a game's
 * `interpretMove`/`redraw` read them straight off the ui), so each item
 * carries `get`/`set` accessors over `Ui` rather than the engine owning
 * a separate value store. Discriminated by `type`:
 * - `"boolean"` ↔ a boolean value (a checkbox in the app form);
 * - `"choices"` ↔ the selected zero-based index into `choices` (a
 *   select/radio group in the app form).
 * `kw` is the stable keyword the app persists per puzzle. */
export type GamePref<Ui> =
  | {
      kw: string;
      name: string;
      type: "boolean";
      get(ui: Ui): boolean;
      set(ui: Ui, value: boolean): void;
    }
  | {
      kw: string;
      name: string;
      type: "choices";
      choices: string[];
      get(ui: Ui): number;
      set(ui: Ui, value: number): void;
    };

/**
 * What a placement rules out at a glance: the squares a star touches, the
 * rest of a row a tent completes. With the engine's `auto-cross` preference
 * on, every move the player makes is followed by the marks it brings, as an
 * entry of Undo joined to the move; the hint judges the move alone, and a
 * plan ends at its first step that brings marks (docs/hints-marks.md § "A
 * move with side effects ends the plan").
 */
export interface RulesOut<State, Move> {
  /** The preference's words, in the game's own nouns: "Cross out the squares
   * a star rules out". */
  name: string;
  /** The marks the placements of a move rule out, as a move made on `after`,
   * or `null` where it rules out nothing. It reads what the move did to the
   * board rather than the move, so every gesture that places the same thing
   * brings the same marks, and one that takes a placement away brings none.
   * It changes no square the player has marked. */
  bring(before: State, after: State): Move | null;
}

/** One configurable field of a game's **custom params** — the params
 * analog of `GamePref`, describing the "Custom type…" dialog. The
 * engine builds the app's `ConfigDescription` from this list and parses
 * a submitted `ConfigValues` back through it; validity is decided by
 * `paramsError`, so the custom dialog rejects exactly the params the game-ID
 * path would. `get`/`set` read/write one field of a
 * `Params` object — the midend always applies `set` to a *copy* of the
 * live params, so a mid-edit or rejected submission never mutates the
 * running game. Discriminated by `type`:
 * - `"string"` ↔ a text field (upstream's `C_STRING`; a numeric field
 *   like width/height parses the string to an integer in `set` and
 *   renders it back in `get`);
 * - `"boolean"` ↔ a checkbox;
 * - `"choices"` ↔ the selected zero-based index into `choices` (a
 *   select/radio group).
 * `kw` is the stable config key the app form uses; `name` the label.
 *
 * The same item is also what the help's Parameters section is generated from
 * (`doc`, `bounds`), what the engine checks before the game's own
 * `validateParams` (`bounds`, and a choice inside its list), and what a params
 * label is composed from (`label`, `engine/game-id/param-label.ts`). */
export type ParamConfigItem<Params> =
  | (ParamItemCommon<Params> & {
      type: "string";
      /** The range a numeric field must fall in. The engine refuses a value
       * outside it with a message naming the field, and the help states it. A
       * bound that depends on another field stays in `validateParams`. */
      bounds?: ParamBounds;
      /** The most this field times another may be, where the two are the
       * board's sides: `dimensionParamConfig` sets it on the width. The engine
       * refuses a larger product, and the help states it. */
      area?: AreaBound;
      get(p: Params): string;
      set(p: Params, value: string): void;
    })
  | (ParamItemCommon<Params> & {
      type: "boolean";
      /** A checkbox has no words of its own to show, so a label says them. */
      label?: ParamLabel<Params> & { words(p: Params): string | null };
      get(p: Params): boolean;
      set(p: Params, value: boolean): void;
    })
  | (ParamItemCommon<Params> & {
      type: "choices";
      choices: string[];
      /** Set by `rulesetItem` alone (`engine/game-id/ruleset.ts`): the puzzles these
       * choices are, in order. */
      rulesets?: readonly Ruleset[];
      /** How many indices past `choices` an old game ID or save may still
       * carry: accepted when loading a board, refused when generating one, and
       * never offered. Bricks' retired Tricky tier (`dt`) is the case. */
      retired?: number;
      get(p: Params): number;
      set(p: Params, value: number): void;
    });

interface ParamItemCommon<Params> {
  kw: string;
  name: string;
  /** What the field means, as the help's Parameters section says it (HTML
   * inside a `<dd>`). `{ with: kw }` documents it together with the item
   * before it, which must be `kw`: Width and Height are one entry. */
  doc: string | { with: string };
  /** Where this field's words go when a params set is labeled, if anywhere. */
  label?: ParamLabel<Params>;
  /** Set by `modifierItem` alone (`engine/game-id/modifier.ts`): the rule this field
   * changes, and the words for a board it applies to. */
  modifier?: Modifier;
  /** What the field leaves of the others, by its value: a choice's index, or
   * 0 and 1 for a checkbox off and on (`only.ts`). `rulesetItem` builds it
   * from each ruleset's `only`. */
  only?: Readonly<Record<number, OnlyOf>>;
}

/** Inclusive limits on a numeric field. */
export interface ParamBounds {
  min?: number;
  max?: number;
  /** The max is a limit of the game a player meets, such as the colors it
   * has, rather than a cap no sensible board reaches: the Custom dialog's
   * label says it, "Colors (up to 10)", from `max` itself. */
  maxShown?: boolean;
}

/** The most a numeric field times the field `times` may be. */
export interface AreaBound {
  /** The `kw` of the other side, a numeric field of the same game. */
  times: string;
  max: number;
}

/** The Custom dialog's label for `item`: its name, and its max where the
 * field says to show it. A refusal names the field by `name` alone. */
export function fieldLabel(item: { name: string; bounds?: ParamBounds }): string {
  const b = item.bounds;
  return b?.maxShown && b.max !== undefined
    ? `${item.name} (up to ${b.max})`
    : item.name;
}

/**
 * Where a field's words go in a params label, which reads
 * `[ruleset: ]size[ kind…][ tier][, tail…]` — "Seismic: 7x7 Easy",
 * "10x10 Normal, strip clues". The slot is the engine's convention; the words
 * are the game's. The ruleset in front is not a slot a field can ask for: it
 * is the game's `rulesetItem`, by name.
 */
export interface ParamLabel<Params> {
  slot: "size" | "kind" | "tier" | "tail";
  /** The words, or `null` to leave the field out: a default the player need
   * not be told. Absent, a choices field says its choice's name and a text
   * field its value. */
  words?(p: Params): string | null;
}

/**
 * The boards a game's preset menu offers. The engine builds the menu from
 * them (`presetGrid`): each board at every tier of the game's difficulty item,
 * in the order listed, then the variants.
 */
export interface PresetBoards<Params> {
  /** The sizes, smallest first. The grid sets each one's tier. */
  readonly boards: readonly Params[];
  /**
   * The first and last tier a board is offered at, for a board the game does
   * not offer at every tier. The reason belongs at the function: a deal that
   * takes seconds, a tier with nothing to deduce at that size.
   */
  tiers?(board: Params): readonly [first: number, last: number] | null;
  /**
   * The tiers between a board's first and last that it is not offered at: a
   * tier its ruleset seldom needs, which the menu leaves out to make room. The
   * menu guard's ledger gives the reason for each.
   */
  skips?(board: Params): readonly number[];
  /** The boards after the grid, as they stand: one for each modifier or kind. */
  readonly variants?: readonly Params[];
  /** Boards in a section of their own after the rest, headed "More...", for a
   * game with more kinds of board than one section reads well with. */
  readonly more?: readonly Params[];
  /** A line's name, for a board upstream named (Guess's "Super"), or `null`
   * for its params' label. */
  title?(params: Params): string | null;
}

/** A node in the preset/difficulty menu tree. */
export interface PresetMenu<Params> {
  /** A submenu's title, or a leaf's name. A leaf without one is labeled from
   * its params (`presetMenu`); a name is only for a preset upstream named,
   * such as Guess's "Standard". */
  title?: string;
  /** Leaf preset, or a submenu. Exactly one is set. */
  params?: Params;
  submenu?: PresetMenu<Params>[];
}

/** What a ring may reach and hold (`GameDrawing.drawRing`). */
export interface RingOptions {
  readonly room?: Rect;
  readonly inside?: (ink: number) => void;
  /** Keep the ring on the box's center: it may grow or draw in, never shift
   * aside (`ringShape`). */
  readonly centered?: boolean;
}

/**
 * The full puzzle drawing API a game's `redraw` may use. This is the
 * long-stable upstream `drawing_api`, rendered in TS; the concrete
 * canvas `Drawing` (src/puzzle/drawing.ts) satisfies it structurally
 * with no change to `Drawing`. The engine does NOT impose a
 * full-vs-incremental redraw policy — per-element diffing and
 * first-draw-only setup are the game's own concern, exactly as
 * upstream. `Blitter` is opaque to games (saved/restored as-is).
 */
export interface GameDrawing<Blitter = unknown> {
  startDraw(): void;
  endDraw(): void;
  drawUpdate(rect: Rect): void;
  clip(rect: Rect): void;
  unclip(): void;
  drawRect(rect: Rect, color: number): void;
  drawLine(p1: Point, p2: Point, color: number, thickness: number): void;
  drawPolygon(coords: Point[], fillColor: number, outlineColor: number): void;
  /** {@link drawPolygon} filled in the ring ink (`HINT_RING`), for a hint mark
   * that is a shape of its own, such as a control to press, and wants no ring
   * round it. */
  drawRingInkPolygon(coords: Point[], outlineColor: number): void;
  drawCircle(
    center: Point,
    radius: number,
    fillColor: number,
    outlineColor: number,
  ): void;
  drawText(origin: Point, options: DrawTextOptions, color: number, text: string): void;
  /** A hint's stripes: translucent diagonal bands of the stripes ink
   * (`HINT_STRIPES`, the last entry of every palette, `resolvePalette`) over
   * `rect`, `period` apart and aligned to the canvas so neighboring rects
   * join (`engine/render/hatch.ts`). */
  drawHatch(rect: Rect, period: number): void;
  /** A hint's ring round the element at `box`: the shape `engine/render/ring.ts`'s
   * `ringShape` fits clear of every rect in `clear`, stroked `thickness` wide
   * in the ring ink (`HINT_RING`, the second-last entry of every palette,
   * `resolvePalette`). It is the only way to draw in that ink: `inside`, if
   * given, is called with the ink's index and clipped to the ring's interior,
   * for a game to show its move's shape within the ring. `room` (default:
   * `box`) is where the stroke may lie, the pixels the game repaints when the
   * ring moves. Throws where no round ring fits. */
  drawRing(box: Rect, clear: RingClear, thickness: number, options?: RingOptions): void;
  blitterNew(size: Size): Blitter;
  blitterFree(blitter: Blitter): void;
  blitterSave(blitter: Blitter, origin: Point): void;
  blitterLoad(blitter: Blitter, origin: Point): void;
}

/**
 * A game's explained hint: its plan and everything the midend and the guards
 * ask of it. A hint builder (`describedEdgeHint`, `describedFiringHint`)
 * returns the parts it makes, and the game hands them
 * over with the rest.
 */
export interface GameHint<
  State,
  Move,
  Ui = unknown,
  DrawState = unknown,
  Highlights = unknown,
  Rung extends string = string,
> {
  /** Compute a hint plan for the current state: a non-empty ordered
   * sequence of narrated moves, or an error. Nothing is auto-applied
   * — the midend stores the plan and displays one step at a time;
   * the player follows it (or `executeHint` plays it) step by step.
   *
   * `aux` is the generator's solution hint (upstream `aux_info`), the
   * same value passed to `solve` — present for freshly-generated games,
   * absent for descriptive game ids or some loaded saves. A game whose
   * best hint derives from the known solution uses it when
   * present and falls back otherwise; deductive games ignore it.
   *
   * `ui` is the live game UI, passed so a hint can honor a player
   * preference that changes how moves behave or how the hint should be
   * expressed (Towers' auto-pencil mode decides whether the hint teaches
   * the trivial row/column note eliminations or folds them into the
   * placement). Ignored by most games.
   *
   * Never asked about a board whose status is solved, or on which
   * `findMistakes` finds anything: the midend refuses those itself. */
  plan(state: State, aux?: string, ui?: Ui): HintResult<Move, Highlights, Rung>;
  /** Every rung a hint step of this game can be, each once: the ids its steps
   * carry in {@link HintStep.rung}. The pin harness requires a pinned position
   * for each (`testing/hint-positions.ts`), and the hint-quality walk fails a
   * step whose rung is not listed. */
  readonly rungs: readonly Rung[];
  /** The marks this game's hint draws, and what each means here. It binds
   * every step's words to its marks ({@link HintMarkLegend}). */
  readonly marks: HintMarkLegend;
  /** Classify a player move against the current hint step. The game
   * MAY adjust `step.move` in place on `"onTrack"` (e.g. shrink a
   * slide's remaining distance after partial manual progress) so a
   * later `executeHint` doesn't overshoot. `"completed"` obliges the
   * game to ensure the resulting state matches the plan's
   * expectation after this step — return `"off"` when in doubt. */
  keepTrack(m: Move, step: HintStep<Move, Highlights>, state: State): HintTrackVerdict;
  /** How the pointer makes `move`, the move of the hint step on display, from
   * `state` with `ui` as it is and the board drawn at `ds`: the taps, drags and
   * on-screen keys a player would use (`hint-gesture.ts`). The midend plays a
   * hint step by sending this through {@link Game.interpretMove}, never by
   * applying `move`, and the moves it makes must complete the step by
   * {@link keepTrack}; so a hint cannot ask for a move the pointer does not
   * make. `step` is the whole step, for a gesture found by asking `keepTrack`
   * (`verbClicks`).
   *
   * A hint has this or {@link targets}, never both (`registerGame`). */
  gesture?(
    state: State,
    ui: Ui,
    ds: DrawState,
    move: Move,
    step: HintStep<Move, Highlights>,
  ): readonly PointerAction[];
  /** For a game that plays by {@link Game.targetVerbs}: the targets the step's
   * move is made at, in order. The engine makes the gesture from them, a click
   * on each with the button whose verb `keepTrack` keeps (`hintGesture`,
   * `verbClicks`), so the game says only where. Of the verbs' target type. */
  targets?(
    state: State,
    move: Move,
    step: HintStep<Move, Highlights>,
  ): readonly unknown[];
  /** Re-validate a *stored* hint step against the current state right
   * before the midend (re-)displays it, so a kept plan can never show a
   * step whose action has already been resolved out from under it. A
   * move that the plan is following can have side effects the plan
   * didn't author — most concretely Towers' auto-pencil, which silently
   * strikes a placed height from its row/column, removing candidates a
   * *later* stored `pencilStrike` step still names. Return:
   * - the step **with no-longer-actionable parts dropped** (e.g. a
   *   `pencilStrike` filtered to candidates still present), rebuilding
   *   `highlights` to match — return the SAME object reference when
   *   nothing changed, so the midend can cheaply detect "still live";
   * - `null` when the step is now **fully** resolved (every part is a
   *   no-op against the current state) — the midend advances past it,
   *   recomputing the plan if the whole plan drains.
   * Pure (no state mutation). Absent ⇒ the game's stored steps are
   * shown as-is; implement it for any game whose moves can be partially
   * resolved by another move's side effects (the candidate-elimination
   * games). */
  refreshStep?(
    step: HintStep<Move, Highlights>,
    state: State,
  ): HintStep<Move, Highlights> | null;
  /** What Check & save says of the player's last move, `before` the position
   * it was made from and `after` the one it made (`move-judge.ts`): whether
   * the game's deductions reach it from `before`, naming the techniques that
   * do, or `null` where it made nothing a deduction makes. A builder that
   * walks a compiled ladder supplies it; a game writes none. `ui` carries the
   * preferences the hint is walked under (a candidate plan's). */
  judgeMove?(before: State, after: State, ui?: Ui): MoveVerdict | null;
  /** Does this `UI_UPDATE` dismiss the hint, as a real move that goes off-plan
   * does? Absent ⇒ never: a UI/cursor change leaves the hint on screen, which
   * is right for a game whose hint suppresses nothing.
   *
   * A game needs this when its in-place UI changes are an *alternative display*
   * the hint would fight with, because the hint then **suppresses** something
   * and the suppression is invisible until the player touches it — at which
   * point nothing happens at all, and there is no way out of hint mode. Subsets'
   * reference aid draws in the hint's overlay space; Crossing's hint takes over
   * the board's coloring from the selected-run wash.
   *
   * `() => true` dismisses on every UI change — the simplest rule, and enough
   * when the game has no "follow this by hand" flow to protect. Answering per
   * step dismisses *selectively*: `ui` is the **post-`interpretMove`** ui, so
   * the new cursor position is already in it. Crossing keeps its hint up while
   * the player works inside the squares it is about, so a hinted number can be
   * typed in by hand without the explanation vanishing.
   *
   * A game that answers `false` anywhere its hint paints **must** make sure its
   * cursor cue still reads against the hint colors — the hint owns the
   * background there, so a background-only selection cue becomes invisible
   * exactly when the player needs it (see `crossing/render.ts`).
   *
   * Called only while a plan is stored, with that plan's current step. Pure. */
  uiUpdateClears?(step: HintStep<Move, Highlights>, state: State, ui: Ui): boolean;
}

/**
 * The hint of a game whose hint is not written yet, which makes the game a
 * draft (`sections.ts`): the midend offers no hint for it, so nothing asks its
 * plan, and a guard that does is told so. A game being ported registers with
 * it until its hint is written.
 */
export const DRAFT_HINT: GameHint<never, never, never, never, never, never> = {
  plan() {
    throw new Error("a draft's hint is not written: nothing asks it");
  },
  rungs: [],
  marks: { roles: {} },
  keepTrack: () => "off",
  gesture: () => [],
};

/** Whether `game`'s hint is written: it is not {@link DRAFT_HINT}. */
export function hasHint(game: { readonly hint: object }): boolean {
  return game.hint !== DRAFT_HINT;
}

/**
 * What one `redraw` paints: the midend builds it once a frame, and a game
 * destructures the fields it reads, so a new input is a field here and no
 * game's signature moves.
 *
 * The animation's fields stay flat rather than one nullable object: `animTime`
 * runs on through a flash after `prev` has been dropped, and `dir` outlives
 * both, so they are not present or absent together.
 */
export interface Frame<
  State,
  Ui,
  Move = unknown,
  Highlights = unknown,
  Mistake = unknown,
> {
  readonly state: State;
  /** The state animated from, while a move animates; else null. */
  readonly prev: State | null;
  /** +1 for a move forward, -1 for an undo. */
  readonly dir: number;
  readonly ui: Ui;
  /** Seconds into the move's animation, at the game's own scale, eased. */
  readonly animTime: number;
  readonly flash: Flash;
  readonly hint?: HintStep<Move, Highlights>;
  readonly mistakes?: readonly Mistake[];
  /** A displayed refusal whose words mark its cause, painted as a step's are
   * (`stepMarks`); only a game whose hint makes one reads it, and it never
   * comes with a `hint`. */
  readonly deadEnd?: MarkedDeadEnd;
}

/**
 * Every hook is declared with method syntax, never as a function-typed
 * property. The registry holds a game with its type parameters erased, and a
 * property's parameters are checked contravariantly, which the erased type
 * fails; a method's are checked bivariantly.
 */
export interface Game<
  Params,
  State,
  Move,
  Ui = unknown,
  DrawState = unknown,
  Mistake = unknown,
  /** What a hint step shows on the board besides its move. Carried through
   * every hint member and `redraw`, so a game's renderer and its legend see
   * the type its `hint` builds. */
  Highlights = unknown,
  /** The ids of the deductions a hint step can be ({@link GameHint.rungs}). */
  Rung extends string = string,
> {
  /** Catalog puzzleId; the registry key. */
  readonly id: string;
  /**
   * The move the Mark-all press makes on `state`, or `null` where it would
   * change nothing: fill every empty cell that has no notes, and once none is
   * left, strike what the board already rules out (`adaptiveMarkAll`, which
   * states the additive rule). Having the hook is having the control: the app
   * shows Fill marks for it.
   *
   * The midend calls it for `MARK_ALL_BUTTON`, and for the letter `M` on a
   * board whose keypad has no such letter. `interpretMove` is never asked
   * about the press, so a game does not read `M` for it.
   */
  markAll?(state: State): Move | null;
  /**
   * The game has **no action of its own for the secondary button**, and the
   * engine does the rest: `view-interactive.ts` skips `detectSecondaryButton`,
   * so a finger that rests before it drags stays a left press and arrives at
   * once; the bar offers no "Right click" toggle; and the midend hands the
   * game a mouse's right button as the left, so a right click plays as a left
   * click and the game never sees a button it has nothing for.
   *
   * Without it, a touch press waits out a 350 ms hold and is then promoted to
   * `RIGHT_BUTTON`, so "press, pause to aim, then drag" would arrive as a
   * button the game does not use.
   *
   * **Exactly guarded, so it cannot drift**: `input-parity.test.ts` asserts the
   * biconditional, that a game declares this **iff** no secondary gesture on a
   * real board does anything the primary one would not, and that a declaring
   * game does nothing with a `RIGHT_BUTTON` handed to it directly. Do not set
   * it to suppress an affordance you merely dislike; the sweep will convict
   * the declaration on the day the game grows a secondary action.
   *
   * It is not upstream's `REQUIRE_RBUTTON` inverted: a third category exists
   * and is the largest. Tracks *uses* the right button without *needing* it,
   * so an inverted `REQUIRE_RBUTTON` would suppress a promotion Tracks handles.
   */
  readonly ignoresSecondaryButton?: boolean;

  /** The on-screen keypad this game wants (upstream `game_request_keys`): the
   * `{ button, label }` keys, digits/letters plus a clear key or a game's
   * bespoke keys like Undead's Ghost/Vampire/Zombie. It depends on `params`,
   * and on the board in play, `state`, where a board can hold a value its
   * params do not promise (an area larger than the deal grows, in a game ID
   * from elsewhere); the app's key panel reloads with each board. It takes
   * no ui, and a caller with no board yet passes none. Absent ⇒ no keypad. */
  requestKeys?(p: Params, state?: State): KeyLabel[];

  /** The game's notes are pressed where they are drawn, with no mode to
   * write them in: a board of features, whose slots narrow its notes. Its
   * `pencil` array then asks for no Marks key and no keypad
   * (`takesNotes`). Left off by mistake, the Marks key it gains is inert,
   * which `input-parity.test.ts` refuses. */
  readonly notesWithoutMode?: true;
  /** What the board has shown of the value each key types, for a game whose
   * scores say it of a value as a whole (Wordguess: a letter in the word, in
   * its place, or not in it). Sent with every move, so the keypad keeps up
   * with the board; a key with no entry is drawn plain. Absent ⇒ every key is
   * plain. */
  keyStatus?(state: State): KeyStatus[];

  defaultParams(): Params;
  /** The preset menu's boards; `presetMenu` is the menu built from them. */
  readonly menu: PresetBoards<Params>;
  encodeParams(p: Params, full: boolean): string;
  decodeParams(s: string): Params;
  /** `null` when valid, else a human-readable reason. Only what the
   * `paramConfig` items cannot state — a limit that depends on another field,
   * or one that holds only when generating — because the engine checks every
   * item's `bounds` and choice list first (`paramsError`), and that check is
   * what the app and the tests call. Absent when the items say it all. */
  validateParams?(p: Params, full: boolean): string | null;
  /** The same board turned on its side: `p` with width and height exchanged,
   * or `null` when these params cannot be turned. Having it is what lets a
   * new game be dealt whichever way round fits the screen better (the midend's
   * `newGame`), so a game leaves it out when a tall board is a different game
   * from a wide one — gravity, a goal on a fixed side, a tiling with a
   * direction. `orientation.test.ts` holds every implementation to its
   * `computeSize` exchanging width and height. */
  transposeParams?(p: Params): Params | null;

  newDesc(p: Params, rng: RandomState): { desc: string; aux?: string };
  /** State 0 of the board `desc` describes. It is also the verdict on a
   * pasted desc: read it through one parse and take the value with
   * `descValue`, whose refusal `loadDesc` reports in the collection's words
   * (`desc-error.ts`). There is no separate validator to agree with it. */
  newState(p: Params, desc: string): State;
  newUi(state: State): Ui;

  /** What game description describes the board this state belongs to
   * (upstream `midend_supersede_game_desc`)? Implemented only by a game whose
   * board is not fully determined until play begins — Mines generates its mine
   * layout on the *first click* (so the first click is never a mine), and the
   * desc the player started from describes no layout at all.
   *
   * Upstream's game reaches into the midend and pushes a new desc from inside
   * `execute_move`; a TS game has no midend back-reference and `executeMove` is
   * pure, so the engine **pulls** instead: it asks this of the state in play,
   * and a game answers from that state alone (Mines' post-click state carries
   * its layout and the square it was laid out around).
   *
   * - **`null` means the desc the board started from still describes it.**
   *   The answer follows the position: undoing past the move that settled the
   *   board gives back the starting desc, and with it the unsettled board.
   * - **The answer names the board as a shared game ID opens it**, which is
   *   also what a restart rebuilds: Mines' names the layout *and* its first
   *   click, already opened.
   * - **A save is rebuilt from the starting desc**, and its move log is
   *   replayed onto that. So the move that settles the board must settle it
   *   the same way on replay, by carrying what it settled rather than deriving
   *   it again: a seed names a board only through a generator, which this
   *   project changes. */
  supersededDesc?(s: State): string | null;

  /** Reconcile persisted Ui against a state transition (upstream
   * `game_changed_state`). The midend calls this — mutating `ui` in
   * place — after every real move/undo/redo/solve/restart and once at
   * new-game setup (`oldState = null`), before animation timing and the
   * repaint, and never on a bare `UI_UPDATE` (the user is mid-edit
   * then). A game whose Ui tracks the current state (e.g. a
   * working-input row reconstructed from the latest move's holds)
   * derives it here. Absent ⇒ the midend treats it as a no-op.
   *
   * **Whether a game needs this turns on what its Ui remembers, not on how
   * long it remembers it for.** An armed gesture is safe when what it holds
   * cannot be invalidated — it names fixed geometry (a grid cell, an island, a
   * node), or the firing input re-derives everything against the state it is
   * handed. It is unsafe when it names **mutable board content**: Pegs' armed
   * keyboard jump remembered a *peg*, checked the direction at fire time and
   * took that peg on trust, so an undo left it aimed at a hole and
   * `executeMove` rejected the player's keypress. A pointer drag the board is
   * changed under by an Undo, a hint or Solve is ended by the midend and needs
   * nothing here; one held in fields of the game's own still meets a move
   * made by a key. */
  changedState?(ui: Ui, oldState: State | null, newState: State): void;

  /** Translate a pointer/key event to a move, `null` for "nothing
   * happened", or `UI_UPDATE` for "UI/cursor changed in place, redraw
   * but add no history entry".
   *
   * `ds` is the live draw state, **never null and built at the tile size on
   * screen** (see {@link Game.newDrawState}), and the midend refuses input
   * before there is a board. So
   * read `ds.tileSize` directly: a `ds?.tileSize ?? PREFERRED_TILE_SIZE`
   * fallback is not merely inert, it is a *wrong answer* waiting to happen,
   * mapping the pointer at the preferred tile size rather than the one on
   * screen. */
  interpretMove(
    s: State,
    ui: Ui,
    ds: DrawState,
    p: Point,
    button: number,
  ): Move | null | UiUpdate;
  /** The game's input as targets and verbs, for a game that plays that way
   * (`target-verb.ts`). A game whose verbs are all its input spreads
   * `playedByTargetVerbs`, which declares this and the `interpretMove`
   * together; one with arms of its own hands the rest to
   * `interpretTargetVerbs`. The help renders its Controls paragraph from
   * this; `target-verb.test.ts` holds the two to each other. */
  readonly targetVerbs?: TargetVerbs<State, Ui, DrawState, unknown, Move>;
  /** The mark a player puts on a clue they are done with, declared with
   * `dragMarkVerbs`. The help writes the page's sentence about it from this,
   * and `drag-marks.test.ts` plays a drag of it through `interpretMove`. */
  readonly doneClues?: TargetVerbs<State, Ui, DrawState, unknown, Move>;
  /** Pure: returns a NEW state. Throws if the move is illegal. */
  executeMove(s: State, m: Move): State;

  /** Whether this position is won, lost or neither, judged from the board
   * alone and never from how it was reached: a board typed in already solved
   * is solved at move 0, and a solved board the player breaks is ongoing. The
   * midend asks once per position and derives the rest from its history
   * (whether the solver was used, when to flash, when the clock runs). Never
   * "solved-with-help", which is the midend's. */
  status(s: State): GameStatus;

  /** Solve from `orig` (the initial state) given `curr`, which the player's
   * Solve asks. Returns a discriminated result so a `Move` that is itself a
   * string can't be confused with an error message.
   *
   * The move must leave a board whose status is solved: `Midend.solve` throws
   * on one that does not, so a game that cannot finish from `curr` refuses. */
  solve(orig: State, curr: State, aux?: string): SolveResult<Move>;

  /** The board as its description's rules read it, for a game whose
   * description states them: where the board breaks them is what its live
   * error marks draw (`docs/rendering.md` § "Live errors are the rules'"). */
  rules?: RulesOf<State>;

  /** Whether this board is proved to have no solution: no moves from it reach
   * a solved one. `loadDesc` refuses a board that is, so nobody is handed one
   * that cannot be finished.
   *
   * **For a game with no mistake check, and only a proof that is cheap on
   * every board**: a parity, a rank, a planarity test. It is asked of every
   * pasted ID and every opened save, where {@link solve} is asked only when
   * the player presses it, so a search does not belong here: it charges a
   * board it cannot settle its whole budget each time that board opens. A
   * game with `findMistakes` answers through `solve`, which also says whether
   * the answer is the only one, and `registerGame` refuses one with both.
   *
   * **A game that can be lost answers for a position played into, too, and
   * with what proves it**: a `markedDeadEnd`, whose words name the pegs or the
   * barrel at fault. The midend refuses a hint with it before it asks
   * {@link hint}, so the proof is stated once and a hint is never asked
   * about a position it holds for. A bare `true` is a verdict on the board as
   * dealt only, and leaves the hint to the game (Flood's leads home past the
   * limit). */
  hasNoSolution?(state: State): boolean | MarkedDeadEnd;

  /** Track the pointer over the board when no button is down, for a game
   * that can say something useful about what sits under it — Loopy lights
   * the whole run of lines the hovered edge belongs to, so "are these two
   * ends the same segment?" needs no tracing.
   *
   * `p` is `null` when the pointer leaves the board, which a game MUST
   * treat as "nothing is hovered" rather than ignore, or the highlight
   * outlives the pointer.
   *
   * **Typed to return no move, deliberately.** A hover is not an action:
   * it may mutate `ui` in place and ask for a repaint with
   * {@link UI_UPDATE}, or return `null` to change nothing — and returning
   * `null` when the hovered thing has not changed is what keeps a
   * pointer sweep from repainting every frame.
   *
   * **Declaring it is the enrollment.** The app asks the midend whether
   * the running game has one and sends nothing at all when it does not,
   * so a game without a hover costs no messages across the worker; there
   * is nothing to register and nothing that can be forgotten. A hover is
   * mouse-only by nature — touch has none — so it may never be the only
   * way to reach something. */
  hover?(state: State, ui: Ui, ds: DrawState, p: Point | null): UiUpdate | null;

  /** The game's explained hint, one capability ({@link GameHint}). A game
   * whose hint is not written yet has {@link DRAFT_HINT}, and is a draft
   * (`sections.ts`). */
  readonly hint: GameHint<State, Move, Ui, DrawState, Highlights, Rung>;

  /** Compute the cells of the current state that contradict the
   * puzzle's unique solution — the mistake-checking divergence from
   * upstream. Pure (no state mutation). Returns game-specific highlight
   * data; an empty result means "no detectable mistakes". Absent ⇒ the
   * game has no notion of a mistake (every reachable state is legal,
   * e.g. a permutation puzzle), and the midend reports the capability
   * as unavailable. The midend stores the result as an ephemeral,
   * never-persisted overlay (cleared on the next transition) and passes
   * it to `redraw`, exactly like a displayed hint step. */
  findMistakes?(state: State): readonly Mistake[];

  /** The moves that take `mistakes`, what {@link findMistakes} just found on
   * `state`, off the board: an entry emptied, a line or a mark taken up, so
   * that each element is as the player found it. Applying the hint on a
   * board with mistakes plays them, as one step of Undo, and the board after
   * them must have none. Required of every game with `findMistakes`
   * (`registerGame`). Pure. */
  clearMistakes?(state: State, mistakes: readonly Mistake[]): readonly Move[];

  /** One move that puts one element of `solved`, the board's answer as
   * `solve` reaches it from `state`, onto `state`: an entry written in, a
   * line drawn. Applying the hint plays it where the hint has no reasoned
   * step on a board with nothing wrong on it, so `state` has no mistake and
   * the move must make none. `null` only when `state` already holds every
   * element (the midend then shows the answer whole). Required of a game
   * with a tier that allows trial and error (`registerGame`); a game
   * without it shows the answer whole there instead. Pure. */
  revealOne?(state: State, solved: State): Move | null;

  /** The game's **reference aid**: a checklist of its fixed inventory of
   * pieces, or its dictionary, with the player's found status. Presence makes
   * the app show a toggle, labeled with its `title`. */
  reference?: ReferenceAid<State, Ui, Move>;

  /** Render the state as plain text for the share dialog. Returns `null`
   * when *these particular* params have no text rendering, which having the
   * method cannot express: Loopy's text format assumes a square lattice, so it
   * is available on the square grid type only (upstream spells this as a
   * separate `game_can_format_as_text_now(params)` entry point). The midend
   * and the app treat an absent rendering as "no text panel". */
  textFormat?(s: State): string | null;
  /** Having it is what gives the game a status bar. */
  statusbarText?(s: State, ui: Ui): string;

  /** The game's user preferences (upstream `get_prefs`/`set_prefs`),
   * declarative: each entry maps a labeled config item to a field on
   * `Ui`. The midend builds the app's preferences dialog from these,
   * reads current values via `get`, applies edits via `set` (then
   * repaints — a pref like "highlight crossed edges" changes
   * rendering), and re-applies the player's chosen values after each
   * `newUi` so a preference survives starting a new game. Defaults are
   * whatever `newUi` sets. Absent ⇒ the game has no preferences. */
  prefs?: GamePref<Ui>[];

  /** What a placement rules out at a glance, which the engine's `auto-cross`
   * preference makes for the player with it (`RulesOut`). Absent ⇒ the game
   * offers no such preference. */
  rulesOut?: RulesOut<State, Move>;

  /** The game's **custom params** configuration form (upstream's
   * `configure`/`custom_params` path), declarative like `prefs`: an
   * ordered list of field descriptors the midend turns into the app's
   * "Custom type…" dialog and parses back onto a copy of `Params`,
   * validated by `paramsError`. A plain width/height game declares
   * `paramConfig: dimensionParamConfig({ doc })`.
   *
   * **It is the field list everything about params is derived from**, so what
   * it declares reaches further than the dialog: the tier names and accessors
   * (`difficulty.ts`), the codec (`params-codec.ts`), the preset titles and
   * the custom header (`param-label.ts`), the bounds check (`paramsError`)
   * and the help's Parameters section. */
  paramConfig: ParamConfigItem<Params>[];

  /** How to run this game's solver capped at a tier. Declared by a game with
   * difficulty tiers, absent otherwise.
   *
   * **What the tiers are, and how params hold one, is not here**: both come
   * off the game's difficulty item (`difficultyItem`), so a tiered game
   * declares its tier list exactly once, where a player picks from it.
   *
   * It exists so that a property *about* tiers can be asserted for every tiered
   * game at once, above all cap-monotonicity, without which Check & Save
   * silently breaks on a game's lowest tier. See `difficulty.ts` for the
   * contract and `difficulty-contract.test.ts` for the guards a game is enrolled
   * in the moment it declares this. */
  difficulty?: DifficultyContract<Params>;

  /** Whether deduction alone finishes this board from its opening position.
   * `loadDesc` refuses a board that fails it, so no board is played that needs
   * trial and error.
   *
   * **Every game without difficulty tiers answers**, and `registerGame` refuses
   * one that does not: `nothingToDeduce` where the board is worked by moving,
   * searching or guessing, and a test of its own where its hint deduces and
   * it still has no tiers, which is Mines alone. A deductive game has tiers,
   * answers through {@link difficulty} and leaves this out. */
  finishesByDeduction?(state: State): boolean;

  /** RGB palette (each component 0..1), index 0 is conventionally the
   * background. Receives the frontend default background so a game can
   * derive its palette from the host (upstream's
   * `frontend_default_colour`). */
  colors(defaultBackground: Color): Color[];
  /** Where this palette departs from the collection's handling of the color
   * schemes: a board that is not color 0, and the bevels dark mode exchanges.
   * It names palette slots with the game's own constants, never a color. */
  readonly paletteScheme?: Partial<PaletteScheme>;
  /** Upstream's `preferred_tilesize`; the size baseline. */
  readonly preferredTileSize: number;
  computeSize(p: Params, tileSize: number): Size;
  /** Build the per-game draw state (the tile cache and whatever else `redraw`
   * needs) at `tileSize`, deriving any tile-size geometry here. Required, so
   * that a game never receives a null `ds`: the midend has no sensible
   * behavior without one.
   *
   * A draw state lives at one tile size. The midend builds a fresh one when
   * `size()` picks a different tile size, so no cached tile or blitter is ever
   * the wrong size and a game writes no resize invalidation of its own. There
   * is deliberately no counterpart to upstream's `game_set_size`, which resized
   * a live draw state. */
  newDrawState(s: State, tileSize: number): DrawState;
  /** Paint the board. `ds` is never null — see {@link Game.newDrawState}. */
  redraw(
    dr: GameDrawing,
    ds: DrawState,
    frame: Frame<State, Ui, Move, Highlights, Mistake>,
  ): void;
  animLength?(a: State, b: State, dir: number, ui: Ui): number;
  /** A flash for an outcome the status does not show (a Mines death, a Same
   * Game board with no move left), read in `redraw` as `flash.time`. Asked on
   * every transition, and a nonzero answer replaces the win flash. That one is
   * the engine's and has no hook: a game lights what `flash.win` says. */
  flashLength?(a: State, b: State, dir: number, ui: Ui): number;
  /** A board nobody can play on that `status` still calls "ongoing", because
   * the player is expected to undo out of it (a Mines death). The solve timer
   * holds while this is true. When the timer runs is otherwise the engine's
   * rule; this states a fact about the board, not a clock policy. */
  timerHolds?(s: State): boolean;

  /** The contract sections this game has no such thing as, each with the
   * reason in the puzzle's rules: Fifteen has no mistakes to check, because
   * every arrangement of its tiles is a step on the way. The help page shows
   * the reason, and a section neither implemented nor declared here makes the
   * game a draft (`sections.ts`, which also refuses a game that does both).
   * "Nobody has written it yet" is not a reason; that absence is what draft
   * means. */
  readonly notApplicable?: NotApplicableReasons;

  /** How a move is written to the save file and read back. Absent: the move
   * is JSON-safe and stored as-is. One object, so a game cannot write a move
   * it has no way to read. */
  readonly moveCodec?: {
    serialize(m: Move): unknown;
    deserialize(raw: unknown): Move;
  };

  /** The parts of the `Ui` that must survive a save (upstream
   * `encode_ui`/`decode_ui`). The `Ui` is otherwise rebuilt from `newUi`
   * on load and reconstructed by replaying the move log — but a field that
   * lives *outside* the undo history and is set by `interpretMove` (which
   * replay never calls) cannot be recovered that way. Mines' persistent
   * death counter and its "was ever completed" flag are exactly that: dying
   * then undoing removes the death from the move log, so only serializing
   * the `Ui` keeps the count. The midend writes `encode(ui)` into the save
   * and, after replaying the move log on load, restores it via `decode`.
   * Absent ⇒ the `Ui` carries no save-surviving state (every other game). */
  readonly uiCodec?: {
    encode(ui: Ui): string;
    /** `state` is the board the `Ui` is restored onto, the log replayed: what
     * a field derived from both is judged against (Wordguess's "this row may
     * be sent" asks the word list and the rows already scored). */
    decode(ui: Ui, encoded: string, state: State): void;
  };
}
