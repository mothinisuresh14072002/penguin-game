import * as THREE from 'three';
import {createAnimal} from './animalArt.js';

// Renders the SAME 3D models used in the game into compact shop thumbnails.
// Falls back to the emoji selector if WebGL preview rendering is unavailable.
export function renderCharacterPreviews(characters, biomes){
 const previews=new Map();
 let renderer;
 try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
  renderer.setSize(180,200,false);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.37;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(46,180/200,.1,70);
  camera.position.set(0,2.05,6.4);
  camera.lookAt(0,1.62,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x7992b8,3.2));
  const key=new THREE.DirectionalLight(0xfff2df,3.8);key.position.set(-4,7,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0x9ddcff,2.7);rim.position.set(4,5,-3);scene.add(rim);
  const standGeo=new THREE.CylinderGeometry(1.05,1.18,.18,32);
  const standMat=new THREE.MeshStandardMaterial({color:0xf3fbff,roughness:.7});
  const stand=new THREE.Mesh(standGeo,standMat);stand.position.y=-.07;scene.add(stand);
  for(const c of characters){
   const actor=createAnimal(c.id);
   actor.group.rotation.y=-.18;
   actor.group.position.y=0;
   scene.add(actor.group);
   scene.background=new THREE.Color(biomes[c.biome]?.sky??0xc2e5f5);
   renderer.render(scene,camera);
   previews.set(c.id,renderer.domElement.toDataURL('image/png'));
   scene.remove(actor.group);
   const geo=new Set(),mats=new Set();
   actor.group.traverse(o=>{
    if(!o.isMesh)return;
    if(o.geometry)geo.add(o.geometry);
    const mm=Array.isArray(o.material)?o.material:[o.material];
    for(const x of mm)if(x)mats.add(x);
   });
   for(const g of geo)g.dispose();
   for(const m of mats)m.dispose();
  }
  standGeo.dispose();standMat.dispose();
 }catch(error){
  console.warn('Character previews unavailable; using emoji fallback.',error);
 }finally{
  if(renderer){renderer.dispose();renderer.forceContextLoss();}
 }
 return previews;
}
