/**
 * The **meanings** half of the color guard.
 *
 * The palette itself is measured in [`colors.test.ts`](./colors.test.ts) — how
 * far apart the colors are, in both schemes. What is left for this file is the
 * relationship between the two layers, and it is the one thing that keeps the
 * collapse from unwinding: **a meaning holds no value of its own**. The moment
 * `ERROR` is a red rather than *the* red, restyling red stops restyling errors,
 * and the ~190-token sprawl starts growing back one role at a time.
 *
 * The source half of the guard — "a game contains no color value" — is
 * [`palette-source.test.ts`](./palette-source.test.ts), which reads the game
 * sources, because that requirement is about where a color is written rather
 * than what it is.
 */
import { describe, expect, it } from "vitest";
import { getTsGame } from "../registry.ts";
import { colorToOKLCH, isGrayChroma, type OKLCH } from "../testing/oklch.ts";
import type { Color } from "../types.ts";
import "../../games/index.ts";
import { HATCH_OPACITY } from "../hatch.ts";
import type { MarkRole } from "../hint-words.ts";
import { mkhighlight } from "./color-mkhighlight.ts";
import { darkValue } from "./color-token.ts";
import * as colors from "./colors.ts";
import * as roles from "./palette.ts";
import { SIGNPOST_REGION_BACKGROUNDS } from "./palette-games.ts";

/** A light host background, standing in for the frontend's theme color. */
const BG: Color = [0.827, 0.827, 0.827];

const key = (c: Color): string => c.map((v) => Math.round(v * 1000) / 1000).join(",");

/**
 * Call a derived role, whatever it takes.
 *
 * Every role today is a function of the background alone; one once needed the
 * highlight, because "a quarter of the way from the floor toward its bevel" is
 * what the color *means*. Dispatching on arity keeps that one exception from
 * needing a hand-maintained list here — a new role is picked up automatically.
 */
// biome-ignore lint/complexity/noBannedTypes: the role table is heterogeneous by design.
function resolve(fn: Function, background: Color, highlight: Color): Color {
  return fn.length === 2
    ? (fn as (b: Color, h: Color) => Color)(background, highlight)
    : (fn as (b: Color) => Color)(background);
}

describe("the shared color vocabulary", () => {
  it("defines every meaning in terms of a named color", () => {
    // The whole point of the two layers. A meaning that held its own value would
    // be a color decision wearing a role's name — which is what ~170 of the ~190
    // tokens this change deleted actually were.
    //
    // Checked by **identity**, not by value: a copy of `RED` is the right color
    // with its scheme decision silently removed, and by value the two are
    // indistinguishable.
    const named = (v: unknown): Color[] => {
      // A color, one of the sets built out of them, or sets by name.
      if (Array.isArray(v))
        return typeof v[0] === "number" ? [v as Color] : (v as Color[]);
      if (v && typeof v === "object") return Object.values(v).flatMap(named);
      return [];
    };
    const palette = new Set<Color>(Object.values(colors).flatMap(named));
    // INK and PAPER are the two exceptions, and they earn it: they are *maximum
    // contrast against the surface*, so they must be adapted by the scheme rather
    // than authored — which is exactly what a named color may not be.
    const exempt = new Set<Color>([roles.INK, roles.PAPER]);
    let checked = 0;
    for (const [name, value] of Object.entries(roles)) {
      for (const color of named(value)) {
        if (exempt.has(color)) continue;
        expect(
          palette.has(color),
          `${name} holds a color value instead of referencing one from colors.ts`,
        ).toBe(true);
        checked++;
      }
    }
    // A roles module of nothing but functions would satisfy the loop silently.
    expect(checked, "no plain-color role was checked").toBeGreaterThan(10);
  });

  it("keeps ink and paper adapting", () => {
    // The distinction from BLACK and WHITE only exists in dark mode, so this is
    // where it is pinned: ink is maximum contrast against the surface and must
    // invert, while a piece's black is the piece's identity — inverting it would
    // tell the player the piece is the other color.
    expect(darkValue(roles.INK)).toBeNull();
    expect(darkValue(roles.PAPER)).toBeNull();
    expect(darkValue(colors.BLACK)).toEqual([0, 0, 0]);
    expect(darkValue(colors.WHITE)).toEqual([1, 1, 1]);
  });

  it("reports a game's scheme decisions by palette index", () => {
    // The engine hands these to the frontend as plain per-index data, because
    // the tag rides on the color and would not survive structured clone.
    const pearl = getTsGame("pearl");
    if (!pearl) throw new Error("pearl not registered");
    const decisions = pearl
      .colors(BG)
      .map((c, i) => (c && darkValue(c) ? i : -1))
      .filter((i) => i >= 0);
    // COL_BLACK = 3 and COL_WHITE = 4: the two pearls, which must not invert.
    expect(decisions).toContain(3);
    expect(decisions).toContain(4);
  });

  it("keeps the hint inks distinct, in both schemes", () => {
    // A step is drawn in the inks until its marks are measured and each
    // reference repainted in its own color (`HINT_RING`), and a frame puts a
    // ring, an outline and stripes on screen at once. The inks are reference
    // colors, which the test below holds to a mark's bars; this one says the
    // three stay told apart, and that each is its role's first color, so a
    // step looks the same before its marks are measured as after.
    const d = (a: Color, b: Color): number => {
      const plane = (c: OKLCH): [number, number] =>
        isGrayChroma(c[1])
          ? [0, 0]
          : [
              c[1] * Math.cos((c[2] * Math.PI) / 180),
              c[1] * Math.sin((c[2] * Math.PI) / 180),
            ];
      const [al, ...arest] = colorToOKLCH(a);
      const [bl, ...brest] = colorToOKLCH(b);
      const [ax, ay] = plane([al, ...arest] as OKLCH);
      const [bx, by] = plane([bl, ...brest] as OKLCH);
      return Math.hypot(al - bl, ax - bx, ay - by);
    };
    const inDark = (c: Color): Color => darkValue(c) ?? c;
    const inks = Object.entries(roles.HINT_INK);
    expect(inks.map(([role]) => role).sort()).toEqual(["outline", "ring", "stripes"]);
    for (const [role, ink] of inks)
      expect(ink, `the ${role} ink`).toBe(
        colors.HINT_REFERENCE_COLORS[role as MarkRole][0],
      );
    for (const [i, [xName, x]] of inks.entries())
      for (const [yName, y] of inks.slice(i + 1)) {
        expect(d(x, y), `${xName} vs ${yName} in light`).toBeGreaterThan(0.12);
        expect(d(inDark(x), inDark(y)), `${xName} vs ${yName} in dark`).toBeGreaterThan(
          0.12,
        );
      }
  });

  it("keeps a region's fill under everything drawn on it, in both schemes", () => {
    // A fill is the whole board of a game that takes it, so every mark the
    // collection draws on a cell lands on each of them: there is no member
    // a game can keep its star or its hint off. Measured on the set, then,
    // and not on one game's frames.
    const inDark = (c: Color): Color => darkValue(c) ?? c;
    const relLum = (c: Color): number => {
      const lin = (v: number) =>
        v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    };
    const contrast = (a: Color, b: Color): number => {
      const [hi, lo] = [relLum(a), relLum(b)].sort((p, q) => q - p);
      return (hi + 0.05) / (lo + 0.05);
    };
    const striped = (under: Color, stripe: Color): Color => [
      under[0] * (1 - HATCH_OPACITY) + stripe[0] * HATCH_OPACITY,
      under[1] * (1 - HATCH_OPACITY) + stripe[1] * HATCH_OPACITY,
      under[2] * (1 - HATCH_OPACITY) + stripe[2] * HATCH_OPACITY,
    ];
    const apart = (a: Color, b: Color): number => {
      const plane = ([, c, h]: OKLCH): [number, number] => [
        c * Math.cos((h * Math.PI) / 180),
        c * Math.sin((h * Math.PI) / 180),
      ];
      const [p, q] = [colorToOKLCH(a), colorToOKLCH(b)];
      const [px, py] = plane(p);
      const [qx, qy] = plane(q);
      return Math.hypot(p[0] - q[0], px - qx, py - qy);
    };

    expect(colors.REGION_FILLS.length).toBe(8);
    // Two bars. In the light scheme a mark reads on a fill no worse than on
    // `cellSurface`, the surface the fill replaces: every fill is lighter
    // than it. In the dark scheme no fill can be, since that surface is sunk
    // below the board, so there each mark has a floor. A fill at the set's
    // upper step is where a mark scores least, and the floors are what a
    // step lighter would break: a piece stood 2.4 on it, the ring 2.8.
    const marks: [name: string, light: Color, dark: Color, floor: number][] = [
      // A cross, a digit, the border: ink, which the dark scheme inverts.
      ["ink", roles.INK, roles.PAPER, 7],
      ["a piece", roles.SHADED, inDark(roles.SHADED), 2.3],
      ["an error", roles.ERROR, inDark(roles.ERROR), 2.5],
      ["the hint's ring", roles.HINT_RING, inDark(roles.HINT_RING), 2.8],
      ["its outline", roles.HINT_OUTLINE, inDark(roles.HINT_OUTLINE), 2.8],
      ["the cursor", roles.CURSOR, inDark(roles.CURSOR), 3],
    ];
    const surface = roles.cellSurface(BG);
    for (const fill of colors.REGION_FILLS) {
      for (const [name, mark] of marks)
        expect(
          contrast(mark, fill),
          `${name} on ${key(fill)} in light`,
        ).toBeGreaterThan(contrast(mark, surface));
      for (const [name, , mark, floor] of marks)
        expect(
          contrast(mark, inDark(fill)),
          `${name} on ${key(fill)} in dark`,
        ).toBeGreaterThan(floor);
      for (const [scheme, on] of [
        ["light", fill],
        ["dark", inDark(fill)],
      ] as const) {
        // The hint's stripes, at the bar `hatch-contrast.test.ts` holds them
        // to on a board.
        const hint =
          scheme === "light" ? roles.HINT_STRIPES : inDark(roles.HINT_STRIPES);
        expect(
          contrast(striped(on, hint), on),
          `stripes on ${key(fill)} in ${scheme}`,
        ).toBeGreaterThan(1.25);
        // A surface that replaces the fill is told from it: the mistake's
        // wash and the win flash, at the floor two neighbors are held to.
        for (const [name, surface] of [
          ["the mistake wash", roles.ERROR_WASH],
          ["the flash", roles.FLASH],
        ] as const)
          expect(
            apart(scheme === "light" ? surface : inDark(surface), on),
            `${name} on ${key(fill)} in ${scheme}`,
          ).toBeGreaterThan(0.07);
      }
    }
  });

  it("keeps a hint reference's colors to the bars a mark is held to, in both schemes", () => {
    // A reference's marks are repainted in its color over whatever they sit
    // on, so each color is a mark on the cell surface and on every region
    // fill. The bars are the ring's: in light no worse than `HINT_RING` on
    // the surface, which a fill only lightens; in dark the ring's floor on
    // the darkest of them. The lime, amber and cyan these replaced read at
    // 1.14-1.36:1 on the light surface.
    const inDark = (c: Color): Color => darkValue(c) ?? c;
    const relLum = (c: Color): number => {
      const lin = (v: number) =>
        v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    };
    const contrast = (a: Color, b: Color): number => {
      const [hi, lo] = [relLum(a), relLum(b)].sort((p, q) => q - p);
      return (hi + 0.05) / (lo + 0.05);
    };
    const striped = (under: Color, stripe: Color): Color =>
      [0, 1, 2].map(
        (i) => under[i] * (1 - HATCH_OPACITY) + stripe[i] * HATCH_OPACITY,
      ) as unknown as Color;
    const apart = (a: Color, b: Color): number => {
      const plane = ([, c, h]: OKLCH): [number, number] =>
        isGrayChroma(c)
          ? [0, 0]
          : [c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];
      const [p, q] = [colorToOKLCH(a), colorToOKLCH(b)];
      const [px, py] = plane(p);
      const [qx, qy] = plane(q);
      return Math.hypot(p[0] - q[0], px - qx, py - qy);
    };
    const surface = roles.cellSurface(BG);
    const under = {
      light: [surface, ...colors.REGION_FILLS],
      dark: [inDark(surface), ...colors.REGION_FILLS.map(inDark)],
    };
    const all = Object.entries(colors.HINT_REFERENCE_COLORS).flatMap(([role, pool]) =>
      pool.map((c, i): [string, Color] => [`${role} ${i}`, c]),
    );
    expect(all.length).toBeGreaterThanOrEqual(9);
    for (const [name, c] of all) {
      expect(contrast(c, surface), `${name} on the surface in light`).toBeGreaterThan(
        2.5,
      );
      for (const fill of under.light)
        expect(
          contrast(c, fill),
          `${name} on ${key(fill)} in light`,
        ).toBeGreaterThanOrEqual(contrast(c, surface));
      for (const on of under.dark)
        expect(
          contrast(inDark(c), on),
          `${name} on ${key(on)} in dark`,
        ).toBeGreaterThan(2.8);
      if (name.startsWith("stripes"))
        for (const [scheme, list] of Object.entries(under))
          for (const on of list) {
            const s = scheme === "light" ? c : inDark(c);
            expect(
              contrast(striped(on, s), on),
              `${name} striped on ${key(on)} in ${scheme}`,
            ).toBeGreaterThan(1.25);
          }
    }
    // Any two may name references in one step, at the floor two neighbors
    // are held to.
    for (let i = 0; i < all.length; i++)
      for (let j = i + 1; j < all.length; j++) {
        const pair = `${all[i][0]}/${all[j][0]}`;
        expect(apart(all[i][1], all[j][1]), `${pair} in light`).toBeGreaterThan(0.07);
        expect(
          apart(inDark(all[i][1]), inDark(all[j][1])),
          `${pair} in dark`,
        ).toBeGreaterThan(0.07);
      }
  });

  it("keeps the free colors off every meaning drawn over a piece, in both schemes", () => {
    // A pair's line is drawn as the hint's is, so a free color near a mark's
    // reads as that mark: a blue pair as the hint's line, a red one as
    // broken. Held to 0.1 from each, above the 0.07 the hint's references
    // are held to from one another, and further from the error, the one a
    // player must never miss. Stripes are not among them: a hatch laid under a symbol is
    // not a line, and no game with these colors draws one.
    const inDark = (c: Color): Color => darkValue(c) ?? c;
    const relLum = (c: Color): number => {
      const lin = (v: number) =>
        v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    };
    const contrast = (a: Color, b: Color): number => {
      const [hi, lo] = [relLum(a), relLum(b)].sort((p, q) => q - p);
      return (hi + 0.05) / (lo + 0.05);
    };
    const apart = (a: Color, b: Color): number => {
      const plane = ([, c, h]: OKLCH): [number, number] =>
        isGrayChroma(c)
          ? [0, 0]
          : [c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];
      const [p, q] = [colorToOKLCH(a), colorToOKLCH(b)];
      const [px, py] = plane(p);
      const [qx, qy] = plane(q);
      return Math.hypot(p[0] - q[0], px - qx, py - qy);
    };
    const marks: [string, Color][] = [
      ["the cursor", roles.CURSOR],
      ["a held piece", roles.HELD],
      ["the drag", roles.DRAG_ADD],
      ...(["ring", "outline"] as const).flatMap((role) =>
        colors.HINT_REFERENCE_COLORS[role].map((c, i): [string, Color] => [
          `${role} ${i}`,
          c,
        ]),
      ),
    ];
    const surface = roles.cellSurface(BG);
    expect(colors.FREE.length).toBeGreaterThanOrEqual(4);
    for (const [k, c] of colors.FREE.entries())
      for (const [scheme, f] of [
        ["light", (x: Color) => x],
        ["dark", inDark],
      ] as const) {
        for (const [name, mark] of marks)
          expect(
            apart(f(c), f(mark)),
            `free${k} from ${name} in ${scheme}`,
          ).toBeGreaterThan(0.1);
        expect(
          apart(f(c), f(roles.ERROR)),
          `free${k} from the error in ${scheme}`,
        ).toBeGreaterThan(0.15);
        // A line of it reads on the cell, as the hint's ring does (2.5 in
        // light, less a hair for the amber, whose line is thick), and a
        // black number reads on a disc of it.
        expect(
          contrast(f(c), f(surface)),
          `free${k} on the cell in ${scheme}`,
        ).toBeGreaterThan(2.4);
        expect(
          contrast(f(c), colors.BLACK),
          `black on free${k} in ${scheme}`,
        ).toBeGreaterThan(3);
      }
  });

  it("keeps Signpost's chain colors apart, in both schemes", () => {
    // Two of its chains once took colors 0.009 apart, mixes of two fills
    // that had both gone gray. Every chain color is a region fill now, and
    // any two may be on the board together.
    const inDark = (c: Color): Color => darkValue(c) ?? c;
    const apart = (a: Color, b: Color): number => {
      const plane = ([, c, h]: OKLCH): [number, number] =>
        isGrayChroma(c)
          ? [0, 0]
          : [c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];
      const [p, q] = [colorToOKLCH(a), colorToOKLCH(b)];
      const [px, py] = plane(p);
      const [qx, qy] = plane(q);
      return Math.hypot(p[0] - q[0], px - qx, py - qy);
    };
    const chains = SIGNPOST_REGION_BACKGROUNDS.slice(1);
    expect(chains.length).toBeGreaterThanOrEqual(4);
    for (const scheme of [(c: Color) => c, inDark])
      for (let i = 0; i < chains.length; i++)
        for (let j = i + 1; j < chains.length; j++)
          expect(
            apart(scheme(chains[i]), scheme(chains[j])),
            `${i}/${j}`,
          ).toBeGreaterThan(0.07);
  });

  it("keeps the two-state pair off the hues spent on marks", () => {
    // A piece in a mark's hue swallows the mark drawn over it. The marks are
    // the error, the cursor, every hint role and every color a hint's
    // reference is repainted in, and orange, which a game with the pair gives
    // a hint premise no shared role names.
    const hue = (c: Color): number => colorToOKLCH(c)[2];
    const apart = (a: number, b: number): number => {
      const d = Math.abs(a - b) % 360;
      return Math.min(d, 360 - d);
    };
    const marks = Object.entries(roles).filter(
      (entry): entry is [string, Color] =>
        Array.isArray(entry[1]) &&
        (entry[0].startsWith("HINT_") ||
          entry[1] === roles.ERROR ||
          entry[1] === roles.CURSOR),
    );
    expect(marks.map(([name]) => name)).toContain("HINT_RING");
    for (const [role, pool] of Object.entries(colors.HINT_REFERENCE_COLORS))
      pool.forEach((c, i) => {
        marks.push([`${role} reference ${i}`, c]);
      });
    for (const [name, mark] of marks)
      colors.TWO.forEach((member, i) => {
        expect(
          apart(hue(member), hue(mark)),
          `${colors.TWO_NAMES[i].light} against ${name}`,
        ).toBeGreaterThan(30);
      });
  });

  it("keeps the clear square in the pair's second hue, and its mark faint but seen", () => {
    // A help page says a clear square turns `{{pair:1}}`, so the surface owes
    // that member its hue. The mark on it is the cross and a used-up number:
    // far enough from the surface to be read (the gray first drawn there sat
    // 0.04 from it in the dark scheme and was lost), and on the surface's side
    // of the scheme's ink, which is what makes it the faint one.
    const schemes: [string, (c: Color) => OKLCH, number][] = [
      ["light", colorToOKLCH, 0],
      [
        "dark",
        (c) => {
          const d = darkValue(c);
          if (!d) throw new Error("no dark value");
          return colorToOKLCH(d);
        },
        1,
      ],
    ];
    for (const [scheme, resolve, inkLightness] of schemes) {
      const surface = resolve(roles.CLEAR);
      const mark = resolve(roles.CLEAR_MARK);
      expect(surface[2], `hue in ${scheme}`).toBeCloseTo(resolve(colors.TWO[1])[2], 0);
      const step = Math.abs(mark[0] - surface[0]);
      expect(step, `mark against surface in ${scheme}`).toBeGreaterThan(0.2);
      expect(step, `mark against ink in ${scheme}`).toBeLessThan(
        Math.abs(inkLightness - surface[0]) - 0.15,
      );
    }
  });

  it("keeps every derived role visible against both host backgrounds", () => {
    // The app hands games pure white in dark mode, so a derived role that only
    // separates from a light background is the Spokes COL_DONE bug waiting to
    // happen.
    const distance = (a: Color, b: Color) =>
      Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    let checked = 0;
    for (const bg of [BG, [1, 1, 1] as Color]) {
      const { background, highlight } = mkhighlight(bg);
      for (const [name, value] of Object.entries(roles)) {
        if (typeof value !== "function") continue;
        const derived = resolve(value, background, highlight);
        if (!Array.isArray(derived) || derived.length !== 3) continue;
        expect(
          distance(derived, background),
          `${name} against ${bg.join(",")}`,
        ).toBeGreaterThan(0.05);
        checked++;
      }
    }
    // Two filters stand between the roles and the assertion, and either going
    // empty would leave this green over nothing.
    expect(checked, "no derived role reached the assertion").toBeGreaterThan(0);
  });
});
