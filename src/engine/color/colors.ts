/**
 * **The collection's colors** — the whole set of them, by name.
 *
 * Twelve names (eight hues, plus gray, brown, black and white), each available
 * at a small fixed number of intensities. Everything any game shows is one of
 * these, or a *meaning* defined over them in [`palette.ts`](./palette.ts), or a
 * color derived from the board it sits on.
 *
 * ## Why the set is exactly this size
 *
 * **Flood, Guess and Samegame need ten members a player can tell apart**, in
 * every scheme; nothing else the collection does needs more. So the palette is
 * sized by that, and "how many colors should there be" has an answer rather than
 * a preference.
 *
 * ## Two things a name has to be
 *
 * 1. **True.** Flood's hint says *"Fill with yellow"*, and the hint quality bar
 *    says every sentence a hint utters is a claim that must be checked. A scheme
 *    may give {@link YELLOW} a different shade; it may not make it a color a
 *    player would call something else. That is why the intensity steps are named
 *    `_WASH` and `_BOLD` — by **role**, not by appearance: the wash step is light
 *    in light mode and *dark* in dark mode (content on top of it has to stay
 *    readable either way), so a name like `_PALE` would be a lie in one of the
 *    two schemes.
 * 2. **Load-bearing.** A game reaches for a name here only where the color *is*
 *    the meaning — a member of a set whose job is to be told apart, or a color
 *    the game names to the player. Everywhere else it references a meaning from
 *    `palette.ts`, so that "what should an error look like" stays one decision.
 *
 * ## The three intensities
 *
 * - **base** — the color: a mark, a line, a piece, a tile.
 * - **`_WASH`** — a fill that content must stay readable *on top of*. Light in
 *   light mode, dark in dark mode.
 * - **`_BOLD`** — the emphatic end: a mark that has to read against a large
 *   light fill, or a second member of a set (Mines' navy 4 against its blue 1).
 *   Dark in light mode, light in dark mode.
 *
 * The third step is Mines': 1-blue against 4-navy and 3-red against 5-maroon
 * are pairs a wash cannot supply, because a wash of blue is a fill, not a digit.
 * Teal alone has a fourth, {@link TEAL_WASH_QUIET}, which says why.
 *
 * **A color carries only the steps something asks for**, which is why orange has
 * no wash and yellow, purple and pink have no bold. An intensity nobody
 * references is a color decision nobody can see, and it will be wrong by the
 * time somebody looks — `palette-source.test.ts` fails on one.
 *
 * ## Authored in OKLCH, on purpose
 *
 * {@link DESIGN} is the palette. It is stated as lightness/chroma/hue because
 * that is the space the constraints live in — "these ten are mutually
 * distinguishable" is a distance, "this wash is light enough for black text on
 * top" is a lightness, and "Crossing's across and down must carry equal weight"
 * is an equality of lightness *and* chroma that RGB cannot express (the obvious
 * RGB mirror of a blue is an amber that measures both lighter and more colorful).
 *
 * The conversion to sRGB is done here rather than by importing the app's color
 * library: this module is reached from the puzzle worker, and the arithmetic is
 * fixed, standard and cheaper than the dependency. `colors.test.ts` pins it
 * against `colorjs.io` and measures every set that has to stay distinguishable,
 * in **both** schemes.
 */

import type { Color } from "../types.ts";
import { token } from "./color-token.ts";

// --- OKLCH → sRGB ------------------------------------------------------

/** Björn Ottosson's OKLab → linear sRGB, then the sRGB transfer function.
 *
 * Every value in {@link DESIGN} is inside the sRGB gamut by construction (its
 * chroma is 94% of the most that hue and lightness can carry), so the clamp here
 * is a guard against a future edit rather than a gamut-mapping step. */
function oklch(l: number, c: number, hDegrees: number): Color {
  const h = (hDegrees * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
  return linear.map((v) => {
    const encoded = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.min(1, Math.max(0, encoded));
  }) as unknown as Color;
}

// --- the design --------------------------------------------------------

/** One intensity of one color, in one scheme: `[lightness, chroma]`. */
type Step = readonly [l: number, c: number];

/** A color's intensities under one scheme; every step but `base` is optional. */
type Steps = {
  base: Step;
  wash?: Step;
  washQuiet?: Step;
  field?: Step;
  fieldMark?: Step;
  bold?: Step;
};

/**
 * **The palette.** Hue per name, then lightness and chroma per intensity per
 * scheme.
 *
 * The lightnesses are not free-hand: they are the result of maximizing the worst
 * pairwise distance inside every set the collection needs a player to tell apart
 * — the ten-member set, Mines' six counts, Signpost's eight region fills, Map's
 * four, the hint vocabulary, and each color's own three steps — subject to each
 * name staying true (a "yellow" at lightness 0.45 is olive; a "blue" at 0.9 is
 * not blue). Where several solutions cleared every bar, the one closest to the
 * lightness each name naturally wants was taken. `colors.test.ts` re-measures
 * all of it, so a future edit that trades one set away is a failing test rather
 * than a discovery.
 *
 * One pair is **tied rather than optimized**: blue's and orange's **bold** steps
 * carry the same lightness *and* the same chroma in both schemes, because
 * Crossing colors across-runs in one and down-runs in the other — on the board
 * *and* in the clue list, which is one color per direction rather than two — and
 * either being stronger makes one direction look like the important one. Blue's
 * chroma is held down to what orange can reach, the constraint running that way
 * because orange's gamut is the narrower of the two at that lightness.
 *
 * ## Three bounds the dark column is held inside
 *
 * A search maximizes separation, and left alone it will buy separation with
 * anything not nailed down. Each bound below stops a defect it produced — **do
 * not widen them to recover a decimal place**:
 *
 * - **A color may not leave its own name.** Uncapped, dark yellow went to
 *   lightness 0.95 at half the chroma it can carry: a **cream**, which bought
 *   the ten-set 0.158. Capped at 0.86 the set is 0.143 — still twice upstream's
 *   dark 0.070 and above its light 0.134 — and a yellow that reads as white
 *   fails the truthful-name rule outright.
 * - **A wash sits where the board's own cells sit.** A game's dark cells are
 *   drawn near 0.44, and a wash well below that reads as a hole in the board
 *   rather than a mark on it, as Crossing's across/down highlight once did. The
 *   hued dark washes sit at 0.34–0.48.
 * - **The bold step stays the emphatic end.** In dark mode that means *lighter*
 *   than the base, which the search will happily invert for a hue whose base is
 *   already near the top of its gamut. Every dark bold is at least 0.05 above
 *   its dark base.
 *
 * A **third scheme** is this table with a third column.
 */
const DESIGN: Record<string, { h: number; light: Steps; dark: Steps }> = {
  RED: {
    h: 27,
    light: { base: [0.58, 0.22], wash: [0.78, 0.085], bold: [0.42, 0.161] },
    dark: { base: [0.62, 0.22], wash: [0.34, 0.131], bold: [0.83, 0.09] },
  },
  ORANGE: {
    h: 62,
    // No wash step: nothing needs one.
    light: { base: [0.72, 0.156], bold: [0.42, 0.091] },
    dark: { base: [0.69, 0.149], bold: [0.84, 0.076] },
  },
  YELLOW: {
    h: 100,
    light: {
      base: [0.86, 0.168],
      wash: [0.91, 0.07],
      field: [0.91, 0.07],
      fieldMark: [0.62, 0.05],
    },
    dark: {
      base: [0.8, 0.156],
      wash: [0.48, 0.08],
      field: [0.52, 0.1],
      fieldMark: [0.74, 0.1],
    },
  },
  GREEN: {
    h: 148,
    light: { base: [0.64, 0.174], wash: [0.81, 0.07], bold: [0.42, 0.115] },
    dark: { base: [0.72, 0.196], wash: [0.4, 0.07], bold: [0.84, 0.16] },
  },
  TEAL: {
    h: 200,
    light: {
      base: [0.72, 0.115],
      wash: [0.94, 0.072],
      // Identical to `wash`: the quiet step differs only in dark mode.
      washQuiet: [0.94, 0.072],
      bold: [0.42, 0.067],
    },
    dark: {
      base: [0.72, 0.115],
      wash: [0.48, 0.077],
      // Chroma 0.06 because teal cannot carry the wash's 0.077 this dark: asking
      // for it makes the gamut clamp silently return a different color.
      washQuiet: [0.3, 0.06],
      bold: [0.84, 0.134],
    },
  },
  BLUE: {
    h: 258,
    light: { base: [0.57, 0.199], wash: [0.81, 0.07], bold: [0.42, 0.091] },
    dark: { base: [0.62, 0.195], wash: [0.38, 0.075], bold: [0.84, 0.076] },
  },
  PURPLE: {
    h: 308,
    light: { base: [0.53, 0.22], wash: [0.9, 0.06] },
    dark: { base: [0.6, 0.22], wash: [0.46, 0.07] },
  },
  PINK: {
    h: 350,
    light: { base: [0.72, 0.198], wash: [0.84, 0.07] },
    dark: { base: [0.75, 0.171], wash: [0.4, 0.12] },
  },
  GRAY: {
    h: 0,
    light: { base: [0.6, 0], wash: [0.78, 0], bold: [0.42, 0] },
    dark: { base: [0.44, 0], wash: [0.3, 0], bold: [0.84, 0] },
  },
  /** Brown is dark, low-chroma orange, and it is its **own** name rather than an
   * intensity of orange for one reason: it must not invert. Orange's bold step
   * goes light in dark mode, as a bold step should; a brown that went light would
   * stop being brown, and Flood names it to the player. */
  BROWN: {
    h: 62,
    light: { base: [0.43, 0.09] },
    dark: { base: [0.56, 0.09] },
  },
};

const of = (name: string, step: keyof Steps): Color => {
  const d = DESIGN[name];
  const light = d.light[step];
  const dark = d.dark[step];
  if (!light || !dark) throw new Error(`${name} has no ${step} step`);
  return token(oklch(light[0], light[1], d.h), oklch(dark[0], dark[1], d.h));
};

// --- the named colors -------------------------------------------------

/** Red. The collection's *error* meaning is built on it, but so are Flood's red
 * tile and Magnets' positive pole, which are not errors — see `palette.ts`. */
export const RED: Color = of("RED", "base");
/** @see RED */
export const RED_WASH: Color = of("RED", "wash");
/** @see RED */
export const RED_BOLD: Color = of("RED", "bold");

/** Orange. */
export const ORANGE: Color = of("ORANGE", "base");
/** @see ORANGE */
export const ORANGE_BOLD: Color = of("ORANGE", "bold");

/** Yellow. */
export const YELLOW: Color = of("YELLOW", "base");
/** @see YELLOW */
export const YELLOW_WASH: Color = of("YELLOW", "wash");
/**
 * @see YELLOW — the **field**: a fill that covers about half of a board, the
 * state that is not the shaded one. Its consumer is `CLEAR`.
 *
 * A step of its own rather than {@link YELLOW_WASH}, for the reason
 * {@link TEAL_WASH_QUIET} is one: that wash's dark lightness is an output of
 * the search behind {@link EIGHT_FILLS} and {@link FOUR_FILLS}. In the light
 * scheme the two are one value. In the dark scheme the wash is a muddy olive
 * as a field (owner, 2026-10-11, asking for more contrast), so the field is
 * lighter and carries the most chroma yellow has at that lightness, which
 * reads as gold. It stays under the dark {@link PURPLE} of the piece beside
 * it, and white ink still reads on it.
 */
export const YELLOW_FIELD: Color = of("YELLOW", "field");
/**
 * @see YELLOW_FIELD — what is drawn **faint** on the field: a cross, a number
 * that is used up. The field's hue a step toward the ink of each scheme, so it
 * is seen on the field and stays behind the ink beside it. A gray could not be
 * it in the dark scheme, where the grays sit at the field's own lightness.
 */
export const YELLOW_FIELD_MARK: Color = of("YELLOW", "fieldMark");

/** Green. */
export const GREEN: Color = of("GREEN", "base");
/** @see GREEN */
export const GREEN_WASH: Color = of("GREEN", "wash");
/** @see GREEN */
export const GREEN_BOLD: Color = of("GREEN", "bold");

/** Teal. */
export const TEAL: Color = of("TEAL", "base");
/** @see TEAL */
export const TEAL_WASH: Color = of("TEAL", "wash");
/**
 * @see TEAL — the **quiet** wash: a fill the hint's own marks are drawn on top
 * of, so it has to stay close enough to the board that they still win. Its one
 * consumer is `HINT_EVIDENCE_WASH`.
 *
 * A step of its own rather than a retune of {@link TEAL_WASH}, because that one
 * is a member of {@link EIGHT_FILLS} and {@link FOUR_FILLS}: its dark lightness
 * is an *output* of the search that keeps those sets distinguishable.
 *
 * The dark value is where two opposed requirements cross: the wash must be
 * *seen* against its board, and the action ring drawn on it (a target cell is
 * often inside the evidence region) must be seen against *the wash*. At the
 * ordinary dark wash the ring scored **1.69:1**, against 3.94 in light.
 * Lightness 0.30 matches light mode's own visibility (1.31 against 1.29) and
 * leaves the ring 3.54.
 */
export const TEAL_WASH_QUIET: Color = of("TEAL", "washQuiet");
/** @see TEAL */
export const TEAL_BOLD: Color = of("TEAL", "bold");

/** Blue. */
export const BLUE: Color = of("BLUE", "base");
/** @see BLUE */
export const BLUE_WASH: Color = of("BLUE", "wash");
/** @see BLUE */
export const BLUE_BOLD: Color = of("BLUE", "bold");

/** Purple. */
export const PURPLE: Color = of("PURPLE", "base");
/** @see PURPLE */
export const PURPLE_WASH: Color = of("PURPLE", "wash");

/** Pink. */
export const PINK: Color = of("PINK", "base");
/** @see PINK */
export const PINK_WASH: Color = of("PINK", "wash");

/** Gray — the achromatic member, and the tenth member of {@link TEN}. */
export const GRAY: Color = of("GRAY", "base");
/** @see GRAY */
export const GRAY_WASH: Color = of("GRAY", "wash");
/** @see GRAY */
export const GRAY_BOLD: Color = of("GRAY", "bold");

/** Brown. @see DESIGN for why it is a name and not an intensity of orange. */
export const BROWN: Color = of("BROWN", "base");

/**
 * **This game object is black** — a black peg, a black mine, the filled squares
 * of a two-color game. Not the `INK` meaning, despite being the same color: ink
 * is *maximum contrast against the surface* and must invert in dark mode, while
 * this is the piece's own identity, and inverting it would tell the player the
 * piece is the other color.
 */
export const BLACK: Color = token([0, 0, 0], [0, 0, 0]);

/** The counterpart to {@link BLACK}: **this game object is white** — a white
 * peg, a white pearl, the empty squares of a two-color game. */
export const WHITE: Color = token([1, 1, 1], [1, 1, 1]);

// --- the sets ----------------------------------------------------------

/**
 * **Ten colors a player can tell apart**, and the reason the palette is the size
 * it is: Flood's tiles, Guess's pegs, Samegame's nine (which takes all but the
 * gray — a gray tile among colored ones reads as a hole in the board).
 *
 * Upstream wrote Flood's and Guess's ten out twice and never designed them as a
 * set: worst pair 0.134 in light and **0.070** in dark, because mutual
 * distinguishability is a property of the set and no per-color rule — including
 * adapting one to a scheme — can establish it. This set measures 0.159 light and
 * 0.143 dark (2026-09-11).
 */
export const TEN: readonly Color[] = [
  RED,
  YELLOW,
  GREEN,
  BLUE,
  ORANGE,
  PURPLE,
  BROWN,
  TEAL,
  PINK,
  GRAY,
];

/**
 * {@link TEN}, as a player would say them — the names a game may put in a
 * sentence.
 *
 * Parallel to {@link TEN} and exported *with* it so the two cannot drift: Flood's
 * hint reads "Fill with orange", and the only thing standing between that and a
 * lie is that the word and the color come from the same place.
 */
export const TEN_NAMES: readonly string[] = [
  "red",
  "yellow",
  "green",
  "blue",
  "orange",
  "purple",
  "brown",
  "teal",
  "pink",
  "gray",
];

/**
 * **Eight fills a mark can be drawn on** — Signpost's region backgrounds.
 *
 * The wash step throughout, because a region fill has to follow the board: light
 * under a light scheme, dark under a dark one, with the number and arrow the game
 * draws on top staying readable either way. That is also why a region set cannot
 * simply borrow {@link TEN}: those are colors, and half of them are too dark to
 * write on in light mode and too light in dark mode.
 *
 * Eight washes cannot be as separated as eight colors — a pastel set is close
 * together by construction, which is why upstream's own eight measured 0.071.
 * These measure 0.076 light and 0.100 dark (2026-09-11), so the set is better
 * than the one it replaces without pretending to be something a wash cannot be.
 */
export const EIGHT_FILLS: readonly Color[] = [
  GRAY_WASH,
  RED_WASH,
  GREEN_WASH,
  PURPLE_WASH,
  YELLOW_WASH,
  BLUE_WASH,
  PINK_WASH,
  TEAL_WASH,
];

/**
 * **The two states of a two-state game**, where neither is the important one:
 * Unruly's two kinds of square. A game takes the pair from here and names no
 * hue of its own, so a different pair is this line, {@link TWO_NAMES} and
 * {@link TWO_WASH}.
 *
 * Purple and yellow because a board of pieces still has marks drawn on it:
 * red is an error, blue the hint's ring, teal its evidence, green and pink
 * its two premise references, green the cursor too, and orange the outline a
 * game with the pair gives a premise no shared role names (Unruly's reference
 * ring). A piece in any of those swallows that mark. Of what is left, this
 * pair stands furthest apart in lightness, which is what a color-blind player
 * has when hue fails. The pieces also differ in shape (`engine/piece.ts`), so
 * the pair is not the only carrier.
 */
export const TWO: readonly [Color, Color] = [PURPLE, YELLOW];

/** {@link TWO}, as a player would say them: the words a hint puts in a
 * sentence, exported beside the colors as {@link TEN_NAMES} is. */
export const TWO_NAMES: readonly [string, string] = ["purple", "yellow"];

/** The wash of each member of {@link TWO}, indexed alike: a fill in the
 * member's hue that content stays readable on. The roles built on the pair
 * take their fills from here, so they follow the pair when it is replaced. */
export const TWO_WASH: readonly [Color, Color] = [PURPLE_WASH, YELLOW_WASH];

/**
 * **Four fills**, for the one set in the collection whose size is a *theorem* —
 * four colors suffice to color any planar map, which is Map's puzzle.
 *
 * The widest spread {@link EIGHT_FILLS} allows, because a Map board is almost
 * entirely region fill and the whole game is telling neighboring regions apart.
 * Upstream's four muted earth tones measured 0.077; these measure 0.113 light and
 * 0.120 dark (2026-09-11). Upstream chose earth tones so four saturated hues were
 * not tiring over a whole game; the wash step answers that without being hard to
 * read.
 */
export const FOUR_FILLS: readonly Color[] = [
  RED_WASH,
  YELLOW_WASH,
  TEAL_WASH,
  PURPLE_WASH,
];

/** The two steps the members of {@link FOUR_FILLS_QUIET} take, a scheme, as
 * `[lightness, chroma]`. */
const QUIET_STEPS: Record<"upper" | "lower", { light: Step; dark: Step }> = {
  upper: { light: [0.92, 0.045], dark: [0.35, 0.05] },
  lower: { light: [0.875, 0.045], dark: [0.28, 0.055] },
};

/** A member of {@link FOUR_FILLS_QUIET}: a named color's hue at one of the
 * set's two steps. */
const quietFill = (name: string, step: "upper" | "lower"): Color => {
  const { h } = DESIGN[name];
  const { light, dark } = QUIET_STEPS[step];
  return token(oklch(light[0], light[1], h), oklch(dark[0], dark[1], h));
};

/** The yellow of {@link FOUR_FILLS_QUIET}, which says why it is not at the
 * upper step: `[lightness, chroma, hue]`. */
const QUIET_YELLOW = {
  light: [0.93, 0.065, 100],
  dark: [QUIET_STEPS.upper.dark[0], QUIET_STEPS.upper.dark[1], 88],
} as const;

/**
 * **{@link FOUR_FILLS}, quiet**: the same four hues, member for member, for
 * a board whose regions the puzzle gives. There the whole board is these, and
 * all a fill says is "these squares are one region": everything the player
 * reads is drawn on it, and the heavy border between two regions is what
 * tells them apart. In Map the fill is the player's answer, and has to stand
 * off a region with no color yet; here it has to recede.
 *
 * A step of its own and not the four washes. A wash's lightness is an output
 * of the search behind {@link FOUR_FILLS}, so as a whole board they are
 * uneven, teal's brighter than the board and red's well under it, and in the
 * dark scheme too light for a mark to win on: at a wash's 0.42 a star
 * measured 1.7:1 on its region and the hint's stripes 1.16:1.
 * `palette.test.ts` holds each mark's floor on these.
 *
 * **Two steps, taken in turn round the hue circle.** Any two members may be
 * the fills of regions side by side, so every pair has to clear the floor
 * two neighbors are held to (`MIN_DARK_DISTANCE`,
 * `puzzle/neighbor-contrast.ts`), which four hues this faint do not at one
 * lightness. Hues next to each other therefore take different steps.
 *
 * **Yellow is at neither step.** At the upper step's light chroma it is
 * khaki, so it is lighter and stronger, as yellow is. In the dark scheme no
 * yellow is that dark: it is olive, a muddy field (owner, 2026-10-11, of
 * {@link YELLOW_WASH}). So its dark value leaves the hue a little way toward
 * orange, for an ochre, which it may, since no member is named to a player
 * on a board that takes these. Further, at brown, it is taken for the red
 * beside it.
 *
 * `regionFills` (`engine/region-fill.ts`) says which region takes which.
 */
export const FOUR_FILLS_QUIET: readonly Color[] = [
  quietFill("RED", "lower"),
  token(oklch(...QUIET_YELLOW.light), oklch(...QUIET_YELLOW.dark)),
  quietFill("TEAL", "lower"),
  quietFill("PURPLE", "upper"),
];

/**
 * {@link FOUR_FILLS}, as a player would say them. Map's hint names the color a
 * region must take, and as with {@link TEN_NAMES} the word and the color come
 * from one place, so recoloring the set cannot leave a sentence naming the old
 * hue. The fourth is "violet" rather than its palette entry's "purple": as a
 * wash it is pale lavender in light mode and dusky violet in dark, and a player
 * would call neither purple (owner playtest, 2026-09-25).
 */
export const FOUR_NAMES: readonly string[] = ["red", "yellow", "teal", "violet"];
