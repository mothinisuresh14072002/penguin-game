import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Put exported GLB files in public/models/. Missing or invalid models fall back
// to the existing procedural animal rather than breaking either game mode.
export const CHARACTER_ASSETS = Object.freeze({
  bunny: 'models/bunny.glb'
});

const loader = new GLTFLoader();
const preflight = new Map();

export function animalAssetUrl(id) {
  const relative = CHARACTER_ASSETS[id];
  return relative ? (import.meta.env.BASE_URL || '/') + relative : null;
}

// A real downloaded GLB can have arbitrary units/origins. Normalize it once
// to the ~2.5 unit tall characters expected by collision/camera coordinates.
export function fitImportedCharacter(object, targetHeight = 2.55) {
  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y < 0.00001) {
    throw new Error('Model has no usable vertical bounds');
  }
  const factor = targetHeight / size.y;
  object.scale.multiplyScalar(factor);
  // Recompute bounds in world units so feet land at y=0 and the character
  // remains centred on its lane regardless of its export's coordinates.
  const fitted = new THREE.Box3().setFromObject(object);
  const center = fitted.getCenter(new THREE.Vector3());
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= fitted.min.y;
  return object;
}

export async function loadImportedAnimal(id) {
  const url=animalAssetUrl(id);
  if (!url) return null;
  try {
    let checked=preflight.get(url);
    if (!checked) {
      checked=fetch(url,{method:'HEAD'}).then(r=>r.ok).catch(()=>false);
      preflight.set(url,checked);
    }
    if (!await checked) return null;
    const gltf=await loader.loadAsync(url);
    const group=new THREE.Group();
    const visual=new THREE.Group();
    group.name='imported-'+id;
    group.add(visual);
    visual.add(gltf.scene);
    fitImportedCharacter(gltf.scene);
    let meshCount=0;
    gltf.scene.traverse(o=>{
      if (o.isMesh) {
        meshCount++;
        o.castShadow=true;
        o.receiveShadow=true;
        // Meshy exports without material/texture should render white instead
        // of disappearing or looking uniformly dark.
        if (!o.material) o.material=new THREE.MeshStandardMaterial({color:0xfff7f2,roughness:.82});
      }
    });
    if (!meshCount) throw new Error('GLB contains no meshes');
    const mixer=gltf.animations?.length ? new THREE.AnimationMixer(gltf.scene) : null;
    if(mixer) mixer.clipAction(gltf.animations[0]).play();
    return {
      group,visual,mixer,imported:true,
      pivotL:new THREE.Group(),pivotR:new THREE.Group(),
      feet:[],ears:[],face:null,tail:null,
      update(dt,clock,moving,airborne){
        if(mixer) mixer.update(moving?dt:0);
        else {
          // The supplied GLB has no rig/animations. A gentle bouncing pose
          // is a visual placeholder until a rigged version is exported.
          visual.position.y=moving&&!airborne?Math.abs(Math.sin(clock*12))*.065:0;
          visual.rotation.z=moving?Math.sin(clock*12)*.028:0;
          visual.rotation.x=airborne?-.09:0;
        }
      }
    };
  } catch (e) {
    console.warn('Could not load '+id+' GLB; using 3D fallback.',e);
    return null;
  }
}

export function releaseImportedAnimal(actor) {
  if (!actor?.imported) return;
  if (actor.mixer) {
    actor.mixer.stopAllAction();
    actor.mixer.uncacheRoot(actor.visual);
  }
  const geometries=new Set(),materials=new Set();
  actor.group.traverse(o=>{
    if (!o.isMesh) return;
    if(o.geometry)geometries.add(o.geometry);
    for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materials.add(m);
  });
  for(const g of geometries)g.dispose();
  for(const m of materials)m.dispose();
}
