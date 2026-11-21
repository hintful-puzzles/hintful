/**
 * The record shape a recording solver emits, and the callback it emits through
 * (`CellMarks.recorder`): a game whose hint records its ladder's firings reads
 * them back as these. The reason is `unknown` so each game attaches its own.
 */

/** One recorded deduction operation. Emitted in solver order on the hint path;
 * `group` ties together every record of a single deduction *firing* (one
 * top-level deduction attempt), so a firing forcing several strikes becomes one
 * grouped hint step. `reason` is the game's own reason object. */
export interface DeductionRecord {
  kind: "place" | "elim";
  x: number;
  y: number;
  n: number;
  reason: unknown;
  group: number;
}

export type DeductionRecorder = (rec: DeductionRecord) => void;
