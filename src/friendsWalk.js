import * as THREE from 'three';
import { animate } from 'animejs';
import { createAnimal, animateAnimal, alignAnimalFeetToRoad } from './animalArt.js';
import { applyWardrobe, sanitizeWardrobe } from './dressUp.js';

// --- CONFIG & BIOMES ---
export const WALK_ANIMALS = [
  { id: 'mochi', name: 'Mochi Mascot', emoji: '🍡' },
  { id: 'hop', name: 'Hop Fluff', emoji: '🐇' },
  { id: 'bunny', name: 'Bella Bunny', emoji: '🐰' },
  { id: 'unicorn', name: 'Ula Unicorn', emoji: '🦄' },
  { id: 'horse', name: 'Hugo Horse', emoji: '🐴' },
  { id: 'cat', name: 'Coco Cat', emoji: '🐱' },
  { id: 'dog', name: 'Dodo Dog', emoji: '🐶' },
  { id: 'penguin', name: 'Pip Penguin', emoji: '🐧' },
  { id: 'cow', name: 'Mimi Cow', emoji: '🐮' }
];

export const BIOME_CHAPTERS = [
  {
    id: 'meadow',
    name: '🌸 Blossom Meadow',
    zenith: 0x82c6f5, horizon: 0xfceaf3, glow: 0xfff3df, sun: 0xffe9b8,
    fog: 0xebf7fa, ground: 0x7ecc7e, road: 0xffddba, trim: 0xfff8df,
    mountain: 0x6ca386, mountainHigh: 0xa4d4a8, mountainShape: 'hills'
  },
  {
    id: 'prairie',
    name: '🌻 Golden Prairie',
    zenith: 0x76b5f0, horizon: 0xffe2b0, glow: 0xfff8e8, sun: 0xffd277,
    fog: 0xfaf0d8, ground: 0x98c668, road: 0xf5d996, trim: 0xfff3d2,
    mountain: 0x8ca86a, mountainHigh: 0xcfe098, mountainShape: 'hills'
  },
  {
    id: 'town',
    name: '🏡 Pastel Village',
    zenith: 0x93b2e3, horizon: 0xf5cfd9, glow: 0xffece0, sun: 0xffc89e,
    fog: 0xe8e0ed, ground: 0xbfaca0, road: 0xece2d8, trim: 0xffffff,
    mountain: 0x8086ab, mountainHigh: 0xcca6c9, mountainShape: 'buildings'
  },
  {
    id: 'glacier',
    name: '❄️ Crystal Glacier',
    zenith: 0x6bbde6, horizon: 0xd6f4fc, glow: 0xf2fcff, sun: 0xdcf6ff,
    fog: 0xd8f2fd, ground: 0xedf7fc, road: 0xbbeef8, trim: 0xffffff,
    mountain: 0x5aadc9, mountainHigh: 0xc4eef5, mountainShape: 'peaks'
  },
  {
    id: 'starlight',
    name: '✨ Starlight Valley',
    zenith: 0x1f1947, horizon: 0x683d7d, glow: 0xb17cd4, sun: 0xe8b3ff,
    fog: 0x2e2145, ground: 0x362752, road: 0x6e4f94, trim: 0xd6b7ff,
    mountain: 0x412d61, mountainHigh: 0x865ea8, mountainShape: 'peaks'
  }
];

const $ = id => document.getElementById(id);
const profile = (() => {
  try { return JSON.parse(localStorage.getItem('penguin-ice-runner-v3') || '{}'); }
  catch { return {}; }
})();
const wardrobe = sanitizeWardrobe(profile.wardrobe);

// --- SCENE & LIGHTING SETUP ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xebf7fa, 0.009);

const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 300);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
renderer.domElement.style.cssText = 'position:fixed;inset:0;display:block;width:100%;height:100%;touch-action:none';

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8bb893, 2.2);
scene.add(hemiLight);

const sunlight = new THREE.DirectionalLight(0xfff5e3, 2.4);
sunlight.position.set(-8, 16, 9);
scene.add(sunlight);

// --- LAYER 0: STANDING BACKGROUND (INFINITE SKY DOME SHADER) ---
const skyUniforms = {
  uZenith: { value: new THREE.Color(BIOME_CHAPTERS[0].zenith) },
  uHorizon: { value: new THREE.Color(BIOME_CHAPTERS[0].horizon) },
  uGroundGlow: { value: new THREE.Color(BIOME_CHAPTERS[0].glow) },
  uSunColor: { value: new THREE.Color(BIOME_CHAPTERS[0].sun) },
  uTime: { value: 0 }
};

const skyMaterial = new THREE.ShaderMaterial({
  uniforms: skyUniforms,
  side: THREE.BackSide,
  depthWrite: false,
  depthTest: false,
  fog: false,
  vertexShader: `
    varying vec3 vDirection;
    void main() {
      vDirection = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vDirection;
    uniform vec3 uZenith, uHorizon, uGroundGlow, uSunColor;
    uniform float uTime;

    float hash21(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise2(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
                 mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    void main() {
      vec3 dir = normalize(vDirection);
      float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
      vec3 col = mix(uGroundGlow, uHorizon, smoothstep(0.06, 0.46, h));
      col = mix(col, uZenith, smoothstep(0.44, 0.95, h));

      vec3 sunDir = normalize(vec3(0.28, 0.35, -0.89));
      float halo = pow(max(dot(dir, sunDir), 0.0), 10.0) * 0.16;
      float disc = pow(max(dot(dir, sunDir), 0.0), 340.0) * 0.75;
      col += uSunColor * (halo + disc);

      float horizonBand = smoothstep(0.05, 0.18, dir.y) * (1.0 - smoothstep(0.70, 0.95, dir.y));
      vec2 cloudUV = dir.xz * 6.5 / (0.85 + abs(dir.y)) + vec2(uTime * 0.00035, uTime * 0.00015);
      float clouds = 0.65 * noise2(cloudUV) + 0.35 * noise2(cloudUV * 2.1 + vec2(5.2, 7.1));
      float fluff = smoothstep(0.42, 0.68, clouds) * horizonBand;
      col = mix(col, vec3(1.0), fluff * 0.62);

      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
});

const sky = new THREE.Mesh(new THREE.SphereGeometry(240, 32, 16), skyMaterial);
sky.renderOrder = -100;
sky.frustumCulled = false;
scene.add(sky);

// --- LAYER 1: STANDING HORIZON (DISTANT SILHOUETTES / MOUNTAINS) ---
const horizonGroup = new THREE.Group();
horizonGroup.name = 'horizon-stand';
scene.add(horizonGroup);

const hillGeo = new THREE.SphereGeometry(1, 14, 8);
const peakGeo = new THREE.ConeGeometry(1, 1, 7);
const buildingGeo = new THREE.BoxGeometry(1, 1, 1);

const horizonMaterials = [
  new THREE.MeshLambertMaterial({ color: BIOME_CHAPTERS[0].mountain }),
  new THREE.MeshLambertMaterial({ color: BIOME_CHAPTERS[0].mountainHigh })
];

const horizonPieces = [];
for (let i = 0; i < 16; i++) {
  const mesh = new THREE.Mesh(hillGeo, horizonMaterials[i % 2]);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  horizonGroup.add(mesh);
  horizonPieces.push(mesh);
}

function updateHorizonShape(shape) {
  for (let i = 0; i < horizonPieces.length; i++) {
    const mesh = horizonPieces[i];
    const front = i % 2 === 0;
    const x = (i % 8 - 3.5) * 22 + (front ? -4 : 6);
    const z = (front ? -115 : -160) - (i % 3) * 10;
    const tall = 16 + ((i * 13) % 9) * 2.8;

    mesh.position.set(x, 0, z);
    if (shape === 'peaks') {
      mesh.geometry = peakGeo;
      mesh.scale.set(11, tall, 11);
      mesh.position.y = tall * 0.48 - 4;
    } else if (shape === 'buildings') {
      mesh.geometry = buildingGeo;
      mesh.scale.set(13, tall * 0.75, 10);
      mesh.position.y = tall * 0.36 - 2;
    } else {
      mesh.geometry = hillGeo;
      mesh.scale.set(16, tall * 0.6, 16);
      mesh.position.y = -6 + (i % 3) * 1.5;
    }
  }
}
updateHorizonShape('hills');

// --- SHARED MATERIAL POOL (ZERO-GARBAGE) ---
const groundMat = new THREE.MeshLambertMaterial({ color: BIOME_CHAPTERS[0].ground });
const roadMat = new THREE.MeshLambertMaterial({ color: BIOME_CHAPTERS[0].road });
const trimMat = new THREE.MeshLambertMaterial({ color: BIOME_CHAPTERS[0].trim });

const mat = color => new THREE.MeshLambertMaterial({ color });
const woodMat = mat(0x9a6c4f);
const leavesGreen = mat(0x6eb773);
const leavesGolden = mat(0xd4b045);
const leavesCherry = mat(0xfdaecb);
const leavesSnow = mat(0xcfe9f7);
const leavesViolet = mat(0x9566bd);

const cottageWall = mat(0xffe6d5);
const cottageRoofPink = mat(0xf09db4);
const cottageRoofBrick = mat(0xba5a52);
const windmillBlade = mat(0xfff7e6);
const iceCrystal = mat(0x7de7f7);
const magicCrystal = mat(0xd18aff);
const flowerPinks = [mat(0xff94bc), mat(0xffde7d), mat(0xc7a9fc), mat(0x6ee6d8)];

// Shared Geometries
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const sphereGeo = new THREE.SphereGeometry(1, 9, 7);
const coneGeo = new THREE.ConeGeometry(1, 1, 8);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 8);

// Infinite Ground Base Plane
const groundBase = new THREE.Mesh(new THREE.PlaneGeometry(350, 350), groundMat);
groundBase.rotation.x = -Math.PI / 2;
groundBase.position.y = -0.12;
scene.add(groundBase);

// Road Base Strip
const roadBase = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 350), roadMat);
roadBase.rotation.x = -Math.PI / 2;
roadBase.position.y = -0.05;
scene.add(roadBase);

// Curb Edges
for (const side of [-1, 1]) {
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 350), trimMat);
  edge.position.set(side * 4.15, 0.005, 0);
  scene.add(edge);
}

// --- LAYER 2: RUNNING GROUND SEGMENTS (THE PART THAT RUNS!) ---
const scenery = new THREE.Group();
scene.add(scenery);

const SEGMENT_COUNT = 14;
const SEGMENT_SPACING = 16.5;
const segments = Array.from({ length: SEGMENT_COUNT }, () => {
  const group = new THREE.Group();
  scenery.add(group);
  return group;
});

function spawnMesh(parent, shape, material, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(shape, material);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.rotation.set(rx, ry, rz);
  parent.add(m);
  return m;
}

// Architectural Model Builders
function buildTree(g, x, z, leafMat) {
  spawnMesh(g, boxGeo, woodMat, x, 0.9, z, 0.26, 1.8, 0.28);
  spawnMesh(g, sphereGeo, leafMat, x, 2.3, z, 1.25, 1.1, 1.15);
}

function buildCottage(g, x, z, roofMat) {
  spawnMesh(g, boxGeo, cottageWall, x, 0.8, z, 1.9, 1.5, 1.7);
  const roof = spawnMesh(g, boxGeo, roofMat, x, 1.75, z, 2.15, 0.45, 2.0);
  roof.rotation.z = 0.09;
}

function buildWindmill(g, x, z) {
  spawnMesh(g, coneGeo, cottageWall, x, 1.8, z, 1.1, 3.6, 1.1);
  spawnMesh(g, boxGeo, woodMat, x, 3.3, z + 0.6, 0.3, 0.3, 0.3);
  const blade1 = spawnMesh(g, boxGeo, windmillBlade, x, 3.3, z + 0.65, 0.18, 2.2, 0.06);
  const blade2 = spawnMesh(g, boxGeo, windmillBlade, x, 3.3, z + 0.65, 2.2, 0.18, 0.06);
  blade1.rotation.z = 0.5;
  blade2.rotation.z = 0.5;
}

function buildTownHouse(g, x, z) {
  spawnMesh(g, boxGeo, cottageWall, x, 1.6, z, 2.2, 3.2, 1.8);
  spawnMesh(g, boxGeo, cottageRoofBrick, x, 3.3, z, 2.4, 0.5, 2.0);
  spawnMesh(g, boxGeo, woodMat, x + 0.6, 3.7, z - 0.2, 0.3, 0.7, 0.3); // Chimney
}

function buildLantern(g, x, z) {
  spawnMesh(g, cylGeo, woodMat, x, 1.1, z, 0.08, 2.2, 0.08);
  spawnMesh(g, sphereGeo, magicCrystal, x, 2.15, z, 0.22, 0.22, 0.22);
}

function buildCrystals(g, x, z, crystalMat) {
  for (let i = 0; i < 3; i++) {
    const spire = spawnMesh(g, coneGeo, crystalMat, x + (i - 1) * 0.4, 0.8 + i * 0.3, z + (i % 2) * 0.3, 0.4, 1.6 + i * 0.6, 0.4);
    spire.rotation.z = (i - 1) * 0.15;
  }
}

function buildFlower(g, x, z, i) {
  spawnMesh(g, boxGeo, leavesGreen, x, 0.24, z, 0.07, 0.48, 0.07);
  spawnMesh(g, sphereGeo, flowerPinks[i % flowerPinks.length], x, 0.54, z, 0.24, 0.22, 0.24);
}

// Fill segment with scenery props depending on its biome index
function fillSegment(g, segmentIndex) {
  g.clear();
  const biomeIdx = Math.floor(segmentIndex / 4) % BIOME_CHAPTERS.length;
  const biome = BIOME_CHAPTERS[biomeIdx];

  for (const side of [-1, 1]) {
    const x = side * (6.6 + (segmentIndex % 3) * 0.8);

    if (biome.id === 'meadow') {
      if (segmentIndex % 2 === 0) buildCottage(g, x, -3, cottageRoofPink);
      buildTree(g, x + side * 2.5, -8, leavesCherry);
      for (let j = 0; j < 4; j++) buildFlower(g, x + side * (j % 2) * 0.7, -j * 2.8 - 1, j + segmentIndex);
    }
    else if (biome.id === 'prairie') {
      if (segmentIndex % 3 === 0) buildWindmill(g, x, -4);
      else buildTree(g, x + side * 2.4, -7, leavesGolden);
      for (let j = 0; j < 3; j++) buildFlower(g, x + side * 0.8, -j * 3 - 2, 1);
    }
    else if (biome.id === 'town') {
      if (segmentIndex % 2 === 0) buildTownHouse(g, x, -3);
      buildLantern(g, side * 4.6, -5);
      buildTree(g, x + side * 2.8, -9, leavesGreen);
    }
    else if (biome.id === 'glacier') {
      buildCrystals(g, x, -4, iceCrystal);
      buildTree(g, x + side * 2.6, -8, leavesSnow);
    }
    else if (biome.id === 'starlight') {
      buildCrystals(g, x, -4, magicCrystal);
      buildTree(g, x + side * 2.5, -8, leavesViolet);
      buildLantern(g, side * 4.6, -3);
    }
  }
}

// --- STATE MANAGEMENT ---
let distance = 0;
let running = false;
let paused = false;
let time = 0;
let actors = [];

// Speed & Locomotion Mode
const SPEED_WALK = 2.7;
const SPEED_RUN = 9.0;
let currentSpeed = SPEED_WALK;
let isRunMode = false;

// Camera Views: 0: Follow (Third Person), 1: Front (Selfie), 2: Side Stroll (Profile Parallax)
let cameraMode = 0;
const cameraPresets = [
  { name: 'Cam: Follow', pos: [0, 4.2, 12.0], target: [0, 1.25, -6] },
  { name: 'Cam: Selfie', pos: [0, 2.9, -4.6], target: [0, 1.2, 3] },
  { name: 'Cam: Side Stroll', pos: [9.8, 2.8, 3.0], target: [0, 1.15, 3.0] }
];

// Active Biome State
let currentBiomeIdx = 0;
const currentZenith = new THREE.Color(BIOME_CHAPTERS[0].zenith);
const currentHorizon = new THREE.Color(BIOME_CHAPTERS[0].horizon);
const currentGlow = new THREE.Color(BIOME_CHAPTERS[0].glow);
const currentSun = new THREE.Color(BIOME_CHAPTERS[0].sun);
const currentFog = new THREE.Color(BIOME_CHAPTERS[0].fog);
const currentGround = new THREE.Color(BIOME_CHAPTERS[0].ground);
const currentRoad = new THREE.Color(BIOME_CHAPTERS[0].road);
const currentTrim = new THREE.Color(BIOME_CHAPTERS[0].trim);
const currentMountain = new THREE.Color(BIOME_CHAPTERS[0].mountain);
const currentMountainHigh = new THREE.Color(BIOME_CHAPTERS[0].mountainHigh);

// --- UI POPULATION ---
const selectors = [$('friend-one'), $('friend-two')];
for (const select of selectors) {
  for (const animal of WALK_ANIMALS) {
    const opt = document.createElement('option');
    opt.value = animal.id;
    opt.textContent = `${animal.emoji} ${animal.name}`;
    select.append(opt);
  }
}
selectors[0].value = WALK_ANIMALS.some(a => a.id === profile.selected) ? profile.selected : 'bunny';
selectors[1].value = selectors[0].value === 'cat' ? 'dog' : 'cat';

function removeActors() {
  for (const actor of actors) {
    scene.remove(actor.group);
    const seen = new Set();
    actor.group.traverse(o => {
      if (!o.isMesh) return;
      seen.add(o.geometry);
      seen.add(o.material);
    });
    for (const item of seen) item.dispose?.();
  }
  actors = [];
}

function showBiomeToast(name) {
  const toast = $('biomeToast');
  if (!toast) return;
  toast.textContent = `Entering ${name}`;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
  }, 2600);
}

function start() {
  const ids = selectors.map(s => s.value);
  if (ids[0] === ids[1]) {
    selectors[1].value = WALK_ANIMALS[(WALK_ANIMALS.findIndex(a => a.id === ids[0]) + 1) % 7].id;
    ids[1] = selectors[1].value;
  }
  removeActors();
  actors = ids.map((id, i) => {
    const actor = createAnimal(id);
    actor.group.position.set(i === 0 ? -1.35 : 1.35, 0, 3);
    actor.group.rotation.y = Math.PI;
    applyWardrobe(actor, wardrobe.equipped[id] || {});
    scene.add(actor.group);
    return actor;
  });

  distance = 0;
  time = 0;
  running = true;
  paused = false;

  segments.forEach((g, i) => {
    fillSegment(g, i);
    g.position.z = 6 - i * SEGMENT_SPACING;
    g.userData.index = i;
  });

  $('friend-setup').hidden = true;
  $('walk-controls').hidden = false;
  $('walk-pause').textContent = '⏸ Pause';

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animate(renderer.domElement, { opacity: [0.6, 1], duration: 500, ease: 'outCubic' });
  }
}

// --- CONTROLS BINDING ---
$('walk-start').onclick = start;
$('walk-pause').onclick = () => {
  paused = !paused;
  $('walk-pause').textContent = paused ? '▶ Resume' : '⏸ Pause';
};

$('walk-speed-toggle').onclick = () => {
  isRunMode = !isRunMode;
  currentSpeed = isRunMode ? SPEED_RUN : SPEED_WALK;
  $('walk-speed-toggle').textContent = isRunMode ? '🏃 Mode: Run (Sprint)' : '🚶 Mode: Walk (Gentle)';
  $('walk-speed-toggle').classList.toggle('active-mode', isRunMode);
};

$('walk-camera').onclick = () => {
  cameraMode = (cameraMode + 1) % cameraPresets.length;
  $('walk-camera').textContent = cameraPresets[cameraMode].name;
};

$('walk-change').onclick = () => {
  running = false;
  removeActors();
  $('friend-setup').hidden = false;
  $('walk-controls').hidden = true;
};

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// --- MAIN LOOP ---
const clock = new THREE.Clock();
const targetZenith = new THREE.Color();
const targetHorizon = new THREE.Color();
const targetGlow = new THREE.Color();
const targetSun = new THREE.Color();
const targetFog = new THREE.Color();
const targetGround = new THREE.Color();
const targetRoad = new THREE.Color();
const targetTrim = new THREE.Color();
const targetMountain = new THREE.Color();
const targetMountainHigh = new THREE.Color();

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.08);

  if (running && !paused) {
    time += dt;
    distance += currentSpeed * dt;
    $('walk-distance').textContent = `${Math.floor(distance)} m`;

    // 1. Calculate active biome (each biome lasts 90 meters)
    const newBiomeIdx = Math.floor(distance / 90) % BIOME_CHAPTERS.length;
    if (newBiomeIdx !== currentBiomeIdx) {
      currentBiomeIdx = newBiomeIdx;
      const b = BIOME_CHAPTERS[currentBiomeIdx];
      $('walk-world-badge').textContent = b.name;
      showBiomeToast(b.name);
      updateHorizonShape(b.mountainShape);
    }

    const activeBiome = BIOME_CHAPTERS[currentBiomeIdx];

    // 2. Smoothly interpolate atmospheric colors (lerp)
    const lerpRate = dt * 2.2;
    targetZenith.setHex(activeBiome.zenith);
    targetHorizon.setHex(activeBiome.horizon);
    targetGlow.setHex(activeBiome.glow);
    targetSun.setHex(activeBiome.sun);
    targetFog.setHex(activeBiome.fog);
    targetGround.setHex(activeBiome.ground);
    targetRoad.setHex(activeBiome.road);
    targetTrim.setHex(activeBiome.trim);
    targetMountain.setHex(activeBiome.mountain);
    targetMountainHigh.setHex(activeBiome.mountainHigh);

    currentZenith.lerp(targetZenith, lerpRate);
    currentHorizon.lerp(targetHorizon, lerpRate);
    currentGlow.lerp(targetGlow, lerpRate);
    currentSun.lerp(targetSun, lerpRate);
    currentFog.lerp(targetFog, lerpRate);
    currentGround.lerp(targetGround, lerpRate);
    currentRoad.lerp(targetRoad, lerpRate);
    currentTrim.lerp(targetTrim, lerpRate);
    currentMountain.lerp(targetMountain, lerpRate);
    currentMountainHigh.lerp(targetMountainHigh, lerpRate);

    // Apply interpolated colors to sky, fog, lights, materials
    skyUniforms.uZenith.value.copy(currentZenith);
    skyUniforms.uHorizon.value.copy(currentHorizon);
    skyUniforms.uGroundGlow.value.copy(currentGlow);
    skyUniforms.uSunColor.value.copy(currentSun);
    skyUniforms.uTime.value = time;

    scene.fog.color.copy(currentFog);
    renderer.setClearColor(currentFog);
    sunlight.color.copy(currentSun);

    groundMat.color.copy(currentGround);
    roadMat.color.copy(currentRoad);
    trimMat.color.copy(currentTrim);
    horizonMaterials[0].color.copy(currentMountain);
    horizonMaterials[1].color.copy(currentMountainHigh);

    // 3. Animate actors (stride rate scales naturally with walking vs running)
    const strideSpeed = isRunMode ? 1.65 : 0.75;
    for (const actor of actors) {
      animateAnimal(actor, time * strideSpeed, true, isRunMode);
      alignAnimalFeetToRoad(actor, 0);
      actor.group.position.z = 3;
      actor.group.rotation.y = cameraMode === 1 ? 0 : Math.PI; // Face camera in selfie mode
      if (isRunMode) {
        actor.group.rotation.x = cameraMode === 1 ? -0.1 : 0.1; // Forward lean while running
      } else {
        actor.group.rotation.x = 0;
      }
    }

    // 4. Move Layer 2 (Road & roadside scenery rushing past towards camera)
    for (const g of segments) {
      g.position.z += dt * currentSpeed;
      if (g.position.z > 24) {
        const smallestZ = Math.min(...segments.map(s => s.position.z));
        g.position.z = smallestZ - SEGMENT_SPACING;
        g.userData.index += segments.length;
        fillSegment(g, g.userData.index);
      }
    }

    // 5. Move Layer 1 (Standing horizon mountains: very slow parallax drift)
    horizonGroup.position.z = 0;
    horizonGroup.position.x = Math.sin(time * 0.08) * 1.5;
  }

  // Camera positioning & update
  const preset = cameraPresets[cameraMode];
  camera.position.set(preset.pos[0], preset.pos[1], preset.pos[2]);
  camera.lookAt(preset.target[0], preset.target[1], preset.target[2]);

  // Keep sky dome anchored to camera
  sky.position.copy(camera.position);

  renderer.render(scene, camera);
}

frame();
