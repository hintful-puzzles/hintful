/**
 * **The Game controls: everything the game in play brings, and nothing else.**
 * In the same order in every game: its keys, then the controls that change
 * what a press means (the note toggle, the button toggle), then its own
 * commands (Fill or Update marks, Reference).
 *
 * Each is present by what the game is, read off the `Puzzle`, so no game is
 * listed here. A game that brings none of them has no panel: the host carries
 * `empty`, and the puzzle screen's grid gives its room to the board.
 *
 * The panel never scrolls. Beside the board it lays the keys out in as many
 * columns as its height needs.
 */
import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { PENCIL_MODE_BUTTON } from "../../engine/pointer.ts";
import type { KeyLabel } from "../../engine/types.ts";
import { settings } from "../../store/settings.ts";
import { cssWATweaks } from "../../utils/css.ts";
import { awaitsFirstBoard } from "../board-commands.ts";
import { puzzleContext } from "../contexts.ts";
import type { Puzzle } from "../puzzle.ts";

// Component registration
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/radio/radio.js";
import "@awesome.me/webawesome/dist/components/radio-group/radio-group.js";
import "./keys.ts";

export type SwapButtonsEvent = CustomEvent<{ swap: boolean }>;

/** The key columns a side panel starts from, before its height is measured. */
function startingColumns(keyCount: number): number {
  return keyCount > 5 ? 2 : 1;
}

@customElement("puzzle-game-controls")
export class PuzzleGameControls extends SignalWatcher(LitElement) {
  @consume({ context: puzzleContext, subscribe: true })
  @state()
  private puzzle?: Puzzle;

  /** Beside the board, or under it. */
  @property({ type: String, reflect: true })
  along: "side" | "under" = "under";

  /** Whether a press on the board is being sent as the secondary button. */
  @property({ type: Boolean, attribute: "swap-buttons" })
  swapButtons = false;

  /** Whether the reference panel is open, so its control can say which way a
   * press will go. */
  @property({ type: Boolean, attribute: "reference-open" })
  referenceOpen = false;

  /** The game brings nothing, and the panel takes no room. */
  @property({ type: Boolean, reflect: true })
  empty = true;

  @state()
  private keyLabels: KeyLabel[] = [];

  /** The key columns in a side panel: {@link startingColumns}, and more
   * while the panel is too short for its content. */
  @state()
  private columns = 1;

  @query("[part=base]")
  private base?: HTMLElement;

  private renderedParams: string | null = null;
  private fittedHeight = 0;
  private watchedBase: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => this.refit());
    this.resizeObserver.observe(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.watchedBase = null;
  }

  protected override willUpdate() {
    // The available keys can vary with changes to puzzle params.
    // (This should really be an effect on this.puzzle?.currentParams,
    // but @lit-labs/signals doesn't have effects yet.)
    const currentParams = this.puzzle?.currentParams ?? null;
    if (currentParams !== this.renderedParams) {
      this.renderedParams = currentParams;
      void this.loadKeyLabels();
    }
    this.empty = this.characterKeys.length === 0 && !this.hasOthers;
  }

  private async loadKeyLabels() {
    this.keyLabels = (await this.puzzle?.requestKeys()) ?? [];
    this.columns = startingColumns(this.characterKeys.length);
  }

  /** Whether the game brings anything besides keys that type. */
  private get hasOthers(): boolean {
    return (
      this.noteKey !== null ||
      this.showsButtonToggle ||
      this.puzzle?.canMarkAll === true ||
      this.puzzle?.hasReference === true
    );
  }

  private get shownKeys(): KeyLabel[] {
    return settings.showPuzzleKeyboard ? this.keyLabels : [];
  }

  /** The keys that type something, as against the one that is a mode. */
  private get characterKeys(): KeyLabel[] {
    return this.shownKeys.filter((key) => key.button !== PENCIL_MODE_BUTTON);
  }

  private get noteKey(): KeyLabel | null {
    return this.shownKeys.find((key) => key.button === PENCIL_MODE_BUTTON) ?? null;
  }

  /** The inherited left-button and right-button toggle, for a player who has
   * asked for it, in a game that has a secondary action to swap to. */
  private get showsButtonToggle(): boolean {
    return (
      settings.showMouseButtonToggle && this.puzzle?.ignoresSecondaryButton === false
    );
  }

  protected override render() {
    const puzzle = this.puzzle;
    const keys = this.characterKeys;
    const noteKey = this.noteKey;
    const others = this.hasOthers;
    if (!puzzle || this.empty) return nothing;

    return html`
      <div part="base" role="group" aria-label="${puzzle.displayName} controls">
        ${
          keys.length > 0
            ? html`<puzzle-keys
                .keys=${keys}
                .columns=${this.along === "side" ? this.columns : null}
              ></puzzle-keys>`
            : nothing
        }
        ${
          others
            ? html`<div part="others">
                ${
                  noteKey
                    ? html`<puzzle-keys labeled .keys=${[noteKey]}></puzzle-keys>`
                    : nothing
                }
                ${this.showsButtonToggle ? this.renderButtonToggle() : nothing}
                ${
                  puzzle.canMarkAll
                    ? html`
                      <wa-button
                          data-command="mark-all"
                          ?disabled=${puzzle.isSolved || awaitsFirstBoard("mark-all", puzzle)}
                      >
                        <wa-icon slot="start" name="mark-all"></wa-icon>
                        ${
                          // The press does double duty on purpose: fill the bare
                          // cells, or narrow what a placed value has ruled out.
                          puzzle.hasPencilMarks ? "Update marks" : "Fill marks"
                        }
                      </wa-button>`
                    : nothing
                }
                ${
                  puzzle.hasReference
                    ? html`
                      <wa-button data-command="toggle-reference">
                        <wa-icon slot="start" name="reference"></wa-icon>
                        ${this.referenceOpen ? "Hide reference" : "Reference"}
                      </wa-button>`
                    : nothing
                }
              </div>`
            : nothing
        }
      </div>
    `;
  }

  private renderButtonToggle() {
    return html`
      <wa-radio-group
          part="button-toggle"
          appearance="button"
          orientation="horizontal"
          aria-label="A press on the board acts as"
          .value=${this.swapButtons ? "right" : "left"}
          @change=${this.handleButtonToggle}
      >
        <wa-radio appearance="button" value="left">
          <wa-icon name="mouse-left-button"></wa-icon> Left
        </wa-radio>
        <wa-radio appearance="button" value="right">
          <wa-icon name="mouse-right-button"></wa-icon> Right
        </wa-radio>
      </wa-radio-group>
    `;
  }

  private handleButtonToggle(event: Event) {
    // The radio group's own `change` stops at this shadow root.
    event.stopPropagation();
    const swap = (event.target as HTMLInputElement).value === "right";
    this.dispatchEvent(
      new CustomEvent("puzzle-swap-buttons", {
        detail: { swap },
        bubbles: true,
        composed: true,
      }) satisfies SwapButtonsEvent,
    );
  }

  protected override updated() {
    // The content is watched as well as the panel: a key grows when its font
    // or icon arrives, with no render and no change in the panel's own size.
    if (this.base && this.base !== this.watchedBase) {
      if (this.watchedBase) this.resizeObserver?.unobserve(this.watchedBase);
      this.watchedBase = this.base;
      this.resizeObserver?.observe(this.base);
    }
    this.fitColumns();
  }

  /**
   * The panel or its content changed size. A new height for the panel starts
   * again from the fewest columns, since it may have grown. Only its height,
   * because a key column added here makes the panel wider, and answering that
   * would undo the column that caused it.
   */
  private refit() {
    if (this.clientHeight !== this.fittedHeight) {
      this.fittedHeight = this.clientHeight;
      this.columns = startingColumns(this.characterKeys.length);
    }
    this.fitColumns();
  }

  /** One more key column while the content is taller than the panel. Each
   * step re-renders and measures again, and stops at one key to a row. */
  private fitColumns() {
    if (this.along !== "side" || !this.base) return;
    const overflows = this.base.scrollHeight > this.clientHeight;
    if (overflows && this.columns < this.characterKeys.length) this.columns++;
  }

  static override styles = [
    cssWATweaks,
    css`
      :host {
        display: block;
        box-sizing: border-box;
        min-width: 0;
        min-height: 0;
      }

      :host([empty]) {
        display: none;
      }

      :host([along="side"]) {
        overflow: hidden;
        background-color: var(--app-color-rail);
      }

      [part="base"] {
        --gap: var(--wa-space-s);

        /* Border-box, so the side panel's full-height base measures as tall
         * as the panel and no taller: the column fit compares the two. */
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: var(--gap);
        padding: 0 var(--app-spacing) var(--wa-space-xs);
      }

      :host([along="side"]) [part="base"] {
        flex-direction: column;
        flex-wrap: nowrap;
        min-height: 100%;
        padding: var(--wa-space-s);
      }

      /* Under the board, one row that wraps; beside it, one column whose
       * controls are all the column's width. */
      [part="others"] {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--gap);
      }

      :host([along="side"]) [part="others"] {
        flex-direction: column;
        flex-wrap: nowrap;
        align-self: stretch;
      }

      wa-button {
        /* Disable double-tap to zoom on a control that may be tapped quickly.
         * (Ineffective in iOS Safari; see preventDoubleTapZoomOnButtons.) */
        touch-action: pinch-zoom;
      }

      wa-radio wa-icon {
        vertical-align: -0.125em;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "puzzle-game-controls": PuzzleGameControls;
  }
}
