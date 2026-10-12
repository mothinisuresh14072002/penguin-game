import * as THREE from 'three';
import {loopZ,layerTravel} from './worldMotion.js';

// Mid-distance travelling landmarks: a themed place approaches, slides past,
// and is reused far ahead. Distant mountains/sky stay stationary. The player
// sees different landmark combinations along each of the seven biomes.
export const JOURNEY_CHUNKS=4;
export const JOURNEY_SPACING=68;
const themes={
 meadow:{a:0x78bc68,b:0xffd7db,c:0xffedbc,roof:0xc99b80},
 rainbow:{a:0xb594f0,b:0x9be7f5,c:0xffc6ef,roof:0xffe2fb},
 grassland:{a:0xa4c46a,b:0xecc672,c:0xffdfa7,roof:0xa66d48},
 city:{a:0xffbdaf,b:0xc8d9f8,c:0xf4d09d,roof:0xc78b93},
 park:{a:0x6cb981,b:0xffd0ad,c:0xb5dce7,roof:0xc99a75},
 arctic:{a:0xa4e6f5,b:0xdbf7ff,c:0x81bfdc,roof:0xa4dded},
 farm:{a:0x8dbc72,b:0xf3ce70,c:0xecc19a,roof:0xb74c47}
};
export function createJourneyArt(scene,biome='meadow'){
 const style=themes[biome]||themes.meadow;
 const root=new THREE.Group();root.name='travelling-world-'+biome;scene.add(root);
 const shape={
  sphere:new THREE.SphereGeometry(1,11,8),
  cone:new THREE.ConeGeometry(1,1,7),
  box:new THREE.BoxGeometry(1,1,1),
  cylinder:new THREE.CylinderGeometry(1,1,1,8),
  torus:new THREE.TorusGeometry(1,.12,6,23,Math.PI)
 };
 const mats=new Map();
 const getMat=(c)=>{
  if(!mats.has(c))mats.set(c,new THREE.MeshLambertMaterial({color:c}));
  return mats.get(c);
 };
 function mesh(parent,key,color,x,y,z,w,h,d,rz=0){
  const o=new THREE.Mesh(shape[key],getMat(color));
  o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.z=rz;
  o.castShadow=false;o.receiveShadow=false;parent.add(o);
  return o;
 }
 const groups=[];
 for(let i=0;i<JOURNEY_CHUNKS;i++){
  const chunk=new THREE.Group();chunk.name='journey-place-'+i;
  root.add(chunk);groups.push(chunk);
  const x=i%2===0?-15:15;
  const variant=i%3;
  // Everything begins beyond +/- 10 in world X: never blocks a lane.
  for(const shift of [-5,5]){
   const xx=x+shift*.52;
   mesh(chunk,'cylinder',biome==='arctic'?0xd4eff8:0x947b5d,xx,1.5,0,.35,3.0,.35);
   if(biome==='arctic'){
    for(let k=0;k<3;k++)
     mesh(chunk,'cone',k%2?style.a:style.b,xx,2.1+k*.9,0,2.1-k*.3,3.2-k*.5,2.1-k*.3);
   }else if(biome==='rainbow'){
    for(let k=0;k<3;k++)
     mesh(chunk,'cone',[style.a,style.b,style.c][k],xx,2.5+k,0,1.2-k*.19,4.2-k*.55,1.2-k*.19);
   }else{
    mesh(chunk,'sphere',style.a,xx,3.7,0,1.75,1.4,1.5);
    mesh(chunk,'sphere',style.b,xx-.55,4.05,.6,.8,.65,.75);
    mesh(chunk,'sphere',style.a,xx+.75,3.85,-.4,.72,.62,.70);
   }
  }
  if(biome==='city'||biome==='farm'||biome==='grassland'){
   mesh(chunk,'box',biome==='farm'?0xc75f51:style.b,x,2.15,-5,4.0,4.3,3.6);
   mesh(chunk,'cone',style.roof,x,5.0,-5,3.0,2.0,3.0,Math.PI/4);
   for(const side of [-1,1])mesh(chunk,'box',0xe9f6ff,x+side*1.1,3,-3.08,.68,.9,.12);
  }else if(biome==='meadow'||biome==='park'){
   mesh(chunk,'sphere',style.a,x,1.0,-4.3,3.3,1.5,2.4);
   mesh(chunk,'sphere',style.b,x+(variant-1)*.6,1.72,-3.6,1.0,.76,1.1);
   for(let k=0;k<5;k++)mesh(chunk,'sphere',style.c,x-1.8+k*.85,.4,-2.65,.22,.2,.25);
  }else{
   mesh(chunk,'sphere',style.a,x,1.3,-4.3,2.4,1.5,2.0);
   mesh(chunk,'cone',style.b,x,4.5,-4.8,2.2,6.8,2.0);
   mesh(chunk,'cone',style.c,x+1.9,2.6,-4.2,1.1,4.0,1.1);
  }
  if(variant===1){
   for(let j=0;j<4;j++){
    const px=x-3.1+j*1.9;
    mesh(chunk,'sphere',style.c,px,.50,-8,.45,.45,.45);
   }
  }
 }
 function update(distance=0){
  // Grounded trees, buildings and flowers stay in the SAME physical
  // world coordinate system as the road; depth/perspective supplies the
  // apparent parallax instead of arbitrarily slowing anchored objects.
  const travel=layerTravel(distance,'track');
  for(let i=0;i<groups.length;i++)
   groups[i].position.z=loopZ(i,JOURNEY_SPACING,travel,JOURNEY_CHUNKS,-18);
 }
 function dispose(){
  scene.remove(root);
  for(const g of Object.values(shape))g.dispose();
  for(const m of mats.values())m.dispose();
 }
 update(0);
 return {root,groups,update,dispose};
}
