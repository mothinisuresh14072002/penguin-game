import * as THREE from 'three';
import {loopZ} from './worldMotion.js';
import {createWorldStory} from './worldStories.js';

// Coco Cat's moving pastel town: reusable 3D facades, flower boxes, glowing
// lanterns and street details. No model downloads or per-frame mesh creation.
// Everything is instanced and kept outside the nine-unit running corridor.
export const TOWN_STRIPS=4;
export const TOWN_STRIP_LENGTH=54;
export const HOUSES_PER_STRIP=8;
const random=n=>{const x=Math.sin(n*127.1+33.47)*43758.5453;return x-Math.floor(x);};

export function createTownDetails(scene){
 const root=new THREE.Group();
 root.name='coco-pastel-cat-town';
 scene.add(root);
 const geometry={
  facade:new THREE.BoxGeometry(1,1,1),
  roof:new THREE.ConeGeometry(1,1,4),
  window:new THREE.BoxGeometry(1,1,1),
  frame:new THREE.BoxGeometry(1,1,1),
  flower:new THREE.IcosahedronGeometry(1,0),
  post:new THREE.CylinderGeometry(.07,.11,1,8),
  lamp:new THREE.SphereGeometry(1,10,7)
 };
 const mats={
  wall:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.78,metalness:0}),
  roof:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.72,metalness:0}),
  window:new THREE.MeshStandardMaterial({color:0xb0dcec,roughness:.24,metalness:.05}),
  frame:new THREE.MeshLambertMaterial({color:0xfff2e6}),
  door:new THREE.MeshStandardMaterial({color:0x8d6e65,roughness:.76}),
  flower:new THREE.MeshLambertMaterial({color:0xffffff}),
  flowerbox:new THREE.MeshLambertMaterial({color:0xa16d5e}),
  post:new THREE.MeshStandardMaterial({color:0x686875,roughness:.7}),
  lamp:new THREE.MeshStandardMaterial({
   color:0xffefc7,emissive:0xffd6a1,emissiveIntensity:.36,roughness:.42
  }),
  curb:new THREE.MeshLambertMaterial({color:0xf4d6bd})
 };
 const palettes={
  walls:[0xffc5b7,0xffe6b4,0xbddbe9,0xe9bdda,0xd4dfbd,0xffd8c1],
  roofs:[0xc07e81,0x9fa4b9,0xb98aa1,0xc5a16d],
  flowers:[0xfaa2c1,0xffd38d,0xfaf6f3,0xc8a8ef,0x9cd9b5]
 };
 const dummy=new THREE.Object3D();
 const tone=new THREE.Color();
 function matrix(mesh,i,x,y,z,sx,sy,sz,rotation=0){
  dummy.position.set(x,y,z);
  dummy.rotation.set(0,rotation,0);
  dummy.scale.set(sx,sy,sz);
  dummy.updateMatrix();
  mesh.setMatrixAt(i,dummy.matrix);
 }
 function withColor(mesh,i,color){
  tone.setHex(color);
  mesh.setColorAt(i,tone);
 }
 const strips=[];
 for(let t=0;t<TOWN_STRIPS;t++){
  const tile=new THREE.Group();
  tile.name='cat-town-street-strip-'+t;
  root.add(tile);strips.push(tile);
  const facades=new THREE.InstancedMesh(geometry.facade,mats.wall,HOUSES_PER_STRIP);
  const roofs=new THREE.InstancedMesh(geometry.roof,mats.roof,HOUSES_PER_STRIP);
  const doors=new THREE.InstancedMesh(geometry.facade,mats.door,HOUSES_PER_STRIP);
  const windows=new THREE.InstancedMesh(geometry.window,mats.window,HOUSES_PER_STRIP*2);
  const frames=new THREE.InstancedMesh(geometry.frame,mats.frame,HOUSES_PER_STRIP*2);
  const flowerBoxes=new THREE.InstancedMesh(geometry.frame,mats.flowerbox,HOUSES_PER_STRIP*2);
  const flowers=new THREE.InstancedMesh(geometry.flower,mats.flower,HOUSES_PER_STRIP*2*4);
  const posts=new THREE.InstancedMesh(geometry.post,mats.post,6);
  const lamps=new THREE.InstancedMesh(geometry.lamp,mats.lamp,6);
  const curbs=new THREE.InstancedMesh(geometry.facade,mats.curb,24);
  for(let i=0;i<HOUSES_PER_STRIP;i++){
   const seed=t*1093+i*71.17;
   const side=i%2===0?-1:1;
   const z=-3-Math.floor(i/2)*12.3-random(seed+1)*3;
   const x=side*(10.9+random(seed+2)*2.5);
   const height=3.8+random(seed+3)*2.05;
   const width=3.35+random(seed+4)*.9;
   matrix(facades,i,x,height*.5,z,width,height,3.2);
   withColor(facades,i,palettes.walls[(i+t)%palettes.walls.length]);
   matrix(roofs,i,x,height+1.0,z,2.58,2.05,2.58,Math.PI/4);
   withColor(roofs,i,palettes.roofs[(i+t)%palettes.roofs.length]);
   const front=z+1.65;
   matrix(doors,i,x,.95,front+.10,.76,1.90,.11);
   for(let k=0;k<2;k++){
    const wx=x+(k?1:-1)*.91;
    const wy=height*.66;
    const index=i*2+k;
    matrix(frames,index,wx,wy,front+.13,.89,1.07,.10);
    matrix(windows,index,wx,wy,front+.20,.67,.85,.08);
    matrix(flowerBoxes,index,wx,wy-.61,front+.42,.93,.20,.43);
    for(let j=0;j<4;j++){
     const flowerIndex=index*4+j;
     const fx=wx+(j-1.5)*.195;
     matrix(flowers,flowerIndex,fx,wy-.41+(j%2)*.05,front+.45,
      .14,.14,.14);
     withColor(flowers,flowerIndex,palettes.flowers[(i+k+j+t)%palettes.flowers.length]);
    }
   }
  }
  // Decorative vintage street lamps and warm light bulbs: no hitboxes.
  for(let i=0;i<6;i++){
   const side=i%2===0?-1:1,z=-4-Math.floor(i/2)*17.3;
   const x=side*(5.85+random(t*67+i)*.3);
   matrix(posts,i,x,1.57,z,.95,3.14,.95);
   matrix(lamps,i,x,3.20,z,.34,.42,.34);
  }
  for(let i=0;i<24;i++){
   const side=i%2===0?-1:1;
   const x=side*4.86;
   const z=-1-Math.floor(i/2)*4.3;
   matrix(curbs,i,x,.24,z,.20,.18,2.8);
  }
  for(const mesh of [facades,roofs,doors,windows,frames,flowerBoxes,flowers,posts,lamps,curbs]){
   mesh.frustumCulled=false;
   mesh.instanceMatrix.needsUpdate=true;
   if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
   tile.add(mesh);
  }
 }
 const story=createWorldStory(strips,'city',TOWN_STRIP_LENGTH);
 function update(distance=0,time=0){
  for(let i=0;i<strips.length;i++)
   strips[i].position.z=loopZ(i,TOWN_STRIP_LENGTH,Math.max(0,distance),TOWN_STRIPS,14);
  story.update(distance);
  mats.lamp.emissiveIntensity=.30+Math.sin(time*1.8)*.055;
 }
 function dispose(){
  story.dispose();
  scene.remove(root);
  for(const item of Object.values(geometry))item.dispose();
  for(const item of Object.values(mats))item.dispose();
 }
 update(0);
 return {root,strips,story,update,dispose};
}
