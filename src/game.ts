// ============================================
// Worduel — Core Game Engine
// ============================================
//
// SECURITY MODEL: The answer word is stored in a separate map from game
// state. Even if GameState is accidentally serialized and sent to Claude,
// the answer cannot leak during active gameplay.

import {
  type GameState,
  type GameStatus,
  type GameMode,
  type GuessResult,
  type GuessResponse,
  type StartGameResponse,
  type CharHint,
  type CharHintStatus,
  WORD_LENGTH,
  MAX_GUESSES,
} from "./types.js";
import { getRandomWord, getDailyWord, isValidGuess } from "./words.js";
import { generateCharHints } from "./hints.js";
import { recordGame, loadDailyState, saveDailyState, recordDailyGame } from "./stats.js";
import { generateShareCardWithStats } from "./share.js";
import { sanitizeGuess, validateGuessInput, isPromptInjection, rateLimitCheck } from "./security.js";
import { getStartPrompt, getGuessPrompt, getWinPrompt, getLosePrompt, getGiveUpPrompt } from "./prompts.js";

// ----- Internal Storage (in-memory) -----
// SECURITY: answers stored separately from game state
const activeAnswers = new Map<string, string>();
const activeGames = new Map<string, GameState>();

let currentGameId: string | null = null;

// ----- Helpers -----

function generateId(): string {
  const hex = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, "0");
  return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

function hintEmoji(status: CharHintStatus): string {
  switch (status) {
    case "correct":
      return "\uD83D\uDFE9"; // 🟩
    case "present":
      return "\uD83D\uDFE8"; // 🟨
    case "absent":
      return "\u2B1B"; // ⬛
  }
}

function formatCell(letter: string, status: CharHintStatus): string {
  const ch = letter.toUpperCase();
  switch (status) {
    case "correct":
      return `[${ch}]`;
    case "present":
      return `(${ch})`;
    case "absent":
      return ` ${ch} `;
  }
}

// ----- Board Renderer -----

export function renderBoard(state: GameState): string {
  const lines: string[] = [];
  lines.push("  Worduel");
  lines.push("");

  // Each cell is 3 chars wide: ───
  const topBorder = "  \u250C" + "\u2500\u2500\u2500" + ("\u252C\u2500\u2500\u2500").repeat(WORD_LENGTH - 1) + "\u2510";
  const midBorder = "  \u251C" + "\u2500\u2500\u2500" + ("\u253C\u2500\u2500\u2500").repeat(WORD_LENGTH - 1) + "\u2524";
  const botBorder = "  \u2514" + "\u2500\u2500\u2500" + ("\u2534\u2500\u2500\u2500").repeat(WORD_LENGTH - 1) + "\u2518";

  lines.push(topBorder);

  for (let row = 0; row < state.maxGuesses; row++) {
    const guess = state.guesses[row];
    if (guess) {
      const cells = guess.hints.map((h) => formatCell(h.letter, h.status));
      const rowStr = cells.map((c) => "\u2502" + c).join("") + "\u2502";
      const emojiRow = guess.hints.map((h) => hintEmoji(h.status)).join(" ");
      lines.push("  " + rowStr + "  " + emojiRow);
    } else {
      const emptyCells = Array(WORD_LENGTH).fill("\u2502   ").join("") + "\u2502";
      lines.push("  " + emptyCells);
    }
    if (row < state.maxGuesses - 1) {
      lines.push(midBorder);
    } else {
      lines.push(botBorder);
    }
  }

  // Show legend on the first 1-2 guesses to teach the notation
  if (state.guesses.length > 0 && state.guesses.length <= 2) {
    lines.push("");
    lines.push("  [X] = Correct spot  (X) = Wrong spot  X = Not in word");
  }

  const knownPositions: Map<number, string> = new Map();
  const presentLetters: Set<string> = new Set();
  const absentLetters: Set<string> = new Set();

  for (const guess of state.guesses) {
    for (let i = 0; i < guess.hints.length; i++) {
      const hint = guess.hints[i];
      if (hint.status === "correct") {
        knownPositions.set(i, hint.letter.toUpperCase());
      } else if (hint.status === "present") {
        presentLetters.add(hint.letter.toUpperCase());
      } else if (hint.status === "absent") {
        absentLetters.add(hint.letter);
      }
    }
  }

  for (const letter of knownPositions.values()) {
    absentLetters.delete(letter.toLowerCase());
  }
  for (const letter of presentLetters) {
    absentLetters.delete(letter.toLowerCase());
  }

  if (state.guesses.length > 0) {
    lines.push("");
    if (knownPositions.size > 0) {
      const knownDisplay = Array.from(knownPositions.entries())
        .sort(([a], [b]) => a - b)
        .map(([pos, letter]) => `${letter}(${pos + 1})`)
        .join(" ");
      lines.push(`  Known: ${knownDisplay}`);
    }
    if (presentLetters.size > 0) {
      const presentDisplay = Array.from(presentLetters).sort().join(" ");
      lines.push(`  Present: ${presentDisplay}`);
    }
    if (absentLetters.size > 0) {
      const absentDisplay = Array.from(absentLetters).sort().join(" ");
      lines.push(`  Absent: ${absentDisplay}`);
    }

    // Show remaining unused letters
    const usedLetters = new Set<string>();
    for (const guess of state.guesses) {
      for (const hint of guess.hints) {
        usedLetters.add(hint.letter.toLowerCase());
      }
    }
    const remaining = "abcdefghijklmnopqrstuvwxyz"
      .split("")
      .filter((l) => !usedLetters.has(l))
      .join(" ");
    if (remaining.length > 0) {
      lines.push(`  Remaining: ${remaining}`);
    }
  }

  if (state.status === "won") {
    lines.push("");
    lines.push(`  Solved in ${state.guesses.length}/${state.maxGuesses}!`);
  } else if (state.status === "lost" && state.answer) {
    lines.push("");
    lines.push(`  Answer: ${state.answer.toUpperCase()}`);
  }

  return lines.join("\n");
}

// ----- Public API -----

export async function createGame(mode: GameMode = "daily"): Promise<StartGameResponse> {
  const gameRateCheck = rateLimitCheck("game");
  if (!gameRateCheck.allowed) {
    throw new Error(gameRateCheck.error ?? "Too many games. Slow down.");
  }

  if (currentGameId) {
    const existing = activeGames.get(currentGameId);
    if (existing && existing.status === "playing") {
      const board = renderBoard(existing);
      return { gameBoard: board, gameState: existing, claudeInstructions: getStartPrompt(existing.mode ?? "random", existing.dayNumber) };
    }
  }

  let answer: string;
  let dayNumber: number | undefined;

  if (mode === "daily") {
    // Check if user already completed today's daily
    const dailyState = await loadDailyState();
    if (dailyState && dailyState.completed) {
      throw new Error(
        "You've already played today's daily! Come back tomorrow. Try 'random' mode for unlimited play."
      );
    }

    const daily = getDailyWord();
    answer = daily.word;
    dayNumber = daily.dayNumber;
  } else {
    answer = getRandomWord();
  }

  const gameId = generateId();

  const state: GameState = {
    gameId,
    guesses: [],
    maxGuesses: MAX_GUESSES,
    wordLength: WORD_LENGTH,
    status: "playing",
    startedAt: new Date().toISOString(),
    mode,
    dayNumber,
  };

  activeAnswers.set(gameId, answer);
  activeGames.set(gameId, state);
  currentGameId = gameId;

  const board = renderBoard(state);
  return { gameBoard: board, gameState: state, claudeInstructions: getStartPrompt(mode, dayNumber) };
}

export async function makeGuess(gameId: string, word: string): Promise<GuessResponse> {
  const state = activeGames.get(gameId);
  if (!state) throw new Error(`No game found with ID: ${gameId}`);
  if (state.status !== "playing") {
    throw new Error(`Game is already ${state.status}. Start a new game to play again.`);
  }

  const guessRateCheck = rateLimitCheck("guess");
  if (!guessRateCheck.allowed) {
    throw new Error(guessRateCheck.error ?? "Too many guesses. Slow down.");
  }

  if (isPromptInjection(word)) {
    throw new Error("Nice try! That doesn't look like a valid word guess. No cheating!");
  }

  const sanitized = sanitizeGuess(word);
  const validation = validateGuessInput(sanitized);
  if (!validation.valid) throw new Error(validation.error ?? "Invalid guess.");

  if (sanitized.length !== WORD_LENGTH) {
    throw new Error(`Guess must be exactly ${WORD_LENGTH} characters. Got ${sanitized.length}.`);
  }

  if (!isValidGuess(sanitized)) {
    throw new Error(`"${sanitized}" is not in the word list. Try a different word!`);
  }

  if (state.guesses.some((g) => g.word === sanitized)) {
    throw new Error(`You already guessed "${sanitized}". Try a different word!`);
  }

  const answer = activeAnswers.get(gameId);
  if (!answer) throw new Error("Internal error: answer not found for this game.");

  const charHints: CharHint[] = generateCharHints(sanitized, answer);

  const guessResult: GuessResult = { word: sanitized, hints: charHints };
  state.guesses.push(guessResult);

  const isWin = charHints.every((h) => h.status === "correct");
  const isLoss = !isWin && state.guesses.length >= state.maxGuesses;

  let newStatus: GameStatus = "playing";
  if (isWin) newStatus = "won";
  else if (isLoss) newStatus = "lost";

  state.status = newStatus;

  if (newStatus === "won" || newStatus === "lost") {
    state.answer = answer;
    state.completedAt = new Date().toISOString();
    activeAnswers.delete(gameId);
    currentGameId = null;
  }

  activeGames.set(gameId, state);

  const board = renderBoard(state);
  const response: GuessResponse = {
    gameBoard: board,
    gameState: state,
    lastGuess: guessResult,
    claudeInstructions: "",
  };

  if (newStatus === "won") {
    let gamesWon = 1;
    try {
      if (state.mode === "daily") {
        const updatedStats = await recordDailyGame(true, state.guesses.length);
        gamesWon = updatedStats.gamesWon;
        await saveDailyState({
          dayNumber: state.dayNumber ?? 0,
          date: new Date().toISOString().slice(0, 10),
          completed: true,
          won: true,
          guessCount: state.guesses.length,
        });
      } else {
        const updatedStats = await recordGame(true, state.guesses.length);
        gamesWon = updatedStats.gamesWon;
      }
    } catch { /* stats failure ok */ }
    response.shareCard = await generateShareCardWithStats(state);
    response.claudeInstructions = getWinPrompt(state.guesses.length, gamesWon, state.mode ?? "random", state.dayNumber);
  } else if (newStatus === "lost") {
    try {
      if (state.mode === "daily") {
        await recordDailyGame(false, state.guesses.length);
        await saveDailyState({
          dayNumber: state.dayNumber ?? 0,
          date: new Date().toISOString().slice(0, 10),
          completed: true,
          won: false,
          guessCount: state.guesses.length,
        });
      } else {
        await recordGame(false, state.guesses.length);
      }
    } catch { /* stats failure ok */ }
    response.shareCard = await generateShareCardWithStats(state);
    response.claudeInstructions = getLosePrompt(state.answer, state.mode ?? "random");
  } else {
    response.claudeInstructions = getGuessPrompt(state.guesses.length);
  }

  return response;
}

export function getCurrentGame(): GameState | null {
  if (!currentGameId) return null;
  const state = activeGames.get(currentGameId);
  if (!state || state.status !== "playing") return null;
  return state;
}

export async function giveUp(gameId: string): Promise<GuessResponse> {
  const state = activeGames.get(gameId);
  if (!state) throw new Error(`No game found with ID: ${gameId}`);
  if (state.status !== "playing") {
    throw new Error(`Game is already ${state.status}. Nothing to give up on.`);
  }

  const answer = activeAnswers.get(gameId);
  if (!answer) throw new Error("Internal error: answer not found for this game.");

  state.status = "lost";
  state.answer = answer;
  state.completedAt = new Date().toISOString();

  activeGames.set(gameId, state);
  activeAnswers.delete(gameId);
  currentGameId = null;

  try {
    if (state.mode === "daily") {
      await recordDailyGame(false, state.guesses.length);
      await saveDailyState({
        dayNumber: state.dayNumber ?? 0,
        date: new Date().toISOString().slice(0, 10),
        completed: true,
        won: false,
        guessCount: state.guesses.length,
      });
    } else {
      await recordGame(false, state.guesses.length);
    }
  } catch { /* stats failure ok */ }

  const board = renderBoard(state);
  const shareCard = await generateShareCardWithStats(state);

  const lastGuess: GuessResult = state.guesses.length > 0
    ? state.guesses[state.guesses.length - 1]
    : { word: "", hints: [] };

  return {
    gameBoard: board,
    gameState: state,
    lastGuess,
    claudeInstructions: getGiveUpPrompt(answer),
    shareCard,
  };
}
