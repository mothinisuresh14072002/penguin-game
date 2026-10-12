import * as THREE from 'three';

// Mimi Farm: sunlight-coloured crop rows, bright sunflowers, rustic fences,
// and hay bales. All detail meshes are instanced and remain outside the
// 9-unit running corridor. Recycle only four groups as distance changes.
export const FARM_STRIPS=4;
export const FARM_STRIP_LENGTH=54;
export const CORN_PER_STRIP=58;
export const SUNFLOWERS_PER_STRIP=30;
const jitter=n=>{const x=Math.sin(n*127.1+53.17)*43758.5453;return x-Math.floor(x);};

export function createFarmDetails(scene){
 const root=new THREE.Group();root.name='mimi-sunflower-farm';scene.add(root);
 const geo={
  stem:new THREE.CylinderGeometry(.10,.13,1,6),
  cornLeaf:new THREE.ConeGeometry(1,1,5),
  cob:new THREE.SphereGeometry(1,7,6),
  flower:new THREE.SphereGeometry(1,8,6),
  petal:new THREE.SphereGeometry(1,7,5),
  post:new THREE.BoxGeometry(1,1,1),
  rail:new THREE.BoxGeometry(1,1,1),
  bale:new THREE.CylinderGeometry(1,1,1,10)
 };
 const mat={
  corn:new THREE.MeshLambertMaterial({color:0x53a557}),
  leaf:new THREE.MeshLambertMaterial({color:0x82b94b}),
  cob:new THREE.MeshLambertMaterial({color:0xf4c96c}),
  sunflowerStem:new THREE.MeshLambertMaterial({color:0x49934c}),
  center:new THREE.MeshStandardMaterial({color:0x75513a,roughness:.85}),
  petals:new THREE.MeshLambertMaterial({color:0xffdc62}),
  fence:new THREE.MeshLambertMaterial({color:0xffe0ac}),
  rails:new THREE.MeshLambertMaterial({color:0xd4aa79}),
  bale:new THREE.MeshLambertMaterial({color:0xebba65})
 };
 const proxy=new THREE.Object3D();
 function set(mesh,i,x,y,z,sx,sy,sz,rotation=0){
  proxy.position.set(x,y,z);
  proxy.rotation.set(0,0,rotation);
  proxy.scale.set(sx,sy,sz);
  proxy.updateMatrix();mesh.setMatrixAt(i,proxy.matrix);
 }
 const strips=[];
 for(let tile=0;tile<FARM_STRIPS;tile++){
  const group=new THREE.Group();group.name='mimi-farm-strip-'+tile;
  root.add(group);strips.push(group);
  const crops=new THREE.InstancedMesh(geo.stem,mat.corn,CORN_PER_STRIP);
  const leaves=new THREE.InstancedMesh(geo.cornLeaf,mat.leaf,CORN_PER_STRIP*2);
  const cobs=new THREE.InstancedMesh(geo.cob,mat.cob,CORN_PER_STRIP);
  const flowerStems=new THREE.InstancedMesh(geo.stem,mat.sunflowerStem,SUNFLOWERS_PER_STRIP);
  const centers=new THREE.InstancedMesh(geo.flower,mat.center,SUNFLOWERS_PER_STRIP);
  const petals=new THREE.InstancedMesh(geo.petal,mat.petals,SUNFLOWERS_PER_STRIP*8);
  const posts=new THREE.InstancedMesh(geo.post,mat.fence,24);
  const rails=new THREE.InstancedMesh(geo.rail,mat.rails,40);
  const bales=new THREE.InstancedMesh(geo.bale,mat.bale,8);
  for(let i=0;i<CORN_PER_STRIP;i++){
   const row=i%2,side=i%4<2?-1:1;
   const n=tile*1007+i*31.91;
   const x=side*(8.15+row*1.1+Math.floor(i/12)*1.18);
   const z=-1.3-(Math.floor(i/4)*3.25+jitter(n+1)*.7)%51.2;
   const height=1.55+jitter(n+3)*.85;
   set(crops,i,x,height*.5,z,.75,height,.75,(jitter(n+9)-.5)*.14);
   for(let k=0;k<2;k++){
    const dir=k?1:-1;
    set(leaves,i*2+k,x+dir*.23,height*(.55+k*.14),z,
      .25,.75,.25,dir*.55);
   }
   set(cobs,i,x,height*.84,z+.12,.20,.30,.18);
  }
  for(let i=0;i<SUNFLOWERS_PER_STRIP;i++){
   const n=tile*1811+i*17.37;
   const side=i%2===0?-1:1;
   const x=side*(12.7+jitter(n+4)*5.8);
   const z=-1.1-jitter(n+5)*(FARM_STRIP_LENGTH-2);
   const height=1.25+jitter(n+7)*.90;
   set(flowerStems,i,x,height*.5,z,.48,height,.48);
   set(centers,i,x,height+.17,z+.13,.21,.21,.17);
   for(let j=0;j<8;j++){
    const a=j*Math.PI/4;
    set(petals,i*8+j,x+Math.cos(a)*.35,height+.17+Math.sin(a)*.35,
       z+.11,.18,.16,.075,a);
   }
  }
  // Two-sided fences on the path's outer shoulders, not hitbox obstacles.
  for(let i=0;i<24;i++){
   const side=i%2===0?-1:1,index=Math.floor(i/2);
   const x=side*6.25,z=-1.4-index*4.3;
   set(posts,i,x,.67,z,.22,1.34,.23);
  }
  for(let i=0;i<40;i++){
   const side=i%2===0?-1:1;
   const railRow=Math.floor(i/2)%2;
   const segment=Math.floor(i/4);
   const x=side*6.25,z=-3.5-segment*5.15;
   set(rails,i,x,railRow?1.00:.52,z,.13,.12,5.12);
  }
  for(let i=0;i<8;i++){
   const n=tile*93+i*17,side=i%2?-1:1;
   const x=side*(16+jitter(n+2)*3),z=-4-Math.floor(i/2)*12;
   set(bales,i,x,.45,z,.7,.85,.7,Math.PI*.5);
  }
  for(const mesh of [crops,leaves,cobs,flowerStems,centers,petals,posts,rails,bales]){
   mesh.frustumCulled=false;
   mesh.instanceMatrix.needsUpdate=true;
   group.add(mesh);
  }
 }
 function update(distance=0){
  const period=FARM_STRIPS*FARM_STRIP_LENGTH,forward=Math.max(0,distance)*.84;
  for(let i=0;i<strips.length;i++){
   const z=((i*FARM_STRIP_LENGTH+forward)%period+period)%period;
   strips[i].position.z=14-z;
  }
 }
 function dispose(){
  scene.remove(root);
  for(const item of Object.values(geo))item.dispose();
  for(const item of Object.values(mat))item.dispose();
 }
 update(0);
 return {root,strips,update,dispose};
}
