---
name: threejs-dynamic-world
description: Comprehensive Three.js skill for building dynamic walking and running worlds with animated characters, multi-tier parallax backgrounds (stationary stands vs scrolling runners), continuous biome/environmental evolution, Rapier physics/controllers, and performance-optimized rendering. Synthesizes CloudAI-X, emalorenzo, bandinopla, and lemo-opuscar architectures.
license: MIT
metadata:
  version: "1.0.0"
  author: "Antigravity & Community"
  sources:
    - CloudAI-X/threejs-skills
    - emalorenzo/three-agent-skills
    - bandinopla/threejs-agent-game-starter
    - lemomo-ai/lemo-opuscar
---

# Three.js Dynamic World: Walking, Running & Streaming Environments

An end-to-end architectural guide and runtime pattern library for creating 3D animated walking/running experiences, endless runners, and cinematic code-driven journeys in Three.js.

---

## 1. Multi-Tier Parallax Architecture

To create the illusion of travelling forward through an expansive, living world while keeping coordinates stable and performant, structure scenes into **four discrete layers**:

```
[ Camera (z: ~12-16) ] ---> [ Character (z: 0-3) ]
                                |
                                v
--------------------------------------------------------------------------------
Layer 0: Stand (Speed: 0.00x)   | Infinite Sky Shader Dome, celestial bodies,
                                | static horizon silhouette (moves with camera only)
--------------------------------------------------------------------------------
Layer 1: Drift (Speed: ~0.08x)  | Distant mountain ranges, far ridges, high clouds,
                                | slowly parallaxing atmospheric landmarks
--------------------------------------------------------------------------------
Layer 2: Run   (Speed: 1.00x)   | Road/track plane, curbs, roadside props, trees,
                                | fences, streetlights, collectible items, hazards
--------------------------------------------------------------------------------
Layer 3: Actor (In-Place / Move)| Animated runner/walker with foot ground-alignment,
                                | bobbing head, accessories, and stride kinematics
--------------------------------------------------------------------------------
```

### Architectural Contracts
- **Layer 0 (Stand / Stationary)**:
  - Mesh follows `camera.position` directly in every frame (`sky.position.copy(camera.position)`).
  - Uses a spherical shader with `depthWrite: false`, `renderOrder: -100`.
  - Shader uniforms include `uTime`, `uZenith`, `uHorizon`, `uSunColor`, and `uGroundGlow`.
- **Layer 1 (Drift / Slow Parallax)**:
  - Moves at `speed * WORLD_LAYERS.far` (typically 5% to 10% of track speed).
  - Wraps around when exceeding viewing bounds, creating an unbreaking horizon line.
- **Layer 2 (Run / Ground Segments)**:
  - Composed of recycled segment chunks (`Z` spacing of 15–25 units).
  - When a segment passes behind the camera (`position.z > camera.z + margin`), it jumps to the front:
    `newZ = Math.min(...segments.map(s => s.position.z)) - segmentSpacing`.
  - Content on recycled chunks is repopulated according to the current distance/biome.

---

## 2. Dynamic World & Biome Evolution Engine

As the character walks or runs forward, the world should not repeat monotony: it must continuously evolve into new environments, biomes, and landmark themes.

### Continuous Morphing Recipe
1. **Chapter / Biome Map**:
   Define cyclical or story-driven chapters by travel distance (e.g., every 100–150m):
   ```js
   export const BIOME_PROGRESSION = [
     { id: 'meadow',   name: 'Blossom Meadow',    sky: 0x9cdcf9, fog: 0xe5f6ef, road: 0xffddba, ground: 0x83cb83 },
     { id: 'prairie',  name: 'Golden Prairie',    sky: 0x8ec9f8, fog: 0xfaedd5, road: 0xf5d996, ground: 0xa1cb74 },
     { id: 'town',     name: 'Pastel Village',    sky: 0xa4c6e9, fog: 0xd3dcf1, road: 0xece2d8, ground: 0xcbb9ae },
     { id: 'glacier',  name: 'Crystal Glade',     sky: 0x80caef, fog: 0xdcf4ff, road: 0xbbeef8, ground: 0xf0faff },
     { id: 'starlight',name: 'Starlight Valley',  sky: 0x221d47, fog: 0x483a69, road: 0x6e5296, ground: 0x352852 }
   ];
   ```

2. **Per-Frame Color Interpolation (Lerp)**:
   Avoid abrupt popping by smoothly interpolating sky uniforms, fog color, and lighting:
   ```js
   function updateAtmosphere(targetBiome, dt) {
     const t = Math.min(1, dt * 2.5);
     skyUniforms.uZenith.value.lerp(targetBiome.zenithColor, t);
     skyUniforms.uHorizon.value.lerp(targetBiome.horizonColor, t);
     scene.fog.color.lerp(targetBiome.fogColor, t);
     renderer.setClearColor(scene.fog.color);
     sunlight.color.lerp(targetBiome.sunColor, t);
   }
   ```

3. **Dynamic Landmark & Roadside Streaming**:
   When recycling a segment at `userData.index`, determine which architectural features to spawn based on `Math.floor(distance / chapterDistance)`.

---

## 3. Character Animation & Locomotion Kinematics

Whether using rigged GLTF characters (`SkeletonUtils.clone`) or stylized procedural meshes (cubes/spheres with soft bevels), natural walking and running follows core kinematic laws:

### Procedural Walking / Running Stride Math
```js
export function animateLocomotion(actor, time, speed, isWalking) {
  // Stride frequency scales with velocity
  const frequency = isWalking ? speed * 2.8 : speed * 4.2;
  const cycle = time * frequency;
  
  // 1. Vertical bounce & tilt
  const bounceHeight = isWalking ? 0.045 : 0.12;
  actor.root.position.y = Math.abs(Math.sin(cycle)) * bounceHeight;
  actor.root.rotation.z = Math.cos(cycle) * (isWalking ? 0.025 : 0.06);
  actor.root.rotation.x = isWalking ? 0.03 : 0.12; // Forward lean
  
  // 2. Leg swing (anti-phase)
  if (actor.leftLeg && actor.rightLeg) {
    actor.leftLeg.rotation.x = Math.sin(cycle) * (isWalking ? 0.45 : 0.95);
    actor.rightLeg.rotation.x = -Math.sin(cycle) * (isWalking ? 0.45 : 0.95);
  }
  
  // 3. Arm / wing swing (opposite to legs)
  if (actor.leftArm && actor.rightArm) {
    actor.leftArm.rotation.x = -Math.sin(cycle) * (isWalking ? 0.35 : 0.75);
    actor.rightArm.rotation.x = Math.sin(cycle) * (isWalking ? 0.35 : 0.75);
  }
}
```

### Foot-to-Road Contact Anchoring
Always compute ground height dynamically:
`const roadY = getRoadHeightAt(actor.position.z);`
`actor.root.position.y = roadY + actor.baseFootOffset + bounce;`

---

## 4. Performance & Memory Management (Zero-Garbage Loop)

Follow the strict performance standards established by Three.js core & emalorenzo:

1. **Zero Allocations in Tick Loops**:
   - Never do `new THREE.Vector3()`, `new THREE.Color()`, or `new THREE.Matrix4()` inside `requestAnimationFrame`.
   - Allocate module-scoped scratch objects:
     ```js
     const _v1 = new THREE.Vector3();
     const _v2 = new THREE.Vector3();
     const _color = new THREE.Color();
     ```
2. **Geometry and Material Sharing**:
   - Pre-allocate shared geometries: `BoxGeometry`, `SphereGeometry`, `CylinderGeometry`.
   - Reuse materials across all scenery segments. Use vertex colors or `InstancedMesh` with instance matrices and `setColorAt` when coloring hundreds of trees or flowers.
3. **Frustum & Depth Culling**:
   - Distant sky dome: `depthWrite: false`, `frustumCulled: false`.
   - Roadside props: enable `frustumCulled: true`.
4. **Lifecycle Disposal**:
   - Always traverse and dispose geometries, materials, and textures when switching scenes or removing actors:
     ```js
     function cleanGroup(group) {
       group.traverse(obj => {
         if (obj.geometry) obj.geometry.dispose();
         if (obj.material) {
           if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
           else obj.material.dispose();
         }
       });
     }
     ```

---

## 5. Asset Pipeline & GLB Optimization (Bandino / KTX2)

When adding or updating 3D character/prop models:
1. Place raw assets in `3d/<name>.glb`.
2. Run asset optimizer: `node optimize.js <name>` to compress geometry via Draco and textures via KTX2.
3. Packed output lands in `public/<name>.packed.glb`.
4. For multi-character spawning, always clone rigged models via `SkeletonUtils.clone(gltf.scene)` so armature skinning remains independent.
