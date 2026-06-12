/**
 * Shared types for the Living Atlas.
 *
 * The atlas is data-driven: every node and link lives in `data/nodes.ts`
 * and `data/links.ts`. New projects, concepts, exhibitions, publications,
 * or media can be added there without touching any interface code.
 */

export type NodeType = 'center' | 'territory' | 'project' | 'concept';

export interface AtlasNode {
  /** Stable unique id, referenced by links. Use kebab-case. */
  id: string;
  type: NodeType;
  title: string;
  /** Display year or range, e.g. "2024" or "2022–2024" or "Ongoing". */
  year?: string;
  /** Short description (projects) or theoretical explanation (concepts). */
  description: string;
  /** Related dissertation chapter, e.g. "Chapter 2 — Ecologies of Memory". */
  chapter?: string;
  tags?: string[];
  /** Citation or citation placeholder (mostly for concepts). */
  citation?: string;
  /** Path(s) under /public, e.g. "/media/fusion.jpg" (placeholder until the file is dropped in). */
  media?: string | string[];
}

export interface AtlasLink {
  /** Node id. */
  source: string;
  /** Node id. */
  target: string;
}
