import type { PuzzleId } from "../engine/types.ts";

/**
 * Per-puzzle presentation metadata: how the palette behaves in dark mode.
 */
export interface PuzzleAugmentations {
  /**
   * Index of palette color used as background. (Default 0.)
   */
  paletteBgIndex?: number;

  darkMode?: {
    /**
     * Palette indexes that need special handling in automatic dark mode
     * generation. Set to:
     * - `false` to leave the puzzle's light-mode palette color unchanged
     *   in dark mode (e.g., for semantic "black" or "white")
     * - a number to scale the lightness of the calculated dark mode color
     * - an OKLCH color tuple to specify a fixed color
     */
    paletteOverrides?: Record<number, false | number | [number, number, number]>;

    /**
     * Pairs of palette index to swap after automatic dark mode generation.
     * Applied after any paletteOverrides.
     *
     * This is useful for puzzles that use game_mkhighlight to create a 3D
     * effect, where the inverted dark mode lightness results in swapping
     * embossed and inset appearances. (Not all uses of game_mkhighlight
     * should be swapped. E.g., cursor and selection indicators are usually
     * better left as is.)
     */
    paletteSwaps?: [number, number][];
  };
}

export const puzzleAugmentations: Partial<Record<PuzzleId, PuzzleAugmentations>> = {
  blackbox: {
    darkMode: {
      paletteSwaps: [[5, 6]], // 3D
    },
  },
  fifteen: {
    darkMode: {
      paletteSwaps: [[2, 3]], // 3D
    },
  },
  flood: {
    darkMode: {
      // The separator between regions is `BLACK`, a pinned token, so it needs
      // no override to stay black.
      paletteSwaps: [[12, 13]], // 3D
    },
  },
  inertia: {
    darkMode: {
      paletteSwaps: [[2, 3]], // 3D
    },
  },
  // Loopy's undecided and ruled-out edges take their dark values from the
  // shared palette (`lineMaybeColor` / `lineNoColor`); a lightness multiplier
  // here would darken an already-dark inversion into invisibility.
  mines: {
    darkMode: {
      paletteSwaps: [
        [0, 1], // cleared/uncleared background
        [16, 17], // 3D edges
      ],
    },
  },
  // Palisade's grid/clue/line-yes all share palette index 2; the undecided line
  // (index 3) takes its dark value from the shared `lineMaybeColor`. Separate
  // shares that palette.
  pearl: {
    darkMode: {
      paletteOverrides: { 0: 1.15 }, // lighten bg
    },
  },
  // Range's shaded square is a pinned `BLACK` piece and a known-white cell a
  // pinned `WHITE` one; ink, grid and the flash adapt with the scheme.
  samegame: {
    darkMode: {
      paletteSwaps: [[12, 13]], // 3D
    },
  },
  sixteen: {
    darkMode: {
      paletteSwaps: [[2, 3]], // 3D
    },
  },
  slide: {
    darkMode: {
      paletteSwaps: [
        [1, 2], // 3D
        [4, 5], // 3D dragging
        [7, 8], // main block 3D
        [10, 11], // main block 3D dragging
        [16, 17], // wall 3D
        [19, 20], // ordinary block 3D
      ],
    },
  },
  sokoban: {
    darkMode: {
      paletteSwaps: [[9, 10]], // 3D
    },
  },
  twiddle: {
    darkMode: {
      paletteSwaps: [
        [2, 4], // highlight/lowlight 3D
        [3, 5], // gentle highlight/lowlight
        // Indices 6 and 7 (the two cursor slots) both hold `CURSOR`, so they
        // need no swap.
      ],
    },
  },
  // Unruly's two tile bases author their dark values and `mkhighlightSpecific`
  // hands that on to each bevel trio, so "black" and "white" and their 3D
  // effects survive dark mode without a per-index override.
  untangle: {
    paletteBgIndex: 1,
  },
};
