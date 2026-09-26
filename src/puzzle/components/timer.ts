import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { puzzleContext } from "../contexts.ts";
import type { Puzzle } from "../puzzle.ts";
import { formatElapsed } from "../timer.ts";

// Component registration
import "@awesome.me/webawesome/dist/components/icon/icon.js";

/**
 * The solve timer. **Absent, not blank**, while the player has it off for this
 * game, which is most games until they ask: an empty slot in a crowded top bar
 * is width taken from the game's name.
 */
@customElement("puzzle-timer")
export class PuzzleTimer extends SignalWatcher(LitElement) {
  @consume({ context: puzzleContext, subscribe: true })
  @state()
  private puzzle?: Puzzle;

  protected override render() {
    const timer = this.puzzle?.timer ?? null;
    if (timer === null) return nothing;
    // `role="timer"` is polite-off by definition: a screen reader reads the
    // time when asked rather than every second.
    return html`
      <span part="base" role="timer" aria-label="Time">
        <wa-icon part="icon" name="timer"></wa-icon>
        <span part="time">${formatElapsed(timer.seconds)}</span>
      </span>
    `;
  }

  static override styles = css`
    :host {
      display: contents;
    }

    [part="base"] {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--app-color-text-secondary, var(--wa-color-text-quiet));
      font-size: var(--app-font-size-body, 0.875rem);
      white-space: nowrap;
    }

    wa-icon {
      flex: 0 0 auto;
      color: var(--app-color-text-quiet, var(--wa-color-text-quiet));
    }

    [part="time"] {
      /* A count that changes every second: monospaced digits keep the bar from
       * twitching, as the move counter's do. */
      font-family: var(--app-font-mono, ui-monospace, monospace);
      font-weight: var(--wa-font-weight-semibold);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "puzzle-timer": PuzzleTimer;
  }
}
