import type { HintMarkLegend } from "../../engine/contract/game.ts";

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "the group to remove, ringed with an edge that shows on a group of any color.",
    outline:
      "a square that is the last of its color, or that has no square of its color beside it (*the outlined square*); or the other groups that also keep the board clearable (*the outlined groups*).",
    stripes:
      "another group whose removal would leave the board so it can never be cleared (*the striped group*).",
  },
};
