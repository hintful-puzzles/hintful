import type { HintMarkLegend } from "../../engine/contract/game.ts";
import { type MarkKind, whole } from "../../engine/contract/hint-words.ts";

/** A ball, by the grid index of its slot. */
export const BALL: MarkKind<number> = { name: "ball", key: String };

/** The balls a pour moves, named as one run. */
export const RUN = whole(BALL);

/** A tube a pour lands in, by its index: drawn on the slots the balls will
 * fill. */
export const TUBE: MarkKind<number> = { name: "tube", key: String };

/** A pour other than the step's own, by the tubes it pours from and into. */
export interface Marked {
  readonly from: number;
  readonly to: number;
}

/** A rival pour, drawn over the balls it would move and the slots they would
 * fill. */
export const POUR: MarkKind<Marked> = { name: "pour", key: (m) => `${m.from}>${m.to}` };

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "the pour to make: the balls that go, and the slots in the tube they land in.",
    stripes:
      "another pour that would leave a board that can never be sorted: the balls it would move and where they would land (*the striped pour*).",
  },
};
