// ============================================
// Worduel — Player Stats Persistence
// ============================================
//
// Stores stats in ~/.worduel/stats.json.
// Uses atomic writes (write to temp, then rename) to avoid corruption.

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { STATS_DIR, STATS_FILE, DAILY_FILE, type PlayerStats, type DailyState } from "./types.js";
import { getTodayUTC } from "./words.js";

// ----- Paths -----

function getStatsDir(): string {
  return path.join(os.homedir(), STATS_DIR);
}

function getStatsPath(): string {
  return path.join(getStatsDir(), STATS_FILE);
}

function getDailyPath(): string {
  return path.join(getStatsDir(), DAILY_FILE);
}

// ----- Defaults -----

function defaultStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
    totalGuesses: 0,
    dailyStreak: 0,
    maxDailyStreak: 0,
  };
}

// ----- Core Functions -----

/**
 * Load player stats from ~/.worduel/stats.json.
 * Returns default stats if the file doesn't exist or contains invalid JSON.
 */
export async function loadStats(): Promise<PlayerStats> {
  try {
    const raw = await fs.readFile(getStatsPath(), "utf-8");
    const parsed = JSON.parse(raw) as PlayerStats;

    // Validate that the parsed object has the expected shape
    if (
      typeof parsed.gamesPlayed !== "number" ||
      typeof parsed.gamesWon !== "number" ||
      typeof parsed.currentStreak !== "number" ||
      typeof parsed.maxStreak !== "number" ||
      typeof parsed.totalGuesses !== "number" ||
      typeof parsed.guessDistribution !== "object" ||
      parsed.guessDistribution === null
    ) {
      return defaultStats();
    }

    // Backfill daily streak fields for existing stats files
    if (typeof parsed.dailyStreak !== "number") {
      parsed.dailyStreak = 0;
    }
    if (typeof parsed.maxDailyStreak !== "number") {
      parsed.maxDailyStreak = 0;
    }

    return parsed;
  } catch {
    // File doesn't exist, permission error, or corrupted JSON — all return defaults
    return defaultStats();
  }
}

/**
 * Save player stats to ~/.worduel/stats.json.
 * Creates the directory if it doesn't exist.
 * Uses atomic write: writes to a temp file, then renames.
 */
export async function saveStats(stats: PlayerStats): Promise<void> {
  const dir = getStatsDir();
  const filePath = getStatsPath();
  const tmpPath = filePath + `.tmp.${Date.now()}`;

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(tmpPath, JSON.stringify(stats, null, 2), "utf-8");
    await fs.rename(tmpPath, filePath);
  } catch (err) {
    // Clean up temp file on failure
    try {
      await fs.unlink(tmpPath);
    } catch {
      // Temp file may not exist — ignore
    }
    throw err;
  }
}

/**
 * Record a completed game: update stats and persist.
 *
 * - Increments gamesPlayed
 * - If won: increments gamesWon, updates currentStreak, maxStreak, fastestWin, guessDistribution
 * - If lost: resets currentStreak to 0
 * - Always adds guessCount to totalGuesses
 * - Sets lastPlayedAt to current ISO timestamp
 *
 * Returns the updated stats.
 */
export async function recordGame(
  won: boolean,
  guessCount: number,
): Promise<PlayerStats> {
  const stats = await loadStats();

  stats.gamesPlayed++;
  stats.totalGuesses += guessCount;
  stats.lastPlayedAt = new Date().toISOString();

  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;

    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }

    if (stats.fastestWin === undefined || guessCount < stats.fastestWin) {
      stats.fastestWin = guessCount;
    }

    // Update guess distribution
    stats.guessDistribution[guessCount] =
      (stats.guessDistribution[guessCount] ?? 0) + 1;
  } else {
    stats.currentStreak = 0;
  }

  await saveStats(stats);
  return stats;
}

// ----- Display -----

/**
 * Render a formatted ASCII stats display.
 *
 * Example:
 * ╭─ Worduel Stats ───────────────────╮
 * │                                       │
 * │  Played: 42    Won: 38 (90%)          │
 * │  Streak: 7     Best: 12               │
 * │  Avg Guesses: 3.8                     │
 * │                                       │
 * │  Guess Distribution:                  │
 * │  1: ██                          2     │
 * │  2: ████████                    8     │
 * │  3: ████████████████            15    │
 * │  4: ██████████                  10    │
 * │  5: ████                        3     │
 * │  6: █                           0     │
 * │                                       │
 * ╰───────────────────────────────────────╯
 */
export function renderStatsDisplay(stats: PlayerStats): string {
  const WIDTH = 41; // inner width (between │ borders)

  function pad(content: string): string {
    // Pad content to fill WIDTH, with left and right border
    const padding = WIDTH - content.length;
    if (padding < 0) {
      return `│${content.slice(0, WIDTH)}│`;
    }
    return `│${content}${" ".repeat(padding)}│`;
  }

  const lines: string[] = [];

  // Top border
  lines.push("╭─ Worduel Stats " + "─".repeat(WIDTH - 20) + "╮");

  // Empty line
  lines.push(pad(" ".repeat(WIDTH)));

  // Win percentage
  const winPct =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const playedWon = `  Played: ${stats.gamesPlayed}    Won: ${stats.gamesWon} (${winPct}%)`;
  lines.push(pad(playedWon));

  // Streak
  const streakLine = `  Streak: ${stats.currentStreak}     Best: ${stats.maxStreak}`;
  lines.push(pad(streakLine));

  // Average guesses
  const avgGuesses =
    stats.gamesPlayed > 0
      ? (stats.totalGuesses / stats.gamesPlayed).toFixed(1)
      : "0.0";
  lines.push(pad(`  Avg Guesses: ${avgGuesses}`));

  // Empty line
  lines.push(pad(" ".repeat(WIDTH)));

  // Guess distribution header
  lines.push(pad("  Guess Distribution:"));

  // Find the max frequency for scaling the bar chart
  const maxGuessNum = 6;
  let maxFreq = 0;
  for (let i = 1; i <= maxGuessNum; i++) {
    const freq = stats.guessDistribution[i] ?? 0;
    if (freq > maxFreq) maxFreq = freq;
  }

  // Maximum bar length (leave room for "  N: " prefix and "  count  │" suffix)
  const maxBarLen = 24;

  for (let i = 1; i <= maxGuessNum; i++) {
    const freq = stats.guessDistribution[i] ?? 0;
    const barLen =
      maxFreq > 0 ? Math.max(freq > 0 ? 1 : 0, Math.round((freq / maxFreq) * maxBarLen)) : 0;
    const bar = "█".repeat(barLen);
    const freqStr = String(freq);

    // Format: "  N: ████████                    count"
    // We need the bar + spaces + count to fit within a fixed area
    const prefix = `  ${i}: `;
    const barArea = maxBarLen + 2; // bar + gap before count
    const barWithPadding = bar + " ".repeat(Math.max(1, barArea - barLen));
    const lineContent = prefix + barWithPadding + freqStr;
    lines.push(pad(lineContent));
  }

  // Empty line
  lines.push(pad(" ".repeat(WIDTH)));

  // Bottom border
  lines.push("╰" + "─".repeat(WIDTH) + "╯");

  return lines.join("\n");
}

// ----- Daily State Persistence -----

/**
 * Load daily state from ~/.worduel/daily.json.
 * Returns null if no daily has been played today (or ever).
 * If the saved date is not today, returns null (new day = new daily).
 */
export async function loadDailyState(): Promise<DailyState | null> {
  try {
    const raw = await fs.readFile(getDailyPath(), "utf-8");
    const parsed = JSON.parse(raw) as DailyState;

    // Validate shape
    if (
      typeof parsed.dayNumber !== "number" ||
      typeof parsed.date !== "string" ||
      typeof parsed.completed !== "boolean" ||
      typeof parsed.won !== "boolean"
    ) {
      return null;
    }

    // If saved date is not today, it's a new day — no daily played yet
    const today = getTodayUTC();
    if (parsed.date !== today) {
      return null;
    }

    return parsed;
  } catch {
    // File doesn't exist or invalid — no daily state
    return null;
  }
}

/**
 * Save daily state to ~/.worduel/daily.json.
 * Uses atomic write (temp file + rename) to avoid corruption.
 */
export async function saveDailyState(state: DailyState): Promise<void> {
  const dir = getStatsDir();
  const filePath = getDailyPath();
  const tmpPath = filePath + `.tmp.${Date.now()}`;

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(tmpPath, JSON.stringify(state, null, 2), "utf-8");
    await fs.rename(tmpPath, filePath);
  } catch (err) {
    try {
      await fs.unlink(tmpPath);
    } catch {
      // Temp file may not exist — ignore
    }
    throw err;
  }
}

/**
 * Record a completed daily game.
 * Updates overall stats AND daily streak tracking.
 *
 * Daily streak increments if:
 * - The player won today's daily AND
 * - The last daily was yesterday (consecutive day)
 *
 * If the last daily was >1 day ago, streak resets to 1 (if won) or 0 (if lost).
 *
 * Returns the updated stats.
 */
export async function recordDailyGame(
  won: boolean,
  guessCount: number,
): Promise<PlayerStats> {
  // Record the general game stats first
  const stats = await recordGame(won, guessCount);

  // Now update daily-specific streak tracking
  const today = getTodayUTC();
  const lastDate = stats.lastDailyDate;

  if (won) {
    if (lastDate) {
      // Check if last daily was yesterday
      const lastMs = new Date(`${lastDate}T00:00:00Z`).getTime();
      const todayMs = new Date(`${today}T00:00:00Z`).getTime();
      const daysDiff = Math.round((todayMs - lastMs) / 86_400_000);

      if (daysDiff === 1) {
        // Consecutive day — increment streak
        stats.dailyStreak++;
      } else {
        // Gap in play — reset streak
        stats.dailyStreak = 1;
      }
    } else {
      // First daily ever
      stats.dailyStreak = 1;
    }

    if (stats.dailyStreak > stats.maxDailyStreak) {
      stats.maxDailyStreak = stats.dailyStreak;
    }
  } else {
    // Lost — reset daily streak
    stats.dailyStreak = 0;
  }

  stats.lastDailyDate = today;

  await saveStats(stats);
  return stats;
}
