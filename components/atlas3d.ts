/**
 * Three.js art utilities for the Living Atlas 3D map.
 *
 * Visual language (derived from the artist's own work):
 *  - Domy Reverie: deep-space black, warm gold/ivory particle constellations,
 *    slow celestial motion — never neon.
 *  - Dissertation framework diagram: hand-drawn organic rings on near-black,
 *    a single red-orange accent ring, ivory serif labels.
 *
 * Everything here is pure Three.js object construction — no React, no state.
 * All functions are only ever called client-side (from effects / accessors).
 */

import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import type { AtlasNode, NodeType } from '@/types';

/* ————————————————————— palette ————————————————————— */

export const ATLAS3D = {
  /** deep space with a hint of indigo */
  bg: '#07080f',
  /** ivory — primary text */
  ivory: '#e8e2d4',
  /** label ivory, held just under the bloom threshold so text never glows */
  label: '#ded7c4',
  labelSoft: '#b7af9a',
  /** warm golds — the Domy Reverie constellation color */
  gold: '#d9b36c',
  amber: '#e9c98e',
  /** dim ember for concept nodes at rest */
  ember: '#9b8a60',
  /** the framework diagram's red-orange accent ring */
  accent: '#c9502e',
  /** soft green whisper for lit links (the diagram's green arrows) */
  green: '#8aa583',
  /** faint indigo for a minority of stars */
  indigo: '#8d97c9',
} as const;

/* ————————————————————— shared assets ————————————————————— */

/**
 * A soft radial glow texture (white core → warm transparent edge),
 * tinted per-node through the sprite material color.
 */
export function makeGlowTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0.0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.22, 'rgba(255,245,220,0.5)');
  grad.addColorStop(0.5, 'rgba(255,236,190,0.14)');
  grad.addColorStop(1.0, 'rgba(255,236,190,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ————————————————————— organic rings ————————————————————— */

/** Deterministic pseudo-random from a seed, for stable per-node wobble. */
function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A hand-drawn, imperfect circle: radius modulated by three incommensurate
 * sine waves (like a wobbling brush), with slight vertical waviness so the
 * ring is not a flat plot but a drawn line hovering in space.
 * Lies roughly in the XZ plane; rotate around Y for slow celestial motion.
 */
export function makeWobblyRing(
  radius: number,
  color: string,
  opacity: number,
  seed: number,
  segments = 180,
): THREE.Line {
  const rand = seeded(seed);
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const p3 = rand() * Math.PI * 2;
  const a1 = 0.035 + rand() * 0.025;
  const a2 = 0.02 + rand() * 0.02;
  const a3 = 0.012 + rand() * 0.014;

  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = (i / segments) * Math.PI * 2;
    const wobble =
      1 +
      a1 * Math.sin(3 * t + p1) +
      a2 * Math.sin(5 * t + p2) +
      a3 * Math.sin(9 * t + p3);
    const r = radius * wobble;
    pts.push(
      new THREE.Vector3(
        Math.cos(t) * r,
        Math.sin(2 * t + p1) * radius * 0.04,
        Math.sin(t) * r,
      ),
    );
  }
  /* close the loop exactly so no seam shows */
  pts[pts.length - 1] = pts[0].clone();

  const geom = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new THREE.Line(geom, mat);
}

/* ————————————————————— starfield ————————————————————— */

const STAR_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  uniform float uTime;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 0.55 + 0.45 * sin(uTime * aSpeed + aPhase);
    vTwinkle = tw;
    gl_PointSize = aSize * (0.7 + 0.3 * tw) * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float falloff = smoothstep(0.5, 0.0, d);
    falloff *= falloff;
    gl_FragColor = vec4(vColor, falloff * vTwinkle * 0.9);
  }
`;

export interface Starfield {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
  dispose: () => void;
}

/**
 * A GPU particle field: thousands of tiny drifting dust/star particles.
 * Warm ivory/gold with a faint indigo minority — the Domy Reverie sky.
 * Twinkle runs in the vertex shader off a single uTime uniform.
 */
export function makeStarfield(count: number): Starfield {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  const ivory = new THREE.Color(0.91, 0.87, 0.76);
  const gold = new THREE.Color(0.85, 0.68, 0.4);
  const indigo = new THREE.Color(0.5, 0.55, 0.78);
  const tmp = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    /* spherical shell distribution: some dust drifts between the nodes,
       most of it forms a far field the camera can never quite reach */
    const r = 70 + Math.pow(Math.random(), 0.6) * 980;
    const theta = Math.random() * Math.PI * 2;
    const cosPhi = Math.random() * 2 - 1;
    const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
    positions[i * 3] = r * sinPhi * Math.cos(theta);
    positions[i * 3 + 1] = r * cosPhi;
    positions[i * 3 + 2] = r * sinPhi * Math.sin(theta);

    const roll = Math.random();
    tmp.copy(roll < 0.68 ? ivory : roll < 0.9 ? gold : indigo);
    const intensity = 0.35 + Math.random() * 0.65;
    colors[i * 3] = tmp.r * intensity;
    colors[i * 3 + 1] = tmp.g * intensity;
    colors[i * 3 + 2] = tmp.b * intensity;

    sizes[i] = 0.8 + Math.random() * 1.9;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.35 + Math.random() * 0.9;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geom.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geom, material);
  points.frustumCulled = false; // also serves as the per-frame animation driver
  points.renderOrder = -1;

  return {
    points,
    material,
    dispose: () => {
      geom.dispose();
      material.dispose();
    },
  };
}

/* ————————————————————— node artwork ————————————————————— */

interface Fadeable {
  material: THREE.Material & { opacity: number };
  base: number;
}

export interface NodeArtHandle {
  id: string;
  type: NodeType;
  group: THREE.Group;
  /** everything that dims when the node leaves the hovered neighborhood */
  fadeables: Fadeable[];
  glow: THREE.SpriteMaterial;
  glowBase: number;
  glowBaseColor: THREE.Color;
  /** current focus multiplier (set by applyFocus, read by the frame driver) */
  focusMul: number;
  core?: THREE.MeshBasicMaterial;
  coreBaseColor?: THREE.Color;
  label?: SpriteText;
  /** rings that slowly rotate (obj + radians/second) */
  rings: { obj: THREE.Object3D; speed: number }[];
  /** the mesh that "breathes" (center nucleus) */
  breathe?: THREE.Mesh;
}

function wrapTitle(text: string, maxChars: number): string {
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
  return lines.join('\n');
}

function makeLabel(
  text: string,
  textHeight: number,
  color: string,
  italic: boolean,
  offsetY: number,
): SpriteText {
  const label = new SpriteText(text, textHeight, color);
  label.fontFace = 'Georgia, "Times New Roman", serif';
  /* SpriteText builds `${fontWeight} ${fontSize}px ${fontFace}`, so passing
     'italic' as the weight yields a valid italic CSS font shorthand. */
  if (italic) label.fontWeight = 'italic';
  /* slight dark backing keeps text legible against the particle field */
  label.backgroundColor = 'rgba(7,8,15,0.32)';
  label.padding = 1.2;
  label.borderRadius = 1.5;
  label.material.depthWrite = false;
  label.material.transparent = true;
  label.renderOrder = 3; // always composited over the glows
  label.center.set(0.5, 1); // hang below the anchor point
  label.position.y = offsetY;
  return label;
}

function makeGlowSprite(
  texture: THREE.Texture,
  color: string,
  scale: number,
  opacity: number,
): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scale, scale, 1);
  sprite.renderOrder = 1;
  /* glows are huge quads — exclude them from pointer raycasting so the
     hover area stays close to the node itself */
  sprite.raycast = () => undefined;
  return sprite;
}

/** Invisible sphere that provides a generous, predictable pointer target. */
function makeHitSphere(radius: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 8, 8),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  mesh.renderOrder = 0;
  return mesh;
}

/**
 * Build the artwork for one node:
 *  - center: a slowly breathing golden nucleus inside three hand-drawn
 *    concentric rings (ivory / red-orange accent / faint ivory) —
 *    the framework diagram translated into space.
 *  - territory: a luminous ivory sphere with a faint organic halo ring.
 *  - project: a warm amber point of light.
 *  - concept: a small dim ember that brightens on hover.
 */
export function makeNodeArt(
  node: AtlasNode,
  glowTexture: THREE.Texture,
): NodeArtHandle {
  const group = new THREE.Group();
  const fadeables: Fadeable[] = [];
  const rings: NodeArtHandle['rings'] = [];
  const seed = hashString(node.id);

  let glowSprite: THREE.Sprite;
  let core: THREE.MeshBasicMaterial | undefined;
  let label: SpriteText | undefined;
  let breathe: THREE.Mesh | undefined;
  let glowBase: number;

  const addRing = (
    radius: number,
    color: string,
    opacity: number,
    ringSeed: number,
    speed: number,
    tiltX: number,
  ) => {
    const ring = makeWobblyRing(radius, color, opacity, ringSeed);
    ring.rotation.x = tiltX;
    group.add(ring);
    rings.push({ obj: ring, speed });
    fadeables.push({
      material: ring.material as THREE.LineBasicMaterial,
      base: opacity,
    });
  };

  if (node.type === 'center') {
    /* breathing golden nucleus */
    core = new THREE.MeshBasicMaterial({
      color: ATLAS3D.amber,
      transparent: true,
      opacity: 1,
    });
    breathe = new THREE.Mesh(new THREE.SphereGeometry(5.2, 32, 24), core);
    group.add(breathe);

    glowBase = 0.95;
    glowSprite = makeGlowSprite(glowTexture, ATLAS3D.gold, 48, glowBase);
    group.add(glowSprite);

    /* the framework's concentric hand-drawn rings */
    addRing(13, ATLAS3D.ivory, 0.42, seed + 1, 0.05, 0.16);
    addRing(18.5, ATLAS3D.accent, 0.5, seed + 2, -0.034, -0.1);
    addRing(24, ATLAS3D.ivory, 0.16, seed + 3, 0.021, 0.28);

    label = makeLabel(wrapTitle(node.title, 26), 4.0, ATLAS3D.label, false, -26);
    group.add(label);
    fadeables.push({ material: label.material, base: 1 });

    group.add(makeHitSphere(10));
  } else if (node.type === 'territory') {
    core = new THREE.MeshBasicMaterial({
      color: '#efe7d2',
      transparent: true,
      opacity: 1,
    });
    group.add(new THREE.Mesh(new THREE.SphereGeometry(3.4, 24, 18), core));

    glowBase = 0.8;
    glowSprite = makeGlowSprite(glowTexture, ATLAS3D.gold, 27, glowBase);
    group.add(glowSprite);

    /* one faint organic halo, like a breath drawn around the sphere */
    addRing(8.6, ATLAS3D.ivory, 0.28, seed + 1, seed % 2 ? 0.045 : -0.045, 0.2);

    label = makeLabel(wrapTitle(node.title, 20), 3.4, ATLAS3D.label, false, -10.5);
    group.add(label);
    fadeables.push({ material: label.material, base: 0.95 });

    group.add(makeHitSphere(6));
  } else if (node.type === 'project') {
    core = new THREE.MeshBasicMaterial({
      color: ATLAS3D.amber,
      transparent: true,
      opacity: 1,
    });
    group.add(new THREE.Mesh(new THREE.SphereGeometry(1.8, 18, 14), core));

    glowBase = 0.85;
    glowSprite = makeGlowSprite(glowTexture, ATLAS3D.amber, 15, glowBase);
    group.add(glowSprite);

    label = makeLabel(wrapTitle(node.title, 20), 2.6, ATLAS3D.label, false, -4.6);
    group.add(label);
    fadeables.push({ material: label.material, base: 0.85 });

    group.add(makeHitSphere(4.4));
  } else {
    /* concept: a small dim ember */
    core = new THREE.MeshBasicMaterial({
      color: ATLAS3D.ember,
      transparent: true,
      opacity: 0.95,
    });
    group.add(new THREE.Mesh(new THREE.SphereGeometry(1.15, 14, 10), core));

    glowBase = 0.45;
    glowSprite = makeGlowSprite(glowTexture, ATLAS3D.ember, 8.5, glowBase);
    group.add(glowSprite);

    /* italic ivory label, revealed on hover (see applyFocus in AtlasMap3D) */
    label = makeLabel(wrapTitle(node.title, 20), 2.4, ATLAS3D.labelSoft, true, -3.6);
    label.visible = false;
    group.add(label);
    fadeables.push({ material: label.material, base: 0.9 });

    group.add(makeHitSphere(3.4));
  }

  if (core) fadeables.push({ material: core, base: core.opacity });

  const glow = glowSprite.material as THREE.SpriteMaterial;
  return {
    id: node.id,
    type: node.type,
    group,
    fadeables,
    glow,
    glowBase,
    glowBaseColor: glow.color.clone(),
    focusMul: 1,
    core,
    coreBaseColor: core?.color.clone(),
    label,
    rings,
    breathe,
  };
}

/** The red-orange accent ring placed around whichever node is selected. */
export function makeSelectionRing(radius: number): THREE.Line {
  const ring = makeWobblyRing(radius, ATLAS3D.accent, 0.65, 77);
  ring.rotation.x = 0.14;
  return ring;
}
