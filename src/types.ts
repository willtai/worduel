// ============================================
// Worduel — Shared Type Definitions
// ============================================

// --- Character Hint (per letter) ---

export type CharHintStatus = "correct" | "present" | "absent";

export interface CharHint {
  letter: string;
  status: CharHintStatus;
}

// --- Guess Result ---

export interface GuessResult {
  word: string;
  hints: CharHint[];
}

// --- Game State ---
// SECURITY: `answer` is ONLY populated when status is "won" or "lost".
// During active gameplay, Claude NEVER sees the answer.

export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
  gameId: string;
  guesses: GuessResult[];
  maxGuesses: number;
  wordLength: number;
  status: GameStatus;
  answer?: string; // ONLY when status is "won" or "lost"
  startedAt: string;
  completedAt?: string;
  mode?: GameMode;
  dayNumber?: number;
}

// --- Player Stats ---

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // guess count -> frequency
  lastPlayedAt?: string;
  totalGuesses: number;
  fastestWin?: number; // guess count of best win
  dailyStreak: number;
  maxDailyStreak: number;
  lastDailyDate?: string;
}

// --- Share Card ---

export interface ShareCard {
  guessCount: number;
  maxGuesses: number;
  won: boolean;
  grid: string; // The Unicode hint grid (compact, for tweets)
  fullCard: string; // Full formatted card with borders
  clipboardText: string; // What gets copied to clipboard
}

// --- MCP Tool Responses ---
// These define what the MCP server returns to Claude.
// Claude uses `claudeInstructions` to know how to present the game.

export interface StartGameResponse {
  gameBoard: string; // Pre-rendered ASCII game board
  gameState: GameState;
  claudeInstructions: string; // How Claude should present this turn
}

export interface GuessResponse {
  gameBoard: string;
  gameState: GameState;
  lastGuess: GuessResult;
  claudeInstructions: string;
  shareCard?: ShareCard; // Only on win or loss
}

export interface StatsResponse {
  statsDisplay: string; // Pre-rendered stats display
  stats: PlayerStats;
  claudeInstructions: string;
}

// --- Daily Challenge ---

export const DAILY_EPOCH = "2026-03-22"; // Day 1 of Worduel
export const DAILY_SEED = 48271; // Fixed seed for deterministic shuffle

export type GameMode = "daily" | "random";

export interface DailyState {
  dayNumber: number;       // Days since epoch
  date: string;            // UTC date string YYYY-MM-DD
  completed: boolean;      // Has today's daily been played?
  won: boolean;            // Did the user win today's daily?
  guessCount?: number;     // How many guesses (if completed)
}

// --- Constants ---

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
export const STATS_DIR = ".worduel";
export const STATS_FILE = "stats.json";
export const DAILY_FILE = "daily.json";
export const HISTORY_FILE = "history.json";
export const DONATION_URL = "https://buymeacoffee.com/worduel";
