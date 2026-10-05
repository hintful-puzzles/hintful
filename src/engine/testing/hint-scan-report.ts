/**
 * What a hint-position scan reports (`hint-positions.ts`), in the form
 * `scripts/hint-scan.ts` reads back. Its own module so the script can import
 * it without loading a test harness.
 *
 * Dev/test-only; never imported by production code.
 */

/** The line of a scan's failure that carries its report as JSON. */
export const SCAN_REPORT_MARK = "HINT_SCAN_REPORT ";

export interface KindScanReport {
  /** Positions the kind held on. */
  held: number;
  /** The one to pin, as source text; null when it held on none. */
  pin: string | null;
}

export interface HintScanReport {
  game: string;
  /** Positions a hint was asked from. */
  walked: number;
  boards: number;
  /** Each kind the file pins, with whether the pin it has now still fires. */
  kinds: Record<string, KindScanReport & { kept: boolean }>;
  /** Each rung the file excuses from a pin. */
  unreached: Record<string, KindScanReport>;
}
