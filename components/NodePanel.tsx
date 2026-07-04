'use client';

import { useState } from 'react';
import { atlasLinks } from '@/data/links';
import type { AtlasNode, NodeType } from '@/types';

/** Relation note between two nodes, if one was authored in data/links.ts. */
function relationBetween(a: string, b: string): string | undefined {
  return atlasLinks.find(
    (l) =>
      (l.source === a && l.target === b) || (l.source === b && l.target === a),
  )?.relation;
}

const TYPE_LABEL: Record<NodeType, string> = {
  center: 'Framework',
  territory: 'Territory',
  project: 'Project',
  concept: 'Concept',
};

interface NodePanelProps {
  node: AtlasNode;
  related: AtlasNode[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

// Plain <img> srcs don't get Next's basePath rewrite, so prefix manually
// when the site is served under a sub-path (e.g. GitHub Pages).
const MEDIA_PREFIX = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function MediaImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    // No placeholder frames: a project with a missing image simply shows no media.
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="media-image"
      src={`${MEDIA_PREFIX}${src}`}
      alt={title}
      onError={() => setFailed(true)}
    />
  );
}

function MediaSlot({ node }: { node: AtlasNode }) {
  if (!node.media) return null;
  const sources = Array.isArray(node.media) ? node.media : [node.media];
  return (
    <>
      {sources.map((src) => (
        <MediaImage key={src} src={src} title={node.title} />
      ))}
    </>
  );
}

export default function NodePanel({
  node,
  related,
  onSelect,
  onClose,
}: NodePanelProps) {
  const relatedProjects = related.filter((r) => r.type === 'project');
  const relatedList =
    node.type === 'concept' && relatedProjects.length > 0
      ? relatedProjects
      : related;

  return (
    <aside className="node-panel glass" key={node.id} aria-label={node.title}>
      <div className="panel-top">
        <span className={`type-badge type-${node.type}`}>
          {TYPE_LABEL[node.type]}
        </span>
        <button
          type="button"
          className="panel-close"
          onClick={onClose}
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <h2 className="display panel-title">{node.title}</h2>

      {(node.year || node.chapter) && (
        <p className="panel-meta">
          {node.year}
          {node.year && node.chapter ? ' · ' : ''}
          {node.chapter}
        </p>
      )}

      {node.type === 'project' && <MediaSlot node={node} />}

      <p className="panel-description">{node.description}</p>

      {node.type === 'project' && node.link && (
        <p className="panel-external">
          <a
            className="panel-external-link"
            href={node.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            More on mingyongcheng.com →
          </a>
        </p>
      )}

      {node.tags && node.tags.length > 0 && (
        <ul className="tag-list">
          {node.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}

      {node.citation && (
        <div className="panel-citation">
          <h3>Citation</h3>
          <p>{node.citation}</p>
        </div>
      )}

      {relatedList.length > 0 && (
        <div className="panel-related">
          <h3>{node.type === 'concept' ? 'Related projects' : 'Related nodes'}</h3>
          <ul>
            {relatedList.map((r) => {
              const relation = relationBetween(node.id, r.id);
              return (
                <li key={r.id}>
                  <button type="button" onClick={() => onSelect(r.id)}>
                    <span className={`relation-dot type-${r.type}`} aria-hidden />
                    {r.title}
                  </button>
                  {relation && <p className="relation-note">{relation}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
