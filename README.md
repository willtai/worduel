# Worduel

**Wordle inside Claude Code. Same daily word for everyone. Impossible to cheat.**

[![npm version](https://img.shields.io/npm/v/worduel)](https://www.npmjs.com/package/worduel)
[![license](https://img.shields.io/npm/l/worduel)](https://opensource.org/licenses/MIT)

## Install

```bash
claude mcp add worduel -- npx -y worduel
```

Restart Claude Code, then say **"let's play worduel"**.

## What It Looks Like

```
  Worduel Daily #42

  ┌───┬───┬───┬───┬───┐
  │ C │[R]│ A │ N │(E)│  ⬛ 🟩 ⬛ ⬛ 🟨
  ├───┼───┼───┼───┼───┤
  │ S │(L)│ A │(T)│[E]│  ⬛ 🟨 ⬛ 🟨 🟩
  ├───┼───┼───┼───┼───┤
  │   │   │   │   │   │
  ...

  Known: R(2) E(5)
  Present: L T
  Absent: a c n s
  Remaining: b d f g h i j k m o p q u v w x y z
```

Claude hosts the game with dry humor:

```
You: "crane"
Claude: "Bold choice. Didn't work, but bold."

You: "slate"
Claude: "Getting somewhere. Maybe."
```

## Features

- **Daily challenge** -- same word for everyone, resets midnight UTC
- **Practice mode** -- unlimited random words
- **Witty AI game host** with dry humor and deadpan commentary
- **Shareable score cards** with Wordle emoji grids
- **Architecturally impossible to cheat** -- Claude never sees the answer
- **3,291 valid words** from a curated English word list
- **Local stats tracking** -- streaks, win rate, guess distribution

## How It Works

The MCP server exposes 4 tools: `worduel_start`, `worduel_guess`, `worduel_stats`, `worduel_give_up`.

The answer is stored server-side and **never sent to Claude** during gameplay. Claude only receives per-letter hints (`correct` / `present` / `absent`). When the game ends, the answer is revealed to both Claude and the player simultaneously.

This means Claude genuinely cannot cheat, leak, or hint at the answer. It doesn't know it.

## Share Your Score

Every game generates a shareable score card:

```
Worduel Daily #42 — 3/6
⬛🟩⬛⬛🟨
⬛🟨⬛🟨🟩
🟩🟩🟩🟩🟩
🔥 5 | npx worduel
```

Post it anywhere. Your friends will install it to try to beat your score.

## Tech

- TypeScript, zero runtime deps beyond [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Node.js 18+
- Data stored locally at `~/.worduel/`

## License

MIT

## Contributing

PRs welcome. Word list suggestions especially.
