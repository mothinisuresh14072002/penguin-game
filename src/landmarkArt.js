import * as THREE from 'three';

// Landmark silhouettes and nearby set dressing inspired by the seven lanes in
// the user's reference art. Each is actual 3D geometry with its own depth.
export const LANDMARK_THEMES=Object.freeze({
 meadow:'bunny burrow, flowering trees and daisy fences',
 rainbow:'rainbow arch, crystal towers and floating islands',
 grassland:'countryside windmill and golden haystacks',
 city:'pastel townhouses, flower boxes and a clock tower',
 park:'pond, park gazebo and leafy trees',
 arctic:'crystal ice arch, snow pines and glacial spires',
 farm:'red barn, grain silo, windmill and crop fields'
});
export function createWorldLandmarks(scene,id='meadow'){
 const root=new THREE.Group();root.name='landmarks-'+id;scene.add(root);
 const geo={
  sphere:new THREE.SphereGeometry(1,14,10),
  box:new THREE.BoxGeometry(1,1,1),
  cylinder:new THREE.CylinderGeometry(1,1,1,10),
  cone:new THREE.ConeGeometry(1,1,10),
  torus:new THREE.TorusGeometry(1,.14,8,30,Math.PI),
  tube:new THREE.CylinderGeometry(1,1,1,8)
 };
 const mats=new Map();
 const mat=(color,gloss=false)=>{
  const key=color+':'+gloss;
  if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({
   color,roughness:gloss?.2:.79,metalness:gloss?.12:0
  }));
  return mats.get(key);
 };
 let count=0;
 const part=(parent,shape,color,x,y,z,sx,sy,sz,gloss=false)=>{
  const o=new THREE.Mesh(geo[shape],mat(color,gloss));
  o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=false;
  o.receiveShadow=true;parent.add(o);count++;return o;
 };
 const p=(shape,color,x,y,z,sx,sy,sz,gloss=false)=>part(root,shape,color,x,y,z,sx,sy,sz,gloss);
 const orb=(color,x,y,z,sx,sy,sz)=>p('sphere',color,x,y,z,sx,sy,sz);
 const cube=(color,x,y,z,sx,sy,sz)=>p('box',color,x,y,z,sx,sy,sz);
 const tree=(x,z,scale=1,color=0x55b96b)=>{
  p('cylinder',0x936044,x,1.15*scale,z,.30*scale,2.30*scale,.30*scale);
  for(const [dx,dy,dz,s] of [[0,3,0,1],[-.83,2.7,.1,.7],[.74,2.72,.04,.73],[0,3.6,-.2,.64]]){
   orb(color,x+dx*scale,dy*scale,z+dz*scale,1.12*s*scale,.91*s*scale,1.0*s*scale);
  }
 };
 const daisies=(x,z,n=5)=>{
  for(let i=0;i<n;i++){
   const fx=x+(i%3-.9)*.70,fz=z-Math.floor(i/3)*.65;
   p('cylinder',0x438f58,fx,.34,fz,.035,.68,.035);
   for(let j=0;j<6;j++){
    const a=j*Math.PI/3;
    orb(0xffffff,fx+Math.cos(a)*.20,.71+Math.sin(a)*.20,fz,.13,.14,.065);
   }
   orb(0xffd95c,fx,.71,fz+.085,.12,.12,.09);
  }
 };
 const fence=(x,z,color=0xf0d29d)=>{
  for(let i=0;i<8;i++){
   const zz=z-i*3;
   cube(color,x,.66,zz,.23,1.26,.23);
   for(const y of [.55,1.0])cube(color,x,y,zz-1.5,.13,.12,3.1);
  }
 };
 const house=(x,z,color,roof)=>{
  cube(color,x,2.25,z,3.9,4.45,3.2);
  const cap=p('cone',roof,x,5.15,z,2.9,2.2,2.8);cap.rotation.y=Math.PI/4;
  for(const dx of [-1.09,1.09]){
   cube(0xfff8e5,x+dx,3.15,z+1.67,.84,1.02,.17);
   cube(0x9cd8ed,x+dx,3.15,z+1.79,.56,.73,.08);
   orb(0xf1a6c8,x+dx,2.49,z+1.80,.54,.23,.32);
   orb(0x6cb77f,x+dx,2.37,z+1.89,.57,.17,.31);
  }
  cube(0x8d655e,x,.97,z+1.71,.88,1.92,.14);
 };
 const barn=(x,z)=>{
  cube(0xc94743,x,2.8,z,6.5,5.6,5.3);
  const roof=p('cone',0x7b3b42,x,6.33,z,4.4,3.0,4.5);roof.rotation.y=Math.PI/4;
  cube(0xffecd9,x,1.45,z+2.68,2.1,2.9,.14);
  cube(0xb13e36,x,1.45,z+2.79,1.65,2.4,.16);
  for(const dx of [-2.15,2.15])cube(0xffffff,x+dx,3.6,z+2.75,.66,.78,.12);
  cube(0xffffff,x,5.0,z+2.72,.75,.78,.12);
 };
 const rainbow=(x,y,z,r=4)=>{
  const shades=[0xff97c7,0xffc776,0xffe7a2,0x96e6a5,0x91d5fb,0xc9b0f8];
  for(let i=0;i<shades.length;i++){
   const arc=p('torus',shades[i],x,y,z,r-i*.29,r-i*.29,1,true);
   arc.rotation.z=0;
  }
 };
 const crystal=(x,z,h=4,color=0x9ed4ff)=>{
  const a=p('cone',color,x,h*.5,z,.65,h,.65,true);
  a.rotation.y=Math.PI*.25;
  orb(0xe7faff,x,.25,z,.64,.31,.64);
 };
 if(id==='meadow'){
  // Asymmetrical leafy trees with soft flowering crowns, not repeated blocks.
  const clusters=[[-13,-18], [12,-34], [-14,-55], [14,-78], [16,-108], [-16,-94]];
  for(let t=0;t<clusters.length;t++){
   const [x,z]=clusters[t],scale=t%2===0?1.35:1.55;
   tree(x,z,scale,t%2?0x68bf72:0x58b965);
   for(let k=0;k<7;k++){
    const a=k*Math.PI*2/7;
    const dx=Math.sin(a)*1.3*scale,dz=Math.cos(a)*.9*scale;
    orb(k%3===0?0xffd6e8:0x91d782,x+dx,(3.1+(k%3)*.47)*scale,z+dz,
     .45*scale,.37*scale,.45*scale);
   }
  }
  fence(-5.35,-8);fence(5.35,-8);daisies(-6.6,-8,12);daisies(6.5,-11,12);
  // A rabbit-ear burrow house that reads immediately as Bunny Meadow.
  const bx=-12.4,bz=-39.6;
  orb(0x79b66c,bx,2.1,bz,4.8,2.7,3.9);
  orb(0xa7d887,bx,3.15,bz-.2,3.9,1.3,3.3);
  // Upright rabbit-ear roof features and pink insets.
  for(const side of [-1,1]){
    orb(0xffeeda,bx+side*1.55,4.55,bz-.3,.75,2.3,.62);
    orb(0xf7b3cd,bx+side*1.55,4.65,bz+.28,.40,1.65,.12);
  }
  // The dark arched burrow entrance faces the approaching player (+Z).
  orb(0xe8c89b,bx,1.58,bz+3.72,1.35,1.65,.17);
  orb(0x694635,bx,1.47,bz+3.86,.99,1.30,.11);
  cube(0x6a463a,bx,.86,bz+3.95,1.96,1.52,.12);
  orb(0xffd27b,bx+.65,1.45,bz+4.04,.12,.12,.10);
  for(const side of [-1,1]){
    orb(0xf9fff5,bx+side*2.55,1.8,bz+2.85,.56,.63,.20);
    orb(0xa9dff6,bx+side*2.55,1.8,bz+3.06,.40,.46,.06);
    daisies(bx+side*3.3,bz+3.2,6);
  }
  for(let i=0;i<13;i++){
   const x=(i%2?-1:1)*(6.3+(i%3)*.8);
   const z=-6-i*8;
   // Low round hedges soften transitions between the dirt trail and flowers.
   orb(0x71bf70,x,.37,z,1.55,.63,.74);
   orb(0x92d787,x+.45,.57,z-.3,.96,.55,.64);
  }
 }else if(id==='rainbow'){
  rainbow(0,12,-66,11);
  for(const [x,z] of [[-9,-29],[10,-38],[-13,-60],[12,-73]])
    for(let k=0;k<3;k++)crystal(x+(k-1)*1.1,z-k*1.1,2.6+k*1.9,[0xf5a8ff,0x90e9f2,0xb6a4ff][k]);
  for(const x of [-18,17]){
   orb(0xc7a2e4,x,10,-90,6,1.5,5);
   orb(0xeee5ff,x,11,-90,5.1,.85,4.3);
   for(let k=0;k<3;k++)crystal(x+(k-1)*1.7,-89,5+k,0xb68ce8);
  }
  for(const x of [-6,6])for(let i=0;i<5;i++)crystal(x,-12-i*14,1.8+i%3*.6,0xf3b9ff);
 }else if(id==='grassland'){
  for(const x of [-6,6])fence(x,-8,0xe9cf96);
  for(const [x,z] of [[-12,-32],[12,-51],[14,-78]]){
   p('cylinder',0xe7dbc1,x,4,z,1.6,8,1.6);
   p('cone',0xa56e48,x,8.8,z,2.15,2.5,2.15);
   const hub=orb(0x7e6348,x,6.4,z+1.81,.46,.46,.23);
   for(let i=0;i<4;i++){
    const a=i*Math.PI*.5;
    const blade=cube(0xffffff,x+Math.sin(a)*2.0,6.4+Math.cos(a)*2.0,z+1.86,.5,3.65,.14);
    blade.rotation.z=-a;
   }
  }
  for(let i=0;i<15;i++){
   orb(0xdab05f,(i%2?8:-8)+(i%3)*.7,.7,-7-i*8,1.05,.73,.83);
   if(i%3===0)tree(13,-9-i*5,1.0,0x77b36a);
  }
 }else if(id==='city'){
  const walls=[0xffbfa5,0xfbd79b,0xb3d0e9,0xe8b1c7,0xcce1b8];
  for(let i=0;i<10;i++){
   const x=i%2?-9.3:9.3,z=-13-Math.floor(i/2)*19;
   house(x,z,walls[i%walls.length],[0xad7896,0xd0846d,0x8eabbb][i%3]);
  }
  cube(0xf3d2a0,0,8,-100,4.5,16,4.5);
  p('cone',0xc37565,0,17.5,-100,3.8,4.2,3.8);
  orb(0xf7edda,0,11,-97.64,1.1,1.1,.12);
  for(const a of [0,Math.PI/2]){
   const hand=cube(0x6f6f74,Math.cos(a)*.22,11+Math.sin(a)*.22,-97.47,.12,.66,.10);
   hand.rotation.z=a;
  }
 }else if(id==='park'){
  for(const [x,z] of [[-11,-19],[11,-28],[-12,-53],[12,-76]])tree(x,z,1.5,0x51b16f);
  orb(0x7ed3e9,-12,.02,-49,5,.07,7);
  for(let i=0;i<6;i++){daisies(i%2?6:-6,-10-i*13,3);}
  for(const i of [-1,1]){
   p('cylinder',0xffe2b8,i*14,2.5,-67,.15,5,.15);
   cube(0xf6cda1,i*14,4.9,-67,2.2,.18,2.2);
  }
  p('cone',0xd67866,0,7.4,-88,5.0,2.7,5.0);
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;
   p('cylinder',0xf9e4ca,Math.cos(a)*3.5,3,-88+Math.sin(a)*3.5,.17,6,.17);
  }
 }else if(id==='arctic'){
  // A translucent-like crystal arch sits above the running corridor.
  for(const x of [-7.4,7.4]){
   crystal(x,-47,11,0x7ad7f6);
   for(let i=0;i<8;i++){
    const z=-12-i*14;
    p('cylinder',0xe9f4f4,x*1.4,1.6,z,.32,3.2,.32);
    for(let k=0;k<3;k++)p('cone',[0x9fd9db,0xcaf5f7,0xb1e7e9][k],x*1.4,2.2+k*.88,z,1.9-k*.36,3.2-k*.5,1.9-k*.36);
   }
  }
  const arch=p('torus',0x78e9ff,0,6.8,-47,7.4,6.8,1,true);
  arch.rotation.z=0;
  for(const [x,z] of [[-12,-25],[11,-42],[-14,-79],[12,-92]])crystal(x,z,5.5,0x9dd9ff);
 }else if(id==='farm'){
  for(const x of [-6.5,6.5])fence(x,-6,0xf3d6a0);
  barn(13,-39);
  p('cylinder',0xcfc5b1,20,5,-46,2.5,10,2.5);
  p('cone',0xa16a62,20,10.7,-46,2.8,2.4,2.8);
  for(let i=0;i<36;i++){
   const x=(i%2?-9:-14)+(i%3)*.65,z=-8-Math.floor(i/2)*5.1;
   p('cylinder',0x55a74f,x,.85,z,.13,1.7,.13);
   orb(0xf5d36c,x,1.6,z,.27,.38,.23);
  }
  for(const [x,z] of [[-18,-66],[18,-78]])tree(x,z,1.2,0x74b874);
 }
 function dispose(){
  scene.remove(root);
  for(const geometry of Object.values(geo))geometry.dispose();
  for(const material of mats.values())material.dispose();
 }
 return {root,dispose,meshCount:count,theme:id};
}
