import * as THREE from 'three';
import './style.css';

const $ = id => document.getElementById(id);
const CHARS=[
 {id:'penguin',name:'Pip the Penguin',cost:0,icon:'🐧',color:0x181f2b},
 {id:'fox',name:'Frost the Fox',cost:120,icon:'🦊',color:0xe57936},
 {id:'seal',name:'Splash the Seal',cost:260,icon:'🦭',color:0x869da9},
 {id:'bear',name:'Boris the Bear',cost:450,icon:'🐻‍❄️',color:0xf5f4ed},
 {id:'royal',name:'Royal Penguin',cost:700,icon:'👑',color:0x4c8fe8},
];
const KEY='penguin-ice-runner-v2';
let saved;
try { saved=JSON.parse(localStorage.getItem(KEY)||'{}'); } catch { saved={}; }
const profile={coins:Math.max(0,Number(saved.coins)||0),best:Math.max(0,Number(saved.best)||0),unlocked:Array.isArray(saved.unlocked)?saved.unlocked:['penguin'],selected:saved.selected||'penguin'};
if(!profile.unlocked.includes('penguin'))profile.unlocked.push('penguin');
if(!profile.unlocked.includes(profile.selected))profile.selected='penguin';
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(profile))}catch{}};
let running=false,paused=false,ended=false,playerLane=1,targetLane=1,playerY=0,velocityY=0,sliding=0,shield=0,magnet=0,boost=0,energy=100,runCoins=0,distance=0,speed=10,clockTime=0,spawnNext=25,invincible=0;
const laneX=[-2.6,0,2.6],entities=[],decor=[],scrollItems=[],hue={ice:0x64c7ee,snow:0xecfaff,rock:0x50697c};
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x80caef);scene.fog=new THREE.FogExp2(0xb9e8ff,.014);
const camera=new THREE.PerspectiveCamera(57,innerWidth/innerHeight,.1,300);
camera.position.set(0,6.1,13.7);camera.lookAt(0,1,-18);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd5f4ff,0x3f8bae,2.7));
const sun=new THREE.DirectionalLight(0xfffaf1,3.2);sun.position.set(-7,16,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-16;sun.shadow.camera.right=16;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-22;sun.shadow.camera.near=1;sun.shadow.camera.far=70;scene.add(sun);
const glow=new THREE.DirectionalLight(0x379cf5,1.6);glow.position.set(6,4,-13);scene.add(glow);
const mat=(c,r=.85,metalness=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness});
const snowMat=mat(0xf3fbff),iceMat=mat(0x8fddf1,.27,.12),deepIce=mat(0x309ac8,.38,.1),rockMat=mat(0x627589),dark=mat(0x1a222d),white=mat(0xfffcf3),pink=mat(0xdb8584),gold=mat(0xffd64f,.28,.65),energyMat=mat(0x41e6ad,.3,.18),powerMat=mat(0xbb81ff,.3,.3),wood=mat(0x7c5638);
const sphere=new THREE.SphereGeometry(1,18,12),cube=new THREE.BoxGeometry(1,1,1),coneGeo=new THREE.ConeGeometry(1,1,7);
function part(parent,geo,m,x=0,y=0,z=0,sx=1,sy=1,sz=1){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
const orb=(p,m,x,y,z,sx,sy,sz)=>part(p,sphere,m,x,y,z,sx,sy,sz);
function model(id){
 const group=new THREE.Group(),skin=mat(CHARS.find(c=>c.id===id).color),ear=mat(0x98533a),tan=mat(0xf7e9d8),black=mat(0x090d12,.2);
 const pivotL=new THREE.Group(),pivotR=new THREE.Group();group.add(pivotL,pivotR);
 if(id==='penguin'||id==='royal'){
  orb(group,skin,0,1.05,0,.52,.83,.43);orb(group,white,0,1.06,.3,.43,.69,.19);
  orb(group,skin,0,1.94,.03,.44,.42,.39);
  for(let s of [-1,1]){orb(group,white,s*.22,2.01,.33,.085,.09,.04);orb(group,black,s*.22,2.01,.372,.038,.047,.02)}
  const beak=part(group,new THREE.ConeGeometry(.13,.34,10),mat(0xe98940),0,1.81,.46);beak.rotation.x=Math.PI/2;
  pivotL.position.set(-.45,1.55,0);pivotR.position.set(.45,1.55,0);
  orb(pivotL,skin,-.13,-.22,0,.17,.43,.14).rotation.z=-.24;
  orb(pivotR,skin,.13,-.22,0,.17,.43,.14).rotation.z=.24;
  for(let s of [-1,1]){orb(group,pink,s*.24,.16,.2,.19,.1,.29)}
  if(id==='royal'){part(group,new THREE.CylinderGeometry(.24,.31,.25,7),gold,0,2.44,0);for(let x of [-.18,0,.18])part(group,new THREE.ConeGeometry(.09,.2,4),gold,x,2.65,0)}
 } else if(id==='fox'){
  orb(group,skin,0,1.06,0,.56,.69,.42);orb(group,white,0,1.0,.36,.4,.49,.14);
  orb(group,skin,0,1.83,.03,.47,.42,.4);
  for(let s of [-1,1]){part(group,new THREE.ConeGeometry(.18,.44,6),skin,s*.3,2.32,0);orb(group,black,s*.2,1.87,.36,.052,.06,.028)}
  orb(group,white,0,1.65,.37,.22,.14,.22);orb(group,black,0,1.69,.55,.09,.065,.07);
  pivotL.position.set(-.52,1.44,0);pivotR.position.set(.52,1.44,0);
  orb(pivotL,skin,0,-.3,.02,.18,.4,.18);orb(pivotR,skin,0,-.3,.02,.18,.4,.18);
  for(let s of [-1,1])orb(group,skin,s*.25,.17,.15,.2,.2,.23);
  const tail=orb(group,skin,.42,.94,-.53,.29,.31,.62);tail.rotation.z=.7;
 } else if(id==='seal'){
  orb(group,skin,0,.88,.0,.67,.83,.67);orb(group,skin,0,1.73,.07,.54,.48,.49);
  orb(group,tan,0,1.43,.49,.39,.27,.2);
  for(let s of [-1,1]){orb(group,black,s*.25,1.82,.48,.052,.057,.025);orb(group,skin,s*.53,.46,0,.31,.12,.37)}
  orb(group,black,0,1.57,.65,.085,.065,.055);
  pivotL.position.set(-.52,1.14,0);pivotR.position.set(.52,1.14,0);
  orb(pivotL,skin,-.15,-.31,.1,.24,.42,.14).rotation.z=.36;
  orb(pivotR,skin,.15,-.31,.1,.24,.42,.14).rotation.z=-.36;
 } else {
  orb(group,skin,0,1.04,0,.66,.81,.49);orb(group,skin,0,1.87,.06,.57,.48,.48);
  for(let s of [-1,1]){orb(group,skin,s*.44,2.19,-.03,.16,.18,.15);orb(group,dark,s*.24,1.96,.48,.048,.052,.025)}
  orb(group,white,0,1.68,.46,.32,.2,.19);orb(group,dark,0,1.77,.62,.09,.07,.06);
  pivotL.position.set(-.6,1.38,0);pivotR.position.set(.6,1.38,0);
  orb(pivotL,skin,0,-.27,0,.23,.42,.2);orb(pivotR,skin,0,-.27,0,.23,.42,.2);
  for(let s of [-1,1])orb(group,skin,s*.3,.17,.24,.26,.14,.32);
 }
 return {group,pivotL,pivotR};
}
let character=model(profile.selected);scene.add(character.group);
function swapCharacter(){scene.remove(character.group);character=model(profile.selected);scene.add(character.group)}
// Endless segments are recycled instead of spawning unlimited geometry.
for(let i=0;i<14;i++){
 const g=new THREE.Group();scene.add(g);scrollItems.push(g);
 part(g,cube,deepIce,0,-.65,0,9,1.5,18);
 part(g,cube,iceMat,0,.06,0,9,.19,18);
 part(g,cube,snowMat,0,.16,0,9,.12,18.1);
 for(const x of [-1.3,1.3]) part(g,cube,deepIce,x,.245,0,.055,.024,18);
 for(const x of [-5.3,5.3]){
  const ridge=orb(g,snowMat,x,-.16,-1.5,1.2,.48,2);ridge.rotation.z=.05;
  for(let j=0;j<3;j++)part(g,coneGeo,iceMat,x+(j-1)*.6,.7,-5, .36,.88+(j%2)*.45,.36);
 }
}
// distant stationary mountain silhouettes and arctic backdrop.
for(let i=0;i<22;i++){
 const x=(i-11)*10;
 const h=11+(Math.sin(i*4.11)+1)*5;
 part(scene,new THREE.ConeGeometry(5,h,5),rockMat,x,h*.5-3,-95-(i%3)*9);
 part(scene,new THREE.ConeGeometry(2.4,h*.37,5),snowMat,x,h*.79-3,-95-(i%3)*9);
}
function makeObject(kind,lane,at){
 const root=new THREE.Group();scene.add(root);let radius=.7;
 const x=laneX[lane];
 if(kind==='rock'){orb(root,rockMat,0,.59,0,.86,.69,.68);orb(root,snowMat,-.15,1.13,-.03,.65,.23,.53);radius=.78;}
 else if(kind==='spike'){for(let i=0;i<3;i++)part(root,coneGeo,iceMat,(i-1)*.33,.65+(i%2)*.22,0,.36,.72+(i%2)*.38,.36);radius=.72;}
 else if(kind==='log'){part(root,cube,wood,0,.67,0,1.65,1.06,.4);for(let i=-1;i<=1;i++)orb(root,snowMat,i*.47,1.25,0,.38,.16,.29);radius=.8;}
 else if(kind==='coin'){part(root,new THREE.TorusGeometry(.33,.11,9,18),gold,0,1.12,0);radius=.42;}
 else if(kind==='energy'){orb(root,energyMat,0,1.2,0,.35,.48,.35);orb(root,white,0,1.2,.3,.12,.25,.07);radius=.48;}
 else if(kind==='shield'||kind==='magnet'){part(root,new THREE.OctahedronGeometry(.44),kind==='shield'?iceMat:powerMat,0,1.27,0);radius=.5;}
 else if(kind==='lion'){
   const coat=mat(0xdba45b),mane=mat(0x985127);
   orb(root,coat,0,.78,0,.7,.55,.52);orb(root,mane,0,1.4,.12,.56,.59,.52);
   orb(root,coat,0,1.41,.55,.38,.36,.34);orb(root,dark,0,1.37,.86,.09,.07,.09);
   for(let s of [-1,1]){orb(root,dark,s*.19,1.54,.83,.05,.06,.03);orb(root,coat,s*.43,.3,.24,.23,.3,.23)}
   radius=.9;
 }
 root.position.set(x,0,-(at-distance));entities.push({kind,lane,at,root,radius,taken:false});
}
function row(at){
 let blocked=new Set();
 const difficulty=Math.min(1,distance/1400);
 const count=Math.random()<.25+difficulty*.43?2:1;
 while(blocked.size<count)blocked.add(Math.floor(Math.random()*3));
 for(const lane of blocked){
   const types=['rock','spike','log','lion'];
   makeObject(types[Math.floor(Math.random()*(distance>450?4:3))],lane,at);
 }
 for(let lane=0;lane<3;lane++)if(!blocked.has(lane)){
   if(Math.random()<.85){for(let i=0;i<3;i++)makeObject('coin',lane,at+2.0+i*1.2);}
   if(Math.random()<.24)makeObject('energy',lane,at+5.9);
   if(Math.random()<.055)makeObject(Math.random()<.5?'shield':'magnet',lane,at+7);
 }
}
function clearObjects(){for(const e of entities)scene.remove(e.root);entities.length=0}
function showScreen(title,message,buttons){
 const screen=$('overlay');screen.classList.remove('hidden');
 $('screenTitle').textContent=title;$('screenText').textContent=message;
 const actions=$('screenActions');actions.replaceChildren();
 for(const b of buttons){const btn=document.createElement('button');btn.textContent=b.text;btn.className=b.secondary?'secondary':'';btn.onclick=b.action;actions.appendChild(btn)}
}
function shop(){
 running=false;paused=false;$('shop').classList.remove('hidden');$('overlay').classList.add('hidden');
 const grid=$('charGrid');grid.replaceChildren();
 for(const c of CHARS){
  const unlocked=profile.unlocked.includes(c.id),selected=profile.selected===c.id;
  const button=document.createElement('button');button.className='char-card'+(selected?' selected':'');
  button.innerHTML='<span class="char-emoji">'+c.icon+'</span><strong>'+c.name+'</strong><small>'+(selected?'SELECTED':unlocked?'USE CHARACTER':'🪙 '+c.cost)+'</small>';
  button.onclick=()=>{
   if(unlocked){profile.selected=c.id;swapCharacter();save();shop();}
   else if(profile.coins>=c.cost){profile.coins-=c.cost;profile.unlocked.push(c.id);profile.selected=c.id;swapCharacter();save();shop();}
   else {$('shopMessage').textContent='Collect more gold coins to unlock '+c.name;}
  };
  grid.appendChild(button);
 }
 $('wallet').textContent=profile.coins;
}
function menu(){
 running=false;paused=false;$('shop').classList.add('hidden');updateHUD();
 showScreen('POLAR DASH','An endless ice adventure. Switch lanes, jump obstacles, collect energy and unlock new animal friends.',[
  {text:'START RUN',action:start},{text:'CHARACTERS & SHOP',secondary:true,action:shop}
 ]);
}
function start(){
 running=true;paused=false;ended=false;playerLane=1;targetLane=1;playerY=0;velocityY=0;sliding=0;shield=0;magnet=0;boost=0;energy=100;runCoins=0;distance=0;speed=10;spawnNext=26;invincible=1;
 clearObjects();$('overlay').classList.add('hidden');$('shop').classList.add('hidden');$('pauseBtn').textContent='Ⅱ';
 for(let i=0;i<8;i++){row(spawnNext);spawnNext+=17;}
}
function finish(reason){
 if(ended)return;ended=true;running=false;
 const points=Math.floor(distance);
 profile.coins+=runCoins;profile.best=Math.max(profile.best,points);save();updateHUD();
 showScreen('RUN COMPLETE',reason+' Distance: '+points+'m · Coins: +'+runCoins+' · Best: '+profile.best+'m',[
  {text:'RUN AGAIN',action:start},{text:'CHARACTER SHOP',secondary:true,action:shop}
 ]);
}
function crash(){
 if(shield>0){shield=0;invincible=1.6;return;}
 finish('You hit an obstacle.');
}
function moveLane(n){if(!running||paused)return;targetLane=THREE.MathUtils.clamp(targetLane+n,0,2);}
function jump(){if(running&&!paused&&playerY<=.02&&sliding<=0)velocityY=10.0}
function slide(){if(running&&!paused&&playerY<=.02)sliding=.8}
function updateHUD(){
 $('distance').textContent=Math.floor(distance);$('coins').textContent=runCoins;$('energy').textContent=Math.ceil(energy);
 $('energyFill').style.width=energy+'%';
 $('walletHud').textContent=profile.coins;
 $('power').textContent=shield>0?'🛡 '+Math.ceil(shield)+'s':magnet>0?'🧲 '+Math.ceil(magnet)+'s':'';
}
$('pauseBtn').onclick=()=>{if(!running)return;paused=!paused;$('pauseBtn').textContent=paused?'▶':'Ⅱ';$('pauseBanner').classList.toggle('hidden',!paused)};
$('shopBack').onclick=menu;
$('startFromShop').onclick=start;
$('soundBtn').onclick=()=>{$('soundBtn').textContent=$('soundBtn').textContent==='SOUND: OFF'?'SOUND: ON':'SOUND: OFF'};
const keys=new Set();
addEventListener('keydown',e=>{
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
 if(keys.has(e.code)&&e.repeat)return;keys.add(e.code);
 if(e.code==='ArrowLeft'||e.code==='KeyA')moveLane(-1);
 if(e.code==='ArrowRight'||e.code==='KeyD')moveLane(1);
 if(e.code==='ArrowUp'||e.code==='KeyW'||e.code==='Space')jump();
 if(e.code==='ArrowDown'||e.code==='KeyS')slide();
 if(e.code==='KeyP')$('pauseBtn').click();
});
addEventListener('keyup',e=>keys.delete(e.code));
let touch=null;
renderer.domElement.addEventListener('pointerdown',e=>touch={x:e.clientX,y:e.clientY});
renderer.domElement.addEventListener('pointerup',e=>{
 if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;
 if(Math.abs(dx)<25&&Math.abs(dy)<25){jump();return;}
 if(Math.abs(dx)>Math.abs(dy))moveLane(dx>0?1:-1);
 else if(dy<0)jump();else slide();
});
const snowPos=new Float32Array(350*3);
for(let i=0;i<350;i++){snowPos[i*3]=(Math.random()-.5)*36;snowPos[i*3+1]=Math.random()*19;snowPos[i*3+2]=-Math.random()*85;}
const flakesGeo=new THREE.BufferGeometry();flakesGeo.setAttribute('position',new THREE.BufferAttribute(snowPos,3));
const flakes=new THREE.Points(flakesGeo,new THREE.PointsMaterial({color:0xffffff,size:.075,transparent:true,opacity:.77,depthWrite:false}));scene.add(flakes);
let last=performance.now();
function tick(now){
 requestAnimationFrame(tick);
 const dt=Math.min(.043,(now-last)/1000);last=now;
 if(running&&!paused){
  clockTime+=dt;distance+=speed*dt;speed=Math.min(24,10+distance*.007);
  energy=Math.max(0,energy-dt*(1.1+speed*.025));if(energy<=0)finish('You ran out of energy.');
  playerLane=THREE.MathUtils.damp(playerLane,targetLane,13,dt);
  if(playerY>.001||velocityY>0){velocityY-=25*dt;playerY=Math.max(0,playerY+velocityY*dt);if(playerY===0)velocityY=0;}
  sliding=Math.max(0,sliding-dt);shield=Math.max(0,shield-dt);magnet=Math.max(0,magnet-dt);invincible=Math.max(0,invincible-dt);
  while(spawnNext<distance+150){row(spawnNext);spawnNext+=Math.max(12,19-distance/290);}
  for(const e of [...entities]){
   e.root.position.z=-(e.at-distance);
   if(e.kind==='coin'||e.kind==='energy'||e.kind==='shield'||e.kind==='magnet'){
     e.root.rotation.y+=dt*2.8;e.root.position.y=Math.sin(clockTime*4+e.at)*.09;
     if(magnet>0&&e.kind==='coin'&&Math.abs(e.at-distance)<9)e.root.position.x=THREE.MathUtils.damp(e.root.position.x,laneX[Math.round(playerLane)],7,dt);
   } else if(e.kind==='lion') e.root.rotation.y=Math.sin(clockTime*3)*.25;
   const isPick=['coin','energy','shield','magnet'].includes(e.kind);
   const sameLane=Math.abs(e.root.position.x-laneX[playerLane>2?2:Math.round(playerLane)])<(.7+(isPick?.55:0));
   if(Math.abs(e.at-distance)<.73&&!e.taken&&sameLane){
    if(isPick){
      if(e.kind==='coin')runCoins++;
      if(e.kind==='energy')energy=Math.min(100,energy+29);
      if(e.kind==='shield')shield=13;
      if(e.kind==='magnet')magnet=11;
      e.taken=true;e.root.visible=false;
    }else if(invincible<=0){
      const above=playerY>1.15, duck=sliding>0&&e.kind==='log';
      if(!above&&!duck)crash();
    }
   }
   if(e.at<distance-13){scene.remove(e.root);entities.splice(entities.indexOf(e),1)}
  }
  for(let i=0;i<scrollItems.length;i++){const segment=scrollItems[i];const position=(i*18-(distance%252));segment.position.z=-position+(-117);}
  for(let i=0;i<350;i++){
   snowPos[i*3+1]-=dt*(.9+(i%5)*.2);
   snowPos[i*3+2]+=dt*speed*.4;
   if(snowPos[i*3+1]<0)snowPos[i*3+1]=19;
   if(snowPos[i*3+2]>14)snowPos[i*3+2]=-88;
  }
  flakesGeo.attributes.position.needsUpdate=true;
  updateHUD();
 }
 character.group.position.set(laneX[0]+(laneX[2]-laneX[0])*playerLane/2,playerY,2);
 character.group.rotation.z=Math.sin(clockTime*14)*.04*(running&&!paused?1:0);
 character.group.scale.y=sliding>0?.55:1;
 const run=running&&!paused?1:0;
 character.pivotL.rotation.x=Math.sin(clockTime*13)*.32*run;
 character.pivotR.rotation.x=-Math.sin(clockTime*13)*.32*run;
 const desiredX=character.group.position.x*.28;
 camera.position.x=THREE.MathUtils.damp(camera.position.x,desiredX,2,dt);
 camera.lookAt(camera.position.x*.3,1.4,-17);
 renderer.render(scene,camera);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6))});
menu();requestAnimationFrame(tick);
