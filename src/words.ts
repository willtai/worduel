// ============================================
// Worduel — Word Bank Loading & Validation
// ============================================

import { createRequire } from "module";
import { WORD_LENGTH, DAILY_EPOCH, DAILY_SEED } from "./types.js";

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Load word banks from JSON files at module init
// ---------------------------------------------------------------------------

const answers: string[] = require("../data/answers.json");
const validGuesses: string[] = require("../data/valid-guesses.json");

// Pre-compute lookup sets for O(1) validation
const answerSet = new Set<string>(answers.map((w) => w.toLowerCase()));
const guessSet = new Set<string>(validGuesses.map((w) => w.toLowerCase()));

// Merge both sets into a single "all valid words" set
const allValidWords = new Set<string>([...answerSet, ...guessSet]);

// ---------------------------------------------------------------------------
// Validate word bank integrity at load time (fail fast)
// ---------------------------------------------------------------------------

for (const word of answers) {
  if (word.length !== WORD_LENGTH) {
    throw new Error(
      `Answer word "${word}" has length ${word.length}, expected ${WORD_LENGTH}`
    );
  }
  if (word !== word.toLowerCase()) {
    throw new Error(
      `Answer word "${word}" must be lowercase`
    );
  }
  if (!/^[a-z]+$/.test(word)) {
    throw new Error(
      `Answer word "${word}" contains non-alphabetic characters`
    );
  }
}

for (const word of validGuesses) {
  if (word.length !== WORD_LENGTH) {
    throw new Error(
      `Valid guess "${word}" has length ${word.length}, expected ${WORD_LENGTH}`
    );
  }
  if (!/^[a-z]+$/.test(word)) {
    throw new Error(
      `Valid guess "${word}" contains non-alphabetic characters`
    );
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Pick a random answer word from the bank.
 */
export function getRandomWord(): string {
  const index = Math.floor(Math.random() * answers.length);
  return answers[index];
}

/**
 * Returns true if the word is in EITHER the answers list OR valid-guesses list.
 * Case-insensitive — input is lowercased before lookup.
 */
export function isValidGuess(word: string): boolean {
  const normalized = word.toLowerCase().trim();
  if (normalized.length !== WORD_LENGTH) {
    return false;
  }
  return allValidWords.has(normalized);
}

// SECURITY: getAllAnswers() and getAnswerCount() intentionally removed.
// Exposing the full answer bank creates a risk of answer leakage if
// accidentally wired to an MCP tool or included in a response.

// ---------------------------------------------------------------------------
// Daily Challenge — Deterministic word selection
// ---------------------------------------------------------------------------

/**
 * Mulberry32 seeded PRNG. Returns a function that produces deterministic
 * floats in [0, 1) given the same seed.
 */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Create a deterministic permutation of indices [0..n) using Fisher-Yates
 * shuffle driven by the seeded PRNG. Computed once at module load time.
 */
function buildPermutation(length: number, seed: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  const rng = mulberry32(seed);

  // Fisher-Yates shuffle (Durstenfeld variant)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }

  return indices;
}

// Pre-compute the permuted order at module load — same every time
const dailyPermutation = buildPermutation(answers.length, DAILY_SEED);

/**
 * Get the current UTC date as "YYYY-MM-DD".
 */
export function getTodayUTC(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get the day number (days since the epoch date).
 */
export function getDayNumber(): number {
  const epochMs = new Date(`${DAILY_EPOCH}T00:00:00Z`).getTime();
  const nowMs = Date.now();
  return Math.floor((nowMs - epochMs) / 86_400_000);
}

/**
 * Get today's daily word. Deterministic — same word for everyone worldwide.
 * Uses the pre-computed seeded permutation of the answer list,
 * then picks the word at index (dayNumber % totalAnswers).
 */
export function getDailyWord(): { word: string; dayNumber: number; date: string } {
  const dayNumber = getDayNumber();
  const date = getTodayUTC();
  const index = ((dayNumber % answers.length) + answers.length) % answers.length;
  const word = answers[dailyPermutation[index]];
  return { word, dayNumber, date };
}
