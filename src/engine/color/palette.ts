/**
 * **What a color means** — the collection's shared roles, defined over the named
 * colors in [`colors.ts`](./colors.ts).
 *
 * Two layers, because they answer different questions. *"Which twelve colors are
 * mutually distinguishable"* is a design about the set, and lives in `colors.ts`.
 * *"What should an error look like"* is a decision that should be made once and
 * followed everywhere, and lives here — as a **reference**, so that restyling red
 * restyles every meaning built on red, and so that a role can never quietly become
 * a color of its own again.
 *
 * A game references a **meaning**. It reaches past this file to a named color
 * only where the color *is* the meaning: a member of a set whose job is to be
 * told apart from the other members, or a color the game names to the player.
 *
 * [`color-mkhighlight.ts`](./color-mkhighlight.ts) owns *structural* color (a
 * game's background and its bevel highlight/lowlight trio).
 * [`palette-games.ts`](./palette-games.ts) holds what is left: the colors a game
 * defines **relative to its own board**, which have no value to author because
 * they are functions.
 *
 * These are color *values*, so they do not carry the `COL_` prefix, which
 * throughout the codebase means a palette **index**: a game imports `ERROR` and
 * assigns it to its own `COL_ERROR` slot.
 *
 * ## Absolute vs background-derived
 *
 * A role is a named color when its job is to be unmistakable regardless of the
 * board, and a **function of the frontend background** when it must stay legible
 * *against* the board. That second form is not a stylistic preference: in dark
 * mode `puzzle/components/view.ts` hands the engine **pure white** as the default
 * background (because upstream games derive colors as `background × 0.9`),
 * `resolvePalette` shifts it to a light gray so every game's board sits at one
 * tone, and the returned palette is adapted afterwards — so a fixed pale color
 * that reads correctly in light mode can land on top of the background in dark
 * mode, as Spokes' pure-white `COL_DONE` once did.
 */

import type { Color } from "../types.ts";
import { divide, mix, scale, token } from "./color-token.ts";
import {
  BLUE,
  BLUE_WASH,
  GRAY,
  GRAY_BOLD,
  GREEN,
  PINK,
  RED,
  RED_WASH,
  TEAL_BOLD,
  TEAL_WASH_QUIET,
  TWO,
  TWO_WASH,
  YELLOW,
} from "./colors.ts";

// --- ink and paper ----------------------------------------------------

/**
 * Maximum-contrast foreground: grid lines, outlines, glyphs, body text, and the
 * black half of a two-color game.
 *
 * Not the {@link BLACK} color, despite being the same value: this is *contrast
 * against the surface*, so it must invert in dark mode or text ends up darker
 * than the tile it is drawn on. A game object that **is** black imports `BLACK`.
 */
export const INK: Color = [0, 0, 0];

/** Maximum-contrast background: a white tile, a white-marked cell, the flash
 * frame. The counterpart to {@link INK}, and likewise not {@link WHITE}. */
export const PAPER: Color = [1, 1, 1];

/** A mid-gray line, for a mark that should recede rather than carry the
 * drawing. The line between two cells of a surface is {@link surfaceGrid}. */
export const GRID_MID: Color = GRAY;

/** A grid line dark enough to survive a board made mostly of *dark cells* —
 * Pattern, Pearl's white pearls, Spokes' hub outline, Crossing's walls.
 * {@link GRID_MID} would be swallowed by the cells it separates. */
export const GRID_DARK: Color = GRAY_BOLD;

/**
 * **Ruled out** — the small cross or dot a player puts down to say "nothing
 * goes here".
 *
 * Full contrast, because the mark is thin and a player scans the whole board
 * for it: in the gray of Tracks' rails, or the fixed black of a wall or a
 * pearl, it sank into a dark-mode board. It is {@link INK} and not `BLACK`
 * because it is contrast against the board, so it inverts with the scheme.
 *
 * A *whole-edge* "no line" (Loopy, Palisade, Separate, Dominosa) is not this
 * mark: it is drawn along the edge the loop or wall would take, and is meant to
 * recede behind the lines the player did draw (`lineNoColor`).
 */
export const RULED_OUT: Color = INK;

// --- what the player is doing right now --------------------------------

/**
 * **The keyboard cursor.** Green by default, because on a board of grays,
 * blacks and whites — which is most of them — green is the hue least likely to
 * be spoken for. A game whose board *has* spent green reaches past this for a
 * named color and says why at the assignment (`palette-departures.test.ts`).
 *
 * Two corollaries:
 *
 * - **This is a *mark*** — a ring, an outline, a line, a disc. A cursor that
 *   *fills a cell under the cell's own content* (Solo's family, Bridges,
 *   Mathrax, Magnets, Pearl) is {@link highlightWash}, the "you are here"
 *   wash, because a saturated green fill under a digit or a pearl shouts and
 *   hides what it is pointing at.
 * - **When green is spent, the second choice is `PURPLE`** — several games
 *   answer the same collision the same way, so a purple cursor reads as "the
 *   cursor, on a board that uses green" rather than as a sixth color to
 *   learn. Not on a board of pieces, where purple is a piece ({@link SHADED},
 *   `TWO`).
 */
export const CURSOR: Color = GREEN;

/**
 * **You have picked this up** — the island a bridge is being drawn from, the hub
 * a spoke is being dragged from, the square a link starts at.
 */
export const HELD: Color = GREEN;

/** **You are dragging this on** / **off** — the two states of a drag that lays
 * or erases something continuously (Pearl's lines, Tracks' track, Rectangles'
 * rectangles). The pair is one meaning: laying is the color, erasing is the
 * same color as a wash, so the board underneath still reads through it.
 *
 * `DRAG_ADD` also dresses the *aim* drag's preview — the arrows Galaxies shows
 * on the pair a release would associate: the same meaning ("let go and this is
 * laid") under a different drag model. It must be an **authored** color, not a
 * board-relative tint, because an affordance the player is steering by has to
 * be prominent in *both* schemes, and a tint of the board is by construction
 * prominent in neither. */
export const DRAG_ADD: Color = BLUE;

/** @see DRAG_ADD */
export const DRAG_REMOVE: Color = BLUE_WASH;

// --- errors and mistakes ----------------------------------------------

/**
 * Something is **wrong**: a rule the board breaks as you play, or a cell that
 * `findMistakes` has proved contradicts the unique solution.
 *
 * One role under several slot names — `COL_ERROR`, `COL_MISTAKE`, `COL_WRONG`,
 * `COL_NUM_ERROR`, `COL_ERRORDIST` — because upstream names it per game. The
 * names stay; the value comes from here.
 */
export const ERROR: Color = RED;

/** Text drawn *on* an error fill, where {@link INK} would be unreadable. */
export const ERROR_TEXT: Color = PAPER;

/**
 * A **red fill behind content that must stay readable** — the fill counterpart to
 * {@link ERROR}'s stroke, in the same way {@link HINT_EVIDENCE_WASH} is the fill
 * counterpart to {@link HINT_EVIDENCE}. Filling's `COL_ERROR`, Mathrax's and Rome's
 * `COL_ERRORBG`, Mines' contradicted count.
 *
 * A named color rather than a function of the background, because `RED_WASH`
 * already follows the board's brightness: light in light mode, dark in dark.
 */
export const ERROR_WASH: Color = RED_WASH;

// --- hints ------------------------------------------------------------

/**
 * The thing the deduction acts on, drawn *on* the board: the **ring** around the
 * acted-on cell, a forced edge, a line, a mark.
 *
 * **There is deliberately no fill counterpart, and its absence is the rule**: a
 * hint mark goes *beside* content, never behind it. A fill for this role has no
 * working value at all — it scores 1.91:1 against a pencil mark in light and
 * 1.96:1 in dark, and a joint search over both hint roles, every hue and both
 * schemes returns no feasible arrangement, because the pale end of a
 * twelve-color palette holds exactly one cool wash and the evidence has it. Do
 * not add one back: ringing the cell removes the constraint rather than trading
 * it, which is why this role has the *emphatic* blue and not a pale one.
 * `hint-mark.ts` is the mechanism; `docs/games/hints.md` § "Shade vs ring" is the
 * rule.
 */
export const HINT_ACTION: Color = BLUE;

/**
 * The *evidence* a deduction rests on — the row, region or area the hint is
 * reasoning from, rather than the cell it is acting on — **drawn as a mark**: the
 * region's outline, and the small ordinal `drawHintOrdinal` puts in a chain
 * cell's corner to say where in the chain it falls.
 *
 * Those two are **one role, not two that agree**. The ordinal is not a fourth
 * hint color, it is an *index into the evidence*; a hue of its own would claim
 * the ordered cells were a different kind of premise from the unordered ones,
 * which is exactly what they are not. Giving them separate names that happen to
 * hold the same value is the coincidence this module's two-layer split exists to
 * prevent, because restyling one would silently fail to restyle the other.
 *
 * A **different hue** from {@link HINT_ACTION}, rather than a third shade of the
 * same blue. A hint often marks an evidence region and a target cell at once,
 * and two blues eight hundredths of a lightness apart are all but the same
 * color; the distinction the player actually needs — *this is what I am
 * reasoning from, that is what I am concluding* — survives a hue change and does
 * not survive a shade change.
 *
 * Teal's **bold** step, not its base. A line drawn *against* a board wants a step
 * whose lightness differs between schemes, and bold is the one defined that way
 * ("dark in light mode, light in dark mode"): it stands off the board by 0.48 /
 * 0.64, where the base sits at L 0.72 under both and comes out a soft line on a
 * pale board and a bright one on a dark board. `color-dark-check` measures
 * precisely that and flags the base.
 */
export const HINT_EVIDENCE: Color = TEAL_BOLD;

/**
 * The same "this is the evidence" meaning as a **fill**, for a game whose
 * evidence cells carry nothing the player has to read: Light Up's unlit
 * squares.
 *
 * A game reaching for this is claiming *nothing is drawn here*. Where content
 * does sit on the evidence, a wash loses whichever way it is tuned: pale enough
 * to read a derived foreground through, and it stops reading as a mark (it
 * measured **1.15:1 against its own board in dark mode** at the lightness that
 * legibility needed). An outline has no such trade-off.
 *
 * "Nothing is drawn here" excludes the game's content, not the hint's own marks:
 * the action ring often lands on this fill and has to win against it, which is
 * why the role takes teal's *quiet* wash — see {@link TEAL_WASH_QUIET}.
 */
export const HINT_EVIDENCE_WASH: Color = TEAL_WASH_QUIET;

/** A hint premise that refers to a **black/filled** reference cell, where the
 * hint needs to point at two kinds of evidence at once (Range, Light Up). */
export const HINT_BLACKREF: Color = GREEN;

/** The counterpart premise color, referring to a **white/empty** reference
 * cell. Distinct in hue from {@link HINT_BLACKREF} so the two premises are
 * never confused with each other, and not purple: that is {@link SHADED},
 * and an outline in the piece's color round a cell that holds no piece says
 * the opposite of what it cites. */
export const HINT_WHITEREF: Color = PINK;

// --- pencil marks -----------------------------------------------------

/** The body of the pencil-mode indicator glyph — a #2-pencil yellow. */
export const PENCIL_BODY: Color = YELLOW;

// --- background-derived roles -----------------------------------------

/**
 * A pencil mark — the candidate values a player has noted but not committed:
 * clearly *subordinate* to a placed digit, but still legible at the quarter-size
 * a pencil mark is drawn at.
 *
 * Darkening two channels and leaving blue strong is upstream's answer and a
 * good one — it reads as "a note" by hue rather than by contrast alone, so it
 * survives being small. Note it is deliberately **not** a neutral gray: a gray
 * at this lightness competes with the grid lines it sits between.
 *
 * Deeper than upstream's half-and-full, which was tuned to sit on the board
 * itself: a mark is drawn on {@link cellSurface} and on a selected cell
 * ({@link highlightWash}), both darker than the board, and there it measured
 * 2.6:1 and 1.9:1. This is 4.6:1 on a plain cell and 3.5:1 on a selected one,
 * and still a blue no one takes for {@link INK}.
 */
export function pencilColor(background: Color): Color {
  return [0.3 * background[0], 0.3 * background[1], 0.85 * background[2]];
}

/**
 * **The player put this here** — the digit, letter or arrow you entered, as
 * opposed to the clue the puzzle gave you (which is {@link INK}). The single most
 * important distinction in every entry game.
 *
 * Derived because it is a *foreground on the board*: the green tracks the
 * background's own brightness so it stays a readable glyph color rather than a
 * fixed green that the dark-mode pass has to rescue.
 */
export function playerEntryColor(background: Color): Color {
  return [0, 0.6 * background[1], 0];
}

/** A gently emphasized cell — the "you are here" / "this line is selected" wash
 * that must stay a *background*, not become a foreground: `COL_HIGHLIGHT` in
 * Solo's family and Filling.
 *
 * In the light scheme it is told from the cells round it **by hue**, a warm
 * tone a little below {@link cellSurface}, because lightness alone has no room
 * left: a gray far enough below the cell to be unmistakable swallows the
 * player's own digit ({@link playerEntryColor} is 1.4:1 on it). Warm, because
 * every glyph drawn on the cell is cool or neutral (ink, the green entry, the
 * blue pencil mark), and so is {@link REGION_DONE}, which Filling paints
 * beside a selected cell. */
export function highlightWash(background: Color): Color {
  // The dark value is authored so the cell sinks, as it does in the light
  // scheme. Derived, it rises to the lightness of `givenSurface`, and a
  // selected entry reads as a given. It sinks below `surfaceGrid` too, far
  // enough that the line beside a selected cell still shows.
  return token(
    [0.86 * background[0], 0.8 * background[1], 0.5 * background[2]],
    [0.01, 0.01, 0.01],
  );
}

/**
 * **Undecided**: an edge or line the player has explicitly marked as "I don't
 * know yet", distinct both from a drawn line and from an empty one. Loopy's
 * `COL_LINEUNKNOWN` and Palisade's and Separate's `COL_LINE_MAYBE`.
 *
 * A background-toned olive — the background's own brightness with blue removed,
 * so it reads as a *marked* edge without competing with a real line.
 *
 * **The dark value is authored, not derived**: derivation inverts the olive's
 * lightness and lands near the dark background, where the undecided edges are
 * almost invisible. A muted amber, clearly above a near-black background and
 * clearly below ink, is what the role wants there.
 */
export function lineMaybeColor(background: Color): Color {
  return token([0.9 * background[0], 0.9 * background[1], 0], [0.62, 0.54, 0.18]);
}

/**
 * **Ruled out**: an edge the player has marked as definitely *not* a line — the
 * sibling of {@link lineMaybeColor}, and used by the same three games (Loopy's
 * `COL_FAINT`, Palisade's and Separate's `COL_LINE_NO`).
 *
 * A mid gray in both schemes: clearly a step off the board, clearly not ink. A
 * tenth off the board (`background × 0.9`, as the ports first wrote it) reads as
 * *board*: on a dark board the edge could not be told from no edge, which
 * matters most to a keyboard player, whose cursor walks the edges and needs to
 * see where they are. Disabled still has to be *discernible*.
 *
 * Both values are authored rather than taken from the gray scale's named steps,
 * because neither step fits: `GRAY`'s dark base (L 0.44) sits a tenth above the
 * board, which is the faintness to avoid, and `GRAY_BOLD` (L 0.84) is nearly
 * ink. The light value stays a function of the board so it tracks a lighter or
 * darker host; the dark value is a fixed mid gray. Both clear
 * {@link REGION_DONE}, which Palisade and Separate paint under a finished
 * region, so a ruled-out edge across a completed region still shows.
 */
export function lineNoColor(background: Color): Color {
  return token(scale(background, 0.6), [0.5, 0.5, 0.5]);
}

// --- the surface pieces sit on ------------------------------------------

/**
 * **A cell that holds a piece, or will**: the quiet surface of a board whose
 * content is pieces (`engine/piece.ts`). A small step off the board, so the
 * grid reads as a field of cells and the color on the board is all content.
 *
 * Darker than the board in both schemes. The dark value is authored because
 * derivation inverts the step and would put the cell above the board, where a
 * given's lifted cell ({@link givenSurface}) has to go.
 */
export function cellSurface(background: Color): Color {
  return token(scale(background, 0.92), [0.15, 0.15, 0.15]);
}

/**
 * **The puzzle put this piece here**: the cell under a given, lifted toward
 * white from {@link cellSurface} so a given is told from the player's own
 * piece by the cell it sits on and the piece itself stays the same piece.
 */
export function givenSurface(background: Color): Color {
  return token(mix(background, PAPER, 0.6), [0.31, 0.31, 0.31]);
}

/**
 * **Shaded**: the piece in a cell the player has shaded, in a game where a
 * cell is shaded or is not. The two-state pair's first member, so a shaded
 * cell here and the first kind of piece in Unruly are one color; `piece.ts`
 * has its shape and its word.
 */
export const SHADED: Color = TWO[0];

/**
 * **A thing the player pushes or carries** to where it belongs: Sokoban's
 * barrel, the paint on Cube's squares. The pair's first member, as a placed
 * piece is, since it is the board's content and the player's to move. The
 * figure the player steers is not this: it is {@link CURSOR}'s green, "where
 * you are".
 */
export const MOVED: Color = TWO[0];

/**
 * **Where the player is going, or what they are after**: Sokoban's target,
 * Inertia's gem, Rome's goal. The pair's second member, so a board of this
 * kind shows both of the pair: the thing moved and the place it goes.
 */
export const GOAL: Color = TWO[1];

/** **The cell a {@link GOAL} is in**, where the goal is a place and content is
 * drawn on it. The wash of the pair's second member. */
export const GOAL_WASH: Color = TWO_WASH[1];

/**
 * **This region is finished and correct**: the surface of a region the player
 * has closed, in a game whose regions are the answer (Rect, Filling, Palisade,
 * Separate). A wash of the pair's first hue, so a finished board is colored by
 * the player's work and its numbers stay readable on it. A step of gray could
 * not be this: darker is a hole in the dark scheme, and lighter is a given's
 * lifted cell ({@link givenSurface}).
 */
export const REGION_DONE: Color = TWO_WASH[0];

/**
 * **The line between two cells of a surface**, thin and quiet: the grid is
 * where the cells are, and never the drawing.
 *
 * Darker than both surfaces in both schemes, so one line closes a plain cell
 * and a lifted one alike. {@link GRID_MID} cannot be it: in the dark scheme it
 * sits on the lifted cell's own lightness, and the line beside a given
 * vanishes.
 */
export function surfaceGrid(background: Color): Color {
  return token(scale(background, 0.66), [0.06, 0.06, 0.06]);
}

// --- the solved flash ---------------------------------------------------

/**
 * **Solved** — the fill or line color a board flashes to when the player
 * completes it. A solved board lights up rather than dims.
 *
 * {@link PAPER} rather than {@link WHITE}: the flash is *maximum contrast
 * against the surface*, so it inverts with the scheme and stays a visible step
 * off the board. A game whose flash is an animation rather than a color — a
 * bevel wave, a state swap, a color cycle — does not use this; a game whose
 * flash is a wash under text (Solo's family) uses {@link highlightWash}.
 */
export const FLASH: Color = PAPER;

/**
 * **This clue is used up** — a row count, column count or clue number the board
 * has already satisfied, grayed back so the player's eye skips it and lands on
 * the clues that still have work in them.
 *
 * Upstream's `background / 1.5`, Magnets', Towers' and Undead's `COL_DONE`. Not
 * {@link REGION_DONE}: that one colors an area of the board as correct,
 * this one retires a clue in the margin.
 */
export function clueDoneColor(background: Color): Color {
  return divide(background, 1.5);
}

/**
 * A **wall**: a cell that is structure and never the player's to work, such as
 * Inertia's and Sokoban's walls, Crossing's blocked squares, and Light Up's
 * and Sticks' blocks. A flat fill with no bevel, one role in every game that
 * has one.
 *
 * Both values are authored, because no surface may hold its tone: darker than
 * anything else on a light board, and in the dark scheme a mid gray above the
 * lifted cell, which the settled surface must not be taken for. Not black
 * there, where a black block reads as a cell that has sunk (a selected one),
 * and not ink, which would make the walls the brightest thing on a dark
 * board. A wall a quarter of the way from the floor toward its bevel could not
 * be told from the floor on a phone (owner, 2026-10-03). A digit on a wall is
 * the pinned `WHITE`.
 */
export function wallFill(background: Color): Color {
  return token(scale(background, 0.25), [0.4, 0.4, 0.4]);
}
