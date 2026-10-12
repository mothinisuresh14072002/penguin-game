import * as THREE from 'three';

// Dodo Dog's lush looping park: low garden beds, soft clover flowers,
// bushes and stepping-stone edges. Instancing keeps draw calls bounded.
export const PARK_STRIPS=4;
export const PARK_STRIP_LENGTH=54;
export const PARK_FLOWERS_PER_STRIP=104;
const rand=n=>{const x=Math.sin(n*127.1+12.819)*43758.5453;return x-Math.floor(x)};
const palette=[0xfff8e8,0xffb7d1,0xffdf83];

export function createParkDetails(scene){
 const root=new THREE.Group();root.name='dodo-puppy-park';scene.add(root);
 const geometry={
  flower:new THREE.SphereGeometry(1,7,6),
  center:new THREE.SphereGeometry(1,8,6),
  stem:new THREE.CylinderGeometry(.07,.08,1,5),
  shrub:new THREE.IcosahedronGeometry(1,1),
  leaf:new THREE.SphereGeometry(1,7,5),
  stone:new THREE.SphereGeometry(1,9,6)
 };
 const materials={
  petals:palette.map(c=>new THREE.MeshLambertMaterial({color:c})),
  center:new THREE.MeshStandardMaterial({color:0xf6c854,roughness:.71}),
  stem:new THREE.MeshLambertMaterial({color:0x5fa858}),
  shrub:new THREE.MeshLambertMaterial({color:0x70b76a}),
  leaf:new THREE.MeshLambertMaterial({color:0x95ca70}),
  stone:new THREE.MeshStandardMaterial({color:0xf4e3c2,roughness:.91})
 };
 const dummy=new THREE.Object3D();
 function put(mesh,i,x,y,z,sx,sy,sz,rz=0){
  dummy.position.set(x,y,z);
  dummy.rotation.set(0,0,rz);
  dummy.scale.set(sx,sy,sz);
  dummy.updateMatrix();
  mesh.setMatrixAt(i,dummy.matrix);
 }
 const strips=[];
 for(let t=0;t<PARK_STRIPS;t++){
  const tile=new THREE.Group();tile.name='puppy-park-garden-strip-'+t;
  strips.push(tile);root.add(tile);
  const petals=palette.map((_,j)=>new THREE.InstancedMesh(
    geometry.flower,materials.petals[j],PARK_FLOWERS_PER_STRIP*5
  ));
  const centers=new THREE.InstancedMesh(geometry.center,materials.center,PARK_FLOWERS_PER_STRIP);
  const stems=new THREE.InstancedMesh(geometry.stem,materials.stem,PARK_FLOWERS_PER_STRIP);
  const shrubs=new THREE.InstancedMesh(geometry.shrub,materials.shrub,35);
  const leaves=new THREE.InstancedMesh(geometry.leaf,materials.leaf,PARK_FLOWERS_PER_STRIP*2);
  const stones=new THREE.InstancedMesh(geometry.stone,materials.stone,28);
  const flowerIndex=[0,0,0];
  for(let i=0;i<PARK_FLOWERS_PER_STRIP;i++){
   const n=t*1109+i*31.13;
   const side=i%2===0?-1:1;
   // The full 3-lane track, obstacles, and hazards stay completely clear.
   const x=side*(5.85+rand(n+2)*11.8);
   const z=-.4-rand(n+3)*(PARK_STRIP_LENGTH-1.4);
   const h=.28+rand(n+5)*.29;
   const size=.65+rand(n+7)*.6;
   const c=i%3;
   put(stems,i,x,.2+h*.46,z,.4,h,.4);
   put(centers,i,x,.22+h,z,.11*size,.11*size,.085*size);
   for(let j=0;j<5;j++){
    const a=j*Math.PI*2/5;
    put(petals[c],flowerIndex[c]++,x+Math.cos(a)*.14*size,
      .22+h+Math.sin(a)*.14*size,z,.108*size,.111*size,.061*size);
   }
   for(let j=0;j<2;j++){
    const direction=j?1:-1;
    put(leaves,i*2+j,x+direction*.12,.22+h*.27,z,
      .12,.055,.22,direction*.4);
   }
  }
  for(let i=0;i<35;i++){
   const n=t*207+i*13.7;
   const side=i%2===0?-1:1;
   const x=side*(7.3+rand(n+2)*8.3);
   const z=-1-rand(n+3)*(PARK_STRIP_LENGTH-2);
   const size=.48+rand(n+5)*.44;
   put(shrubs,i,x,.2+size*.57,z,size, size*.83, size*.86);
  }
  for(let i=0;i<28;i++){
   const side=i%2===0?-1:1;
   const x=side*(5.06+rand(t*23+i+8)*.12);
   const z=-.5-Math.floor(i/2)*(PARK_STRIP_LENGTH/14);
   put(stones,i,x,.20,z,.24,.095,.38);
  }
  for(let c=0;c<3;c++){
   petals[c].count=flowerIndex[c];
   petals[c].frustumCulled=false;petals[c].instanceMatrix.needsUpdate=true;
   tile.add(petals[c]);
  }
  for(const mesh of [centers,stems,shrubs,leaves,stones]){
   mesh.frustumCulled=false;mesh.instanceMatrix.needsUpdate=true;
   tile.add(mesh);
  }
 }
 function update(distance=0){
  const length=PARK_STRIPS*PARK_STRIP_LENGTH;
  const d=Math.max(0,distance)*.83;
  for(let i=0;i<PARK_STRIPS;i++){
   const n=((i*PARK_STRIP_LENGTH+d)%length+length)%length;
   strips[i].position.z=14-n;
  }
 }
 function dispose(){
  scene.remove(root);
  for(const g of Object.values(geometry))g.dispose();
  for(const material of [...materials.petals,materials.center,materials.stem,
      materials.shrub,materials.leaf,materials.stone])material.dispose();
 }
 update(0);
 return {root,strips,update,dispose};
}
