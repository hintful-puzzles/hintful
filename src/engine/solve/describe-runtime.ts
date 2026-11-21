/**
 * What a compiled technique reads: the grid's elements numbered, the marks,
 * and the dealt clues. `compile.ts` writes code against these and nothing
 * else, so these are the whole of a technique's view of a board.
 *
 * An element is its index: a cell `y·w + x`, a line its row `y`, `h + x`
 * for a column, and after the columns a space's boxes and then its
 * diagonals, an edge its place in {@link GridSpace.edgeEnds}, a corner
 * `y·(w − 1) + x` for the one below and right of cell `(x, y)`, a point
 * `y·(w + 1) + x` for the one above and left of it, a rectangle `a·n + b`
 * for its top left cell `a` and bottom right `b` on a grid of `n` cells, a
 * region its part's index in its {@link Partition}. `-1` is
 * `none`, for an element and for a value alike, since no value is negative.
 * A set of values is a bitmask (bit `d`); a set of elements an ordered array.
 *
 * The modules under `describe-runtime/` hold the runtime; this one names all
 * of it in one place, since a compiled module imports from one path
 * (`describe/sources.ts`).
 */

export {
  ahead,
  beam,
  beamOf,
  type SightAt,
  sightAhead,
  sightEntry,
  sightSets,
  sights,
  sightTurn,
  traceBeam,
  traceSight,
} from "./describe-runtime/beams.ts";
export {
  freshBinding,
  setKeptCheck,
  setStaleCheck,
  staleChecking,
} from "./describe-runtime/checks.ts";
export {
  type ClueList,
  clueAt,
  clueList,
  cluesValued,
  cluesWhere,
  type ListClues,
  listAt,
  listClues,
  listLength,
  nth,
  perBoard,
  perElement,
  perPlace,
  perValue,
  runFits,
  runsOf,
  sameList,
} from "./describe-runtime/clues.ts";
export {
  cellsValued,
  type EdgeGroups,
  type EdgeHolds,
  edgeGroups,
  forkKept,
  type GroupChanges,
  type Kept,
  keptEdgeGroups,
  keptStore,
} from "./describe-runtime/kept.ts";
export {
  chain,
  chainEnd,
  chainHas,
  chainHolders,
  chainHolds,
  chainLength,
  compass,
  lastOf,
  onward,
  ray,
  slash,
  step,
  through,
  throughWhere,
} from "./describe-runtime/lines.ts";
export {
  linked,
  linkedOf,
  linkedSum,
  linkedWith,
  pointGroups,
} from "./describe-runtime/links.ts";
export {
  brokeAt,
  EdgeRelation,
  type Facts,
  type Fire,
  type Footprint,
  type FootprintStep,
  type Inverse,
  inverseOf,
  MARK,
  type Marks,
  PLACE,
  RELATE,
  type Reads,
  relationKey,
  STRIKE,
  STRIKE_EDGE,
  type Witness,
  witnessAll,
  witnessNodes,
  witnessOfDef,
} from "./describe-runtime/marks.ts";
export {
  connected,
  cutEdges,
  cuts,
  matched,
  reaches,
  stretch,
  stretchWhere,
} from "./describe-runtime/reach.ts";
export {
  rectCells,
  rectHeight,
  rectHolds,
  rectInner,
  rectMeets,
  rectRim,
  rectsOf,
  rectWidth,
  rectWithin,
} from "./describe-runtime/rects.ts";
export {
  addOnce,
  before,
  facesOf,
  held,
  iadd,
  idiv,
  imod,
  imul,
  isub,
  least,
  memberMarks,
  minus,
  nextOfSize,
  popcount,
  rangeMask,
  sameSet,
  setOf,
  stamps,
  subsetOf,
  union,
  valuesOf,
} from "./describe-runtime/sets.ts";
export {
  describedSpace,
  type EdgeGeometry,
  type GridSpace,
  latinSpace,
  opp,
  type Partition,
  partition,
  type Tiling,
  tilingSpace,
  within,
} from "./describe-runtime/space.ts";
export {
  apart,
  apartThrough,
  decidedAll,
  decidedIf,
  heldIn,
  knownIn,
  overDomain,
  stoppedAt,
  undecided,
  unmatched,
  type Violation,
} from "./describe-runtime/violations.ts";
