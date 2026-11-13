import * as THREE from 'three';

// Side terrain is a real textured 3D surface. Recycled with the same road
// segments, it keeps the landscape continuous without creating geometry each
// frame. Instanced grass adds depth at low draw-call cost.
export const TERRAIN_THEMES = Object.freeze({
  meadow:   {base:'#6f9d59',light:'#a7cb78',dark:'#527d49',foliage:0x69b96d,mode:'grass'},
  rainbow:  {base:'#bba5df',light:'#f1dcff',dark:'#9279c4',foliage:0xc6a1f0,mode:'crystal'},
  grassland:{base:'#9baa62',light:'#d8c27d',dark:'#687e49',foliage:0x91ad55,mode:'grass'},
  city:     {base:'#a99a8d',light:'#dfc4a8',dark:'#81756f',foliage:0x819b78,mode:'stone'},
  park:     {base:'#67965f',light:'#b8d58b',dark:'#4a774e',foliage:0x56a76a,mode:'grass'},
  arctic:   {base:'#9bcbdc',light:'#effcff',dark:'#5c9fb8',foliage:0x91d9ee,mode:'ice'},
  farm:     {base:'#899e5e',light:'#d9c18a',dark:'#687b48',foliage:0x9ab653,mode:'grass'}
});

export function terrainThemeFor(id) {
  return TERRAIN_THEMES[id] || TERRAIN_THEMES.meadow;
}

export function terrainSeed(value) {
  const n = Math.sin((Number(value) || 0) * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function paintTerrain(ctx, id, size = 512) {
  const theme = terrainThemeFor(id);
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = theme.base;
  ctx.fillRect(0, 0, size, size);

  // Soft, irregular mineral/soil flecks stop the ground reading as a flat
  // coloured plane. The fixed seed makes the texture stable between runs.
  for (let i = 0; i < 520; i++) {
    const x = terrainSeed(i * 7 + id.length * 13) * size;
    const y = terrainSeed(i * 19 + id.length * 31) * size;
    const radius = 1.2 + terrainSeed(i * 29) * (id === 'arctic' ? 5 : 3.5);
    ctx.globalAlpha = .12 + terrainSeed(i * 41) * .18;
    ctx.fillStyle = i % 3 ? theme.light : theme.dark;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 1.7, radius, terrainSeed(i * 5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (theme.mode === 'stone') {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 7; col++) {
        const x = col * 78 + (row % 2) * 38 + 3;
        const y = row * 62 + 3;
        ctx.fillStyle = (row + col) % 3 ? theme.light : theme.dark;
        ctx.globalAlpha = .23;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, 68, 52, 9);
        else ctx.rect(x, y, 68, 52);
        ctx.fill();
      }
    }
  } else if (theme.mode === 'ice') {
    ctx.strokeStyle = 'rgba(244,255,255,.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 22; i++) {
      const x = terrainSeed(i * 11) * size;
      const y = terrainSeed(i * 17 + 3) * size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 24 + terrainSeed(i) * 45, y - 14 - terrainSeed(i + 8) * 28);
      ctx.lineTo(x + 58 + terrainSeed(i + 9) * 30, y - 7);
      ctx.stroke();
    }
  } else if (theme.mode === 'crystal') {
    for (let i = 0; i < 40; i++) {
      const x = terrainSeed(i * 13) * size;
      const y = terrainSeed(i * 23) * size;
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.32)' : 'rgba(255,210,255,.28)';
      ctx.beginPath();
      ctx.arc(x, y, 2 + terrainSeed(i * 31) * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Fine grass strokes in the albedo texture complement the instanced 3D
    // blades instead of trying to replace them.
    ctx.strokeStyle = theme.light;
    ctx.globalAlpha = .22;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 170; i++) {
      const x = terrainSeed(i * 3 + 4) * size;
      const y = terrainSeed(i * 7 + 6) * size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (terrainSeed(i * 9) - .5) * 7, y - 3 - terrainSeed(i * 15) * 7);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function makeGrassGeometry() {
  const geometry = new THREE.BufferGeometry();
  // Two crossed, tapered blades form a tiny low-poly tuft.
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -.055,0,0, .055,0,0, 0,.46,0,
    0,0,-.055, 0,0,.055, 0,.38,0
  ], 3));
  geometry.computeVertexNormals();
  return geometry;
}

function populateGrass(instances, segmentIndex, materialColor) {
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < instances.count; i++) {
    const seed = segmentIndex * 101 + i + 1;
    const side = terrainSeed(seed) < .5 ? -1 : 1;
    const x = side * (5.3 + terrainSeed(seed * 3) * 32);
    const z = -8.4 + terrainSeed(seed * 5) * 16.8;
    const scale = .55 + terrainSeed(seed * 7) * .9;
    dummy.position.set(x, .15, z);
    dummy.rotation.set(0, terrainSeed(seed * 11) * Math.PI, 0);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    instances.setMatrixAt(i, dummy.matrix);
    color.setHex(materialColor).offsetHSL((terrainSeed(seed * 13) - .5) * .08, 0, (terrainSeed(seed * 17) - .5) * .12);
    instances.setColorAt(i, color);
  }
  instances.instanceMatrix.needsUpdate = true;
  if (instances.instanceColor) instances.instanceColor.needsUpdate = true;
}

export function createWorldEnvironment(segments, initialBiome = 'meadow', {anisotropy = 4} = {}) {
  const geometry = new THREE.PlaneGeometry(85, 18, 1, 1);
  const grassGeometry = makeGrassGeometry();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 2);
  texture.anisotropy = Math.max(1, anisotropy);

  const terrainMaterial = new THREE.MeshStandardMaterial({
    map: texture, bumpMap: texture, bumpScale: .025,
    roughness: .96, metalness: 0
  });
  const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 1, metalness: 0,
    vertexColors: true, side: THREE.DoubleSide
  });
  let windShader = null;
  grassMaterial.onBeforeCompile = shader => {
    shader.uniforms.uPawverseWindTime = {value: 0};
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uPawverseWindTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float pawverseWind = sin(uPawverseWindTime * 1.35 + instanceMatrix[3].x * .19 + instanceMatrix[3].z * .27);
        transformed.x += pawverseWind * max(position.y, 0.0) * .055;`);
    windShader = shader;
  };
  grassMaterial.customProgramCacheKey = () => 'pawverse-instanced-grass-wind-v1';

  const grassInstances = [];
  const terrainMeshes = [];
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const terrain = new THREE.Mesh(geometry, terrainMaterial);
    terrain.name = 'textured-side-terrain';
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = .145;
    terrain.receiveShadow = true;
    terrain.frustumCulled = false;
    segment.add(terrain);
    terrainMeshes.push(terrain);

    const grass = new THREE.InstancedMesh(grassGeometry, grassMaterial, 48);
    grass.name = 'instanced-world-grass';
    grass.frustumCulled = false;
    grass.castShadow = false;
    grass.receiveShadow = true;
    segment.add(grass);
    grassInstances.push(grass);
  }

  let activeBiome = null;
  function setBiome(id) {
    const key = TERRAIN_THEMES[id] ? id : 'meadow';
    const theme = terrainThemeFor(key);
    paintTerrain(canvas.getContext('2d'), key, 512);
    texture.needsUpdate = true;
    terrainMaterial.roughness = key === 'arctic' || key === 'rainbow' ? .34 : .96;
    terrainMaterial.metalness = key === 'arctic' ? .08 : 0;
    terrainMaterial.bumpScale = key === 'arctic' ? .012 : .025;
    grassMaterial.color.setHex(theme.foliage);
    grassMaterial.visible = theme.mode === 'grass' || theme.mode === 'crystal';
    for (let i = 0; i < grassInstances.length; i++) {
      grassInstances[i].visible = grassMaterial.visible;
      populateGrass(grassInstances[i], i, theme.foliage);
    }
    activeBiome = key;
    return key;
  }

  function update(time = 0) {
    if (windShader) windShader.uniforms.uPawverseWindTime.value = Number(time) || 0;
  }

  function dispose() {
    for (const mesh of terrainMeshes) mesh.parent?.remove(mesh);
    for (const mesh of grassInstances) mesh.parent?.remove(mesh);
    geometry.dispose();
    grassGeometry.dispose();
    terrainMaterial.dispose();
    grassMaterial.dispose();
    texture.dispose();
  }

  setBiome(initialBiome);
  return {setBiome, update, dispose, get biome() {return activeBiome;}, terrainMeshes, grassInstances};
}
