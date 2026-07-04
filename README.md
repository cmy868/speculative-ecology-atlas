# Speculative Ecology in the Age of Generative AI — A Living Atlas

Companion website to the dissertation by Mingyong Cheng (UC San Diego, 2026).
The dissertation PDF is a fixed scholarly artifact; this site is the ecology
that keeps growing — an explorable, force-directed atlas of projects,
concepts, and the three territories of Memory, Life, and Embodiment.

Built with Next.js (App Router), TypeScript, React, three.js, and
react-force-graph-3d. Statically exported (`output: 'export'`), so it can be
hosted anywhere. The interface is permanently dark: a pure-black 3D galaxy
grown from the dissertation's framework diagram, with liquid-glass UI chrome.

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

## Deploy

**Live site:** https://cmy868.github.io/speculative-ecology-atlas/

The site is published on GitHub Pages from the `gh-pages` branch of
https://github.com/cmy868/speculative-ecology-atlas. After changing
anything (nodes, links, media, styles), publish the update with one command:

```bash
npm run deploy
```

This rebuilds the static site with the GitHub Pages base path
(`NEXT_PUBLIC_BASE_PATH=/speculative-ecology-atlas`) and pushes the `out/`
folder to the `gh-pages` branch. The live site updates a minute or so later.
Remember to also commit and push your source changes to `main` so the
repository stays in sync:

```bash
git add -A && git commit -m "Describe the change" && git push
```

### Other static hosts

`npm run build` (without the base path) produces a root-relative static site
in `out/` that works on any host:

- **Netlify / Vercel / Cloudflare Pages** — connect the repo; build command
  `npm run build`, publish directory `out`.
- **Plain web server** — copy the contents of `out/` to the web root.

No server, database, or API is required.

## Project structure

```
app/page.tsx                  Home — title, intro, ambient field
app/atlas/page.tsx            Atlas route (full-viewport 3D map)
app/dissertation/page.tsx     Abstract, chapters, committee, citation
components/AtlasMap3D.tsx     3D force map: layout, lighting, hover/selection
components/atlas3d.ts         All custom Three.js art (nodes, membrane, stars)
components/ForceGraphCanvas3D.tsx  Client-only wrapper for react-force-graph-3d
components/NodePanel.tsx      Liquid-glass panel for the selected node
components/GlassFilter.tsx    Shared SVG displacement filter (liquid glass)
components/AmbientField.tsx   Drifting-particle canvas on the home page
data/nodes.ts                 ← all atlas content
data/links.ts                 ← all atlas relations
types.ts                      Shared AtlasNode / AtlasLink types

Deep link: `/atlas?node=<id>` opens the atlas with that node selected.
```
