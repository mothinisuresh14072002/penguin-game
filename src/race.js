import * as THREE from 'three';
import './race.css';
import {createAnimal, animateAnimal} from './animalArt.js';
import {populateHabitat} from './worldArt.js';
import { FINISH_DISTANCE, LANE_POSITIONS, clampLane, raceSpeed, spawnSpacing, trackLoop, rowPattern, rowRandom, pickupTouch, crossedDistance } from './raceMath.js';

const $ = id => document.getElementById(id);
const CHARACTERS = [
 {id:'bunny',name:'Bella Bunny',emoji:'🐰',color:0xf9e5ef,sky:0x9cdcf9,ground:0x88cc79,road:0xbbe2a2,accent:0xff9cc8,scenery:'flowers',hazards:['rock','log']},
 {id:'unicorn',name:'Ula Unicorn',emoji:'🦄',color:0xeedfff,sky:0xc5aaf9,ground:0xe1ccf7,road:0xf7eaff,accent:0xffb2dc,scenery:'crystals',hazards:['spike','rock']},
 {id:'horse',name:'Hugo Horse',emoji:'🐴',color:0xc48e5e,sky:0xa4dafc,ground:0x86bb67,road:0xddca9e,accent:0xffda87,scenery:'hay',hazards:['log','rock']},
 {id:'cat',name:'Coco Cat',emoji:'🐱',color:0xf5b675,sky:0x9fcbeb,ground:0xc5b0a0,road:0xe6d1c4,accent:0xffc282,scenery:'town',hazards:['log','rock']},
 {id:'dog',name:'Dodo Dog',emoji:'🐶',color:0xd09b6c,sky:0x99e1fe,ground:0x83c97a,road:0xc2dfa2,accent:0xffd58b,scenery:'trees',hazards:['log','rock']},
 {id:'penguin',name:'Pip Penguin',emoji:'🐧',color:0x1e2636,sky:0x80c3eb,ground:0xe8f8ff,road:0xb0e5f9,accent:0x76e9ff,scenery:'ice',hazards:['spike','rock']},
 {id:'cow',name:'Mimi Cow',emoji:'🐮',color:0xf8f3ed,sky:0xbadfff,ground:0x9bc77b,road:0xdcc89d,accent:0xffd28c,scenery:'farm',hazards:['log','rock']}
];
const geom = {
 ball:new THREE.SphereGeometry(1,14,10),
 box:new THREE.BoxGeometry(1,1,1),
 cone:new THREE.ConeGeometry(1,1,7),
 torus:new THREE.TorusGeometry(.32,.09,7,13),
 cylinder:new THREE.CylinderGeometry(1,1,1,8)
};
const bodyMat = color => new THREE.MeshStandardMaterial({color,roughness:.76});
const renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(1.35,window.devicePixelRatio || 1));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;
renderer.autoClear=false;
renderer.domElement.style.touchAction='none';
document.body.prepend(renderer.domElement);

const disposables = new Set();
function material(color){const m=bodyMat(color);disposables.add(m);return m}
function piece(parent,geo,mat,x,y,z,sx=1,sy=1,sz=1){
 const mesh=new THREE.Mesh(geo,mat);
 mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;
}
function ball(parent,mat,x,y,z,sx,sy,sz){return piece(parent,geom.ball,mat,x,y,z,sx,sy,sz)}
function createHero(id,scene){
 const actor=createAnimal(id);
 scene.add(actor.group);
 actor.group.rotation.y=Math.PI;
 const shadowMaterial=new THREE.MeshBasicMaterial({color:0x284b66,transparent:true,opacity:.32,depthWrite:false});
 disposables.add(shadowMaterial);
 const shadow=piece(scene,geom.ball,shadowMaterial,0,.25,2,.8,.025,.48);
 return {...actor,shadow};
}
function prop(scene,type,ch,x,z,index){
 const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
 populateHabitat(group,type,index,(parent,geo,color,xx,yy,zz,sx,sy,sz)=>
  piece(parent,geo,material(color),xx,yy,zz,sx,sy,sz));
 return group;
}
function newRacePlayer(ch,index){
 const scene=new THREE.Scene();
 scene.background=new THREE.Color(ch.sky);scene.fog=new THREE.FogExp2(ch.sky,.012);
 scene.add(new THREE.HemisphereLight(0xecfbff,0x728da1,2.8));
 const sun=new THREE.DirectionalLight(0xfff5e5,2.4);sun.position.set(-8,15,6);scene.add(sun);
 const camera=new THREE.PerspectiveCamera(63,1,.1,290);
 camera.position.set(0,6.1,13.6);camera.lookAt(0,1.1,-17);
 const turf=material(ch.ground),road=material(ch.road),border=material(ch.accent);
 piece(scene,geom.box,turf,0,-.74,-105,30,1.25,255);
 piece(scene,geom.box,road,0,-.04,-105,9.1,.17,255);
 for(const x of [-4.58,4.58])piece(scene,geom.box,border,x,.07,-105,.23,.24,255);
 const laneMarks=[];
 const markMaterial=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.56,depthWrite:false});disposables.add(markMaterial);
 for(let i=0;i<48;i++){
  const o=piece(scene,geom.box,markMaterial,i%2===0?-1.3:1.3,.06,0,.085,.026,1.9);
  laneMarks.push(o);
 }
 // Layered distant mountains give the runner a natural horizon.
 for(let i=0;i<14;i++){
  const x=(i-7)*10, h=10+rowRandom(i,4)*13;
  piece(scene,geom.cone,material(index===0?0xa0c2c4:0xa7bddc),x,h*.48-3,-100-i%3*11,5,h,5);
  piece(scene,geom.cone,material(0xe7f7fa),x,h*.81-3,-100-i%3*11,2.1,h*.32,2.1);
 }
 const skyClouds=[],cloudMat=material(0xffffff);
 for(let i=0;i<14;i++){
  const cloud=new THREE.Group();
  for(let k=-1;k<=1;k++)ball(cloud,cloudMat,k*.83,Math.abs(k)*-.1,0,.91,k===0?.73:.49,.57);
  scene.add(cloud);skyClouds.push(cloud);
 }
 const scenery=[];
 for(let i=0;i<46;i++){
  const x=(i%2===0?-1:1)*(9+(i%3)*1.7),z=14-Math.floor(i/2)*12;
  scenery.push(prop(scene,ch.scenery,ch,x,z,i));
 }
 const hero=createHero(ch.id,scene);
 return {scene,camera,hero,ch,index,distance:0,coins:0,energy:100,hit:0,lane:1,target:1,y:0,vy:0,slide:0,stun:0,invuln:0,time:0,objects:[],spawnRow:0,nextSpawn:28,scenery,laneMarks,skyClouds,done:false,step:0,noticeUntil:0};
}
function obstacle(player,kind,lane,at){
 const root=new THREE.Group();root.position.set(LANE_POSITIONS[lane],0,2-(at-player.distance));player.scene.add(root);
 const rock=material(0x708493),wood=material(0xb07c52),snow=material(0xf9f9ed),gold=material(0xffd95d);
 let pickup=false;
 if(kind==='rock'){
  ball(root,rock,0,.56,0,.73,.62,.66);
  ball(root,snow,-.16,1.03,0,.5,.18,.49);
 }else if(kind==='spike'){
  for(let i=-1;i<=1;i++)piece(root,geom.cone,material(0x8de7f5),i*.30,.62+Math.abs(i)*-.15,0,.31,.9,.31);
 }else if(kind==='log'){
  piece(root,geom.box,wood,0,.79,0,1.68,1.02,.48);
  piece(root,geom.box,snow,0,1.33,0,1.66,.13,.46);
 }else if(kind==='coin'){
  const c=piece(root,geom.torus,gold,0,1.14,0,1,1,1);
  c.rotation.x=.16;pickup=true;
 }else if(kind==='energy'){
  ball(root,material(0x40f3b0),0,1.19,0,.31,.4,.33);
  ball(root,snow,0,1.18,.27,.11,.21,.06);pickup=true;
 }
 player.objects.push({root,kind,at,lane,pickup,taken:false});
}
function spawnRow(player){
 const row=player.spawnRow++;
 const at=player.nextSpawn;
 const pattern=rowPattern(row,at);
 for(const lane of pattern.blocked){
  const kind=player.ch.hazards[Math.floor(rowRandom(row,lane+6)*player.ch.hazards.length)];
  obstacle(player,kind,lane,at);
 }
 const rewardLane=pattern.safe[Math.floor(rowRandom(row,11)*pattern.safe.length)];
 for(let i=0;i<4;i++)obstacle(player,'coin',rewardLane,at+2.2+i*1.45);
 if(row%3===1)obstacle(player,'energy',pattern.safe[0],at+10);
 player.nextSpawn+=spawnSpacing(raceSpeed(at));
}
function clearPlayer(player){
 const geometries=new Set(),materials=new Set();
 player.scene.traverse(object=>{
  if(!object.isMesh)return;
  if(object.geometry&&!Object.values(geom).includes(object.geometry))geometries.add(object.geometry);
  const list=Array.isArray(object.material)?object.material:[object.material];
  for(const m of list)if(m)materials.add(m);
 });
 for(const g of geometries)g.dispose();
 for(const m of materials)m.dispose();
}
let racers=[],playing=false,paused=false,finished=false,last=performance.now(),elapsed=0,noticeCooldown=0;
let audio=null;
function beep(freq=500,duration=.11,volume=.03){
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume();
  const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;
  osc.type='triangle';osc.frequency.setValueAtTime(freq,t);
  gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
  osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+duration);
 }catch{}
}
function showNotice(p,message){const e=$('p'+(p.index+1)+'Notice');e.textContent=message;p.noticeUntil=p.time+1.5;}
function setResult(message){
 finished=true;playing=false;paused=false;$('raceOverlay').classList.remove('hidden');$('raceSetup').hidden=true;$('raceResult').hidden=false;
 $('raceTitle').textContent='🏆 RACE FINISHED';$('raceMessage').textContent=message;
 $('raceResult').textContent=racers.map((p,i)=>'P'+(i+1)+' · '+p.ch.emoji+' '+p.ch.name+': '+Math.floor(p.distance)+'m, '+p.coins+' coins, '+p.hit+' hits').join('  |  ');
 $('raceStart').textContent='🔁 RACE AGAIN';$('pauseLabel').hidden=true;
 beep(800,.25,.045);
}
function findWinner(){
 const [a,b]=racers;
 if(a.distance>=FINISH_DISTANCE||b.distance>=FINISH_DISTANCE) {
  const winner=a.distance>=FINISH_DISTANCE&&b.distance>=FINISH_DISTANCE?null:a.distance>=FINISH_DISTANCE?a:b;
  setResult(winner?'🔱 Player '+(winner.index+1)+' wins the race!':"It's a photo finish — a tie!");
 }else if(a.energy<=0||b.energy<=0){
  if(a.energy<=0&&b.energy<=0)setResult('Both runners ran out of energy — draw!');
  else setResult('🏆 Player '+(a.energy>0?1:2)+' wins! The other runner ran out of energy.');
 }else if(elapsed>120){
  const winner=a.distance===b.distance?null:a.distance>b.distance?a:b;
  setResult(winner?'🏆 Player '+(winner.index+1)+' wins on distance!':"It's a draw!");
 }
}
function updatePlayer(p,dt){
 p.time+=dt;const currentSpeed=raceSpeed(p.distance),moving=p.stun>0?.37:1;
 p.stun=Math.max(0,p.stun-dt);p.invuln=Math.max(0,p.invuln-dt);
 const previousDistance=p.distance;
 p.distance+=currentSpeed*moving*dt;
 p.energy=Math.max(0,p.energy-dt*(.96+currentSpeed*.014));
 p.lane=THREE.MathUtils.damp(p.lane,p.target,16,dt);
 if(p.vy>0||p.y>0){
  p.vy-=29*dt;p.y=Math.max(0,p.y+p.vy*dt);if(p.y===0)p.vy=0;
 }
 p.slide=Math.max(0,p.slide-dt);
 while(p.nextSpawn<p.distance+160)spawnRow(p);
 const px=LANE_POSITIONS[0]+(LANE_POSITIONS[2]-LANE_POSITIONS[0])*p.lane;
 for(const e of p.objects){
  e.root.position.z=2-(e.at-p.distance);
  if(e.pickup){e.root.rotation.y+=dt*3;e.root.position.y=Math.sin(p.time*4+e.at)*.07}
  if(!e.taken&&crossedDistance(previousDistance,p.distance,e.at)){
   if(e.pickup){
    const y=e.kind==='energy'?1.19:1.14;
    if(pickupTouch(e.root.position.x,e.root.position.z,y+e.root.position.y,px,2,p.y)){
     e.taken=true;e.root.visible=false;
     if(e.kind==='coin'){p.coins++;if(p.coins%10===0)showNotice(p,'✨ '+p.coins+' COINS!');beep(780+p.coins%6*43,.055,.016)}
     else {p.energy=Math.min(100,p.energy+28);showNotice(p,'⚡ ENERGY +28');beep(550,.12,.025)}
    }
   }else if(Math.abs(e.root.position.x-px)<.91&&p.invuln<=0){
    if(!(p.y>1.15||p.slide>.05&&e.kind==='log')){
     p.hit++;p.energy=Math.max(0,p.energy-13);p.invuln=1.35;p.stun=1.1;
     showNotice(p,'💥 -13 ENERGY · SLOWED');beep(180,.25,.055);
    }
   }
  }
 }
 for(let i=p.objects.length-1;i>=0;i--){
  if(p.objects[i].at<p.distance-12){p.scene.remove(p.objects[i].root);p.objects.splice(i,1)}
 }
 for(let i=0;i<p.scenery.length;i++)p.scenery[i].position.z=trackLoop(Math.floor(i/2),12,p.distance*.82,23);
 for(let i=0;i<p.skyClouds.length;i++){
  const cloud=p.skyClouds[i];
  cloud.position.set((i%2===0?-1:1)*(10+i%4*2)+Math.sin(p.time*.35+i),12+(i%4)*2,trackLoop(i,20,p.distance*.2,14));
 }
 for(let i=0;i<p.laneMarks.length;i++)p.laneMarks[i].position.z=trackLoop(Math.floor(i/2),8,p.distance,24);
 p.hero.group.position.set(px,p.y,2);
 animateAnimal(p.hero,p.time,p.stun<=0,p.y>.05);
 p.hero.group.scale.y=p.slide>0?.57:(p.y>.05?1.04:1);
 p.hero.shadow.position.x=px;
 p.hero.shadow.material.opacity=.55-Math.min(.43,p.y*.15);
 const fov=62+(currentSpeed-22)*.33;
 if(Math.abs(p.camera.fov-fov)>.025){p.camera.fov=THREE.MathUtils.damp(p.camera.fov,fov,3,dt);p.camera.updateProjectionMatrix()}
 p.camera.position.x=THREE.MathUtils.damp(p.camera.position.x,px*.23,4,dt);
 p.camera.lookAt(p.camera.position.x*.25,1.25,-19);
 const num=p.index+1;
 $('p'+num+'Distance').textContent=Math.floor(p.distance);
 $('p'+num+'Coins').textContent=p.coins;
 $('p'+num+'Energy').textContent=Math.ceil(p.energy);
 $('p'+num+'Bar').style.width=p.energy+'%';
 if(p.time>p.noticeUntil)$('p'+num+'Notice').textContent='';
}
function renderView(p,rect){
 const width=rect.w,height=rect.h;
 p.camera.aspect=width/height;
 p.camera.updateProjectionMatrix();
 renderer.setViewport(rect.x,rect.y,width,height);
 renderer.setScissor(rect.x,rect.y,width,height);
 renderer.setClearColor(p.ch.sky,1);
 renderer.clear(true,true,true);
 renderer.render(p.scene,p.camera);
}
function draw(){
 if(!racers.length)return;
 const size=renderer.getDrawingBufferSize(new THREE.Vector2());
 const w=Math.floor(size.x),h=Math.floor(size.y);
 renderer.setScissorTest(true);
 if(innerHeight>innerWidth){
  const half=Math.floor(h/2);
  renderView(racers[0],{x:0,y:half,w,h:h-half});
  renderView(racers[1],{x:0,y:0,w,h:half});
 }else{
  const half=Math.floor(w/2);
  renderView(racers[0],{x:0,y:0,w:half,h});
  renderView(racers[1],{x:half,y:0,w:w-half,h});
 }
 renderer.setScissorTest(false);
}
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min(.042,Math.max(0,(now-last)/1000));last=now;
 if(playing&&!paused&&!finished){
  elapsed+=dt;
  for(const racer of racers)updatePlayer(racer,dt);
  findWinner();
 }
 draw();
}
function reset(){
 playing=true;finished=false;paused=false;elapsed=0;
 // Release meshes/materials before rebuilding race worlds on a rematch.
 for(const player of racers)clearPlayer(player);
 for(const m of disposables)m.dispose();disposables.clear();
 racers=[
  newRacePlayer(CHARACTERS.find(c=>c.id===$('p1Pick').value)||CHARACTERS[0],0),
  newRacePlayer(CHARACTERS.find(c=>c.id===$('p2Pick').value)||CHARACTERS[5],1)
 ];
 for(const p of racers){
  $('p'+(p.index+1)+'Name').textContent=p.ch.emoji+' '+p.ch.name;
  for(let i=0;i<6;i++)spawnRow(p);
 }
 $('raceOverlay').classList.add('hidden');$('raceResult').hidden=true;$('pauseLabel').hidden=true;
 $('pauseRace').textContent='Ⅱ PAUSE';beep(700,.15,.03);
}
function move(index,delta){if(!playing||paused||!racers[index])return;racers[index].target=clampLane(racers[index].target+delta)}
function jump(index){const p=racers[index];if(!playing||paused||!p||p.y>.03||p.slide>0)return;p.vy=12.4;beep(370,.07,.02)}
function slide(index){const p=racers[index];if(!playing||paused||!p||p.y>.03)return;p.slide=.65;beep(250,.08,.017)}
function pauseToggle(){
 if(!playing||finished)return;
 paused=!paused;$('pauseLabel').hidden=!paused;$('pauseRace').textContent=paused?'▶ RESUME':'Ⅱ PAUSE';
}
$('pauseRace').onclick=pauseToggle;
$('raceStart').onclick=reset;
for(const [i,ch] of CHARACTERS.entries()){
 for(const select of [$('p1Pick'),$('p2Pick')]){
  const option=document.createElement('option');option.value=ch.id;option.textContent=ch.emoji+' '+ch.name+' — '+ch.scenery;select.appendChild(option);
 }
}
$('p1Pick').value='bunny';$('p2Pick').value='penguin';
const held=new Set();
addEventListener('keydown',event=>{
 const code=event.code;
 if(['KeyW','KeyA','KeyS','KeyD','KeyI','KeyJ','KeyK','KeyL','Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(code))event.preventDefault();
 if(held.has(code))return;held.add(code);
 if(code==='KeyP'||code==='Escape'){pauseToggle();return}
 if(code==='KeyA')move(0,-1);if(code==='KeyD')move(0,1);
 if(code==='KeyW'||code==='Space')jump(0);if(code==='KeyS')slide(0);
 if(code==='KeyJ'||code==='ArrowLeft')move(1,-1);if(code==='KeyL'||code==='ArrowRight')move(1,1);
 if(code==='KeyI'||code==='ArrowUp')jump(1);if(code==='KeyK'||code==='ArrowDown')slide(1);
});
addEventListener('keyup',event=>held.delete(event.code));
let touchStart=null;
function playerAt(clientX,clientY){
 return innerHeight>innerWidth?(clientY<innerHeight/2?0:1):(clientX<innerWidth/2?0:1);
}
renderer.domElement.addEventListener('pointerdown',event=>{touchStart={x:event.clientX,y:event.clientY,p:playerAt(event.clientX,event.clientY),id:event.pointerId}});
renderer.domElement.addEventListener('pointerup',event=>{
 if(!touchStart||event.pointerId!==touchStart.id)return;
 const {x,y,p}=touchStart;touchStart=null;
 const dx=event.clientX-x,dy=event.clientY-y;
 if(Math.abs(dx)<24&&Math.abs(dy)<24)jump(p);
 else if(Math.abs(dx)>Math.abs(dy))move(p,dx>0?1:-1);
 else if(dy<0)jump(p);else slide(p);
});
renderer.domElement.addEventListener('pointercancel',()=>touchStart=null);
addEventListener('resize',()=>renderer.setSize(innerWidth,innerHeight));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!paused)pauseToggle()});
addEventListener('blur',()=>{held.clear();if(playing&&!paused)pauseToggle()});
requestAnimationFrame(frame);
