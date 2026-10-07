/**
 * The engine's shared puzzle vocabulary: geometry, colors, config descriptions
 * and the change notifications the engine emits.
 *
 * Every name here belongs to a contract the **engine** states and a game
 * implements: `Color` is what `Game.colors()` returns, `Rect`/`Point`/`Size`
 * are the drawing API's coordinate records. The app is a consumer. Several are
 * upstream's C structures seen through a JS lens (a `Color` is an RGB triple in
 * 0..1, not a CSS string), which is why they read the way they do.
 *
 * It lives in the engine rather than the app because the engine and the games
 * import nothing above them, which the layering test asserts.
 */

/** An RGB triple, each component in 0..1 — the puzzle drawing API's color
 * representation, as fed to and returned by a game's `colors()`. */
export type Color = [number, number, number];

export type Point = {
  x: number;
  y: number;
};

export type Size = {
  w: number;
  h: number;
};

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/** A label for an on-screen key the game wants offered, and the button code
 * pressing it should deliver. */
export type KeyLabel = {
  label: string;
  button: number;
  /**
   * A palette index this key *enters*, painting the key in that color.
   *
   * For a game whose element is a color there is no character that names it:
   * a bare `"1"` asks the player to learn which color one means, which is the
   * one thing the panel exists to spare them. The index is resolved against
   * the game's own palette by the frontend, so the key and the board agree
   * under every color scheme (`puzzle/components/view.ts` computes that
   * palette; `Puzzle.palette` publishes it).
   *
   * The label still carries the character the key sends, so the swatch teaches
   * the keyboard binding rather than replacing it.
   */
  swatch?: number;
};

/** One entry in the game-type preset menu; `submenu` makes it a nested group
 * rather than a selectable preset. */
export type PresetMenuEntry = {
  /** The menu's line. */
  title: string;
  /** A preset's name outside the menu, where no section heading stands over
   * it. */
  label?: string;
  params: string;
  submenu?: PresetMenuEntry[];
};

export type DrawTextOptions = {
  align: "left" | "center" | "right";
  baseline: "alphabetic" | "mathematical";
  fontType: "fixed" | "variable";
  size: number;
};

/** The board on screen as one id, `params:desc` with the full params, used for
 * everything: showing, sharing, saving and reopening (`Midend.emitIdChange`). */
export type NotifyGameIdChange = {
  type: "game-id-change";
  currentGameId: string;
};

export type NotifyGameStateChange = {
  type: "game-state-change";
  status: "ongoing" | "solved" | "solved-with-help" | "lost";
  currentMove: number;
  totalMoves: number;
  canUndo: boolean;
  canRedo: boolean;
  /** The positions in the history that a restart reached, in order: each is
   * the board as it started, with what was played before it still behind it. */
  restarts: number[];
  /** Which board this is, among those this page has had in play. It changes
   * when the board is replaced, and a board brought back by Undo or Redo
   * comes back under the number it had. */
  board: number;
  /** The board this one replaced is kept, and Undo at move 0 brings it back. */
  boardBefore: boolean;
  /** The board an Undo left is kept, and Redo at the last move returns to it. */
  boardAfter: boolean;
  /**
   * Whether any cell on the board carries a pencil mark, for a game that offers
   * the Mark-all press; always `false` for a game that does not. The chrome uses
   * it to name which of the press's two jobs it is about to do: *Fill* all
   * pencil marks on a bare board, *Update* them once there are marks to narrow.
   */
  hasPencilMarks: boolean;
  /**
   * This game's saveable `Ui`, as `Game.encodeUi` renders it — left out
   * entirely for a game that has no such hook, which is most of them.
   *
   * The app autosaves when something it observes changes, and before this it
   * observed only the move index, the game id and the checkpoints. A `Ui` edit
   * moves none of those, so for Guess a half-composed row was encoded perfectly
   * and never written: the bytes were right and nothing asked for them. Sending
   * the encoding rather than a "the Ui changed" flag means the value the app
   * compares **is** the part of the save that would differ, so it cannot
   * re-save for a change the file would not record, and a game with no
   * persisted `Ui` costs nothing at all.
   */
  uiState?: string;
};

export type NotifyParamsChange = {
  type: "params-change";
  params: string;
};

export interface NotifyStatusBarChange {
  type: "status-bar-change";
  statusBarText: string;
  activeHintExplanation?: string;
  /**
   * Where the displayed hint sits in its **journey**, 1-based, and how many
   * legs the journey has — so the chrome can say "Step 2 of 3" while a single
   * deduction plays out over several moves.
   *
   * A *journey* is the collection's own unit (`ts-engine`, "One deduction
   * firing is one journey"): the step on display plus every following step
   * flagged `continuesPrevious`. It is deliberately not the position in the
   * stored plan — for a plan-based game like Inertia that would read "Step 3
   * of 47", which is a fact about the solver, not about the hint the player is
   * being shown. `null` when there is no displayed hint; `length` is 1 for a
   * single-leg hint, and the chrome shows nothing then.
   */
  hintJourney: { index: number; length: number } | null;
}

export type PuzzleId = string;
export type EncodedParams = string;

/**
 * A board a generator dealt that nobody has played: what `Game.newDesc`
 * returned, with the params it was dealt at in their full encoding. The app
 * deals one ahead of each New game and hands it back through
 * `EngineCore.newGame`. It is what the generator wrote and nothing has read
 * it since, so it is good only for the build that dealt it.
 */
export interface DealtBoard {
  params: EncodedParams;
  desc: string;
  /** The generator's `aux`, or `null` where it returns none. */
  aux: string | null;
}

/** The Custom dialog's preview of the params its values describe, or why they
 * are refused. A result rather than a string, because the answer on success is
 * itself a string and the refusal would otherwise have to hide inside it. */
export type CustomParamsEncoding =
  | { ok: true; params: EncodedParams }
  | { ok: false; error: string };

/** One field in a config dialog (custom game params, or preferences). */
export type ConfigItem =
  | { type: "string"; name: string }
  | { type: "boolean"; name: string }
  | { type: "choices"; name: string; choicenames: string[] };

/**
 * A field whose value decides what other fields of the form offer, as a
 * game's ruleset does and a rule modifier may (`only.ts`). A form shows a
 * narrowed field at a value it is offered, and submits that value
 * (`config-narrowing.ts`).
 */
export interface ConfigNarrowing {
  /** The deciding field's id: a `choices` field or a checkbox, which nothing
   * narrows. */
  by: string;
  /** For each value of `by`, in order (a checkbox's are off, then on), the
   * fields it narrows by id: the choice indices it leaves of a `choices`
   * field, or the one value of a checkbox. */
  only: Record<string, number[] | boolean>[];
}

/** A whole config form: its fields, keyed by field id. It carries no title
 * because a game's display name is not the engine's to know. */
export type ConfigDescription = {
  items: { [id: string]: ConfigItem };
  narrowing?: ConfigNarrowing[];
};

/** The values of a `ConfigDescription`'s fields, keyed by the same ids.
 * A `choices` field's value is its zero-based index. */
export type ConfigValues = Record<string, string | boolean | number>;

/**
 * The solve timer as the player sees it: `null` while this game's timer is
 * switched off (the `show-timer` preference), otherwise the whole seconds
 * elapsed and whether help was taken on this board — a hint shown, a check
 * that found something, or the solver used — so a time is never presented as
 * unassisted when it was not.
 *
 * Sent only when one of those changes, which is at most once a second: the
 * midend ticks at the animation rate, and the chrome has no use for the rest.
 */
export interface NotifyTimerChange {
  type: "timer-change";
  timer: TimerReadout | null;
}

export interface TimerReadout {
  seconds: number;
  assisted: boolean;
}

export type ChangeNotification =
  | NotifyGameIdChange
  | NotifyGameStateChange
  | NotifyParamsChange
  | NotifyStatusBarChange
  | NotifyTimerChange;

export type GameStatus = NotifyGameStateChange["status"];

/**
 * What the check behind Check & save and Check without saving found
 * (`EngineCore.check`), asked of `findMistakes` first and then of the hint:
 *
 * - mistakes: `count` entries are wrong, and they are highlighted.
 * - a dead end: the hint says to go back from here, in `reason`'s words, and
 *   marks the cause where its words name one.
 * - out of reach: the hint's search could not settle the position, so the
 *   check could not either.
 * - sound: nothing found; `mistakesChecked` when `findMistakes` ran, so the
 *   report may say "no mistakes".
 */
export type CheckVerdict =
  | { kind: "mistakes"; count: number }
  | { kind: "dead-end"; reason: string }
  | { kind: "out-of-reach" }
  | { kind: "sound"; mistakesChecked: boolean };

export enum PuzzleButton {
  // The middle button's codes (0x0201, 0x0204, 0x0207) are left unused.
  LEFT_BUTTON = 0x0200,
  RIGHT_BUTTON = 0x0202,
  LEFT_DRAG,
  RIGHT_DRAG = 0x0205,
  LEFT_RELEASE,
  RIGHT_RELEASE = 0x0208,
  CURSOR_UP,
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  /* UI_* are special keystrokes generated by front ends in response
   * to menu actions, never passed to back ends */
  UI_LOWER_BOUND,
  UI_QUIT,
  UI_NEWGAME,
  UI_SOLVE,
  UI_UNDO,
  UI_REDO,
  UI_UPPER_BOUND,
  /* Not upstream's: toggles a game's pencil mode (pointer.ts). */
  PENCIL_MODE,

  MOD_CTRL = 0x1000,
  MOD_SHFT = 0x2000,
  MOD_NUM_KEYPAD = 0x4000,
  MOD_MASK = 0x7000 /* mask for all modifiers */,
}

/**
 * Where a game's palette departs from the collection's handling of the color
 * schemes, by palette index. A game states it with its own `COL_*` constants
 * (`Game.paletteScheme`).
 */
export interface PaletteScheme {
  /** The color the board is painted in. The page around the canvas takes it. */
  board: number;
  /**
   * Pairs whose dark-scheme values are exchanged.
   *
   * Inverting lightness turns an emboss into an inset, so a bevel's highlight
   * and lowlight trade values to keep the light coming from one side. A
   * highlight used as a cursor or a selection is not a bevel and stays out.
   */
  darkSwaps: readonly (readonly [number, number])[];
}

/**
 * What the app learns about a game once, at construction, and never asks again.
 *
 * Every field is produced by `Midend.getStaticProperties` and relayed, under
 * the same name, into a `Puzzle` field, so the chain is easy to extend and its
 * far end easy to forget: `contract-surface.test.ts` sweeps this interface, as
 * it sweeps `Game`, for a field nothing reads.
 *
 * There is no `canConfigure`: every game declares a `paramConfig`
 * (`custom-params.test.ts`), so the "Custom type…" entry is unconditional.
 */
export interface PuzzleStaticAttributes {
  canSolve: boolean;
  canHint: boolean;
  /** The board can be checked (`EngineCore.check`): the game finds mistakes,
   * or has a hint to ask whether the position is a dead end. */
  canCheck: boolean;
  /** The game supports "fill all pencil marks" (upstream's `M` key). Gates
   * the toolbar mark-all button. */
  canMarkAll: boolean;
  /** The game offers a reference aid (the `reference` hook) — a checklist
   * of its fixed inventory with found status. Gates the toolbar reference
   * button. */
  hasReference: boolean;
  /** The game has no meaning for the secondary button, so the view must not
   * synthesize one from a long press or a two-finger tap — see
   * `Game.ignoresSecondaryButton`. */
  ignoresSecondaryButton: boolean;
  wantsStatusbar: boolean;
  /** `Game.paletteScheme`, with what the game left out filled in. */
  paletteScheme: PaletteScheme;
}

/** One entry in a game's reference aid: a piece from the puzzle's fixed
 * inventory with the player's found status. Plain data (crosses the Comlink
 * worker boundary). `key` is a stable id the panel echoes back to
 * `selectReference`; `label` is the text/accessible rendering; `pips` is
 * optional face-value data for a domino-style pip render; `status` is derived
 * purely from the player's own placements. */
export interface ReferenceItem {
  key: string;
  label: string;
  pips?: readonly number[];
  status: "outstanding" | "placed" | "conflict";
}

/** A game's reference-aid model: the full inventory checklist plus the
 * currently spotlighted key. `columns` is an optional layout hint. */
export interface ReferenceModel {
  items: ReferenceItem[];
  selected: string | null;
  columns?: number;
}

/**
 * Drawing font selection
 */
export interface FontInfo {
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
}
