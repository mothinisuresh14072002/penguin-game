import * as THREE from 'three';

// Phase 1: a dense, lightweight Bella Bunny meadow, rendered using instancing.
// Five reusable scenery strips create thousands of flower/grass details with a
// small, bounded number of draw calls and no asset downloads.
export const MEADOW_STRIPS = 5;
export const MEADOW_STRIP_LENGTH = 44;
export const FLOWERS_PER_STRIP = 136;
const flowerColors=[0xffffff,0xffd6e7,0xfff1ae];
const hash=n=>{
 const x=Math.sin(n*127.1+67.31)*43758.5453;
 return x-Math.floor(x);
};
export function createMeadowDetails(scene){
 const root=new THREE.Group();
 root.name='bella-daisy-meadow';
 scene.add(root);
 const geometries={
  petal:new THREE.SphereGeometry(1,8,6),
  center:new THREE.SphereGeometry(1,9,7),
  stalk:new THREE.CylinderGeometry(.07,.10,1,5),
  grass:new THREE.ConeGeometry(1,1,5),
  leaf:new THREE.SphereGeometry(1,6,4),
  stone:new THREE.SphereGeometry(1,9,6)
 };
 const materials={
  petal:flowerColors.map(c=>new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide})),
  center:new THREE.MeshStandardMaterial({color:0xffcb58,roughness:.68}),
  stalk:new THREE.MeshLambertMaterial({color:0x4b9f52}),
  grass:new THREE.MeshLambertMaterial({color:0x68bb60}),
  leaf:new THREE.MeshLambertMaterial({color:0x5ea957}),
  stone:new THREE.MeshLambertMaterial({color:0xfff7d7})
 };
 const dummy=new THREE.Object3D();
 function setMatrix(mesh,index,x,y,z,sx,sy,sz,rotation=0){
  dummy.position.set(x,y,z);
  dummy.rotation.set(0,rotation,0);
  dummy.scale.set(sx,sy,sz);
  dummy.updateMatrix();
  mesh.setMatrixAt(index,dummy.matrix);
 }
 const strips=[];
 for(let strip=0;strip<MEADOW_STRIPS;strip++){
  const tile=new THREE.Group();tile.name='meadow-flower-strip-'+strip;
  root.add(tile);strips.push(tile);
  const petals=flowerColors.map((_,j)=>new THREE.InstancedMesh(
   geometries.petal,materials.petal[j],FLOWERS_PER_STRIP*6
  ));
  const centers=new THREE.InstancedMesh(geometries.center,materials.center,FLOWERS_PER_STRIP);
  const stalks=new THREE.InstancedMesh(geometries.stalk,materials.stalk,FLOWERS_PER_STRIP);
  const blades=new THREE.InstancedMesh(geometries.grass,materials.grass,FLOWERS_PER_STRIP*3);
  const leaves=new THREE.InstancedMesh(geometries.leaf,materials.leaf,FLOWERS_PER_STRIP*2);
  const stones=new THREE.InstancedMesh(geometries.stone,materials.stone,48);
  for(let j=0;j<24;j++)for(let side=0;side<2;side++){
   const k=j*2+side;
   const x=(side?1:-1)*(4.97+hash(strip*19+j*13)*.12);
   const z=-.45-j*MEADOW_STRIP_LENGTH/24;
   setMatrix(stones,k,x,.22,z,.17+hash(j*3+strip)*.08,.10,.26);
  }
  stones.instanceMatrix.needsUpdate=true;
  stones.frustumCulled=false;
  tile.add(stones);
  const petalIndices=[0,0,0];
  for(let i=0;i<FLOWERS_PER_STRIP;i++){
   const seed=strip*1019+i*19.7;
   const side=i%2?-1:1;
   // Never intrude on the nine-unit-wide running and obstacle corridor.
   const x=side*(5.65+Math.pow(hash(seed+2),1.35)*13);
   const z=-.25-hash(seed+3)*(MEADOW_STRIP_LENGTH-.5);
   const h=.28+hash(seed+5)*.28;
   const size=.7+hash(seed+7)*.85;
   const color=Math.floor(hash(seed+11)*3);
   setMatrix(stalks,i,x,.16+h*.5,z,.45,h,.45);
   setMatrix(centers,i,x,.16+h,z+.02,.12*size,.12*size,.09*size);
   for(let p=0;p<6;p++){
    const a=(p/6)*Math.PI*2;
    const px=x+Math.cos(a)*.165*size;
    const py=.16+h+Math.sin(a)*.165*size;
    setMatrix(petals[color],petalIndices[color]++,px,py,z,.13*size,.11*size,.06*size);
   }
   for(let k=0;k<3;k++){
    const gx=x+(hash(seed+k*7+31)-.5)*1.35;
    const gz=z+(hash(seed+k*5+41)-.5)*1.65;
    const gh=.2+hash(seed+k*2+43)*.28;
    setMatrix(blades,i*3+k,gx,.16+gh*.5,gz,.08,gh,.085,hash(seed+k+53)*Math.PI);
   }
   for(let k=0;k<2;k++){
    const s=k?1:-1;
    setMatrix(leaves,i*2+k,x+s*.13,.18+h*.32,z,.10,.05,.20,s*.4);
   }
  }
  // Instance indices for each of the three flower colours are variable.
  for(let c=0;c<3;c++){
   petals[c].count=petalIndices[c];
   petals[c].instanceMatrix.needsUpdate=true;
   petals[c].frustumCulled=false;
   tile.add(petals[c]);
  }
  for(const mesh of [centers,stalks,blades,leaves]){
   mesh.instanceMatrix.needsUpdate=true;
   mesh.frustumCulled=false;
   tile.add(mesh);
  }
 }
 function update(distance){
  const travel=Math.max(0,distance)*.86;
  const period=MEADOW_STRIPS*MEADOW_STRIP_LENGTH;
  for(let i=0;i<strips.length;i++){
   const d=((i*MEADOW_STRIP_LENGTH+travel)%period+period)%period;
   strips[i].position.z=13-d;
  }
 }
 function dispose(){
  scene.remove(root);
  for(const geo of Object.values(geometries))geo.dispose();
  for(const material of [...materials.petal,materials.center,materials.stalk,materials.grass,materials.leaf,materials.stone])
   material.dispose();
 }
 update(0);
 return {root,strips,update,dispose};
}
