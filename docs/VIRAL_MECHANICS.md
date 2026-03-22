# Viral & Social Mechanics — Terminal Game for Claude Code

**Date**: 2026-03-21
**Author**: Game Design Lead
**Status**: Plan — awaiting "LFG" to begin implementation

---

## 0. Core Premise

The game lives inside idle time. Developers are already sitting at a terminal, already bored, already one Cmd+Tab away from Twitter. The game must exploit that exact 10-120 second window with a loop so tight and a share format so irresistible that posting your result is *easier than not posting it.*

The north star metric: **share rate > 15%** (Wordle peaked at ~25%).

---

## 1. Viral Loop Analysis

### 1.1 The Full Loop

```
DISCOVERY                          SHARE SURFACE
   |                                    |
   v                                    v
Developer sees a tweet/slack    <----  Tweet / Slack / README badge
with a beautiful Unicode grid          "While Claude wrote 312 lines,
                                        I mass-murdered 47 bugs"
   |                                    ^
   v                                    |
CURIOSITY                         SHARE TRIGGER
"Wait, what game IS that?"        Achievement / Embarrassment /
"This plays INSIDE Claude Code?"   Challenge / Streak / Beauty
   |                                    ^
   v                                    |
FIRST PLAY (0-friction)           HOOK (session 2+)
`npx claude` — game auto-offers   "I almost had the all-clear...
during first wait. Zero config.    daily challenge resets in 3h"
   |                                    ^
   v                                    |
AHA MOMENT (< 10 seconds)        RETENTION LOOP
Snake eats a "bug" emoji,         Streaks, unlocks, leaderboard,
score counter ticks, Claude        daily challenges, seasonal themes
finishes, game pauses seamlessly.
Terminal says "Nice. 12 bugs
squashed while Claude worked."
```

### 1.2 The "Aha Moment" (First 10 Seconds)

The aha moment is NOT about the game itself -- it is about the *context*. The realization:

> "Holy shit, I'm playing a game INSIDE my coding terminal, and it automatically paused when Claude finished. This is actually genius."

Design implications:
- Game MUST auto-start (or single-keypress start) when Claude begins processing
- Game MUST auto-pause seamlessly when Claude finishes, with a satisfying summary line
- The summary line IS the aha moment: `"Bug Hunt: 14 squashed in 34s | Claude: refactored auth module"`

The juxtaposition of "what I did" vs "what Claude did" is the core comedic/viral mechanic.

### 1.3 Share Triggers (Ranked by Viral Coefficient)

| Trigger | Emotion | Example | Virality |
|---------|---------|---------|----------|
| **The Juxtaposition** | Humor/self-deprecation | "Claude rewrote my entire API. I got 6 bugs." | ★★★★★ |
| **The Embarrassment** | Shame-comedy | "I died to the FIRST bug. Claude wrote 400 lines." | ★★★★★ |
| **The Flex** | Pride | "Perfect run. 47/47 bugs. Not a single hit." | ★★★★☆ |
| **The Challenge** | Competition | "@coworker beat THIS. 32 bugs in 18s." | ★★★★☆ |
| **The Streak** | Commitment | "Day 30. Haven't missed a daily challenge." | ★★★☆☆ |
| **The Beauty** | Aesthetics | A gorgeous Unicode art completion screen | ★★★☆☆ |

---

## 2. Shareable Formats

### 2.1 Format 1: "The Terminal Card" (Our Wordle Grid)

This is the primary share format. It MUST be copy-pasteable into Twitter, Slack, Discord, and look good in monospace AND proportional fonts.

```
╭─────────────────────────────────╮
│  🐛 CLAUDE CODE  ·  BUG HUNT   │
│─────────────────────────────────│
│  ██░░██████████████████████  47 │
│  Wave 3/3        Streak: 12 🔥  │
│─────────────────────────────────│
│  Claude wrote    │  I squashed  │
│  312 lines       │  47 bugs     │
│  in 52 seconds   │  0 damage    │
│─────────────────────────────────│
│  ⬛⬛🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩  │
│  Daily #142      ·  2026-03-21  │
╰─────────────────────────────────╯
```

The colored squares encode your run: ⬛ = damage taken, 🟩 = bugs cleared, 🟨 = close call (survived with 1hp). This is the Wordle-grid equivalent -- minimal, beautiful, spoiler-free, but endlessly comparable.

**Why it works:** The "Claude wrote / I squashed" split panel is inherently funny and shareable. It frames the human as the bug exterminator while the AI does the "real work."

### 2.2 Format 2: "The Shame Card"

Auto-generated when you perform terribly. This is potentially MORE viral than success.

```
╭─────────────────────────────────╮
│  💀 CLAUDE CODE  ·  BUG HUNT   │
│─────────────────────────────────│
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░  3 │
│  Wave 1/3         Died: 0:04   │
│─────────────────────────────────│
│  Claude wrote    │  I squashed  │
│  287 lines       │  3 bugs      │
│  in 48 seconds   │  then died   │
│─────────────────────────────────│
│  🟩🟩🟩💀⬛⬛⬛⬛⬛⬛⬛⬛⬛  │
│  RIP  ·  Skill issue detected   │
╰─────────────────────────────────╯
```

**Why it works:** Self-deprecating humor is the #1 share driver on developer Twitter. "Skill issue detected" is a meme phrase. The 💀 skull and "then died" are perfect screenshot bait.

### 2.3 Format 3: "The Challenge"

When you send a challenge to a specific person or post it publicly.

```
╭─────────────────────────────────╮
│  ⚔️  CHALLENGE ISSUED           │
│─────────────────────────────────│
│  @willtai scored 47 on Daily    │
│  #142. Can you beat it?         │
│─────────────────────────────────│
│  🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩  │
│                                 │
│  Play: npx claude --game        │
╰─────────────────────────────────╯
```

**Why it works:** Direct challenges have the highest conversion rate of any social mechanic. Including `npx claude --game` makes the call-to-action zero-friction.

### 2.4 Format 4: "The Streak Banner"

Weekly digest, optimized for Monday morning Slack posts.

```
╭────────────────────────────────────╮
│  🔥 WEEK 12 STREAK                │
│────────────────────────────────────│
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun │
│  🟩   🟩   🟩   🟩   🟩   ⬛   ⬛  │
│  42   38   47   29   51   --   --  │
│────────────────────────────────────│
│  Best: 51  ·  Avg: 41.4  ·  5/5 🔥│
│  Total bugs: 207  ·  Rank: #342   │
╰────────────────────────────────────╯
```

**Why it works:** Streaks create FOMO. Seeing someone post a 30-day streak makes you think "I should start." The weekday-only grid naturally aligns with work patterns.

### 2.5 Format 5: "The Season Recap"

End-of-season (monthly) shareable.

```
╭──────────────────────────────────────╮
│  📊 SEASON 3: "MEMORY LEAK MARCH"   │
│──────────────────────────────────────│
│                                      │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░  Top 18%    │
│                                      │
│  Games:  142   │  Best:    67        │
│  Bugs:   4,208 │  Deaths:  31        │
│  K/D:    135.7 │  Streak:  12 max    │
│                                      │
│  While Claude wrote 14,302 lines,    │
│  you mass-murdered 4,208 bugs.       │
│                                      │
│  Title earned: 「Bug Genocide」       │
╰──────────────────────────────────────╯
```

**Why it works:** "While Claude wrote 14,302 lines, you mass-murdered 4,208 bugs" is tweet-bait. The title system (with Japanese brackets for extra dev-culture flavor) is a flex that demands a screenshot.

---

## 3. Competitive Systems

### 3.1 Leaderboard Tiers

No single global leaderboard -- that kills motivation for 99% of players. Instead, layered competition:

| Tier | Scope | Reset | Purpose |
|------|-------|-------|---------|
| **Daily** | Global | Every 24h (UTC midnight) | "Today's best" -- achievable, fresh |
| **Weekly** | Global | Every Monday | Sustained effort, streak-based |
| **Org** | Auto-detected from git remote | Never (seasonal) | "Our team's best" -- Slack fuel |
| **Friends** | Opt-in via GitHub username | Never | Direct competition |
| **All-Time** | Global | Never | The hall of fame |

### 3.2 Daily Challenge System

Every day, a deterministic seed generates the exact same bug pattern for everyone. This is critical -- it means scores are directly comparable.

```
┌──────────────────────────────────┐
│  📅 DAILY CHALLENGE #142         │
│  Seed: 0x3A7F · Mode: Swarm     │
│  Your best: 47 · Global best: 63│
│  Top 100: 52+ · Top 1000: 41+   │
│  Attempts today: 2 / 3          │
└──────────────────────────────────┘
```

Key design decisions:
- **3 attempts per day** (not unlimited). Scarcity increases perceived value.
- **Same seed for everyone.** Direct comparability is what Wordle got right.
- **Show percentile thresholds** so players know "how close am I to top 100?"
- **One daily mode rotation:** Normal > Swarm > Boss > Speed > Chaos (5-day cycle). Keeps it fresh without overwhelming.

### 3.3 Org Detection & Team Competition

Auto-detect organization from `git remote -v`:
- `github.com/vercel/` -> Team Vercel
- `github.com/stripe/` -> Team Stripe

This creates MASSIVE Slack virality:

```
╭──────────────────────────────────╮
│  🏢 ORG LEADERBOARD: vercel     │
│──────────────────────────────────│
│  #1  @rauchg        │  67  🏆   │
│  #2  @shuding       │  54       │
│  #3  @leerob        │  51       │
│  ·····                           │
│  #12 @you           │  38  ← You│
│──────────────────────────────────│
│  Team avg: 41.2  ·  Rank: #8/50 │
│  (50+ orgs competing this week)  │
╰──────────────────────────────────╯
```

**Privacy:** Org participation is opt-in. First time an org user is detected, prompt: "Join your org's leaderboard? y/n". Git username only, no emails.

### 3.4 "While Claude Coded..." Mechanic

This is the signature mechanic. After every Claude Code completion, a one-liner:

```
✅ Done. Claude wrote 247 lines in auth.ts
   🐛 You squashed 31 bugs (top 12% today)
```

This trains the user to associate "waiting for Claude" with "game time." It becomes Pavlovian.

### 3.5 Seasons

Monthly seasons with themes keep the metagame fresh:

| Month | Season | Theme | Special Mechanic |
|-------|--------|-------|-----------------|
| Jan | "Resolution Rush" | New year, fresh start | Double XP first week |
| Feb | "Pair Programming" | Valentine's | 2-player co-op mode |
| Mar | "Memory Leak March" | Memory-themed bugs | Bugs multiply if not killed fast |
| Apr | "404 April" | Glitch aesthetics | Random visual glitches as hazards |
| May | "Merge Conflict May" | Git-themed | Bugs split when hit |
| Jun | "Stack Overflow Summer" | Q&A themed | Answer trivia for power-ups |

---

## 4. Developer-Specific Viral Hooks

### 4.1 GitHub-Style Contribution Graph

Local-only activity heatmap displayed on terminal startup:

```
Bug Hunt Activity (last 16 weeks)
      Mon  ░░▓▓░░▓▓▓▓░░░░▓▓
      Wed  ░░░▓▓▓▓▓▓░░░░▓▓▓▓
      Fri  ▓▓░░▓▓▓▓▓▓░░▓▓▓▓▓▓
           ╰── less      more ──╯
      142 games · 4,208 bugs · 12 day streak
```

This is instantly recognizable to any developer. It says "I play this every day" without being annoying about it.

### 4.2 Programming-Themed Game Elements

Bugs in the game are actual programming concepts, each with unique behavior:

| Bug Type | Visual | Behavior | Humor |
|----------|--------|----------|-------|
| `NullPointerException` | 👻 | Invisible until close | "The billion-dollar bug" |
| `StackOverflow` | 📚 | Clones itself when hit | Multiplies like recursion |
| `Race Condition` | ⚡ | Two bugs, only one is real | Which thread wins? |
| `Memory Leak` | 💧 | Gets bigger over time | Eventually fills the screen |
| `Off-By-One` | 🔢 | Always 1 pixel from where you aim | Infuriating |
| `Segfault` | 💥 | Instant kill, rare | Terror |
| `Heisenbug` | 🔍 | Disappears when you look at it | Changes when observed |
| `CSS Bug` | 🎨 | Moves to random position | "It works on my machine" |
| `Dependency Hell` | 📦 | Spawns 3 smaller bugs on death | `node_modules` energy |

These names alone are tweet-worthy. "I just got killed by a NullPointerException IN A GAME" is exactly the kind of thing developers post.

### 4.3 Git Integration (Opt-in)

Add metadata to git commits (in the commit message trailer, not body):

```
Game-Score: 47
Game-Daily: #142
Game-Streak: 12
```

This enables:
- README badges that pull from recent commits
- PR comments: "During this PR, @dev squashed 142 bugs across 6 Claude sessions"
- Team awareness without being intrusive

### 4.4 Terminal Identity

Your in-game identity is your terminal persona:

```
Player: willtai
Shell:  zsh
Term:   iTerm2
OS:     macOS
Title:  「Bug Genocide」
```

No signup. No OAuth. Identity from the environment. Leaderboards use git username.

---

## 5. Growth Hacks

### 5.1 First-Run Experience

When Claude Code is installed and first runs an AI request:

```
⏳ Claude is working...

   While you wait, want to hunt some bugs?
   Press [SPACE] to play  ·  [Q] to skip

   (1,247 developers played today)
```

The social proof number ("1,247 developers played today") is critical. It normalizes the behavior.

### 5.2 Terminal Startup Message

Every time the user opens their terminal (if opted in via shell integration):

```
🐛 Bug Hunt: Daily #142 is live
   Yesterday's best: 58 by @cassidoo
   Your best yesterday: 41 (top 23%)
   Streak: 12 days 🔥
```

### 5.3 GitHub README Badge

Auto-generated badge for GitHub profiles:

```markdown
[![Bug Hunt Score](https://bughunt.dev/badge/willtai)](https://bughunt.dev/u/willtai)
```

Renders as a dynamic SVG badge:
```
┌──────────────────────────┐
│ 🐛 Bug Hunt │ 47 │ 🔥12 │
└──────────────────────────┘
```

This is the "I use Arch, btw" of Claude Code. Devs will put it in their profiles because it signals:
1. They use Claude Code (status signal)
2. They're good at a hard game (skill signal)
3. They have a streak (consistency signal)

### 5.4 The "Clip" System

After an exceptional play (top 1% score, perfect run, etc.), auto-generate a terminal "replay":

```
╭─ REPLAY: Perfect Run ──────────────────╮
│                                         │
│  Frame 1/120  ▶ Press SPACE to replay   │
│                                         │
│  ···············🐍·····                 │
│  ·····🐛···············                 │
│  ···························            │
│  ·······🐛··🐛·············            │
│                                         │
╰─────────────────────────────────────────╯
```

Replay is stored as a tiny JSON file. Can be shared as a GitHub Gist link. Viewers see the replay IN THEIR TERMINAL:

```bash
npx claude --replay gist:abc123
```

### 5.5 The "Water Cooler" Effect

Weekly automated Slack/Discord bot integration (opt-in per team):

```
📊 Weekly Bug Hunt Report for #engineering

Top Hunters This Week:
  🥇 @sarah    — 284 bugs, 6 perfect runs
  🥈 @james    — 241 bugs, streak: 18
  🥉 @willtai  — 207 bugs, best single: 51

🏆 Team Rank: #12 of 847 orgs

"While Claude wrote 12,450 lines for your team,
 you collectively annihilated 1,892 bugs."
```

### 5.6 The Rickroll Mechanic (One-Time Viral Bomb)

On April 1st, the game briefly "glitches" and shows:

```
ERROR: Bug Hunt corrupted
Attempting recovery...
> Loading backup...
> Restoring save...
>

Never gonna give you up
Never gonna let you debug
Never gonna run around and segfault you

Press any key to resume. Happy April 1st. 🐛
```

This gets screenshotted and posted EVERYWHERE. One-time use, maximum impact.

---

## 6. Retention Mechanics

### 6.1 Unlock Tree

Progressive unlocks keep players coming back:

| Unlock | Requirement | What It Does |
|--------|-------------|-------------|
| **Terminal Themes** | Play 5 games | Retro green, Dracula, Solarized, Matrix |
| **Bug Skins** | Kill 100 of a type | NullPointer becomes "The Ghost of Java Past" |
| **Title System** | Various achievements | 「Exterminator」「Zero Day Hero」「Bug Whisperer」 |
| **Game Modes** | Complete all dailies in a week | Zen Mode (no death), Speed Run, Boss Rush |
| **Custom Snake** | 50-game streak | ASCII art snake head options: `>` `@` `$` `#` |
| **Sound Pack** | Opt-in | Terminal bell plays on kill (yes, people want this) |
| **Golden Bug** | Top 1% on any daily | Appears in your card permanently |

### 6.2 Achievement System

Achievements are the backbone of long-term retention. Each generates a unique shareable card.

| Achievement | Condition | Rarity |
|-------------|-----------|--------|
| `First Blood` | Kill your first bug | Common |
| `Skill Issue` | Die in under 5 seconds | Common (and hilarious) |
| `Flawless` | Complete a daily with 0 damage | Rare |
| `Pacifist` | Survive 30 seconds without killing | Uncommon |
| `Speedrunner` | Clear wave 1 in under 5 seconds | Rare |
| `The Debugger` | Kill 1,000 total bugs | Uncommon |
| `The Exterminator` | Kill 10,000 total bugs | Rare |
| `Genocide Route` | Kill every bug in all 3 waves | Very Rare |
| `Works On My Machine` | Kill a CSS Bug on first try | Uncommon |
| `Stack Overflow` | Kill 10 StackOverflow bugs in one run | Rare |
| `Heisenberg` | Kill a Heisenbug | Very Rare |
| `Zero Day` | Get #1 on a daily within 1 hour of reset | Legendary |
| `Tenacity` | 30-day streak | Legendary |
| `The Machine` | 100-day streak | Mythic |

### 6.3 Progressive Difficulty

The game gets harder the better you are, preventing score inflation:

- **Waves 1-3**: Bug count scales with your personal best
- **Bug speed**: Increases 2% per 10 bugs killed in a run
- **New bug types**: Unlock as you improve (Heisenbug only appears at 30+ score)
- **Adaptive spawning**: If you're too good, bugs spawn in tighter patterns

This means a score of 50 is ALWAYS impressive, regardless of when in the season you play.

### 6.4 The "One More Game" Loop

After each game ends:

```
✅ Claude finished: refactored auth.ts (247 lines)
   🐛 You: 31 bugs squashed (top 12% today)

   [ENTER] Copy score card  ·  [R] Replay  ·  [Q] Quit
   Next Claude request will auto-start a new game.
```

The default action is COPY THE SCORE CARD. Not "play again." Not "quit." Copy. This optimizes for sharing above all else.

---

## 7. Anti-Patterns to Avoid

| Don't | Why | Do Instead |
|-------|-----|-----------|
| Require signup | Kills 80% of players at the gate | Use git username, zero config |
| Show ads | Devs will uninstall instantly | It's a growth tool, not a revenue stream |
| Make it mandatory | Devs hate being forced | Always skippable, always opt-in |
| Notifications | Terminal notifications are hostile | Passive display only |
| Complex onboarding | 10-120 seconds is the WHOLE window | Playable in 1 second, no tutorial needed |
| Pay-to-win | Developer audience will revolt | Cosmetic unlocks only |
| Require internet | Many devs work offline | Offline-first, sync when connected |

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Play Rate** | >40% of Claude Code users try it | Anonymous telemetry (opt-in) |
| **Share Rate** | >15% of sessions generate a share | Clipboard copy events |
| **D1 Retention** | >60% play again next day | Local storage tracking |
| **D7 Retention** | >35% play 7 days later | Local storage tracking |
| **Viral Coefficient** | >1.2 | New installs attributed to shared cards |
| **Org Adoption** | >20% of players join org board | Opt-in rate tracking |
| **Daily Challenge Completion** | >50% of active players | Completion events |

---

## 9. Implementation Priority

### Phase 1: Core Viral Loop (Week 1)
- [ ] Basic game (snake/bug-hunt) that auto-starts during Claude processing
- [ ] Auto-pause when Claude finishes with the "juxtaposition" summary line
- [ ] Terminal Card (Format 2.1) generation with clipboard copy
- [ ] Daily challenge with deterministic seed

### Phase 2: Social Layer (Week 2)
- [ ] Org detection from git remote
- [ ] Local leaderboard storage
- [ ] GitHub README badge endpoint
- [ ] Shame Card auto-generation
- [ ] Challenge format with `npx claude --game` CTA

### Phase 3: Retention (Week 3)
- [ ] Achievement system
- [ ] Streak tracking with weekly banner
- [ ] Unlock tree (themes, titles, skins)
- [ ] Activity heatmap on terminal startup

### Phase 4: Scale (Week 4)
- [ ] Optional cloud sync for cross-device leaderboards
- [ ] Slack/Discord bot integration
- [ ] Season system with themed content
- [ ] Replay/clip system

---

## 10. The One-Line Pitch

> "While Claude writes your code, you hunt bugs in your terminal. Then you post your score and your coworker installs Claude Code to beat it."

That's the entire viral loop in one sentence.
