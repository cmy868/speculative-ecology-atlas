/**
 * Three.js art utilities for the Living Atlas 3D map.
 *
 * Visual language (derived from the artist's own work):
 *  - Domy Reverie: pure-black space, warm gold/ivory particle constellations,
 *    slow celestial motion — never neon.
 *  - Dissertation framework diagram: hand-drawn organic rings on black,
 *    a single red-orange Duo-Intelligence ring with two small circles,
 *    three territories inside one large organic double ring —
 *    "a single field of co-creation".
 *  - Nebula highlight family (violet–magenta–cyan) for lit connections.
 *
 * Everything here is pure Three.js object construction — no React, no state.
 * All functions are only ever called client-side (from effects / accessors).
 */

import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import type { AtlasNode, NodeType } from '@/types';

/* ————————————————————— palette ————————————————————— */

export const ATLAS3D = {
  /** pure black space — no blue cast */
  bg: '#030303',
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
  /** the framework diagram's red-orange Duo-Intelligence ring */
  accent: '#c9502e',
  /** nebula highlight family — lit connections, selection */
  nebulaViolet: '#b57bff',
  nebulaMagenta: '#ff6ec7',
  nebulaCyan: '#5ee6eb',
} as const;

/** Per-link highlight colors, indexed by a stable hash. */
export const NEBULA_LINK_COLORS = [
  '#b57bff',
  '#d76ee0',
  '#ff6ec7',
  '#8fa5ff',
  '#5ee6eb',
] as const;

export const NEBULA_PARTICLE_COLORS = [
  '#e8ccff',
  '#ffb3e2',
  '#b8f7fa',
  '#d8ccff',
] as const;

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

/* ————————————————————— environment / lighting ————————————————————— */

const ENV_VERTEX = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* A tiny synthetic "studio in space": near-black dome with one warm gold
   glow, one violet nebula glow and a cold cyan pinprick, so glassy and
   metallic materials pick up believable, art-directed reflections. */
const ENV_FRAGMENT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y * 0.5 + 0.5;
    vec3 col = mix(vec3(0.006, 0.006, 0.007), vec3(0.018, 0.014, 0.026), h);

    float warm = pow(max(dot(d, normalize(vec3(0.55, 0.55, -0.35))), 0.0), 14.0);
    col += vec3(1.0, 0.72, 0.38) * warm * 1.6;

    float violet = pow(max(dot(d, normalize(vec3(-0.65, -0.15, 0.45))), 0.0), 10.0);
    col += vec3(0.5, 0.32, 0.85) * violet * 0.55;

    float cyan = pow(max(dot(d, normalize(vec3(0.15, -0.75, -0.6))), 0.0), 40.0);
    col += vec3(0.35, 0.85, 0.9) * cyan * 0.8;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * A small PMREM environment map generated from a gradient scene —
 * enough for subtle reflections on the glassy/metallic node bodies.
 */
export function makeEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const scene = new THREE.Scene();
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(60, 48, 24),
    new THREE.ShaderMaterial({
      vertexShader: ENV_VERTEX,
      fragmentShader: ENV_FRAGMENT,
      side: THREE.BackSide,
    }),
  );
  scene.add(dome);
  /* no pre-blur sigma: the dome is already a smooth gradient, and larger
     sigmas make PMREM warn about exceeding its sample budget */
  const tex = pmrem.fromScene(scene).texture;
  dome.geometry.dispose();
  (dome.material as THREE.Material).dispose();
  pmrem.dispose();
  return tex;
}

export interface AtlasLights {
  /** the warm light living at the golden nucleus (breathes with it) */
  nucleus: THREE.PointLight;
  nucleusBaseIntensity: number;
}

/**
 * Replace the library's default flat lighting with the atlas rig:
 * a warm point light at the nucleus, a faint violet ambient, and two
 * dim directional fills so spheres always have a shaped dark side.
 */
export function setupLights(scene: THREE.Scene): AtlasLights {
  for (const child of [...scene.children]) {
    if ((child as THREE.Light).isLight) scene.remove(child);
  }

  scene.add(new THREE.AmbientLight('#9c8fb5', 0.42));

  const nucleus = new THREE.PointLight('#ffc37c', 70000, 0, 2);
  nucleus.position.set(0, 0, 0);
  scene.add(nucleus);

  const fill = new THREE.DirectionalLight('#b3a2e8', 0.55);
  fill.position.set(260, 480, 320);
  scene.add(fill);

  const back = new THREE.DirectionalLight('#67d8dd', 0.3);
  back.position.set(-220, -300, -420);
  scene.add(back);

  return { nucleus, nucleusBaseIntensity: nucleus.intensity };
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
function wobblyRingPoints(
  radius: number,
  seed: number,
  segments: number,
): THREE.Vector3[] {
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
  return pts;
}

export function makeWobblyRing(
  radius: number,
  color: string,
  opacity: number,
  seed: number,
  segments = 180,
): THREE.Line {
  const pts = wobblyRingPoints(radius, seed, segments);
  const geom = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new THREE.Line(geom, mat);
}

/* ————————————————————— flowing-light ring —————————————————————
   The two big enclosing rings carry a constant, very gentle current:
   a soft luminous pulse traveling slowly along the drawn line. Each
   vertex knows its progress (0..1) around the loop; the fragment
   shader moves two smooth brightness bumps with a time uniform. */

const FLOW_RING_VERTEX = /* glsl */ `
  attribute float aProgress;
  varying float vProgress;
  void main() {
    vProgress = aProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLOW_RING_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uPulseColor;
  uniform float uBase;
  uniform float uPulse;
  uniform float uWidth;
  uniform float uTime;
  uniform float uSpeed;
  varying float vProgress;

  float bump(float x, float w) {
    float d = min(x, 1.0 - x); /* wrapped distance to the pulse head */
    float b = smoothstep(w, 0.0, d);
    return b * b;
  }

  void main() {
    /* the main pulse pair — bright enough at the crest to catch a small
       halo of bloom as it travels */
    float head = uTime * uSpeed;
    float glowA = bump(fract(vProgress - head), uWidth);
    float glowB = bump(fract(vProgress - head + 0.5), uWidth);
    /* a second, fainter pair drifting at its own slower pace, so the
       current reads as flowing light rather than a metronome */
    float head2 = uTime * uSpeed * 0.62 + 0.31;
    float glowC = bump(fract(vProgress - head2), uWidth * 0.7);
    float glowD = bump(fract(vProgress - head2 + 0.5), uWidth * 0.7);
    float glow = max(glowA, glowB) * uPulse
               + max(glowC, glowD) * uPulse * 0.42;
    vec3 col = uColor * uBase + uPulseColor * glow;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface FlowingRing {
  object: THREE.Group;
  material: THREE.ShaderMaterial;
}

export function makeFlowingRing(
  radius: number,
  color: string,
  baseOpacity: number,
  seed: number,
  segments: number,
  speed: number,
  pulseColor: string = ATLAS3D.amber,
  pulseStrength = 1.15,
): FlowingRing {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uPulseColor: { value: new THREE.Color(pulseColor) },
      uBase: { value: baseOpacity },
      uPulse: { value: pulseStrength },
      uWidth: { value: 0.13 },
      uTime: { value: 0 },
      uSpeed: { value: speed },
    },
    vertexShader: FLOW_RING_VERTEX,
    fragmentShader: FLOW_RING_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  /* a double stroke — two parallel wobbly lines sharing one material —
     reads as a thicker hand-drawn ring, and the brighter crest carries a
     more obvious bloom halo as it travels */
  const object = new THREE.Group();
  for (const r of [radius, radius * 1.006]) {
    const pts = wobblyRingPoints(r, seed, segments);
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const progress = new Float32Array(pts.length);
    for (let i = 0; i < pts.length; i += 1) progress[i] = i / (pts.length - 1);
    geom.setAttribute('aProgress', new THREE.BufferAttribute(progress, 1));
    object.add(new THREE.Line(geom, material));
  }
  return { object, material };
}

/* ————————————————————— fresnel rim shells ————————————————————— */

const RIM_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const RIM_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), uPower);
    gl_FragColor = vec4(uColor * f, f * uOpacity);
  }
`;

interface RimShell {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  setOpacity: (v: number) => void;
}

/** Additive fresnel rim: the atmosphere-edge glow around a sphere. */
function makeRimShell(
  radius: number,
  color: string,
  opacity: number,
  power = 2.6,
): RimShell {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uPower: { value: power },
    },
    vertexShader: RIM_VERTEX,
    fragmentShader: RIM_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), material);
  mesh.renderOrder = 2;
  mesh.raycast = () => undefined;
  return {
    mesh,
    material,
    setOpacity: (v: number) => {
      material.uniforms.uOpacity.value = v;
    },
  };
}

/* ————————————————————— the field of co-creation ————————————————————— */

const MEMBRANE_VERTEX = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vWorldNormal;
  void main() {
    float w =
      sin(position.x * 0.012 + uTime * 0.32) +
      sin(position.y * 0.017 + uTime * 0.26) +
      sin(position.z * 0.010 + uTime * 0.21);
    vec3 p = position + normal * w * 9.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const MEMBRANE_FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uLightDir;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vWorldNormal;
  void main() {
    vec3 n = normalize(vWorldNormal);
    if (!gl_FrontFacing) n = -n;
    /* soft lambert against a fixed warm light (the same upper-warm glow
       the environment map carries, in family with the golden nucleus):
       one side of the vast shell is gently luminous and the form falls
       into shadow across its own curve — a lit volume, not a vignette */
    float lam = max(dot(n, normalize(uLightDir)), 0.0);
    float shade = 0.26 + 1.2 * pow(lam, 1.25);
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.5);
    /* the rim runs hotter on the lit side, so the shaded boundary glows —
       the lit sweep of the shell crosses the bloom threshold and blooms
       softly while the shadow side stays quiet */
    vec3 col = mix(uColorA, uColorB, f) * shade + uColorB * f * lam * 0.95;
    gl_FragColor = vec4(col, f * uOpacity * (0.45 + 1.0 * lam));
  }
`;

export interface FieldMembrane {
  group: THREE.Group;
  /** call each frame with elapsed seconds + delta */
  update: (t: number, dt: number) => void;
  dispose: () => void;
}

/**
 * "A single field of co-creation" — the framework diagram's enclosing
 * hand-drawn double ring, grown into space: two huge wobbly rings plus a
 * faint breathing organic shell that contains the whole galaxy.
 */
export function makeFieldMembrane(radius = 520): FieldMembrane {
  const group = new THREE.Group();

  /* The double ring faces the visitor (XY plane), the way the diagram's
     enclosing line wraps the whole drawing. A slight tilt keeps it from
     feeling mechanical; the rings spin slowly within their own plane. */
  const ringPlane = new THREE.Group();
  ringPlane.rotation.x = Math.PI / 2 - 0.14;
  ringPlane.rotation.y = 0.06;
  /* each big ring carries a constant, very gentle traveling light */
  const flowA = makeFlowingRing(radius, ATLAS3D.ivory, 0.33, 9001, 260, 0.028);
  const flowB = makeFlowingRing(radius * 1.05, ATLAS3D.ivory, 0.19, 9002, 260, -0.021);
  const ringA = flowA.object;
  const ringB = flowB.object;
  ringB.rotation.x = 0.05;
  ringPlane.add(ringA, ringB);
  group.add(ringPlane);

  /* a SMOOTH luminous field boundary — high-segment sphere (no visible
     facets) with a soft warm fresnel rim; it whispers, never shouts */
  const shellGeom = new THREE.SphereGeometry(radius * 1.08, 128, 96);
  const shellMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#d9d2c0') },
      uColorB: { value: new THREE.Color('#e6d3a8') },
      /* fixed warm key light, in family with the nucleus/env warm glow */
      uLightDir: { value: new THREE.Vector3(0.5, 0.62, 0.35).normalize() },
      uOpacity: { value: 0.042 },
    },
    vertexShader: MEMBRANE_VERTEX,
    fragmentShader: MEMBRANE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const shell = new THREE.Mesh(shellGeom, shellMat);
  shell.raycast = () => undefined;
  group.add(shell);

  /* the diagram's handwritten caption, drifting with the field */
  const caption = new SpriteText('a single field of co-creation', 13, ATLAS3D.labelSoft);
  caption.fontFace = 'Georgia, "Times New Roman", serif';
  caption.fontWeight = 'italic';
  caption.material.transparent = true;
  caption.material.opacity = 0.55;
  caption.material.depthWrite = false;
  caption.renderOrder = 3;
  caption.position.set(radius * 0.76, radius * 0.68, 0);
  group.add(caption);

  /* rings and shell don't participate in pointer picking */
  ringA.raycast = () => undefined;
  ringB.raycast = () => undefined;
  caption.raycast = () => undefined;

  return {
    group,
    update: (t: number, dt: number) => {
      shellMat.uniforms.uTime.value = t;
      flowA.material.uniforms.uTime.value = t;
      flowB.material.uniforms.uTime.value = t;
      /* the rings spin within their own plane; the shell breathes */
      ringA.rotation.y -= dt * 0.006;
      ringB.rotation.y += dt * 0.004;
      ringPlane.rotation.x = Math.PI / 2 - 0.14 + 0.03 * Math.sin(t * 0.11);
      const breath = 1 + 0.012 * Math.sin(t * 0.23);
      shell.scale.setScalar(breath);
    },
    dispose: () => {
      shellGeom.dispose();
      shellMat.dispose();
      for (const ring of [ringA, ringB]) {
        ring.traverse((child) => {
          if (child instanceof THREE.Line) {
            child.geometry.dispose();
          }
        });
      }
      flowA.material.dispose();
      flowB.material.dispose();
    },
  };
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
 * Warm ivory/gold with a faint nebula-violet minority — the Domy Reverie
 * sky. Twinkle runs in the vertex shader off a single uTime uniform.
 */
export function makeStarfield(count: number): Starfield {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  const ivory = new THREE.Color(0.91, 0.87, 0.76);
  const gold = new THREE.Color(0.85, 0.68, 0.4);
  const violet = new THREE.Color(0.62, 0.5, 0.85);
  const cyan = new THREE.Color(0.45, 0.78, 0.8);
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
    tmp.copy(roll < 0.62 ? ivory : roll < 0.86 ? gold : roll < 0.95 ? violet : cyan);
    /* a handful of "hero" stars give the field depth hierarchy */
    const hero = Math.random() < 0.05;
    const intensity = hero ? 0.85 + Math.random() * 0.15 : 0.35 + Math.random() * 0.65;
    colors[i * 3] = tmp.r * intensity;
    colors[i * 3 + 1] = tmp.g * intensity;
    colors[i * 3 + 2] = tmp.b * intensity;

    sizes[i] = (0.9 + Math.random() * 2.1) * (hero ? 1.8 : 1);
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

export interface Fadeable {
  set: (opacity: number) => void;
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
  /** current focus multiplier — lerped toward focusTarget by the frame driver */
  focusMul: number;
  /** where applyFocus wants the multiplier to go */
  focusTarget: number;
  /** hover/selection emphasis, also lerped (1 → ~1.25) */
  emphMul: number;
  emphTarget: number;
  /** concept labels fade in/out instead of popping */
  labelMul: number;
  labelTarget: boolean;
  core?: THREE.MeshStandardMaterial;
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
  label.backgroundColor = 'rgba(0,0,0,0.22)';
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

function fadeMaterial(
  material: THREE.Material & { opacity: number },
  base: number,
): Fadeable {
  return {
    base,
    set: (v: number) => {
      material.opacity = v;
    },
  };
}

/**
 * Build the artwork for one node. Everything is really lit: physical
 * materials with environment reflection, fresnel rim atmospheres, and a
 * restrained additive glow so bodies read as precious objects in space.
 *
 *  - center: a breathing molten-gold nucleus inside the framework's
 *    hand-drawn rings; the red-orange Duo-Intelligence ring carries its
 *    two small circles, straight from the diagram.
 *  - territory: a glassy liquid orb (transmission + iridescence + clearcoat).
 *  - project: a polished gold body with warm specular highlights.
 *  - concept: a small dark iridescent pearl that brightens on hover.
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
  let core: THREE.MeshStandardMaterial | undefined;
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
  ): THREE.Line => {
    const ring = makeWobblyRing(radius, color, opacity, ringSeed);
    ring.rotation.x = tiltX;
    ring.raycast = () => undefined;
    group.add(ring);
    rings.push({ obj: ring, speed });
    fadeables.push(fadeMaterial(ring.material as THREE.LineBasicMaterial, opacity));
    return ring;
  };

  const addRim = (radius: number, color: string, opacity: number, power?: number) => {
    const rim = makeRimShell(radius, color, opacity, power);
    group.add(rim.mesh);
    fadeables.push({ base: opacity, set: rim.setOpacity });
    return rim;
  };

  if (node.type === 'center') {
    /* breathing molten-gold nucleus — the "systems of imagination" blob */
    core = new THREE.MeshStandardMaterial({
      color: '#ffd9a0',
      emissive: '#ffb45e',
      emissiveIntensity: 1.7,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 1,
    });
    breathe = new THREE.Mesh(new THREE.SphereGeometry(6.2, 48, 32), core);
    group.add(breathe);

    addRim(7.8, '#ffcf8a', 0.55, 2.2);

    glowBase = 0.55;
    glowSprite = makeGlowSprite(glowTexture, ATLAS3D.gold, 36, glowBase);
    group.add(glowSprite);

    /* the framework's concentric hand-drawn rings; the middle one is the
       red-orange Duo-Intelligence ring with its two small circles */
    addRing(14.5, ATLAS3D.ivory, 0.5, seed + 1, 0.05, 0.16);
    const duo = addRing(20.5, ATLAS3D.accent, 0.92, seed + 2, -0.034, -0.1);
    addRing(26.5, ATLAS3D.ivory, 0.24, seed + 3, 0.021, 0.28);

    /* two small circles riding the Duo-Intelligence ring (from the diagram) */
    for (const angle of [0.5, 0.5 + Math.PI]) {
      const orbMat = new THREE.MeshStandardMaterial({
        color: '#e8703f',
        emissive: '#c9502e',
        emissiveIntensity: 2.4,
        roughness: 0.4,
        metalness: 0.15,
        transparent: true,
        opacity: 1,
      });
      const orb = new THREE.Mesh(new THREE.SphereGeometry(1.8, 20, 14), orbMat);
      orb.position.set(Math.cos(angle) * 20.5, 0, Math.sin(angle) * 20.5);
      orb.raycast = () => undefined;
      duo.add(orb); // ride the ring's rotation
      fadeables.push(fadeMaterial(orbMat, 1));
    }

    label = makeLabel(wrapTitle(node.title, 26), 4.8, ATLAS3D.label, false, -35);
    group.add(label);
    fadeables.push(fadeMaterial(label.material, 1));

    group.add(makeHitSphere(10));
  } else if (node.type === 'territory') {
    /* glassy liquid orb: transmission + clearcoat + iridescence */
    const physical = new THREE.MeshPhysicalMaterial({
      color: '#e7ecec',
      metalness: 0,
      roughness: 0.06,
      transmission: 0.85,
      thickness: 7,
      ior: 1.38,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      iridescence: 0.7,
      iridescenceIOR: 1.32,
      attenuationColor: new THREE.Color('#e9c98e'),
      attenuationDistance: 16,
      envMapIntensity: 1.6,
      emissive: '#4a3a20',
      emissiveIntensity: 1.05,
      transparent: true,
      opacity: 1,
    });
    core = physical;
    group.add(new THREE.Mesh(new THREE.SphereGeometry(6.8, 48, 32), physical));

    addRim(8.5, '#f2e7c9', 0.72, 2.8);

    glowBase = 0.52;
    glowSprite = makeGlowSprite(glowTexture, ATLAS3D.gold, 36, glowBase);
    group.add(glowSprite);

    /* one faint organic halo, like a breath drawn around the sphere */
    addRing(13.5, ATLAS3D.ivory, 0.3, seed + 1, seed % 2 ? 0.045 : -0.045, 0.2);

    label = makeLabel(wrapTitle(node.title, 20), 4.2, ATLAS3D.label, false, -15.5);
    group.add(label);
    fadeables.push(fadeMaterial(label.material, 0.95));

    group.add(makeHitSphere(9));
  } else if (node.type === 'project') {
    /* polished gold body — precious, warm, specular */
    const physical = new THREE.MeshPhysicalMaterial({
      color: '#d3a45c',
      metalness: 0.85,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.4,
      emissive: '#452e12',
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 1,
    });
    core = physical;
    group.add(new THREE.Mesh(new THREE.SphereGeometry(3.1, 36, 24), physical));

    addRim(3.9, '#ffd9a0', 0.45, 2.6);

    glowBase = 0.45;
    glowSprite = makeGlowSprite(glowTexture, ATLAS3D.amber, 16, glowBase);
    group.add(glowSprite);

    label = makeLabel(wrapTitle(node.title, 20), 2.8, ATLAS3D.label, false, -6.6);
    group.add(label);
    fadeables.push(fadeMaterial(label.material, 0.85));

    group.add(makeHitSphere(6));
  } else {
    /* concept: a small dark iridescent pearl */
    const physical = new THREE.MeshPhysicalMaterial({
      color: '#8b81a3',
      metalness: 0.15,
      roughness: 0.32,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
      iridescence: 0.55,
      iridescenceIOR: 1.25,
      envMapIntensity: 0.9,
      emissive: '#1f1b2b',
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.98,
    });
    core = physical;
    group.add(new THREE.Mesh(new THREE.SphereGeometry(2.0, 28, 20), physical));

    addRim(2.6, '#b9a8dd', 0.34, 2.6);

    glowBase = 0.32;
    glowSprite = makeGlowSprite(glowTexture, '#a698c4', 10, glowBase);
    group.add(glowSprite);

    /* italic ivory label, faded in on hover by the frame driver (labelMul) —
       deliberately NOT in fadeables: its opacity is driven separately */
    label = makeLabel(wrapTitle(node.title, 20), 2.6, ATLAS3D.labelSoft, true, -5.2);
    label.visible = false;
    label.material.opacity = 0;
    group.add(label);

    group.add(makeHitSphere(4.6));
  }

  if (core) fadeables.push(fadeMaterial(core, core.opacity));

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
    focusTarget: 1,
    emphMul: 1,
    emphTarget: 1,
    labelMul: 0,
    labelTarget: false,
    core,
    coreBaseColor: core?.color.clone(),
    label,
    rings,
    breathe,
  };
}

/** The nebula-violet ring placed around whichever node is selected. */
export function makeSelectionRing(radius: number): THREE.Line {
  const ring = makeWobblyRing(radius, ATLAS3D.nebulaViolet, 0.7, 77);
  ring.rotation.x = 0.14;
  ring.raycast = () => undefined;
  return ring;
}
