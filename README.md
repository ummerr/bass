# bass

A personal site that scaffolds my daily 15 minutes of bass practice.

Not a content library. A **daily loop**: warm up → work the skill of the week → name some frets → play something fun → log it. Git is the streak tracker. Everything is flat markdown in the repo.

Built from a pedagogy-research synthesis across BassBuzz, Scott's Bass Lessons, StudyBass, TalkingBass, Justin Guitar, Berklee, and habit-formation science — see [`PLAN.md`](./PLAN.md) for the full thesis and build order.

## What's live

| Route | What |
|---|---|
| `/` | The daily loop: five numbered steps (warm-up, skill of the week, fretboard minute, fun, log) + streak + 90-day heatmap + explore nav |
| `/lessons` | Ten beginner lessons in order, with status badges |
| `/lessons/[slug]` | Lesson detail, prev/next nav |
| `/fretboard` | Fretboard explorer — beginner-default (neutral dots, note-name labels, four presets: All notes · C major · A minor · E minor pentatonic); **Show advanced** reveals 12 roots, 5 scales, degree / interval labels |
| `/drills/fretboard-notes` | Silent note-recognition drill — Name→Fret and Fret→Name modes, 12 prompts per round, single-string SVG, score + time |
| `/log` | Copy-template flow for today's practice entry, filename hint, recent-entries list |

Supports URL presets: `/fretboard?preset=c-major`, `/drills/fretboard-notes?string=A`.

## The daily loop

```
1. Warm up                 1 min       alternating fingers, one string, slow
2. Skill of the week       5–8 min     the one lesson in "learning" status
3. Fretboard minute        2 min       today's rotated string (Mon=E, Tue=A, Wed=D, Thu=G…)
4. Play something fun      5 min       a tab (coming), or a riff you love
5. Log it                  10 sec      commit content/practice/YYYY-MM-DD.md
```

Five small things, ≈15 minutes, skip any of them. Showing up is the win.

## Adding content

### A lesson

Create `content/lessons/NN-slug.md`:

```yaml
---
title: The major scale
order: 7
status: not-started      # not-started | learning | practicing | comfortable | retired
summary: One-line hook.
techniques: [scales, theory]
---

Markdown body. Link into the fretboard explorer with
[preset links](/fretboard?preset=c-major) where useful.
```

### A practice entry

Create `content/practice/YYYY-MM-DD.md` (easiest path: hit `/log`, copy the template):

```yaml
---
date: 2026-04-18
minutes: 15
categories: [technique, fretboard]   # technique | fretboard | rhythm | theory | song
lessons: [01-posture]
tabs: []
---

One line on what felt good, one line on what was rough.
```

Commit it. The heatmap ticks green on next build.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4
- `gray-matter` + `marked` for markdown
- pnpm · deploy target Vercel

Content is flat markdown. No database, no auth, no client-side persistence.

## Running locally

```sh
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## What's left (in order)

Full spec in [`PLAN.md`](./PLAN.md); the long menu of possibilities is in [`ROADMAP.md`](./ROADMAP.md).

### Phase 5 — Tab viewer with silent section looping *(next)*

- `content/tabs/*.md` with frontmatter (key, tempo, difficulty, techniques, `loops: [{ name, startLine, endLine }]`)
- `/tabs` index, filterable
- `/tabs/[slug]` renders monospace tab with a silent section-loop highlighter on a timer
- Unlocks the "Play something fun" step on `/today`

### Phase 6 — Fundamentals

- `/fundamentals` hub with subpages:
  - Interactive circle of fifths
  - Interval cheat sheet with song mnemonics + "why this matters on bass"
  - Rhythm primer (SVG notation + Count-Clap-Tap counting, audio-free)
  - Glossary (ghost note, dead note, raking, floating thumb, …)

### Phase 7 — Polish & compounding

- Lesson prerequisite DAG
- Richer lesson statuses usage
- OG image generation for lesson / tab pages
- Color palette tied to the circle of fifths
- Tempo tapper (tap → BPM, keyboard-only)
- Repertoire list distinct from lessons

## Explicit non-goals in v1

- **Audio of any kind.** No metronome, ear trainer, drone, tempo slider, tuner. Revisit only after 4+ weeks of daily use.
- **Accounts / auth / DB.** Git + markdown is the store.
- **5-string, left-handed UI.** v2 at earliest.
- **Slap, theory beyond minor pentatonic.** Lesson 13+ territory.
- **Points / badges / XP.** Streaks + lesson status transitions are enough.

## Reference files

- [`PLAN.md`](./PLAN.md) — committed ordered build plan, principles, acceptance checklist
- [`ROADMAP.md`](./ROADMAP.md) — longer feature menu surveyed from the whole online bass-learning world
- [`AGENTS.md`](./AGENTS.md) — reminder that Next 16 has breaking changes vs training data
