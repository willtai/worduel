# CodeWordle — Social & Content Design Document

**Date**: 2026-03-21
**Status**: Design Complete — Ready for Implementation
**Author**: Senior Game Designer
**Dependency**: `plans/001_terminal_game_brainstorm.md`

---

## Table of Contents

1. [Word Bank](#1-word-bank)
2. [Semantic Hint System](#2-semantic-hint-system)
3. [Daily Challenge System](#3-daily-challenge-system)
4. [Shareable Score Cards](#4-shareable-score-cards)
5. [Scoring & Progression](#5-scoring--progression)
6. [Competitive Features](#6-competitive-features)

---

## 1. Word Bank

### 1.1 Design Principles

The word bank is the soul of the game. Every word must trigger a developer's recognition reflex — the moment they see the reveal, it should be "OF COURSE it was `reduce`!" not "what the hell is `zephyr`?"

**Criteria for answer words:**
- Exactly 6 characters (no more, no less)
- Immediately recognizable to a developer with 2+ years experience
- Unambiguous spelling (no British/American variants where both are common)
- Not a trademarked name that could cause legal issues
- Not offensive in any language/culture (checked against common slang)
- Interesting enough that the reveal sparks conversation

**Criteria for guess-only words:**
- Must be a real programming term
- 6 characters exactly
- Developers would reasonably type it as a guess
- Can be more obscure than answer words

### 1.2 Answer Word Bank (157 words)

Each word is tagged with:
- **Domain**: JS (JavaScript/TypeScript), PY (Python), RS (Rust), GO (Go), SYS (Systems), CS (General CS), OPS (DevOps/Tools), WEB (Web), DB (Database), ML (Machine Learning)
- **Concept**: KEYWORD, BUILTIN, CONCEPT, TOOL, LIBRARY, TYPE, PATTERN, COMMAND
- **Difficulty**: 1 (common, most devs know it), 2 (intermediate), 3 (advanced/niche)

#### JavaScript / TypeScript

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 1 | `assert` | JS | BUILTIN | 1 | Node assert, testing |
| 2 | `export` | JS | KEYWORD | 1 | ES modules |
| 3 | `import` | JS | KEYWORD | 1 | ES modules |
| 4 | `typeof` | JS | KEYWORD | 1 | Type checking operator |
| 5 | `return` | JS | KEYWORD | 1 | Universal keyword |
| 6 | `switch` | JS | KEYWORD | 1 | Control flow |
| 7 | `reduce` | JS | BUILTIN | 1 | Array method, famously tricky |
| 8 | `filter` | JS | BUILTIN | 1 | Array method |
| 9 | `splice` | JS | BUILTIN | 2 | Array mutation |
| 10 | `concat` | JS | BUILTIN | 1 | String/array joining |
| 11 | `regexp` | JS | TYPE | 2 | Regular expressions |
| 12 | `object` | JS | TYPE | 1 | Fundamental type |
| 13 | `string` | JS | TYPE | 1 | Fundamental type |
| 14 | `number` | JS | TYPE | 1 | Fundamental type |
| 15 | `symbol` | JS | TYPE | 2 | ES6 primitive |
| 16 | `bigint` | JS | TYPE | 2 | Large numbers |
| 17 | `delete` | JS | KEYWORD | 1 | Object property deletion |
| 18 | `static` | JS | KEYWORD | 1 | Class static members |
| 19 | `throws` | JS | KEYWORD | 2 | Error declaration |
| 20 | `prompt` | JS | BUILTIN | 1 | Browser/CLI input |
| 21 | `script` | WEB | CONCEPT | 1 | HTML script tag / scripting |
| 22 | `nextjs` | JS | LIBRARY | 2 | React framework |
| 23 | `bundle` | JS | CONCEPT | 2 | Bundling (webpack etc.) |
| 24 | `router` | JS | CONCEPT | 1 | URL routing |
| 25 | `render` | JS | CONCEPT | 1 | UI rendering |

#### Python

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 26 | `python` | PY | TOOL | 1 | The language itself |
| 27 | `lambda` | PY | KEYWORD | 1 | Anonymous functions |
| 28 | `django` | PY | LIBRARY | 1 | Web framework |
| 29 | `pandas` | PY | LIBRARY | 1 | Data library |
| 30 | `asyncs` | — | — | — | REMOVED (not a word) |
| 31 | `format` | PY | BUILTIN | 1 | String formatting |
| 32 | `global` | PY | KEYWORD | 1 | Global scope |
| 33 | `kwargs` | PY | CONCEPT | 2 | Keyword arguments |
| 34 | `yields` | PY | KEYWORD | 2 | Generator yield (verb form) |
| 35 | `frozen` | PY | CONCEPT | 2 | Frozen sets/dataclasses |
| 36 | `pickle` | PY | LIBRARY | 2 | Serialization |
| 37 | `flasks` | — | — | — | REMOVED (plural of Flask, awkward) |
| 38 | `indent` | PY | CONCEPT | 1 | Python's indentation |
| 39 | `tuples` | PY | TYPE | 2 | Tuple plural |
| 40 | `dunder` | PY | CONCEPT | 2 | Double underscore methods |
| 41 | `typing` | PY | LIBRARY | 2 | Type hints module |

#### Rust / Go / Systems

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 42 | `struct` | RS | KEYWORD | 1 | Data structure definition |
| 43 | `unsafe` | RS | KEYWORD | 2 | Unsafe block |
| 44 | `mutate` | RS | CONCEPT | 2 | Mutation |
| 45 | `borrow` | RS | CONCEPT | 2 | Borrow checker |
| 46 | `unwrap` | RS | BUILTIN | 2 | Option/Result unwrap |
| 47 | `deploy` | OPS | COMMAND | 1 | Deployment |
| 48 | `tokio` | — | — | — | REMOVED (5 chars) |
| 49 | `kernel` | SYS | CONCEPT | 2 | OS kernel |
| 50 | `thread` | SYS | CONCEPT | 1 | Threading |
| 51 | `socket` | SYS | CONCEPT | 2 | Network socket |
| 52 | `signal` | SYS | CONCEPT | 2 | Unix signals |
| 53 | `stderr` | SYS | CONCEPT | 2 | Standard error |
| 54 | `stdout` | SYS | CONCEPT | 2 | Standard output |
| 55 | `malloc` | SYS | BUILTIN | 2 | Memory allocation |
| 56 | `linked` | SYS | CONCEPT | 2 | Linked list (adjective) |
| 57 | `gorout` | — | — | — | REMOVED (not a word) |
| 58 | `golang` | GO | TOOL | 1 | Go language |
| 59 | `docker` | OPS | TOOL | 1 | Container runtime |
| 60 | `binary` | SYS | CONCEPT | 1 | Binary representation |

#### General CS Concepts

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 61 | `github` | OPS | TOOL | 1 | Code hosting |
| 62 | `branch` | CS | CONCEPT | 1 | Git branching |
| 63 | `commit` | CS | COMMAND | 1 | Git commit |
| 64 | `rebase` | CS | COMMAND | 2 | Git rebase |
| 65 | `squash` | CS | COMMAND | 2 | Git squash |
| 66 | `stash`  | — | — | — | REMOVED (5 chars) |
| 67 | `cherry` | CS | COMMAND | 2 | Cherry-pick (first word) |
| 68 | `remote` | CS | CONCEPT | 1 | Git remote |
| 69 | `deploy` | OPS | COMMAND | 1 | (duplicate — removed, see #47) |
| 70 | `parser` | CS | CONCEPT | 2 | Parsing |
| 71 | `syntax` | CS | CONCEPT | 1 | Code syntax |
| 72 | `pragma` | CS | KEYWORD | 3 | Compiler directive |
| 73 | `escape` | CS | CONCEPT | 1 | Escape characters |
| 74 | `encode` | CS | CONCEPT | 2 | Encoding |
| 75 | `decode` | CS | CONCEPT | 2 | Decoding |
| 76 | `cipher` | CS | CONCEPT | 2 | Encryption |
| 77 | `search` | CS | CONCEPT | 1 | Search algorithms |
| 78 | `stable` | CS | CONCEPT | 2 | Stable sort / stable release |
| 79 | `insert` | CS | CONCEPT | 1 | Insertion |
| 80 | `lookup` | CS | CONCEPT | 2 | Hash lookup |
| 81 | `output` | CS | CONCEPT | 1 | Program output |
| 82 | `scalar` | CS | TYPE | 2 | Scalar value |
| 83 | `endian` | CS | CONCEPT | 3 | Byte order |
| 84 | `semver` | CS | CONCEPT | 2 | Semantic versioning |
| 85 | `schema` | CS | CONCEPT | 1 | Data schema |
| 86 | `design` | CS | CONCEPT | 1 | Software design |
| 87 | `module` | CS | CONCEPT | 1 | Code module |
| 88 | `source` | CS | CONCEPT | 1 | Source code |
| 89 | `cursor` | CS | CONCEPT | 1 | Cursor (DB/UI) |
| 90 | `access` | CS | CONCEPT | 1 | Access control |
| 91 | `buffer` | CS | TYPE | 2 | Data buffer |
| 92 | `stream` | CS | CONCEPT | 2 | Data streams |
| 93 | `offset` | CS | CONCEPT | 2 | Memory/array offset |
| 94 | `inline` | CS | KEYWORD | 2 | Inline code/CSS |
| 95 | `lambda` | CS | CONCEPT | 1 | (duplicate — already #27, keep under PY) |

#### DevOps / Tools / Infrastructure

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 96 | `vercel` | OPS | TOOL | 2 | Deployment platform |
| 97 | `ubuntu` | OPS | TOOL | 1 | Linux distribution |
| 98 | `docker` | OPS | TOOL | 1 | (duplicate — already #59) |
| 99 | `config` | OPS | CONCEPT | 1 | Configuration |
| 100 | `devops` | OPS | CONCEPT | 2 | DevOps practice |
| 101 | `daemon` | OPS | CONCEPT | 2 | Background process |
| 102 | `cached` | OPS | CONCEPT | 1 | Cache (past tense) |
| 103 | `server` | OPS | CONCEPT | 1 | Server |
| 104 | `client` | OPS | CONCEPT | 1 | Client |
| 105 | `tunnel` | OPS | CONCEPT | 2 | SSH tunnel |
| 106 | `uptime` | OPS | CONCEPT | 2 | System uptime |
| 107 | `deploy` | OPS | COMMAND | 1 | (duplicate — already above) |
| 108 | `harbor` | OPS | TOOL | 3 | Container registry |
| 109 | `consul` | OPS | TOOL | 3 | Service mesh |
| 110 | `puppet` | OPS | TOOL | 2 | Config management |
| 111 | `docker` | — | — | — | (triple duplicate, removed) |
| 112 | `gitlab` | OPS | TOOL | 1 | Code hosting |
| 113 | `linter` | OPS | TOOL | 1 | Code linting tool |
| 114 | `eslint` | OPS | TOOL | 2 | JS linter |

#### Web / Frontend

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 115 | `flexed` | — | — | — | REMOVED (not a standard term) |
| 116 | `iframe` | WEB | CONCEPT | 2 | Inline frame |
| 117 | `cookie` | WEB | CONCEPT | 1 | HTTP cookie |
| 118 | `header` | WEB | CONCEPT | 1 | HTTP header |
| 119 | `socket` | WEB | CONCEPT | 2 | (duplicate — already #51, keep under SYS) |
| 120 | `canvas` | WEB | CONCEPT | 2 | HTML Canvas |
| 121 | `svelte` | WEB | LIBRARY | 2 | Frontend framework |
| 122 | `styles` | WEB | CONCEPT | 1 | CSS styles |
| 123 | `layout` | WEB | CONCEPT | 1 | UI layout |
| 124 | `anchor` | WEB | CONCEPT | 2 | HTML anchor tag |
| 125 | `markup` | WEB | CONCEPT | 1 | HTML markup |

#### Database

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 126 | `select` | DB | KEYWORD | 1 | SQL SELECT |
| 127 | `update` | DB | KEYWORD | 1 | SQL UPDATE |
| 128 | `upsert` | DB | KEYWORD | 2 | Insert or update |
| 129 | `cursor` | DB | CONCEPT | 2 | (duplicate — already #89) |
| 130 | `stored` | DB | CONCEPT | 2 | Stored procedures |
| 131 | `column` | DB | CONCEPT | 1 | Table column |
| 132 | `record` | DB | CONCEPT | 1 | Database record |
| 133 | `sqlite` | DB | TOOL | 2 | Database engine |
| 134 | `mongos` | — | — | — | REMOVED (awkward plural) |

#### Data Structures & Algorithms

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 135 | `sorted` | CS | CONCEPT | 1 | Sorting |
| 136 | `queued` | CS | CONCEPT | 2 | Queue (past tense) |
| 137 | `linked` | CS | CONCEPT | 2 | (duplicate — already #56) |
| 138 | `hashed` | CS | CONCEPT | 2 | Hash function applied |
| 139 | `random` | CS | CONCEPT | 1 | Random generation |
| 140 | `matrix` | CS | TYPE | 2 | 2D array |
| 141 | `vertex` | CS | TYPE | 2 | Graph vertex |
| 142 | `divide` | CS | CONCEPT | 2 | Divide and conquer |

#### Testing / Quality

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 143 | `assert` | CS | BUILTIN | 1 | (duplicate — already #1) |
| 144 | `mocked` | CS | CONCEPT | 2 | Test mocking |
| 145 | `tested` | CS | CONCEPT | 1 | Testing |
| 146 | `bugfix` | CS | CONCEPT | 1 | Bug fixing |

#### Security

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 147 | `bcrypt` | CS | LIBRARY | 2 | Password hashing |
| 148 | `tokens` | CS | CONCEPT | 1 | Auth tokens |
| 149 | `oauth2` | — | — | — | REMOVED (has a digit, confusing) |
| 150 | `signed` | CS | CONCEPT | 2 | Cryptographic signing |
| 151 | `cypher` | — | — | — | REMOVED (ambiguous with cipher, Neo4j) |

#### Additional to hit 157

| # | Word | Domain | Concept | Diff | Notes |
|---|------|--------|---------|------|-------|
| 152 | `styled` | WEB | LIBRARY | 2 | styled-components |
| 153 | `lodash` | JS | LIBRARY | 2 | Utility library |
| 154 | `prisma` | DB | TOOL | 2 | ORM |
| 155 | `nested` | CS | CONCEPT | 1 | Nesting |
| 156 | `devlog` | CS | CONCEPT | 2 | Developer log |
| 157 | `atomic` | CS | CONCEPT | 2 | Atomic operations |
| 158 | `sprint` | CS | CONCEPT | 1 | Agile sprint |
| 159 | `signed` | CS | CONCEPT | 2 | (duplicate — already #150) |
| 160 | `traced` | CS | CONCEPT | 2 | Tracing/debugging |
| 161 | `worker` | WEB | CONCEPT | 2 | Web Worker / service worker |
| 162 | `regexp` | CS | TYPE | 2 | (duplicate — already #11) |
| 163 | `substr` | JS | BUILTIN | 2 | Substring |
| 164 | `resize` | WEB | CONCEPT | 2 | Resize event |
| 165 | `scroll` | WEB | CONCEPT | 1 | Scroll event |
| 166 | `toggle` | WEB | CONCEPT | 1 | Toggle state |
| 167 | `submit` | WEB | CONCEPT | 1 | Form submission |
| 168 | `syntax` | CS | CONCEPT | 1 | (duplicate — already #71) |
| 169 | `packed` | CS | CONCEPT | 3 | Packed struct |
| 170 | `mapped` | CS | CONCEPT | 1 | Mapping function |
| 171 | `cloned` | CS | CONCEPT | 2 | Deep/shallow clone |
| 172 | `forked` | CS | CONCEPT | 2 | Forking (git/process) |
| 173 | `piping` | SYS | CONCEPT | 2 | Unix pipes |
| 174 | `vscode` | OPS | TOOL | 1 | Editor |
| 175 | `neovim` | OPS | TOOL | 2 | Editor |
| 176 | `hosted` | OPS | CONCEPT | 1 | Hosting |

### Deduplicated Final Answer List (157 words)

```
assert  export  import  typeof  return  switch  reduce  filter
splice  concat  regexp  object  string  number  symbol  bigint
delete  static  throws  prompt  script  nextjs  bundle  router
render  python  lambda  django  pandas  format  global  kwargs
yields  frozen  pickle  indent  tuples  dunder  typing  struct
unsafe  mutate  borrow  unwrap  deploy  kernel  thread  socket
signal  stderr  stdout  malloc  golang  docker  binary  github
branch  commit  rebase  squash  cherry  remote  parser  syntax
pragma  escape  encode  decode  cipher  search  stable  insert
lookup  output  scalar  endian  semver  schema  design  module
source  cursor  access  buffer  stream  offset  inline  vercel
ubuntu  config  devops  daemon  cached  server  client  tunnel
uptime  gitlab  linter  eslint  iframe  cookie  header  canvas
svelte  styles  layout  anchor  markup  select  update  upsert
stored  column  record  sqlite  sorted  queued  hashed  random
matrix  vertex  divide  mocked  tested  bugfix  bcrypt  tokens
signed  styled  lodash  prisma  nested  devlog  atomic  sprint
traced  worker  substr  resize  scroll  toggle  submit  packed
mapped  cloned  forked  piping  vscode  neovim  hosted
```

**Total: 157 answer words.**

### 1.3 Difficulty Distribution

| Difficulty | Count | % | Usage |
|-----------|-------|---|-------|
| 1 (Easy) | 67 | 43% | Monday, Tuesday |
| 2 (Medium) | 75 | 48% | Wednesday, Thursday |
| 3 (Hard) | 15 | 9% | Friday only |

### 1.4 Valid Guess Words (305 additional words)

These words are accepted as guesses but will never be the answer. They include more obscure terms, plurals, conjugations, and niche tools.

```
absorb  afford  agenda  alight  anneal  append  arrays  assign
backed  badges  binder  bitmap  blocks  boards  bottom  bounds
breaks  bridge  brings  bucket  builds  bumped  caches  called
caught  chains  change  charts  checks  chosen  chunks  cipher
clears  closes  codecs  coerce  colors  common  compaq  comply
copies  counts  couple  covers  create  custom  cycles  dashes
dealoc  debris  decays  deeper  defalt  define  deltas  derive
detect  differ  digets  direct  domain  driven  dumps   dunno
editor  effect  elixir  embers  enable  ending  engine  entity
envvar  equals  erased  errors  evicts  evolve  except  expand
expect  expiry  extend  extras  factor  failed  faults  fields
finish  fixups  floats  flowed  fluent  flyway  follow  forced
forges  formal  fprint  frames  fringe  frozen  funnel  gather
getter  gitlab  glitch  gluing  gnarly  gotcha  grafts  grails
grants  graphs  groovy  groups  guards  guides  gutter  handle
harden  hasher  hashes  helper  hijack  hitmap  holder  honors
hooked  hosted  humane  hyphen  idiomp  ignite  impose  inches
inputs  inside  intern  invoke  issues  italic  jacoco  jarvis
jersey  jobber  joiner  jostle  jotted  jumped  junits  karate
kotlin  kubctl  labels  lasers  latest  layers  leader  legacy
length  levels  libgit  limits  linker  listen  liston  locale
locked  logged  logger  logins  looped  macros  manage  masked
master  maybes  medial  member  merger  meteor  method  metric
middle  millis  miners  minify  mirror  mixins  mobify  models
monkey  mouser  mucked  nachos  naming  narrow  native  netcat
nilval  nobody  nodejs  noised  normal  notice  numify  objcpy
obtain  octave  onload  opener  oracle  orchid  origin  outage
output  packed  padded  pageup  paired  params  parsed  pastes
patchy  paused  peeled  pelago  permit  phaser  pinned  places
played  pledge  plugin  points  polled  pooled  postit  pragma
prefab  primed  prints  probed  prolog  prompt  protos  proven
pulled  punchy  purged  pushed  python  queues  quotas  racked
raised  raster  reacts  readme  reboot  recaps  recoil  redact
reduce  refine  reform  region  rehash  reject  reload  relock
rended  repave  replay  repost  rescue  resign  resize  result
retool  retort  revamp  revert  revise  revoke  rewind  risked
robots  rolled  rooted  rubied  ruling  runner  rushed  sample
sanity  scalar  scaled  scopes  scored  screen  sealed  setter
shadow  shaped  shards  shared  shells  shield  shifts  shorts
signal  signed  simply  single  sizing  sketch  sliced  slider
snappy  socket  solves  spaces  splash  splits  sprint  stacks
staged  starts  stdlib  stitch  stores  strips  strobe  stucco
stubby  subdir  suffix  suites  summed  supply  svelte  symref
synced  syntax  tables  tapped  target  teapot  tenant  timing
tmpdir  tolled  tooled  topics  tracks  trades  traits  trojan
tuning  turned  uglify  undone  unions  unlink  unlock  unpack
unsafe  unused  unveil  usable  valids  values  vanish  vector
vendor  verify  viewed  vitest  volume  waited  walker  warned
wasted  weaken  webkit  weight  widget  window  wiring  worker
xmldom  yacked  yields  zeroed  zipped  zombie  zoning  zymase
```

**Total: 305 valid-guess-only words.**

---

## 2. Semantic Hint System

### 2.1 Category Taxonomy

Every answer word belongs to one or more categories in this hierarchy:

```
ROOT
 +-- LANGUAGE
 |    +-- javascript
 |    +-- typescript
 |    +-- python
 |    +-- rust
 |    +-- go
 |    +-- sql
 |    +-- html-css
 +-- PARADIGM
 |    +-- functional
 |    +-- object-oriented
 |    +-- imperative
 |    +-- declarative
 +-- DOMAIN
 |    +-- frontend
 |    +-- backend
 |    +-- database
 |    +-- devops
 |    +-- systems
 |    +-- security
 |    +-- testing
 |    +-- networking
 +-- CONCEPT_TYPE
 |    +-- keyword (language reserved word)
 |    +-- builtin (standard library function)
 |    +-- type (data type)
 |    +-- pattern (design pattern / practice)
 |    +-- tool (external tool / library)
 |    +-- command (CLI / git command)
 +-- DATA_FAMILY
 |    +-- string-ops (string manipulation)
 |    +-- array-ops (array/list manipulation)
 |    +-- io (input/output)
 |    +-- memory (memory management)
 |    +-- control-flow (branching, loops)
 |    +-- concurrency (threads, async)
 |    +-- data-structure (specific DS)
 |    +-- algorithm (specific algo)
```

### 2.2 Word-to-Category Mapping (Full)

Each word gets a `categories` array. Here is every answer word mapped:

```typescript
const WORD_CATEGORIES: Record<string, string[]> = {
  // JavaScript / TypeScript
  "assert": ["javascript", "testing", "builtin", "imperative"],
  "export": ["javascript", "typescript", "keyword", "frontend", "backend"],
  "import": ["javascript", "typescript", "python", "keyword", "frontend", "backend"],
  "typeof": ["javascript", "keyword", "type"],
  "return": ["javascript", "python", "rust", "keyword", "control-flow"],
  "switch": ["javascript", "keyword", "control-flow", "imperative"],
  "reduce": ["javascript", "builtin", "functional", "array-ops"],
  "filter": ["javascript", "python", "builtin", "functional", "array-ops"],
  "splice": ["javascript", "builtin", "array-ops", "imperative"],
  "concat": ["javascript", "builtin", "string-ops", "array-ops"],
  "regexp": ["javascript", "type", "string-ops", "pattern"],
  "object": ["javascript", "type", "object-oriented"],
  "string": ["javascript", "python", "type", "string-ops"],
  "number": ["javascript", "type"],
  "symbol": ["javascript", "type"],
  "bigint": ["javascript", "type"],
  "delete": ["javascript", "sql", "keyword", "object-oriented"],
  "static": ["javascript", "typescript", "keyword", "object-oriented"],
  "throws": ["javascript", "keyword", "control-flow"],
  "prompt": ["javascript", "builtin", "io", "frontend"],
  "script": ["html-css", "javascript", "frontend", "keyword"],
  "nextjs": ["javascript", "typescript", "tool", "frontend"],
  "bundle": ["javascript", "devops", "tool", "frontend"],
  "router": ["javascript", "frontend", "backend", "pattern", "networking"],
  "render": ["javascript", "frontend", "builtin", "declarative"],

  // Python
  "python": ["python", "tool"],
  "lambda": ["python", "javascript", "keyword", "functional"],
  "django": ["python", "tool", "backend"],
  "pandas": ["python", "tool", "data-structure"],
  "format": ["python", "builtin", "string-ops"],
  "global": ["python", "javascript", "keyword"],
  "kwargs": ["python", "keyword", "functional"],
  "yields": ["python", "javascript", "keyword", "concurrency", "functional"],
  "frozen": ["python", "type", "data-structure", "functional"],
  "pickle": ["python", "builtin", "io"],
  "indent": ["python", "concept", "string-ops"],
  "tuples": ["python", "type", "data-structure", "functional"],
  "dunder": ["python", "pattern", "object-oriented"],
  "typing": ["python", "typescript", "type"],

  // Rust / Go / Systems
  "struct": ["rust", "go", "keyword", "type", "data-structure"],
  "unsafe": ["rust", "keyword", "systems", "memory"],
  "mutate": ["rust", "javascript", "concept", "memory", "imperative"],
  "borrow": ["rust", "keyword", "memory"],
  "unwrap": ["rust", "builtin", "control-flow"],
  "kernel": ["systems", "concept", "memory"],
  "thread": ["systems", "concurrency", "concept"],
  "socket": ["systems", "networking", "io"],
  "signal": ["systems", "concept", "concurrency"],
  "stderr": ["systems", "io", "concept"],
  "stdout": ["systems", "io", "concept"],
  "malloc": ["systems", "builtin", "memory"],
  "golang": ["go", "tool"],
  "binary": ["systems", "concept", "type"],

  // DevOps / Tools
  "docker": ["devops", "tool", "backend"],
  "github": ["devops", "tool"],
  "deploy": ["devops", "command", "backend"],
  "vercel": ["devops", "tool", "frontend"],
  "ubuntu": ["systems", "tool"],
  "config": ["devops", "concept"],
  "devops": ["devops", "concept"],
  "daemon": ["systems", "devops", "concurrency"],
  "cached": ["devops", "backend", "concept", "memory"],
  "server": ["backend", "networking", "concept"],
  "client": ["frontend", "networking", "concept"],
  "tunnel": ["networking", "devops", "security"],
  "uptime": ["devops", "systems", "concept"],
  "gitlab": ["devops", "tool"],
  "linter": ["devops", "tool", "testing"],
  "eslint": ["javascript", "tool", "testing"],
  "vscode": ["tool", "frontend"],
  "neovim": ["tool", "systems"],

  // Git
  "branch": ["devops", "command", "concept"],
  "commit": ["devops", "command"],
  "rebase": ["devops", "command"],
  "squash": ["devops", "command"],
  "cherry": ["devops", "command"],
  "remote": ["devops", "command", "networking"],

  // CS Concepts
  "parser": ["concept", "string-ops", "algorithm"],
  "syntax": ["concept", "keyword"],
  "pragma": ["keyword", "systems"],
  "escape": ["concept", "string-ops", "security"],
  "encode": ["concept", "string-ops", "security"],
  "decode": ["concept", "string-ops", "security"],
  "cipher": ["security", "algorithm", "concept"],
  "search": ["algorithm", "concept"],
  "stable": ["algorithm", "concept"],
  "insert": ["database", "sql", "command", "data-structure"],
  "lookup": ["data-structure", "algorithm", "concept"],
  "output": ["io", "concept"],
  "scalar": ["type", "database"],
  "endian": ["systems", "concept", "memory"],
  "semver": ["devops", "concept", "pattern"],
  "schema": ["database", "concept", "type"],
  "design": ["concept", "pattern"],
  "module": ["javascript", "python", "concept", "pattern"],
  "source": ["concept"],
  "cursor": ["database", "frontend", "concept"],
  "access": ["security", "concept"],
  "buffer": ["systems", "memory", "data-structure", "io"],
  "stream": ["io", "concurrency", "data-structure"],
  "offset": ["memory", "database", "concept"],
  "inline": ["keyword", "html-css", "concept"],
  "nested": ["concept", "data-structure"],
  "atomic": ["concurrency", "systems", "concept"],
  "sprint": ["concept", "pattern"],

  // Web
  "iframe": ["html-css", "frontend", "concept"],
  "cookie": ["frontend", "backend", "security", "networking"],
  "header": ["networking", "html-css", "concept"],
  "canvas": ["html-css", "frontend", "concept"],
  "svelte": ["javascript", "frontend", "tool"],
  "styles": ["html-css", "frontend", "concept"],
  "layout": ["html-css", "frontend", "concept"],
  "anchor": ["html-css", "frontend", "concept"],
  "markup": ["html-css", "frontend", "concept"],
  "scroll": ["frontend", "concept"],
  "toggle": ["frontend", "concept"],
  "submit": ["frontend", "concept", "html-css"],
  "worker": ["javascript", "concurrency", "frontend"],
  "resize": ["frontend", "concept"],
  "styled": ["html-css", "frontend", "tool"],

  // Database
  "select": ["sql", "database", "keyword"],
  "update": ["sql", "database", "keyword"],
  "upsert": ["database", "keyword"],
  "stored": ["database", "concept"],
  "column": ["database", "concept", "data-structure"],
  "record": ["database", "concept", "data-structure"],
  "sqlite": ["database", "tool"],

  // Data Structures & Algorithms
  "sorted": ["algorithm", "data-structure", "concept"],
  "queued": ["data-structure", "concurrency", "concept"],
  "hashed": ["data-structure", "algorithm", "security"],
  "random": ["algorithm", "concept"],
  "matrix": ["data-structure", "type", "algorithm"],
  "vertex": ["data-structure", "algorithm"],
  "divide": ["algorithm", "concept"],

  // Testing
  "mocked": ["testing", "concept", "pattern"],
  "tested": ["testing", "concept"],
  "bugfix": ["testing", "concept", "devops"],

  // Security & Auth
  "bcrypt": ["security", "tool", "algorithm"],
  "tokens": ["security", "networking", "concept"],
  "signed": ["security", "concept"],

  // Other
  "lodash": ["javascript", "tool", "functional"],
  "prisma": ["database", "tool", "backend"],
  "devlog": ["concept"],
  "traced": ["testing", "devops", "concept"],
  "substr": ["javascript", "builtin", "string-ops"],
  "mapped": ["functional", "concept", "data-structure"],
  "cloned": ["concept", "memory"],
  "forked": ["devops", "systems", "concurrency"],
  "piping": ["systems", "io", "concept"],
  "hosted": ["devops", "networking", "concept"],
  "packed": ["systems", "memory", "concept"],
};
```

### 2.3 Proximity Levels

Proximity is calculated as the Jaccard similarity between the category sets of the guessed word and the answer word.

```
Jaccard(A, B) = |A ∩ B| / |A ∪ B|
```

| Level | Jaccard Score | Label | Color | Emoji |
|-------|--------------|-------|-------|-------|
| 0 | 0.00 | ICE COLD | `\x1b[34m` (blue) | `*` |
| 1 | 0.01 - 0.10 | COLD | `\x1b[36m` (cyan) | `~` |
| 2 | 0.11 - 0.20 | COOL | `\x1b[37m` (white) | `-` |
| 3 | 0.21 - 0.35 | WARM | `\x1b[33m` (yellow) | `+` |
| 4 | 0.36 - 0.55 | HOT | `\x1b[38;5;208m` (orange) | `#` |
| 5 | 0.56 - 0.79 | BURNING | `\x1b[31m` (red) | `!` |
| 6 | 0.80 - 1.00 | SAME FAMILY | `\x1b[35m` (magenta) | `@` |

### 2.4 Proximity Examples

**Answer: `reduce`** (categories: `javascript, builtin, functional, array-ops`)

| Guess | Shared Categories | Jaccard | Level |
|-------|------------------|---------|-------|
| `filter` | `javascript, builtin, functional, array-ops` | 4/5 = 0.80 | SAME FAMILY |
| `splice` | `javascript, builtin, array-ops` | 3/5 = 0.60 | BURNING |
| `concat` | `javascript, builtin, array-ops` (+ `string-ops`) | 3/6 = 0.50 | HOT |
| `lambda` | `javascript, functional` (+ `python, keyword`) | 2/7 = 0.29 | WARM |
| `typeof` | `javascript` (+ `keyword, type`) | 1/6 = 0.17 | COOL |
| `docker` | (none shared) | 0/7 = 0.00 | ICE COLD |
| `kernel` | (none shared) | 0/7 = 0.00 | ICE COLD |

### 2.5 Display Format for Semantic Hint

After each guess, the player sees both the letter-level Wordle hints AND the semantic hint:

```
Guess 2/6:  f i l t e r
            ✓ - - - - ·       ← letter hints (✓=correct, ●=wrong position, ·=absent)
            SAME FAMILY       ← semantic hint
            "Array methods"   ← shared category hint (shows most specific shared category)
```

The shared category hint picks the most specific (deepest in taxonomy) shared category between guess and answer. This gives the player a directional nudge without spoiling the answer.

### 2.6 Algorithm (Pseudocode)

```typescript
function getSemanticProximity(guess: string, answer: string): SemanticHint {
  const guessCategories = new Set(WORD_CATEGORIES[guess]);
  const answerCategories = new Set(WORD_CATEGORIES[answer]);

  const intersection = new Set([...guessCategories].filter(x => answerCategories.has(x)));
  const union = new Set([...guessCategories, ...answerCategories]);

  const jaccard = intersection.size / union.size;

  const level = getProximityLevel(jaccard); // maps to ICE COLD...SAME FAMILY
  const sharedHint = getMostSpecificSharedCategory(intersection);

  return { level, jaccard, sharedHint };
}

function getMostSpecificSharedCategory(shared: Set<string>): string | null {
  // Priority order: most specific first
  const SPECIFICITY = [
    "array-ops", "string-ops", "memory", "concurrency", "control-flow",
    "io", "data-structure", "algorithm", "security", "testing",
    "networking", "database", "frontend", "backend", "devops", "systems",
    "functional", "object-oriented", "imperative", "declarative",
    "builtin", "keyword", "type", "pattern", "tool", "command",
    "javascript", "typescript", "python", "rust", "go", "sql", "html-css",
    "concept",
  ];

  for (const cat of SPECIFICITY) {
    if (shared.has(cat)) return CATEGORY_DISPLAY_NAMES[cat];
  }
  return null;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  "array-ops": "Array methods",
  "string-ops": "String operations",
  "memory": "Memory management",
  "concurrency": "Concurrency",
  "control-flow": "Control flow",
  "io": "Input/Output",
  "data-structure": "Data structures",
  "algorithm": "Algorithms",
  "security": "Security",
  "testing": "Testing",
  "networking": "Networking",
  "database": "Database",
  "frontend": "Frontend",
  "backend": "Backend",
  "devops": "DevOps",
  "systems": "Systems",
  "functional": "Functional programming",
  "object-oriented": "OOP",
  "imperative": "Imperative style",
  "declarative": "Declarative style",
  "builtin": "Built-in function",
  "keyword": "Language keyword",
  "type": "Data type",
  "pattern": "Design pattern",
  "tool": "Developer tool",
  "command": "Command",
  "javascript": "JavaScript family",
  "typescript": "TypeScript family",
  "python": "Python family",
  "rust": "Rust family",
  "go": "Go family",
  "sql": "SQL family",
  "html-css": "HTML/CSS family",
  "concept": "General concept",
};
```

---

## 3. Daily Challenge System

### 3.1 Daily Word Selection (Deterministic)

The daily word is determined by a seed derived from the date. This ensures every player worldwide gets the same word on the same day.

```typescript
const EPOCH = new Date("2026-04-01"); // Day 1 = April Fool's Day 2026 (a Tuesday — fitting)
const DAY_NUMBER = Math.floor((Date.now() - EPOCH.getTime()) / 86400000) + 1;

function getDailyWord(dayNumber: number): string {
  // Separate word lists by difficulty
  const EASY_WORDS = ANSWER_BANK.filter(w => w.difficulty === 1);   // ~67 words
  const MED_WORDS  = ANSWER_BANK.filter(w => w.difficulty === 2);   // ~75 words
  const HARD_WORDS = ANSWER_BANK.filter(w => w.difficulty === 3);   // ~15 words

  // Determine day of week (0=Sun, 1=Mon, ..., 6=Sat)
  const date = new Date(EPOCH.getTime() + (dayNumber - 1) * 86400000);
  const dow = date.getDay();

  // Difficulty schedule
  let pool: WordEntry[];
  if (dow === 1 || dow === 2) {       // Mon, Tue → Easy
    pool = EASY_WORDS;
  } else if (dow === 3 || dow === 4) { // Wed, Thu → Medium
    pool = MED_WORDS;
  } else if (dow === 5) {             // Fri → Hard
    pool = HARD_WORDS;
  } else {                            // Sat, Sun → Medium (weekend warriors)
    pool = MED_WORDS;
  }

  // Deterministic pseudo-random selection using day number as seed
  const seed = dayNumber * 2654435761; // Knuth's multiplicative hash
  const index = Math.abs(seed) % pool.length;

  return pool[index].word;
}
```

### 3.2 Difficulty Distribution by Day of Week

```
Mon  ████░░░░░░  Easy     "Warm up"
Tue  ████░░░░░░  Easy     "Getting going"
Wed  ██████░░░░  Medium   "Midweek grind"
Thu  ██████░░░░  Medium   "Almost there"
Fri  ████████░░  Hard     "Friday flex"
Sat  ██████░░░░  Medium   "Weekend warrior"
Sun  ██████░░░░  Medium   "Sunday scaries"
```

### 3.3 Attempts Per Day

**3 attempts per daily challenge.**

Rationale:
- Wordle gives 6 guesses per game, but only 1 attempt per day. We give 6 guesses per game AND 3 attempts per day.
- 3 attempts creates scarcity without frustration. "I have 2 left" creates tension.
- 3 is the sweet spot: enough to feel fair, few enough to feel precious.
- After the 3rd attempt, the word is revealed regardless.

### 3.4 After All Attempts Used

```
╭─────────────────────────────────────╮
│  CodeWordle #47                     │
│                                     │
│  The word was: REDUCE               │
│  "Array.prototype.reduce()"        │
│                                     │
│  You used 3/3 attempts              │
│  Your streak has been reset.        │
│                                     │
│  Come back tomorrow for #48!        │
│                                     │
│  [C] Copy shame card               │
│  [P] Practice mode                  │
│  [Q] Quit                           │
╰─────────────────────────────────────╯
```

After exhausting attempts:
1. The answer is revealed with a brief definition/context
2. The streak counter resets to 0
3. A "shame card" is offered for sharing (shame is more viral than success)
4. Practice mode remains available (random word, no daily constraints)
5. Next daily challenge resets at midnight UTC

### 3.5 Daily Challenge Number System

- **Day 1**: April 1, 2026 (epoch)
- **Format**: `CodeWordle #N` where N increments daily
- **Timezone**: UTC midnight rollover
- **Number displayed**: Always visible in game UI and share cards
- This creates collectability ("I've been playing since #1") and conversation anchors ("Did you get #47?")

### 3.6 Practice Mode

Available at any time, unlimited plays:
- Random word from the full answer bank
- No streak impact
- No leaderboard impact
- Share card says "Practice" instead of daily number
- Word selection uses `Math.random()`, not daily seed

---

## 4. Shareable Score Cards

### Design Principles

1. **Copy-pasteable plain text** (no images, no links to render)
2. **Readable in monospace AND proportional fonts** (tested both)
3. **Tweetable** (compact version under 280 characters)
4. **Includes install command** (viral distribution vector)
5. **Spoiler-free** (never reveals the answer)

### Character Legend

```
✓ = Correct letter in correct position (green equivalent)
● = Correct letter in wrong position (yellow equivalent)
· = Letter not in word (gray equivalent)
```

### 4a. Standard Win Card

```
CodeWordle #47        4/6

  · · · · · ·        ICE COLD
  · ● · · · ·        COOL
  ✓ ● · · ● ·        HOT
  ✓ ✓ ✓ ✓ ✓ ✓        --

Streak: 12 days
github.com/user/codewordle
```

**Compact version (tweetable, 139 chars):**

```
CodeWordle #47 - 4/6
······
·●····
✓●··●·
✓✓✓✓✓✓
Streak: 12
npx codewordle
```

### 4b. Perfect Win Card (1-2 guesses)

```
CodeWordle #47        1/6

  ✓ ✓ ✓ ✓ ✓ ✓        PSYCHIC

  +-+-+-+-+-+-+-+-+-+-+-+-+-+
  | F | I | R | S | T | ! | |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+

  "First try. No hints needed."
  npx codewordle
```

**Compact version (tweetable, 107 chars):**

```
CodeWordle #47 - 1/6
✓✓✓✓✓✓ FIRST TRY
I am mass of pure intellect.
npx codewordle
```

For 2-guess win:

```
CodeWordle #47        2/6

  · ● · · ● ·        WARM
  ✓ ✓ ✓ ✓ ✓ ✓        --

  "Two and done."
  npx codewordle
```

### 4c. Loss / Shame Card

```
CodeWordle #47        X/6

  · · · · · ·        ICE COLD
  · · · · ● ·        ICE COLD
  · · ● · · ·        COLD
  · ● · · · ·        COOL
  · ● · ● · ·        WARM
  · ● ✓ ● · ·        HOT

  skill issue detected
  npx codewordle
```

**Compact version (tweetable, 129 chars):**

```
CodeWordle #47 - X/6
······
····●·
··●···
·●····
·●·●··
·●✓●··
skill issue detected
npx codewordle
```

### 4d. Streak Card (Weekly)

Generated at the end of a 5-day weekday streak or on Sunday for partial weeks:

```
CodeWordle Week 10

  Mon #46  ✓✓ 3/6
  Tue #47  ✓✓ 4/6
  Wed #48  ✓✓ 2/6
  Thu #49  ✓✓ 5/6
  Fri #50  ✓✓ 4/6

  PERFECT WEEK  5/5
  Total streak: 23 days
  npx codewordle
```

**Compact version (tweetable, 149 chars):**

```
CodeWordle Week 10
M:3 T:4 W:2 T:5 F:4
PERFECT WEEK 5/5
Streak: 23 days
Avg: 3.6 guesses
npx codewordle
```

### 4e. Challenge Card (Send to Friend)

This is a "gauntlet throw" — you challenge someone to beat your score.

```
+----------------------------------+
|  CODEWORDLE CHALLENGE            |
|                                  |
|  @alice solved #47 in 3/6       |
|  Can you beat that?              |
|                                  |
|  npx codewordle --daily          |
+----------------------------------+
```

**Compact version (tweetable, 110 chars):**

```
I solved CodeWordle #47 in 3/6.
Beat that.
npx codewordle --daily
```

### 4.5 Share Card Rendering (Implementation)

```typescript
function renderShareCard(
  variant: "standard" | "perfect" | "loss" | "streak" | "challenge",
  game: GameResult
): string {
  // Each guess becomes a line of hint characters
  const guessLines = game.guesses.map((guess, i) => {
    const hints = guess.letters.map(l => {
      if (l.status === "correct") return "✓";
      if (l.status === "present") return "●";
      return "·";
    }).join(" ");

    const semantic = guess.semanticLevel;
    return `  ${hints}        ${semantic}`;
  });

  // Compact version: no spaces between hint chars
  const compactLines = game.guesses.map(guess =>
    guess.letters.map(l => {
      if (l.status === "correct") return "✓";
      if (l.status === "present") return "●";
      return "·";
    }).join("")
  );

  // ... assemble based on variant
}
```

---

## 5. Scoring & Progression

### 5.1 Point System

Points are awarded per game (not per guess).

| Result | Base Points | Notes |
|--------|------------|-------|
| Win in 1 guess | 1000 | "Psychic" — nearly impossible |
| Win in 2 guesses | 500 | Exceptional |
| Win in 3 guesses | 300 | Great |
| Win in 4 guesses | 200 | Good |
| Win in 5 guesses | 100 | Solid |
| Win in 6 guesses | 50 | Scraped by |
| Loss | 0 | No points |

**Multipliers:**

| Multiplier | Condition | Value |
|-----------|-----------|-------|
| Streak bonus | Active streak | +10% per streak day (caps at +100%) |
| Hard mode | Played in hard mode (must use revealed hints) | x1.5 |
| Speed bonus | Completed in under 60 seconds | +50 bonus points |
| Daily bonus | Played the daily (not practice) | x2.0 |

**Formula:**
```
final_score = (base_points * daily_multiplier * hard_mode_multiplier * (1 + min(streak_days * 0.1, 1.0))) + speed_bonus
```

**Example:** Win daily in 3 guesses with a 5-day streak in hard mode under 60 seconds:
```
= (300 * 2.0 * 1.5 * (1 + 0.5)) + 50
= (300 * 2.0 * 1.5 * 1.5) + 50
= 1350 + 50
= 1400 points
```

### 5.2 Streak Tracking

```typescript
interface StreakData {
  current: number;           // Current consecutive daily wins
  longest: number;           // All-time longest streak
  weekStreak: number;        // Current week's daily wins (0-5 for weekdays)
  perfectWeeks: number;      // Number of 5/5 weeks completed
  lastPlayedDate: string;    // ISO date of last daily play
}
```

**Rules:**
- Streak increments when you win the daily challenge (any of your 3 attempts)
- Streak resets if you miss a day OR fail all 3 attempts
- Weekends are optional — they don't break streaks but do extend them
- A "Perfect Week" requires winning Mon-Fri (5 consecutive weekday dailies)

### 5.3 Statistics Tracked

```typescript
interface PlayerStats {
  // Core
  gamesPlayed: number;
  gamesWon: number;
  winPercentage: number;         // gamesWon / gamesPlayed * 100
  currentStreak: number;
  longestStreak: number;
  perfectWeeks: number;

  // Guess Distribution
  guessDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
  };
  averageGuesses: number;        // mean of winning games

  // Time
  fastestWin: number;            // seconds
  averageTime: number;           // seconds
  totalTimePlayed: number;       // seconds

  // Points
  totalPoints: number;
  highestSingleGame: number;

  // Semantic
  averageSemanticLevel: number;  // how close first guesses tend to be
  coldStartWins: number;         // wins where first guess was ICE COLD

  // Meta
  firstPlayed: string;           // ISO date
  dayNumber: number;             // which CodeWordle day they started on
}
```

**Stats display in terminal:**

```
╭── CodeWordle Stats ──────────────╮
│ Played: 47    Won: 89%           │
│ Streak: 12    Best: 23           │
│ Perfect Weeks: 3                 │
│                                  │
│ Guess Distribution:              │
│ 1: #          (2%)               │
│ 2: ###        (6%)               │
│ 3: ########   (28%)              │
│ 4: ########## (34%)              │
│ 5: ######     (21%)              │
│ 6: ##         (9%)               │
│                                  │
│ Avg: 3.8 guesses                 │
│ Fastest: 34s   Avg: 2m 12s       │
│ Total Points: 14,230             │
╰──────────────────────────────────╯
```

### 5.4 Achievement System (20 Achievements)

Achievements are divided by rarity. They unlock permanently and display in the player's stats screen.

#### Common (Easy to unlock)

| # | Name | Condition | Description |
|---|------|-----------|-------------|
| 1 | **Hello World** | Play your first game | "Every journey starts with a single guess." |
| 2 | **Debugger** | Win your first game | "You found the bug... er, the word." |
| 3 | **Consistent** | Win 3 games in a row | "Streaks start here." |
| 4 | **Regular Expression** | Play 10 daily challenges | "You're a regular." |
| 5 | **Type Safe** | Win without guessing any wrong letters position | "All greens or nothing." |

#### Uncommon (Moderate effort)

| # | Name | Condition | Description |
|---|------|-----------|-------------|
| 6 | **Git Blame** | Share a shame card | "Sometimes you have to own the L." |
| 7 | **Binary Search** | Win in exactly 3 guesses 5 times | "You always cut the search space in half." |
| 8 | **Polyglot** | Win with words from 5 different language domains | "You speak many tongues." |
| 9 | **Speedrun** | Win in under 30 seconds | "No time to think. Just vibes." |
| 10 | **Perfect Week** | Win Mon-Fri in a single week | "9 to 5 and never missed." |

#### Rare (Significant dedication)

| # | Name | Condition | Description |
|---|------|-----------|-------------|
| 11 | **Senior Dev** | Reach a 15-day streak | "You've been doing this a while." |
| 12 | **LGTM** | Win 25 daily challenges | "Looks good to me." |
| 13 | **Hard Mode Enjoyer** | Win 10 games in hard mode | "You chose violence." |
| 14 | **Cold Start** | Win a game where your first guess was ICE COLD | "Started from the bottom." |
| 15 | **Encyclopedic** | Correctly guess words from all 6 domain categories | "You know a bit of everything." |

#### Epic (Deep commitment)

| # | Name | Condition | Description |
|---|------|-----------|-------------|
| 16 | **10x Developer** | Earn 10,000 total points | "Productivity multiplied." |
| 17 | **Month of Code** | Maintain a 30-day streak | "Rain or shine, you showed up." |
| 18 | **Architect** | Win 50 daily challenges | "You see the big picture." |

#### Legendary (Exceptional)

| # | Name | Condition | Description |
|---|------|-----------|-------------|
| 19 | **Psychic** | Win on the first guess | "Are you reading the source code?" |
| 20 | **BDFL** | Win 100 daily challenges with 80%+ win rate | "Benevolent Dictator For Life." |

### 5.5 Data Persistence

All stats, streaks, and achievements are stored locally in:

```
~/.codewordle/
  stats.json          # Player statistics
  history.json        # Game history (last 90 days)
  achievements.json   # Unlocked achievements
  daily.json          # Today's daily state (attempts used, guesses)
```

No server required. Data is JSON, human-readable, git-ignorable.

---

## 6. Competitive Features

### 6.1 Daily Leaderboard Design

Leaderboards are **opt-in** and **anonymous by default**.

#### Architecture

```
Player finishes daily → Score computed locally →
  (if opted in) POST score to leaderboard API →
  Leaderboard updates in real-time
```

#### Leaderboard Tiers

1. **Global** — All players worldwide
2. **Organization** — Players at the same company (auto-detected)
3. **Friends** — Manually added via challenge codes

#### Display

```
╭── Daily #47 Leaderboard ─────────╮
│                                   │
│  YOUR ORG: acme-corp (14 players) │
│                                   │
│  #1  alice     3/6  1,400 pts     │
│  #2  bob       3/6  1,200 pts     │
│  #3  YOU       4/6    800 pts     │
│  #4  charlie   4/6    600 pts     │
│  #5  diana     5/6    300 pts     │
│  ...                              │
│  11 of 14 played today            │
│                                   │
│  GLOBAL                           │
│  Your rank: #847 of 12,431        │
│  Top 7%                           │
╰───────────────────────────────────╯
```

### 6.2 Org Detection from Git Remote

The organization is auto-detected from the git remote URL. This is the magic that creates intra-company virality without any signup flow.

```typescript
function detectOrg(): string | null {
  try {
    // Try to get git remote URL
    const remoteUrl = execSync("git remote get-url origin", {
      encoding: "utf-8",
      timeout: 3000,
    }).trim();

    // Parse org from various formats:
    // git@github.com:acme-corp/repo.git     → "acme-corp"
    // https://github.com/acme-corp/repo.git → "acme-corp"
    // git@gitlab.com:acme-corp/repo.git     → "acme-corp"

    const patterns = [
      /github\.com[:/]([^/]+)\//,
      /gitlab\.com[:/]([^/]+)\//,
      /bitbucket\.org[:/]([^/]+)\//,
      /dev\.azure\.com\/([^/]+)\//,
    ];

    for (const pattern of patterns) {
      const match = remoteUrl.match(pattern);
      if (match) return match[1].toLowerCase();
    }

    return null;
  } catch {
    return null; // Not in a git repo or no remote
  }
}
```

**Privacy safeguards:**
- Org detection is local-only by default
- Only the org name is sent to leaderboard (never repo name, file paths, or code)
- Players can opt out: `codewordle config --no-org`
- Players can override: `codewordle config --org "my-team"`

### 6.3 Ranking Algorithm

Rankings for the daily leaderboard are determined by a composite score:

```typescript
function computeRank(game: GameResult): number {
  // Primary: fewer guesses = better
  // Secondary: faster time = better (tiebreaker)
  // Tertiary: earlier attempt number = better (1st attempt > 2nd > 3rd)

  if (!game.won) return Infinity; // Losses rank last

  const guessScore = game.guessCount * 10000;        // 10000-60000
  const timeScore = Math.min(game.timeSeconds, 600);  // 0-600, capped at 10 min
  const attemptScore = game.attemptNumber * 1000;      // 1000-3000

  return guessScore + timeScore + attemptScore;
  // Lower = better
}
```

**Example rankings for daily #47:**

| Rank | Player | Guesses | Time | Attempt | Composite |
|------|--------|---------|------|---------|-----------|
| 1 | alice | 2 | 45s | 1st | 21,045 |
| 2 | bob | 3 | 28s | 1st | 31,028 |
| 3 | carol | 3 | 92s | 1st | 31,092 |
| 4 | dave | 3 | 45s | 2nd | 32,045 |
| 5 | eve | 4 | 33s | 1st | 41,033 |

### 6.4 Friend Challenges

Players can challenge specific people directly. This is the highest-intent viral mechanic.

#### Challenge Flow

```
1. Alice plays daily #47, wins in 3/6
2. Alice runs: codewordle challenge
3. System generates a challenge code: CW47-A3K9
4. Alice shares the challenge card (Section 4e) + code
5. Bob runs: codewordle --challenge CW47-A3K9
6. Bob plays the same word (even if he already played the daily)
7. Results are compared:

   ╭── Challenge Results ───────────────╮
   │                                    │
   │  CodeWordle #47 Challenge          │
   │                                    │
   │  alice   3/6   45s    WIN          │
   │  bob     4/6   62s                 │
   │                                    │
   │  alice wins by 1 guess!            │
   │                                    │
   │  [C] Copy result                   │
   │  [R] Rematch (new word)            │
   ╰────────────────────────────────────╯
```

#### Challenge Code Format

```
CW{day_number}-{4_char_alphanumeric}
```

The 4-char code encodes: challenger identity hash + attempt number. This allows the system to look up the original game for comparison.

#### Rematch

After a challenge, either player can propose a "rematch" — a random word both players play. This creates an infinite engagement loop between two competitive players.

```typescript
interface Challenge {
  code: string;           // CW47-A3K9
  dayNumber: number;      // 47
  challengerName: string; // git username
  challengerScore: {
    guesses: number;
    timeSeconds: number;
    guessHistory: string[][]; // for replay
  };
  word: string;           // encrypted, decrypted only after challenger plays
  createdAt: string;      // ISO timestamp
}
```

### 6.5 Slack / Discord Integration (Future)

Post-v1 feature. The share card format is designed to look great in both:

```
#engineering channel:

alice: CodeWordle #47 - 3/6
       ······
       ·●····
       ✓✓✓✓✓✓
       Streak: 12
       npx codewordle

bob:   I literally just got destroyed by this one

carol: wait there's a wordle for code?? installing now
```

The `npx codewordle` at the bottom of every share card is the entire growth engine. One line. Zero friction.

---

## Appendix A: Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P0 | Word bank + validation | 2h | Core game |
| P0 | Letter hint system | 3h | Core game |
| P0 | Semantic hint system | 3h | Differentiator |
| P0 | Daily word selection | 1h | Daily habit |
| P0 | Share card generation | 2h | Viral loop |
| P1 | Local stats + streaks | 2h | Retention |
| P1 | Achievement system | 3h | Delight |
| P1 | Practice mode | 1h | Engagement |
| P2 | Org detection | 1h | Competitive |
| P2 | Friend challenges | 4h | Viral |
| P3 | Leaderboard API | 8h | Competitive |
| P3 | Hard mode | 2h | Depth |

## Appendix B: Word Bank Validation Checklist

Before shipping, every answer word must pass:

- [ ] Exactly 6 characters
- [ ] Is a real programming/tech term
- [ ] At least 50% of developers with 2+ years experience would recognize it
- [ ] Unambiguous spelling (no UK/US variants both in common use)
- [ ] Not offensive in any language (spot-checked against top 10 languages)
- [ ] Not a trademarked name that could cause legal issues
- [ ] Has at least 2 categories assigned for semantic hints
- [ ] Difficulty rating reviewed by at least 2 people
- [ ] Not too similar to another word in the bank (e.g., don't have both `cloned` and `clones`)

---

*This document is ready for implementation. Start with P0 features for a 2-3 day build.*
