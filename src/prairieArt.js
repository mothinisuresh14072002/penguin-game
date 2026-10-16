import * as THREE from 'three';
import {loopZ} from './worldMotion.js';
import {createWorldStory} from './worldStories.js';

// Golden countryside detail which loops with the runner's distance.
// Real instanced 3D wheat/hay keeps hundreds of plants cheap to render.
export const PRAIRIE_STRIPS=5;
export const PRAIRIE_STRIP_LENGTH=44;
export const WHEAT_PER_STRIP=110;
const rand=n=>{const x=Math.sin(n*127.1+12.371)*43758.5453;return x-Math.floor(x);};

export function createPrairieDetails(scene){
 const root=new THREE.Group();
 root.name='hugo-golden-prairie';
 scene.add(root);
 const geometries={
  stalk:new THREE.CylinderGeometry(.07,.10,1,5),
  grain:new THREE.SphereGeometry(1,6,5),
  leaf:new THREE.SphereGeometry(1,6,4),
  grass:new THREE.ConeGeometry(1,1,5),
  hay:new THREE.CylinderGeometry(1,1,1,10),
  end:new THREE.CircleGeometry(1,10)
 };
 const materials={
  stalk:new THREE.MeshLambertMaterial({color:0x95b654}),
  grain:new THREE.MeshLambertMaterial({color:0xf3cb68}),
  leaf:new THREE.MeshLambertMaterial({color:0xaec463}),
  grass:new THREE.MeshLambertMaterial({color:0x78ad57}),
  hay:new THREE.MeshStandardMaterial({color:0xe7b356,roughness:.9}),
  end:new THREE.MeshLambertMaterial({color:0xf6d58e,side:THREE.DoubleSide})
 };
 const dummy=new THREE.Object3D();
 function matrix(mesh,index,x,y,z,sx,sy,sz,rotationZ=0){
  dummy.position.set(x,y,z);
  dummy.rotation.set(0,0,rotationZ);
  dummy.scale.set(sx,sy,sz);
  dummy.updateMatrix();
  mesh.setMatrixAt(index,dummy.matrix);
 }
 const strips=[];
 for(let stripIndex=0;stripIndex<PRAIRIE_STRIPS;stripIndex++){
  const tile=new THREE.Group();
  tile.name='golden-wheat-strip-'+stripIndex;
  root.add(tile);
  strips.push(tile);
  const stems=new THREE.InstancedMesh(geometries.stalk,materials.stalk,WHEAT_PER_STRIP);
  const grains=new THREE.InstancedMesh(geometries.grain,materials.grain,WHEAT_PER_STRIP*2);
  const leaves=new THREE.InstancedMesh(geometries.leaf,materials.leaf,WHEAT_PER_STRIP*2);
  const tufts=new THREE.InstancedMesh(geometries.grass,materials.grass,WHEAT_PER_STRIP*2);
  const rolls=new THREE.InstancedMesh(geometries.hay,materials.hay,6);
  const caps=new THREE.InstancedMesh(geometries.end,materials.end,12);
  for(let i=0;i<WHEAT_PER_STRIP;i++){
   const n=stripIndex*1507+i*17.13;
   const side=i%2?-1:1;
   // Leave the entire three-lane runner/obstacle path empty.
   const x=side*(5.55+rand(n+1)*15.9);
   const z=-.35-rand(n+2)*(PRAIRIE_STRIP_LENGTH-1.0);
   const height=.55+rand(n+3)*.77;
   const lean=(rand(n+4)-.5)*.23;
   matrix(stems,i,x,.12+height*.48,z,.07,height,.07,lean);
   for(let k=0;k<2;k++){
    const a=k?1:-1;
    matrix(grains,i*2+k,x+a*.085,.15+height*(.8+k*.08),z,
      .11,.22,.09,lean+a*.25);
    matrix(leaves,i*2+k,x+a*.15,.18+height*.46,z,
      .16,.055,.11,a*.46);
    const grassX=x+(rand(n+k*17+12)-.5)*1.0;
    const grassH=.18+rand(n+k*31+28)*.35;
    matrix(tufts,i*2+k,grassX,.10+grassH*.47,z+.18,
      .08,grassH,.09,(rand(n+k*13+38)-.5)*.4);
   }
  }
  for(let i=0;i<6;i++){
   const n=stripIndex*87+i*31;
   const side=i%2?-1:1;
   const x=side*(7.1+rand(n+1)*10);
   const z=-2-i*6.7;
   const radius=.43+rand(n+2)*.22;
   const length=.75+rand(n+3)*.45;
   // Hay cylinders lie on their sides, flanked by visible pale round ends.
   const j=i;
   matrix(rolls,j,x,.37,z,radius,length,radius,Math.PI/2);
   for(let k=0;k<2;k++){
    // End discs face outward in the cylinder's rotated axial direction.
    const capX=x+(k?1:-1)*length*.51;
    matrix(caps,i*2+k,capX,.37,z,radius*.99,radius*.99,1);
   }
  }
  for(const mesh of [stems,grains,leaves,tufts,rolls,caps]){
   mesh.instanceMatrix.needsUpdate=true;
   mesh.frustumCulled=false;
   tile.add(mesh);
  }
 }
 const story=createWorldStory(strips,'grassland',PRAIRIE_STRIP_LENGTH);
 function update(distance=0){
  for(let i=0;i<strips.length;i++)
   strips[i].position.z=loopZ(i,PRAIRIE_STRIP_LENGTH,Math.max(0,distance),PRAIRIE_STRIPS,14);
  story.update(distance);
 }
 function dispose(){
  story.dispose();
  scene.remove(root);
  for(const geom of Object.values(geometries))geom.dispose();
  for(const mat of Object.values(materials))mat.dispose();
 }
 update(0);
 return {root,strips,story,update,dispose};
}
