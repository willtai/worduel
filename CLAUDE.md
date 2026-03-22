# CLAUDE.md — CodeWordle

> **Read this file and the docs/ directory before writing code.**

## Vision

CodeWordle is a terminal-based Wordle game for programmers. Players guess a 6-character programming keyword in 6 tries, with character hints (correct/present/absent) and semantic proximity hints ("Same family — Array methods"). It plays during Claude Code wait times — the Chrome Dino game for AI coding.

## The Pitch

> "While Claude writes your code, you guess programming keywords. Then you post your score and your coworker installs Claude Code to beat it."

## Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript | Core game logic |
| Node.js | Runtime (terminal I/O, raw mode) |
| ANSI escape sequences | Rendering (256-color, alternate screen buffer) |
| JSON files | Persistence (`~/.codewordle/`) |

**No frameworks. No dependencies beyond Node.js built-ins.** This must be tiny, fast, and zero-install via `npx`.

## Design Docs

Read these before implementing. They are the source of truth:

| Doc | Contents |
|---|---|
| `docs/DESIGN.md` | Full UX spec — every screen mockup, colors, animations, layout, accessibility |
| `docs/GAME_MECHANICS.md` | State machine, hint algorithm, TypeScript interfaces, interruption handling, persistence |
| `docs/SOCIAL_AND_CONTENT.md` | Word bank (157 answers + 305 valid guesses), semantic categories, share cards, achievements |
| `docs/VIRAL_MECHANICS.md` | Viral loop, competitive systems, growth hacks, retention mechanics |

## Key Design Decisions

1. **6-character words only.** Long enough to be tricky, short enough for terminal display.
2. **Daily challenge + Practice mode.** Daily = same word for everyone (Wordle effect). Practice = unlimited.
3. **3 attempts per daily challenge.** Scarcity increases perceived value.
4. **Semantic hints** distinguish this from Wordle clones. "Same family — Array methods" tells you the domain.
5. **Language hint after guess 3.** "Most associated with: JavaScript."
6. **Default action after game = COPY SCORE CARD.** Optimize for sharing above all else.
7. **Zero signup.** Identity from git username. Org detection from `git remote`.
8. **Graceful Claude interruption.** Game pauses cleanly. Grace period on guess 5/6.

## Core Game States

```
IDLE → GAME_START → TYPING → GUESS_SUBMITTED → HINT_REVEAL
  → WIN_STATE or LOSE_STATE (if done)
  → TYPING (if guesses remain)
  → PAUSE_STATE (if Claude interrupts)
```

## Rendering Rules

- **44 cols x 24 rows** minimum terminal size
- **ANSI 256-color** baseline, true color upgrade if available
- **Differential rendering** — only update changed characters
- **Alternate screen buffer** — preserve Claude's output
- **No emoji in gameplay** — emoji ONLY in clipboard share cards
- **Sub-16ms input latency**
- **Hide cursor** during gameplay

## Color Palette (ANSI 256)

| Element | ANSI Code | Hex Approx |
|---|---|---|
| Correct (green) | `38;5;114` | `#87d787` |
| Present (yellow) | `38;5;221` | `#ffd75f` |
| Absent (grey) | `38;5;241` | `#626262` |
| Border | `38;5;245` | `#8a8a8a` |
| Title accent | `38;5;75` | `#5fafff` |
| Error | `38;5;203` | `#ff5f5f` |
| Streak fire | `38;5;208` | `#ff8700` |

## Share Card Format

```
CodeWordle #47 — 3/6
······
✓●··●·
✓✓✓✓✓✓
🔥 12 | npx codewordle
```

## Project Structure (Target)

```
codewordle/
├── CLAUDE.md                    # This file
├── package.json                 # Zero/minimal deps
├── tsconfig.json
├── src/
│   ├── index.ts                 # Entry point, CLI args
│   ├── game.ts                  # Core game loop, state machine
│   ├── render.ts                # Terminal rendering engine
│   ├── hints.ts                 # Character + semantic hint algorithms
│   ├── words.ts                 # Word bank + validation
│   ├── daily.ts                 # Daily challenge selection + tracking
│   ├── stats.ts                 # Player stats + persistence
│   ├── share.ts                 # Share card generation + clipboard
│   ├── input.ts                 # Raw terminal input handling
│   ├── config.ts                # Configuration + CLI flags
│   └── types.ts                 # All TypeScript interfaces
├── data/
│   ├── answers.json             # 157 curated answer words with metadata
│   └── valid-guesses.json       # 305 additional accepted words
├── tests/
│   ├── hints.test.ts            # Hint algorithm tests
│   ├── words.test.ts            # Word validation tests
│   └── daily.test.ts            # Daily challenge determinism tests
└── docs/
    ├── DESIGN.md                # UX spec
    ├── GAME_MECHANICS.md        # Technical spec
    ├── SOCIAL_AND_CONTENT.md    # Content spec
    └── VIRAL_MECHANICS.md       # Viral spec
```

## Key Invariants (NEVER VIOLATE)

1. **Daily challenge must be deterministic.** Same day = same word for everyone, always.
2. **Hint algorithm must handle duplicate letters correctly.** Exact matches take priority over present matches.
3. **No network required for core gameplay.** Offline-first. Leaderboards are optional.
4. **Game must not impact Claude Code performance.** Under 100KB memory, no child processes.
5. **Share cards must be plain text.** Copy-pasteable into any chat app.
6. **All 157 answer words must be recognizable to most developers.** No obscure terms.
