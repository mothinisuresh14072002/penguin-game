import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Small, curated Polyfork environment selections. These are loaded from the
// official GLB CDN at runtime; the catalogue/model files are not copied into
// this repository. Each biome loads only two prop types, then reuses clones.
export const POLYFORK_BIOME_ASSETS = Object.freeze({
  meadow:   [{id:'birch-tree-181b33',height:6.2},{id:'broadleaf-oak-997c22',height:6.5}],
  rainbow:  [],
  grassland:[{id:'apple-tree-ef0ba0',height:5.8},{id:'corn-crop-b71f2f',height:3.2}],
  city:     [{id:'apartment-block-6445af',height:9.5},{id:'cherry-blossom-tree-3f7ab7',height:6.2}],
  park:     [{id:'broad-canopy-shade-tree-e7c4a2',height:6.3},{id:'backyard-doghouse-50a492',height:2.7}],
  arctic:   [{id:'alpine-chalet-47d59e',height:7.8},{id:'boulder-field-cluster-08e364',height:3.8}],
  farm:     [{id:'apple-tree-ef0ba0',height:5.8},{id:'farm-gate-8ab320',height:3.4}]
});

const loader = new GLTFLoader();
const assetCache = new Map();

function loadAsset(id) {
  if (!assetCache.has(id)) {
    const promise = loader.loadAsync('https://polyfork.dev/cdn/' + id + '.glb')
      .then(gltf => gltf.scene)
      .catch(error => {
        assetCache.delete(id);
        console.warn('Polyfork environment asset unavailable:', id, error);
        return null;
      });
    assetCache.set(id, promise);
  }
  return assetCache.get(id);
}

function fitProp(root, targetHeight) {
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y < .0001) throw new Error('Polyfork prop has invalid bounds');
  root.scale.multiplyScalar(targetHeight / size.y);
  const fitted = new THREE.Box3().setFromObject(root);
  const center = fitted.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= fitted.min.y;
  root.traverse(object => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  return root;
}

export function worldLoopZ(index, spacing, distance, count, front = 18) {
  if (!Number.isFinite(distance) || spacing <= 0 || count <= 0) return front;
  const period = spacing * count;
  const raw = index * spacing - distance + spacing;
  const wrapped = ((raw % period) + period) % period;
  return front + spacing - wrapped;
}

export function createPolyforkScenery(scene, initialBiome = 'meadow', {front = 18, spacing = 66} = {}) {
  let generation = 0;
  let activeGroup = new THREE.Group();
  activeGroup.name = 'polyfork-biome-scenery';
  scene.add(activeGroup);
  let entries = [];
  let activeBiome = null;

  async function setBiome(id) {
    const biome = POLYFORK_BIOME_ASSETS[id] ? id : 'meadow';
    if (biome === activeBiome) return true;
    const request = ++generation;
    const nextGroup = new THREE.Group();
    nextGroup.name = 'polyfork-' + biome + '-scenery';
    scene.add(nextGroup);
    const definitions = POLYFORK_BIOME_ASSETS[biome];
    const loaded = await Promise.all(definitions.map(async definition => ({
      definition,
      source: await loadAsset(definition.id)
    })));
    if (request !== generation) {
      scene.remove(nextGroup);
      return false;
    }

    const nextEntries = [];
    let index = 0;
    for (const {definition, source} of loaded) {
      if (!source) continue;
      for (let copy = 0; copy < 2; copy++) {
        const root = source.clone(true);
        try {
          fitProp(root, definition.height);
        } catch {
          continue;
        }
        const holder = new THREE.Group();
        holder.add(root);
        holder.position.x = (index % 2 === 0 ? -1 : 1) * (13 + (copy % 2) * 5);
        holder.position.z = worldLoopZ(index, spacing, 0, Math.max(1, definitions.length * 2), front);
        nextGroup.add(holder);
        nextEntries.push({holder,index});
        index++;
      }
    }

    scene.remove(activeGroup);
    activeGroup = nextGroup;
    entries = nextEntries;
    activeBiome = biome;
    return true;
  }

  function update(distance = 0) {
    const count = Math.max(1, entries.length);
    for (const entry of entries) {
      entry.holder.position.z = worldLoopZ(entry.index, spacing, distance, count, front);
    }
  }

  function dispose() {
    generation++;
    scene.remove(activeGroup);
    entries = [];
  }

  setBiome(initialBiome);
  return {setBiome, update, dispose, get biome() {return activeBiome;}, get count() {return entries.length;}};
}
