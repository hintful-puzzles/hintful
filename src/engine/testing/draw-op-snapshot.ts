/**
 * How a recorded draw op is written into a snapshot: by the colors it paints,
 * without the palette indices the game passed. A game's colors are positional,
 * so removing one renumbers every later index and the engine's inks after them;
 * keyed by index, every frame in the game would change. Keyed by what it paints,
 * only the frames that used the removed color do.
 *
 * Two palette slots of one color read alike here, as they look alike to the
 * player. A test that means a particular slot asserts the index, which the
 * record still carries (`op.color === COL_HINT`).
 *
 * Registered for every test file in `vitest.config.ts`.
 */
import type { SnapshotSerializer } from "vitest";
import type { DrawOp } from "./recording-drawing.ts";

type PaintingOp = Exclude<DrawOp, { op: "clip" } | { op: "unclip" }>;

const PAINTING_KINDS: ReadonlySet<unknown> = new Set<PaintingOp["op"]>([
  "rect",
  "line",
  "polygon",
  "circle",
  "text",
  "hatch",
  "ring",
]);

/** A recorded op still carrying an index. The copy `serialize` prints has none,
 * so this does not match it again. */
function carriesIndex(val: unknown): val is PaintingOp {
  if (typeof val !== "object" || val === null || !("op" in val)) return false;
  return PAINTING_KINDS.has(val.op) && ("color" in val || "fill" in val);
}

/** The fields of a {@link PaintingOp} that hold a palette index. */
const INDEX_FIELDS: ReadonlySet<string> = new Set(["color", "fill", "outline"]);

const drawOpSnapshot: SnapshotSerializer = {
  test: carriesIndex,
  serialize(val: PaintingOp, config, indentation, depth, refs, printer) {
    const painted = Object.fromEntries(
      Object.entries(val).filter(([field]) => !INDEX_FIELDS.has(field)),
    );
    return printer(painted, config, indentation, depth, refs);
  },
};

export default drawOpSnapshot;
