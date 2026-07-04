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
import AtlasIndex from './AtlasIndex';
import NodePanel from './NodePanel';
import {
  ATLAS3D,
  NEBULA_LINK_COLORS,
  NEBULA_PARTICLE_COLORS,
  hashString,
  makeEnvMap,
  makeFieldMembrane,
  makeGlowTexture,
  makeNodeArt,
  makeSelectionRing,
  makeStarfield,
  setupLights,
  type AtlasLights,
  type FieldMembrane,
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
  vx?: number;
  vy?: number;
  vz?: number;
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
  center: 31, // outside the framework rings
  territory: 10.8,
  project: 6.2,
  concept: 4.4,
};

/* ————————— the framework diagram, made spatial —————————
   Center at the origin; the three territories pinned on an inner orbit,
   120° apart, echoing the diagram (Memory up, Life lower-left,
   Embodiment lower-right); projects settle in a middle shell near their
   territory; concepts drift in an outer band. */

const TERRITORY_ORBIT = 172;
const PROJECT_SHELL = 300;
const CONCEPT_BAND = 415;

const TERRITORY_ANCHORS: Record<string, [number, number, number]> = {
  memory: [0, TERRITORY_ORBIT, 10],
  life: [-TERRITORY_ORBIT * 0.87, -TERRITORY_ORBIT * 0.5, -26],
  embodiment: [TERRITORY_ORBIT * 0.87, -TERRITORY_ORBIT * 0.5, 26],
};

const RADIAL_SHELL: Partial<Record<AtlasNode['type'], number>> = {
  project: PROJECT_SHELL,
  concept: CONCEPT_BAND,
};

/** Custom d3 force: pull each free node toward its type's shell radius. */
function makeShellForce(strength = 0.55) {
  let nodes: GraphNode[] = [];
  const force = (alpha: number) => {
    for (const n of nodes) {
      const r = RADIAL_SHELL[n.type];
      if (!r) continue;
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      const z = n.z ?? 0;
      const len = Math.hypot(x, y, z) || 1e-6;
      const k = ((r - len) * strength * alpha) / len;
      n.vx = (n.vx ?? 0) + x * k;
      n.vy = (n.vy ?? 0) + y * k;
      n.vz = (n.vz ?? 0) + z * k;
    }
  };
  force.initialize = (ns: GraphNode[]) => {
    nodes = ns;
  };
  return force;
}

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
  const membraneRef = useRef<FieldMembrane | null>(null);
  const lightsRef = useRef<AtlasLights | null>(null);
  const envMapRef = useRef<THREE.Texture | null>(null);
  const selectionRingRef = useRef<THREE.Line | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const flyingUntilRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /* The simulation mutates its data (positions, object refs), so it gets
     its own copies; the originals in /data stay pristine. The center node
     is pinned at the origin and the three territories are pinned on the
     inner orbit — the framework diagram anchors the whole galaxy. */
  const graphData = useMemo(
    () => ({
      nodes: atlasNodes.map((n) => {
        if (n.type === 'center') {
          return { ...n, fx: 0, fy: 0, fz: 0 } as GraphNode;
        }
        const anchor = TERRITORY_ANCHORS[n.id];
        if (n.type === 'territory' && anchor) {
          return {
            ...n,
            fx: anchor[0],
            fy: anchor[1],
            fz: anchor[2],
          } as GraphNode;
        }
        return { ...n } as GraphNode;
      }),
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
     Sets per-node targets; the frame driver eases the materials toward
     them every frame, so hover/selection dims breathe instead of snapping.
     Everything outside the hovered/selected neighborhood recedes to
     near-dark; concept labels fade in for the active neighborhood. */
  const applyFocus = useCallback(() => {
    const hover = hoverRef.current;
    const sel = selectedRef.current;
    const active = hover ?? sel;
    for (const [id, h] of handlesRef.current) {
      const focused =
        !active || id === active || (neighbors.get(active)?.has(id) ?? false);
      const emphasized = id === hover || id === sel;
      h.focusTarget = focused ? 1 : 0.06;
      h.emphTarget = emphasized ? 1.25 : 1;
      if (h.type === 'concept') {
        h.labelTarget = id === sel || (active !== null && focused);
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
     lighting, environment reflection, fog, starfield, the field membrane,
     bloom, idle-drift driver, initial camera fit. */
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

      /* forces: gentle spread, type-aware link distances, plus the radial
         shells that grow the framework diagram into a galaxy */
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
        if (sourceType === 'center' || targetType === 'center') return 170;
        if (sourceType === 'territory' || targetType === 'territory') return 130;
        return 110;
      });

      (fg.d3Force as (name: string, force?: unknown) => unknown)(
        'shell',
        makeShellForce(),
      );

      const scene = fg.scene();
      scene.fog = new THREE.FogExp2(
        new THREE.Color(ATLAS3D.bg).getHex(),
        0.0004,
      );

      /* real lighting: warm point light at the nucleus + shaped fills,
         and a small PMREM environment for glass/metal reflections */
      lightsRef.current = setupLights(scene);

      /* clip geometry that drifts right up against the lens — a link tube
         passing ~20 units from the camera otherwise smears into a huge
         gray band across the frame. Nothing is ever meant to be viewed
         closer than the fly-to distances (≥95), so 30 is safe. */
      const camera = fg.camera() as THREE.PerspectiveCamera;
      camera.near = 30;
      camera.updateProjectionMatrix();
      const controls = fg.controls() as { minDistance?: number };
      if (controls) controls.minDistance = 45;

      const renderer = fg.renderer() as THREE.WebGLRenderer;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.28;
      envMapRef.current = makeEnvMap(renderer);
      scene.environment = envMapRef.current;

      /* GPU particle field — fewer stars on small screens */
      const starCount = window.innerWidth < 720 ? 1300 : 3200;
      const starfield = makeStarfield(starCount);
      starfieldRef.current = starfield;
      scene.add(starfield.points);

      /* "a single field of co-creation" — the enclosing organic membrane */
      const membrane = makeFieldMembrane(520);
      membraneRef.current = membrane;
      scene.add(membrane.group);

      /* subtle bloom: the threshold sits just above the labels' luminance
         so only hot cores, pulse crests and lit nebula threads bloom — and
         gently (strength trimmed to compensate for the lower threshold),
         so lit links halo softly while keeping their violet/magenta/cyan
         hue instead of blowing out to white */
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.7, // strength
        0.55, // radius
        0.72, // threshold — labels (#ded7c4, linear ≈ 0.68) stay below
      );
      fg.postProcessingComposer().addPass(bloom);

      /* per-frame driver, hooked onto the (never-culled) starfield:
         twinkle time, slow star drift, ring rotation, nucleus breathing,
         membrane breathing, and the permanent floating camera */
      const up = new THREE.Vector3(0, 1, 0);
      const offset = new THREE.Vector3();
      const t0 = performance.now();
      let lastFrame = t0;
      /* phase accumulator for the vertical breathing — advances only while
         floating, so the bob never jumps when the drift resumes */
      let bobPhase = 0;

      starfield.points.onBeforeRender = () => {
        const nowMs = performance.now();
        const dt = Math.min((nowMs - lastFrame) / 1000, 0.1);
        lastFrame = nowMs;
        const t = (nowMs - t0) / 1000;
        const reduced = reducedMotionRef.current;

        if (!reduced) {
          starfield.material.uniforms.uTime.value = t;
          starfield.points.rotation.y += dt * 0.004; // imperceptibly slow drift
          membraneRef.current?.update(t, dt);
        }

        /* ease every node toward its focus targets — the hover-dim breathes
           in over ~a quarter second instead of snapping */
        const k = reduced ? 1 : 1 - Math.exp(-dt * 7);
        for (const h of handlesRef.current.values()) {
          h.focusMul += (h.focusTarget - h.focusMul) * k;
          h.emphMul += (h.emphTarget - h.emphMul) * k;
          for (const f of h.fadeables) f.set(f.base * h.focusMul);
          if (!h.breathe) {
            h.glow.opacity = Math.min(1, h.glowBase * h.focusMul * h.emphMul);
          }
          if (h.type === 'concept' && h.label) {
            h.labelMul += ((h.labelTarget ? 1 : 0) - h.labelMul) * k;
            h.label.material.opacity = 0.9 * h.labelMul;
            h.label.visible = h.labelMul > 0.02;
          }

          for (const ring of h.rings) ring.obj.rotation.y += dt * ring.speed;
          if (h.breathe) {
            const s = 1 + 0.055 * Math.sin(t * 0.55);
            h.breathe.scale.setScalar(s);
            /* let the nucleus glow and its light breathe with it */
            h.glow.opacity = Math.min(
              1,
              h.glowBase *
                h.focusMul *
                h.emphMul *
                (0.92 + 0.08 * Math.sin(t * 0.55)),
            );
            const lights = lightsRef.current;
            if (lights) {
              lights.nucleus.intensity =
                lights.nucleusBaseIntensity * (0.9 + 0.1 * Math.sin(t * 0.55));
            }
          }
        }
        if (selectionRingRef.current) {
          selectionRingRef.current.rotation.y -= dt * 0.12;
        }

        /* the whole scene gently floats at all times: a soft continuous
           orbit plus a sinusoidal vertical breathing. It starts right after
           the intro framing, pauses while the visitor interacts or reads a
           node, and resumes ~3s after they let go. */
        const now = Date.now();
        const floating =
          !reduced &&
          now - lastInteractionRef.current > 3000 &&
          now > flyingUntilRef.current &&
          !selectedRef.current;
        if (floating) {
          const camera = fg.camera();
          const controls = fg.controls() as { target?: THREE.Vector3 };
          const target = controls?.target ?? new THREE.Vector3();
          offset.copy(camera.position).sub(target);
          offset.applyAxisAngle(up, dt * 0.06); // slow orbit, ~1.7x the old drift
          /* vertical bob: add the delta of a sine so the offset stays bounded */
          const prevBob = Math.sin(bobPhase);
          bobPhase += dt * 0.42; // one breath ~15s
          offset.y += (Math.sin(bobPhase) - prevBob) * 14;
          camera.position.copy(target).add(offset);
          camera.lookAt(target);
        }
      };

      /* ————— opening viewpoint —————
         Not flat-on: the camera settles elevated above the ecliptic and
         rotated off-axis, far enough back to frame the whole membrane with
         margins, with the nucleus a touch off-center (rule of thirds).
         The framework triangle still reads (Memory up, Life lower-left,
         Embodiment lower-right) and the pose gives immediate depth —
         the permanent gentle float then continues seamlessly from it. */
      const elev = (20 * Math.PI) / 180; // above the ecliptic
      const azim = (25 * Math.PI) / 180; // off-axis, toward the lit side
      /* wide screens frame the membrane at ~1260; narrow viewports pull
         back until the whole boundary still fits (vertical fov is 50°) */
      const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
      const halfH = Math.atan(Math.tan((25 * Math.PI) / 180) * aspect);
      const dist = Math.max(1260, 640 / Math.tan(halfH));
      const pose = {
        x: dist * Math.cos(elev) * Math.sin(azim),
        y: dist * Math.sin(elev),
        z: dist * Math.cos(elev) * Math.cos(azim),
      };
      const poseTarget = { x: -48, y: 28, z: 0 };
      flyingUntilRef.current = Date.now() + 2600;
      fg.cameraPosition({ x: 0, y: 70, z: 1750 }, { x: 0, y: 0, z: 0 }, 0);
      window.setTimeout(() => {
        graphRef.current?.cameraPosition(pose, poseTarget, 1600);
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

  /* any pointer interaction defers the ambient float; a held-down drag
     keeps deferring it for as long as the visitor is steering */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const touch = () => {
      lastInteractionRef.current = Date.now();
    };
    const drag = (e: PointerEvent) => {
      if (e.buttons !== 0) lastInteractionRef.current = Date.now();
    };
    el.addEventListener('pointerdown', touch);
    el.addEventListener('pointermove', drag, { passive: true });
    el.addEventListener('wheel', touch, { passive: true });
    return () => {
      el.removeEventListener('pointerdown', touch);
      el.removeEventListener('pointermove', drag);
      el.removeEventListener('wheel', touch);
    };
  }, []);

  /* dispose GPU resources on unmount */
  useEffect(
    () => () => {
      starfieldRef.current?.dispose();
      membraneRef.current?.dispose();
      envMapRef.current?.dispose();
      glowTexRef.current?.dispose();
      handlesRef.current.clear();
    },
    [],
  );

  /* —————————————————— selection —————————————————— */

  const applySelection = useCallback((nextId: string | null) => {
    const prevId = selectedRef.current;
    selectedRef.current = nextId;

    /* restore the previous node's tint and remove the selection ring */
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

    /* tint the newly selected node toward the nebula violet and give it
       its own hand-drawn ring */
    if (nextId) {
      const next = handlesRef.current.get(nextId);
      if (next) {
        if (next.type !== 'center') {
          next.glow.color.set(ATLAS3D.nebulaViolet).lerp(next.glowBaseColor, 0.3);
          next.core?.color.set(ATLAS3D.nebulaViolet).lerp(
            next.coreBaseColor ?? next.glow.color,
            0.45,
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
    const distance =
      node.type === 'center' ? 200 : node.type === 'territory' ? 135 : 95;
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

    /* the reading panel covers the right side (desktop) or the bottom
       (small screens) — shift the look-at so the node settles in the
       unobstructed part of the frame instead of hiding behind glass */
    const dir = new THREE.Vector3(x - pos.x, y - pos.y, z - pos.z).normalize();
    const shift = distance * 0.2;
    const target = { x, y, z };
    if (window.innerWidth <= 720) {
      target.y -= shift; // node rises into the top half above the sheet
    } else {
      const right = new THREE.Vector3()
        .crossVectors(dir, new THREE.Vector3(0, 1, 0))
        .normalize();
      if (right.lengthSq() > 0.5) {
        target.x += right.x * shift; // node slides left of the panel
        target.y += right.y * shift;
        target.z += right.z * shift;
      }
    }

    flyingUntilRef.current = Date.now() + 1900;
    lastInteractionRef.current = Date.now();
    fg.cameraPosition(pos, target, 1700);
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

  /* deep link: /atlas?node=<id> opens that node once the layout settles */
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('node');
    if (!id || !nodeById.has(id)) return;
    const timer = window.setTimeout(() => handleSelect(id), 3600);
    return () => window.clearTimeout(timer);
  }, [handleSelect]);

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
     Gently curved threads; hovering or selecting a node lights its links
     in the nebula family (violet–magenta–cyan), noticeably brighter and
     thicker, with denser, faster traveling particles. Everything else
     recedes into the dark. */

  const activeId = hoverId ?? selectedId;

  const isLinkLit = useCallback(
    (link: LinkObject) => {
      if (!activeId) return false;
      const s = endpointId(link.source);
      const t = endpointId(link.target);
      return s === activeId || t === activeId;
    },
    [activeId],
  );

  const linkColor = useCallback(
    (link: LinkObject) => {
      if (isLinkLit(link)) {
        return NEBULA_LINK_COLORS[
          Math.floor(linkHash(link) * NEBULA_LINK_COLORS.length)
        ];
      }
      /* while something is active, unrelated threads almost disappear
         (alphas compensate for the raised linkOpacity, so resting and
         dimmed threads render exactly as before — only lit ones gain) */
      return activeId ? 'rgba(222,214,196,0.032)' : 'rgba(222,214,196,0.29)';
    },
    [isLinkLit, activeId],
  );

  const linkWidth = useCallback(
    (link: LinkObject) => (isLinkLit(link) ? 0.66 : 0.32),
    [isLinkLit],
  );

  /* while a node is active, unrelated links lose their travelers entirely —
     otherwise stray gold sparks float over the dimmed field */
  const linkParticles = useCallback(
    (link: LinkObject) => (isLinkLit(link) ? 4 : activeId ? 0 : 2),
    [isLinkLit, activeId],
  );

  const linkParticleColor = useCallback(
    (link: LinkObject) =>
      isLinkLit(link)
        ? NEBULA_PARTICLE_COLORS[
            Math.floor(linkHash(link) * NEBULA_PARTICLE_COLORS.length)
          ]
        : '#d9b36c',
    [isLinkLit],
  );

  const linkParticleWidth = useCallback(
    (link: LinkObject) => (isLinkLit(link) ? 1.95 : 1.0),
    [isLinkLit],
  );

  /* slower travelers — the current should drift, not race — with a
     stronger glow (hotter colors + wider bodies catch more bloom) */
  const linkParticleSpeed = useCallback(
    (link: LinkObject) =>
      (isLinkLit(link) ? 0.0034 : 0.0011) + 0.0009 * linkHash(link),
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
          linkOpacity={0.85}
          linkCurvature={(l: LinkObject) => 0.1 + 0.14 * linkHash(l)}
          linkCurveRotation={(l: LinkObject) => linkHash(l) * Math.PI * 2}
          linkDirectionalParticles={linkParticles}
          linkDirectionalParticleWidth={linkParticleWidth}
          linkDirectionalParticleSpeed={linkParticleSpeed}
          linkDirectionalParticleColor={linkParticleColor}
          linkDirectionalParticleResolution={6}
          onNodeHover={handleHover}
          onNodeClick={(node: NodeObject) => handleSelect(String(node.id))}
          onNodeDragEnd={(node: NodeObject) => {
            /* let dragged projects/concepts drift again instead of staying
               pinned; the center and the territories anchor the framework */
            const type = nodeById.get(String(node.id))?.type;
            if (type !== 'center' && type !== 'territory') {
              node.fx = undefined;
              node.fy = undefined;
              node.fz = undefined;
            }
            lastInteractionRef.current = Date.now();
          }}
          onBackgroundClick={handleDeselect}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={90}
          cooldownTime={10000}
        />
      )}

      <AtlasIndex selectedId={selectedId} onSelect={handleSelect} />

      <p className="atlas-hint glass glass-chip">
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
