# Roadmap

Research-driven feature backlog, drawn from a survey of established music-learning sites (Scott's Bass Lessons, TalkingBass, BassBuzz, StudyBass, Fender Play, Yousician, Justin Guitar, Songsterr, FaChords, muted.io, Fretonomy, Don't Fret It, TonedEar, Guitar Fretboard Explorer, EarMaster, Legato, Modacity, Better Practice, Andante).

Nothing here is committed to — this is a menu. Tags: **[v1-fit]** extends planned v1 scope cleanly · **[v2]** natural next step · **[later]** needs audio / accounts / bigger infra currently out-of-scope.

> **See also:** `PLAN.md` is the **committed, ordered build plan** — use that to pick the next thing to ship. This file is the longer menu of possible features.

## Themes worth internalizing

1. **Visualization first.** The fretboard isn't a sidebar feature — it's the primary teaching surface. Every theory concept should map back to it.
2. **Slow down + loop** is the #1 killer feature on tab sites (and Songsterr paywalls it). Authored tabs make this free for us.
3. **Gamified drills beat static reference** for fretboard recall and interval ID.
4. **Structured paths beat content dumps.** SBL rebuilt around "Learning Pathways" after users got lost; BassBuzz wins by being linear.
5. **Practice logging + streaks** are consistent across every serious practice app. Git-backed markdown gets us this for free.
6. **Bass pedagogy order:** fingerstyle → muting → ghost notes → groove → walking bass. Slap deferred.

## Fretboard explorer

- **Scale & mode overlays** [v1-fit] — pick root + scale, highlight degrees with color-coded intervals.
- **Interval coloring toggle** [v1-fit] — note names / scale degrees / interval distance from root.
- **Triad / arpeggio overlay** [v1-fit] — highlight 1-3-5 across the neck; critical for chord-tone thinking.
- **Fretboard note-recognition game** [v1-fit] — silent drill: site shows a note, you click the fret.
- **Box shapes / 3-notes-per-string patterns** [v1-fit] — as data in `lib/music/`.
- **Chord-tone highlighter over a progression** [v2] — e.g. ii-V-I in C shows target notes moving across the neck.
- **Fingering suggestions (1-2-3-4)** [v2] — overlay for a given position.

## Tab viewer

- **Measure-level A/B looping (silent)** [v1-fit] — step through a highlighted section on a timer.
- **Tempo slider** [v2, needs tick] — trivial once a metronome click exists.
- **Rich frontmatter: difficulty / techniques / key / tempo / time signature** [v1-fit] — enables filtering and hooks into skill tracker.
- **Tab ↔ fretboard linking** [v1-fit] — clicking a note in the tab lights it on the fretboard with scale context.
- **Per-measure annotations** [v1-fit] — frontmatter-driven callouts ("watch muting here").
- **Auto-detect key from note distribution** [v2] — `lib/music/` analysis of the tab.

## Skills / lesson tracker

- **Prerequisite graph** [v1-fit] — `prereqs: [...]` in frontmatter rendered as a small DAG.
- **Richer status states** [v1-fit] — `not-started | learning | practicing | comfortable | retired`. "Retired" = spaced-repetition thinking without an algorithm.
- **"Currently working on" dashboard** [v1-fit] — landing page surfaces `learning` skills + linked tabs. BassBuzz's best UX.
- **Practice log as markdown entries** [v1-fit] — `content/practice/YYYY-MM-DD.md`, git becomes the streak tracker.
- **Calendar heatmap** [v1-fit] — GitHub-style, rendered from practice markdown.
- **Repertoire list** [v1-fit] — songs you can play end-to-end, distinct from things you're learning.

## Fundamentals

- **Interval cheat sheet with song mnemonics** [v1-fit] — perfect 4th = "Here Comes the Bride", etc.
- **Rhythm notation primer** [v1-fit] — SVG for whole/half/quarter/eighth, dotted, ties, rests.
- **Interactive circle of fifths** [v1-fit] — click a key, see scale + relative minor + common progressions.
- **"Why this matters on bass" callouts** [v1-fit] — 1-paragraph bass-specific application per theory concept. Differentiator.
- **Glossary with SVG/tab snippets** [v1-fit] — ghost note, dead note, raking, floating thumb, etc.

## Ear training (all need audio)

- **Interval trainer** [later] — two notes, identify the interval.
- **Drone root for pitch reference** [later] — sing/play scale degrees over a sustained root.
- **"Find the bass note" game** [later] — hear a loop, find the root on the fretboard.

Web Audio's `OscillatorNode` is enough for drones and ticks without pulling in Tone.js — if the no-audio rule ever softens.

## Utilities

- **Metronome** [v2, needs tick] — subdivisions, accents.
- **Tempo tapper** [v1-fit] — tap to get BPM; pure keyboard input, no audio.
- **Transposer** [v1-fit] — shift a tab or progression to a new key; pure `lib/music/`.
- **Tuner** [later] — probably skip; phone apps exist.

## Content curriculum (author order)

The convergent beginner path across BassBuzz / TalkingBass / SBL Bass 101:

1. Posture + fingerstyle + alternating fingers
2. Muting (left-hand + floating thumb)
3. Fretting-hand one-finger-per-fret
4. Notes on E and A strings, then D and G — memorization drills
5. Major scale, then natural minor
6. Root-5 and root-5-octave patterns
7. Playing to a metronome / drum loop (locking in)
8. Reading rhythm notation
9. Pentatonic minor + box shapes
10. Simple grooves — blues, rock, funk
11. Ghost notes + dead notes
12. Walking bass basics (roots + approach tones)
13. Slap (deferred — module 10+)

## Aesthetic

- **Animated fretboard transitions** [v1-fit] — CSS / Motion on the SVG when scale or root changes.
- **Color palette tied to the circle of fifths** [v1-fit] — consistent hue per key across pages.
- **OG image generation for lesson/tab pages** [v1-fit] — shareable Next.js image routes.
- **Playful microcopy and bass-forward typography** — free differentiator vs. corporate platforms.

## Recommended v1 additions (opinion)

Against the approved execution order (fretboard → tabs → lessons → fundamentals), these fit v1 with minimal scope creep and compound well:

1. Fretboard overlays (scale / mode / interval / triad) + silent note-recognition game.
2. Tab frontmatter tags + tab ↔ fretboard linking.
3. Practice log as markdown + calendar heatmap.
4. Lesson prereq graph + richer status states.
5. Fundamentals: interval mnemonics, interactive circle of fifths, glossary.

Defer to v2 once the audio line softens: metronome, tempo slider on tabs, ear trainer, drone.
