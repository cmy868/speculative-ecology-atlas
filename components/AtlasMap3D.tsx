'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from 'react-force-graph-3d';
import { atlasNodes, nodeById } from '@/data/nodes';
import { atlasLinks } from '@/data/links';
import type { AtlasNode } from '@/types';
import NodePanel from './NodePanel';
import {
  ATLAS3D,
  hashString,
  makeGlowTexture,
  makeNodeArt,
  makeSelectionRing,
  makeStarfield,
  type NodeArtHandle,
  type Starfield,
} from './atlas3d';

/* react-force-graph touches `window` at import time, so it is loaded
   client-side only, inside this client component. */
const ForceGraphCanvas3D = dynamic(() => import('./ForceGraphCanvas3D'), {
  ssr: false,
  loading: () => <div className="atlas-loading">growing the atlas…</div>,
});

type GraphNode = AtlasNode & {
  x?: number;
  y?: number;
  z?: number;
  fx?: number;
  fy?: number;
  fz?: number;
};

/** Resolve a link endpoint (string id before simulation, node object after). */
function endpointId(endpoint: unknown): string {
  if (endpoint && typeof endpoint === 'object') {
    return String((endpoint as GraphNode).id);
  }
  return String(endpoint);
}

/** Stable per-link 0..1 value, for organic variety in curvature/speed. */
function linkHash(link: LinkObject): number {
  return (
    (hashString(endpointId(link.source) + '→' + endpointId(link.target)) %
      1000) /
    1000
  );
}

const SELECTION_RING_RADIUS: Record<AtlasNode['type'], number> = {
  center: 28.5, // outside the framework rings
  territory: 6.6,
  project: 4.2,
  concept: 3.2,
};

export default function AtlasMap3D() {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const didSetupRef = useRef(false);

  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* imperative mirrors of the state above, read by the per-frame driver
     and by applyFocus without re-rendering React */
  const hoverRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  const handlesRef = useRef<Map<string, NodeArtHandle>>(new Map());
  const glowTexRef = useRef<THREE.Texture | null>(null);
  const starfieldRef = useRef<Starfield | null>(null);
  const selectionRingRef = useRef<THREE.Line | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const flyingUntilRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /* The simulation mutates its data (positions, object refs), so it gets
     its own copies; the originals in /data stay pristine. The center node
     is pinned at the origin so the framework rings anchor the galaxy. */
  const graphData = useMemo(
    () => ({
      nodes: atlasNodes.map((n) =>
        n.type === 'center'
          ? ({ ...n, fx: 0, fy: 0, fz: 0 } as GraphNode)
          : ({ ...n } as GraphNode),
      ),
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

  /* Full-viewport sizing. */
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* —————————————————— focus / dimming ——————————————————
     Applied imperatively to the Three.js materials: everything outside the
     hovered neighborhood fades to near-dark; concept labels are revealed
     for the hovered neighborhood. */
  const applyFocus = useCallback(() => {
    const hover = hoverRef.current;
    const sel = selectedRef.current;
    for (const [id, h] of handlesRef.current) {
      const focused =
        !hover || id === hover || (neighbors.get(hover)?.has(id) ?? false);
      const mul = focused ? 1 : 0.1;
      const emphasized = id === hover || id === sel;

      for (const f of h.fadeables) f.material.opacity = f.base * mul;
      h.focusMul = mul * (emphasized ? 1.35 : 1);
      h.glow.opacity = Math.min(1, h.glowBase * h.focusMul);

      if (h.type === 'concept' && h.label) {
        h.label.visible = id === sel || (hover !== null && focused);
      }
    }
  }, [neighbors]);

  /* —————————————————— node artwork ——————————————————
     Called once per node by react-force-graph-3d; handles are cached so
     hover/selection can retint materials without rebuilding objects. */
  const nodeThreeObject = useCallback(
    (nodeObj: NodeObject) => {
      const node = nodeById.get(String(nodeObj.id))!;
      if (!glowTexRef.current) glowTexRef.current = makeGlowTexture();
      const handle = makeNodeArt(node, glowTexRef.current);
      handlesRef.current.set(node.id, handle);
      /* apply current focus state to freshly built objects too */
      applyFocus();
      return handle.group;
    },
    [applyFocus],
  );

  /* —————————————————— scene setup ——————————————————
     Runs once the (dynamically loaded) graph instance exists: forces,
     fog, starfield, bloom, idle-drift driver, initial camera fit. */
  useEffect(() => {
    let raf = 0;
    const setup = () => {
      const fg = graphRef.current;
      if (!fg) {
        raf = window.requestAnimationFrame(setup);
        return;
      }
      if (didSetupRef.current) return;
      didSetupRef.current = true;

      reducedMotionRef.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      /* forces: gentle spread, type-aware link distances (as in the 2D map) */
      const charge = fg.d3Force('charge') as
        | { strength: (s: number) => unknown; distanceMax?: (d: number) => unknown }
        | undefined;
      charge?.strength(-150);
      charge?.distanceMax?.(420);

      const linkForce = fg.d3Force('link') as
        | { distance: (fn: (l: LinkObject) => number) => unknown }
        | undefined;
      linkForce?.distance((l: LinkObject) => {
        const sourceType = nodeById.get(endpointId(l.source))?.type;
        const targetType = nodeById.get(endpointId(l.target))?.type;
        if (sourceType === 'center' || targetType === 'center') return 120;
        if (sourceType === 'territory' || targetType === 'territory') return 78;
        return 58;
      });

      const scene = fg.scene();
      scene.fog = new THREE.FogExp2(
        new THREE.Color(ATLAS3D.bg).getHex(),
        0.001,
      );

      /* GPU particle field — fewer stars on small screens */
      const starCount = window.innerWidth < 720 ? 1100 : 2600;
      const starfield = makeStarfield(starCount);
      starfieldRef.current = starfield;
      scene.add(starfield.points);

      /* subtle bloom: the threshold is set high so only the hot additive
         glow cores bloom, never the ivory labels */
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.1, // strength
        0.7, // radius
        0.82, // threshold — labels (#ded7c4) sit below this luminance
      );
      fg.postProcessingComposer().addPass(bloom);

      /* per-frame driver, hooked onto the (never-culled) starfield:
         twinkle time, slow star drift, ring rotation, nucleus breathing,
         and the idle camera orbit */
      const up = new THREE.Vector3(0, 1, 0);
      const offset = new THREE.Vector3();
      const t0 = performance.now();
      let lastFrame = t0;

      starfield.points.onBeforeRender = () => {
        const nowMs = performance.now();
        const dt = Math.min((nowMs - lastFrame) / 1000, 0.1);
        lastFrame = nowMs;
        const t = (nowMs - t0) / 1000;
        const reduced = reducedMotionRef.current;

        if (!reduced) {
          starfield.material.uniforms.uTime.value = t;
          starfield.points.rotation.y += dt * 0.004; // imperceptibly slow drift
        }

        for (const h of handlesRef.current.values()) {
          for (const ring of h.rings) ring.obj.rotation.y += dt * ring.speed;
          if (h.breathe) {
            const s = 1 + 0.055 * Math.sin(t * 0.55);
            h.breathe.scale.setScalar(s);
            /* let the nucleus glow breathe with it (respecting focus dim) */
            h.glow.opacity = Math.min(
              1,
              h.glowBase * h.focusMul * (0.92 + 0.08 * Math.sin(t * 0.55)),
            );
          }
        }
        if (selectionRingRef.current) {
          selectionRingRef.current.rotation.y -= dt * 0.12;
        }

        /* ambient camera drift when idle (slow orbit around the current
           look-at target, so it resumes from wherever the visitor left) */
        const now = Date.now();
        const idle =
          !reduced &&
          now - lastInteractionRef.current > 9000 &&
          now > flyingUntilRef.current &&
          !selectedRef.current;
        if (idle) {
          const camera = fg.camera();
          const controls = fg.controls() as { target?: THREE.Vector3 };
          const target = controls?.target ?? new THREE.Vector3();
          offset.copy(camera.position).sub(target);
          offset.applyAxisAngle(up, dt * 0.035);
          camera.position.copy(target).add(offset);
          camera.lookAt(target);
        }
      };

      /* slow zoom-to-fit once the layout has warmed up */
      flyingUntilRef.current = Date.now() + 2600;
      window.setTimeout(() => {
        graphRef.current?.zoomToFit(1600, 90);
      }, 700);
    };
    setup();
    return () => window.cancelAnimationFrame(raf);
  }, []);

  /* pause the render loop when the tab is hidden */
  useEffect(() => {
    const onVisibility = () => {
      const fg = graphRef.current;
      if (!fg) return;
      if (document.hidden) fg.pauseAnimation();
      else fg.resumeAnimation();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  /* any pointer interaction defers the ambient drift */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const touch = () => {
      lastInteractionRef.current = Date.now();
    };
    el.addEventListener('pointerdown', touch);
    el.addEventListener('wheel', touch, { passive: true });
    return () => {
      el.removeEventListener('pointerdown', touch);
      el.removeEventListener('wheel', touch);
    };
  }, []);

  /* dispose GPU resources on unmount */
  useEffect(
    () => () => {
      starfieldRef.current?.dispose();
      glowTexRef.current?.dispose();
      handlesRef.current.clear();
    },
    [],
  );

  /* —————————————————— selection —————————————————— */

  const applySelection = useCallback((nextId: string | null) => {
    const prevId = selectedRef.current;
    selectedRef.current = nextId;

    /* restore the previous node's tint and remove the accent ring */
    if (prevId) {
      const prev = handlesRef.current.get(prevId);
      if (prev) {
        prev.glow.color.copy(prev.glowBaseColor);
        if (prev.core && prev.coreBaseColor) prev.core.color.copy(prev.coreBaseColor);
      }
    }
    if (selectionRingRef.current) {
      selectionRingRef.current.parent?.remove(selectionRingRef.current);
      selectionRingRef.current = null;
    }

    /* tint the newly selected node toward the red-orange accent and give
       it its own hand-drawn accent ring (the center already has one) */
    if (nextId) {
      const next = handlesRef.current.get(nextId);
      if (next) {
        if (next.type !== 'center') {
          next.glow.color.set(ATLAS3D.accent).lerp(next.glowBaseColor, 0.35);
          next.core?.color.set(ATLAS3D.accent).lerp(
            next.coreBaseColor ?? next.glow.color,
            0.25,
          );
        }
        const ring = makeSelectionRing(SELECTION_RING_RADIUS[next.type]);
        next.group.add(ring);
        selectionRingRef.current = ring;
      }
    }
  }, []);

  const flyToNode = useCallback((node: GraphNode) => {
    const fg = graphRef.current;
    if (!fg) return;
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const z = node.z ?? 0;
    const distance = node.type === 'center' ? 150 : 85;
    const r = Math.hypot(x, y, z);
    let pos: { x: number; y: number; z: number };
    if (r < 4) {
      /* node sits at the origin — approach along the current camera bearing */
      const cam = fg.camera().position;
      const cr = Math.hypot(cam.x - x, cam.y - y, cam.z - z) || 1;
      pos = {
        x: x + ((cam.x - x) / cr) * distance,
        y: y + ((cam.y - y) / cr) * distance,
        z: z + ((cam.z - z) / cr) * distance,
      };
    } else {
      const k = (r + distance) / r;
      pos = { x: x * k, y: y * k, z: z * k };
    }
    flyingUntilRef.current = Date.now() + 1900;
    lastInteractionRef.current = Date.now();
    fg.cameraPosition(pos, { x, y, z }, 1700);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      applySelection(id);
      applyFocus();
      const node = graphData.nodes.find((n) => n.id === id);
      if (node) flyToNode(node as GraphNode);
    },
    [graphData, applySelection, applyFocus, flyToNode],
  );

  const handleDeselect = useCallback(() => {
    setSelectedId(null);
    applySelection(null);
    applyFocus();
  }, [applySelection, applyFocus]);

  const handleHover = useCallback(
    (nodeObj: NodeObject | null) => {
      const id = nodeObj ? String(nodeObj.id) : null;
      if (id === hoverRef.current) return;
      hoverRef.current = id;
      setHoverId(id);
      applyFocus();
    },
    [applyFocus],
  );

  /* —————————————————— links ——————————————————
     Gently curved threads; hovering a node lights its links with the
     framework diagram's soft green, and speeds their traveling embers. */

  const isLinkLit = useCallback(
    (link: LinkObject) => {
      if (!hoverId) return false;
      const s = endpointId(link.source);
      const t = endpointId(link.target);
      return s === hoverId || t === hoverId;
    },
    [hoverId],
  );

  const linkColor = useCallback(
    (link: LinkObject) =>
      isLinkLit(link) ? 'rgba(138,165,131,0.9)' : 'rgba(222,214,196,0.38)',
    [isLinkLit],
  );

  const linkWidth = useCallback(
    (link: LinkObject) => (isLinkLit(link) ? 0.55 : 0.22),
    [isLinkLit],
  );

  const linkParticleColor = useCallback(
    (link: LinkObject) => (isLinkLit(link) ? '#b9cfae' : '#d9b36c'),
    [isLinkLit],
  );

  const linkParticleWidth = useCallback(
    (link: LinkObject) => (isLinkLit(link) ? 1.7 : 1.1),
    [isLinkLit],
  );

  const selected = selectedId ? (nodeById.get(selectedId) ?? null) : null;
  const relatedNodes: AtlasNode[] = selected
    ? [...(neighbors.get(selected.id) ?? [])]
        .map((id) => nodeById.get(id))
        .filter((n): n is AtlasNode => Boolean(n))
    : [];

  return (
    <div
      ref={containerRef}
      className={`atlas-canvas${hoverId ? ' is-hovering' : ''}`}
    >
      {dims && (
        <ForceGraphCanvas3D
          graphRef={graphRef}
          width={dims.w}
          height={dims.h}
          graphData={graphData}
          backgroundColor={ATLAS3D.bg}
          showNavInfo={false}
          nodeLabel={() => ''}
          nodeThreeObject={nodeThreeObject}
          nodeThreeObjectExtend={false}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkOpacity={0.5}
          linkCurvature={(l: LinkObject) => 0.1 + 0.14 * linkHash(l)}
          linkCurveRotation={(l: LinkObject) => linkHash(l) * Math.PI * 2}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={linkParticleWidth}
          linkDirectionalParticleSpeed={(l: LinkObject) =>
            0.0016 + 0.0016 * linkHash(l)
          }
          linkDirectionalParticleColor={linkParticleColor}
          linkDirectionalParticleResolution={6}
          onNodeHover={handleHover}
          onNodeClick={(node: NodeObject) => handleSelect(String(node.id))}
          onNodeDragEnd={(node: NodeObject) => {
            /* let dragged nodes drift again instead of staying pinned —
               except the center, which anchors the composition */
            if (String(node.id) !== 'speculative-ecology') {
              node.fx = undefined;
              node.fy = undefined;
              node.fz = undefined;
            }
            lastInteractionRef.current = Date.now();
          }}
          onBackgroundClick={handleDeselect}
          d3AlphaDecay={0.009}
          d3VelocityDecay={0.3}
          warmupTicks={90}
          cooldownTime={15000}
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
        click a node to read · drag to orbit · scroll to zoom
      </p>

      {selected && (
        <NodePanel
          node={selected}
          related={relatedNodes}
          onSelect={handleSelect}
          onClose={handleDeselect}
        />
      )}
    </div>
  );
}
