/**
 * The note-taking cell: the input mechanic the pencil-mark games share.
 *
 * The mechanic the player operates is one design — *highlight a cell, type a
 * value into it, pencil candidate marks in it* — and Abcd, Crossing, Group,
 * Keen, Mathrax, Salad, Seismic, Solo, Towers, Undead and Unequal each carried
 * their own copy of it (`jscpd`: 514 duplicated lines across their `index.ts`
 * files, 2026-09-05).
 *
 * WHAT LIVES HERE is only what would have to change in every copy at once to
 * keep them correct, by [`border-grid.ts`](./border-grid.ts)'s test: what a
 * left and a right press do to the highlight, how the fork's sticky pencil mode
 * behaves, the rule that a pointer press hands the cursor's provenance back to
 * the mouse — and the highlight's *picture*, which each game drew for itself
 * until five of them had drifted into four different colors for it.
 *
 * WHAT DOES NOT live here is everything about the *puzzle*. Each game keeps its
 * own coordinate mapping, its own symbol vocabulary (digits, letters past nine,
 * circles and crosses, ghosts and vampires), its own `Move` type — the shared
 * code reports what the press did to the highlight and never a move, exactly as
 * `border-grid.ts` reports an edge and never one — and everything it layers on
 * top: Crossing's across/down flip, Group's multifill anchors, Undead's count
 * blocks, Towers' 3D tower-top hit retarget.
 *
 * The two things a game genuinely answers for itself arrive as {@link CellEntry}:
 * *may the player type into this cell* and *may it carry pencil marks*. Each
 * game spells those predicates its own way — `immutable`, a flag bit,
 * `!walls[i]`, a clue ring, "is it still empty" — and that is a real difference
 * about the puzzle.
 *
 * WHAT WAS EVALUATED AND DECLINED, recorded so it is not re-proposed each time.
 * `jscpd` still reports a ~28-line clone between Keen, Solo, Towers and
 * Unequal's entry blocks. It is the *move literal* —
 * `{ type: "set", x, y, n, pencil, autoElim }` — plus the two predicates around
 * it that read each game's own `grid` and `pencil` arrays. Lifting it would mean
 * a shared `Move`, and a shared move type couples save formats that have no
 * reason to be identical. The remaining duplication is four games agreeing about
 * their own data, which is where the line is.
 */

import { type GameDrawing, UI_UPDATE, type UiUpdate } from "./game.ts";
import {
  CURSOR_SELECT,
  type GridCursor,
  LEFT_BUTTON,
  LEFT_RELEASE,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "./pointer.ts";
import type { Rect } from "./types.ts";

/**
 * The three `Ui` fields the mechanic owns. A game's `Ui` structurally satisfies
 * this by carrying them; there is no base class and no wrapper object, so a
 * game's own fields sit beside these untouched.
 *
 * `pencilSticky` is optional because Group does not offer the preference; a
 * game without the field reads as non-sticky, so nothing here keeps an
 * exemption roster.
 */
export interface NoteTakingUi {
  cursor: GridCursor;
  /** Typing enters a pencil mark rather than a value. */
  pencilMode: boolean;
  /** The keyboard revealed or moved the highlight, so an entry keeps it. */
  cursorFromKeyboard: boolean;
  /** The fork's CapsLock-style pencil toggle, where the game offers it. */
  pencilSticky?: boolean;
  /** Keep the mouse highlight through a pencil change, where the game offers
   * the preference. See {@link releaseHighlightAfterEntry} for why its absence
   * reads as `true`. */
  pencilKeepHighlight?: boolean;
}

/** What the game says about the cell under the press. */
export interface CellEntry {
  /** May the player type a value into it? A given, a wall or a clue says no. */
  canEnter: boolean;
  /** May it carry pencil marks? Universally "and it is still empty", but
   * "empty" is the game's own word. */
  canMark: boolean;
}

/**
 * What a press did to the highlight. `"moved"` means it is now on the pressed
 * cell — shown or hidden — which is what a game layering something on the
 * selection needs to know (Crossing snaps its across/down direction, Group
 * resets its multifill anchors). `"unmoved"` covers both a press that put the
 * highlight away and a sticky toggle that deliberately left it alone: what
 * those share, and all a caller cares about, is that the highlight is not on
 * the pressed cell.
 *
 * A button the mechanic does not own comes back as **`null`**, not as a third
 * word, so the common caller — *"did you take this press?"* — is a plain truth
 * test that cannot misfire. A string sentinel there would be truthy, and every
 * caller would report a repaint for every button on the keyboard.
 * `interpretMove` spells "not mine" the same way.
 */
export type NoteTakingPress = "moved" | "unmoved";

/** Is the highlight showing on this cell right now? The mechanic's own notion
 * of "you pressed the cell you already had", exported because a game that acts
 * on a re-press (Crossing's crossword flip) has to agree with it. */
export function highlightIsOn(ui: NoteTakingUi, x: number, y: number): boolean {
  return ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y;
}

/**
 * Apply a pointer press to the highlight, so a caller reads:
 *
 * ```ts
 * if (inGrid(w, tx, ty) && pressNoteTakingCell(ui, button, tx, ty, entryAt(tx, ty)))
 *   return UI_UPDATE;
 * ```
 *
 * Every press it handles is a repaint, because the highlight is part of the
 * frame even when the press changed nothing else.
 *
 * Two rules:
 *
 * **A press moves the highlight to the pressed cell**, even onto a cell that
 * cannot take what the press offers. A pointer press takes the board over
 * (`docs/games/input.md`), which is only true if the highlight goes where the
 * player pointed; and the position matters even while hidden, because the next
 * arrow key resumes from it.
 *
 * **The highlight is shown only where the mode it is in could write** — against
 * `canMark` in pencil mode and `canEnter` otherwise, so a left press in sticky
 * pencil mode onto a filled cell does not light a highlight no keystroke could
 * act on. The same rule keeps a given from being left highlighted.
 *
 * The single carve-out is the sticky toggle, which says why at its branch.
 */
export function pressNoteTakingCell(
  ui: NoteTakingUi,
  button: number,
  x: number,
  y: number,
  cell: CellEntry,
): NoteTakingPress | null {
  return applyPress(ui, button, x, y, cell, highlightIsOn(ui, x, y));
}

/**
 * The rules themselves, with *"is the highlight already on the thing being
 * pressed?"* handed in rather than asked.
 *
 * The one argument is the whole reason this is a separate function: a click and
 * a tap answer that question from different places — the cursor for a click,
 * the game's own selection for a tap — and everything after it must be the same
 * code rather than the same intent. See {@link tapNoteTakingCell}.
 */
function applyPress(
  ui: NoteTakingUi,
  button: number,
  x: number,
  y: number,
  cell: CellEntry,
  onHighlight: boolean,
): NoteTakingPress | null {
  const primary = button === LEFT_BUTTON;
  if (!primary && button !== RIGHT_BUTTON) return null;

  const sticky = ui.pencilSticky ?? false;
  ui.cursorFromKeyboard = false;

  if (!primary && sticky) {
    // The CapsLock-style toggle is a *mode switch*, not a selection, so a press
    // on a cell that could take no mark leaves the highlight exactly where it
    // was. Moving or hiding it would make the mode key double as a selection
    // key, which is the confusion sticky mode exists to remove.
    ui.pencilMode = !ui.pencilMode;
    if (!cell.canMark) return "unmoved";
  } else if (onHighlight && (primary ? sticky || !ui.pencilMode : ui.pencilMode)) {
    // A repeat press puts the highlight away. The left button's exception is
    // that its *other* job is dropping back to real entry, and there is nothing
    // else to press for that — so without sticky mode, pressing a
    // pencil-selected cell re-selects it for ink instead of deselecting it.
    ui.cursor.visible = false;
    return "unmoved";
  } else if (primary) {
    if (!sticky) ui.pencilMode = false;
  } else {
    ui.pencilMode = true; // upstream's per-cell pencil select
  }

  ui.cursor.x = x;
  ui.cursor.y = y;
  ui.cursor.visible = ui.pencilMode ? cell.canMark : cell.canEnter;
  return "moved";
}

// --- the select-or-drag gesture ---------------------------------------------
//
// Rome and Map spend the pointer press on a drag, so their press cannot be the
// selection: it is not yet known to be one. **A press that may become a drag
// therefore commits to nothing at all** — it leaves the highlight showing
// exactly where it was, and the selection changes when the gesture resolves,
// through one of the two arms below.
//
// That is a rule and not an implementation detail, and the reason is the sticky
// toggle rather than anything about the highlight. With sticky pencil mode on,
// the right button's press arm *switches the mode*, and in both games the right
// button also starts a mark drag. A press that ran the arm would flip the mode
// on the way into every right-drag. So the rules run at the release; and once
// they do, the release needs two facts about the selection *before the press* —
// whether the tap landed on what was already selected, and where to leave a
// highlight the mode switch must not move — which a press that had hidden or
// moved the highlight has already destroyed.
//
// The two differences a player could see, before `own-the-select-or-drag-gesture`
// took the gesture off the games, were both that press: a repeat tap re-selected
// for ever, and a sticky right tap on something that could take no mark hid the
// highlight instead of leaving it alone. `select-or-drag.test.ts` holds every
// member to one answer, driving each game's own `interpretMove`.

/** What a tap selects. */
export interface TapTarget {
  /** Where the highlight goes, in the game's own cell coordinates. */
  x: number;
  y: number;
  /**
   * Is the highlight already on the thing being tapped?
   *
   * **Left out, the cell is the selection** and the arm answers for itself with
   * {@link highlightIsOn}, which is what a game whose selection is a cell
   * wants and the only thing it should have to say.
   *
   * Supplied, the game's selection is something else and only the game can
   * compare two of them: Map selects a *region*, and answers
   * `ui.cursor.visible && regionFromUiCursor(map, ui) === r`. Handing the arm
   * the cell under the finger instead would make two taps on different cells of
   * one region read as two different selections.
   */
  onSelection?: boolean;
}

/**
 * A release that committed nothing, so the gesture was a **tap** — and a tap is
 * a press. It resolves through exactly the rules {@link pressNoteTakingCell}
 * runs for a click-select game, with the button the gesture used.
 *
 * ```ts
 * if (nothingCommitted)
 *   return tapNoteTakingCell(ui, button, { x, y }, entryAt(x, y)) !== null
 *     ? UI_UPDATE : null;
 * ```
 *
 * The button arrives as the *release* — `LEFT_RELEASE` or `RIGHT_RELEASE` —
 * because that is what the game is holding; mapping it back to the press it
 * belongs to is this arm's job, and was a line both games had copied.
 */
export function tapNoteTakingCell(
  ui: NoteTakingUi,
  releaseButton: number,
  tap: TapTarget,
  cell: CellEntry,
): NoteTakingPress | null {
  const button =
    releaseButton === RIGHT_RELEASE
      ? RIGHT_BUTTON
      : releaseButton === LEFT_RELEASE
        ? LEFT_BUTTON
        : releaseButton;
  return applyPress(
    ui,
    button,
    tap.x,
    tap.y,
    cell,
    tap.onSelection ?? highlightIsOn(ui, tap.x, tap.y),
  );
}

/**
 * A release that committed a move, so the gesture was a **drag**: an entry made
 * with the pointer, on the cell `(x, y)` the player acted on.
 *
 * The highlight goes there and then away, which is the two rules a click-select
 * game already states for its own entries — {@link pressNoteTakingCell}'s "a
 * press moves the highlight to the cell the player pointed at, so the next
 * arrow key resumes from it", and {@link releaseHighlightAfterEntry}'s "an
 * entry the pointer made puts the highlight away" — said for a gesture instead
 * of for a keystroke.
 *
 * A game whose cursor carries more than a cell (Map's names a region by a cell
 * plus a quadrant) places its own first; the two facts this states are the same
 * either way.
 */
export function dragEnteredNoteTakingCell(
  ui: NoteTakingUi,
  x: number,
  y: number,
): void {
  ui.cursor.x = x;
  ui.cursor.y = y;
  ui.cursor.visible = false;
  ui.cursorFromKeyboard = false;
}

/**
 * The keys that toggle pencil mode: Enter while the highlight shows, and the
 * Marks key ({@link PENCIL_MODE_BUTTON}) at any time, since a touch player
 * pressing it has usually just tapped a cell rather than revealed a keyboard
 * highlight.
 *
 * Only Enter counts as the keyboard taking the highlight over; the Marks key
 * leaves its provenance alone, so an entry after a tap still puts a mouse
 * highlight away as {@link releaseHighlightAfterEntry} says.
 */
export function toggleNoteTakingMode(
  ui: NoteTakingUi,
  button: number,
): UiUpdate | null {
  if (button === CURSOR_SELECT && ui.cursor.visible) ui.cursorFromKeyboard = true;
  else if (button !== PENCIL_MODE_BUTTON) return null;
  ui.pencilMode = !ui.pencilMode;
  return UI_UPDATE;
}

// --- what a symbol entry does to the highlight ------------------------------
//
// The *decoding* of a keystroke is each game's own — digits to `w`, letters
// past nine, circles and crosses, ghosts and vampires — and so is the predicate
// that decides whether a write is a no-op, because it reads that game's grid
// and marks. What is shared is only what happens to the **highlight**, which is
// where the fork's two pencil preferences meet the keyboard.

/**
 * What `interpretMove` should return for a keystroke that would write what is
 * already there.
 *
 * Not simply `null`: a mouse-driven entry still puts the highlight away, so
 * there is a frame to repaint even though the board did not move.
 */
export function noOpEntryResult(ui: NoteTakingUi): UiUpdate | null {
  if (ui.cursorFromKeyboard) return null;
  ui.cursor.visible = false;
  return UI_UPDATE;
}

/**
 * Put the highlight away after a real entry — unless the keyboard is driving
 * it, or this was a pencil change the player asked to keep the highlight
 * through.
 *
 * **A missing `pencilKeepHighlight` reads as `true`**, so a game that does not
 * declare the preference still inherits the right behavior. Keeping it is the
 * better default: entering two or three candidates in a row is the ordinary
 * case with a mouse, and re-clicking between each is the annoyance the
 * preference exists to remove.
 */
export function releaseHighlightAfterEntry(ui: NoteTakingUi): void {
  if (ui.cursorFromKeyboard) return;
  if (ui.pencilMode && (ui.pencilKeepHighlight ?? true)) return;
  ui.cursor.visible = false;
}

// --- the picture ------------------------------------------------------------
//
// One picture in every game, because the player learns it once: the whole cell
// washed when typing enters a value, and a triangle in its top-left corner when
// typing enters a note. Where a keyboard or a mouse put the highlight makes no
// difference to it.
//
// The wash is `highlightWash` of the board's background, which each game places
// at its own palette index and passes in; `note-taking-cell-render.test.ts`
// holds every member to that color.

/** The highlight is not on this cell. */
export const HIGHLIGHT_NONE = 0;
/** The highlight is on this cell, and typing enters a value. */
export const HIGHLIGHT_ENTRY = 1;
/** The highlight is on this cell, and typing enters a note. */
export const HIGHLIGHT_NOTES = 2;
/** Two bits, so a game packs it into its tile key: the tile must repaint when
 * the highlight arrives, changes mode or leaves, and the key is what says so. */
export type CellHighlight =
  | typeof HIGHLIGHT_NONE
  | typeof HIGHLIGHT_ENTRY
  | typeof HIGHLIGHT_NOTES;

/** What the highlight shows on cell `(x, y)` right now. A game that hides it
 * for its own reasons — a completion flash — passes `HIGHLIGHT_NONE` instead. */
export function cellHighlight(ui: NoteTakingUi, x: number, y: number): CellHighlight {
  if (!highlightIsOn(ui, x, y)) return HIGHLIGHT_NONE;
  return ui.pencilMode ? HIGHLIGHT_NOTES : HIGHLIGHT_ENTRY;
}

/** The color a cell's background is filled with: the wash under an entry
 * highlight, the game's own background otherwise. Exported for the game that
 * paints more of the cell than its rect (Towers' 3D faces). */
export function highlightFill(
  highlight: CellHighlight,
  wash: number,
  background: number,
): number {
  return highlight === HIGHLIGHT_ENTRY ? wash : background;
}

/**
 * Paint a cell's background with its highlight: `rect` in the wash or in
 * `background`, then, for a note highlight, the corner triangle over it.
 *
 * The triangle's legs are half of `rect`, from `rect`'s own corner, so a game
 * whose cell reaches into the gutter it shares with a neighbor (Solo's blocks,
 * Keen's cages) gets a triangle in proportion to what it painted. It is part of
 * the *background*: a clue or a mark drawn afterwards sits on top of it, which
 * is how Keen's cage label in that same corner stays readable.
 */
export function drawCellBackground(
  dr: GameDrawing,
  rect: Rect,
  highlight: CellHighlight,
  wash: number,
  background: number,
): void {
  dr.drawRect(rect, highlightFill(highlight, wash, background));
  if (highlight !== HIGHLIGHT_NOTES) return;
  const { x, y } = rect;
  dr.drawPolygon(
    [
      { x, y },
      { x: x + Math.floor(rect.w / 2), y },
      { x, y: y + Math.floor(rect.h / 2) },
    ],
    wash,
    wash,
  );
}
