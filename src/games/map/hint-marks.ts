/**
 * The mark Map's hint draws, as the engine's kind (`hint-words.ts`): a region
 * of the map, its band or its dashed line. `render.ts` paints it and the steps
 * `map.description.yaml` declares name it.
 */

import type { MarkKind } from "../../engine/hint-words.ts";

/** A region of the map, as a mark. */
export interface RegionMark {
  region: number;
}

export const REGION: MarkKind<RegionMark> = {
  name: "region",
  key: (r) => String(r.region),
};
