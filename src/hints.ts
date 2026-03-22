// ============================================
// Worduel — Hint Generation Algorithm
// ============================================

import type { CharHint } from "./types.js";

// --- Character Hint Generation ---

/**
 * Generate per-character hints for a guess against the answer.
 *
 * Uses Wordle's canonical two-pass algorithm to handle duplicate
 * letters correctly:
 *
 * **Pass 1 — Exact matches:**
 * Walk each position. If `guess[i] === answer[i]`, mark as `"correct"`
 * and consume that answer position so it cannot be matched again.
 *
 * **Pass 2 — Present / Absent:**
 * For each non-correct position in the guess, scan the answer for an
 * unconsumed occurrence of that letter. If found, mark `"present"` and
 * consume the answer position. Otherwise mark `"absent"`.
 *
 * ### Duplicate-letter examples
 *
 * ```
 * guess="speed", answer="abide"
 *   s → absent
 *   p → absent
 *   e → absent   (no 'e' at pos 2)... wait, let's re-check
 *   e → present  (pos 4 'e' consumed)
 *   d → present  (pos 3 'd' consumed)
 *
 * guess="aabbb", answer="abcde"
 *   a → correct  (pos 0 consumed)
 *   a → absent   (no more 'a' in answer)
 *   b → present  (pos 1 'b' consumed)
 *   b → absent   (no more 'b')
 *   b → absent   (no more 'b')
 * ```
 *
 * @param guess  - The player's guess (same length as answer)
 * @param answer - The target word
 * @returns An array of CharHint objects, one per character position
 */
export function generateCharHints(guess: string, answer: string): CharHint[] {
  const length = guess.length;
  const hints: CharHint[] = new Array(length);

  // Track which answer positions have been consumed by a match.
  // `true` means the position is already used and cannot match again.
  const answerConsumed: boolean[] = new Array(length).fill(false);

  // Also track which guess positions were marked correct in pass 1,
  // so pass 2 can skip them.
  const guessMatched: boolean[] = new Array(length).fill(false);

  // --- Pass 1: Exact matches ("correct") ---
  for (let i = 0; i < length; i++) {
    if (guess[i] === answer[i]) {
      hints[i] = { letter: guess[i], status: "correct" };
      answerConsumed[i] = true;
      guessMatched[i] = true;
    }
  }

  // --- Pass 2: Present / Absent ---
  for (let i = 0; i < length; i++) {
    if (guessMatched[i]) continue; // already marked correct

    const letter = guess[i];
    let found = false;

    // Scan for the first unconsumed occurrence in the answer
    for (let j = 0; j < length; j++) {
      if (!answerConsumed[j] && answer[j] === letter) {
        found = true;
        answerConsumed[j] = true;
        break;
      }
    }

    hints[i] = { letter, status: found ? "present" : "absent" };
  }

  return hints;
}
