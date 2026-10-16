import * as THREE from 'three';
import {loopZ} from './worldMotion.js';
import {createWorldStory} from './worldStories.js';

// The Unicorn Skyland has its own lightweight, looping fantasy scenery.
// Crystals and stardust are instanced, while floating islands share geometry.
export const SKYLAND_STRIPS=4;
export const SKYLAND_STRIP_LENGTH=54;
export const CRYSTALS_PER_STRIP=24;
export const SPARKLES_PER_STRIP=62;
const noise=(n)=>{const t=Math.sin(n*127.1+31.79)*43758.5453123;return t-Math.floor(t);};

export function createSkylandDetails(scene){
 const root=new THREE.Group();root.name='ula-rainbow-skyland';scene.add(root);
 const shapes={
  prism:new THREE.ConeGeometry(1,1,5),
  pebble:new THREE.IcosahedronGeometry(1,1),
  star:new THREE.OctahedronGeometry(1,0),
  puff:new THREE.SphereGeometry(1,10,7),
  island:new THREE.CylinderGeometry(1,.58,1,9)
 };
 const colors=[0xb5a0ff,0xffa7e3,0x9aeaff];
 const materials={
  prisms:colors.map(c=>new THREE.MeshStandardMaterial({
   color:c,roughness:.22,metalness:.12,emissive:c,emissiveIntensity:.24,
   flatShading:true
  })),
  stars:new THREE.MeshBasicMaterial({color:0xfff8dd,transparent:true,opacity:.87,depthWrite:false}),
  pebbles:new THREE.MeshStandardMaterial({color:0xd4b1f4,roughness:.66,flatShading:true}),
  upper:new THREE.MeshLambertMaterial({color:0xffe1f7}),
  lower:new THREE.MeshLambertMaterial({color:0x9d81d0}),
  cloud:new THREE.MeshLambertMaterial({color:0xffefff}),
  foam:new THREE.MeshLambertMaterial({color:0xdce9ff})
 };
 const dummy=new THREE.Object3D();
 const set=(mesh,i,x,y,z,sx,sy,sz,rz=0)=>{
  dummy.position.set(x,y,z);
  dummy.rotation.set(0,0,rz);
  dummy.scale.set(sx,sy,sz);
  dummy.updateMatrix();
  mesh.setMatrixAt(i,dummy.matrix);
 };
 const strips=[],cloudClusters=[];
 for(let tileIndex=0;tileIndex<SKYLAND_STRIPS;tileIndex++){
  const tile=new THREE.Group();tile.name='rainbow-crystal-strip-'+tileIndex;
  root.add(tile);strips.push(tile);
  const crystals=colors.map((_,i)=>new THREE.InstancedMesh(
   shapes.prism,materials.prisms[i],CRYSTALS_PER_STRIP
  ));
  const pebbles=new THREE.InstancedMesh(shapes.pebble,materials.pebbles,CRYSTALS_PER_STRIP);
  const stars=new THREE.InstancedMesh(shapes.star,materials.stars,SPARKLES_PER_STRIP);
  const counts=[0,0,0];
  for(let i=0;i<CRYSTALS_PER_STRIP;i++){
   const seed=tileIndex*10007+i*29.43;
   const side=i%2?-1:1;
   // x outside the 9-unit runner corridor, so these are safe scenery.
   const x=side*(6.05+noise(seed+2)*9.4);
   const z=-1.5-noise(seed+3)*(SKYLAND_STRIP_LENGTH-3);
   const h=1.5+noise(seed+4)*3.7;
   const r=.33+noise(seed+5)*.45;
   const color=i%3;
   set(crystals[color],counts[color]++,x,h*.52+.06,z,r,h,r,noise(seed+7)*.30);
   set(pebbles,i,x,.11,z,r*1.9,.28,r*1.65);
  }
  for(let i=0;i<3;i++){
   crystals[i].count=counts[i];
   crystals[i].frustumCulled=false;
   crystals[i].instanceMatrix.needsUpdate=true;
   tile.add(crystals[i]);
  }
  pebbles.frustumCulled=false;
  pebbles.instanceMatrix.needsUpdate=true;
  tile.add(pebbles);
  for(let i=0;i<SPARKLES_PER_STRIP;i++){
   const seed=tileIndex*9121+i*19.21;
   const side=i%2?-1:1;
   const x=side*(5.5+noise(seed+1)*14);
   const y=1+noise(seed+2)*9.8;
   const z=-noise(seed+3)*SKYLAND_STRIP_LENGTH;
   const size=.09+noise(seed+4)*.15;
   set(stars,i,x,y,z,size,size*1.6,size);
  }
  stars.frustumCulled=false;
  stars.instanceMatrix.needsUpdate=true;
  tile.add(stars);

  // Two tiny distant floating islands per tile create real parallax,
  // without placing unsupported geometry over the game lanes.
  for(let i=0;i<2;i++){
   const side=i%2?-1:1;
   const seed=tileIndex*291+i*73.41;
   const island=new THREE.Group();
   island.name='floating-pastel-island';
   island.position.set(side*(13+noise(seed+2)*8),8+noise(seed+5)*4,
     -10-i*24-noise(seed+3)*7);
   const rock=new THREE.Mesh(shapes.island,materials.lower);
   rock.scale.set(3.3,1.7,3.0);
   rock.rotation.z=.035*side;
   island.add(rock);
   const cap=new THREE.Mesh(shapes.puff,materials.upper);
   cap.scale.set(3.7,.42,3.3);
   cap.position.y=.95;
   island.add(cap);
   for(let j=0;j<4;j++){
    const puff=new THREE.Mesh(shapes.puff,j%2===0?materials.cloud:materials.foam);
    puff.scale.set(.86+j*.13,.45,.92);
    puff.position.set((j-1.5)*1.43,1.15+(j%2)*.19,0);
    island.add(puff);
   }
   tile.add(island);cloudClusters.push({island,seed});
  }
 }
 const story=createWorldStory(strips,'rainbow',SKYLAND_STRIP_LENGTH);
 function update(distance=0,time=0){
  for(let i=0;i<strips.length;i++)
   strips[i].position.z=loopZ(i,SKYLAND_STRIP_LENGTH,Math.max(0,distance),SKYLAND_STRIPS,14);
  story.update(distance);
  // No per-frame allocation or geometry rebuild.
  for(const c of cloudClusters){
   c.island.position.y=9.0+noise(c.seed+5)*3+Math.sin(time*.55+c.seed)*.26;
   c.island.rotation.y=Math.sin(time*.2+c.seed)*.025;
  }
 }
 function dispose(){
  story.dispose();
  scene.remove(root);
  for(const mesh of Object.values(shapes))mesh.dispose();
  for(const material of [...materials.prisms,...Object.entries(materials)
    .filter(([name])=>name!=='prisms').map(([,value])=>value)])material.dispose();
 }
 update(0);
 return {root,strips,story,update,dispose};
}
