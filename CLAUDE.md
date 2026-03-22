# CLAUDE.md — Worduel

> **Read this file before writing code.**

## Vision

Worduel is Wordle inside Claude Code. It runs as an MCP server — Claude acts as the game host, presenting the board and collecting guesses, while the server handles game logic and word validation. Players guess a standard 5-letter English word in 6 tries with correct/present/absent hints. It plays during Claude Code wait times — the Chrome Dino game for AI coding.

## The Pitch

> "While Claude writes your code, you play Wordle. Then you post your score and your coworker installs Claude Code to beat it."

## Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript | Core game logic |
| MCP SDK (`@modelcontextprotocol/sdk`) | Server that Claude Code communicates with |
| Zod | Input validation for MCP tool parameters |
| Mulberry32 PRNG | Deterministic daily word selection |
| JSON files | Persistence (`~/.worduel/`) |

**Published on npm as `worduel`.** Install via `npx worduel` or add to Claude Code MCP config.

## Security Model

The primary security boundary is **architectural**: the MCP server NEVER sends the answer to Claude during active gameplay. The `answer` field in `GameState` is only populated when `status` is `"won"` or `"lost"`. This means Claude cannot accidentally (or deliberately) reveal the answer mid-game.

Additional defense-in-depth layers in `security.ts`:
- Rate limiting on guesses and game creation
- Input validation (length, characters, injection attempts)

## Word Bank

- **627 answer words** — curated 5-letter English words (`data/answers.json`)
- **2,664 valid guesses** — additional accepted words (`data/valid-guesses.json`)
- **3,291 total** recognized words
- Standard English words only. No programming keywords, no jargon.

## Game Modes

| Mode | Description |
|---|---|
| `"daily"` | Same word for everyone each day. Deterministic via Mulberry32 PRNG seeded from day number + fixed seed. Epoch: `2026-03-22`. |
| `"random"` | Practice mode. Random word each game. Unlimited plays. |

`GameMode` type: `"daily" | "random"`

## MCP Tools

| Tool | Purpose |
|---|---|
| `worduel_start` | Start a new game (daily or random mode) |
| `worduel_guess` | Submit a 5-letter guess |
| `worduel_stats` | View player statistics |
| `worduel_give_up` | Forfeit the current game |

## Project Structure

```
codewordle/
├── CLAUDE.md                    # This file
├── package.json                 # Published as "worduel" on npm
├── tsconfig.json
├── src/
│   ├── index.ts                 # MCP server entry point, tool definitions
│   ├── game.ts                  # Core game logic (create, guess, give up)
│   ├── hints.ts                 # Character hint algorithm (correct/present/absent)
│   ├── words.ts                 # Word bank loading + validation
│   ├── stats.ts                 # Player stats + persistence (~/.worduel/)
│   ├── share.ts                 # Share card generation (emoji grid)
│   ├── prompts.ts               # Claude instruction prompts for each game state
│   ├── security.ts              # Rate limiting + input validation
│   └── types.ts                 # All TypeScript interfaces + constants
├── data/
│   ├── answers.json             # 627 curated answer words
│   └── valid-guesses.json       # 2,664 additional accepted words
├── dist/                        # Compiled output (tsc)
└── docs/
    ├── GO_TO_MARKET.md          # Launch strategy
    ├── LAUNCH_CONTENT.md        # Ready-to-post content
    └── (historical brainstorm docs)
```

## Commands

```bash
npm run build          # Compile TypeScript
npm run dev            # Watch mode
npm test               # Run tests (vitest)
npm start              # Run MCP server directly
```

## Key Invariants (NEVER VIOLATE)

1. **Daily challenge must be deterministic.** Same day = same word for everyone, always. Mulberry32 PRNG with fixed seed + epoch.
2. **Hint algorithm must handle duplicate letters correctly.** Exact matches take priority over present matches.
3. **Answer is NEVER sent to Claude during active gameplay.** Only revealed on win or loss.
4. **No network required for core gameplay.** Fully offline. All words bundled in `data/`.
5. **Share cards must be plain text.** Copy-pasteable into any chat app.
6. **Zero config install.** Must work via `npx worduel` or MCP config with no setup.
