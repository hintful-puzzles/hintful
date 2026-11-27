/**
 * What a site is: something a fill board draws after its tiles, outside
 * them or over them, each a module of this folder and a line of `render.ts`'s
 * `SITES`, which paint in that list's order.
 */

import type { GameDrawing } from "../../../contract/game.ts";
import type { Clues, FillBoard } from "../../board.ts";
import type { FillUi } from "../../play.ts";
import type { FillDrawState } from "../../render.ts";
import type { CellLayout } from "../cell-text.ts";
import type { HintPass } from "../hint.ts";
import type { FillSetup } from "../setup.ts";
import type { RaisedAt, TileWords } from "../tile-word.ts";

/** What a site paints from, one frame. */
export interface SiteFrame<C extends Clues<C>> {
  readonly dr: GameDrawing;
  readonly ds: FillDrawState;
  readonly cx: FillSetup<C>;
  readonly lay: CellLayout;
  readonly state: FillBoard<C>;
  /** The board as the drag would leave it. */
  readonly shown: FillBoard<C>;
  readonly ui: FillUi;
  /** The clues the live errors break, by where they sit. */
  readonly errors: {
    readonly lineErrors: ReadonlySet<number>;
    readonly gapErrors: ReadonlySet<number>;
    readonly slotErrors: ReadonlySet<number>;
    readonly cornerErrors: ReadonlySet<number>;
    /** By place (`perPlace`), the clues one a value at lines. */
    readonly marginErrors: ReadonlySet<number>;
  };
  readonly hint: HintPass;
  /** The tiles' words this frame. */
  readonly tiles: readonly (TileWords | null)[];
  /** The raised values that reach into the square at `(x, y)`. */
  raisedInto(x: number, y: number): readonly RaisedAt[];
}

export interface FillSite {
  /** Whether a board of look `cx` has the site. */
  on<C extends Clues<C>>(cx: FillSetup<C>): boolean;
  paint<C extends Clues<C>>(f: SiteFrame<C>): void;
}
