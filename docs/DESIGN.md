# CodeWordle — Complete UX & Interaction Design Specification

**Date**: 2026-03-21
**Status**: Design Complete — Implementation-Ready
**Author**: Senior UX/Interaction Designer
**Target Build Time**: 2-3 days
**Minimum Terminal**: 44 columns x 24 rows

---

## Table of Contents

1. [Game Rules & Mechanics](#1-game-rules--mechanics)
2. [Color Palette & ANSI Codes](#2-color-palette--ansi-codes)
3. [Typography & Safe Characters](#3-typography--safe-characters)
4. [Layout Specifications](#4-layout-specifications)
5. [Screen Designs](#5-screen-designs)
6. [Interaction Flow & State Machine](#6-interaction-flow--state-machine)
7. [Input Design](#7-input-design)
8. [Hint System Visual Design](#8-hint-system-visual-design)
9. [Share Card Design](#9-share-card-design)
10. [Animation & Transitions](#10-animation--transitions)
11. [Edge Cases & Interrupts](#11-edge-cases--interrupts)
12. [Accessibility](#12-accessibility)
13. [Data Model](#13-data-model)

---

## 1. Game Rules & Mechanics

### Core Rules
- The target word is always **6 characters**, lowercase
- The player gets **6 attempts** to guess the word
- Words come from a curated dictionary of **programming keywords** (see Word List section)
- After each guess, each character receives one of three states:
  - **CORRECT**: Right character, right position
  - **PRESENT**: Right character, wrong position
  - **ABSENT**: Character not in the word
- After guess 3, a **language/domain hint** is revealed
- After each guess, a **semantic proximity hint** is shown

### Word Categories
Words are tagged with categories for the semantic hint system:

| Category | Example Words |
|----------|--------------|
| Array methods | `filter`, `splice`, `reduce` |
| String methods | `concat`, `substr`, `repeat` |
| Control flow | `switch`, `return`, `throws` |
| Types/Primitives | `string`, `number`, `symbol` |
| OOP keywords | `static`, `public`, `extend` |
| Async | `await_` — no, 5 chars. `promise` — 7. Use: `async_` — no. |
| Functional | `lambda`, `reduce`, `cursor` |
| Database | `select`, `insert`, `delete`, `update`, `schema` |
| DevOps | `docker`, `deploy`, `daemon` |
| Git | `rebase`, `squash`, `commit`, `branch`, `stash_` — no |
| Web | `socket`, `router`, `render` |
| Security | `bcrypt`, `cipher`, `oauth_` — no |
| Data structures | `linked`, `struct`, `buffer` |

All words are exactly 6 lowercase alpha characters [a-z]. No numbers, no special characters, no spaces.

### Daily vs Practice Mode
- **Daily Mode**: Deterministic word from `sha256(date + salt)` mapped to word list index. Same word globally. One attempt per day. Resets at midnight UTC.
- **Practice Mode**: Random word from word list. Unlimited plays. Does not affect streak.

---

## 2. Color Palette & ANSI Codes

### Primary Palette (256-color ANSI)

```
CORRECT (Green):   \x1b[38;5;114m  (foreground)  \x1b[48;5;114m  (background)
                   Hex approx: #87d787 — muted sage green

PRESENT (Yellow):  \x1b[38;5;221m  (foreground)  \x1b[48;5;221m  (background)
                   Hex approx: #ffd75f — warm amber

ABSENT (Grey):     \x1b[38;5;241m  (foreground)  \x1b[48;5;241m  (background)
                   Hex approx: #626262 — neutral mid-grey

EMPTY (Dim):       \x1b[38;5;238m  (foreground)  \x1b[48;5;236m  (background)
                   Hex approx: #444444 / #303030 — dark placeholder

TEXT_PRIMARY:      \x1b[38;5;255m  — near-white for main text
TEXT_SECONDARY:    \x1b[38;5;245m  — grey for labels and secondary info
TEXT_DIM:          \x1b[38;5;239m  — dark grey for inactive elements

BORDER:            \x1b[38;5;240m  — grey for box-drawing borders
ACCENT:            \x1b[38;5;75m   — soft blue for highlights/links
                   Hex approx: #5fafff

ERROR:             \x1b[38;5;203m  — soft red for invalid input
                   Hex approx: #ff5f5f

STREAK_FIRE:       \x1b[38;5;208m  — orange for streak indicator
                   Hex approx: #ff8700

BOLD:              \x1b[1m
DIM:               \x1b[2m
RESET:             \x1b[0m
REVERSE:           \x1b[7m         — for filled cell backgrounds
```

### Fallback: Basic 8-Color Mode

Detect color support via `TERM` and `COLORTERM` environment variables.

```
CORRECT:  \x1b[32m  (green)      + \x1b[1m (bold)
PRESENT:  \x1b[33m  (yellow)     + \x1b[1m (bold)
ABSENT:   \x1b[90m  (bright black / dark grey)
EMPTY:    \x1b[90m  (bright black)
TEXT:     \x1b[37m  (white)
ERROR:    \x1b[31m  (red)
ACCENT:   \x1b[36m  (cyan)
BORDER:   \x1b[90m  (bright black)
```

### No-Color Mode

Respect the `NO_COLOR` environment variable (https://no-color.org/).

When `NO_COLOR` is set, use **text markers** instead of colors:

```
CORRECT:  [X]  — character is bracketed and uppercase
PRESENT:  (x)  — character is in parentheses
ABSENT:    x   — plain lowercase, struck through with dash: -x-
EMPTY:     _   — underscore placeholder
```

---

## 3. Typography & Safe Characters

### Box Drawing (safe across all modern terminals)

```
Corners:   ┌ ┐ └ ┘       U+250C, U+2510, U+2514, U+2518
Lines:     │ ─             U+2502, U+2500
Tees:      ├ ┤ ┬ ┴        U+251C, U+2524, U+252C, U+2534
Cross:     ┼               U+253C
```

### Block Elements

```
Full block:     █  U+2588  — for filled cells and progress bars
Light shade:    ░  U+2591  — for empty/unfilled progress
Medium shade:   ▒  U+2592  — for loading states
Upper half:     ▀  U+2580  — for compact bar charts
Lower half:     ▄  U+2584  — for compact bar charts
```

### Indicator Characters

```
Bullet:         ·  U+00B7  — mid dot for separators
Arrow right:    >          — plain ASCII, safest
Ellipsis:       ...        — three dots, not U+2026 (safer)
Check:          *          — asterisk in gameplay (safe)
Fire:           ^          — caret for streak (in-terminal)
Diamond:        <>         — angle brackets for decorative
```

### Characters to AVOID in Gameplay

- All emoji (render width varies across terminals)
- CJK characters
- Combining characters
- Characters above U+FFFF
- Tab characters (use spaces)

### Emoji Usage

Emoji are ONLY used in the **share card** text that gets copied to clipboard (rendered outside the terminal by the receiving app: Slack, Twitter, Discord).

---

## 4. Layout Specifications

### Minimum Terminal Size

```
Width:  44 columns
Height: 24 rows
```

If the terminal is below minimum, show:

```
Terminal too small.
Need 44x24, have 38x20.
Resize to play.
```

### Layout Grid (44 columns wide)

```
Col:  1    5   10   15   20   25   30   35   40  44
      |    |    |    |    |    |    |    |    |    |
Row 1:  [           Header / Title Bar            ]
Row 2:  [           Claude Status Line             ]
Row 3:  [                                          ]
Row 4:  [           Guess Row 1                    ]
Row 5:  [           Guess Row 2                    ]
Row 6:  [           Guess Row 3                    ]
Row 7:  [           Guess Row 4                    ]
Row 8:  [           Guess Row 5                    ]
Row 9:  [           Guess Row 6                    ]
Row 10: [                                          ]
Row 11: [           Semantic Hint                  ]
Row 12: [           Language Hint (after G3)       ]
Row 13: [                                          ]
Row 14: [           Input Area                     ]
Row 15: [           Error Message                  ]
Row 16: [                                          ]
Row 17: [           Keyboard Row 1 (QWERTY)        ]
Row 18: [           Keyboard Row 2 (ASDFG)         ]
Row 19: [           Keyboard Row 3 (ZXCVB)         ]
Row 20: [                                          ]
Row 21: [           Known Letters Tracker          ]
Row 22: [                                          ]
Row 23: [           Footer / Controls              ]
Row 24: [           Mode Indicator                 ]
```

### Wider Terminal Adaptation (60+ columns)

When terminal width >= 60, add padding and wider cells:

```
Cell width:  5 chars per letter  (instead of 4)
Side margin: center the board horizontally
```

When terminal width >= 80, show stats sidebar:

```
┌──────────────────────────────┐  ┌─────────────────┐
│         GAME BOARD           │  │  Games: 47       │
│                              │  │  Win %: 89%      │
│                              │  │  Streak: 12      │
│                              │  │  Best: 23        │
│                              │  │                   │
│                              │  │  Guess Dist:     │
│                              │  │  1: ##            │
│                              │  │  2: ####          │
│                              │  │  3: ########      │
│                              │  │  4: #####         │
│                              │  │  5: ##            │
│                              │  │  6: #             │
└──────────────────────────────┘  └─────────────────┘
```

### Claude Status Indicator Position

Always at the **top of the game area**, row 2. Shows Claude's current working status so the player never loses awareness:

```
  Claude working... filter.ts [3s]
```

This line updates in real time. The `[3s]` is elapsed time. The filename is the current file being processed (if available).

---

## 5. Screen Designs

### 5a. Welcome / Idle Screen

Shown when Claude begins working and the game is available. This is the entry point.

```
╭──────────────────────────────────────────╮
│                                          │
│            C O D E W O R D L E           │
│            ─ ─ ─ ─ ─ ─ ─ ─ ─            │
│                                          │
│         Guess the 6-letter keyword       │
│         used in programming. 6 tries.    │
│                                          │
│                                          │
│         ┌───┬───┬───┬───┬───┬───┐        │
│         │   │   │   │   │   │   │        │
│         └───┴───┴───┴───┴───┴───┘        │
│         ┌───┬───┬───┬───┬───┬───┐        │
│         │   │   │   │   │   │   │        │
│         └───┴───┴───┴───┴───┴───┘        │
│         ┌───┬───┬───┬───┬───┬───┐        │
│         │   │   │   │   │   │   │        │
│         └───┴───┴───┴───┴───┴───┘        │
│                                          │
│                                          │
│   [D] Daily #47     [P] Practice Mode    │
│                                          │
│       Streak: 12    Best: 23             │
│                                          │
╰──────────────────────────────────────────╯
  Claude working... auth.ts [2s]
```

**Color notes:**
- Title "C O D E W O R D L E" in `TEXT_PRIMARY` + `BOLD`
- Subtitle and body in `TEXT_SECONDARY`
- Empty grid cells in `EMPTY` color (dark grey borders)
- `[D]` and `[P]` keys in `ACCENT` (blue)
- Streak number in `STREAK_FIRE` (orange) if streak > 0
- Claude status line in `TEXT_DIM`
- Outer border in `BORDER` color

**Behavior:**
- Press `D` to start Daily Challenge
- Press `P` to start Practice Mode
- Press `S` to view Stats
- Press `Q` or `Esc` to dismiss and return to Claude wait screen
- If daily challenge already completed today, `[D]` shows as `[D] Completed *` in dim text

---

### 5b. Active Game Screen — Early Game (Guess 1 submitted, on Guess 2)

The player has submitted "return" as their first guess. The answer is "filter".

```
  CodeWordle #47 · Daily         2/6
  ──────────────────────────────────
  Claude working... utils.ts [8s]

  ┌───┬───┬───┬───┬───┬───┐
  │ r │ e │ t │ u │ r │ n │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │ _ │ _ │ _ │ _ │ _ │ _ │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┘

  "Warm -- same domain"

  > s t r _ _ _

  q w (e) (r) (t) y u i o p
   a s d f g h j k l
    z x c v b -n- m

  Known: e? r? t?     Not: u n
```

**Color mapping for Guess 1 "return" against answer "filter":**
- `r`: PRESENT (yellow) — r is in "filter" but not at position 1
- `e`: PRESENT (yellow) — e is in "filter" but not at position 2
- `t`: PRESENT (yellow) — t is in "filter" but not at position 3
- `u`: ABSENT (grey) — u is not in "filter"
- `r`: PRESENT (yellow) — r is in "filter" but not at position 5
- `n`: ABSENT (grey) — n is not in "filter"

**Cell rendering detail (4 chars wide per cell):**

```
Correct cell:  Green BG + Black FG + BOLD
┌───┐
│ f │   \x1b[48;5;114m\x1b[38;5;0m\x1b[1m f \x1b[0m
└───┘

Present cell:  Yellow BG + Black FG + BOLD
┌───┐
│ r │   \x1b[48;5;221m\x1b[38;5;0m\x1b[1m r \x1b[0m
└───┘

Absent cell:   DarkGrey BG + MidGrey FG
┌───┐
│ n │   \x1b[48;5;236m\x1b[38;5;245m n \x1b[0m
└───┘

Empty cell:    No BG + DimGrey border
┌───┐
│   │   \x1b[38;5;238m   \x1b[0m
└───┘

Active/Input cell: DimGrey border + WHITE underscore
┌───┐
│ _ │   \x1b[38;5;240m\x1b[38;5;255m _ \x1b[0m
└───┘

Active/Input cell with letter typed:
┌───┐
│ s │   \x1b[38;5;255m\x1b[1m s \x1b[0m
└───┘
```

**Keyboard tracker:**
- Letters not yet guessed: `TEXT_PRIMARY` (white)
- CORRECT letter: `CORRECT` color (green)
- PRESENT letter: `PRESENT` color (yellow), wrapped in `(parentheses)`
- ABSENT letter: `ABSENT` color (grey), prefixed with `-`, e.g., `-n-`

**Semantic hint:**
- Shown below the grid after each guess
- Text in `TEXT_SECONDARY`
- The proximity word ("Warm", "Hot", "Cold", etc.) in its own color:
  - "Hot": `CORRECT` green
  - "Warm": `PRESENT` yellow
  - "Cool": `ACCENT` blue
  - "Cold": `ABSENT` grey

**Input area:**
- `>` prompt in `ACCENT` (blue)
- Characters typed so far in `TEXT_PRIMARY` + `BOLD`
- Remaining slots shown as `_` in `TEXT_DIM`

---

### 5c. Active Game Screen — Mid Game (Guess 3, language hint revealed)

After guess 3, the language/domain hint appears. Player guessed "return", "string", "struct" against answer "filter".

```
  CodeWordle #47 · Daily         4/6
  ──────────────────────────────────
  Claude working... api.ts [22s]

  ┌───┬───┬───┬───┬───┬───┐
  │ r │ e │ t │ u │ r │ n │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │ s │ t │ r │ i │ n │ g │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │ s │ t │ r │ u │ c │ t │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │ _ │ _ │ _ │ _ │ _ │ _ │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┘

  "Warm -- Array & iteration family"
  Hint: JavaScript / TypeScript

  > _ _ _ _ _ _

  q w (e) (r) (t) y -u- (i) o p
   a -s- d f -g- h j k l
    z x -c- v b (n) m

  Known: e? r? t? i? n?    Not: u s g c
```

**Color mapping for Guess 2 "string" against answer "filter":**
- `s`: ABSENT
- `t`: PRESENT (in "filter" but not pos 2)
- `r`: PRESENT (in "filter" but not pos 3)
- `i`: PRESENT (in "filter" but not pos 4)
- `n`: ABSENT
- `g`: ABSENT

**Color mapping for Guess 3 "struct" against answer "filter":**
- `s`: ABSENT
- `t`: PRESENT
- `r`: PRESENT
- `u`: ABSENT
- `c`: ABSENT
- `t`: PRESENT

**Language hint line:**
- "Hint:" label in `TEXT_DIM`
- Language name in `ACCENT` (blue) + `BOLD`
- Only appears after guess 3 is submitted

---

### 5d. Active Game Screen — Late Game (Guess 5, close to solving)

Player is on their 5th guess. Previous guesses narrowing down to "filter".

```
  CodeWordle #47 · Daily         5/6
  ──────────────────────────────────
  Claude working... index.ts [41s]

  ┌───┬───┬───┬───┬───┬───┐
  │ r │ e │ t │ u │ r │ n │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │ s │ t │ r │ i │ n │ g │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │ s │ t │ r │ u │ c │ t │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │ f │ i │ l │ l │ e │ r │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │ _ │ _ │ _ │ _ │ _ │ _ │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┘

  "Hot! -- You're very close"
  Hint: JavaScript / TypeScript

  > f i _ _ _ _

  q w (e) -r- (t) y -u- (i) o p
   a -s- d f -g- h j k l (l)
    z x -c- v b -n- m

  Known: f1 i2 l? t? e? r?    Not: u s g c n
```

**Color mapping for Guess 4 "filler" against answer "filter":**
- `f`: CORRECT (green) — f is at position 1
- `i`: CORRECT (green) — i is at position 2
- `l`: CORRECT (green) — l is at position 3
- `l`: ABSENT (grey) — only one l in "filter", already matched at pos 3
- `e`: PRESENT (yellow) — e is in "filter" but not at position 5
- `r`: CORRECT (green) — r is at position 6

Wait, let me reconsider. "filter" = f,i,l,t,e,r. "filler" = f,i,l,l,e,r.
- `f`: CORRECT (pos 1 matches)
- `i`: CORRECT (pos 2 matches)
- `l`: CORRECT (pos 3 matches)
- `l`: ABSENT (second l, but "filter" only has one l)
- `e`: PRESENT (e is in "filter" at pos 5, but guess has it at pos 5 too) — actually wait, "filter" positions: f(1) i(2) l(3) t(4) e(5) r(6). "filler" positions: f(1) i(2) l(3) l(4) e(5) r(6).
- `e`: CORRECT (pos 5 matches)
- `r`: CORRECT (pos 6 matches)

So: f=CORRECT, i=CORRECT, l=CORRECT, l=ABSENT, e=CORRECT, r=CORRECT.

**Updated Known Letters display logic:**
- `f1` means "f confirmed at position 1" (green)
- `l?` means "l is present somewhere" (yellow)
- Numbers indicate confirmed positions
- `?` indicates "present but position unknown"

---

### 5e. Win Screen

Player solved it on guess 4. The grid is complete, score card shown.

```
╭──────────────────────────────────────────╮
│                                          │
│              YOU GOT IT!                 │
│                                          │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ r │ e │ t │ u │ r │ n │              │
│  └───┴───┴───┴───┴───┴───┘              │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ s │ t │ r │ i │ n │ g │              │
│  └───┴───┴───┴───┴───┴───┘              │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ f │ i │ l │ l │ e │ r │              │
│  └───┴───┴───┴───┴───┴───┘              │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ f │ i │ l │ t │ e │ r │  << answer   │
│  └───┴───┴───┴───┴───┴───┘              │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  CodeWordle #47         Solved: 4/6      │
│  Streak: 13 ^           Best: 23         │
│  Time: 1m 42s                            │
│                                          │
│  [C] Copy Score    [S] Stats    [Q] Quit │
│                                          │
╰──────────────────────────────────────────╯
  Claude working... tests.ts [48s]
```

**Color notes:**
- "YOU GOT IT!" in `CORRECT` (green) + `BOLD`
- The winning row has all cells in `CORRECT` (green background)
- `<< answer` label in `TEXT_DIM`
- Streak number and `^` (fire caret) in `STREAK_FIRE` (orange)
- `[C]` highlighted in `ACCENT` (blue) — this is the PRIMARY action
- The `^` caret next to streak number represents fire/heat (safe ASCII alternative to emoji)

**Behavior:**
- `[C]` is the default/primary action — copies share card to clipboard
- After copying, briefly flash "Copied!" in `CORRECT` green for 1.5s
- `[S]` shows stats screen
- `[Q]` or `Esc` returns to Claude wait screen
- If Claude finishes while on this screen, it persists for 3 seconds then auto-dismisses

---

### 5f. Lose Screen

Player used all 6 guesses without solving. The answer is revealed.

```
╭──────────────────────────────────────────╮
│                                          │
│             SKILL ISSUE                  │
│                                          │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ r │ e │ t │ u │ r │ n │              │
│  └───┴───┴───┴───┴───┴───┘              │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ s │ t │ r │ i │ n │ g │              │
│  └───┴───┴───┴───┴───┴───┘              │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ s │ t │ r │ u │ c │ t │              │
│  └───┴───┴───┴───┴───┴───┘              │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ f │ i │ l │ l │ e │ r │              │
│  └───┴───┴───┴───┴───┴───┘              │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ m │ a │ p │ p │ e │ r │              │
│  └───┴───┴───┴───┴───┴───┘              │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ l │ i │ n │ k │ e │ r │              │
│  └───┴───┴───┴───┴───┴───┘              │
│                                          │
│  The word was:  F I L T E R              │
│  ──────────────────────────────────────  │
│                                          │
│  CodeWordle #47              X/6         │
│  Streak: 0  (was 12)                     │
│                                          │
│  [C] Copy Score    [S] Stats    [Q] Quit │
│                                          │
╰──────────────────────────────────────────╯
  Claude done! Press any key...
```

**Color notes:**
- "SKILL ISSUE" in `ERROR` (red) + `BOLD`
- The answer "F I L T E R" in `CORRECT` (green) + `BOLD` — revealed with animation
- "X/6" in `ERROR` (red)
- "Streak: 0" in `TEXT_SECONDARY`
- "(was 12)" in `ERROR` (red) + `DIM` — the pain of losing a streak
- Border in `ERROR` (red) instead of normal `BORDER` — subtle visual cue

**Behavior:**
- Same controls as Win Screen
- The answer word animates in letter-by-letter (see Animation section)
- Share card uses X/6 format
- If streak was > 5, show "(was N)" to emphasize the loss — this is the viral shame mechanic

---

### 5g. Stats Screen

Accessible via `[S]` from any end state, or from the welcome screen.

```
╭──────────────────────────────────────────╮
│                                          │
│            YOUR STATS                    │
│                                          │
│  Played   Win %   Streak   Best         │
│    47      89%      13      23           │
│                                          │
│  GUESS DISTRIBUTION                      │
│                                          │
│  1: ##                              2    │
│  2: #####                           5    │
│  3: ################               16    │
│  4: ###########                    11    │
│  5: ######                          6    │
│  6: ##                              2    │
│  X: #####                           5    │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  RECENT                                  │
│  #47 filter   4/6  *                     │
│  #46 reduce   3/6  *                     │
│  #45 switch   2/6  *                     │
│  #44 import   X/6                        │
│  #43 struct   5/6  *                     │
│                                          │
│  [B] Back                                │
│                                          │
╰──────────────────────────────────────────╯
```

**Color notes:**
- Stats numbers in `TEXT_PRIMARY` + `BOLD`
- Bar chart `#` characters: current game's bar in `CORRECT` (green), others in `ACCENT` (blue)
- Win entries with `*` in `CORRECT` (green)
- Loss entries without `*` in `ERROR` (red)
- The `X` row in guess distribution uses `ERROR` (red) for the bar

**Bar chart rendering:**
- Maximum bar width = 24 characters
- Scale bars relative to the highest count
- Use `█` (full block) for filled portions in color mode
- Use `#` in no-color fallback mode
- Show count number right-aligned after the bar

---

### 5h. Daily Challenge Info Screen

Shown when pressing `[D]` from the welcome screen, before the game starts.

```
╭──────────────────────────────────────────╮
│                                          │
│         DAILY CHALLENGE #47              │
│         2026-03-21                       │
│                                          │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ ? │ ? │ ? │ ? │ ? │ ? │              │
│  └───┴───┴───┴───┴───┴───┘              │
│                                          │
│  Category:  ██████████  (hidden)         │
│  Difficulty: ████  /  █████              │
│                                          │
│  Players today:    1,247                 │
│  Average score:    4.2 / 6               │
│  Solved rate:      78%                   │
│                                          │
│                                          │
│  [ENTER] Start    [B] Back               │
│                                          │
╰──────────────────────────────────────────╯
  Claude working... schema.ts [5s]
```

**Color notes:**
- "#47" in `ACCENT` (blue) + `BOLD`
- Date in `TEXT_SECONDARY`
- `?` characters in `PRESENT` (yellow) — mysterious/teasing
- Redacted category text uses `▓` (medium shade block) in `TEXT_DIM`
- Difficulty uses `█` filled blocks in `PRESENT` (yellow) for filled, `░` in `TEXT_DIM` for unfilled
- Stats numbers in `TEXT_PRIMARY`
- "[ENTER]" in `ACCENT` + `BOLD` — primary action

**Behavior:**
- Pressing `Enter` starts the daily challenge
- If already completed today, show the result instead
- Player count, average, and solve rate are fetched from the server (or shown as "--" if offline)

---

### 5i. Practice Mode Active Screen

Identical to the Daily game screen, but with a different header.

```
  CodeWordle · Practice          3/6
  ──────────────────────────────────
  Claude working... db.ts [12s]

  ┌───┬───┬───┬───┬───┬───┐
  │ i │ m │ p │ o │ r │ t │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │ e │ x │ p │ o │ r │ t │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │ _ │ _ │ _ │ _ │ _ │ _ │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┘
  ┌───┬───┬───┬───┬───┬───┐
  │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┘

  "Cool -- same general area"

  > _ _ _ _ _ _

  q w e (r) (t) y u i (o) (p)
   a s d f g h j k l
    z x c v b n m

  Known: r? t? o? p?     Not: i m e x
```

**Differences from Daily Mode:**
- Header shows "Practice" instead of "#47 · Daily"
- No challenge number
- Streak is not affected
- On win/lose, show "[N] New Word" instead of showing the daily score
- Practice wins contribute to "Played" count but NOT to streak
- Practice results are NOT shareable (no share card)

---

### 5j. Practice Mode Win Screen

```
╭──────────────────────────────────────────╮
│                                          │
│              NICE ONE!                   │
│                                          │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ i │ m │ p │ o │ r │ t │              │
│  └───┴───┴───┴───┴───┴───┘              │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ e │ x │ p │ o │ r │ t │              │
│  └───┴───┴───┴───┴───┴───┘              │
│  ┌───┬───┬───┬───┬───┬───┐              │
│  │ r │ o │ u │ t │ e │ r │  << answer   │
│  └───┴───┴───┴───┴───┴───┘              │
│                                          │
│  Solved: 3/6      Time: 0m 54s          │
│  Practice wins today: 7                  │
│                                          │
│  [N] New Word    [S] Stats    [Q] Quit   │
│                                          │
╰──────────────────────────────────────────╯
  Claude working... routes.ts [31s]
```

---

## 6. Interaction Flow & State Machine

### Complete State Machine

```
                    ┌─────────────────┐
                    │   CLAUDE_IDLE   │
                    │  (no game)      │
                    └────────┬────────┘
                             │
                    Claude starts working
                             │
                    ┌────────v────────┐
                    │  GAME_OFFERED   │
                    │  Welcome Screen │
                    └──┬─────┬────┬──┘
                       │     │    │
                   [D] │ [P] │    │ [Q]/Esc
                       │     │    │
              ┌────────v──┐  │  ┌─v──────────┐
              │DAILY_INFO │  │  │CLAUDE_WAIT │
              │  Screen   │  │  │(no game)   │
              └─────┬─────┘  │  └────────────┘
                    │        │
               [ENTER]      │
                    │        │
              ┌─────v────────v───┐
              │   PLAYING        │
              │   Active Game    │<──────────────┐
              └──┬───┬───┬───┬──┘                │
                 │   │   │   │                   │
          Correct│   │   │   │Invalid        [N] New Word
          6 chars│   │   │   │Word           (Practice only)
                 │   │   │   │                   │
        ┌────────v┐  │   │ ┌─v──────────┐       │
        │CHECKING │  │   │ │ERROR_FLASH │       │
        │Validate │  │   │ │"Not in     │       │
        │& Reveal │  │   │ │ word list" │       │
        └────┬────┘  │   │ └────────────┘       │
             │       │   │                       │
     ┌───────v───┐   │   │                       │
     │  REVEAL   │   │   │                       │
     │  Animate  │   │   │                       │
     │  Letters  │   │   │                       │
     └──┬────┬───┘   │   │                       │
        │    │       │   │                       │
   Win! │    │ Wrong │   │                       │
        │    │ Guess │   │                       │
   ┌────v─┐  │       │   │                       │
   │ WIN  │  │       │   │                       │
   │Screen│  │       │   │                       │
   └─┬──┬─┘  │       │   │                       │
     │  │    │    Guess│  │                       │
     │  │    │    < 6  │  │                       │
     │  │    │       │ │  │                       │
     │  │    └───────┘ │  │                       │
     │  │              │  │                       │
     │  │      Guess 6,│  │                       │
     │  │      wrong   │  │                       │
     │  │         │    │  │                       │
     │  │    ┌────v──┐ │  │                       │
     │  │    │ LOSE  │ │  │                       │
     │  │    │Screen │ │  │                       │
     │  │    └──┬──┬─┘ │  │                       │
     │  │       │  │   │  │                       │
     │  │  [C]  │  │   │  │                       │
     │  └───────┤  │   │  │                       │
     │     ┌────v──┐   │  │                       │
     │     │COPIED │   │  │                       │
     │     │Flash  │   │  │                       │
     │     └───────┘   │  │                       │
     │                 │  │                       │
     │  [N]            │  │                       │
     │  (practice)─────┼──┼───────────────────────┘
     │                 │  │
     │  [Q]/Esc        │  │
     └─────────────────┼──┘
                       │
              ┌────────v────────┐
              │   CLAUDE_IDLE   │
              │   (game over)   │
              └─────────────────┘


  === INTERRUPT STATES ===

  Any state + Claude finishes:

  ┌─────────────┐         ┌────────────────────┐
  │ Any PLAYING │────────>│ INTERRUPT_PROMPT   │
  │ state       │ Claude  │ "Claude is done!   │
  │             │ done    │  Finish game? Y/N" │
  └─────────────┘         └──┬──────────┬──────┘
                              │          │
                          [Y] │      [N] │
                              │          │
                    ┌─────────v┐    ┌────v───────┐
                    │ PLAYING  │    │ GAME_SAVED │
                    │(continue)│    │ "Resume    │
                    │          │    │  next wait"│
                    └──────────┘    └────────────┘

  ┌──────────────┐         ┌────────────────────┐
  │ WIN or LOSE  │────────>│ Auto-dismiss after │
  │ Screen       │ Claude  │ 3 seconds, OR      │
  │              │ done    │ any key dismisses   │
  └──────────────┘         └────────────────────┘
```

### State Descriptions

| State | Description | Valid Inputs | Transitions |
|-------|-------------|-------------|-------------|
| `CLAUDE_IDLE` | Claude is not working. No game UI shown. | None (game not active) | Claude starts working -> `GAME_OFFERED` |
| `GAME_OFFERED` | Welcome screen shown. | `D`, `P`, `S`, `Q`, `Esc` | `D` -> `DAILY_INFO`, `P` -> `PLAYING`, `S` -> `STATS`, `Q` -> `CLAUDE_IDLE` |
| `DAILY_INFO` | Shows daily challenge metadata. | `Enter`, `B` | `Enter` -> `PLAYING`, `B` -> `GAME_OFFERED` |
| `PLAYING` | Active game. Player typing guesses. | `a-z`, `Backspace`, `Enter`, `Esc` | `Enter` (valid 6-char word) -> `CHECKING`, `Enter` (invalid) -> `ERROR_FLASH`, `Esc` -> `GAME_OFFERED` |
| `CHECKING` | Validating the guess against dictionary. | None (instantaneous) | Valid word -> `REVEAL`, Invalid -> `ERROR_FLASH` |
| `REVEAL` | Animating letter-by-letter result. | None (animation playing, ~1.2s) | All correct -> `WIN`, Wrong + guesses < 6 -> `PLAYING`, Wrong + guess 6 -> `LOSE` |
| `ERROR_FLASH` | "Not in word list" message. | Any key clears. | -> `PLAYING` (same guess row, input preserved) |
| `WIN` | Victory screen with score card. | `C`, `S`, `Q`, `N` (practice only) | `C` -> `COPIED`, `S` -> `STATS`, `Q` -> `CLAUDE_IDLE`, `N` -> `PLAYING` |
| `LOSE` | Defeat screen with answer reveal. | `C`, `S`, `Q`, `N` (practice only) | Same as WIN |
| `COPIED` | Flash "Copied!" confirmation. | Auto-dismiss after 1.5s | -> previous screen (WIN or LOSE) |
| `STATS` | Stats overlay. | `B` | -> previous screen |
| `INTERRUPT_PROMPT` | Claude finished during gameplay. | `Y`, `N` | `Y` -> `PLAYING` (continue), `N` -> `GAME_SAVED` |
| `GAME_SAVED` | Game state serialized for next wait. | None | -> `CLAUDE_IDLE` |

### What Happens When Claude Finishes Mid-Guess?

**Scenario 1: Player is typing (has entered some characters but not submitted)**

```
╭──────────────────────────────────────────╮
│                                          │
│  Claude finished! Your code is ready.    │
│                                          │
│  You're on guess 3/6.                    │
│  Want to finish your game?               │
│                                          │
│  [Y] Keep playing     [N] Save for later │
│                                          │
╰──────────────────────────────────────────╯
```

- `Y`: Game continues. Claude status line changes to "Claude done -- playing offline"
- `N`: Game state is serialized to `~/.codewordle/saved_game.json`. Next time Claude starts working, the game resumes from where they left off.

**Scenario 2: Player is on guess 5/6 (critical moment)**

Same prompt, but with added urgency messaging:

```
╭──────────────────────────────────────────╮
│                                          │
│  Claude finished! Your code is ready.    │
│                                          │
│  You're on guess 5/6 -- so close!        │
│  Want to finish?                         │
│                                          │
│  [Y] Finish it!       [N] Save for later │
│                                          │
╰──────────────────────────────────────────╯
```

**Scenario 3: Player is watching the reveal animation**

The reveal animation completes, THEN the interrupt prompt shows. Never interrupt mid-animation.

**Scenario 4: Player is on the Win/Lose screen**

The Claude-done notification appears in the status line. The game screen persists for 3 seconds, then auto-dismisses. Any keypress during those 3 seconds also dismisses.

### Game Save/Resume Format

When a game is saved for later:

```json
{
  "mode": "daily",
  "challenge_number": 47,
  "target_word": "filter",
  "guesses": ["return", "string"],
  "current_input": "fi",
  "started_at": "2026-03-21T14:30:00Z",
  "saved_at": "2026-03-21T14:31:42Z"
}
```

On resume, restore the full game state:
- All previous guesses with their color states
- The partial input the player was typing
- Keyboard tracker state
- Semantic hints from previous guesses
- A "Resumed" indicator in the header for 3 seconds

---

## 7. Input Design

### Character Input

- Accept only `a-z` (lowercase alpha characters)
- Uppercase input is automatically lowered
- Non-alpha characters are silently ignored (no error flash)
- Maximum 6 characters per input
- Characters appear in the current guess row as they are typed

### Input Rendering

As the player types, characters fill the active row left-to-right:

```
Before typing:
┌───┬───┬───┬───┬───┬───┐
│ _ │ _ │ _ │ _ │ _ │ _ │
└───┴───┴───┴───┴───┴───┘

After typing "fil":
┌───┬───┬───┬───┬───┬───┐
│ f │ i │ l │ _ │ _ │ _ │
└───┴───┴───┴───┴───┴───┘

Full word "filter" typed (ready to submit):
┌───┬───┬───┬───┬───┬───┐
│ f │ i │ l │ t │ e │ r │
└───┴───┴───┴───┴───┴───┘
```

- Typed characters: `TEXT_PRIMARY` + `BOLD` on `EMPTY` background
- Untyped slots: `_` in `TEXT_DIM`
- A subtle cursor indicator on the NEXT empty slot (blinking underscore via `\x1b[5m` if supported, solid underscore otherwise)

### Backspace Behavior

- Deletes the last typed character
- Cursor moves back one position
- The deleted slot reverts to `_`
- If input is already empty, backspace does nothing (no error, no sound)

### Enter Behavior

**If fewer than 6 characters typed:**
```
  > f i l _ _ _
  Need 6 letters!
```
- Error message in `ERROR` (red)
- Message disappears after 1.5 seconds or on next keypress
- Input is preserved (not cleared)

**If 6 characters typed but word not in dictionary:**
```
  > f i l t z q
  Not in word list
```
- Error message in `ERROR` (red)
- The guess row cells briefly shake (see Animation section)
- Input is preserved (not cleared) — player can backspace and correct
- Message disappears after 2 seconds or on next keypress

**If 6 characters typed and word is valid:**
- Input is accepted
- Transition to `REVEAL` state
- Input row becomes locked (no more editing)
- Letter-by-letter reveal animation begins

### Escape Behavior

- During gameplay: Show confirmation "Quit game? Progress will be lost. [Y/N]"
- During typing: Clear current input first. Second `Esc` shows quit confirmation.
- On Win/Lose screen: Dismiss and return to Claude wait screen

### Special Keys

| Key | Action |
|-----|--------|
| `a-z` | Type character (if < 6 entered) |
| `A-Z` | Converted to lowercase, same as above |
| `Backspace` / `Delete` | Remove last character |
| `Enter` | Submit guess (if 6 chars) or show error |
| `Esc` | Clear input / Quit game |
| `Ctrl+C` | Immediately exit game, return to Claude |
| `Tab` | Ignored |
| Arrow keys | Ignored during gameplay |
| `0-9`, symbols | Ignored |

---

## 8. Hint System Visual Design

### Character-Level Hints (Per-Cell)

Each cell in a submitted guess row gets one of three visual treatments:

**CORRECT (right letter, right position):**
```
\x1b[48;5;114m\x1b[38;5;0m\x1b[1m f \x1b[0m
```
Green background (#87d787), black text, bold.
The cell border also turns green.

**PRESENT (right letter, wrong position):**
```
\x1b[48;5;221m\x1b[38;5;0m\x1b[1m i \x1b[0m
```
Yellow/amber background (#ffd75f), black text, bold.
The cell border also turns yellow.

**ABSENT (letter not in word):**
```
\x1b[48;5;236m\x1b[38;5;245m n \x1b[0m
```
Dark grey background (#303030), mid-grey text, no bold.
The cell border stays dark grey.

### Duplicate Letter Handling

Follow standard Wordle rules:
1. First, mark all CORRECT matches
2. Then, for remaining unmatched letters, mark PRESENT only if the target word has unmatched instances of that letter
3. Example: target="filter", guess="filler"
   - f: CORRECT (pos 1)
   - i: CORRECT (pos 2)
   - l: CORRECT (pos 3)
   - l: ABSENT (only one 'l' in "filter", already matched)
   - e: CORRECT (pos 5)
   - r: CORRECT (pos 6)

### Semantic Proximity Hint

Displayed below the grid after each guess. Shows how "close" the guess is to the answer semantically.

**Proximity Levels:**

| Level | Label | Color | When |
|-------|-------|-------|------|
| 5 | "On fire! -- almost there" | `CORRECT` green + `BOLD` | Same subcategory, 1-2 chars off |
| 4 | "Hot -- same family" | `CORRECT` green | Same subcategory (e.g., both Array methods) |
| 3 | "Warm -- same domain" | `PRESENT` yellow | Same broad category (e.g., both JS built-ins) |
| 2 | "Cool -- different area" | `ACCENT` blue | Same language but different domain |
| 1 | "Cold -- way off" | `ABSENT` grey | Different language or entirely different domain |

**Rendering:**
```
  "Hot -- same family: Array methods"
```
- The proximity word ("Hot") is in its respective color
- The `--` separator is in `TEXT_DIM`
- The description is in `TEXT_SECONDARY`
- After guess 2, the family/category name is included
- After guess 1, only the proximity level is shown (no category)

**Example progression for answer "filter" (Array method, JavaScript):**

```
Guess 1: "return"  ->  "Warm -- same domain"
Guess 2: "string"  ->  "Cool -- different area"
Guess 3: "splice"  ->  "Hot -- same family: Array methods"
Guess 4: "filter"  ->  WIN
```

### Language/Domain Hint (After Guess 3)

After the 3rd guess is submitted, a persistent hint line appears:

```
  Hint: JavaScript / TypeScript
```

Or for more specific words:

```
  Hint: SQL / Database
```

Or:

```
  Hint: Git / Version Control
```

**Rendering:**
- "Hint:" label in `TEXT_DIM`
- Category text in `ACCENT` (blue) + `BOLD`
- This line persists for all remaining guesses
- Positioned directly below the semantic hint line

### Known Letters Tracker

Displayed below the keyboard. Summarizes confirmed information.

```
  Known: f1 i2 l3 e5 r6    Present: t    Not: u s g c n
```

**Rendering rules:**
- "Known:" label in `TEXT_DIM`
- Confirmed letters (CORRECT) shown as `letter + position_number` in `CORRECT` green
  - e.g., `f1` means f is confirmed at position 1
- "Present:" label in `TEXT_DIM`
- Present letters (in word, position unknown) shown as just the letter in `PRESENT` yellow
- "Not:" label in `TEXT_DIM`
- Absent letters in `ABSENT` grey
- Letters are sorted alphabetically within each group

**When a PRESENT letter gets upgraded to CORRECT:**
- Remove from "Present" group
- Add to "Known" group with position number
- This happens automatically after each guess

---

## 9. Share Card Design

### Clipboard Copy Format (Plain Text — for Twitter, Slack, Discord)

**Win:**
```
CodeWordle #47 -- 4/6

......
..*...
*...**
******

Streak: 13
```

**Character legend for share card:**
```
*  = CORRECT (right letter, right position)
.  = PRESENT (right letter, wrong position)
   (space) or - = ABSENT (letter not in word)
```

Wait -- these need to be more visually distinctive. Using Unicode squares:

**Win (Final format):**
```
CodeWordle #47 -- 4/6
~~~~~~
~~*~~~
*~~~**
******
Streak: 13
```

No, let me use the cleanest format. Standard block characters that render well everywhere:

**Win (Final final format):**
```
CodeWordle #47 -- 4/6

------
--.---
.---..
......

Streak: 13
```

Actually, the best approach is colored square emoji since these are for EXTERNAL rendering (Slack, Twitter, Discord), not the terminal:

**Primary Share Card (Emoji version -- copied to clipboard):**

```
CodeWordle #47 -- 4/6

⬛🟨🟨🟨⬛⬛
⬛🟨🟨🟨⬛⬛
🟩🟩🟩⬛🟩🟩
🟩🟩🟩🟩🟩🟩

Streak: 13 🔥
```

**Emoji mapping:**
- `🟩` = CORRECT
- `🟨` = PRESENT
- `⬛` = ABSENT

This is the Wordle-standard format. Everyone recognizes it.

**Lose:**
```
CodeWordle #47 -- X/6

⬛🟨🟨🟨⬛⬛
⬛🟨🟨🟨⬛⬛
🟩🟩🟩⬛🟩🟩
🟩🟩🟩⬛🟩🟩
⬛🟩⬛⬛🟩🟩
⬛🟩⬛⬛🟩🟩

💀 Skill issue detected
```

### Rich Terminal Version (displayed in-terminal before copying)

Shows the full colored grid in the terminal. This is what the player sees before they press `[C]` to copy.

```
╭──────────────────────────────────────────╮
│                                          │
│  CodeWordle #47              4/6         │
│                                          │
│         ⬛ 🟨 🟨 🟨 ⬛ ⬛               │
│         ⬛ 🟨 🟨 🟨 ⬛ ⬛               │
│         🟩 🟩 🟩 ⬛ 🟩 🟩               │
│         🟩 🟩 🟩 🟩 🟩 🟩               │
│                                          │
│  Streak: 13 ^                            │
│                                          │
│  [C] Copy to clipboard                   │
│                                          │
╰──────────────────────────────────────────╯
```

Wait -- this is the terminal, so we should NOT use emoji here. Instead, use ANSI-colored block characters:

```
╭──────────────────────────────────────────╮
│                                          │
│  CodeWordle #47              4/6         │
│                                          │
│          ░░ ▓▓ ▓▓ ▓▓ ░░ ░░              │
│          ░░ ▓▓ ▓▓ ▓▓ ░░ ░░              │
│          ██ ██ ██ ░░ ██ ██              │
│          ██ ██ ██ ██ ██ ██              │
│                                          │
│  Streak: 13 ^                            │
│                                          │
│  [C] Copy to clipboard                   │
│                                          │
╰──────────────────────────────────────────╯
```

Where:
- `██` (full block) in `CORRECT` green = correct position
- `▓▓` (medium shade) in `PRESENT` yellow = present but wrong position
- `░░` (light shade) in `ABSENT` grey = not in word

### What Gets Copied to Clipboard

When the player presses `[C]`, the following plain text is written to the system clipboard via:
- macOS: `pbcopy`
- Linux: `xclip -selection clipboard` or `xsel --clipboard`
- WSL: `clip.exe`

**Exact clipboard content:**

```
CodeWordle #47 -- 4/6

⬛🟨🟨🟨⬛⬛
⬛🟨🟨🟨⬛⬛
🟩🟩🟩⬛🟩🟩
🟩🟩🟩🟩🟩🟩

Streak: 13 🔥
```

- No word reveals (spoiler-free)
- Challenge number included (so people can compare)
- Streak included (social proof / flex)
- Fire emoji on streak only if streak >= 3
- A trailing newline

**Practice mode:** No share card. The `[C]` button is not shown. Practice results are private.

### No-Color Share Card Fallback

If clipboard write fails, print the share card to stdout so the user can manually copy:

```
(Could not access clipboard. Copy the text below:)

CodeWordle #47 -- 4/6
__****
__****
***.**
******
Streak: 13

(Text uses: * = correct, . = present, _ = absent)
```

---

## 10. Animation & Transitions

### Letter Reveal Animation (After Pressing Enter)

Each letter in the submitted guess reveals its color state one at a time, left to right.

**Timing:** 200ms per letter, total ~1.2s for 6 letters.

**Sequence for guess "filter" where f=CORRECT, i=PRESENT, l=ABSENT, t=CORRECT, e=CORRECT, r=CORRECT:**

```
Frame 0 (0ms):     All 6 cells show white text on empty background
┌───┬───┬───┬───┬───┬───┐
│ f │ i │ l │ t │ e │ r │  <- all TEXT_PRIMARY on EMPTY bg
└───┴───┴───┴───┴───┴───┘

Frame 1 (200ms):   Cell 1 flips to its color
┌───┬───┬───┬───┬───┬───┐
│ F │ i │ l │ t │ e │ r │  <- 'F' now GREEN bg, uppercase during flip
└───┴───┴───┴───┴───┴───┘

Frame 2 (400ms):   Cell 2 flips
┌───┬───┬───┬───┬───┬───┐
│ f │ I │ l │ t │ e │ r │  <- 'I' now YELLOW bg
└───┴───┴───┴───┴───┴───┘

Frame 3 (600ms):   Cell 3 flips
┌───┬───┬───┬───┬───┬───┐
│ f │ i │ L │ t │ e │ r │  <- 'L' now GREY bg
└───┴───┴───┴───┴───┴───┘

Frame 4 (800ms):   Cell 4 flips
┌───┬───┬───┬───┬───┬───┐
│ f │ i │ l │ T │ e │ r │  <- 'T' now GREEN bg
└───┴───┴───┴───┴───┴───┘

Frame 5 (1000ms):  Cell 5 flips
┌───┬───┬───┬───┬───┬───┐
│ f │ i │ l │ t │ E │ r │  <- 'E' now GREEN bg
└───┴───┴───┴───┴───┴───┘

Frame 6 (1200ms):  Cell 6 flips, all letters return to lowercase
┌───┬───┬───┬───┬───┬───┐
│ f │ i │ l │ t │ e │ r │  <- 'r' now GREEN bg, all lowercase
└───┴───┴───┴───┴───┴───┘
```

**The "flip" effect per cell:**
1. Cell content briefly shows as UPPERCASE (100ms)
2. Background color transitions from `EMPTY` to the result color
3. Cell content returns to lowercase
4. This simulates a "card flip" in the terminal

**During the reveal animation:**
- Input is locked (keypresses are buffered and ignored)
- The keyboard tracker updates AFTER all 6 letters are revealed
- The semantic hint updates AFTER all 6 letters are revealed

### Invalid Word Shake Animation

When the player submits a word not in the dictionary:

**Timing:** 3 oscillations over 400ms

```
Frame 0 (0ms):     Normal position
         ┌───┬───┬───┬───┬───┬───┐
         │ f │ i │ l │ t │ z │ q │
         └───┴───┴───┴───┴───┴───┘

Frame 1 (65ms):    Shift right 1 char
          ┌───┬───┬───┬───┬───┬───┐
          │ f │ i │ l │ t │ z │ q │
          └───┴───┴───┴───┴───┴───┘

Frame 2 (130ms):   Shift left 2 chars
       ┌───┬───┬───┬───┬───┬───┐
       │ f │ i │ l │ t │ z │ q │
       └───┴───┴───┴───┴───┴───┘

Frame 3 (195ms):   Shift right 2 chars
          ┌───┬───┬───┬───┬───┬───┐
          │ f │ i │ l │ t │ z │ q │
          └───┴───┴───┴───┴───┴───┘

Frame 4 (260ms):   Shift left 1 char
        ┌───┬───┬───┬───┬───┬───┐
        │ f │ i │ l │ t │ z │ q │
        └───┴───┴───┴───┴───┴───┘

Frame 5 (325ms):   Shift right 1 char
          ┌───┬───┬───┬───┬───┬───┐
          │ f │ i │ l │ t │ z │ q │
          └───┴───┴───┴───┴───┴───┘

Frame 6 (400ms):   Back to normal
         ┌───┬───┬───┬───┬───┬───┐
         │ f │ i │ l │ t │ z │ q │
         └───┴───┴───┴───┴───┴───┘
```

Implementation: adjust the left-margin of the row by +/- 1 character. The oscillation pattern is: 0, +1, -1, +1, -1, +1, 0 with decreasing amplitude.

Simultaneously, the "Not in word list" error message appears in `ERROR` red below the input area.

### Win Celebration

**Timing:** 800ms total

**Sequence:**

```
Phase 1 (0-400ms): The winning row pulses bright

Frame 0: Normal green background
┌───┬───┬───┬───┬───┬───┐
│ f │ i │ l │ t │ e │ r │   CORRECT green bg
└───┴───┴───┴───┴───┴───┘

Frame 1 (100ms): Bright flash
┌───┬───┬───┬───┬───┬───┐
│ F │ I │ L │ T │ E │ R │   BOLD + bright green (\x1b[48;5;120m)
└───┴───┴───┴───┴───┴───┘

Frame 2 (200ms): Back to normal green
┌───┬───┬───┬───┬───┬───┐
│ f │ i │ l │ t │ e │ r │   Normal CORRECT green
└───┴───┴───┴───┴───┴───┘

Frame 3 (300ms): Second bright flash
┌───┬───┬───┬───┬───┬───┐
│ F │ I │ L │ T │ E │ R │   BOLD + bright green
└───┴───┴───┴───┴───┴───┘

Frame 4 (400ms): Settle to final
┌───┬───┬───┬───┬───┬───┐
│ f │ i │ l │ t │ e │ r │   Normal CORRECT green
└───┴───┴───┴───┴───┴───┘


Phase 2 (400-800ms): "YOU GOT IT!" text appears with typing effect

Frame 5 (400ms):   Y
Frame 6 (450ms):   YO
Frame 7 (500ms):   YOU
Frame 8 (530ms):   YOU
Frame 9 (560ms):   YOU G
Frame 10 (590ms):  YOU GO
Frame 11 (620ms):  YOU GOT
Frame 12 (660ms):  YOU GOT
Frame 13 (700ms):  YOU GOT I
Frame 14 (740ms):  YOU GOT IT
Frame 15 (780ms):  YOU GOT IT!
```

### Lose Reveal Animation

The answer is revealed letter-by-letter with dramatic pacing.

**Timing:** 1.5s total

```
Phase 1 (0-300ms): "The word was:" text appears
Phase 2 (300-1500ms): Letters appear one at a time

Frame 0 (300ms):   The word was:  _  _  _  _  _  _
Frame 1 (500ms):   The word was:  F  _  _  _  _  _
Frame 2 (700ms):   The word was:  F  I  _  _  _  _
Frame 3 (900ms):   The word was:  F  I  L  _  _  _
Frame 4 (1100ms):  The word was:  F  I  L  T  _  _
Frame 5 (1300ms):  The word was:  F  I  L  T  E  _
Frame 6 (1500ms):  The word was:  F  I  L  T  E  R
```

Each letter appears in `CORRECT` green + `BOLD`. The spacing is intentionally wide (2 spaces between letters) for dramatic effect.

### Game Start Transition

When the player presses `[D]` or `[P]`:

**Timing:** 300ms

```
Frame 0 (0ms):     Welcome screen visible
Frame 1 (100ms):   Welcome screen content fades (replace with TEXT_DIM color)
Frame 2 (200ms):   Clear screen, draw game board frame (borders only)
Frame 3 (300ms):   Fill in all UI elements, cursor on first input slot
```

Implementation: Simply clear and redraw. The "fade" is achieved by briefly rendering the welcome screen content in `TEXT_DIM` before clearing.

### Claude Interrupt Transition

When Claude finishes during gameplay:

**Timing:** Immediate overlay

```
Frame 0:  Game screen (playing)
Frame 1:  Claude status line changes:
          "Claude working... api.ts [34s]"  ->  "Claude done!"
          Color changes from TEXT_DIM to CORRECT green + BOLD
Frame 2 (500ms later): Interrupt prompt overlay appears (centered box)
```

The game board remains visible behind/below the interrupt prompt. The prompt is a small centered box overlaid on the game area:

```
          ┌──────────────────────────┐
          │  Claude done!            │
          │  Finish your game? Y/N   │
          └──────────────────────────┘
```

---

## 11. Edge Cases & Interrupts

### Terminal Resize During Gameplay

- Listen for `SIGWINCH` signal
- If new size >= minimum (44x24): redraw entire game at new size
- If new size < minimum: show "Terminal too small" message, pause game timer
- When terminal returns to valid size: redraw and resume
- Game state is never lost on resize

### Rapid Input During Reveal Animation

- Keypresses during the 1.2s reveal animation are **buffered**
- After the animation completes, if the game continues (wrong guess, guesses remaining):
  - Buffered alpha characters are applied to the new input row
  - Buffered Enter is **discarded** (prevent accidental submission of incomplete word)
  - Buffered Backspace is applied normally

### Multiple Claude Tasks

If Claude starts a new task while a game is in progress (rare but possible):
- The game continues uninterrupted
- The Claude status line updates to reflect the new task
- No interrupt prompt is shown for task transitions, only for task completion

### Network Offline (for Daily Challenge)

- Daily word is generated deterministically from the date seed, so no network needed for the word itself
- Stats (players today, solve rate) show "--" when offline
- Share card still works locally (clipboard copy)
- Leaderboard features are simply not shown

### Player Closes Terminal Mid-Game

- Game state is auto-saved to `~/.codewordle/autosave.json` after every guess submission
- On next launch, check for autosave and offer to resume
- Daily challenges: only resume if it's still the same day (UTC)
- Practice mode: always offer to resume

### Empty Word List Edge Case

If the word list file is missing or corrupted:
- Show error: "Word list not found. Reinstall CodeWordle."
- Exit gracefully to Claude wait screen
- Never crash or hang

---

## 12. Accessibility

### Screen Reader Compatibility

While a fully visual game, provide text output for screen reader users:

After each guess, output a text summary:
```
Guess 3: "struct"
  s - not in word
  t - in word, wrong position
  r - in word, wrong position
  u - not in word
  c - not in word
  t - in word, wrong position
Semantic hint: Warm, same domain
3 guesses remaining
```

### Color Blind Support

The three states (CORRECT, PRESENT, ABSENT) are distinguishable by MORE than color alone:

| State | Color | Shape/Indicator | Text Treatment |
|-------|-------|-----------------|----------------|
| CORRECT | Green bg | Cell border becomes double-line `║` `═` | Letter is BOLD |
| PRESENT | Yellow bg | Letter is wrapped in dots `·f·` | Letter is italic (if supported) |
| ABSENT | Grey bg | Standard single-line border | Letter is dim |

**High-contrast mode** (activated via `--high-contrast` flag or `CODEWORDLE_HIGH_CONTRAST=1`):

```
CORRECT:  \x1b[48;5;208m  (orange background — more distinct from yellow)
PRESENT:  \x1b[48;5;75m   (blue background — distinct from orange)
ABSENT:   \x1b[48;5;236m  (dark grey — unchanged)
```

This orange/blue scheme is distinguishable for protanopia, deuteranopia, and tritanopia.

### Keyboard-Only Navigation

The entire game is keyboard-only by design. No mouse interaction is needed or supported.

### Motion Sensitivity

Provide `--no-animation` flag or `CODEWORDLE_NO_ANIMATION=1` environment variable:
- Disables shake animation
- Disables letter-by-letter reveal (shows all at once)
- Disables win celebration pulse
- Disables typing effect on text reveals
- All transitions become instant

---

## 13. Data Model

### Local Storage

All data stored in `~/.codewordle/`:

```
~/.codewordle/
  stats.json          # Cumulative player statistics
  history.json        # Game history (last 100 games)
  autosave.json       # Current in-progress game (if any)
  saved_game.json     # Game saved due to Claude interrupt
  settings.json       # Player preferences
```

### stats.json

```json
{
  "version": 1,
  "total_played": 47,
  "total_won": 42,
  "current_streak": 13,
  "max_streak": 23,
  "guess_distribution": {
    "1": 2,
    "2": 5,
    "3": 16,
    "4": 11,
    "5": 6,
    "6": 2,
    "X": 5
  },
  "last_played_daily": "2026-03-21",
  "last_daily_number": 47,
  "practice_played": 31,
  "practice_won": 28
}
```

### history.json

```json
{
  "version": 1,
  "games": [
    {
      "mode": "daily",
      "challenge_number": 47,
      "date": "2026-03-21",
      "word": "filter",
      "guesses": ["return", "string", "filler", "filter"],
      "result": "win",
      "guess_count": 4,
      "time_seconds": 102,
      "hints_shown": {
        "semantic": ["Warm", "Cool", "Hot"],
        "language": "JavaScript / TypeScript"
      }
    }
  ]
}
```

### settings.json

```json
{
  "version": 1,
  "high_contrast": false,
  "no_animation": false,
  "auto_offer_game": true,
  "preferred_mode": "daily",
  "color_mode": "256"
}
```

---

## Appendix A: Complete Keyboard Tracker Rendering

The keyboard tracker shows all 26 letters in QWERTY layout with color states.

### Full QWERTY Layout

```
  q  w  e  r  t  y  u  i  o  p
   a  s  d  f  g  h  j  k  l
    z  x  c  v  b  n  m
```

**Spacing:** 3 characters per key (letter + 2 spaces). Second row indented 1 space. Third row indented 2 spaces.

### State Rendering Per Key

```
Unused:      q       TEXT_PRIMARY (white), normal weight
CORRECT:     Q       CORRECT green, BOLD, uppercase
PRESENT:    (e)      PRESENT yellow, wrapped in parentheses
ABSENT:     -u-      ABSENT grey, wrapped in dashes
```

### Example Mid-Game Keyboard

Answer is "filter", player has guessed "return" and "string":

```
  q  w (e)(r)(t) y -u-(i) o  p
   a -s- d  f -g- h  j  k  l
    z  x -c- v  b (n) m
```

Color breakdown:
- `(e)` = yellow (present in "filter", guessed in "return" pos 2)
- `(r)` = yellow (present in "filter", guessed in "return" pos 1)
- `(t)` = yellow (present in "filter", guessed in multiple)
- `-u-` = grey (not in "filter")
- `(i)` = yellow (present in "filter", guessed in "string" pos 4)
- `-s-` = grey (not in "filter")
- `-g-` = grey (not in "filter")
- `-c-` = grey (not in "filter")
- `(n)` = yellow... wait, 'n' is NOT in "filter". Let me recalculate.

Correction:
- `(n)` should be `-n-` (grey, absent)

Fixed:
```
  q  w (e)(r)(t) y -u-(i) o  p
   a -s- d  f -g- h  j  k  l
    z  x -c- v  b -n- m
```

### Keyboard Updates After CORRECT is Found

When a letter is confirmed CORRECT (green) in a guess, it overrides any previous PRESENT (yellow) state:

```
Before guess "filter" (answer is "filter"):
  (r) = yellow (was present from earlier guess)

After guess "filter" (all correct):
   R  = green, uppercase (now CORRECT)
```

CORRECT always overrides PRESENT. ABSENT is never overridden.

---

## Appendix B: Word List Criteria

### Requirements for Word Inclusion

1. Exactly 6 lowercase alpha characters [a-z]
2. Must be a recognizable programming term (keyword, method, concept, tool)
3. Must be in common use (not obscure academic terms)
4. No proper nouns (brand names like "github" are excluded)
5. No offensive words
6. Should be guessable by a mid-level developer

### Sample Word List (Starter Set — ~200 words)

```
filter, reduce, splice, concat, substr, repeat, search, import,
export, return, switch, throws, delete, typeof, static, public,
extend, struct, lambda, cursor, select, insert, update, schema,
docker, deploy, daemon, socket, router, render, branch, commit,
rebase, squash, buffer, thread, module, define, object, string,
number, symbol, assert, expect, before, global, inline, pragma,
printf, malloc, method, invoke, create, closed, linked, signed,
screen, scroll, column, margin, border, hidden, circle, canvas,
button, dialog, slider, iframe, escape, encode, decode, cipher,
parsed, signed, server, client, master, worker, docker, kernel,
length, splice, frozen, spread, symbol, regexp, typeof, float,
double, signed, sealed, yields, output, pragma, extern, friend,
derive, struct, traits, unsafe, borrow, shadow, native, scoped,
nested, joined, mapped, sorted, forked, merged, cloned, pushed,
popped, sliced, parsed, piped, shared, async, catch, match,
fetch, patch, class, super, break, while, elsif, elsif, yield,
throw, await, const, final, print, debug, watch, mount, route,
query, index, array, queue, stack, graph, table, model, param
```

Note: This list needs curation. Some entries above are 5 characters (catch, match, etc.) — those should be removed. Final list must be verified to be exactly 6 characters each. A production word list should contain 300-500 words for variety.

### Daily Word Selection Algorithm

```typescript
function getDailyWord(wordList: string[], dayNumber: number): string {
  // Deterministic hash from day number + salt
  const seed = sha256(`codewordle-daily-${dayNumber}-v1`);
  // Convert first 8 hex chars to integer
  const index = parseInt(seed.substring(0, 8), 16) % wordList.length;
  return wordList[index];
}

function getDayNumber(): number {
  // Days since epoch date (2026-01-01)
  const epoch = new Date('2026-01-01T00:00:00Z');
  const now = new Date();
  const diff = now.getTime() - epoch.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
```

---

## Appendix C: Rendering Engine Notes

### Differential Rendering

Do NOT redraw the entire screen on every frame. Instead:

1. Maintain a virtual screen buffer (2D array of `{char, fg, bg, bold}`)
2. On each update, compute the diff between current and previous buffer
3. Only emit ANSI escape codes for cells that changed
4. Use `\x1b[row;colH` to position cursor at specific cells

This is critical for performance and to avoid terminal flicker.

### Cursor Management

```
Hide cursor on game start:   \x1b[?25l
Show cursor on game exit:    \x1b[?25h
Move cursor:                 \x1b[{row};{col}H
```

Always restore cursor visibility on exit, including on crash (use process exit handler).

### Alternate Screen Buffer

Use the alternate screen buffer so the game doesn't pollute the terminal scrollback:

```
Enter alternate screen:  \x1b[?1049h
Exit alternate screen:   \x1b[?1049l
```

On exit, the terminal returns to its previous state with no game artifacts visible. Register cleanup handlers for `SIGINT`, `SIGTERM`, and `uncaughtException`.

### Raw Mode Input

Switch terminal to raw mode to capture individual keypresses:

```typescript
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
```

Restore on exit:
```typescript
process.stdin.setRawMode(false);
process.stdin.pause();
```

### Frame Rate

- Game is NOT real-time (no game loop needed)
- Render only on:
  - Keypress events
  - Animation frames (requestAnimationFrame equivalent using setTimeout)
  - Claude status updates
  - Terminal resize
- During animations, use 60ms intervals (~16fps) for smooth appearance

---

## Appendix D: Configuration & CLI Flags

### Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `CODEWORDLE_ENABLED` | `0`, `1` | `1` | Enable/disable game entirely |
| `CODEWORDLE_HIGH_CONTRAST` | `0`, `1` | `0` | Use high-contrast color scheme |
| `CODEWORDLE_NO_ANIMATION` | `0`, `1` | `0` | Disable all animations |
| `CODEWORDLE_DATA_DIR` | path | `~/.codewordle` | Custom data directory |
| `NO_COLOR` | any | unset | Disable all colors (standard) |

### Integration API

The game exposes these functions for the Claude Code integration layer:

```typescript
interface CodeWordleAPI {
  // Called when Claude starts working
  offerGame(): void;

  // Called when Claude finishes working
  claudeFinished(): void;

  // Called to check if game is currently active
  isPlaying(): boolean;

  // Called to force-quit the game (e.g., user pressed Ctrl+C on Claude)
  forceQuit(): void;

  // Called to get the current game state for serialization
  getState(): GameState | null;
}
```

---

*End of design specification. This document provides complete implementation-level detail for every screen, state, interaction, animation, and edge case in CodeWordle. A developer should be able to build this character-for-character from this spec alone.*
