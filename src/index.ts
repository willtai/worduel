#!/usr/bin/env node
// ============================================
// Worduel — MCP Server Entry Point
// ============================================
//
// This MCP server exposes tools that Claude Code calls to host a
// Wordle game. Claude acts as the game host — presenting the
// board, adding personality, and collecting guesses from the user.
//
// SECURITY: The answer word is NEVER sent to Claude during active
// gameplay. It only appears in responses when the game is over.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { createGame, makeGuess, getCurrentGame, giveUp } from "./game.js";
import { loadStats } from "./stats.js";
import { getStatsPrompt } from "./prompts.js";
import type { StatsResponse } from "./types.js";

// ----- Server Setup -----

const server = new McpServer({
  name: "worduel",
  version: "0.1.0",
  description: "Wordle — the classic word game, playable inside Claude Code",
});

// ----- Tool: worduel_start -----

server.tool(
  "worduel_start",
  "Start a new Wordle game. Mode 'daily' (default) gives everyone the same word each day. Mode 'random' gives a random word for unlimited play. If a game is already in progress, returns that game instead.",
  {
    mode: z.enum(["daily", "random"]).optional().default("daily").describe("Game mode: 'daily' for the shared daily challenge, 'random' for unlimited practice"),
  },
  async ({ mode }) => {
    try {
      const response = await createGame(mode);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start game.";
      return {
        content: [{ type: "text", text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  }
);

// ----- Tool: worduel_guess -----

server.tool(
  "worduel_guess",
  "Submit a guess for the current Wordle game. The word must be a valid 5-letter English word.",
  {
    word: z.string().describe("The 5-letter word to guess"),
  },
  async ({ word }) => {
    try {
      // Get the current game
      const currentGame = getCurrentGame();
      if (!currentGame) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "No active game. Use worduel_start to begin a new game.",
              }),
            },
          ],
          isError: true,
        };
      }

      const response = await makeGuess(currentGame.gameId, word);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process guess.";
      return {
        content: [{ type: "text", text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  }
);

// ----- Tool: worduel_stats -----

server.tool(
  "worduel_stats",
  "View your Wordle player statistics — games played, win rate, streaks, and guess distribution.",
  {},
  async () => {
    try {
      const stats = await loadStats();

      // Render stats display
      const winRate =
        stats.gamesPlayed > 0
          ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
          : 0;

      const lines: string[] = [];
      lines.push("  Worduel Stats");
      lines.push("  ────────────────");
      lines.push(`  Played: ${stats.gamesPlayed}`);
      lines.push(`  Won: ${stats.gamesWon} (${winRate}%)`);
      lines.push(`  Current Streak: ${stats.currentStreak}`);
      lines.push(`  Max Streak: ${stats.maxStreak}`);

      if (stats.fastestWin) {
        lines.push(`  Fastest Win: ${stats.fastestWin} guesses`);
      }

      if (stats.gamesPlayed > 0) {
        lines.push("");
        lines.push("  Guess Distribution:");
        const maxCount = Math.max(
          ...Object.values(stats.guessDistribution),
          1
        );
        for (let i = 1; i <= 6; i++) {
          const count = stats.guessDistribution[i] ?? 0;
          const barLen = maxCount > 0 ? Math.round((count / maxCount) * 16) : 0;
          const bar = "\u2588".repeat(barLen) + "\u2591".repeat(16 - barLen);
          lines.push(`  ${i} \u2502 ${bar} ${count}`);
        }
      }

      const statsDisplay = lines.join("\n");

      const response: StatsResponse = {
        statsDisplay,
        stats,
        claudeInstructions: getStatsPrompt(),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load stats.";
      return {
        content: [{ type: "text", text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  }
);

// ----- Tool: worduel_give_up -----

server.tool(
  "worduel_give_up",
  "Give up on the current Wordle game. Ends the game as a loss and reveals the answer.",
  {},
  async () => {
    try {
      const currentGame = getCurrentGame();
      if (!currentGame) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "No active game to give up on. Use worduel_start to begin a new game.",
              }),
            },
          ],
          isError: true,
        };
      }

      const response = await giveUp(currentGame.gameId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to give up.";
      return {
        content: [{ type: "text", text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  }
);

// ----- Start Server -----

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Worduel MCP server failed to start:", err);
  process.exit(1);
});
