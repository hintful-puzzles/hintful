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
import { settings } from "../../store/settings.ts";
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
export type SwapButtonsEvent = CustomEvent<{ swap: boolean }>;

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

  /** Whether a press on the board is being sent as the secondary button. */
  @property({ type: Boolean, attribute: "swap-buttons" })
  swapButtons = false;

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

  /**
   * The button toggle: one slot that, while it is on, sends a press on the
   * board as the right mouse button and a long press as the left. It is how a tap reaches a game's second
   * action without a long press. Absent in a game that ignores the secondary
   * button, which has nothing to swap to, and for a player who has turned it
   * off in Preferences.
   */
  private get showsButtonToggle(): boolean {
    return (
      settings.showMouseButtonToggle && this.puzzle?.ignoresSecondaryButton === false
    );
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
    const toggle = this.showsButtonToggle;
    // The whole leading run at its roomy width, which the toggle adds a slot
    // and a rule to.
    this.roomy = this.along === "bottom" && extent >= (toggle ? 46 : 40) * rem;
    const length = barLengthThatFits(this.entries, extent, rem, this.along, toggle);
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
    // The `Menu` button opens a panel, the button toggle is a mode, and the
    // slots between them act on the board, so a rule sets each end apart. The
    // toggle is at the end away from the Menu button.
    const rule = html`<span part="rule" aria-hidden="true"></span>`;
    const toggle = this.showsButtonToggle ? this.renderButtonToggle() : nothing;
    const withRule = (slot: unknown, ruleFirst: boolean) =>
      slot === nothing ? nothing : ruleFirst ? [rule, slot] : [slot, rule];
    const first = this.menuFirst ? menuButton : toggle;
    const last = this.menuFirst ? toggle : menuButton;
    return html`
      <nav part="base" aria-label="Puzzle commands">
        ${withRule(first, false)}
        ${bar.map((entry) => this.renderSlot(entry))}
        ${withRule(last, true)}
      </nav>
    `;
  }

  /**
   * A mode that is on or off, as a lit key: the caption and the icon name the
   * mode and never change, and only the pressed state does. A caption that
   * read `Left` or `Right` for the state in force sat among captions that
   * each name what a press does, and read as the opposite of what it did.
   */
  private renderButtonToggle() {
    const on = this.swapButtons;
    return html`
      <button
          part="slot swap"
          type="button"
          aria-label="Right-click mode"
          aria-pressed=${on ? "true" : "false"}
          title=${
            on
              ? "Right-click mode is on: a tap or click is a right-click, and a long press is a left-click"
              : "Right-click mode is off: a tap or click is a left-click"
          }
          @click=${this.handleButtonToggle}
      >
        <wa-icon name="mouse-right-button"></wa-icon>
        <span part="caption">Right click</span>
      </button>
    `;
  }

  private handleButtonToggle() {
    this.dispatchEvent(
      new CustomEvent("puzzle-swap-buttons", {
        detail: { swap: !this.swapButtons },
        bubbles: true,
        composed: true,
      }) satisfies SwapButtonsEvent,
    );
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
        ${this.renderCaption(entry)}
      </button>
    `;
  }

  /**
   * A caption standing in for another is drawn over the room of the one it
   * replaces: a slot is as wide as its caption, and the hint's slot takes
   * whatever its neighbors give up, so a shorter caption would move both.
   */
  private renderCaption(entry: CommandEntry) {
    const caption = entry.barLabel ?? entry.label;
    return entry.standsInFor === undefined
      ? html`<span part="caption">${caption}</span>`
      : html`<span part="caption" data-room=${entry.standsInFor}><span>${caption}</span></span>`;
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

        /* A mode in force changes what every tap on the board does, so it is
         * filled where an open Menu is only outlined: a player must not have
         * to look twice to know which a tap will be. */
        &[part~="swap"][aria-pressed="true"] {
          background-color: var(--wa-color-brand-fill-loud);
          border-color: var(--wa-color-brand-fill-loud);
          color: var(--wa-color-brand-on-loud);
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
      :host([menu-over]) [part~="swap"],
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

      /* The caption replaced is laid out unseen in the cell of the one
       * showing, and the cell is as wide and as tall as the larger. */
      [part="caption"][data-room] {
        display: grid;
        justify-items: center;
        align-items: center;

        &::before {
          content: attr(data-room);
          visibility: hidden;
        }

        &::before,
        & > span {
          grid-area: 1 / 1;
        }
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
        /* Room for the armed caption on two lines. Without the floor a full
         * Bar squeezes this slot first, the caption takes three, and the Bar
         * grows under the player's thumb. Another caption wraps instead. */
        min-width: 4rem;
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
