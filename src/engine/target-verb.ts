/**
 * The target-verb input model: the player aims at a target — a square, an
 * edge, a gutter cell — and each button applies a verb there. The left button
 * and Enter at the cursor apply one verb, the right button and Space another,
 * and further verbs are reached by their own keys.
 *
 * WHAT LIVES HERE is what the games that play this way had each written for
 * themselves and could not legitimately answer differently: that a press parks
 * the hidden cursor on what it pressed, so the keyboard carries on from there;
 * that the first select on a hidden cursor only shows it; that Enter does what a
 * left-click does and Space what a right-click does; and the Controls paragraph
 * that says so, which the help renders from the same declaration
 * (`vite-plugins/controls.ts`), so the page cannot describe a key the game does
 * not bind.
 *
 * WHAT DOES NOT live here is the puzzle. The game supplies its target geometry
 * and each verb as a function returning its own `Move`: Light Up's bulb toggle,
 * Range's three-state cycle and Singles' "either key clears" are the games'
 * answers, and none of them is a flag. A game with input beyond the verbs —
 * Unruly's digits, Range's dotting Shift-arrows, Singles' click outside the grid
 * — handles those arms in its own `interpretMove` before handing the rest here.
 *
 * `target-verb.test.ts` holds a declaration to the behavior: for every game
 * declaring `Game.targetVerbs`, Enter at the cursor reaches exactly the boards a
 * left-click reaches, and Space exactly those of its declared pointer verb.
 */

import {
  type HintStep,
  type HintTrackVerdict,
  UI_UPDATE,
  type UiUpdate,
} from "./game.ts";
import { click, key, type PointerAction } from "./hint-gesture.ts";
import {
  BACKSPACE,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  DELETE,
  type GridCursor,
  isCursorMove,
  isMouseDown,
  LEFT_BUTTON,
  LEFT_RELEASE,
  moveCursor,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
  stripModifiers,
} from "./pointer.ts";
import type { Point, Size } from "./types.ts";

/** A key, beyond Enter or Space, that applies a verb at the cursor: the codes
 * that reach it (a letter's two cases, say) and the name the Controls paragraph
 * gives it. */
export interface VerbKey {
  readonly codes: readonly number[];
  readonly name: string;
}

/** A letter's key, `"T"`, reached in either case. */
export function letterKey(letter: string): VerbKey {
  const upper = letter.toUpperCase();
  return {
    codes: [upper.charCodeAt(0), upper.toLowerCase().charCodeAt(0)],
    name: upper,
  };
}

/** A digit's key, on the main row or the numpad: the model strips the numpad's
 * modifier before it matches a key, as `digitOf` does. */
export function digitKey(digit: number): VerbKey {
  return { codes: [String(digit).charCodeAt(0)], name: String(digit) };
}

/** The keys that empty a target. */
export const ERASE_KEYS: readonly VerbKey[] = [
  { codes: [BACKSPACE], name: "Backspace" },
  { codes: [DELETE], name: "Delete" },
];

/** One thing a button does to a target. */
export interface TargetVerb<State, Ui, Target, Move> {
  /** What the verb does, as the Controls paragraph completes "Click a square
   * to …": `"place or remove a light"`. */
  readonly does: string;
  /** Further keys that apply this verb at the cursor. */
  readonly keys?: readonly VerbKey[];
  /**
   * The move this verb makes at `target`, `UI_UPDATE` where it changes only
   * what the player sees (Black Box re-flashing a laser already fired), or
   * `null` where it means nothing there (a clue square, a light on a dot).
   * `ui` is the player's own: a preference that swaps the buttons (Slant), or
   * a tally the move keeps beside the board (Mines' deaths).
   */
  apply(state: State, target: Target, ui: Ui): Move | UiUpdate | null;
}

/**
 * Where the player aims. `pointerTarget` and `cursorTarget` must agree on what
 * a target is, since the guard compares a press on one with a select on the
 * other.
 */
export interface TargetGeometry<State, Ui, DrawState, Target> {
  /** What a target is called in the Controls paragraph: `"square"`. */
  readonly noun: string;
  /** The target a press at `p` addresses, or `null` for none. `ui` is there for
   * a view the player can scroll: Net's wrapping grid, drawn from an origin. */
  pointerTarget(state: State, ds: DrawState, p: Point, ui: Ui): Target | null;
  /** A point a press addresses `target` from: its inverse, which a hint's
   * gesture aims at (`verbGesture`). The middle of it, so it reads as the
   * place a player would tap. */
  pointAt(state: State, ds: DrawState, target: Target, ui: Ui): Point;
  /** The target the cursor addresses, or `null` where it rests on none. */
  cursorTarget(state: State, ui: Ui): Target | null;
  /** Put the cursor on `target`, without showing it. */
  parkCursor(ui: Ui, target: Target): void;
  /** Move the cursor for an arrow key; `true` when anything changed. */
  moveCursor(state: State, ui: Ui, button: number): boolean;
}

/** A game's whole target-verb input: its geometry and the verbs by button. */
export interface TargetVerbs<State, Ui, DrawState, Target, Move> {
  readonly geometry: TargetGeometry<State, Ui, DrawState, Target>;
  /** The left button, and Enter at the cursor. */
  readonly primary: TargetVerb<State, Ui, Target, Move>;
  /** The right button, and Space at the cursor. A game without one takes
   * Space as a second Enter. */
  readonly secondary?: TargetVerb<State, Ui, Target, Move>;
  /** Verbs no button applies directly, each with its keys and the pointer's
   * route to the same move: Net's half turn, or an erase key whose result the
   * buttons reach by cycling. */
  readonly keyOnly?: readonly KeyOnlyVerb<State, Ui, Target, Move>[];
}

/** A button, by the verb slot it applies. */
type VerbButton = "primary" | "secondary";

/**
 * How a pointer reaches what a key-only verb does, since every action is
 * reachable by the pointer alone as well as the keyboard (`ts-engine`, "A game
 * reads one pointer with two buttons"). A verb without one does not typecheck.
 *
 * - `repeat`: the button pressed on the target `times` times (a half turn is
 *   two quarter turns).
 * - `cycle`: the button's cycle passes through the verb's result, so pressing
 *   it until the target shows that result makes the same move (an erase key).
 * - `notes`: in notes mode, the button pressed on the target — at `where` on
 *   it, when the game reads where the press lands (Net's lock is the middle of
 *   the square; its sides take notes).
 *
 * The Controls paragraph says each route, and `target-verb.test.ts` holds it to
 * what the key does.
 */
type PointerRoute =
  | { readonly kind: "repeat"; readonly button: VerbButton; readonly times: number }
  | { readonly kind: "cycle"; readonly button: VerbButton }
  | { readonly kind: "notes"; readonly button: VerbButton; readonly where?: string };

/** A verb no button applies directly: its keys, and the pointer's route. */
export interface KeyOnlyVerb<State, Ui, Target, Move>
  extends TargetVerb<State, Ui, Target, Move> {
  readonly keys: readonly VerbKey[];
  readonly pointer: PointerRoute;
}

/** The `Ui` this model reads: only whether the cursor shows. Where the cursor
 * is belongs to the geometry — a square for most games, a dot and an edge for
 * Loopy. */
export interface TargetVerbUi {
  cursor: { visible: boolean };
}

/**
 * The common geometry: a grid of squares, `size(state)` of them, inset by
 * `border` pixels, whose target is the square `{ x, y }` and whose cursor sits
 * on one. `wrap` makes the arrows wrap at the edges, which Singles' cursor does.
 *
 * A "square" is a tile-sized catchment, not necessarily a drawn cell: Twiddle's
 * target is a block's center, so its inset grows with the block and `border`
 * reads the state.
 */
export function squareGrid<
  State,
  DrawState extends { readonly tileSize: number },
>(options: {
  size: (state: State) => Size;
  border: (tileSize: number, state: State) => number;
  wrap?: boolean;
}): TargetGeometry<State, { cursor: GridCursor }, DrawState, Point> {
  const inGrid = (s: State, x: number, y: number) => {
    const { w, h } = options.size(s);
    return x >= 0 && y >= 0 && x < w && y < h;
  };
  return {
    noun: "square",
    pointerTarget(s, ds, p) {
      const b = options.border(ds.tileSize, s);
      const x = Math.floor((p.x - b) / ds.tileSize);
      const y = Math.floor((p.y - b) / ds.tileSize);
      return inGrid(s, x, y) ? { x, y } : null;
    },
    pointAt(s, ds, t) {
      const b = options.border(ds.tileSize, s);
      const half = Math.floor(ds.tileSize / 2);
      return { x: b + t.x * ds.tileSize + half, y: b + t.y * ds.tileSize + half };
    },
    cursorTarget(s, ui) {
      const { x, y } = ui.cursor;
      return inGrid(s, x, y) ? { x, y } : null;
    },
    parkCursor(ui, t) {
      ui.cursor.x = t.x;
      ui.cursor.y = t.y;
    },
    moveCursor(s, ui, button) {
      const { w, h } = options.size(s);
      return moveCursor(ui.cursor, button, w, h, options.wrap ?? false);
    },
  };
}

type Verbs<S, U, D, T, M> = TargetVerbs<S, U, D, T, M>;

/** The verb a pointer button applies, named by its press or its release: what
 * a game's own release arm applies when a drag never left its target. */
export function buttonVerb<S, U, D, T, M>(
  v: Verbs<S, U, D, T, M>,
  button: number,
): TargetVerb<S, U, T, M> | null {
  if (button === LEFT_BUTTON || button === LEFT_RELEASE) return v.primary;
  if (button === RIGHT_BUTTON || button === RIGHT_RELEASE) return v.secondary ?? null;
  return null;
}

/** The model's press, for a game whose own arm takes the press (a drag game):
 * the cursor parks on the pressed target, hidden, so the keyboard carries on
 * from there. */
export function pressTarget<S, U extends TargetVerbUi, D, T, M>(
  v: Verbs<S, U, D, T, M>,
  ui: U,
  target: T,
): void {
  v.geometry.parkCursor(ui, target);
  ui.cursor.visible = false;
}

/** The verb a key applies at the cursor. */
function keyVerb<S, U, D, T, M>(v: Verbs<S, U, D, T, M>, button: number) {
  if (button === CURSOR_SELECT) return v.primary;
  if (button === CURSOR_SELECT2) return v.secondary ?? v.primary;
  for (const verb of [v.primary, v.secondary, ...(v.keyOnly ?? [])])
    if (verb?.keys?.some((k) => k.codes.includes(button))) return verb;
  return null;
}

/**
 * Interpret `button` through the model: a verb's move, `UI_UPDATE` when only
 * the cursor changed, or `null` when the button is not one the model binds or
 * did nothing. A game with arms of its own tries them first.
 */
export function interpretTargetVerbs<S, U extends TargetVerbUi, D, T, M>(
  verbs: Verbs<S, U, D, T, M>,
  state: S,
  ui: U,
  ds: D,
  p: Point,
  rawButton: number,
): M | UiUpdate | null {
  const button = stripModifiers(rawButton);
  const { geometry } = verbs;

  const pressed = isMouseDown(button) ? buttonVerb(verbs, button) : null;
  if (pressed) {
    const target = geometry.pointerTarget(state, ds, p, ui);
    if (target === null) return null;
    // Parking a hidden cursor changes nothing on screen, so only hiding a
    // shown one makes a press that applies nothing worth a repaint.
    const wasShown = ui.cursor.visible;
    pressTarget(verbs, ui, target);
    return pressed.apply(state, target, ui) ?? (wasShown ? UI_UPDATE : null);
  }

  if (isCursorMove(button))
    return geometry.moveCursor(state, ui, button) ? UI_UPDATE : null;

  const keyed = keyVerb(verbs, button);
  if (keyed) {
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    const target = geometry.cursorTarget(state, ui);
    return target === null ? null : keyed.apply(state, target, ui);
  }
  return null;
}

/**
 * The gesture that applies a button's verb at each of `targets`, `times`
 * presses apiece: what a hint step of a target-verb game asks the pointer for
 * (`Game.hintGesture`). A key-only verb's step asks for its route instead
 * ({@link routeGesture}).
 */
export function verbGesture<S, U, D, T, M>(
  verbs: Verbs<S, U, D, T, M>,
  state: S,
  ds: D,
  ui: U,
  targets: readonly T[],
  button: VerbButton = "primary",
  times = 1,
): PointerAction[] {
  const out: PointerAction[] = [];
  for (const t of targets) {
    const at = verbs.geometry.pointAt(state, ds, t, ui);
    for (let i = 0; i < times; i++) out.push(click(at, button));
  }
  return out;
}

/**
 * The clicks that make a hint step's move, one at each of `targets` in turn:
 * on each, the first button (left, then right) whose verb makes a move the
 * game's `hintKeepTrack` keeps on the step. That is the judge the midend plays
 * the gesture against, so the gesture completes the step or the hint walk
 * says why; and the moves are the verbs', so it cannot ask a button for what
 * the button does not do. A click judged to complete the step ends the
 * gesture.
 *
 * One click a target, because the midend refuses any move off the step, so a
 * target a button reaches only by cycling through a value the step does not
 * want cannot be played at all; a gesture that presses a target several times
 * over values the step accepts (Loopy's notes) is the game's own.
 *
 * The step is judged on a copy, since `hintKeepTrack` may shrink it, and the
 * verbs see a copy of the `Ui`, since a verb may keep a tally there. A target no button reaches is a
 * defect in the game's hint, and throws.
 */
export function verbClicks<S, U, D, T, M, H>(
  verbs: Verbs<S, U, D, T, M>,
  rules: {
    readonly executeMove: (state: S, move: M) => S;
    readonly hintKeepTrack: (
      move: M,
      step: HintStep<M, H>,
      state: S,
    ) => HintTrackVerdict;
  },
  state: S,
  ui: U,
  ds: D,
  step: HintStep<M, H>,
  targets: readonly T[],
): PointerAction[] {
  // A copy of the step, carried from click to click as the midend's is: each
  // kept move may shrink its move and its highlights. A button is tried on a
  // copy of that, so only the kept move's shrinking carries.
  let judged: HintStep<M, H> = { ...step, move: structuredClone(step.move) };
  const scratch = structuredClone(ui);
  const out: PointerAction[] = [];
  let board = state;
  /** The first button whose verb on `target` the step keeps, with the step
   * as that click leaves it; `null` when neither does. */
  const kept = (target: T) => {
    for (const button of ["primary", "secondary"] as const) {
      const move = verbs[button]?.apply(board, target, scratch) ?? null;
      if (move === null || move === UI_UPDATE) continue;
      const trial = { ...judged, move: structuredClone(judged.move) };
      const verdict = rules.hintKeepTrack(move, trial, board);
      if (verdict !== "off") return { button, move, trial, verdict };
    }
    return null;
  };
  for (const target of targets) {
    const found = kept(target);
    if (found === null)
      throw new Error(`no button's verb keeps the step on ${JSON.stringify(target)}`);
    judged = found.trial;
    board = rules.executeMove(board, found.move);
    out.push(click(verbs.geometry.pointAt(state, ds, target, ui), found.button));
    if (found.verdict === "completed") return out;
  }
  return out;
}

/**
 * The pointer's route to a key-only verb's move at each of `targets`, as its
 * declaration says it (`repeat` or `notes`). A `cycle` route has no fixed
 * press count, so a game whose hint asks for one says how many presses reach
 * the result, with {@link verbGesture}. `notes` turns notes mode on first and
 * off after, through the Marks key, unless `notesOn` says it is on already;
 * `where` places the press on the target, where the route's `where` asks.
 */
export function routeGesture<S, U, D, T, M>(
  verbs: Verbs<S, U, D, T, M>,
  verb: KeyOnlyVerb<S, U, T, M>,
  state: S,
  ds: D,
  ui: U,
  targets: readonly T[],
  options: { notesOn?: boolean; where?: (at: Point) => Point } = {},
): PointerAction[] {
  const route = verb.pointer;
  switch (route.kind) {
    case "repeat":
      return verbGesture(verbs, state, ds, ui, targets, route.button, route.times);
    case "cycle":
      throw new Error(`a cycle route has no fixed press count (${verb.does})`);
    case "notes": {
      const place = options.where ?? ((at: Point) => at);
      const presses = targets.map((t) =>
        click(place(verbs.geometry.pointAt(state, ds, t, ui)), route.button),
      );
      if (options.notesOn) return presses;
      return [key(PENCIL_MODE_BUTTON), ...presses, key(PENCIL_MODE_BUTTON)];
    }
  }
}

/** The end of a key-only verb's sentence, saying the pointer's route. */
function routeWords(route: PointerRoute): string {
  const click = route.button === "primary" ? "click" : "right-click";
  switch (route.kind) {
    case "repeat":
      return `, or ${click} it ${route.times === 2 ? "twice" : `${route.times} times`}`;
    case "cycle":
      return `; ${click}ing it round gets there too`;
    case "notes":
      return `, or, in notes mode, ${click} ${route.where ?? "it"}`;
  }
}

/** "Enter", "Space (or I)": a select key and the verb's own keys. */
function keyNames(select: string, verb: { readonly keys?: readonly VerbKey[] }) {
  const own = (verb.keys ?? []).map((k) => k.name);
  return own.length === 0 ? select : `${select} (or ${own.join(" or ")})`;
}

/**
 * The Controls paragraph the declaration promises, as markdown. A help page
 * writes {@link CONTROLS_PLACEHOLDER} where it goes and adds, after it, only
 * what the game does beyond its verbs.
 */
export function controlsMarkdown<S, U, D, T, M>(verbs: Verbs<S, U, D, T, M>): string {
  const noun = verbs.geometry.noun;
  const a = /^[aeiou]/i.test(noun) ? "an" : "a";
  const pointer = [`Click ${a} ${noun} to ${verbs.primary.does}.`];
  if (verbs.secondary)
    pointer.push(
      `Right-click it (on a touch screen, a long press) to ${verbs.secondary.does}.`,
    );

  const keyboard = verbs.secondary
    ? `${keyNames("Enter", verbs.primary)} does what a click does to the ${noun} ` +
      `under it, and ${keyNames("Space", verbs.secondary)} what a right-click does.`
    : `${keyNames("Enter or Space", verbs.primary)} does what a click does to the ` +
      `${noun} under it.`;
  const keyOnly = (verbs.keyOnly ?? [])
    .map(
      (v) =>
        ` Press ${v.keys.map((k) => k.name).join(" or ")} to ${v.does}` +
        `${routeWords(v.pointer)}.`,
    )
    .join("");
  return (
    `${pointer.join(" ")}\n\n` +
    `With the keyboard, the arrow keys move a cursor around the grid. ` +
    `${keyboard}${keyOnly}`
  );
}

/** Where a help page's generated Controls paragraph goes. */
export const CONTROLS_PLACEHOLDER = "{{controls}}";
