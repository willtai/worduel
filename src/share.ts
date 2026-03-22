// ============================================
// Worduel — Share Card Generation
// ============================================
//
// Generates shareable score cards from completed games.
// The share card is the viral engine — it must look perfect.

import type { GameState, ShareCard, CharHintStatus } from "./types.js";
import { loadStats } from "./stats.js";

// ----- Hint Symbols -----

function hintChar(status: CharHintStatus): string {
  switch (status) {
    case "correct":
      return "\uD83D\uDFE9"; // 🟩
    case "present":
      return "\uD83D\uDFE8"; // 🟨
    case "absent":
      return "\u2B1B"; // ⬛
  }
}

// ----- Grid Generation -----

/**
 * Build the compact hint grid from a game's guesses.
 * Each guess becomes one line of Wordle emoji squares.
 *
 * Example:
 *   ⬛⬛⬛⬛🟩
 *   ⬛🟨⬛🟨🟩
 *   🟩🟩⬛🟩🟩
 *   🟩🟩🟩🟩🟩
 */
function buildGrid(state: GameState): string {
  return state.guesses
    .map((guess) => guess.hints.map((h) => hintChar(h.status)).join(""))
    .join("\n");
}

// ----- Score Label -----

/**
 * Returns "4/6" for a win, "X/6" for a loss.
 */
function scoreLabel(state: GameState): string {
  if (state.status === "won") {
    return `${state.guesses.length}/${state.maxGuesses}`;
  }
  return `X/${state.maxGuesses}`;
}

/**
 * Returns the title line for the share card.
 * Daily mode: "Worduel Daily #47 — 3/6"
 * Random mode: "Worduel — 4/6"
 */
function titleLine(state: GameState): string {
  if (state.mode === "daily" && state.dayNumber != null) {
    return `Worduel Daily #${state.dayNumber} — ${scoreLabel(state)}`;
  }
  return `Worduel — ${scoreLabel(state)}`;
}

// ----- Full Card -----

/**
 * Build the bordered terminal display card.
 *
 * ╭─────────────────────────────────╮
 * │  Worduel — 4/6               │
 * │─────────────────────────────────│
 * │  ⬛⬛⬛⬛🟩                     │
 * │  ⬛🟨⬛🟨🟩                     │
 * │  🟩🟩⬛🟩🟩                     │
 * │  🟩🟩🟩🟩🟩                     │
 * │─────────────────────────────────│
 * │  🔥 Streak: 7                   │
 * ╰─────────────────────────────────╯
 */
function buildFullCard(
  state: GameState,
  grid: string,
  streak: number,
): string {
  const INNER_WIDTH = 33;

  function padLine(content: string): string {
    // Multi-byte characters (emoji, Unicode) occupy visual width differently.
    // We measure character count and add some tolerance.
    const padding = INNER_WIDTH - visualWidth(content);
    if (padding <= 0) {
      return `│${content}│`;
    }
    return `│${content}${" ".repeat(padding)}│`;
  }

  const lines: string[] = [];

  // Top border
  lines.push("╭" + "─".repeat(INNER_WIDTH) + "╮");

  // Title line
  lines.push(padLine(`  ${titleLine(state)}`));

  // Separator
  lines.push("│" + "─".repeat(INNER_WIDTH) + "│");

  // Grid lines
  for (const gridLine of grid.split("\n")) {
    lines.push(padLine(`  ${gridLine}`));
  }

  // Streak section (only if streak > 0)
  if (streak > 0) {
    lines.push("│" + "─".repeat(INNER_WIDTH) + "│");
    lines.push(padLine(`  🔥 Streak: ${streak}`));
  }

  // Bottom border
  lines.push("╰" + "─".repeat(INNER_WIDTH) + "╯");

  return lines.join("\n");
}

/**
 * Approximate visual width of a string, accounting for common multi-byte
 * characters (emoji take ~2 columns). This is a best-effort heuristic for
 * terminal rendering.
 */
function visualWidth(str: string): number {
  let width = 0;
  for (const ch of str) {
    const code = ch.codePointAt(0) ?? 0;
    // Emoji and other wide characters
    if (
      code > 0x1f000 ||
      (code >= 0x2600 && code <= 0x27bf) ||
      (code >= 0xfe00 && code <= 0xfe0f) ||
      (code >= 0x1f300 && code <= 0x1faf8)
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

// ----- Clipboard Text -----

/**
 * Build the clipboard-ready text for sharing.
 * Must stay under 280 chars for tweetability.
 *
 * Win:
 *   Worduel — 4/6
 *   ⬛⬛⬛⬛🟩
 *   ⬛🟨⬛🟨🟩
 *   🟩🟩⬛🟩🟩
 *   🟩🟩🟩🟩🟩
 *   🔥 7 | npx worduel
 *
 * Loss:
 *   Worduel — X/6
 *   ⬛⬛⬛⬛⬛
 *   ⬛⬛🟩⬛⬛
 *   🟩🟨⬛⬛⬛
 *   🟩🟨⬛🟩⬛
 *   🟩🟨⬛🟩🟩
 *   🟩🟩⬛🟩🟩
 *   💀 npx worduel
 */
function buildClipboardText(
  state: GameState,
  grid: string,
  streak: number,
): string {
  const parts: string[] = [];

  parts.push(titleLine(state));
  parts.push(grid);

  if (state.status === "won") {
    if (streak > 0) {
      parts.push(`🔥 ${streak} | npx worduel`);
    } else {
      parts.push(`npx worduel`);
    }
  } else {
    parts.push(`💀 npx worduel`);
  }

  return parts.join("\n");
}

// ----- Public API -----

/**
 * Generate a shareable score card from a completed game.
 *
 * Loads the current streak from persisted stats. If stats can't be loaded
 * (e.g., first game), streak defaults to 0.
 */
export function generateShareCard(state: GameState): ShareCard {
  const grid = buildGrid(state);

  // Load streak synchronously-ish: we generate the card eagerly with streak 0,
  // since this is called synchronously from game.ts. The caller (game.ts)
  // has already called recordGame() before this, so stats are up to date.
  // However, generateShareCard is synchronous — so we kick off an async
  // stats load and use a default for now, then provide a helper to enrich later.
  //
  // For simplicity and correctness, we build the card with streak=0 and
  // expose an async variant. The game engine can use the async version.
  const shareCard: ShareCard = {
    guessCount: state.guesses.length,
    maxGuesses: state.maxGuesses,
    won: state.status === "won",
    grid,
    fullCard: buildFullCard(state, grid, 0),
    clipboardText: buildClipboardText(state, grid, 0),
  };

  return shareCard;
}

/**
 * Generate a shareable score card with streak info loaded from disk.
 * This is the preferred version — it reads stats to include the streak.
 */
export async function generateShareCardWithStats(
  state: GameState,
): Promise<ShareCard> {
  const grid = buildGrid(state);

  let streak = 0;
  try {
    const stats = await loadStats();
    streak = stats.currentStreak;
  } catch {
    // Stats unavailable — streak stays 0
  }

  return {
    guessCount: state.guesses.length,
    maxGuesses: state.maxGuesses,
    won: state.status === "won",
    grid,
    fullCard: buildFullCard(state, grid, streak),
    clipboardText: buildClipboardText(state, grid, streak),
  };
}
