import * as THREE from 'three';
import './style.css';

// Penguin Ice Adventure: procedural scene, meshes, gameplay, and collision in one file.
const scene = new THREE.Scene();
scene.background = new THREE.Color('#86c9ef');
scene.fog = new THREE.FogExp2(0xa4d8f4, 0.018);
const camera = new THREE.PerspectiveCamera(53, innerWidth / innerHeight, 0.1, 210);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.25;
document.body.prepend(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xe4faff, 0x427c9d, 2.2); scene.add(hemi);
const sunlight = new THREE.DirectionalLight(0xfff6e9, 3.5); sunlight.position.set(-14,25,16); sunlight.castShadow=true;
sunlight.shadow.mapSize.set(2048,2048); sunlight.shadow.camera.left=-24;sunlight.shadow.camera.right=24;
sunlight.shadow.camera.top=23;sunlight.shadow.camera.bottom=-20;sunlight.shadow.camera.near=1;sunlight.shadow.camera.far=80;
sunlight.shadow.bias=-0.00025;scene.add(sunlight);scene.add(sunlight.target);
const rimLight=new THREE.DirectionalLight(0x4db6ff,2.4);rimLight.position.set(17,7,-9);scene.add(rimLight);
const mat=(c,r=.78,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const materials={ice:mat(0x8fe2f5,.33,.1),snow:mat(0xffffff,.96),deepIce:mat(0x2588bb,.37,.06),rock:mat(0x465769,.95),rockLite:mat(0x798da5,.93),black:mat(0x171c23,.91),white:mat(0xfffaf0,1),beak:mat(0xe27b43,.8),pink:mat(0xc86f77,.91),eye:mat(0x090e16,.12),gold:mat(0xffcd41,.21,.75),lion:mat(0xd9a35b,.88),mane:mat(0x89502f,.94),nose:mat(0x2b2423,.9),tree:mat(0x2d6070,1),wood:mat(0x75523b,.88)};
const mesh=(geo,material,parent,x=0,y=0,z=0)=>{let o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
const ball=(parent,material,x,y,z,sx,sy,sz,detail=16)=>{const o=mesh(new THREE.SphereGeometry(1,detail,Math.max(10,detail>>1)),material,parent,x,y,z);o.scale.set(sx,sy,sz);return o;};
const cone=(parent,material,x,y,z,r,h,n=7)=>mesh(new THREE.ConeGeometry(r,h,n),material,parent,x,y,z);
const box=(parent,material,x,y,z,w,h,d)=>mesh(new THREE.BoxGeometry(w,h,d),material,parent,x,y,z);
const path=(a,b,r1,r2,material,parent,n=10)=>{const vec=new THREE.Vector3().subVectors(b,a);const o=mesh(new THREE.CylinderGeometry(r2,r1,vec.length(),n),material,parent);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vec.normalize());return o;};
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const world=new THREE.Group();scene.add(world);

// Sculpted-penguin character with independent flipper and foot pivots.
function penguinModel(){
  const group=new THREE.Group();
  const body=ball(group,materials.black,0,1.14,0,.58,1.13,.49,32);
  const belly=ball(group,materials.white,0,1.14,.314,.49,.97,.32,32);
  const neck=ball(group,materials.black,0,2.0,0,.41,.46,.39,28);
  const throat=ball(group,materials.white,0,1.82,.28,.29,.34,.2,24);
  const eyes=[];
  for(const sx of [-1,1]){
    ball(group,materials.white,sx*.225,2.14,.29,.09,.105,.046,24);
    eyes.push(ball(group,materials.eye,sx*.225,2.14,.336,.044,.058,.028,20));
    ball(group,materials.white,sx*.211,2.165,.356,.016,.019,.01,14);
  }
  // Beak points forward along +Z.
  const beak=cone(group,materials.beak,0,1.97,.43,.145,.34,12);
  beak.rotation.x=Math.PI/2;
  const wings=[];
  for(const s of [-1,1]){
    const pivot=new THREE.Group();pivot.position.set(s*.54,1.82,0);group.add(pivot);
    const flipper=ball(pivot,materials.black,s*.17,-.48,.03,.19,.59,.14,24);flipper.rotation.z=s*.26;
    ball(pivot,materials.rockLite,s*.19,-.48,.135,.11,.43,.015,16);
    wings.push(pivot);
  }
  const feet=[];
  for(const s of [-1,1]){
    const pivot=new THREE.Group();pivot.position.set(s*.29,.31,.01);group.add(pivot);
    path(v(0,0,0),v(0,-.18,.1),.1,.09,materials.pink,pivot);
    ball(pivot,materials.pink,0,-.24,.22,.23,.09,.3,18);
    for(const t of [-1,0,1])path(v(t*.065,-.23,.37),v(t*.115,-.245,.57),.045,.022,materials.pink,pivot,7);
    feet.push(pivot);
  }
  const tail=cone(group,materials.black,0,.49,-.46,.24,.51,8);tail.rotation.x=-.9;
  return {group,wings,feet,body,eyes};
}
const penguin=penguinModel();world.add(penguin.group);

// A sequence of separated ice platforms, all on the same playable track.
const segments=[{a:-8,b:13},{a:15.5,b:32},{a:34.4,b:50},{a:52.6,b:70},{a:72.4,b:94},{a:96.4,b:118}];
const groundTop=0.27;
function platform(a,b,i){
  const x=(a+b)/2,len=b-a;
  const ice=box(world,materials.deepIce,x,-.67,0,len,1.8,8);ice.castShadow=true;
  box(world,materials.ice,x,.05,0,len,.34,8.05);
  box(world,materials.snow,x,.245,0,len,.10,8.12);
  // Frozen ridges and snowy boulders along the distant edge of the play corridor.
  for(let j=0;j<Math.max(3,Math.floor(len/3));j++){
    const xx=a+1.1+j*2.9;
    if(xx>b-.5)continue;
    ball(world,materials.snow,xx,.23,-4.07,.48+(j%2)*.2,.2,.31,10);
  }
}
segments.forEach((p,i)=>platform(p.a,p.b,i));
const onPlatform=(x)=>segments.some(s=>x>=s.a-.12&&x<=s.b+.12);

// Ice sea below (not walkable), mountains, fir trees, snow drifts.
box(world,materials.deepIce,55,-5.5,0,140,.3,120).receiveShadow=true;
for(let i=0;i<27;i++){
 const x=-15+i*5.7;const h=5+Math.sin(i*3.67)*2.9;
 const peak=cone(world,materials.rockLite,x,-.4,-28-(i%5)*4,2.8,h,5);peak.rotation.y=i*.65;
 cone(world,materials.snow,x,h*.51-.45,-28-(i%5)*4,1.3,h*.4,5);
}
for(let i=0;i<44;i++){
 const x=-4+i*2.9;const z=(i%2===0?-1:1)*(8+(i%5)*1.8);
 const h=1.4+(i*13%7)*.18;
 cone(world,materials.tree,x,h*.5-.9,z,.53,h,7);
 cone(world,materials.snow,x,h-.8,z,.38,h*.47,7);
}
function iceRock(x,z=0,scale=1){
 const g=new THREE.Group();g.position.set(x,.32,z);world.add(g);
 const base=ball(g,materials.rock,0,.45,0,.57*scale,.46*scale,.51*scale,7);base.rotation.z=.22;
 ball(g,materials.snow,-.09,.82,0,.49*scale,.16*scale,.43*scale,9);
 return {x,half:.48*scale,type:'rock'};
}
function spikes(x,z=0){
 const g=new THREE.Group();g.position.set(x,.32,z);world.add(g);
 for(let k=0;k<3;k++){
  const spike=cone(g,materials.ice,(k-1)*.27,.56+(k%2)*.25,0,.27,.95+(k%2)*.5,5);spike.rotation.z=(k-1)*.09;
 }
 return {x,half:.55,type:'spike'};
}
const hazards=[iceRock(7),spikes(22),iceRock(28),spikes(41),iceRock(46),spikes(62),iceRock(78),spikes(86),iceRock(103)];
// A procedurally modelled lion patrols near the end, so it is a moving hazard.
function createLion(x){
 const g=new THREE.Group();world.add(g);g.position.set(x,.32,0);
 ball(g,materials.lion,0,.76,0,.88,.54,.43,20);
 ball(g,materials.mane,.65,.94,0,.59,.64,.53,20);
 ball(g,materials.lion,.94,.94,.05,.34,.34,.32,20);
 ball(g,materials.white,1.13,.86,.18,.12,.1,.15,14);
 ball(g,materials.nose,1.23,.94,.19,.09,.09,.1,12);
 for(const s of [-1,1]){
  ball(g,materials.mane,.7,1.36,s*.35,.17,.19,.15,14);
  ball(g,materials.eye,1.16,1.07,s*.21,.037,.049,.031,12);
  for(const xLeg of [-.43,.46]){
   path(v(xLeg,.55,s*.27),v(xLeg+.03,.12,s*.27),.15,.13,materials.lion,g);
   ball(g,materials.lion,xLeg+.07,.1,s*.33,.23,.11,.19,12);
  }
 }
 path(v(-.77,1.02,0),v(-1.32,.9,.06),.09,.07,materials.lion,g);
 ball(g,materials.mane,-1.37,.9,.06,.15,.13,.13,12);
 return g;
}
const lion=createLion(109);
const coinObjects=[];
function coin(x,y=1.2){
 const group=new THREE.Group();world.add(group);group.position.set(x,y,0);
 const torus=mesh(new THREE.TorusGeometry(.21,.07,9,22),materials.gold,group);torus.rotation.y=.2;
 ball(group,materials.gold,0,0,0,.14,.14,.035,18);
 coinObjects.push({x,y,group,taken:false});
}
for(let x of [3,4.3,9.7,11.1,17,18.4,24.4,25.7,29.5,36.5,38,43.3,48.1,54.2,55.5,65.3,66.5,74.7,81.5,82.8,89.1,98.4,101,106.7,114])coin(x,(x%3>1)?1.7:1.25);
const flagG=new THREE.Group();flagG.position.set(116,.27,0);world.add(flagG);
path(v(0,0,0),v(0,4,0),.08,.07,materials.wood,flagG,12);
const flag=box(flagG,mat(0x278bdf,.78),.72,3.48,0,1.42,.85,.07);flag.rotation.y=.08;
const marker=box(flagG,materials.snow,.73,3.5,.055,.5,.1,.075);marker.rotation.z=.8;

// State and keyboard/touch controls.
let status='menu',lives=3,coins=0,checkpoint=-6;
const state={x:-5.6,y:groundTop,vy:0,vx:0,grounded:true,invulnerable:0};
const pressed=new Set();let wantJump=false;
function setKey(key,down){const k=key.toLowerCase();if(down)pressed.add(k);else pressed.delete(k);}
window.addEventListener('keydown',e=>{
 if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code))e.preventDefault();
 if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW')wantJump=true;
 setKey(e.key,true);
 if(e.code==='KeyR')restart();
});
window.addEventListener('keyup',e=>setKey(e.key,false));
window.addEventListener('blur',()=>pressed.clear());
for(const [id,key] of [['left','arrowleft'],['right','arrowright']]){
 const b=document.getElementById(id);
 const down=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);setKey(key,true)};
 const up=e=>{e.preventDefault();setKey(key,false)};
 b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);
}
document.getElementById('jump').addEventListener('pointerdown',e=>{e.preventDefault();wantJump=true});
const el=id=>document.getElementById(id);
function hud(){el('coins').textContent=coins;el('lives').textContent=lives;el('distance').textContent=Math.max(0,Math.min(100,Math.floor((state.x+6)/122*100)));}
function overlay(title,body){el('notice-title').textContent=title;el('notice-body').textContent=body;el('notice').classList.remove('hidden');}
function respawn(){state.x=checkpoint;state.y=groundTop;state.vy=0;state.vx=0;state.invulnerable=2.4;}
function damage(){if(state.invulnerable>0||status!=='playing')return;lives--;hud();if(lives<=0){status='lost';overlay('GAME OVER','The ice was tough! Try again and reach the finish flag.');}else respawn();}
function win(){status='won';overlay('YOU DID IT! ❄',`The penguin reached safety with ${coins} gold coins. Well played!`);}
function restart(){status='playing';lives=3;coins=0;checkpoint=-5.6;state.x=-5.6;state.y=groundTop;state.vx=0;state.vy=0;state.grounded=true;state.invulnerable=0;coinObjects.forEach(c=>{c.taken=false;c.group.visible=true});el('notice').classList.add('hidden');el('start').classList.add('hidden');hud();}
el('play').addEventListener('click',restart);el('restart').addEventListener('click',restart);

const particlesGeo=new THREE.BufferGeometry();const pcount=750;const ppos=new Float32Array(pcount*3);
for(let i=0;i<pcount;i++){ppos[i*3]=(Math.random()-.5)*170+52;ppos[i*3+1]=Math.random()*22;ppos[i*3+2]=(Math.random()-.5)*48;}
particlesGeo.setAttribute('position',new THREE.BufferAttribute(ppos,3));
const flakes=new THREE.Points(particlesGeo,new THREE.PointsMaterial({color:0xffffff,size:.095,transparent:true,opacity:.75,depthWrite:false}));scene.add(flakes);
const clock=new THREE.Clock();let elapsed=0;
function update(dt){
 elapsed+=dt;
 const idle=status!=='playing';
 let dir=0;
 if(!idle){dir=(pressed.has('d')||pressed.has('arrowright')?1:0)-(pressed.has('a')||pressed.has('arrowleft')?1:0);}
 const target=dir*5.6;state.vx=THREE.MathUtils.damp(state.vx,target,dir?9:12,dt);
 if(!idle){
  state.x+=state.vx*dt;
  state.x=Math.max(-6.5,Math.min(118,state.x));
  if(wantJump&&state.grounded){state.vy=9.2;state.grounded=false;}
  wantJump=false;
  if(!state.grounded){state.vy-=22*dt;state.y+=state.vy*dt;}
  if(state.vy<=0&&onPlatform(state.x)&&state.y<=groundTop&&state.y>=groundTop-.45){state.y=groundTop;state.vy=0;state.grounded=true;}
  else if(!onPlatform(state.x)||state.y>groundTop+.02)state.grounded=false;
  if(state.y< -3.7)damage();
  state.invulnerable=Math.max(0,state.invulnerable-dt);
  if(state.invulnerable===0){
   for(const h of hazards){if(Math.abs(state.x-h.x)<h.half+.31&&state.y<1.0){damage();break;}}
   const lx=109+Math.sin(elapsed*1.45)*2.15;
   if(Math.abs(state.x-lx)<1.28&&state.y<1.8)damage();
  }
  for(const c of coinObjects){if(!c.taken&&Math.abs(state.x-c.x)<.63&&Math.abs(state.y+1.25-c.y)<.8){c.taken=true;c.group.visible=false;coins++;}}
  if(state.x>=116.2)win();
  if(state.x>35&&checkpoint<34)checkpoint=35;
  if(state.x>73&&checkpoint<72)checkpoint=73;
  if(state.x>98&&checkpoint<97)checkpoint=98;
 }
 penguin.group.position.set(state.x,state.y,0);
 penguin.group.visible=state.invulnerable<=0||Math.floor(elapsed*13)%2===0;
 penguin.group.rotation.y=THREE.MathUtils.damp(penguin.group.rotation.y,dir<0?-1.1:dir>0?1.1:0,7,dt);
 const run=state.grounded?Math.min(1,Math.abs(state.vx)/3):.22;
 penguin.group.rotation.z=Math.sin(elapsed*12)*.035*run;
 penguin.wings[0].rotation.z=Math.sin(elapsed*12)*.17*run-.10;
 penguin.wings[1].rotation.z=-Math.sin(elapsed*12)*.17*run+.10;
 penguin.feet[0].rotation.x=Math.sin(elapsed*12)*.5*run;
 penguin.feet[1].rotation.x=-Math.sin(elapsed*12)*.5*run;
 penguin.body.scale.y=1.13+Math.sin(elapsed*2)*.008;
 lion.position.x=109+Math.sin(elapsed*1.45)*2.15;
 lion.rotation.y=Math.sin(elapsed*1.45)>0?0:Math.PI;
 lion.position.y=.32+Math.abs(Math.sin(elapsed*3))*.045;
 for(const c of coinObjects)if(!c.taken){c.group.rotation.y+=dt*2;c.group.position.y=c.y+Math.sin(elapsed*3+c.x)*.095;}
 const snowPos=particlesGeo.attributes.position;
 for(let i=0;i<pcount;i++){let y=snowPos.getY(i)-dt*(.5+(i%7)*.12);if(y<-.8)y=20;snowPos.setY(i,y);}snowPos.needsUpdate=true;
 hud();
 const camX=state.x-5.4;
 const camGoal=v(camX,5.5,15.3);
 camera.position.lerp(camGoal,1-Math.exp(-3*dt));
 const focus=v(state.x+4.3,1.55,0);
 camera.lookAt(focus);
 sunlight.position.x=state.x-10;sunlight.target.position.x=state.x;
}
function animate(){requestAnimationFrame(animate);let dt=Math.min(.05,clock.getDelta());update(dt);renderer.render(scene,camera);}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));});
// Starting frame displays the real 3D scene behind the start menu.
penguin.group.position.set(state.x,state.y,0);camera.position.set(-10,5.5,15.3);camera.lookAt(-1,1.55,0);animate();