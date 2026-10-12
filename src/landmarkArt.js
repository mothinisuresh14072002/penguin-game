import * as THREE from 'three';
import {loopZ} from './worldMotion.js';
import {giveSurfaceDetail,surfaceKindForColor} from './hdSurface.js';

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
 const rotors=[];
 const clockHands=[];
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
  if(!mats.has(key)){
   const surface=new THREE.MeshStandardMaterial({color,roughness:gloss?.2:.83,metalness:gloss?.12:0});
   const kind=!gloss?surfaceKindForColor(color):null;
   if(kind)giveSurfaceDetail(surface,kind);
   mats.set(key,surface);
  }
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
  // Windmills have actual blade rigs, rather than four frozen blocks.
  // Keep rotating parts outside the central gameplay/obstacle corridor.
  fence(-6.8,-8,0xf0d19b);fence(6.8,-8,0xf0d19b);
  for(const [index,[x,z]] of [[-12,-32],[13.5,-55],[-15,-89]].entries()){
   p('cylinder',0xe9dbc2,x,4.0,z,1.45,8,1.45);
   p('cone',0xa66e4e,x,8.75,z,2.07,2.65,2.07);
   const rotor=new THREE.Group();
   rotor.name='prairie-windmill-rotor';
   rotor.position.set(x,6.65,z+1.61);
   root.add(rotor);
   const hub=part(rotor,'sphere',0x926343,0,0,.2,.43,.43,.25);
   hub.castShadow=false;
   for(let i=0;i<4;i++){
    const a=i*Math.PI*.5;
    const blade=part(rotor,'box',0xfff0d2,
      Math.sin(a)*1.62,Math.cos(a)*1.62,.10,.48,3.04,.14);
    blade.rotation.z=-a;
    part(rotor,'box',0xc48c5e,
      Math.sin(a)*2.32,Math.cos(a)*2.32,.24,.22,.65,.11).rotation.z=-a;
   }
   rotors.push({rotor,phase:index*1.13,speed:.42+index*.10});
  }
  house(-16,-108,0xffe1b7,0xa86d52);
  for(let i=0;i<12;i++){
   const x=(i%2?8.7:-8.7)+(i%3)*.59,z=-9-i*7.8;
   orb(0xe5bc66,x,.68,z,.95,.76,.75);
   orb(0xf4d57c,x+.35,.92,z-.22,.64,.38,.46);
   if(i%3===0)tree(i%2?15:-14,-13-i*6,1.04,0x78b66a);
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
  // Working village clock: both hands rotate about the proper clock pivot.
  const clock=new THREE.Group();clock.name='cat-town-clock';
  clock.position.set(0,11,-97.46);root.add(clock);
  for(const [index,length] of [.73,.47].entries()){
   const pivot=new THREE.Group();pivot.name=index?'clock-hour-hand':'clock-minute-hand';
   clock.add(pivot);clockHands.push({pivot,speed:index?.11:1.32,phase:index?-.65:.28});
   part(pivot,'box',0x64545a,0,length*.43,.10,.09,length,.08);
  }
  orb(0xf7dda8,0,11,-97.34,.12,.12,.07);
 }else if(id==='park'){
  // Layered park plantings frame the runner without blocking any lane.
  for(const [i,[x,z]] of [[-12,-18],[13,-30],[-15,-58],[15,-77],[-15,-102]].entries()){
   const scale=1.18+(i%3)*.17;
   tree(x,z,scale,i%2?0x62b975:0x58aa75);
   for(let n=0;n<6;n++){
    const a=n*Math.PI/3;
    orb(n%2?0xffc6d8:0xffecc7,
      x+Math.sin(a)*1.3*scale,3.0*scale+Math.cos(a)*.35,
      z+Math.cos(a)*.7,.28,.26,.27);
   }
  }
  // Pond, shore stones and lily pads sit well to the LEFT of the track.
  const pondX=-16,pondZ=-49;
  orb(0x91cd9f,pondX,.08,pondZ,6.6,.20,8.2);
  orb(0x75c7df,pondX,.19,pondZ,5.5,.11,7.1);
  orb(0xa4e7f0,pondX,.225,pondZ,4.5,.055,5.7);
  for(let i=0;i<10;i++){
   const a=i*Math.PI*2/10;
   orb(0xd7dfc8,pondX+Math.cos(a)*5.5,.26,
      pondZ+Math.sin(a)*6.9,.73,.30,.67);
  }
  for(let i=0;i<6;i++){
   const x=pondX-2.7+(i%3)*2.0,z=pondZ-3+Math.floor(i/3)*3.2;
   orb(0x4ba878,x,.33,z,.53,.07,.45);
   orb(i%2?0xffc6de:0xfff6e8,x+.10,.48,z,.18,.13,.15);
   orb(0xffd873,x+.10,.58,z,.09,.07,.09);
  }
  for(let i=0;i<8;i++)daisies(i%2?6.7:-7.1,-7-i*12,6);
  // 3D timber benches angled parallel to the scenic walking path.
  for(const side of [-1,1]){
   for(const z of [-25,-71]){
    const x=side*7.9;
    cube(0xa8785d,x,.88,z,2.30,.18,.78);
    cube(0xb98768,x,1.44,z-.38,2.3,1.0,.19);
    for(const dx of [-.87,.87]){
     cube(0x74685e,x+dx,.43,z,.18,.9,.55);
    }
    cube(0xffe4a9,x,1.39,z-.26,1.9,.10,.13);
   }
  }
  // The gazebo is off the roadway, not straddling the center running lane.
  const gx=14,gz=-88;
  orb(0xf4e0bc,gx,.30,gz,4.2,.45,4.2);
  p('cone',0xd67866,gx,6.75,gz,5.0,2.7,5.0);
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;
   p('cylinder',0xf9e4ca,gx+Math.cos(a)*3.5,3.2,
      gz+Math.sin(a)*3.5,.18,5.8,.18);
   orb(0xe0b28a,gx+Math.cos(a)*3.5,.42,gz+Math.sin(a)*3.5,
    .40,.27,.40);
  }
  orb(0xfff0c3,gx,5.2,gz,.43,.36,.43);
 }else if(id==='arctic'){
  // Glacial spires, snow-pines and a tall portal with genuine 3D depth.
  // The central runner passage stays clear underneath the portal.
  for(const x of [-8.1,8.1]){
   crystal(x,-47,11,0x7ad7f6);
   for(let i=0;i<8;i++){
    const z=-12-i*13.5;
    const side=Math.sign(x);
    p('cylinder',0xe6f5f8,x*1.35,1.6,z,.31,3.2,.31);
    for(let k=0;k<3;k++)
     p('cone',[0x79bfd5,0xa9e6ef,0xc9f8fd][k],
      x*1.35,2.1+k*.87,z,2-k*.32,3.0-k*.48,2-k*.32);
    // Rounded powdery snowbanks give the lane a soft frozen edge.
    orb(0xf3fdff,side*6.5,.25,z+.7,1.45,.55,1.12);
   }
  }
  const arch=p('torus',0x86eaff,0,7.0,-47,7.4,7.4,1,true);
  arch.name='glacier-crystal-arch';
  arch.rotation.z=0;
  for(let i=0;i<9;i++){
   const a=Math.PI*i/8;
   const x=Math.cos(a)*7.2,y=7.0+Math.sin(a)*7.2;
   const shard=p('cone',i%2?0xbef6ff:0x8edcf9,x,y,-47,
      .38,1.2,.38,true);
   shard.rotation.z=-a;
  }
  // Igloo and ice shelves: landmark objects remain outside the play lane.
  const ix=-15.7,iz=-72;
  orb(0xe6f9ff,ix,2.8,iz,4.3,3.15,4.1);
  orb(0xc1ecf5,ix+2.2,1.13,iz+3.5,1.5,1.4,.91);
  orb(0x456b82,ix+2.15,1.09,iz+4.39,.95,1.0,.12);
  for(const [x,z] of [[-13,-25],[13,-38],[-14,-87],[12,-99]]){
   crystal(x,z,6,0x9cdffa);
   orb(0xe9fbff,x,.14,z+.48,2.1,.46,1.9);
  }
 }else if(id==='farm'){
  for(const x of [-6.5,6.5])fence(x,-6,0xf3d6a0);
  barn(14,-39);
  // Timber frame, glowing loft window and white X-shaped barn doors.
  for(const side of [-1,1]){
   cube(0xffe5c8,14+side*2.55,2.8,-36.25,.24,5.0,.15);
   const brace=cube(0xffe5c8,14+side*.55,1.52,-36.10,.13,2.40,.15);
   brace.rotation.z=side*.58;
  }
  cube(0xf7f1d9,14,5.0,-36.08,.89,.80,.12);
  orb(0xffd883,14,5.0,-36.00,.32,.32,.09);
  p('cylinder',0xcfc5b1,21,5,-46,2.5,10,2.5);
  p('cone',0xa16a62,21,10.7,-46,2.8,2.4,2.8);
  // Turn an old-fashioned little windmill beside the fields.
  const wx=-18,wz=-74;
  p('cylinder',0xf2dfb7,wx,4.8,wz,1.20,9.60,1.20);
  p('cone',0xc38861,wx,10.1,wz,1.65,2.2,1.65);
  const mill=new THREE.Group();
  mill.name='mimi-farm-windmill-rotor';
  mill.position.set(wx,8.0,wz+1.30);root.add(mill);
  part(mill,'sphere',0x9a7254,0,0,.17,.34,.34,.18);
  for(let k=0;k<4;k++){
   const angle=k*Math.PI/2;
   const blade=part(mill,'box',0xffe7c2,
     Math.sin(angle)*1.35,Math.cos(angle)*1.35,.08,.34,2.55,.12);
   blade.rotation.z=-angle;
  }
  rotors.push({rotor:mill,phase:.23,speed:.34});
  // Farm gate and planted countryside stay outside the runner's 3 lanes.
  for(let i=0;i<32;i++){
   const x=(i%2?-11:-15)+(i%3)*.76,z=-8-Math.floor(i/2)*5.1;
   p('cylinder',0x59a254,x,.85,z,.13,1.7,.13);
   orb(0xf7d36b,x,1.58,z,.27,.35,.23);
  }
  for(const [x,z] of [[-18,-45],[19,-78],[-20,-111]])tree(x,z,1.2,0x78bb6f);
  for(let i=0;i<8;i++){
   const side=i%2?-1:1;
   daisies(side*(7.0+(i%3)*.45),-9-i*12,6);
  }
 }
 // Assign every landmark mesh (including tiny flowers and fences) to the
 // same travelling-world coordinate system as the ground. A flower cannot
 // remain frozen while an adjacent flower bed scrolls beside the path.
 const STRIP_LENGTH=35,STRIP_COUNT=5;
 const strips=Array.from({length:STRIP_COUNT},(_,index)=>{
  const strip=new THREE.Group();
  strip.name='physical-landmark-strip-'+index;
  root.add(strip);
  return strip;
 });
 // Bucketing preserves the exact starting world position and also retains
 // named objects (clock hands, windmill rotors, portal) for the old tests.
 const children=root.children.filter(child=>!strips.includes(child));
 for(const child of children){
  const start=child.position.z;
  const index=Math.max(0,Math.min(STRIP_COUNT-1,Math.floor(Math.max(0,-start)/STRIP_LENGTH)));
  root.remove(child);
  strips[index].add(child);
  child.position.z=start+index*STRIP_LENGTH;
 }
 function moveLandmarks(distance){
  for(let index=0;index<strips.length;index++)
   strips[index].position.z=loopZ(index,STRIP_LENGTH,Math.max(0,distance),STRIP_COUNT,0);
 }
 moveLandmarks(0);
 function dispose(){
  scene.remove(root);
  for(const geometry of Object.values(geo))geometry.dispose();
  for(const material of mats.values())material.dispose();
 }
 function update(time=0,distance=0){
  moveLandmarks(distance);
  for(const {rotor,phase,speed} of rotors)rotor.rotation.z=-time*speed+phase;
  for(const {pivot,phase,speed} of clockHands)pivot.rotation.z=phase-time*speed*.028;
 }
 return {root,strips,dispose,update,meshCount:count,theme:id};
}
