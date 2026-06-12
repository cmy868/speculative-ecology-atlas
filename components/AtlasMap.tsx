'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from 'react-force-graph-2d';
import { atlasNodes, nodeById } from '@/data/nodes';
import { atlasLinks } from '@/data/links';
import type { AtlasNode, NodeType } from '@/types';
import { useTheme } from './ThemeProvider';
import NodePanel from './NodePanel';

/* react-force-graph touches `window` at import time, so it is loaded
   client-side only, inside this client component. */
const ForceGraphCanvas = dynamic(() => import('./ForceGraphCanvas'), {
  ssr: false,
  loading: () => <div className="atlas-loading">growing the atlas…</div>,
});

type GraphNode = AtlasNode & {
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
};

const NODE_RADIUS: Record<NodeType, number> = {
  center: 9,
  territory: 6.5,
  project: 4.6,
  concept: 3.2,
};

/** Resolve a link endpoint (string id before simulation, node object after). */
function endpointId(endpoint: unknown): string {
  if (endpoint && typeof endpoint === 'object') {
    return String((endpoint as GraphNode).id);
  }
  return String(endpoint);
}

function wrapLabel(text: string, maxChars = 20): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current && (current + ' ' + word).length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function AtlasMap() {
  const { theme } = useTheme();
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const didFitRef = useRef(false);

  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* The simulation mutates its data (positions, object refs), so it gets
     its own copies; the originals in /data stay pristine. */
  const graphData = useMemo(
    () => ({
      nodes: atlasNodes.map((n) => ({ ...n })) as GraphNode[],
      links: atlasLinks.map((l) => ({ ...l })),
    }),
    [],
  );

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      if (!map.has(a)) map.set(a, new Set());
      map.get(a)!.add(b);
    };
    for (const link of atlasLinks) {
      add(link.source, link.target);
      add(link.target, link.source);
    }
    return map;
  }, []);

  const palette = useMemo(
    () =>
      theme === 'dark'
        ? {
            node: {
              center: '#b2452f',
              territory: '#e8e2d4',
              project: '#a39a87',
              concept: '#16140f',
            } as Record<NodeType, string>,
            conceptRing: '#8d8475',
            label: '#d9d2c1',
            line: 'rgba(232,226,212,0.13)',
            accent: '#b2452f',
            halo: 'rgba(232,226,212,0.28)',
          }
        : {
            node: {
              center: '#b2452f',
              territory: '#2a261e',
              project: '#6f6757',
              concept: '#fdfcf9',
            } as Record<NodeType, string>,
            conceptRing: '#8d8475',
            label: '#3a352a',
            line: 'rgba(42,38,30,0.14)',
            accent: '#b2452f',
            halo: 'rgba(42,38,30,0.3)',
          },
    [theme],
  );

  /* Full-viewport sizing. */
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* Tune forces once the (dynamically loaded) graph instance exists:
     gentle spread, type-aware link distances, then a slow zoom-to-fit. */
  useEffect(() => {
    let raf = 0;
    const tune = () => {
      const fg = graphRef.current;
      if (!fg) {
        raf = window.requestAnimationFrame(tune);
        return;
      }
      const charge = fg.d3Force('charge') as
        | { strength: (s: number) => unknown; distanceMax?: (d: number) => unknown }
        | undefined;
      charge?.strength(-170);
      charge?.distanceMax?.(460);

      const linkForce = fg.d3Force('link') as
        | { distance: (fn: (l: LinkObject) => number) => unknown }
        | undefined;
      linkForce?.distance((l: LinkObject) => {
        const sourceType = nodeById.get(endpointId(l.source))?.type;
        const targetType = nodeById.get(endpointId(l.target))?.type;
        if (sourceType === 'center' || targetType === 'center') return 150;
        if (sourceType === 'territory' || targetType === 'territory') return 95;
        return 70;
      });

      if (!didFitRef.current) {
        didFitRef.current = true;
        window.setTimeout(() => graphRef.current?.zoomToFit(900, 80), 650);
      }
    };
    tune();
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      const node = graphData.nodes.find((n) => n.id === id);
      if (node && node.x !== undefined && node.y !== undefined) {
        graphRef.current?.centerAt(node.x, node.y, 800);
      }
    },
    [graphData],
  );

  const isInFocus = useCallback(
    (id: string) => {
      if (!hoverId) return true;
      if (id === hoverId) return true;
      return neighbors.get(hoverId)?.has(id) ?? false;
    },
    [hoverId, neighbors],
  );

  const paintNode = useCallback(
    (nodeObj: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = nodeObj as unknown as GraphNode;
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = NODE_RADIUS[node.type];
      const focused = isInFocus(node.id);
      const emphasized = hoverId === node.id || selectedId === node.id;

      ctx.save();
      ctx.globalAlpha = focused ? 1 : 0.13;

      /* a faint halo ring around the structural nodes — hand-drawn weight */
      if (node.type === 'center' || node.type === 'territory') {
        ctx.beginPath();
        ctx.arc(x, y, r + 4.5, 0, Math.PI * 2);
        ctx.strokeStyle = palette.halo;
        ctx.lineWidth = 0.45;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = palette.node[node.type];
      ctx.fill();

      if (node.type === 'concept') {
        ctx.strokeStyle = palette.conceptRing;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      if (emphasized) {
        ctx.beginPath();
        ctx.arc(x, y, r + 2.6, 0, Math.PI * 2);
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      /* labels: structure always; detail as you draw closer or hover */
      const showLabel =
        node.type === 'center' ||
        node.type === 'territory' ||
        emphasized ||
        (hoverId !== null && focused) ||
        (node.type === 'project' && globalScale > 0.85) ||
        (node.type === 'concept' && globalScale > 1.15);

      if (showLabel) {
        const baseSize =
          node.type === 'center'
            ? 7.5
            : node.type === 'territory'
              ? 6.2
              : node.type === 'project'
                ? 4.6
                : 4.1;
        const fontSize = Math.max(baseSize, 10.5 / globalScale);
        const italic = node.type === 'concept' ? 'italic ' : '';
        ctx.font = `${italic}${fontSize}px Georgia, 'Times New Roman', serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = palette.label;
        ctx.globalAlpha = (focused ? 1 : 0.13) * (node.type === 'concept' ? 0.78 : 0.95);
        const lines = wrapLabel(node.title, node.type === 'center' ? 26 : 20);
        lines.forEach((line, i) => {
          ctx.fillText(line, x, y + r + 3 + i * (fontSize * 1.18));
        });
      }

      ctx.restore();
    },
    [hoverId, selectedId, isInFocus, palette],
  );

  const paintPointerArea = useCallback(
    (nodeObj: NodeObject, color: string, ctx: CanvasRenderingContext2D) => {
      const node = nodeObj as unknown as GraphNode;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, NODE_RADIUS[node.type] + 5, 0, Math.PI * 2);
      ctx.fill();
    },
    [],
  );

  const linkColor = useCallback(
    (link: LinkObject) => {
      const s = endpointId(link.source);
      const t = endpointId(link.target);
      const lit = hoverId !== null && (s === hoverId || t === hoverId);
      return lit ? palette.accent : palette.line;
    },
    [hoverId, palette],
  );

  const linkWidth = useCallback(
    (link: LinkObject) => {
      const s = endpointId(link.source);
      const t = endpointId(link.target);
      return hoverId !== null && (s === hoverId || t === hoverId) ? 1.1 : 0.55;
    },
    [hoverId],
  );

  const selected = selectedId ? (nodeById.get(selectedId) ?? null) : null;
  const relatedNodes: AtlasNode[] = selected
    ? [...(neighbors.get(selected.id) ?? [])]
        .map((id) => nodeById.get(id))
        .filter((n): n is AtlasNode => Boolean(n))
    : [];

  return (
    <div className={`atlas-canvas${hoverId ? ' is-hovering' : ''}`}>
      {dims && (
        <ForceGraphCanvas
          graphRef={graphRef}
          width={dims.w}
          height={dims.h}
          graphData={graphData}
          nodeLabel={() => ''}
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={paintPointerArea}
          linkColor={linkColor}
          linkWidth={linkWidth}
          onNodeHover={(node: NodeObject | null) =>
            setHoverId(node ? String((node as unknown as GraphNode).id) : null)
          }
          onNodeClick={(node: NodeObject) =>
            handleSelect(String((node as unknown as GraphNode).id))
          }
          onNodeDragEnd={(node: NodeObject) => {
            /* let dragged nodes drift again instead of staying pinned */
            node.fx = undefined;
            node.fy = undefined;
          }}
          onBackgroundClick={() => setSelectedId(null)}
          d3AlphaDecay={0.004}
          d3VelocityDecay={0.25}
          warmupTicks={120}
          cooldownTime={600000}
          minZoom={0.4}
          maxZoom={8}
        />
      )}

      <div className="atlas-legend" aria-hidden>
        <span>
          <i className="legend-dot type-center" /> framework
        </span>
        <span>
          <i className="legend-dot type-territory" /> territories
        </span>
        <span>
          <i className="legend-dot type-project" /> projects
        </span>
        <span>
          <i className="legend-dot type-concept" /> concepts
        </span>
      </div>

      <p className="atlas-hint">
        click a node to read · drag to rearrange · scroll to zoom
      </p>

      {selected && (
        <NodePanel
          node={selected}
          related={relatedNodes}
          onSelect={handleSelect}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
