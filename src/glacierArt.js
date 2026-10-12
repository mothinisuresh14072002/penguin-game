import * as THREE from 'three';

// Phase 6 — Pip Penguin. Real 3D faceted ice, powdery snowbanks and falling
// snow, without GLB downloads. Crystals and snow mounds are instanced.
// The scenic geometry always stays clear of the 9-unit running corridor.
export const GLACIER_STRIPS=4;
export const GLACIER_STRIP_LENGTH=54;
export const ICE_SPIRES_PER_STRIP=42;
export const SNOWFLAKES=210;
const random=n=>{const v=Math.sin(n*127.1+31.84)*43758.5453;return v-Math.floor(v)};
const colorList=[0x7fd3f7,0xb7f0ff,0x9abbe9];
export function createGlacierDetails(scene){
 const root=new THREE.Group();root.name='pip-penguin-glacier';scene.add(root);
 const geometry={
  crystal:new THREE.ConeGeometry(1,1,6),
  pebble:new THREE.IcosahedronGeometry(1,1),
  snow:new THREE.SphereGeometry(1,9,6),
  shard:new THREE.OctahedronGeometry(1,0)
 };
 const material={
  crystal:colorList.map(c=>new THREE.MeshPhysicalMaterial({
   color:c,metalness:.12,roughness:.22,transparent:false,
   clearcoat:.44,clearcoatRoughness:.16,emissive:c,emissiveIntensity:.12,
   flatShading:true
  })),
  pebble:new THREE.MeshStandardMaterial({color:0x9fd7f4,roughness:.43,metalness:.04}),
  snow:new THREE.MeshStandardMaterial({color:0xf2fcff,roughness:.90}),
  shard:new THREE.MeshStandardMaterial({color:0xc8f4ff,roughness:.37,metalness:.06}),
  flakes:new THREE.PointsMaterial({
   color:0xfaffff,size:.105,transparent:true,opacity:.86,
   depthWrite:false,sizeAttenuation:true
  })
 };
 const dummy=new THREE.Object3D();
 function place(mesh,i,x,y,z,sx,sy,sz,rz=0){
  dummy.position.set(x,y,z);
  dummy.rotation.set(0,rz,0);
  dummy.scale.set(sx,sy,sz);
  dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
 }
 const strips=[];
 for(let stripIndex=0;stripIndex<GLACIER_STRIPS;stripIndex++){
  const strip=new THREE.Group();strip.name='glacier-ice-strip-'+stripIndex;
  strips.push(strip);root.add(strip);
  const crystals=colorList.map((_,j)=>new THREE.InstancedMesh(
   geometry.crystal,material.crystal[j],ICE_SPIRES_PER_STRIP
  ));
  const iceRocks=new THREE.InstancedMesh(geometry.pebble,material.pebble,ICE_SPIRES_PER_STRIP);
  const snowbanks=new THREE.InstancedMesh(geometry.snow,material.snow,32);
  const shards=new THREE.InstancedMesh(geometry.shard,material.shard,ICE_SPIRES_PER_STRIP);
  const count=[0,0,0];
  for(let i=0;i<ICE_SPIRES_PER_STRIP;i++){
   const seed=stripIndex*4999+i*19.51,side=i%2?-1:1;
   const x=side*(5.85+random(seed+1)*14.5);
   const z=-1-random(seed+3)*(GLACIER_STRIP_LENGTH-2);
   const h=1.45+random(seed+5)*4.65;
   const radius=.27+random(seed+7)*.61;
   const k=i%3;
   place(crystals[k],count[k]++,x,h*.5+.08,z,radius,h,radius,random(seed+9)*.4);
   place(iceRocks,i,x,.24,z,radius*1.25,.42,radius*1.42);
   place(shards,i,x+side*.55,h*.2+.22,z-.25,radius*.42,h*.46,radius*.39,.24);
  }
  for(let i=0;i<32;i++){
   const seed=stripIndex*1191+i*37.67,side=i%2?-1:1;
   const x=side*(5.15+random(seed+1)*9.5);
   const z=-random(seed+2)*GLACIER_STRIP_LENGTH;
   const w=.63+random(seed+3)*.97;
   place(snowbanks,i,x,.08,z,w,.25+random(seed+4)*.25,w*.75);
  }
  for(let i=0;i<3;i++){
   crystals[i].count=count[i];
   crystals[i].frustumCulled=false;
   crystals[i].instanceMatrix.needsUpdate=true;
   strip.add(crystals[i]);
  }
  for(const mesh of [iceRocks,snowbanks,shards]){
   mesh.frustumCulled=false;mesh.instanceMatrix.needsUpdate=true;
   strip.add(mesh);
  }
 }
 // All snowflakes belong to the Penguin world and remain active independently
 // for either player in a local split-screen race.
 const snowGeometry=new THREE.BufferGeometry();
 const points=new Float32Array(SNOWFLAKES*3);
 for(let i=0;i<SNOWFLAKES;i++){
  const seed=i*91.31;
  points[i*3]=(random(seed+2)-.5)*38;
  points[i*3+1]=.3+random(seed+3)*19;
  points[i*3+2]=12-random(seed+4)*95;
 }
 snowGeometry.setAttribute('position',new THREE.BufferAttribute(points,3));
 const snowfall=new THREE.Points(snowGeometry,material.flakes);
 snowfall.name='glacier-snowfall';
 snowfall.frustumCulled=false;
 root.add(snowfall);
 let lastDistance=0,lastTime=0;
 function update(distance=0,time=0){
  const progress=Math.max(0,distance)*.84;
  const cycle=GLACIER_STRIPS*GLACIER_STRIP_LENGTH;
  for(let i=0;i<strips.length;i++){
   const n=((i*GLACIER_STRIP_LENGTH+progress)%cycle+cycle)%cycle;
   strips[i].position.z=14-n;
  }
  const deltaTime=Math.max(0,Math.min(.055,time-lastTime));
  const forward=Math.max(0,Math.min(3.6,(distance-lastDistance)*.28));
  for(let i=0;i<SNOWFLAKES;i++){
   const seed=i*91.31;
   points[i*3]+=Math.sin(time*.8+i*1.73)*deltaTime*.23;
   points[i*3+1]-=deltaTime*(1.5+random(seed+8)*1.1);
   points[i*3+2]+=forward;
   if(points[i*3+1]<0)points[i*3+1]=18+random(seed+9)*2;
   if(points[i*3+2]>15)points[i*3+2]=-82-random(seed+4)*9;
   if(Math.abs(points[i*3])>21)points[i*3]=(random(seed+2)-.5)*38;
  }
  snowGeometry.attributes.position.needsUpdate=true;
  lastDistance=distance;lastTime=time;
 }
 function dispose(){
  scene.remove(root);
  snowGeometry.dispose();
  for(const g of Object.values(geometry))g.dispose();
  for(const m of [...material.crystal,material.pebble,material.snow,
     material.shard,material.flakes])m.dispose();
 }
 update(0);
 return {root,strips,snowfall,update,dispose};
}
