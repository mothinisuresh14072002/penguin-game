import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// Put exported GLB files in public/models/. Missing or invalid models fall back
// to the existing procedural animal rather than breaking either game mode.
// All seven heroes support authored, painted / rigged 3D model overrides.
// Filenames are intentionally fixed: only assets the project owner installs
// under public/models/ will load; no unlicensed third-party URLs.
export const CHARACTER_ASSETS = Object.freeze({
  bunny: 'models/bunny.glb',
  unicorn: 'models/unicorn.glb',
  horse: 'models/horse.glb',
  cat: 'models/cat.glb',
  dog: 'models/dog.glb',
  penguin: 'models/penguin.glb',
  cow: 'models/cow.glb'
});

// GLB files optimized with glTF-Transform use EXT_meshopt_compression.
// Three.js bundles the meshoptimizer decoder — no second runtime dependency.
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const preflight = new Map();

export function animalAssetUrl(id) {
  const relative = CHARACTER_ASSETS[id];
  return relative ? (import.meta.env?.BASE_URL || '/') + relative : null;
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

// Real production models often store more than one animation clip.
// Prefer an actual run/trot, distinct jump and idle instead of blindly playing
// the first clip (which is often 'Idle') throughout the entire run.
export function selectAnimalClips(clips=[]){
 const get=(pattern)=>clips.find(clip=>pattern.test(clip.name||''));
 return {
  run:get(/run|jog|sprint|trot|hop|gallop/i)||
      get(/walk|locomotion|move/i)||clips[0]||null,
  idle:get(/idle|stand|breath|rest/i)||null,
  jump:get(/jump|leap|hop_up/i)||null
 };
}

// A shape-only Meshy download can technically load but will render plain
// white. Prefer our colourful articulated game character until the model
// contains baked colours, multiple painted materials, or texture maps.
export function hasPaintedAppearance(root) {
 const colors=new Set();
 let textured=false;
 root.traverse(object=>{
  if(!object.isMesh)return;
  if(object.geometry?.getAttribute('color'))textured=true;
  for(const material of Array.isArray(object.material)?object.material:[object.material]){
   if(!material)continue;
   if(material.map||material.vertexColors)textured=true;
   if(material.color)colors.add(material.color.getHexString());
  }
 });
 return textured||colors.size>=3;
}

export async function loadImportedAnimal(id) {
  const url=animalAssetUrl(id);
  if (!url) return null;
  try {
    // Prefer optimized GLBs, but keep existing authored files as a fallback.
    // Optimized assets use the same names inside public/models/optimized/.
    const optimizedUrl=url.replace('/models/','/models/optimized/');
    const exists=async candidate=>{
      if(!preflight.has(candidate))preflight.set(candidate,fetch(candidate,{method:'HEAD'}).then(r=>r.ok).catch(()=>false));
      return preflight.get(candidate);
    };
    const selected=await exists(optimizedUrl)?optimizedUrl:await exists(url)?url:null;
    if(!selected)return null;
    const gltf=await loader.loadAsync(selected);
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
    if (!hasPaintedAppearance(gltf.scene)) {
      console.info('Skipping uncoloured '+id+' GLB; using colourful procedural character.');
      const geometries=new Set(),materials=new Set();
      gltf.scene.traverse(o=>{
        if(!o.isMesh)return;
        if(o.geometry)geometries.add(o.geometry);
        for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materials.add(m);
      });
      for(const g of geometries)g.dispose();
      for(const m of materials)m.dispose();
      return null;
    }
    const mixer=gltf.animations?.length ? new THREE.AnimationMixer(gltf.scene) : null;
    const selectedClips=selectAnimalClips(gltf.animations||[]);
    const actions=mixer ? {
      run:selectedClips.run?mixer.clipAction(selectedClips.run):null,
      idle:selectedClips.idle?mixer.clipAction(selectedClips.idle):null,
      jump:selectedClips.jump?mixer.clipAction(selectedClips.jump):null
    } : null;
    let activeAction=null;
    function changeAction(next){
      if(!next||next===activeAction)return;
      if(activeAction)activeAction.fadeOut(.17);
      next.reset().fadeIn(.17).play();
      activeAction=next;
    }
    if(actions)changeAction(actions.idle||actions.run);
    return {
      group,visual,mixer,imported:true,
      pivotL:new THREE.Group(),pivotR:new THREE.Group(),
      feet:[],ears:[],face:null,tail:null,
      update(dt,clock,moving,airborne){
        if(mixer){
          const desired=airborne?(actions.jump||actions.run):
            moving?(actions.run||actions.idle):(actions.idle||actions.run);
          changeAction(desired);
          mixer.update(Math.max(0,dt));
        }else{
          // The GLB has no rig/animation clips; gently bob until a rigged
          // version is exported instead of implying full running animation.
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
    actor.mixer.uncacheRoot(actor.visual.children[0]);
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
