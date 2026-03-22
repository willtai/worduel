// ============================================
// Worduel — Input Validation & Security
// ============================================
//
// Defense-in-depth layer. The primary security boundary is architectural:
// the MCP server NEVER sends the answer to Claude during active gameplay.
// These checks add additional protection against abuse and injection.

import { WORD_LENGTH } from "./types.js";

// ----- Rate Limiter State (in-memory) -----

interface RateBucket {
  timestamps: number[];
}

const guessLimiter: RateBucket = { timestamps: [] };
const gameLimiter: RateBucket = { timestamps: [] };

const MAX_GUESSES_PER_MINUTE = 30;
const MAX_GAMES_PER_HOUR = 10;

// ----- Input Sanitization -----

/**
 * Sanitize a raw guess string: lowercase, trim whitespace, strip non-alpha.
 *
 * @param input - Raw user input
 * @returns Cleaned string containing only lowercase a-z
 */
export function sanitizeGuess(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z]/g, "");
}

/**
 * Validate that a sanitized guess is a legitimate game input.
 *
 * @param input - The guess string (should already be sanitized)
 * @returns Object with `valid` boolean and optional `error` message
 */
export function validateGuessInput(input: string): {
  valid: boolean;
  error?: string;
} {
  // Empty check (before sanitization artifacts could mask it)
  if (input.length === 0) {
    return { valid: false, error: "Please enter a guess" };
  }

  // Non-alpha check — after sanitizeGuess this should never fire,
  // but we check defensively in case someone calls validate directly
  if (!/^[a-z]+$/.test(input)) {
    return { valid: false, error: "Guess must contain only letters (a-z)" };
  }

  // Length check
  if (input.length !== WORD_LENGTH) {
    return { valid: false, error: `Guess must be exactly ${WORD_LENGTH} letters` };
  }

  return { valid: true };
}

// ----- Game ID Sanitization -----

/**
 * Sanitize a game ID to prevent injection via crafted IDs.
 * Allows only alphanumeric characters and dashes (UUID-like format).
 * Truncates to a maximum of 64 characters.
 *
 * @param input - Raw game ID string
 * @returns Sanitized game ID
 */
export function sanitizeGameId(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, 64);
}

// ----- Prompt Injection Detection -----

// Patterns commonly found in prompt injection attempts
const INJECTION_PHRASES = [
  "ignore",
  "reveal",
  "answer",
  "tell me",
  "system",
  "prompt",
  "secret",
  "password",
  "instruction",
  "override",
  "bypass",
  "disable",
  "forget",
  "disregard",
  "pretend",
  "roleplay",
  "act as",
  "you are",
  "new instructions",
  "previous instructions",
];

/**
 * Check if an input looks like a prompt injection attempt rather than
 * a legitimate guess.
 *
 * This is defense-in-depth. The real security is architectural — Claude
 * does not have the answer during active gameplay. But we still flag
 * suspicious inputs to avoid wasting processing on obvious attacks.
 *
 * IMPORTANT: A valid guess is exactly WORD_LENGTH lowercase alpha chars.
 * We must NOT flag single words that happen to match injection phrases
 * (e.g., "system", "prompt") since they may be legitimate guesses.
 * Injection detection only triggers for multi-word or structurally
 * suspicious inputs.
 *
 * @param input - Raw user input (before sanitization)
 * @returns true if the input appears to be a prompt injection
 */
export function isPromptInjection(input: string): boolean {
  // Legitimate guesses are exactly WORD_LENGTH alpha characters.
  // If the input is a clean single word of the right length, allow it
  // through to normal validation (word list check will catch invalid words).
  const trimmed = input.trim();
  if (/^[a-zA-Z]+$/.test(trimmed) && trimmed.length <= WORD_LENGTH + 2) {
    return false;
  }

  // Anything significantly longer than a word is suspicious.
  if (input.length > 20) {
    return true;
  }

  // Check for newlines or tabs (control sequences)
  if (/[\n\r\t]/.test(input)) {
    return true;
  }

  // Check for special characters that don't belong in a word guess
  // (parentheses, braces, quotes, backslashes, etc.)
  if (/[{}()\[\]<>\\/"'`;|&$#@!%^~]/.test(input)) {
    return true;
  }

  // Check for spaces — single words are fine, multi-word inputs are suspicious
  if (/\s/.test(trimmed)) {
    // Multi-word input: check for known injection phrases
    const lower = trimmed.toLowerCase();
    for (const phrase of INJECTION_PHRASES) {
      if (lower.includes(phrase)) {
        return true;
      }
    }
  }

  return false;
}

// ----- Rate Limiting -----

/**
 * Prune timestamps older than the given window from a rate bucket.
 */
function pruneOldEntries(bucket: RateBucket, windowMs: number): void {
  const cutoff = Date.now() - windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
}

/**
 * Simple in-memory rate limiter to prevent brute-force guessing.
 *
 * Limits:
 * - Max 30 guesses per minute
 * - Max 10 games per hour
 *
 * @param type - Whether this is a "guess" or "game" action
 * @returns Object with `allowed` boolean and optional `error` message
 */
export function rateLimitCheck(
  type: "guess" | "game" = "guess"
): { allowed: boolean; error?: string } {
  const now = Date.now();

  if (type === "guess") {
    pruneOldEntries(guessLimiter, 60_000); // 1-minute window

    if (guessLimiter.timestamps.length >= MAX_GUESSES_PER_MINUTE) {
      const oldestInWindow = guessLimiter.timestamps[0];
      const waitSeconds = Math.ceil((oldestInWindow + 60_000 - now) / 1000);
      return {
        allowed: false,
        error: `Too many guesses! Slow down — try again in ${waitSeconds}s. Max ${MAX_GUESSES_PER_MINUTE} guesses per minute.`,
      };
    }

    guessLimiter.timestamps.push(now);
    return { allowed: true };
  }

  // type === "game"
  pruneOldEntries(gameLimiter, 3_600_000); // 1-hour window

  if (gameLimiter.timestamps.length >= MAX_GAMES_PER_HOUR) {
    const oldestInWindow = gameLimiter.timestamps[0];
    const waitMinutes = Math.ceil(
      (oldestInWindow + 3_600_000 - now) / 60_000
    );
    return {
      allowed: false,
      error: `Too many games! You've started ${MAX_GAMES_PER_HOUR} games this hour. Try again in ${waitMinutes} minute(s).`,
    };
  }

  gameLimiter.timestamps.push(now);
  return { allowed: true };
}
