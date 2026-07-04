'use client';

import { useEffect, useState } from 'react';
import { atlasNodes } from '@/data/nodes';
import type { NodeType } from '@/types';

/**
 * Collapsible liquid-glass side navigation for the atlas.
 *
 * Lists every node grouped by type (the old legend's dots become the
 * group headers); clicking an entry behaves exactly like clicking the
 * node in space (camera fly-to + reading panel, via the shared select
 * handler). Collapses to a small glass "INDEX" tab; default-collapsed
 * on narrow screens.
 */

const GROUPS: { type: NodeType; label: string }[] = [
  { type: 'center', label: 'Framework' },
  { type: 'territory', label: 'Territories' },
  { type: 'project', label: 'Projects' },
  { type: 'concept', label: 'Concepts' },
];

interface AtlasIndexProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function AtlasIndex({ selectedId, onSelect }: AtlasIndexProps) {
  /* null until mounted — the default (open on desktop, collapsed on
     narrow screens) depends on the viewport, which SSG cannot know */
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    setOpen(window.innerWidth > 900);
  }, []);

  if (open === null) return null;

  if (!open) {
    return (
      <button
        type="button"
        className="atlas-index-tab glass"
        onClick={() => setOpen(true)}
        aria-label="Open the node index"
        aria-expanded="false"
      >
        Index
      </button>
    );
  }

  return (
    <nav className="atlas-index glass" aria-label="Atlas index">
      <div className="atlas-index-head">
        <span className="atlas-index-title">Index</span>
        <button
          type="button"
          className="atlas-index-close"
          onClick={() => setOpen(false)}
          aria-label="Collapse the node index"
          aria-expanded="true"
        >
          ‹
        </button>
      </div>
      <div className="atlas-index-scroll">
        {GROUPS.map((group) => (
          <section className="atlas-index-group" key={group.type}>
            <h3>
              <i className={`legend-dot type-${group.type}`} aria-hidden />
              {group.label}
            </h3>
            <ul>
              {atlasNodes
                .filter((n) => n.type === group.type)
                .map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={n.id === selectedId ? 'is-active' : undefined}
                      aria-current={n.id === selectedId ? 'true' : undefined}
                      onClick={() => onSelect(n.id)}
                    >
                      {n.title}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
