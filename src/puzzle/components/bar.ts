/**
 * **The Bar: the commands that are the same in every game.** It shows the
 * leading entries of `command-list.ts` and a `Menu` button, and the Menu
 * (`menu.ts`) holds the entries that follow.
 *
 * The Bar never scrolls. It reports how many entries fit its own size, as an
 * event, and the screen hands that length to the Bar and the Menu
 * together, so what the Bar sheds is at the head of the Menu in the same
 * render.
 */
import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { cssWATweaks } from "../../utils/css.ts";
import { windowSize } from "../../utils/window-size.ts";
import { awaitsFirstBoard } from "../board-commands.ts";
import {
  barLengthThatFits,
  type CommandEntry,
  commandList,
  cutCommandList,
  MIN_BAR_LENGTH,
} from "../command-list.ts";
import { puzzleContext } from "../contexts.ts";
import type { Puzzle } from "../puzzle.ts";
import { shortcutLabel } from "../shortcuts.ts";

// Component registration
import "@awesome.me/webawesome/dist/components/icon/icon.js";

export type PuzzleBarFitEvent = CustomEvent<{ length: number }>;

@customElement("puzzle-bar")
export class PuzzleBar extends SignalWatcher(LitElement) {
  @consume({ context: puzzleContext, subscribe: true })
  @state()
  private puzzle?: Puzzle;

  /** Along the bottom of the board, or down a side of it. */
  @property({ type: String, reflect: true })
  along: "bottom" | "side" = "bottom";

  /** How many of the list's leading entries to show. */
  @property({ type: Number })
  length = MIN_BAR_LENGTH;

  /** Whether the Menu is showing, for the `Menu` button's pressed state. */
  @property({ type: Boolean, attribute: "menu-open" })
  menuOpen = false;

  /** Draw the `Menu` button before the commands: the screen sets it where the
   * Menu opens at that end of the Bar, so the button is beside what it opens. */
  @property({ type: Boolean, attribute: "menu-first" })
  menuFirst = false;

  /** The Menu is open over the board, as a modal: the `Menu` button under it
   * closes it, and no other slot can be reached until it has. */
  @property({ type: Boolean, attribute: "menu-over", reflect: true })
  menuOver = false;

  /** Wide enough to give every slot room around its caption. */
  @property({ type: Boolean, reflect: true })
  roomy = false;

  private resizeObserver: ResizeObserver | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => this.reportFit());
    this.resizeObserver.observe(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private get entries(): CommandEntry[] {
    return this.puzzle ? commandList(this.puzzle, "") : [];
  }

  protected override updated() {
    // The hint's slot is in the measure, so a puzzle arriving can change what
    // fits without the Bar changing size.
    this.reportFit();
  }

  private reportFit() {
    const extent = this.along === "side" ? this.clientHeight : this.clientWidth;
    // Not laid out yet: there is nothing to fit against.
    if (extent === 0) return;
    const { rem } = windowSize.get();
    this.roomy = this.along === "bottom" && extent >= 46 * rem;
    const length = barLengthThatFits(this.entries, extent, rem, this.along);
    if (length !== this.length) {
      this.dispatchEvent(
        new CustomEvent("puzzle-bar-fit", {
          detail: { length },
          bubbles: true,
          composed: true,
        }) satisfies PuzzleBarFitEvent,
      );
    }
  }

  protected override render() {
    const { bar } = cutCommandList(this.entries, this.length);
    const menuButton = html`
      <button
          part="slot menu-button"
          type="button"
          aria-pressed=${this.menuOpen ? "true" : "false"}
          @click=${this.handleMenuButton}
      >
        <wa-icon name="more"></wa-icon>
        <span part="caption">Menu</span>
      </button>
    `;
    // The `Menu` button opens a panel and the other slots act on the board, so
    // a rule sets it apart from them.
    const rule = html`<span part="rule" aria-hidden="true"></span>`;
    return html`
      <nav part="base" aria-label="Puzzle commands">
        ${this.menuFirst ? [menuButton, rule] : nothing}
        ${bar.map((entry) => this.renderSlot(entry))}
        ${this.menuFirst ? nothing : [rule, menuButton]}
      </nav>
    `;
  }

  /**
   * One slot: an icon over its caption, the same shape for every command. The
   * key that runs it is not drawn. It is in the tooltip, with the command's
   * full name where the caption is a shorter one.
   */
  private renderSlot(entry: CommandEntry) {
    const key = shortcutLabel(entry.id);
    return html`
      <button
          part=${entry.id === "hint" ? "slot hint" : "slot"}
          type="button"
          data-command=${entry.id}
          title=${key ? `${entry.label} (${key})` : entry.label}
          ?disabled=${entry.disabled === true || awaitsFirstBoard(entry.id, this.puzzle ?? null)}
      >
        <wa-icon name=${entry.icon}></wa-icon>
        <span part="caption">${entry.barLabel ?? entry.label}</span>
      </button>
    `;
  }

  private handleMenuButton() {
    this.dispatchEvent(
      new CustomEvent("puzzle-menu-toggle", { bubbles: true, composed: true }),
    );
  }

  static override styles = [
    cssWATweaks,
    css`
      :host {
        display: block;
        box-sizing: border-box;
        min-width: 0;
        min-height: 0;
        background-color: var(--app-color-rail);
        border-block-start: 1px solid var(--app-color-hairline);
      }

      :host([along="side"]) {
        border-block-start: none;
      }

      * {
        box-sizing: border-box;
      }

      [part="base"] {
        display: flex;
        align-items: stretch;
        justify-content: center;
        gap: var(--wa-space-2xs);
        padding: var(--wa-space-2xs);
        /* Below the home indicator on a phone with one. */
        padding-block-end: max(var(--wa-space-2xs), env(safe-area-inset-bottom));
      }

      :host([along="side"]) [part="base"] {
        flex-direction: column;
        justify-content: flex-start;
        gap: 2px;
        width: 4.75rem;
        height: 100%;
        padding: 0.25rem 0.3125rem;
        padding-inline-start: max(0.3125rem, env(safe-area-inset-left));
      }

      /* A caption wraps only when the Bar is squeezed. The tap-target floor
       * sits on the caption, not the button, so the button keeps flexbox's own
       * floor of its longest word: a min-width on the button replaced that
       * floor, and the hint's label overflowed onto its neighbors. */
      [part~="slot"] {
        flex: 0 4 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        min-height: var(--app-row-tool-phone);
        padding-inline: 0.25rem;
        border: 1px solid transparent;
        border-radius: var(--app-radius-control);
        background: none;
        color: var(--app-color-text);
        font: inherit;
        font-size: var(--app-font-size-micro);
        cursor: pointer;
        touch-action: pinch-zoom;

        &:disabled {
          color: var(--app-color-text-faintest);
          cursor: default;
        }

        &:focus-visible {
          outline: var(--wa-focus-ring);
          outline-offset: var(--wa-focus-ring-offset);
        }

        &[aria-pressed="true"] {
          background-color: var(--app-color-row-rule);
          border-color: var(--app-color-control-border);
        }

        @media (hover: hover) {
          &:hover:not(:disabled) {
            background-color: var(--app-color-row-rule);
          }
        }

        wa-icon {
          font-size: 1.125rem;
        }
      }

      /* Under a modal Menu the other slots read as out of reach, which they
       * are, and the Menu button reads as the way back. */
      :host([menu-over]) [part="slot"],
      :host([menu-over]) [part~="hint"] {
        opacity: 0.4;
      }

      [part="rule"] {
        flex: 0 0 1px;
        align-self: stretch;
        margin: 0.375rem 0.125rem;
        background-color: var(--app-color-hairline);
      }

      :host([roomy]) [part="rule"] {
        margin-inline: 0.75rem;
      }

      /* Down a side the Bar's height is what runs out, so the rule takes a
       * pixel of it and no margin. */
      :host([along="side"]) [part="rule"] {
        margin: 0 0.375rem;
      }

      [part="caption"] {
        /* The 44px target, less the button's padding and border. */
        min-width: calc(var(--app-tap-min) - 0.5rem - 2px);
        line-height: 1.15;
        text-align: center;
        text-wrap: balance;
      }

      :host([roomy]) [part~="slot"] {
        min-width: 5.25rem;
        padding-inline: 0.625rem;
      }

      :host([along="side"]) [part~="slot"] {
        flex: 0 0 auto;
        min-height: 3.25rem;
        padding: 2px;
      }

      /* The hint is drawn as its neighbors are, and takes the free space along
       * the bottom from a basis of zero: its width is then what its neighbors
       * leave and not what its caption needs, so arming the hint lengthens the
       * caption and moves no slot. With room it is a fixed width, wide enough
       * for the armed caption on one line.
       *
       * It is NOT filled, deliberately: an accent control reads as advice, and
       * whether to take a hint is the player's choice. */
      :host([along="bottom"]) [part~="hint"] {
        flex: 1 1 0;
        max-width: 8rem;
      }

      :host([roomy]) [part~="hint"] {
        flex: 0 0 6.5rem;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "puzzle-bar": PuzzleBar;
  }
}
