# Build plan — v1

Committed, ordered build plan for the site, drawn from deep research across BassBuzz, Scott's Bass Lessons, StudyBass, TalkingBass, Justin Guitar, Berklee, and habit-formation science. Complements `ROADMAP.md` (which is the menu of all possible features) — this file is **what we're actually building next, in what order, and why**.

If priorities change, update this file before writing code.

---

## Thesis

**The site is not a content library. It is the scaffold around Ummerr's daily 15 minutes with the bass in hand.**

Every credible source converges on the same finding: beginners quit because practice is unstructured, not because they lack content. BassBuzz wins by enforcing deliberate practice (one skill, 1–3 sessions, move on). Scott's Bass Lessons rebuilt around "Learning Pathways" after admitting users were lost in a vast library with no defined order. Justin Guitar works because its nine stages each have a practice routine and an ear-training exercise. The pattern is the same everywhere: **structure + feedback + consistency > content volume.**

So the site's single job is to answer, every day:

> "What do I do right now, for 15 minutes, and did I actually progress?"

Everything else (fretboard explorer, fundamentals, glossary, tab library) is **reference** the loop pulls in when needed.

---

## The daily loop

Behavioral research (BJ Fogg, Atomic-Habits-style Cue → Craving → Response → Reward) maps directly to a session shape:

| Block | Duration | Source |
|---|---|---|
| **Warm-up** (fingerstyle alternation, one string) | 2 min | Mastertemps, BassBuzz |
| **Skill of the week** (the one lesson in `learning` status, with its drill) | 5–8 min | BassBuzz deliberate-practice unit |
| **Fretboard minute** (silent drill, one string at a time, rotates E→A→D→G) | 2 min | StudyBass note-memorization method |
| **Fun** (a tab section, slowed/looped) | 5 min | every source — "end on something rewarding" |
| **Log** (1 click, writes a markdown entry) | 10 sec | streak psychology — 40% more effort to maintain a streak |

The site's home page **is** this loop. Not a dashboard of features — the loop itself.

---

## Principles the site embodies

Drawn from the research. Every feature is accountable to these.

1. **Beginner-first defaults.** A brand-new bass player opens any page and knows what to do in 10 seconds. Advanced controls live behind an explicit toggle. (Already learned the hard way on Fretboard Explorer — see memory.)
2. **One next action, always visible.** SBL's failure mode was "every day felt like the first day in the gym." The home page must always surface *the* single thing to do now.
3. **Silent-first.** No audio in v1. Rhythm and ear concepts that need audio are deferred, not faked. Counting aloud + foot-tap (the Count-Clap-Tap method) is genuinely audio-free and still teaches subdivision.
4. **Git is the database.** Practice log, lesson status, tabs, all markdown. The commit history is the streak. No auth, no server writes, no client-side state that can't be reconstructed from the repo.
5. **Progress must be visible.** Calendar heatmap, lesson status transitions, "skill of the week" all exist to make invisible progress visible. Streaks are load-bearing — don't hide them.
6. **Pedagogy over features.** If a feature doesn't map back to the convergent beginner path (posture → fingerstyle → muting → notes → scale → pentatonic → root-5 → metronome → rhythm → grooves → ghost notes → walking), it waits.

---

## Build phases

Each phase is an independently shippable increment. Phases 1 and 2 together are **the product**. Everything after is compounding.

### Phase 1 — Close the loop (practice log + heatmap) ✅ shipped 2026-04-18

**Why first:** Without a feedback loop, the rest of the site is a reference site. Streak tracking is the highest-leverage motivational lever in all of the research. Git gives it to us free.

**What to build:**

- Content format: `content/practice/YYYY-MM-DD.md` with frontmatter:
  ```yaml
  date: 2026-04-18
  minutes: 15
  categories: [technique, fretboard, song]  # any of: technique, fretboard, rhythm, theory, song
  lessons: [02-fingerstyle]                  # slugs from content/lessons
  tabs: []                                   # slugs from content/tabs (when those exist)
  ```
  Body is a free-form note ("right-hand alternation felt clean today; G string still muted unevenly").
- `lib/practice.ts` — parse all entries, compute streak, compute per-day-category counts for the last 90 days.
- **Calendar heatmap** component (SVG, 90-day GitHub-style). Hover → day's note.
- **"Log today" page** at `/log`: textarea prefilled with today's template, a **Copy** button, and a filename hint (`content/practice/2026-04-18.md`). The user pastes into a file and commits. (No server writes — the site is static.)
- Home page surfaces: current streak, today's heatmap cell highlighted, "Log today's practice" CTA if no entry exists.

**Acceptance:** Ummerr plays bass for 15 minutes, commits one markdown file, and sees the heatmap tick green on next deploy/dev reload. Missing a day feels fine (no shaming copy). Seven green days in a row feels good.

---

### Phase 2 — The `/today` dashboard (make the loop the home page) ✅ shipped 2026-04-18

**Why second:** Phase 1 built the feedback side. Phase 2 builds the cue side. Together they close the habit loop.

**What to build:**

- Replace the current pillar-grid home page with a single-column "today" view.
- Sections, in order, matching the loop above:
  1. **Warm-up** — one-line prompt ("60 seconds of alternating index-middle on the A string, slow").
  2. **Skill of the week** — the single lesson in `learning` status, pulled from `content/lessons/`. If none, show the next `not-started`. Link goes straight to the lesson page with its drill at the top.
  3. **Fretboard minute** — today's target string, rotated by day-of-week (Mon=E, Tue=A, Wed=D, Thu=G, Fri=E, Sat=A, Sun=free). Link to the drill from Phase 3 (placeholder CTA until then).
  4. **Fun** — a tab link (placeholder card until tabs ship in Phase 5).
  5. **Log it** — link to `/log` from Phase 1.
- Keep the existing pillar nav as a secondary section further down or in the header.
- Copy: short, encouraging, no jargon. "Skill of the week" not "current lesson." "Fretboard minute" not "note-recognition drill."

**Acceptance:** Home page passes the "day-1 beginner test" — Ummerr can open it with a bass in hand and know exactly what to do without reading any help text.

---

### Phase 3 — Silent fretboard note-recognition drill ✅ shipped 2026-04-18

**Why third:** The single most-recommended beginner drill across StudyBass, TalkingBass, Moises, and TalkBass consensus. Unlocks the "Fretboard minute" in the `/today` dashboard.

**What to build:**

- `/drills/fretboard-notes` route.
- **Two modes** (both silent):
  - *Name → Fret:* site shows a note name ("F#"), user clicks the fret on an SVG of a single string.
  - *Fret → Name:* site highlights a fret, user types the note name or picks from 12 buttons.
- One string at a time. User picks the string (default = today's rotation from `/today`).
- Session = 12 prompts. Scoreboard at the end: correct/12, time.
- StudyBass method baked in: prompt to "say the note out loud" (text cue before each card).
- Use octave-shape hints for wrong answers (two-frets-up-two-strings-over).
- Reuse `lib/music/fretboard.ts` — no new music-theory code needed.

**Acceptance:** Ummerr runs the drill once per day for the week, and after ~5 days can name every note on the E and A strings without hesitation.

---

### Phase 4 — Simplify the Fretboard Explorer (beginner-first pass) ✅ shipped 2026-04-18

**Why fourth:** It already exists but was flagged as too complex. Now that drills cover the memorization side, the Explorer can specialize in *showing* scales that Ummerr encounters in lessons.

**What to build:**

- Default view: all notes, note-name labels, no color-coding, no scale selected, no fancy modes.
- Scale picker: **three options only** — "C major," "A natural minor," "E minor pentatonic." Matches lessons 7 and 8.
- **Advanced** toggle (collapsed by default) reveals: all 12 roots, all modes, interval / degree labels, triad overlay.
- Remove 5-string option entirely for now (it's in v2).
- Link from Lesson 7 "Major scale" → `/fretboard?scale=C-major` with the scale already applied.

**Acceptance:** Open `/fretboard` cold — a beginner sees a labeled neck, can pick one of three scales, and doesn't encounter the words "degree," "interval," or "mode" unless they click Advanced.

---

### Phase 5 — Tab viewer with silent section looping ← NEXT

**Why fifth:** Unlocks the "Fun" block in `/today`. The #1 killer feature on tab sites (slow-down + loop) is paywalled on Songsterr — we can ship the silent version for free since we author the tabs.

**What to build:**

- `content/tabs/*.md` — monospace ASCII tab in the body, frontmatter:
  ```yaml
  title: Seven Nation Army
  artist: The White Stripes
  key: E minor
  tempo: 124
  difficulty: 1  # 1-5
  techniques: [fingerstyle, root-octave]
  loops:
    - { name: "Main riff", startLine: 3, endLine: 6 }
  ```
- `/tabs` index — filterable by difficulty, technique, key.
- `/tabs/[slug]` — renders monospace tab, with a **section loop** control: pick a loop from frontmatter, UI highlights those lines only, auto-advances (visual only — no audio yet) on a timer the user sets.
- "Click a note → fretboard lights it" — defer to later; ship without first.
- Seed with 3 easy tabs matching current lesson level.

**Acceptance:** Ummerr loops the main riff of Seven Nation Army silently for 5 minutes and feels like he did something.

---

### Phase 6 — Fundamentals page

**Why sixth:** Not load-bearing for daily practice, but it's the "reference the loop pulls in" layer. Also where we earn the bass-specific differentiation (`Why this matters on bass` callouts).

**What to build:**

- `/fundamentals` index. Subpages:
  - **Circle of fifths** — interactive SVG. Click a key → show scale notes, relative minor, I-IV-V chords. Color hue per key, reused across site.
  - **Intervals** — cheat sheet with song mnemonics (P4 = "Here Comes the Bride," m3 = "Greensleeves," etc.) + a "Why this matters on bass" paragraph per interval.
  - **Rhythm primer** — SVG of whole/half/quarter/eighth/sixteenth + dotted + ties + rests. Count-Clap-Tap instructions ("1-and, 2-and," "1-e-and-a") written out. Audio-free, as research confirms is fine.
  - **Glossary** — ghost note, dead note, raking, floating thumb, muting, etc. Each with an SVG or tab snippet.

**Acceptance:** Every theory term that appears in a lesson has a glossary link. Every lesson that introduces an interval or rhythm links to the relevant fundamentals subpage.

---

### Phase 7 — Polish & compounding

Once the loop is live and has content feeding it, stack:

- Lesson **prereq DAG** (small SVG on `/lessons`).
- Richer lesson statuses (`not-started | learning | practicing | comfortable | retired`).
- OG image generation for lesson / tab pages (Next.js image routes).
- Color palette tied to circle of fifths — consistent hue per key across pages.
- Tempo tapper (tap → BPM, keyboard-only, no audio).
- Repertoire list distinct from lessons.

---

## Explicit non-goals (don't let these creep in)

- **Audio.** Metronome, ear trainer, tempo slider, drone, tuner — all deferred. Re-evaluate only after the silent product has been used daily for 4+ weeks.
- **User accounts / auth / DB.** Git + markdown is the store. Period.
- **5-string, left-handed UI.** v2 at earliest.
- **Slap, theory beyond minor pentatonic.** Lesson 13+ territory.
- **Points / badges / XP.** Research shows streaks work; gamification layers on top invite jargon and are easy to regret. Heatmap + status transitions are enough.
- **Third-party courses or content imports.** Hand-authored only — it's what makes the site *his*.

---

## Beginner-first acceptance checklist (run before shipping any PR)

Ask of every change:

- [ ] Could a person who has never played bass understand this page in 10 seconds without the word "degree," "interval," "mode," or "arpeggio" appearing unprompted?
- [ ] Is the default view the simplest useful view?
- [ ] Are advanced options hidden behind an **Advanced** toggle?
- [ ] Is there a "why this matters" blurb near any new feature?
- [ ] Does the feature map back to the convergent beginner path, or is it scope creep?

---

## What informed this plan

- **BassBuzz Beginner to Badass** — deliberate-practice course structure; 107 lessons sequenced so each skill takes 1–3 sessions. Validates our lesson granularity.
- **Scott's Bass Lessons Learning Pathways** — rebuilt after admitting users were lost; directly justifies the `/today` dashboard as the product's center.
- **StudyBass fretboard method** — one string at a time, say notes aloud, octave shapes. Directly shapes Phase 3.
- **TalkingBass / Moises** — corroborate the same fretboard drill consensus.
- **Justin Guitar** — nine stages, each with a practice routine and ear-training exercise. Validates stage-complete signaling (our lesson status transitions).
- **Berklee Online / Mastertemps** — 15–20 min, 3–4× per week beats sporadic long sessions. Directly shapes the daily-loop duration.
- **BJ Fogg / habit science** — Cue → Craving → Response → Reward. Shapes the home page as cue and the log as reward.
- **Streak research** — people expend ~40% more effort to maintain a streak than to hit the same behavior without one. Shapes the heatmap as load-bearing, not cosmetic.
- **Count Clap Tap method** — rhythm training without audio is genuinely possible. Shapes the rhythm primer in Phase 6.

Sources:
- StudyBass — [Mistakes Beginners Make](https://www.studybass.com/lessons/basics/mistakes-beginners-make/) · [Note Name Memorization Method](https://www.studybass.com/lessons/fretboard-notes/studybass-note-name-memorization-method/)
- BassBuzz — [Beginner to Badass Lessons Overview](https://www.bassbuzz.com/beginner-to-badass/lessons-overview)
- Scott's Bass Lessons — [Learning Pathways](https://scottsbasslessons.com/learning-pathways)
- TalkingBass — [Learn the Fretboard](https://www.talkingbass.net/learn-the-fretboard-how-to-memorize-the-notes-of-the-bass-guitar/)
- Justin Guitar — [Beginner Course](https://www.justinguitar.com/beginner)
- Berklee Online — [How to Practice Bass Effectively](https://online.berklee.edu/takenote/bass-players-how-to-practice-bass-effectively-pt1/)
- Mastertemps — [Developing a Practice Routine](https://mastertempsbassblog.com/how-to-practice-bass-guitar/)
- Moises — [Bass Fretboard Logic for Beginners](https://moises.ai/blog/tips/bass-fretboard-logic/)
- Graham English — [The Science of Habit Formation](https://grahamenglish.com/science-of-habit-formation-and-your-music-career/)
- synkd — [Count Clap Tap Rhythm Method](https://www.synkdapp.com/post/count-clap-tap-rhythm-method)
- HubGuitar — [Jumpstarting a Plateau](https://hubguitar.com/articles/guitar-plateau-how-to-jumpstart-progress)
