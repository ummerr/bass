# bass

A small, humble site for my bass guitar learning journey.

Four things it wants to be:

1. **Fundamentals reference** — strings, tuning, notes on the neck, scale formulas.
2. **Favorite tabs** — a clean reader for riffs and songs I'm learning.
3. **Skills & lessons** — a catalog of things to practice, organized by category.
4. **Interactive visualizations** — starting with a clickable fretboard for exploring scales and intervals.

## Stack

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [pnpm](https://pnpm.io/)
- Deploy: [Vercel](https://vercel.com/)
- Content: flat markdown files with YAML frontmatter, checked into the repo.

## Running locally

```sh
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Adding a tab

Create `content/tabs/<slug>.md` with frontmatter (`title`, `artist`, `difficulty`, `tuning`, `tempo`, `key`, `tags`, `dateAdded`) and a body with notes plus a fenced ```tab``` block.

## Adding a lesson

Create `content/lessons/<slug>.md` with frontmatter (`title`, `category`, `skill`, `level`, `prerequisites`, `estimatedMinutes`, `status`, `relatedTabs`) and a markdown body.

## Planned routes

- `/` — landing
- `/fretboard` — interactive fretboard
- `/tabs`, `/tabs/[slug]` — tab library + reader
- `/lessons`, `/lessons/[slug]` — skills catalog + lesson detail
- `/fundamentals` — hand-written reference
