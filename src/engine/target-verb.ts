/**
 * The target-verb input model: the player aims at a target — a square, an
 * edge, a gutter cell — and each button applies a verb there. The left button
 * and Enter at the cursor apply one verb, the right button and Space another,
 * and the middle button a third where the game has one.
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

import { UI_UPDATE, type UiUpdate } from "./game.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  type GridCursor,
  isCursorMove,
  LEFT_BUTTON,
  MIDDLE_BUTTON,
  moveCursor,
  RIGHT_BUTTON,
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

/** One thing a button does to a target. */
export interface TargetVerb<State, Target, Move> {
  /** What the verb does, as the Controls paragraph completes "Click a square
   * to …": `"place or remove a light"`. */
  readonly does: string;
  /** Further keys that apply this verb at the cursor. */
  readonly keys?: readonly VerbKey[];
  /** The move this verb makes at `target`, or `null` where it means nothing
   * there (a clue square, a light on a dot). */
  apply(state: State, target: Target): Move | null;
}

/**
 * Where the player aims. `pointerTarget` and `cursorTarget` must agree on what
 * a target is, since the guard compares a press on one with a select on the
 * other.
 */
export interface TargetGeometry<State, Ui, DrawState, Target> {
  /** What a target is called in the Controls paragraph: `"square"`. */
  readonly noun: string;
  /** The target a press at `p` addresses, or `null` for none. */
  pointerTarget(state: State, ds: DrawState, p: Point): Target | null;
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
  readonly primary: TargetVerb<State, Target, Move>;
  /** The right button, and Space at the cursor. A game without one takes
   * Space as a second Enter. */
  readonly secondary?: TargetVerb<State, Target, Move>;
  /** The middle button. No select key reaches it; a game binds it a key
   * through `keys`. */
  readonly middle?: TargetVerb<State, Target, Move>;
}

/** The `Ui` this model reads: the collection's shared cursor. */
export interface TargetVerbUi {
  cursor: GridCursor;
}

/**
 * The common geometry: a grid of squares, `size(state)` of them, inset by
 * `border` pixels, whose target is the square `{ x, y }` and whose cursor sits
 * on one. `wrap` makes the arrows wrap at the edges, which Singles' cursor does.
 */
export function squareGrid<
  State,
  DrawState extends { readonly tileSize: number },
>(options: {
  size: (state: State) => Size;
  border: (tileSize: number) => number;
  wrap?: boolean;
}): TargetGeometry<State, TargetVerbUi, DrawState, Point> {
  const inGrid = (s: State, x: number, y: number) => {
    const { w, h } = options.size(s);
    return x >= 0 && y >= 0 && x < w && y < h;
  };
  return {
    noun: "square",
    pointerTarget(s, ds, p) {
      const b = options.border(ds.tileSize);
      const x = Math.floor((p.x - b) / ds.tileSize);
      const y = Math.floor((p.y - b) / ds.tileSize);
      return inGrid(s, x, y) ? { x, y } : null;
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

/** The verb a pointer button applies. */
function pointerVerb<S, U, D, T, M>(v: Verbs<S, U, D, T, M>, button: number) {
  if (button === LEFT_BUTTON) return v.primary;
  if (button === RIGHT_BUTTON) return v.secondary ?? null;
  if (button === MIDDLE_BUTTON) return v.middle ?? null;
  return null;
}

/** The verb a key applies at the cursor. */
function keyVerb<S, U, D, T, M>(v: Verbs<S, U, D, T, M>, button: number) {
  if (button === CURSOR_SELECT) return v.primary;
  if (button === CURSOR_SELECT2) return v.secondary ?? v.primary;
  for (const verb of [v.primary, v.secondary, v.middle])
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

  const pressed = pointerVerb(verbs, button);
  if (pressed) {
    const target = geometry.pointerTarget(state, ds, p);
    if (target === null) return null;
    // Parking a hidden cursor changes nothing on screen, so only hiding a
    // shown one makes a press that applies nothing worth a repaint.
    const wasShown = ui.cursor.visible;
    geometry.parkCursor(ui, target);
    ui.cursor.visible = false;
    return pressed.apply(state, target) ?? (wasShown ? UI_UPDATE : null);
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
    return target === null ? null : keyed.apply(state, target);
  }
  return null;
}

/** "Enter", "Space (or I)": a select key and the verb's own keys. */
function keyNames(select: string, verb: TargetVerb<unknown, unknown, unknown>) {
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
  if (verbs.middle) pointer.push(`Middle-click it to ${verbs.middle.does}.`);

  const primary = verbs.primary as TargetVerb<unknown, unknown, unknown>;
  const keyboard = verbs.secondary
    ? `${keyNames("Enter", primary)} does what a click does to the ${noun} ` +
      `under it, and ${keyNames(
        "Space",
        verbs.secondary as TargetVerb<unknown, unknown, unknown>,
      )} what a right-click does.`
    : `${keyNames("Enter or Space", primary)} does what a click does to the ` +
      `${noun} under it.`;
  const middleKeys = verbs.middle?.keys ?? [];
  const middle =
    middleKeys.length === 0
      ? ""
      : ` ${middleKeys.map((k) => k.name).join(" or ")} does what a middle-click does.`;
  return (
    `${pointer.join(" ")}\n\n` +
    `With the keyboard, the arrow keys move a cursor around the grid. ` +
    `${keyboard}${middle}`
  );
}

/** Where a help page's generated Controls paragraph goes. */
export const CONTROLS_PLACEHOLDER = "{{controls}}";
