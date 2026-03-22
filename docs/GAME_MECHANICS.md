# CodeWordle -- Technical Game Design Specification

**Date**: 2026-03-21
**Status**: Design Complete -- Ready for Implementation
**Depends on**: `001_terminal_game_brainstorm.md` (Phase 1 pick)
**Estimated Build**: 2-3 days

---

## Table of Contents

1. [Core Game Loop (State Machine)](#1-core-game-loop-state-machine)
2. [Guess Validation Rules](#2-guess-validation-rules)
3. [Hint Algorithm](#3-hint-algorithm)
4. [Difficulty Calibration](#4-difficulty-calibration)
5. [Interruption Handling](#5-interruption-handling)
6. [Data Model](#6-data-model)
7. [Persistence](#7-persistence)
8. [Configuration](#8-configuration)
9. [Performance Considerations](#9-performance-considerations)

---

## 1. Core Game Loop (State Machine)

### State Diagram

```
                         ┌──────────────────────────────────────────┐
                         │                                          │
                   ┌─────▼─────┐     SPACE / auto     ┌───────────┴──────┐
                   │   IDLE    │ ─────────────────────>│   GAME_START     │
                   └───────────┘                       └────────┬─────────┘
                         ▲                                      │
                         │ dismiss                         render board
                   ┌─────┴─────┐                                │
                   │ SCORE_CARD│◄─── copy/dismiss ──┐    ┌──────▼──────┐
                   └───────────┘                    │    │   TYPING    │◄──────────┐
                                                    │    └──────┬──────┘           │
                                                    │           │ ENTER            │
                                                    │    ┌──────▼──────┐           │
                                                    │    │  VALIDATING │           │
                                                    │    └──────┬──────┘           │
                                                    │      valid│  │invalid        │
                                                    │           │  └──> ERROR ─────┘
                                                    │    ┌──────▼──────┐           │
                                                    │    │ HINT_REVEAL │           │
                                                    │    └──────┬──────┘           │
                                                    │           │                  │
                                              ┌─────┴──┐  ┌────┴────┐  ┌──────────┘
                                              │  WIN   │  │  LOSE   │  │ guesses < 6
                                              │ STATE  │  │  STATE  │  │
                                              └────────┘  └─────────┘

           At ANY state (except IDLE/SCORE_CARD):
           ┌─────────────────────────────────────┐
           │  Claude finishes  ──> PAUSE_STATE   │
           │                        │     │      │
           │                   RESUME   FINISH   │
           │                   (grace)  (score)  │
           └─────────────────────────────────────┘
```

### State Definitions

#### IDLE
- **Display**: Claude wait spinner with game prompt
  ```
  Spinning Claude is thinking...
  Press [SPACE] to play CodeWordle  |  Daily #47  |  Streak: 12
  ```
- **Accepted input**: SPACE (start game), ESC (dismiss prompt permanently for this wait)
- **Transitions**: SPACE -> GAME_START, Claude finishes -> remove prompt
- **Data saved**: None

#### GAME_START
- **Display**: Empty 6x6 board, keyboard status row, guess counter "1/6"
  ```
  CodeWordle #47               1/6
  ┌─┬─┬─┬─┬─┬─┐
  │ │ │ │ │ │ │
  ├─┼─┼─┼─┼─┼─┤
  │ │ │ │ │ │ │
  ├─┼─┼─┼─┼─┼─┤
  │ │ │ │ │ │ │
  ├─┼─┼─┼─┼─┼─┤
  │ │ │ │ │ │ │
  ├─┼─┼─┼─┼─┼─┤
  │ │ │ │ │ │ │
  ├─┼─┼─┼─┼─┼─┤
  │ │ │ │ │ │ │
  └─┴─┴─┴─┴─┴─┘
  a b c d e f g h i j k l m
  n o p q r s t u v w x y z
  ```
- **Accepted input**: Any letter key (begins typing)
- **Transitions**: keypress -> TYPING
- **Data saved**: `gameId`, `startTimestamp`, `mode` (daily/practice), `targetWord`

#### TYPING
- **Display**: Board with current row showing typed characters, cursor blinking on next empty cell
- **Accepted input**:
  - Letter keys (a-z): append character to current guess (if length < 6)
  - BACKSPACE: remove last character
  - ENTER: submit guess (if length == 6)
  - ESC: open pause menu (confirm quit)
  - Ctrl+C: immediate quit, state saved for resume
- **Transitions**:
  - ENTER (6 chars typed) -> VALIDATING
  - ESC -> PAUSE_MENU (sub-state, not full PAUSE_STATE)
  - Claude finishes -> PAUSE_STATE
- **Data saved**: partial input saved on interrupt only

#### VALIDATING
- **Display**: Brief processing indicator (< 50ms, likely invisible to user)
- **Accepted input**: None (blocked during validation)
- **Transitions**:
  - Valid word -> HINT_REVEAL
  - Invalid word -> ERROR (returns to TYPING with error message)
- **Data saved**: None

#### ERROR (sub-state of TYPING)
- **Display**: Error message on row below the board, clears after 2 seconds or next keypress
  ```
  "Not in word list" | "Too short" | "Already guessed"
  ```
- **Accepted input**: Any key clears error, input continues in TYPING
- **Transitions**: keypress/timeout -> TYPING
- **Data saved**: None

#### HINT_REVEAL
- **Display**: Animated reveal of the current guess row, left to right, 120ms per cell. Each cell flips to its hint color (green/yellow/gray). After row reveal completes, semantic hint appears below board.
  ```
  Reveal animation per cell:
  [?] -> (120ms pause) -> [G] (colored)
  Total row animation: ~720ms (6 cells x 120ms)
  ```
  After animation:
  ```
  "ICE COLD -- completely different domain"     (guess 1-2)
  "WARM -- you're in the right neighborhood"    (guess 3+)
  "Hint: Common in Python, JavaScript"          (guess 3+ language hint)
  ```
- **Accepted input**: None during animation. After animation: any key to proceed.
- **Transitions**:
  - All green -> WIN_STATE
  - Guess 6 and not all green -> LOSE_STATE
  - Guess < 6 and not all green -> TYPING (next row)
  - Claude finishes during animation -> complete animation, then PAUSE_STATE
- **Data saved**: `guesses[]` array updated, `hints[]` array updated

#### WIN_STATE
- **Display**: Board with all rows, win message, time taken, share card
  ```
  CodeWordle #47 -- SOLVED in 3/6!
  Time: 1m 42s

  [C] to copy share card  |  [ENTER] to dismiss
  ```
- **Accepted input**: C (copy share card), ENTER/ESC (dismiss)
- **Transitions**: any key -> SCORE_CARD
- **Data saved**: `result: "win"`, `guessCount`, `duration`, `streakUpdated`

#### LOSE_STATE
- **Display**: Board with all rows, answer revealed, share card
  ```
  CodeWordle #47 -- X/6
  The answer was: REDUCE

  [C] to copy share card  |  [ENTER] to dismiss
  ```
- **Accepted input**: C (copy share card), ENTER/ESC (dismiss)
- **Transitions**: any key -> SCORE_CARD
- **Data saved**: `result: "loss"`, `duration`, `streakBroken`

#### SCORE_CARD
- **Display**: Share card formatted for clipboard (see Share Format in brainstorm doc)
- **Accepted input**: ENTER/ESC (dismiss and return to Claude output)
- **Transitions**: dismiss -> IDLE (prompt cleared, Claude output shown)
- **Data saved**: Share card text to clipboard (if C was pressed)

#### PAUSE_STATE
- **Display**: Game board frozen, overlay message
  ```
  ┌──────────────────────────────────┐
  │  Claude finished! Game paused.   │
  │                                  │
  │  [R] Resume game (30s grace)     │
  │  [Q] Quit & save score           │
  │  [C] Copy share card (partial)   │
  │                                  │
  │  Auto-dismiss in 30s...          │
  └──────────────────────────────────┘
  ```
- **Accepted input**: R (resume), Q (quit with partial score), C (copy partial share card)
- **Transitions**:
  - R -> TYPING (resume game, 30s grace timer starts)
  - Q -> SCORE_CARD (with partial result)
  - Timeout (30s) -> SCORE_CARD (auto-score)
  - Special case: if on guess 5 or 6, grace period is 60s and messaging says "Finish your game!"
- **Data saved**: Full game state to disk for potential resume

---

## 2. Guess Validation Rules

### What Constitutes a Valid Guess

1. **Length**: Exactly 6 characters. No partial submissions.
2. **Character set**: Lowercase English letters only (a-z). No digits, no symbols, no spaces.
3. **Dictionary membership**: The guess MUST exist in the valid words dictionary. Random 6-letter strings are rejected.
4. **Case handling**: All input is normalized to lowercase before validation. Display can show uppercase for aesthetics.
5. **No repeat guesses**: A word already guessed in the current game is rejected.

### Valid Words Dictionary Structure

The dictionary is split into two tiers:

```
word_bank/
  targets.json     -- Words that CAN be the answer (~300 words, curated)
  accepted.json    -- Words accepted as guesses but never chosen as answer (~800 words)
```

**Target words** (`targets.json`): Carefully curated programming keywords that are:
- Exactly 6 characters
- Recognizable to most programmers across languages
- Not obscure (no `RTFM` or language-specific deep cuts in v1)
- Unambiguous in meaning

**Accepted words** (`accepted.json`): Broader set including:
- Common English words that happen to be 6 characters (prevents "not in dictionary" frustration)
- Less common programming terms
- Abbreviations common in code (`strlen`, `printf`, `sizeof`)

Combined, any word in either list is a valid guess. Only words in `targets.json` are ever selected as answers.

### Sample Target Words (Curated Starter Set)

```
-- Control Flow --
return, switch, import, export, throws, assert,
rescue, unless, repeat,

-- Types & Structures --
string, object, number, static, struct, record,
symbol, bigint,

-- Operations --
reduce, filter, splice, concat, delete, assign,
insert, update, select, create,

-- Concepts --
deploy, docker, lambda, cursor, socket, worker,
thread, module, kernel, router, render, scroll,
buffer, stream,

-- Tools & Ecosystem --
python, github, vercel, chrome, neovim,

-- Keywords --
typeof, public, friend, sealed, unsafe, extern,
inline, throws, yields, native,

-- Common in Code --
length, format, handle, parser, encode, decode,
config, schema, define,
```

### Error Messages

| Condition | Message | Display Duration |
|-----------|---------|-----------------|
| Too short (< 6 chars, ENTER pressed) | `Need 6 letters` | Until next keypress |
| Not in dictionary | `Not in word list` | 2 seconds or next keypress |
| Already guessed | `Already tried that` | 2 seconds or next keypress |
| Invalid character attempted | No message (key simply ignored) | N/A |

### Special Character Handling

Words with special characters are **excluded from both dictionaries**. No hyphens, underscores, dots, or camelCase. All words are single contiguous lowercase alphabetic strings. This keeps the game clean and avoids keyboard complexity in terminal input.

Rationale: Programming has plenty of pure-alpha 6-letter keywords. Adding special chars would complicate input handling, make the grid ugly, and create ambiguity about what counts as a "character."

---

## 3. Hint Algorithm

### 3.1 Character Hints (Wordle-Style)

Each cell in the guess row receives one of three states:

| State | Color | Meaning |
|-------|-------|---------|
| CORRECT | Green (`\x1b[42m`) | Right letter, right position |
| PRESENT | Yellow (`\x1b[43m`) | Right letter, wrong position |
| ABSENT | Gray (`\x1b[90m`) | Letter not in word |

#### Algorithm: `computeCharacterHints(guess: string, answer: string) -> HintCell[]`

This is the most critical algorithm in the game. It must handle duplicate letters correctly.

```
ALGORITHM computeCharacterHints(guess, answer):

  INPUT:  guess  = 6-char string (validated)
          answer = 6-char string (the target)
  OUTPUT: hints  = array of 6 HintCell values (CORRECT | PRESENT | ABSENT)

  -- Phase 1: Mark exact matches (CORRECT)
  -- This must happen FIRST to avoid double-counting

  hints = [ABSENT, ABSENT, ABSENT, ABSENT, ABSENT, ABSENT]   -- default all to ABSENT
  answerLetterPool = {}   -- frequency map of unmatched answer letters

  FOR i = 0 TO 5:
    IF guess[i] == answer[i]:
      hints[i] = CORRECT
    ELSE:
      answerLetterPool[answer[i]] += 1    -- only count unmatched answer letters

  -- Phase 2: Mark wrong-position matches (PRESENT)
  -- Only consume from the remaining pool

  FOR i = 0 TO 5:
    IF hints[i] != CORRECT:               -- skip already-matched positions
      IF answerLetterPool[guess[i]] > 0:
        hints[i] = PRESENT
        answerLetterPool[guess[i]] -= 1   -- consume one instance
      -- ELSE: remains ABSENT (default)

  RETURN hints
```

#### Duplicate Letter Examples

**Example 1**: guess = `"better"`, answer = `"buffer"`
```
Position:  0   1   2   3   4   5
Guess:     b   e   t   t   e   r
Answer:    b   u   f   f   e   r

Phase 1 (exact matches):
  pos 0: b == b -> CORRECT      pool: {u:1, f:2, e:1}  (skipped, matched)
  pos 1: e != u                 pool: {u:1, f:2, e:1}
  pos 2: t != f                 pool: {u:1, f:2, e:1}
  pos 3: t != f                 pool: {u:1, f:2, e:1}
  pos 4: e != e -> wait, e == e -> CORRECT    pool: {u:1, f:2}  (skipped)
  pos 5: r == r -> CORRECT      pool: {u:1, f:2}

Phase 2 (wrong position):
  pos 1: e -- pool has e? No (e was consumed in Phase 1) -> ABSENT
  pos 2: t -- pool has t? No -> ABSENT
  pos 3: t -- pool has t? No -> ABSENT

Result: [CORRECT, ABSENT, ABSENT, ABSENT, CORRECT, CORRECT]
         b(G)    e(-)    t(-)    t(-)    e(G)    r(G)
```

**Example 2**: guess = `"return"`, answer = `"reduce"`
```
Position:  0   1   2   3   4   5
Guess:     r   e   t   u   r   n
Answer:    r   e   d   u   c   e

Phase 1:
  pos 0: r == r -> CORRECT      pool: {d:1, u:0->skip, c:1, e:1}
  pos 1: e == e -> CORRECT      pool: {d:1, c:1, e:1}
  pos 2: t != d                 pool: {d:1, c:1, e:1}
  pos 3: u == u -> CORRECT      pool: {d:1, c:1, e:1}
  pos 4: r != c                 pool: {d:1, c:1, e:1}
  pos 5: n != e                 pool: {d:1, c:1, e:1}

Phase 2:
  pos 2: t -- pool has t? No -> ABSENT
  pos 4: r -- pool has r? No (already matched at pos 0) -> ABSENT
  pos 5: n -- pool has n? No -> ABSENT

Result: [CORRECT, CORRECT, ABSENT, CORRECT, ABSENT, ABSENT]
         r(G)    e(G)    t(-)    u(G)    r(-)    n(-)
```

**Example 3**: guess = `"llamas"`, answer = `"global"` (tricky: guess has 2 L's, answer has 1 unmatched L)
```
Position:  0   1   2   3   4   5
Guess:     l   l   a   m   a   s
Answer:    g   l   o   b   a   l

Phase 1:
  pos 0: l != g                 pool: {g:1}
  pos 1: l == l -> CORRECT      pool: {g:1}   (l at pos 1 consumed by exact match)
  pos 2: a != o                 pool: {g:1, o:1}
  pos 3: m != b                 pool: {g:1, o:1, b:1}
  pos 4: a == a -> CORRECT      pool: {g:1, o:1, b:1}
  pos 5: s != l                 pool: {g:1, o:1, b:1, l:1}

Phase 2:
  pos 0: l -- pool has l? Yes (1) -> PRESENT, pool l -> 0
  pos 2: a -- pool has a? No -> ABSENT
  pos 3: m -- pool has m? No -> ABSENT
  pos 5: s -- pool has s? No -> ABSENT

Result: [PRESENT, CORRECT, ABSENT, ABSENT, CORRECT, ABSENT]
         l(Y)    l(G)    a(-)    m(-)    a(G)    s(-)
```

#### Keyboard Tracker

In addition to per-cell hints, maintain a keyboard state map updated after each guess:

```
ALGORITHM updateKeyboard(guess, hints, keyboardState):
  FOR i = 0 TO 5:
    letter = guess[i]
    newState = hints[i]
    oldState = keyboardState[letter]

    -- Priority: CORRECT > PRESENT > ABSENT > UNKNOWN
    IF priority(newState) > priority(oldState):
      keyboardState[letter] = newState
```

The keyboard display at the bottom of the board uses the same green/yellow/gray coloring to show which letters have been tried and their best known state.

### 3.2 Semantic Proximity Hints

After each guess, in addition to character hints, show a semantic proximity indicator. This is CodeWordle's differentiator from standard Wordle.

#### Category Taxonomy

Every word in `targets.json` is tagged with metadata:

```typescript
interface WordMeta {
  word: string;
  category: PrimaryCategory;
  subcategory: string;
  languages: Language[];        // languages where this is a keyword/concept
  domain: Domain;               // broader domain grouping
  difficulty: number;           // 1-5 scale
}
```

**Primary Categories** (mutually exclusive per word):

| Category | Example Words |
|----------|--------------|
| `CONTROL_FLOW` | return, switch, rescue, repeat, unless |
| `DATA_TYPE` | string, number, object, symbol, bigint, struct, record |
| `OPERATION` | reduce, filter, splice, concat, delete, assign, insert |
| `DECLARATION` | import, export, static, public, extern, inline, define |
| `CONCEPT` | deploy, lambda, thread, worker, module, kernel, stream |
| `TOOL` | docker, github, vercel, chrome, neovim, python |
| `KEYWORD` | typeof, throws, yields, unsafe, sealed, friend, native |
| `BUILTIN` | length, format, encode, decode, printf, sizeof, substr |

**Domains** (broader groupings, one per word):

| Domain | Categories it contains |
|--------|----------------------|
| `LANGUAGE_CONSTRUCT` | CONTROL_FLOW, DATA_TYPE, DECLARATION, KEYWORD |
| `DATA_MANIPULATION` | OPERATION, BUILTIN |
| `INFRASTRUCTURE` | CONCEPT, TOOL |

**Languages** (non-exclusive, a word can belong to multiple):

```
JavaScript, TypeScript, Python, Rust, Go, Java, C, C++,
Ruby, PHP, Swift, Kotlin, Haskell, SQL, Shell, Universal
```

`Universal` = concept exists across most languages (e.g., `return`, `string`, `thread`).

#### Proximity Scoring Algorithm

```
ALGORITHM computeProximity(guess: WordMeta, answer: WordMeta) -> ProximityResult:

  score = 0
  maxScore = 10

  -- Level 1: Same exact word (should not happen, game would be won)
  IF guess.word == answer.word:
    RETURN { level: "EXACT", score: 10 }

  -- Level 2: Category match (strongest signal)
  IF guess.category == answer.category:
    score += 5

  -- Level 3: Domain match (weaker signal)
  ELSE IF guess.domain == answer.domain:
    score += 3

  -- Level 4: Subcategory match (bonus on top of category)
  IF guess.subcategory == answer.subcategory:
    score += 2

  -- Level 5: Language overlap
  sharedLanguages = intersection(guess.languages, answer.languages)
  IF sharedLanguages.length > 0:
    -- More shared languages = slightly higher score
    languageBonus = min(sharedLanguages.length / max(guess.languages.length, answer.languages.length), 1.0)
    score += round(languageBonus * 2)   -- 0, 1, or 2 bonus points

  -- Level 6: Letter overlap bonus (ties to character hints, small signal)
  commonLetters = intersection(uniqueLetters(guess.word), uniqueLetters(answer.word))
  IF commonLetters.length >= 4:
    score += 1

  -- Clamp
  score = clamp(score, 0, 10)

  -- Map to proximity level
  RETURN { level: mapScoreToLevel(score), score: score }
```

#### Proximity Levels

| Score | Level | Display | Color |
|-------|-------|---------|-------|
| 0 | `ICE_COLD` | `ICE COLD -- completely different domain` | Blue |
| 1-2 | `COLD` | `COLD -- not much in common` | Cyan |
| 3-4 | `COOL` | `COOL -- distant relation` | White |
| 5-6 | `WARM` | `WARM -- you're in the right area` | Yellow |
| 7-8 | `HOT` | `HOT -- very close!` | Red |
| 9 | `SAME_FAMILY` | `SAME FAMILY -- almost there!` | Bright Red |
| 10 | `EXACT` | N/A (game won) | Green |

#### Semantic Hint Display Rules

- **Guesses 1-2**: Show proximity level only (e.g., `COLD -- not much in common`)
- **Guesses 3-4**: Show proximity level + domain hint (e.g., `WARM -- you're in the right area [Language Construct]`)
- **Guesses 5-6**: Show proximity level + category hint (e.g., `HOT -- very close! [Data Type]`)

### 3.3 Language Hint (Unlocked After Guess 3)

Starting from guess 3, if the answer is not `Universal`, show a language hint:

```
ALGORITHM languageHint(answer: WordMeta, guessNumber: number) -> string | null:
  IF guessNumber < 3:
    RETURN null

  IF answer.languages includes "Universal":
    RETURN "Common across most languages"

  IF answer.languages.length == 1:
    RETURN "Primarily used in " + answer.languages[0]

  IF answer.languages.length <= 3:
    RETURN "Common in " + joinWithComma(answer.languages)

  RETURN "Found in many languages"
```

Display format:
```
Guess 3+:  WARM -- you're in the right area
           Hint: Common in Python, JavaScript
```

### 3.4 Hint for Accepted-Only Words

If a player guesses a word from `accepted.json` (not in `targets.json`), the character hints still work normally. However, the semantic hint falls back to a generic message since the word has no metadata:

```
-- Character hints: computed normally (letter matching is pure string logic)
-- Semantic hint: "No semantic data for this word"
```

This is acceptable because players will learn quickly that programming keywords give richer hints.

---

## 4. Difficulty Calibration

### 4.1 Word Difficulty Scoring

Each word in `targets.json` receives a difficulty score (1-5) based on four factors:

```
ALGORITHM computeDifficulty(word: string, wordBank: WordMeta[]) -> number:

  -- Factor 1: Letter Frequency Score (0-25)
  -- Based on English letter frequency (ETAOIN SHRDLU...)
  -- Common letters = easier, rare letters = harder
  letterFreqScore = 0
  FOR each char in word:
    letterFreqScore += ENGLISH_FREQUENCY_RANK[char]   -- e=1(common), z=26(rare)
  -- Normalize: lower score = more common letters = easier
  -- Range: 6 (all common) to 156 (all rare), typical: 30-80
  freqNormalized = (letterFreqScore - 6) / 150   -- 0.0 to 1.0

  -- Factor 2: Unique Letters (0.0 to 1.0)
  -- More unique letters = easier (more info per guess)
  uniqueRatio = uniqueLetters(word).length / 6
  uniqueScore = 1.0 - uniqueRatio   -- repeated letters = harder

  -- Factor 3: Neighbor Count (0.0 to 1.0)
  -- How many other target words share 4+ letters?
  -- More neighbors = harder (more possible answers fit partial hints)
  neighbors = wordBank.filter(w => sharedLetters(w, word) >= 4).length
  neighborScore = min(neighbors / 10, 1.0)

  -- Factor 4: Category Size (0.0 to 1.0)
  -- Words in large categories are harder (more to sift through)
  categorySize = wordBank.filter(w => w.category == word.category).length
  categorySizeScore = min(categorySize / 20, 1.0)

  -- Weighted combination
  rawDifficulty = (
    freqNormalized   * 0.30 +    -- letter rarity weight
    uniqueScore      * 0.20 +    -- repeated letters weight
    neighborScore    * 0.30 +    -- confusion potential weight
    categorySizeScore * 0.20      -- category ambiguity weight
  )

  -- Map 0.0-1.0 to 1-5 star difficulty
  RETURN ceil(rawDifficulty * 5)
```

### 4.2 Daily Difficulty Rotation

Daily puzzles follow a weekly difficulty curve designed to keep players engaged:

| Day | Target Difficulty | Rationale |
|-----|-------------------|-----------|
| Monday | 1-2 (Easy) | Welcoming start, rebuild streak confidence |
| Tuesday | 2-3 (Medium) | Ramp up |
| Wednesday | 3-4 (Hard) | Mid-week peak, the "challenge day" |
| Thursday | 2-3 (Medium) | Breather |
| Friday | 4-5 (Hard) | End-of-week flex, bragging rights |
| Saturday | 1-2 (Easy) | Weekend casual |
| Sunday | 3 (Medium) | Setup for Monday |

#### Daily Word Selection Algorithm

```
ALGORITHM selectDailyWord(date: Date, wordBank: WordMeta[]) -> WordMeta:
  dayOfWeek = date.getDay()   -- 0=Sunday through 6=Saturday
  targetDifficulty = DIFFICULTY_CURVE[dayOfWeek]

  -- Deterministic seed from date (ensures same word globally)
  seed = hashDate(date)   -- e.g., simple hash of "2026-03-21"
  rng = seededRandom(seed)

  -- Filter to target difficulty range
  candidates = wordBank.filter(w =>
    w.difficulty >= targetDifficulty.min AND
    w.difficulty <= targetDifficulty.max
  )

  -- Exclude recently used words (last 30 days)
  candidates = candidates.filter(w => NOT in recentWords(30))

  -- Deterministic selection
  index = floor(rng.next() * candidates.length)
  RETURN candidates[index]
```

**Seeded RNG**: Use a simple mulberry32 or similar PRNG seeded with a date hash. This ensures every player worldwide gets the same daily word without any server.

```typescript
function mulberry32(seed: number): () => number {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashDate(date: Date): number {
  const str = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
```

### 4.3 Practice Mode Word Selection

Practice mode uses an adaptive difficulty system:

```
ALGORITHM selectPracticeWord(playerStats: PlayerStats, wordBank: WordMeta[]) -> WordMeta:

  -- Calculate player skill level from recent performance
  recentGames = playerStats.history.slice(-20)   -- last 20 games
  avgGuesses = mean(recentGames.map(g => g.guessCount || 7))  -- 7 for losses
  winRate = recentGames.filter(g => g.result == "win").length / recentGames.length

  -- Map to target difficulty
  IF winRate > 0.8 AND avgGuesses < 3.5:
    targetDifficulty = 4-5    -- player is crushing it, ramp up
  ELSE IF winRate > 0.6:
    targetDifficulty = 3-4    -- good player, moderate challenge
  ELSE IF winRate > 0.3:
    targetDifficulty = 2-3    -- struggling a bit, keep it fair
  ELSE:
    targetDifficulty = 1-2    -- new or struggling, keep it easy

  -- Random selection within difficulty band (non-deterministic, true random)
  candidates = wordBank.filter(w =>
    w.difficulty >= targetDifficulty.min AND
    w.difficulty <= targetDifficulty.max AND
    NOT in playerStats.practiceWordsUsed   -- no repeats ever in practice
  )

  -- If pool exhausted, reset and allow repeats
  IF candidates.length == 0:
    playerStats.practiceWordsUsed = []
    candidates = wordBank.filter(w => w.difficulty >= targetDifficulty.min AND w.difficulty <= targetDifficulty.max)

  RETURN randomChoice(candidates)
```

**New players** (< 5 games played) always get difficulty 1-2 words regardless of performance.

---

## 5. Interruption Handling

This is the most critical UX problem. The game lives inside Claude Code's wait loop. When Claude finishes, the terminal needs to return to normal. But killing the game mid-type is a terrible experience.

### 5.1 Interruption Signal

Claude Code's extension system will emit a signal when work completes. CodeWordle listens for this:

```typescript
// Integration point with Claude Code
interface ClaudeCodeEvents {
  onWorkStart: () => void;       // Claude begins processing
  onWorkComplete: () => void;    // Claude finishes -- INTERRUPTION SIGNAL
  onWorkError: () => void;       // Claude errors out
}
```

When `onWorkComplete` fires, CodeWordle enters PAUSE_STATE regardless of current state.

### 5.2 Interruption Behavior by State

| Current State | Behavior on Claude Finish |
|---------------|--------------------------|
| IDLE | Remove game prompt immediately. No action needed. |
| GAME_START | Save empty game state. Dismiss game. Show Claude output. |
| TYPING (guess 1-4) | Freeze board. Show PAUSE overlay. 30-second grace period. |
| TYPING (guess 5-6) | Freeze board. Show PAUSE overlay. **60-second** grace period. Message: "You're almost done! Finish your game." |
| VALIDATING | Complete validation, show result, then PAUSE. |
| HINT_REVEAL | Complete the reveal animation (max 720ms), then PAUSE. |
| WIN_STATE | Show score card immediately. Game is complete -- no interruption conflict. |
| LOSE_STATE | Show score card immediately. Game is complete -- no interruption conflict. |
| SCORE_CARD | Dismiss card, show Claude output. |

### 5.3 Grace Period Mechanics

```
ALGORITHM handleInterruption(gameState: GameState):

  IF gameState.state IN [WIN_STATE, LOSE_STATE, SCORE_CARD, IDLE]:
    -- Game is already in a terminal state, just clean up
    dismissGame()
    showClaudeOutput()
    RETURN

  IF gameState.state == HINT_REVEAL:
    -- Let the animation finish (max 720ms)
    AWAIT animationComplete

  -- Determine grace period
  gracePeriod = 30_000   -- 30 seconds default
  IF gameState.currentGuess >= 5:
    gracePeriod = 60_000  -- 60 seconds for guess 5-6

  -- Enter PAUSE_STATE
  gameState.state = PAUSE_STATE
  gameState.pauseTimestamp = now()
  gameState.graceDeadline = now() + gracePeriod
  saveStateToDisk(gameState)

  -- Show overlay
  renderPauseOverlay(gracePeriod)

  -- Start countdown timer
  countdownTimer = setInterval(() => {
    remaining = gameState.graceDeadline - now()
    IF remaining <= 0:
      autoFinishGame(gameState)
      RETURN
    updateCountdownDisplay(remaining)
  }, 1000)

  -- Wait for input
  LISTEN FOR:
    'r' -> resumeGame(gameState, countdownTimer)
    'q' -> quitGame(gameState, countdownTimer)
    'c' -> copyPartialShareCard(gameState)
```

### 5.4 Resume vs. Quit

**Resume** (`R` key):
- Game board reappears exactly as it was
- Timer continues counting (total game duration includes pause)
- If the grace period expires during resumed play, give an additional 15-second warning: "Wrapping up in 15s..."
- If the second grace period expires, auto-submit whatever is typed (or auto-quit if nothing is typed)

**Quit** (`Q` key):
- Game is scored as a partial result
- Stats record: `result: "interrupted"`, with guesses made and hints revealed
- Share card shows interrupted state:
  ```
  CodeWordle #47 -- Interrupted (3/6 guesses)
  ......
  ..o...
  ooo...
  [Claude finished early]
  ```
- This does NOT break a streak (interrupted games are excluded from streak calculation)

### 5.5 State Persistence Across Sessions

If the terminal crashes, the user quits Claude Code, or the process is killed:

```
ALGORITHM recoverGameState():
  stateFile = ~/.codewordle/current_game.json

  IF NOT exists(stateFile):
    RETURN null

  savedState = readJSON(stateFile)

  -- Check if the game is still valid
  IF savedState.mode == "daily":
    IF savedState.date != today():
      -- Yesterday's game, too late
      deleteFile(stateFile)
      RETURN null
    IF savedState.completed:
      -- Already finished
      RETURN null
    -- Valid daily game, can resume
    RETURN savedState

  IF savedState.mode == "practice":
    -- Practice games can always resume
    IF now() - savedState.lastActivity > 3600_000:  -- 1 hour timeout
      deleteFile(stateFile)
      RETURN null
    RETURN savedState
```

On next launch, if a recoverable game state exists:
```
Resume in-progress game? (Y/N)
CodeWordle #47 -- Guess 3/6  [2 guesses made]
```

---

## 6. Data Model

### 6.1 Core Game Types

```typescript
// ──────────────────────────────────────────────
// ENUMS
// ──────────────────────────────────────────────

enum HintState {
  CORRECT = "correct",     // green -- right letter, right position
  PRESENT = "present",     // yellow -- right letter, wrong position
  ABSENT = "absent",       // gray -- letter not in word
  UNKNOWN = "unknown",     // default state for keyboard
}

enum GameResult {
  WIN = "win",
  LOSS = "loss",
  INTERRUPTED = "interrupted",
  IN_PROGRESS = "in_progress",
}

enum GameMode {
  DAILY = "daily",
  PRACTICE = "practice",
}

enum GameState {
  IDLE = "idle",
  GAME_START = "game_start",
  TYPING = "typing",
  VALIDATING = "validating",
  HINT_REVEAL = "hint_reveal",
  WIN_STATE = "win_state",
  LOSE_STATE = "lose_state",
  SCORE_CARD = "score_card",
  PAUSE_STATE = "pause_state",
}

enum ProximityLevel {
  ICE_COLD = "ice_cold",
  COLD = "cold",
  COOL = "cool",
  WARM = "warm",
  HOT = "hot",
  SAME_FAMILY = "same_family",
}

enum PrimaryCategory {
  CONTROL_FLOW = "control_flow",
  DATA_TYPE = "data_type",
  OPERATION = "operation",
  DECLARATION = "declaration",
  CONCEPT = "concept",
  TOOL = "tool",
  KEYWORD = "keyword",
  BUILTIN = "builtin",
}

enum Domain {
  LANGUAGE_CONSTRUCT = "language_construct",
  DATA_MANIPULATION = "data_manipulation",
  INFRASTRUCTURE = "infrastructure",
}

type Language =
  | "JavaScript" | "TypeScript" | "Python" | "Rust" | "Go"
  | "Java" | "C" | "C++" | "Ruby" | "PHP" | "Swift"
  | "Kotlin" | "Haskell" | "SQL" | "Shell" | "Universal";
```

### 6.2 Word Bank

```typescript
// ──────────────────────────────────────────────
// WORD BANK (targets.json schema)
// ──────────────────────────────────────────────

interface WordEntry {
  word: string;                   // exactly 6 lowercase alpha chars
  category: PrimaryCategory;
  subcategory: string;            // freeform, e.g., "array_methods", "type_system"
  domain: Domain;
  languages: Language[];
  difficulty: number;             // 1-5, computed at build time
}

// targets.json
interface TargetWordBank {
  version: number;                // schema version for migrations
  generatedAt: string;            // ISO 8601 timestamp
  words: WordEntry[];             // ~300 curated entries
}

// accepted.json
interface AcceptedWordBank {
  version: number;
  generatedAt: string;
  words: string[];                // flat list of 6-char strings, no metadata
}
```

### 6.3 Game Session

```typescript
// ──────────────────────────────────────────────
// ACTIVE GAME SESSION (current_game.json)
// ──────────────────────────────────────────────

interface GuessRecord {
  word: string;                         // the guessed word
  hints: HintState[];                   // array of 6 hint states
  proximity: ProximityLevel;            // semantic proximity result
  proximityScore: number;               // raw score 0-10
  timestamp: number;                    // unix ms when guess was submitted
}

interface ActiveGame {
  // Identity
  gameId: string;                       // unique ID: "daily-2026-03-21" or "practice-{uuid}"
  mode: GameMode;
  dailyNumber: number | null;           // sequential daily puzzle number, null for practice
  date: string;                         // ISO date "2026-03-21"

  // Target
  targetWord: string;                   // the answer (stored for offline resume)
  targetMeta: WordEntry;                // full metadata of target word

  // Progress
  state: GameState;
  guesses: GuessRecord[];               // 0-6 entries
  currentInput: string;                 // partial input buffer (for resume)
  keyboardState: Record<string, HintState>;  // a-z -> best known state

  // Timing
  startedAt: number;                    // unix ms
  lastActivity: number;                 // unix ms, updated on every input
  pausedAt: number | null;              // unix ms when paused, null if not paused
  totalPauseDuration: number;           // cumulative ms spent paused

  // Result (set when game ends)
  result: GameResult;
  finishedAt: number | null;
}
```

### 6.4 Player Statistics

```typescript
// ──────────────────────────────────────────────
// PLAYER STATS (stats.json)
// ──────────────────────────────────────────────

interface DailyStreak {
  current: number;                      // current consecutive-day streak
  longest: number;                      // all-time longest streak
  lastPlayedDate: string;               // ISO date of last daily game
}

interface GuessDistribution {
  1: number;                            // games won in 1 guess
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
}

interface PlayerStats {
  // Identity (derived from git, not stored by us in v1)
  playerId: string;                     // hash of git user.email for privacy

  // Aggregate Stats
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalInterrupted: number;
  winRate: number;                      // 0.0 to 1.0, computed

  // Streaks
  dailyStreak: DailyStreak;

  // Distribution
  guessDistribution: GuessDistribution;

  // Timing
  averageSolveTime: number;             // ms, for wins only
  fastestSolve: number;                 // ms

  // Practice Mode Tracking
  practiceWordsUsed: string[];          // words already seen in practice
  practiceGamesPlayed: number;
  practiceWins: number;

  // History (last 100 games for adaptive difficulty)
  history: GameHistoryEntry[];

  // Metadata
  firstPlayedAt: string;               // ISO 8601
  lastPlayedAt: string;                // ISO 8601
  statsVersion: number;                // schema version
}

interface GameHistoryEntry {
  gameId: string;
  mode: GameMode;
  date: string;
  targetWord: string;
  guessCount: number;
  result: GameResult;
  duration: number;                     // ms (excluding pauses)
  proximity: ProximityLevel[];          // semantic hint progression
}
```

### 6.5 Configuration

```typescript
// ──────────────────────────────────────────────
// USER CONFIG (config.json)
// ──────────────────────────────────────────────

interface CodeWordleConfig {
  // Game Behavior
  autoStart: boolean;                   // auto-start game on Claude wait (default: false)
  autoStartDelay: number;               // seconds before auto-start (default: 3)
  defaultMode: GameMode;                // which mode launches by default (default: "daily")

  // Display
  colorScheme: "auto" | "dark" | "light";  // terminal color adaptation (default: "auto")
  animationSpeed: "fast" | "normal" | "slow";  // hint reveal speed (default: "normal")
  compactMode: boolean;                 // reduced height for small terminals (default: false)
  showSemanticHints: boolean;           // disable semantic hints for purists (default: true)
  showLanguageHints: boolean;           // disable language hints (default: true)

  // Keyboard
  keymap: "qwerty" | "dvorak" | "colemak";  // keyboard layout display (default: "qwerty")

  // Interruption
  gracePeriodMs: number;                // override default grace period (default: 30000)
  alwaysFinish: boolean;                // never auto-dismiss game (default: false)

  // Privacy
  shareIncludesName: boolean;           // include git username in share card (default: false)

  // Advanced
  wordBankOverride: string | null;      // path to custom word bank (default: null)

  // Schema
  configVersion: number;
}
```

### 6.6 Share Card

```typescript
// ──────────────────────────────────────────────
// SHARE CARD (generated, not persisted)
// ──────────────────────────────────────────────

interface ShareCard {
  header: string;           // "CodeWordle #47 -- 3/6"
  grid: string[];           // array of 6 rows, each a string of symbols
  streak: string;           // "Streak: 12" or empty
  footer: string;           // timestamp or URL
}

// Grid symbol mapping:
// CORRECT -> filled circle or check
// PRESENT -> half circle or dot
// ABSENT  -> empty dot or dash
// UNUSED  -> middle dot (row not used)
//
// Example grid strings (using Unicode for copy-paste compatibility):
// "●●○···"   (2 correct, 1 present, 3 absent)
// "●●●●●●"   (all correct -- winning row)
// "······"   (unused row)
```

---

## 7. Persistence

### 7.1 Directory Structure

```
~/.codewordle/
  config.json              -- user preferences
  stats.json               -- lifetime statistics
  current_game.json        -- active game state (deleted on completion)
  history/
    2026-03.json           -- monthly game history archives
    2026-02.json
  word_bank/
    targets.json           -- target words with metadata (shipped with package)
    accepted.json          -- accepted guesses (shipped with package)
    custom.json            -- user-added words (optional)
  cache/
    daily_seed_cache.json  -- pre-computed daily words for offline play (30 days)
```

### 7.2 File Lifecycle

| File | Created | Updated | Deleted |
|------|---------|---------|---------|
| `config.json` | First launch or first config change | On settings change | Never (user manages) |
| `stats.json` | First game completed | After every game completion | Never |
| `current_game.json` | Game start | Every guess, every state change | On game completion |
| `history/YYYY-MM.json` | First game of that month | After every game completion | Never (archival) |
| `daily_seed_cache.json` | First launch | Daily, adds next 30 days | Old entries pruned monthly |

### 7.3 Write Strategy

All file writes use **atomic write** (write to temp file, then rename) to prevent corruption:

```typescript
async function atomicWrite(filePath: string, data: object): Promise<void> {
  const tmpPath = filePath + '.tmp.' + process.pid;
  try {
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
  } catch (err) {
    // Clean up temp file on failure
    await fs.unlink(tmpPath).catch(() => {});
    throw err;
  }
}
```

Write frequency:
- `current_game.json`: written after every guess submission (max 6 writes per game)
- `stats.json`: written once per game completion
- `config.json`: written only on explicit config change
- History files: appended once per game completion

### 7.4 Daily Challenge Replay Prevention

```typescript
function canPlayDaily(stats: PlayerStats, today: string): boolean {
  const todayHistory = stats.history.find(
    h => h.date === today && h.mode === GameMode.DAILY
  );

  // Already completed today's daily
  if (todayHistory && todayHistory.result !== GameResult.IN_PROGRESS) {
    return false;
  }

  return true;
}
```

The daily challenge is locked after completion (win or loss). The player can:
- View their result for today
- Play practice mode
- Wait for tomorrow's puzzle

The daily number is computed as days since epoch date:
```typescript
const EPOCH = new Date('2026-03-01');  // Day 1 of CodeWordle
const dailyNumber = Math.floor((today - EPOCH) / 86400000) + 1;
```

### 7.5 Migration Strategy

Every persisted file includes a version number. On load, check version and migrate:

```typescript
interface Migrator<T> {
  version: number;
  migrate: (data: any) => T;
}

const STATS_MIGRATIONS: Migrator<PlayerStats>[] = [
  {
    version: 2,
    migrate: (v1Data) => ({
      ...v1Data,
      practiceGamesPlayed: 0,
      practiceWins: 0,
      statsVersion: 2,
    }),
  },
  // Future migrations added here
];

function loadWithMigration<T>(
  filePath: string,
  currentVersion: number,
  migrations: Migrator<T>[]
): T {
  const raw = readJSON(filePath);
  let data = raw;

  for (const migration of migrations) {
    if (raw.statsVersion < migration.version) {
      data = migration.migrate(data);
    }
  }

  return data as T;
}
```

Rules:
- Migrations are forward-only (never downgrade)
- Old fields are preserved (never delete, only add)
- If a file fails to parse, back it up as `{filename}.backup.{timestamp}` and create fresh

---

## 8. Configuration

### 8.1 Defaults

```typescript
const DEFAULT_CONFIG: CodeWordleConfig = {
  autoStart: false,
  autoStartDelay: 3,
  defaultMode: GameMode.DAILY,

  colorScheme: "auto",
  animationSpeed: "normal",
  compactMode: false,
  showSemanticHints: true,
  showLanguageHints: true,

  keymap: "qwerty",

  gracePeriodMs: 30_000,
  alwaysFinish: false,

  shareIncludesName: false,

  wordBankOverride: null,

  configVersion: 1,
};
```

### 8.2 Config File Location

Primary: `~/.codewordle/config.json`

The config is created on first settings change, not on first launch. Until then, all defaults apply. This means a fresh install has zero files until the first game is played.

### 8.3 CLI Flags

CodeWordle is invoked through Claude Code's extension system, but also supports direct CLI flags for testing and configuration:

```
Usage: codewordle [options]

Game Options:
  --daily              Play today's daily puzzle (default)
  --practice           Play a practice round
  --stats              Show lifetime statistics
  --reset-stats        Reset all statistics (with confirmation)

Display Options:
  --compact            Use compact board layout (12 rows instead of 16)
  --no-color           Disable color output
  --no-animation       Skip hint reveal animations
  --no-semantic        Disable semantic proximity hints
  --no-language-hint   Disable language hints

Configuration:
  --config <key=val>   Set a config value (e.g., --config autoStart=true)
  --config-path        Print config file location
  --reset-config       Reset config to defaults

Debug:
  --word <word>        Force a specific target word (debug only, not in production build)
  --seed <number>      Override daily seed (debug only)
  --version            Print version
```

### 8.4 Animation Speed Values

| Setting | Per-cell reveal delay | Total row reveal | Semantic hint delay |
|---------|----------------------|------------------|---------------------|
| `fast` | 60ms | ~360ms | 200ms after row |
| `normal` | 120ms | ~720ms | 400ms after row |
| `slow` | 200ms | ~1200ms | 600ms after row |

### 8.5 Color Scheme

**Auto-detection**: Check `COLORFGBG` env variable or terminal background query. Fall back to dark theme.

**Dark theme** (default):
| Element | ANSI Code | Appearance |
|---------|-----------|------------|
| Correct cell | `\x1b[30;42m` | Black text on green bg |
| Present cell | `\x1b[30;43m` | Black text on yellow bg |
| Absent cell | `\x1b[37;100m` | White text on dark gray bg |
| Empty cell | `\x1b[90m` | Dim gray border |
| Error text | `\x1b[91m` | Bright red |
| Proximity ICE_COLD | `\x1b[94m` | Bright blue |
| Proximity COLD | `\x1b[96m` | Bright cyan |
| Proximity COOL | `\x1b[97m` | Bright white |
| Proximity WARM | `\x1b[93m` | Bright yellow |
| Proximity HOT | `\x1b[91m` | Bright red |
| Proximity SAME_FAMILY | `\x1b[1;91m` | Bold bright red |

**Light theme** (inverted for light terminals):
Same structure, adjusted for readability on light backgrounds. Absent uses medium gray instead of dark gray. Text colors inverted where needed.

---

## 9. Performance Considerations

### 9.1 Core Principle

**CodeWordle must be invisible to Claude Code's performance.** It runs during idle wait time and must never compete for resources that Claude Code needs.

### 9.2 Input Latency

| Operation | Target Latency | Measurement |
|-----------|---------------|-------------|
| Keypress to display | < 16ms | Time from stdin read to terminal write |
| Guess validation | < 5ms | Dictionary lookup (in-memory hash set) |
| Hint computation | < 1ms | Pure string comparison |
| Semantic hint computation | < 2ms | Category lookup + score calculation |
| Full board render | < 10ms | Differential rendering, not full repaint |

These targets are trivially achievable. The game is string comparisons and terminal writes -- no computation-heavy operations.

### 9.3 Rendering Strategy

**Differential rendering**: Only redraw cells/rows that changed, not the entire board.

```typescript
interface RenderState {
  board: string[][];           // 6x6 grid of displayed characters
  hints: HintState[][];        // 6x6 grid of hint states (for coloring)
  currentRow: number;
  currentCol: number;
  message: string;             // status message below board
  keyboard: Record<string, HintState>;
}

function render(prev: RenderState | null, next: RenderState): string {
  const commands: string[] = [];

  if (prev === null) {
    // Full render on first draw
    commands.push(renderFullBoard(next));
  } else {
    // Only render changed cells
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        if (prev.board[row][col] !== next.board[row][col] ||
            prev.hints[row][col] !== next.hints[row][col]) {
          commands.push(moveCursor(row, col));
          commands.push(renderCell(next.board[row][col], next.hints[row][col]));
        }
      }
    }

    // Re-render message line if changed
    if (prev.message !== next.message) {
      commands.push(renderMessage(next.message));
    }

    // Re-render keyboard if any key state changed
    if (keyboardChanged(prev.keyboard, next.keyboard)) {
      commands.push(renderKeyboard(next.keyboard));
    }
  }

  // Single write to stdout (batch all ANSI commands)
  return commands.join('');
}
```

Key rendering rules:
- **Batch writes**: Accumulate all ANSI escape sequences and write to stdout in a single `process.stdout.write()` call. Never write character-by-character.
- **Cursor management**: Hide cursor during renders (`\x1b[?25l`), show at input position (`\x1b[?25h`).
- **No clearing**: Never use clear-screen (`\x1b[2J`). Only overwrite specific positions using cursor movement (`\x1b[{row};{col}H`).
- **Alternate screen buffer**: Use `\x1b[?1049h` to enter alternate screen on game start, `\x1b[?1049l` to restore on exit. This means Claude Code's output is perfectly preserved underneath.

### 9.4 Memory Footprint

| Component | Estimated Size | Notes |
|-----------|---------------|-------|
| Word bank (targets) | ~50 KB | ~300 words with metadata, loaded once |
| Word bank (accepted) | ~10 KB | ~800 plain strings |
| Accepted words hash set | ~30 KB | For O(1) lookup during validation |
| Active game state | < 1 KB | 6 guesses max, small object |
| Render state (2 copies) | < 2 KB | prev + next for diffing |
| Input buffer | < 100 bytes | 6 chars max |
| **Total runtime memory** | **< 100 KB** | Negligible |

The word bank is loaded into memory once at game start. The accepted words list is loaded into a `Set<string>` for O(1) validation lookups. Everything else is trivially small.

### 9.5 Startup Time

Target: Game board appears within **200ms** of pressing SPACE.

Breakdown:
- Load config from disk: ~10ms
- Load word bank from disk: ~20ms (JSON parse of ~60KB)
- Build accepted words set: ~5ms
- Compute daily word (if daily mode): ~1ms
- Initial render: ~10ms
- Total: ~46ms (well within 200ms budget)

The word bank files are shipped as part of the package (not downloaded). No network I/O at any point.

### 9.6 Process Architecture

CodeWordle runs **in the same process** as Claude Code's extension host. It does NOT spawn a child process. This means:
- Zero process overhead
- Shared event loop (but game logic is non-blocking)
- stdin is shared -- Claude Code's extension system routes keypresses to the game when active
- Game yields immediately on Claude completion signal

No background threads. No workers. No timers except the grace period countdown (a single `setInterval`). The game is event-driven: it does nothing between keypresses.

### 9.7 Terminal Size Handling

Minimum supported: **40 columns x 16 rows** (as specified in brainstorm doc).

```typescript
function checkTerminalSize(): { fits: boolean; compact: boolean } {
  const cols = process.stdout.columns || 80;
  const rows = process.stdout.rows || 24;

  if (cols < 30 || rows < 12) {
    return { fits: false, compact: false };   // too small, show error
  }
  if (cols < 40 || rows < 16) {
    return { fits: true, compact: true };     // tight, use compact mode
  }
  return { fits: true, compact: false };       // normal mode
}
```

Compact mode differences:
- No box-drawing borders (saves 6 rows)
- Keyboard display on 1 line instead of 2
- Semantic hint shares line with guess counter
- Board is 8 rows total instead of 14

Listen for `SIGWINCH` (terminal resize) and reflow if needed.

---

## Appendix A: Share Card Format Specification

### Standard Share Card (copied to clipboard)

```
CodeWordle #47 -- 3/6
------
-o--o-
oooooo
Streak: 12

play.codewordle.dev
```

Symbol key:
- `o` = CORRECT (right letter, right position)
- `*` = PRESENT (right letter, wrong position)
- `-` = ABSENT (letter not in word)

Alternative Unicode format (if terminal supports it):
- `#` or filled block for CORRECT
- `~` for PRESENT
- `.` for ABSENT

The share card intentionally does NOT include the guessed words (spoiler-free).

### Terminal Display Share Card (richer, shown in-game)

```
╭──────────────────────────────╮
│  CodeWordle #47    3/6       │
│  - - - - - -                 │
│  - * - - * -                 │
│  # # # # # #                │
│                              │
│  Streak: 12     Time: 1m42s  │
│  play.codewordle.dev         │
╰──────────────────────────────╯
```

---

## Appendix B: Daily Puzzle Number Calculation

```typescript
const CODEWORDLE_EPOCH = new Date('2026-03-01T00:00:00Z');

function getDailyPuzzleNumber(date: Date = new Date()): number {
  const utcDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));
  const diff = utcDate.getTime() - CODEWORDLE_EPOCH.getTime();
  return Math.floor(diff / 86_400_000) + 1;
}

// 2026-03-01 -> #1
// 2026-03-21 -> #21
// 2027-03-01 -> #366
```

All daily puzzles use UTC midnight as the day boundary. This means the puzzle changes at the same absolute moment worldwide, which may be mid-day for some timezones. This matches Wordle's approach and prevents timezone-based spoilers.

---

## Appendix C: Full Word Categorization Example

```typescript
const EXAMPLE_WORDS: WordEntry[] = [
  {
    word: "reduce",
    category: PrimaryCategory.OPERATION,
    subcategory: "array_methods",
    domain: Domain.DATA_MANIPULATION,
    languages: ["JavaScript", "TypeScript", "Python", "Ruby", "Universal"],
    difficulty: 2,
  },
  {
    word: "struct",
    category: PrimaryCategory.DATA_TYPE,
    subcategory: "type_system",
    domain: Domain.LANGUAGE_CONSTRUCT,
    languages: ["C", "C++", "Rust", "Go", "Swift"],
    difficulty: 3,
  },
  {
    word: "deploy",
    category: PrimaryCategory.CONCEPT,
    subcategory: "devops",
    domain: Domain.INFRASTRUCTURE,
    languages: ["Universal"],
    difficulty: 1,
  },
  {
    word: "lambda",
    category: PrimaryCategory.CONCEPT,
    subcategory: "functions",
    domain: Domain.LANGUAGE_CONSTRUCT,
    languages: ["Python", "Java", "Haskell", "Universal"],
    difficulty: 2,
  },
  {
    word: "unsafe",
    category: PrimaryCategory.KEYWORD,
    subcategory: "memory_safety",
    domain: Domain.LANGUAGE_CONSTRUCT,
    languages: ["Rust", "C#", "Go"],
    difficulty: 4,
  },
  {
    word: "typeof",
    category: PrimaryCategory.KEYWORD,
    subcategory: "type_system",
    domain: Domain.LANGUAGE_CONSTRUCT,
    languages: ["JavaScript", "TypeScript"],
    difficulty: 2,
  },
  {
    word: "docker",
    category: PrimaryCategory.TOOL,
    subcategory: "containers",
    domain: Domain.INFRASTRUCTURE,
    languages: ["Universal"],
    difficulty: 1,
  },
  {
    word: "kernel",
    category: PrimaryCategory.CONCEPT,
    subcategory: "operating_systems",
    domain: Domain.INFRASTRUCTURE,
    languages: ["C", "Rust", "Universal"],
    difficulty: 3,
  },
  {
    word: "splice",
    category: PrimaryCategory.OPERATION,
    subcategory: "array_methods",
    domain: Domain.DATA_MANIPULATION,
    languages: ["JavaScript", "TypeScript"],
    difficulty: 3,
  },
  {
    word: "printf",
    category: PrimaryCategory.BUILTIN,
    subcategory: "io",
    domain: Domain.DATA_MANIPULATION,
    languages: ["C", "C++", "Go"],
    difficulty: 2,
  },
];
```

---

## Appendix D: Semantic Proximity Worked Examples

### Example 1: guess = "filter", answer = "reduce"

```
filter meta:  category=OPERATION, subcategory=array_methods, domain=DATA_MANIPULATION
reduce meta:  category=OPERATION, subcategory=array_methods, domain=DATA_MANIPULATION

Score:
  Same category (OPERATION):     +5
  Same subcategory (array_methods): +2
  Language overlap (JS, TS, Python, Ruby, Universal -- high): +2
  Letter overlap (r,e,d,u,c vs f,i,l,t,e,r -> common: {e,r} = 2 < 4): +0

  Total: 9 -> SAME_FAMILY
  Display: "SAME FAMILY -- almost there!"
```

### Example 2: guess = "docker", answer = "reduce"

```
docker meta:  category=TOOL, subcategory=containers, domain=INFRASTRUCTURE
reduce meta:  category=OPERATION, subcategory=array_methods, domain=DATA_MANIPULATION

Score:
  Different category: +0
  Different domain: +0
  Different subcategory: +0
  Language overlap (Universal vs JS,TS,Python,Ruby,Universal -> Universal shared): +1
  Letter overlap (d,o,c,k,e,r vs r,e,d,u,c -> common: {d,c,e,r} = 4): +1

  Total: 2 -> COLD
  Display: "COLD -- not much in common"
```

### Example 3: guess = "public", answer = "sealed"

```
public meta:  category=KEYWORD, subcategory=access_modifiers, domain=LANGUAGE_CONSTRUCT
sealed meta:  category=KEYWORD, subcategory=access_modifiers, domain=LANGUAGE_CONSTRUCT

Score:
  Same category (KEYWORD):         +5
  Same subcategory (access_modifiers): +2
  Language overlap (Java,C# shared): +1
  Letter overlap (p,u,b,l,i,c vs s,e,a,l,d -> common: {l} = 1 < 4): +0

  Total: 8 -> HOT
  Display: "HOT -- very close!"
```

### Example 4: guess = "python", answer = "struct"

```
python meta:  category=TOOL, subcategory=language, domain=INFRASTRUCTURE
struct meta:  category=DATA_TYPE, subcategory=type_system, domain=LANGUAGE_CONSTRUCT

Score:
  Different category: +0
  Different domain: +0
  Different subcategory: +0
  Language overlap (Python vs C,C++,Rust,Go,Swift -> none): +0
  Letter overlap (p,y,t,h,o,n vs s,t,r,u,c -> common: {t} = 1 < 4): +0

  Total: 0 -> ICE_COLD
  Display: "ICE COLD -- completely different domain"
```

---

## Implementation Priority Order

For a 2-3 day build, implement in this order:

| Priority | Component | Time | Rationale |
|----------|-----------|------|-----------|
| P0 | Word bank (targets + accepted) with metadata | 3h | Everything depends on this |
| P0 | Character hint algorithm | 1h | Core mechanic, must be correct |
| P0 | Board rendering (full + differential) | 3h | The main visual output |
| P0 | Input handling + state machine | 3h | Game loop backbone |
| P0 | Daily word selection (seeded RNG) | 1h | Critical for daily mode |
| P1 | Semantic proximity algorithm | 2h | Key differentiator |
| P1 | Stats tracking + persistence | 2h | Retention driver |
| P1 | Share card generation + clipboard | 1h | Viral mechanic |
| P1 | Interruption handling (PAUSE_STATE) | 2h | UX critical for Claude integration |
| P2 | Practice mode + adaptive difficulty | 1h | Replayability |
| P2 | Config system | 1h | Customization |
| P2 | Compact mode | 1h | Small terminal support |
| P3 | Game state resume (crash recovery) | 1h | Edge case handling |
| P3 | Migration system | 30m | Future-proofing |
| P3 | Terminal size detection + reflow | 30m | Polish |

**Total estimated implementation time: ~22 hours (fits in 3 focused days)**
