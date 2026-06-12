# Speculative Ecology in the Age of Generative AI — A Living Atlas

Companion website to the dissertation by Mingyong Cheng (UC San Diego, 2026).
The dissertation PDF is a fixed scholarly artifact; this site is the ecology
that keeps growing — an explorable, force-directed atlas of projects,
concepts, and the three territories of Memory, Life, and Embodiment.

Built with Next.js (App Router), TypeScript, React, and react-force-graph-2d.
Statically exported (`output: 'export'`), so it can be hosted anywhere.

## Run locally

```bash
npm install
npm run dev        # development server at http://localhost:3000
npm run build      # production build + static export into out/
```

## How to grow the atlas (add nodes and links)

All atlas content lives in two files — the interface never needs to change:

- **`data/nodes.ts`** — every node in the map. Add a new project, concept,
  exhibition, or publication by appending an object:

  ```ts
  {
    id: 'my-new-work',              // unique, kebab-case; used by links
    type: 'project',                // 'center' | 'territory' | 'project' | 'concept'
    title: 'My New Work',
    year: '2027',                   // optional
    description: 'One or two sentences shown in the side panel.',
    chapter: 'Chapter 3 — Ecologies of Life',   // optional
    tags: ['installation', 'sound'],            // optional
    citation: 'Citation text or placeholder.',  // optional (used by concepts)
    media: '/media/my-new-work.jpg',            // optional placeholder path
  }
  ```

- **`data/links.ts`** — every relation. Connect the new node:

  ```ts
  { source: 'my-new-work', target: 'life' },
  { source: 'my-new-work', target: 'environmental-sensing' },
  ```

Rebuild (or just save in dev mode) and the map redraws itself —
colors, sizes, panel layout, and neighborhood highlighting all follow
from `type`.

## Where to drop files

- **Dissertation PDF** → `public/dissertation.pdf`
  (the "Download Dissertation PDF" button on `/dissertation` points there).
- **Project media** → `public/media/...`, e.g. `public/media/five-seasons.jpg`.
  Each project node's `media` field is a path under `public/`. Until the file
  exists, the panel shows a quiet placeholder frame; once you drop the image
  in, it appears automatically.

## Deploy (any static host)

`npm run build` produces a fully static site in `out/`. Upload that folder
to any static host:

- **GitHub Pages** — push `out/` to a `gh-pages` branch (or use an action).
  If the site lives under a subpath (e.g. `username.github.io/atlas`), set
  `basePath: '/atlas'` in `next.config.mjs` first.
- **Netlify / Vercel / Cloudflare Pages** — connect the repo; build command
  `npm run build`, publish directory `out`.
- **Plain web server** — copy the contents of `out/` to the web root.

No server, database, or API is required.

## Project structure

```
app/page.tsx                  Home — title, intro, ambient field
app/atlas/page.tsx            Atlas route (full-viewport map)
app/dissertation/page.tsx     Abstract, chapters, committee, citation
components/AtlasMap.tsx       Force-directed map, hover/selection logic
components/ForceGraphCanvas.tsx  Client-only wrapper for react-force-graph-2d
components/NodePanel.tsx      Side panel for the selected node
components/AmbientField.tsx   Drifting-particle canvas on the home page
components/ThemeProvider.tsx  Ink (dark) / paper (light) mode
data/nodes.ts                 ← all atlas content
data/links.ts                 ← all atlas relations
types.ts                      Shared AtlasNode / AtlasLink types
```
