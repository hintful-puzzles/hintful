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
 *    may give {@link YELLOW} a different shade; where a scheme's value is one a
 *    player would call something else, the color carries that scheme's word
 *    too (a `ColorWord`, `color-word.ts`), and a sentence says the word of the
 *    scheme it is shown in. `colors.test.ts` holds every word to its color in
 *    both. That is why the intensity steps are named
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

import type { MarkRole } from "../hint-words.ts";
import type { Color } from "../types.ts";
import { token } from "./color-token.ts";
import { ColorWord } from "./color-word.ts";

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
 * — the ten-member set, Mines' six counts, the washes as a set of region
 * fills, the hint vocabulary, and each color's own three steps — subject to each
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
    light: { base: [0.64, 0.174], wash: [0.81, 0.07] },
    dark: { base: [0.72, 0.196], wash: [0.4, 0.07] },
  },
  TEAL: {
    h: 200,
    light: { base: [0.72, 0.115], wash: [0.94, 0.072] },
    dark: { base: [0.72, 0.115], wash: [0.48, 0.077] },
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

/** The word for each color a player may hear named, by the color. A set's
 * names are read off its members ({@link wordOf}), so no list of words can
 * fall out of step with the colors it names. */
const WORDS = new Map<Color, ColorWord>();

/** `c`, recorded as called `word`, or `darkWord` in the dark scheme. */
const named = (c: Color, word: string, darkWord?: string): Color => {
  WORDS.set(c, new ColorWord(word, darkWord));
  return c;
};

const wordOf = (c: Color): ColorWord => {
  const w = WORDS.get(c);
  if (!w) throw new Error("a set the player hears named has a color with no word");
  return w;
};

/** One step of a color. The base is the color itself, and the only step a
 * sentence names, so it alone is given the color's word. */
const of = (name: string, step: keyof Steps): Color => {
  const d = DESIGN[name];
  const light = d.light[step];
  const dark = d.dark[step];
  if (!light || !dark) throw new Error(`${name} has no ${step} step`);
  const t = token(oklch(light[0], light[1], d.h), oklch(dark[0], dark[1], d.h));
  return step === "base" ? named(t, name.toLowerCase()) : t;
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
 * A step of its own rather than {@link YELLOW_WASH}, because that wash's dark
 * lightness is an output of the search that made the washes a set of region
 * fills. In the light
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

/** Teal. */
export const TEAL: Color = of("TEAL", "base");
/** @see TEAL */
export const TEAL_WASH: Color = of("TEAL", "wash");

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
export const TEN_NAMES: readonly ColorWord[] = TEN.map(wordOf);

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
export const TWO_NAMES: readonly [ColorWord, ColorWord] = [
  wordOf(TWO[0]),
  wordOf(TWO[1]),
];

/** The wash of each member of {@link TWO}, indexed alike: a fill in the
 * member's hue that content stays readable on. The roles built on the pair
 * take their fills from here, so they follow the pair when it is replaced. */
export const TWO_WASH: readonly [Color, Color] = [PURPLE_WASH, YELLOW_WASH];

/** A region fill in one scheme: `[lightness, chroma, hue]`. */
type Lch = readonly [l: number, c: number, h: number];

/**
 * **The region palette**: what a region is filled with, on any board. Eight
 * faint fills in two rings, of which a board takes the first four, six or
 * eight.
 *
 * - **The first four are a quarter turn apart in hue at one lightness**, so a
 *   board in them is evenly light and no region is the loud one. That is why
 *   two of them are not the palette's named hues: purple and pink stand 42
 *   degrees apart, and at a chroma this faint 0.036, half the floor two
 *   neighbors are held to (`MIN_DARK_DISTANCE`, `puzzle/neighbor-contrast.ts`).
 *   The violet and the pink here are moved to where the four are spread.
 * - **The next four sit a step lower in lightness, on the hues between**, so
 *   that six and eight still hold every pair to that floor.
 * - **No red and no gray.** Red is an error, and its wash the mistake's
 *   (`ERROR_WASH`); the owner never liked it in Map (2026-10-13). A gray
 *   region reads as a wall in the light scheme and a hole in the dark.
 *
 * **One value a scheme, in every game** (the owner, 2026-10-15: consistency
 * first). In the dark scheme the fills are dark enough for a mark to win on
 * them, since everything the player reads is drawn there: at a wash's 0.42 a
 * star measured 1.7:1 on its region and the hint's stripes 1.16:1. The dark
 * yellow leaves its hue a little way toward orange, since a yellow that dark
 * is olive, a muddy field (owner, 2026-10-11, of {@link YELLOW_WASH}).
 *
 * `mark` is the first four's dark value as a **mark** of the color rather
 * than a fill: a dot or a swatch drawn on a surface that is not the color,
 * as Map's pencil stipples are on a region with no color yet. At the fill's
 * own dark value such a dot measured 1.3:1 there. The light scheme has one
 * value for both.
 *
 * `darkWord` is what a player calls a fill whose dark value has left its
 * name, fill and mark alike: the dark yellow is a brown, and the dark pink a
 * maroon (owner, 2026-10-15, of Map's hint naming them "yellow" and "pink").
 */
const REGION_DESIGN = {
  yellow: {
    light: [0.935, 0.078, 99],
    dark: [0.36, 0.06, 85],
    mark: [0.5, 0.095, 95],
    darkWord: "brown",
  },
  teal: {
    light: [0.895, 0.066, 190],
    dark: [0.355, 0.057, 192],
    mark: [0.46, 0.074, 192],
  },
  violet: {
    light: [0.88, 0.055, 277],
    dark: [0.35, 0.068, 282],
    mark: [0.45, 0.095, 282],
  },
  pink: {
    light: [0.89, 0.056, 9],
    dark: [0.35, 0.066, 5],
    mark: [0.47, 0.088, 0],
    darkWord: "maroon",
  },
  green: { light: [0.82, 0.062, 145], dark: [0.28, 0.06, 146] },
  blue: { light: [0.82, 0.062, 233], dark: [0.28, 0.057, 237] },
  peach: { light: [0.835, 0.06, 60], dark: [0.28, 0.06, 56] },
  orchid: { light: [0.826, 0.065, 323], dark: [0.28, 0.065, 323] },
} as const satisfies Record<
  string,
  { light: Lch; dark: Lch; mark?: Lch; darkWord?: string }
>;

type RegionName = keyof typeof REGION_DESIGN;

/** The region palette's order: the first four, then the next four. */
const REGION_ORDER: readonly RegionName[] = [
  "yellow",
  "teal",
  "violet",
  "pink",
  "green",
  "blue",
  "peach",
  "orchid",
];

const fill = (light: Lch, dark: Lch): Color => token(oklch(...light), oklch(...dark));

/** A region fill's word in the dark scheme: its own, unless it is given one. */
const darkWordOf = (name: RegionName): string => {
  const d = REGION_DESIGN[name];
  return "darkWord" in d ? d.darkWord : name;
};

/**
 * **The fills of the regions on any board**: see {@link REGION_DESIGN}. A
 * board takes the first four, six or eight, and `regionFills`
 * (`engine/region-fill.ts`) says which region takes which.
 */
export const REGION_FILLS: readonly Color[] = REGION_ORDER.map((name) =>
  named(
    fill(REGION_DESIGN[name].light, REGION_DESIGN[name].dark),
    name,
    darkWordOf(name),
  ),
);

/** Where Map's four are in {@link REGION_FILLS}, in the order of the numbers
 * a save holds: the pink is where a red was, and the other three are where
 * they were. */
const MAP_ORDER = [3, 0, 1, 2] as const;

/**
 * **Four fills that are a player's answer**, for the one set in the
 * collection whose size is a *theorem*: four colors suffice to color any
 * planar map, which is Map's puzzle. The region palette's first four,
 * themselves, so a Map region and a Star Battle region of one color are one
 * color in both schemes.
 */
export const FOUR_FILLS: readonly Color[] = MAP_ORDER.map((k) => REGION_FILLS[k]);

/** {@link FOUR_FILLS} as **marks** on a surface that is not the color: the
 * same in the light scheme, the `mark` step in the dark
 * ({@link REGION_DESIGN}). */
export const FOUR_FILL_MARKS: readonly Color[] = MAP_ORDER.map((k) => {
  const d = REGION_DESIGN[REGION_ORDER[k]];
  if (!("mark" in d)) throw new Error(`${REGION_ORDER[k]} has no mark step`);
  return fill(d.light, d.mark);
});

/**
 * {@link FOUR_FILLS}, as a player would say them. Map's hint names the color a
 * region must take, and as with {@link TEN_NAMES} the word and the color come
 * from one place, so recoloring the set cannot leave a sentence naming the old
 * hue. Two of them have a word of their own in the dark scheme
 * ({@link REGION_DESIGN}).
 */
export const FOUR_NAMES: readonly ColorWord[] = FOUR_FILLS.map(wordOf);

/**
 * **The colors a hint's references take**, three to a role: each reference
 * in a hint's words its own, its marks repainted in it and its words tinted
 * with it (`Puzzle.hintReferenceColorsIn`). A role's colors share what they
 * say, not a hue (the owner, 2026-10-19: "we just need them to have similar
 * emotional connotation"): cool and assertive for what a step decides, calm
 * for what it reasons from, warm for the line it names. Within a role they
 * must be told apart at a glance, which in the light scheme hue does and
 * lightness alone does not: three greens there read as one.
 *
 * Each is a mark drawn on a cell, so each meets the bars `palette.test.ts`
 * holds every mark to, in both schemes: it reads on the cell surface and on
 * every region fill, and keeps more than 30° off the two-state pair's hues.
 * The light column is what that costs: a mark reads on the light board only
 * at lightness 0.58 or so and below, so a lime is an olive there and an amber
 * a bronze (owner, 2026-10-19: the deeper light shades over the vivid ones that
 * vanished on a pale fill).
 *
 * Stripes are laid under a symbol at the hatch's coverage, so theirs are also
 * held to the bar Magnets' symbols are under the hatch
 * (`hatch-contrast.test.ts`), each at the nearest lightness that keeps it: the
 * light red and bronze lighter and the dark amber darker than they were set
 * (owner, 2026-10-20: retune the stripes rather than relax the bar).
 *
 * The first ring is the hint's own {@link BLUE}, so a step with one ringed
 * reference looks as it did before a reference had a color of its own.
 */
const REFERENCE_DESIGN = {
  ring: [
    { light: [0.56, 0.097, 222], dark: [0.84, 0.106, 222] },
    { light: [0.42, 0.2, 276], dark: [0.74, 0.127, 276] },
  ],
  outline: [
    { light: [0.54, 0.16, 142], dark: [0.62, 0.18, 142] },
    { light: [0.46, 0.072, 195], dark: [0.76, 0.12, 195] },
    { light: [0.42, 0.07, 55], dark: [0.7, 0.08, 55] },
  ],
  stripes: [
    { light: [0.58, 0.156, 45], dark: [0.83, 0.089, 45] },
    { light: [0.59, 0.191, 0], dark: [0.68, 0.2, 0] },
    { light: [0.52, 0.103, 68], dark: [0.62, 0.128, 68] },
  ],
} as const satisfies Record<
  MarkRole,
  readonly { readonly light: Lch; readonly dark: Lch }[]
>;

const designed = (role: MarkRole): Color[] =>
  REFERENCE_DESIGN[role].map((d) => fill(d.light, d.dark));

/** {@link REFERENCE_DESIGN}, a role to its colors in the order references
 * take them. */
export const HINT_REFERENCE_COLORS: Readonly<Record<MarkRole, readonly Color[]>> = {
  ring: [BLUE, ...designed("ring")],
  outline: designed("outline"),
  stripes: designed("stripes"),
};

/**
 * **Colors that mean nothing**, for pieces a player tells apart by color
 * while something else, such as a number, says which is which: Path's pairs.
 * A game takes them by position, and this is the one set in the collection
 * whose members are only that.
 *
 * Every member stands apart from each color a board draws a meaning in over
 * its pieces: the error, the cursor and a held piece, the drag, and every
 * color a hint's ring or outline takes ({@link HINT_REFERENCE_COLORS}). A
 * pair's line is a line, and so is the hint's, so a blue pair would be read
 * as the hint's and a red one as broken. That leaves two arcs of hue, amber
 * to olive and violet to pink, and the members are laid out along them for
 * distance from one another in both schemes, at a lightness where a line
 * reads on `cellSurface` and a black number reads on a disc of the color.
 *
 * A board with more pieces than the set has members repeats them, which is
 * why a game takes this set only where something else tells its pieces
 * apart. No words: no game says one of these aloud, and one that would
 * names them here, held to their colors as {@link TEN_NAMES} is.
 */
const FREE_DESIGN: readonly { light: Lch; dark: Lch }[] = [
  // amber
  { light: [0.58, 0.117, 72], dark: [0.81, 0.149, 72] },
  // violet
  { light: [0.54, 0.257, 288], dark: [0.66, 0.181, 288] },
  // olive
  { light: [0.48, 0.103, 116], dark: [0.72, 0.155, 116] },
  // magenta
  { light: [0.52, 0.212, 340], dark: [0.84, 0.112, 340] },
];

/** {@link FREE_DESIGN}. */
export const FREE: readonly Color[] = FREE_DESIGN.map((d) => fill(d.light, d.dark));
