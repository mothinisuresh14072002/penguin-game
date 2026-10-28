import * as THREE from 'three';
import {animate,stagger} from 'animejs';
import {ACCESSORIES,SLOTS,sanitizeWardrobe,buyAccessory,equipAccessory,unequipAccessory,applyWardrobe} from './dressUp.js';
import {DRESS_SHOPS,levelFromBest,canPurchase} from './dressShops.js';
import './style.css';
import {createAnimal, animateAnimal, alignAnimalFeetToRoad} from './animalArt.js';
import {populateHabitat,WORLD_GEOMETRIES} from './worldArt.js';
import {renderCharacterPreviews, renderImportedPreview} from './characterPreviews.js';
import {loadImportedAnimal,releaseImportedAnimal} from './modelAssets.js';
import {create3DBackdrop} from './visual3d.js';
import {sweptHazardContact} from './collisionMath.js';
import {createRoadArtwork} from './roadArt.js';
import {createWorldLandmarks} from './landmarkArt.js';
import {createMeadowDetails} from './meadowArt.js';
import {createSkylandDetails} from './skylandArt.js';
import {createPrairieDetails} from './prairieArt.js';
import {createTownDetails} from './townArt.js';
import {createParkDetails} from './parkArt.js';
import {createGlacierDetails} from './glacierArt.js';
import {createFarmDetails} from './farmArt.js';
import {configureGameRenderer,browserQualityOptions} from './graphicsQuality.js';
import {applyLighting,addCloudPuffs} from './lightingPresets.js';
import {createAdaptiveResolution} from './adaptiveResolution.js';
import {installCurvedWorld,curveRequested} from './curvedWorld.js';
import {giveSurfaceDetail,surfaceKindForColor} from './hdSurface.js';
import {createPickupArtwork} from './foodArt.js';
import {FOODS,FOOD_BY_ANIMAL,DAILY_GOALS,WEEKLY_GOALS,createEconomy,synchronizeEconomy,collectFood,sellFood,openSurpriseBox,recordEvent,goalProgress,claimGoal,dailyKey} from './gameEconomy.js';
import {createJourneyArt} from './journeyArt.js';
import {loopZ,layerTravel,journeyChapter} from './worldMotion.js';

const $ = id => document.getElementById(id);
const motionOK=()=>!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function popIn(target){if(target&&motionOK())animate(target,{opacity:[0,1],y:[14,0],scale:[.985,1],duration:500,ease:'outCubic'})}
function rewardPop(target){if(!target||!motionOK())return;animate(target,{scale:[1,1.28,1],rotate:[0,-6,0],duration:460,ease:'outCubic'});}
function floatInCards(elements){if(!motionOK()||!elements?.length)return;animate(elements,{opacity:[0,1],y:[22,0],scale:[.94,1],delay:stagger(42),duration:500,ease:'outCubic'});}
const CHARS=[
 {id:'bunny',name:'Bella Bunny',cost:0,icon:'🐰',color:0xf9e5ef,biome:'meadow'},
 {id:'unicorn',name:'Ula Unicorn',cost:150,icon:'🦄',color:0xf5e5ff,biome:'rainbow'},
 {id:'horse',name:'Hugo Horse',cost:250,icon:'🐴',color:0xbf8557,biome:'grassland'},
 {id:'cat',name:'Coco Cat',cost:350,icon:'🐱',color:0xe9a965,biome:'city'},
 {id:'dog',name:'Dodo Dog',cost:450,icon:'🐶',color:0xc58b55,biome:'park'},
 {id:'penguin',name:'Pip Penguin',cost:0,icon:'🐧',color:0x181f2b,biome:'arctic'},
 {id:'cow',name:'Mimi Cow',cost:700,icon:'🐮',color:0xf9f9ed,biome:'farm'},
];
const BIOMES={
 meadow:{name:'Bunny Meadow',sky:0xace5f8,fog:0xe5f6ef,ground:0x84c975,edge:0x5caa86,accent:0xf8b7d5,track:0xb9de94,decor:'flower',hazards:['rock','log']},
 rainbow:{name:'Unicorn Skyland',sky:0xdbc5fb,fog:0xf7e8fc,ground:0xe5dafa,edge:0x967ec4,accent:0xffa2d8,track:0xf6e4ff,decor:'star',hazards:['spike','rock']},
 grassland:{name:'Horse Prairie',sky:0x99d4f9,fog:0xd5edfa,ground:0x9ecb70,edge:0x658f5a,accent:0xf5d48b,track:0xd8c58a,decor:'hay',hazards:['log','rock']},
 city:{name:'Cat Town',sky:0xa4c6e9,fog:0xd3dcf1,ground:0xcbb9ae,edge:0x8d97b0,accent:0xf2b47d,track:0xf0e4d9,decor:'house',hazards:['log','rock']},
 park:{name:'Puppy Park',sky:0x93d5fc,fog:0xd6f1fd,ground:0x82cd7a,edge:0x519885,accent:0xffd07b,track:0xc2dda5,decor:'tree',hazards:['log','rock']},
 arctic:{name:'Penguin Glacier',sky:0x80caef,fog:0xb9e8ff,ground:0xf3fbff,edge:0x309ac8,accent:0x75e1ff,track:0x8fddf1,decor:'ice',hazards:['spike','rock','lion']},
 farm:{name:'Mimi Farm',sky:0xb7dbef,fog:0xe6ecdb,ground:0x91c579,edge:0x967451,accent:0xffd49a,track:0xdbc69e,decor:'barn',hazards:['log','rock']}
};
const KEY='penguin-ice-runner-v3';
const LEGACY_KEY='penguin-ice-runner-v2';
let saved;
try { saved=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY)||'{}'); } catch { saved={}; }
const validIds=new Set(CHARS.map(c=>c.id));
const profile={pinkCash:Math.max(0,Math.floor(Number(saved.pinkCash)||0)),coins:Math.max(0,Math.floor(Number(saved.coins)||0)),best:Math.max(0,Math.floor(Number(saved.best)||0)),unlocked:Array.isArray(saved.unlocked)?saved.unlocked.filter(id=>validIds.has(id)):['bunny','penguin'],selected:saved.selected||'bunny',economy:createEconomy(saved.economy),wardrobe:sanitizeWardrobe(saved.wardrobe)};
for(const id of ['bunny','penguin'])if(!profile.unlocked.includes(id))profile.unlocked.push(id);
if(!profile.unlocked.includes(profile.selected))profile.selected='penguin';
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(profile))}catch{}};
let audioEnabled=false,audioContext=null,lastStepSound=0;
function ensureAudio(){try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume()}catch{}}
function sound(frequency=440,duration=.08,type='sine',volume=.065){
 if(!audioEnabled)return;
 try {
  ensureAudio();if(!audioContext)return;
  const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),t=audioContext.currentTime;
  oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,t);
  gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
  oscillator.connect(gain);gain.connect(audioContext.destination);
  oscillator.start(t);oscillator.stop(t+duration+.01);
 } catch {}
}
let running=false,paused=false,ended=false,playerLane=1,targetLane=1,playerY=0,velocityY=0,sliding=0,shield=0,magnet=0,boost=0,energy=100,runCoins=0,runFood=0,distance=0,speed=10,clockTime=0,spawnNext=25,invincible=0;
const laneX=[-2.6,0,2.6],entities=[],decor=[],scrollItems=[],hue={ice:0x64c7ee,snow:0xecfaff,rock:0x50697c};
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x80caef);scene.fog=new THREE.FogExp2(0xb9e8ff,.0075);
const camera=new THREE.PerspectiveCamera(57,innerWidth/innerHeight,.1,300);
camera.position.set(0,6.7,16.9);camera.lookAt(0,1.38,-21);
if(curveRequested())installCurvedWorld();
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
const graphicsQuality=configureGameRenderer(renderer,browserQualityOptions());
renderer.setSize(innerWidth,innerHeight);
const adaptiveRes=createAdaptiveResolution({maxRatio:renderer.getPixelRatio(),minRatio:Math.min(.75,renderer.getPixelRatio())});
document.body.prepend(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xd5f4ff,0x3f8bae,1.65);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfffaf1,2.5);sun.position.set(-7,16,7);sun.castShadow=true;sun.shadow.mapSize.set(graphicsQuality.shadowSize,graphicsQuality.shadowSize);sun.shadow.bias=-.0005;sun.shadow.normalBias=.035;sun.shadow.camera.left=-16;sun.shadow.camera.right=16;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-22;sun.shadow.camera.near=1;sun.shadow.camera.far=70;scene.add(sun);
const glow=new THREE.DirectionalLight(0x379cf5,.72);glow.position.set(6,4,-13);scene.add(glow);
const fillLight=new THREE.DirectionalLight(0xffe0e8,.55);fillLight.position.set(7,7,11);scene.add(fillLight);
const mat=(c,r=.85,metalness=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness});
const snowMat=mat(0xf3fbff),iceMat=mat(0x8fddf1,.27,.12),deepIce=mat(0x309ac8,.38,.1),rockMat=mat(0x627589),dark=mat(0x1a222d),white=mat(0xfffcf3),pink=mat(0xdb8584),gold=mat(0xffd64f,.28,.65),energyMat=mat(0x41e6ad,.3,.18),powerMat=mat(0xbb81ff,.3,.3),wood=mat(0x7c5638);
const sphere=new THREE.SphereGeometry(1,18,12),cube=new THREE.BoxGeometry(1,1,1),coneGeo=new THREE.ConeGeometry(1,1,7);
function part(parent,geo,m,x=0,y=0,z=0,sx=1,sy=1,sz=1){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
const orb=(p,m,x,y,z,sx,sy,sz)=>part(p,sphere,m,x,y,z,sx,sy,sz);
function model(id){return createAnimal(id)}
let character=model(profile.selected);applyWardrobe(character,profile.wardrobe.equipped[profile.selected]);scene.add(character.group);
let characterLoadSequence=0;
function attemptImportedCharacter(id, sequence){
 // Optional authored GLB overrides are supported for all seven animals.
 loadImportedAnimal(id).then(imported=>{
  if(!imported)return;
  if(sequence!==characterLoadSequence||profile.selected!==id){
   releaseImportedAnimal(imported);
   return;
  }
  scene.remove(character.group);
  if(character.imported)releaseImportedAnimal(character);
  else disposeGroup(character.group);
  character=imported;
  applyWardrobe(character,profile.wardrobe.equipped[profile.selected]);
  character.group.rotation.y=Math.PI;
  scene.add(character.group);
 });
}
const SHARED_GEOMETRIES=new Set([sphere,cube,coneGeo]);
const SHARED_MATERIALS=new Set([snowMat,iceMat,deepIce,rockMat,dark,white,pink,gold,energyMat,powerMat,wood]);
function disposeGroup(root){root.traverse(obj=>{if(obj.isMesh){if(obj.geometry&&!SHARED_GEOMETRIES.has(obj.geometry))obj.geometry.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const m of mats)if(m&&!SHARED_MATERIALS.has(m))m.dispose()}})}
function swapCharacter(){
 if(typeof testSelect!=='undefined')testSelect.value=profile.selected;
 ++characterLoadSequence;
 scene.remove(character.group);
 if(character.imported)releaseImportedAnimal(character);
 else disposeGroup(character.group);
 character=model(profile.selected);
 applyWardrobe(character,profile.wardrobe.equipped[profile.selected]);
 scene.add(character.group);
 applyBiome();sound(690,.12,'triangle');
 attemptImportedCharacter(profile.selected,characterLoadSequence);
}
attemptImportedCharacter(profile.selected,characterLoadSequence);
// Endless segments are recycled instead of spawning unlimited geometry.
const glacialCliffs=[];
for(let i=0;i<14;i++){
 const g=new THREE.Group();scene.add(g);scrollItems.push(g);g.position.z=10-i*18;
 // Ground extends beyond the track, allowing trees, houses and props to
 // belong to the same continuous landscape instead of floating in the sky.
 part(g,cube,snowMat,0,-.34,0,85,.95,18.1);
 part(g,cube,deepIce,0,-.65,0,9,1.5,18);
 part(g,cube,iceMat,0,.06,0,9,.19,18);
 part(g,cube,snowMat,0,.16,0,9,.12,18.1);
 for(const x of [-4.59,4.59])part(g,cube,deepIce,x,.19,0,.23,.34,18.1);
 const iceCliff=new THREE.Group();g.add(iceCliff);glacialCliffs.push(iceCliff);
 for(const x of [-5.3,5.3]){
  const ridge=orb(iceCliff,snowMat,x,-.16,-1.5,1.2,.48,2);ridge.rotation.z=.05;
  for(let j=0;j<3;j++)part(iceCliff,coneGeo,iceMat,x+(j-1)*.6,.7,-5, .36,.88+(j%2)*.45,.36);
  // Snow-covered glacier walls create depth cues along the playable runway.
  for(let j=0;j<3;j++){
    const z=-6.5+j*5.6,high=1.6+(i+j)%3*.45;
    const cliff=part(iceCliff,cube,deepIce,x*1.55,high*.43,z,2.15,high,4.6);
    cliff.rotation.y=(j%2?-.12:.10);
    part(iceCliff,cube,snowMat,x*1.55,high+.04,z,2.3,.22,4.7);
    part(iceCliff,coneGeo,iceMat,x*1.55+(j%2?.5:-.5),high+1.0,z,.48,.96,.48);
  }
 }
}

const roadArt=createRoadArtwork(scene,'arctic',{length:260,centerZ:-106,surfaceY:.29,width:8.95});
let landmarks=null;
let journeyArt=null;
let meadowDetails=null;
let skylandDetails=null;
let prairieDetails=null;
let townDetails=null;
let parkDetails=null;
let glacierDetails=null;
let farmDetails=null;
// Fast-moving lane markings make the ice, meadow and farm roads feel alive.
// This is decorative only: stable base track remains solid beneath every runner.
const laneDashes=[];
for(let k=0;k<48;k++){
 const mesh=new THREE.Mesh(cube,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.34,depthWrite:false}));
 mesh.scale.set(.08,.018,1.9);
 mesh.position.y=.34;
 mesh.position.x=k%2===0?-1.3:1.3;
 scene.add(mesh);laneDashes.push(mesh);
}

// Camera-following shader sky and habitat-specific 3D horizon replace the old Arctic-only peaks.
const backdrop=create3DBackdrop(scene,'arctic');
// All biome decorations are generated in Three.js and reused across runs.
let currentTheme=BIOMES.arctic;
let weatherParticles=null;
const biomeDecor=[];
const sceneryMaterials=new Set();
function addScenery(parent,shape,color,x,y,z,sx,sy,sz){
 const material=mat(color,.83);
 const kind=surfaceKindForColor(color);
 if(kind)giveSurfaceDetail(material,kind);
 sceneryMaterials.add(material);
 return part(parent,shape,material,x,y,z,sx,sy,sz);
}
function clearScenery(){
 for(const o of biomeDecor){scene.remove(o);o.traverse(obj=>{
  if(obj.isMesh){
   if(obj.geometry&&!SHARED_GEOMETRIES.has(obj.geometry)&&!WORLD_GEOMETRIES.has(obj.geometry))obj.geometry.dispose();
   if(obj.material&&sceneryMaterials.has(obj.material))obj.material.dispose();
  }
 })}
 biomeDecor.length=0;sceneryMaterials.clear();
}
function sceneryProp(type,x,z,i){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);biomeDecor.push(g);
 populateHabitat(g,type,i,(parent,geo,color,xx,yy,zz,sx,sy,sz)=>
  addScenery(parent,geo,color,xx,yy,zz,sx,sy,sz));
}
// Parallax clouds and soft nature details add life without requiring large 3D assets.
const skyClouds=[];
const cloudMaterial=mat(0xffffff,.95);
for(let i=0;i<15;i++){
 const g=new THREE.Group();scene.add(g);
 addCloudPuffs(g,(grp,x,y,z,sx,sy,sz)=>orb(grp,cloudMaterial,x,y,z,sx,sy,sz));g.scale.setScalar(1.35);
 skyClouds.push(g);
}
const butterflies=[];
for(let i=0;i<10;i++){
 const g=new THREE.Group(),wings=[];
 const color=mat(i%2?0xfab6e0:0xffe69a,.8);
 for(const side of [-1,1]){
  const wing=orb(g,color,side*.18,0,0,.22,.12,.05);
  wings.push(wing);
 }
 orb(g,dark,0,0,0,.055,.13,.06);
 scene.add(g);butterflies.push({g,wings});
}
function applyBiome(){
 const picked=CHARS.find(c=>c.id===profile.selected)||CHARS[0];
 const biome=BIOMES[picked.biome];currentTheme=biome;
 scene.background.setHex(biome.sky);scene.fog.color.setHex(biome.fog);
 applyLighting(picked.biome,{renderer,hemi,sun,fill:fillLight});
 backdrop.setBiome(picked.biome,biome.sky);
 cloudMaterial.color.setHex(picked.biome==='rainbow'?0xffe4ff:0xffffff);
 if(weatherParticles)weatherParticles.visible=picked.biome==='rainbow';
 for(const b of butterflies)b.g.visible=['meadow','grassland','park','farm'].includes(picked.biome);
 snowMat.color.setHex(biome.ground);iceMat.color.setHex(biome.track);
 roadArt.setBiome(picked.biome);
 for(const cliff of glacialCliffs)cliff.visible=picked.biome==='arctic';
 for(const marker of laneDashes)marker.visible=['arctic','rainbow'].includes(picked.biome);
 landmarks?.dispose();landmarks=createWorldLandmarks(scene,picked.biome);
 journeyArt?.dispose();journeyArt=createJourneyArt(scene,picked.biome);
 meadowDetails?.dispose();
 meadowDetails=picked.biome==='meadow'?createMeadowDetails(scene):null;
 meadowDetails?.update(distance);
 skylandDetails?.dispose();
 skylandDetails=picked.biome==='rainbow'?createSkylandDetails(scene):null;
 skylandDetails?.update(distance,clockTime);
 prairieDetails?.dispose();
 prairieDetails=picked.biome==='grassland'?createPrairieDetails(scene):null;
 prairieDetails?.update(distance);
 townDetails?.dispose();
 townDetails=picked.biome==='city'?createTownDetails(scene):null;
 townDetails?.update(distance,clockTime);
 parkDetails?.dispose();
 parkDetails=picked.biome==='park'?createParkDetails(scene):null;
 parkDetails?.update(distance);
 glacierDetails?.dispose();
 glacierDetails=picked.biome==='arctic'?createGlacierDetails(scene):null;
 glacierDetails?.update(distance,clockTime);
 farmDetails?.dispose();
 farmDetails=picked.biome==='farm'?createFarmDetails(scene):null;
 farmDetails?.update(distance);
 deepIce.color.setHex(biome.edge);rockMat.color.setHex(biome.hazards.includes('spike')?0x6a8ea4:0x917e75);
 clearScenery();
 for(let i=0;i<60;i++){
  const side=i%2===0?-1:1, x=side*(7.8+(i%3)*1.3), z=12-Math.floor(i/2)*11.5;
  sceneryProp(biome.decor,x,z,i);
 }
 if($('worldName'))$('worldName').textContent=biome.name;
 if($('shopMessage'))$('shopMessage').textContent='World: '+biome.name;
}
applyBiome();
function makeObject(kind,lane,at){
 const root=new THREE.Group();scene.add(root);let radius=.7;
 const x=laneX[lane];
 if(kind==='rock'){orb(root,rockMat,0,.59,0,.86,.69,.68);orb(root,snowMat,-.15,1.13,-.03,.65,.23,.53);radius=.78;}
 else if(kind==='spike'){for(let i=0;i<3;i++)part(root,coneGeo,iceMat,(i-1)*.33,.65+(i%2)*.22,0,.36,.72+(i%2)*.38,.36);radius=.72;}
 else if(kind==='log'){
  // Raised arch: standing animals strike the overhead log; sliding animals
  // genuinely fit under the gap, matching the collision rules.
  part(root,cube,wood,0,1.67,0,2.15,.54,.46);
  for(const x of [-1.06,1.06])part(root,cube,wood,x,.78,0,.16,1.55,.46);
  for(const x of [-.52,0,.52])orb(root,snowMat,x,1.98,0,.30,.11,.28);
  radius=1.05;
}
 else if(kind==='food'||kind==='box'){
  root.add(createPickupArtwork(kind,profile.selected));radius=.45;
 }
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
 const count=Math.random()<.18+difficulty*.50?2:1;
 while(blocked.size<count)blocked.add(Math.floor(Math.random()*3));
 for(const lane of blocked){
   const types=currentTheme.hazards;
   makeObject(types[Math.floor(Math.random()*types.length)],lane,at);
 }
 for(let lane=0;lane<3;lane++)if(!blocked.has(lane)){
   if(Math.random()<.92){for(let i=0;i<4;i++)makeObject('coin',lane,at+2.0+i*1.15);}
   if(Math.random()<.34)makeObject('energy',lane,at+5.9);
   if(Math.random()<.60)makeObject('food',lane,at+8.8);
   if(Math.random()<.022)makeObject('box',lane,at+12.5);
   if(Math.random()<.055)makeObject(Math.random()<.5?'shield':'magnet',lane,at+7);
 }
}
function clearObjects(){for(const e of entities){scene.remove(e.root);disposeGroup(e.root)}entities.length=0}
function showScreen(title,message,buttons){
 const screen=$('overlay');screen.classList.remove('hidden');
 popIn(screen.querySelector('.glass')||screen);
 $('screenTitle').textContent=title;$('screenText').textContent=message;
 const actions=$('screenActions');actions.replaceChildren();
 for(const b of buttons){const btn=document.createElement('button');btn.textContent=b.text;btn.className=b.secondary?'secondary':'';btn.onclick=b.action;actions.appendChild(btn)}
}
let characterPreviews;
const importedPreviewCache=new Map();
function shop(tab='characters'){
 if(typeof tab!=='string')tab='characters';
 if(!characterPreviews)characterPreviews=renderCharacterPreviews(CHARS,BIOMES);
 if(tab!=='dress')disposeDressingRoom();
 running=false;paused=false;$('pauseBanner').classList.add('hidden');$('shop').classList.remove('hidden');$('overlay').classList.add('hidden');
 popIn($('shop').querySelector('.shop-panel'));
 const grid=$('charGrid');grid.replaceChildren();
 for(const c of CHARS){
  const unlocked=profile.unlocked.includes(c.id),selected=profile.selected===c.id;
  const button=document.createElement('button');button.className='char-card'+(selected?' selected':'');
  const thumb=characterPreviews?.get(c.id);
  button.innerHTML=(thumb?'<img class="char-thumb" alt="3D character preview" src="'+thumb+'">':'<span class="char-emoji">'+c.icon+'</span>')+
   '<strong>'+c.icon+' '+c.name+'</strong><small>'+BIOMES[c.biome].name+'</small><small>'+(selected?'SELECTED':unlocked?'USE CHARACTER':'🪙 '+c.cost)+'</small>';
  button.onclick=()=>{
   if(unlocked){profile.selected=c.id;swapCharacter();save();shop();}
   else if(profile.coins>=c.cost){profile.coins-=c.cost;profile.unlocked.push(c.id);profile.selected=c.id;swapCharacter();save();shop();}
   else {$('shopMessage').textContent='Collect more gold coins to unlock '+c.name;}
  };
  grid.appendChild(button);
  if(!importedPreviewCache.has(c.id))
   importedPreviewCache.set(c.id,renderImportedPreview(c.id,BIOMES[c.biome].sky));
  importedPreviewCache.get(c.id).then(source=>{
   if(!source||!grid.contains(button))return;
   const image=button.querySelector('.char-thumb');
   if(image)image.src=source;
  });
 }
 $('wallet').textContent=profile.coins;
 if($('pinkWallet'))$('pinkWallet').textContent=profile.pinkCash;
 floatInCards([...grid.children]);
 showShopTab(tab);
}

// The dressing room uses a separate renderer so it does not disturb the runner.
let dressingRenderer=null,dressingScene=null,dressingCamera=null,dressingActor=null,dressingTick=0;
let dressingPreview={};
function disposeDressingRoom(){
 if(dressingRenderer){dressingRenderer.dispose();dressingRenderer.domElement.remove();}
 if(dressingActor?.group)disposeGroup(dressingActor.group);
 dressingRenderer=dressingScene=dressingCamera=dressingActor=null;
}
function renderDressingRoom(panel){
 disposeDressingRoom();
 panel.replaceChildren();
 const title=document.createElement('h2');title.textContent='👗 Baby Animal Dressing Room';
 const desc=document.createElement('p');desc.textContent='Try any of 20 cute styles in 3D, sell your animal treats for pink cash, then dress your baby animal. Outfits are saved separately for each animal.';
 const choose=document.createElement('select');choose.setAttribute('aria-label','Dressing room animal');
 for(const a of CHARS){const option=document.createElement('option');option.value=a.id;option.textContent=a.icon+' '+a.name;choose.append(option)}
 choose.value=profile.selected;
 const boutique=document.createElement('div');boutique.className='boutique-room';
 const shopMap=document.createElement('nav');shopMap.className='boutique-map';shopMap.setAttribute('aria-label','Seven animal boutiques');
 const boutiqueHeading=document.createElement('div');boutiqueHeading.className='boutique-heading';boutiqueHeading.textContent='✨ COCO’S CUTE COUTURE · DRESS-UP STUDIO ✨';
 const rack=document.createElement('div');rack.className='boutique-rack';
 rack.setAttribute('aria-label','Hanging outfits and scarves');
 for(const [emoji,name] of [['👗','Berry dress'],['🧥','Cozy outfit'],['🧣','Rainbow scarf'],['🎀','Pink bow'],['🧢','Cute cap'],['👚','Mint outfit']]){
  const hanger=document.createElement('div');hanger.className='boutique-hanger';
  hanger.innerHTML='<span class="hanger-hook">⌒</span><span class="hanger-piece"></span>';
  const image=document.createElement('span');image.className='hanger-icon';image.textContent=emoji;image.setAttribute('aria-label',name);
  hanger.append(image);rack.append(hanger);
 }
 const studio=document.createElement('div');studio.className='boutique-studio';
 const sideShelf=document.createElement('div');sideShelf.className='boutique-shelf';
 for(const icon of ['😎','👒','💖','👑','🕶️','🎀']){const item=document.createElement('span');item.textContent=icon;sideShelf.append(item)}
 const mirror=document.createElement('div');mirror.className='boutique-mirror';
 const mirrorLabel=document.createElement('span');mirrorLabel.className='mirror-label';mirrorLabel.textContent='🪞 YOUR BABY ANIMAL';
 const stage=document.createElement('div');stage.className='dress-stage';
 mirror.append(mirrorLabel,stage);
 const shelves=document.createElement('div');shelves.className='boutique-shelves';
 shelves.append(Object.assign(document.createElement('div'),{textContent:'👜 👓 🎩'}),Object.assign(document.createElement('div'),{textContent:'🧣 🎀 👒'}));
 studio.append(sideShelf,mirror,shelves);
 const rug=document.createElement('div');rug.className='boutique-rug';rug.textContent='♡ LITTLE STAR FASHION ♡';
 boutique.append(boutiqueHeading,shopMap,rack,studio,rug);
 if(motionOK()){
  animate([...rack.children],{opacity:[0,1],y:[-12,0],rotate:[-5,0],delay:stagger(65),duration:600,ease:'outCubic'});
 }
 const tools=document.createElement('div');tools.className='dress-actions';
 const balance=document.createElement('strong');balance.textContent='💗 '+profile.pinkCash+' pink cash';
 const reset=document.createElement('button');reset.type='button';reset.className='secondary';reset.textContent='↻ Clear preview';tools.append(balance,reset);
 const list=document.createElement('div');list.className='dress-grid';
 const note=document.createElement('p');note.setAttribute('role','status');
 panel.append(title,desc,choose,boutique,tools,note,list);
 let animal=choose.value;
 function chooseBoutique(){
  const theme=DRESS_SHOPS[animal];boutique.style.setProperty('--boutique-accent',theme.color);
  boutiqueHeading.textContent='✨ '+theme.title.toUpperCase()+' ✨';
  rug.textContent=theme.decor.join('  ')+' · '+theme.label+' · '+theme.pose+' Pose';
  shopMap.replaceChildren();
  for(const [id,style] of Object.entries(DRESS_SHOPS)){
   const b=document.createElement('button');b.type='button';b.className='boutique-zone'+(id===animal?' active':'');b.textContent=style.icon+' '+id[0].toUpperCase()+id.slice(1);b.setAttribute('aria-pressed',String(id===animal));
   b.onclick=()=>{animal=id;choose.value=id;refresh()};shopMap.append(b);
  }
  rack.replaceChildren();
  for(const id of theme.styles){const item=ACCESSORIES.find(x=>x.id===id);const b=document.createElement('button');b.type='button';b.className='boutique-hanger';b.title='Try '+item.name;
   const hook=document.createElement('span');hook.className='hanger-hook';hook.textContent='⌒';
   const garment=document.createElement('span');garment.className='hanger-icon';garment.textContent=item.emoji;
   const name=document.createElement('small');name.textContent=item.name;
   b.append(hook,garment,name);b.onclick=()=>{dressingPreview[item.slot]=item.id;updatePreview();note.textContent='Trying '+item.name;};rack.append(b);
  }
  if(motionOK())animate([...rack.children],{opacity:[0,1],y:[-10,0],delay:stagger(55),duration:450,ease:'outCubic'});
 }
 function buildPreview(){
  disposeDressingRoom();
  dressingScene=new THREE.Scene();dressingScene.background=new THREE.Color(0xfff1f8);
  dressingScene.add(new THREE.HemisphereLight(0xffffff,0xb7a5ca,2.5));
  const key=new THREE.DirectionalLight(0xffffff,2.1);key.position.set(-3,5,6);dressingScene.add(key);
  dressingCamera=new THREE.PerspectiveCamera(34,1.3,.1,50);dressingCamera.position.set(0,1.35,6.1);dressingCamera.lookAt(0,1.2,0);
  dressingActor=createAnimal(animal);dressingActor.group.rotation.y=Math.PI;
  applyWardrobe(dressingActor,dressingPreview);dressingScene.add(dressingActor.group);
  dressingRenderer=new THREE.WebGLRenderer({alpha:false,antialias:true});
  dressingRenderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  dressingRenderer.setSize(390,340);
  dressingRenderer.domElement.setAttribute('aria-label','3D outfit preview');
  stage.replaceChildren(dressingRenderer.domElement);
  dressingRenderer.render(dressingScene,dressingCamera);
  if(motionOK())animate(dressingActor.group.rotation,{y:[Math.PI-.24,Math.PI],duration:850,ease:'outBack',onUpdate:()=>dressingRenderer?.render(dressingScene,dressingCamera)});
 }
 function updatePreview(){if(dressingActor){applyWardrobe(dressingActor,dressingPreview);dressingRenderer.render(dressingScene,dressingCamera)}}
 function refresh(){
  chooseBoutique();
  dressingPreview={...(profile.wardrobe.equipped[animal]||{})};
  buildPreview();list.replaceChildren();
  for(const item of ACCESSORIES){
   const owned=profile.wardrobe.owned.includes(item.id);
   const equipped=profile.wardrobe.equipped[animal]?.[item.slot]===item.id;
   const card=document.createElement('div');card.className='dress-card';
   const head=document.createElement('strong');head.textContent=item.emoji+' '+item.name;
   const caption=document.createElement('small');caption.textContent=item.slot.toUpperCase()+' · Lv '+item.level+' · '+(owned?'OWNED':'💗 '+item.price);
   const preview=document.createElement('button');preview.type='button';preview.className='secondary';preview.textContent=dressingPreview[item.slot]===item.id?'PREVIEWING':'TRY ON';
   preview.onclick=()=>{dressingPreview[item.slot]=item.id;updatePreview();if(motionOK()&&dressingActor){animate(dressingActor.group.rotation,{y:[Math.PI-.13,Math.PI],duration:540,ease:'outCubic',onUpdate:()=>dressingRenderer?.render(dressingScene,dressingCamera)});} note.textContent='Previewing '+item.name+' — try before you buy';for(const button of list.querySelectorAll('.dress-card button.secondary'))button.textContent='TRY ON';preview.textContent='PREVIEWING';};
   const action=document.createElement('button');action.type='button';action.textContent=equipped?'REMOVE':owned?'WEAR':'BUY';
   const levelLocked=levelFromBest(profile.best)<item.level;
   action.disabled=!owned&&!canPurchase(profile,item);
   if(!owned&&levelLocked)action.textContent='🔒 LEVEL '+item.level;
   action.onclick=()=>{
    if(equipped){unequipAccessory(profile,animal,item.slot);note.textContent='Removed '+item.name;}
    else if(!owned&&!buyAccessory(profile,item.id)){note.textContent=levelLocked?'Reach level '+item.level+' by running further':'Sell collected food for more pink cash';return}
    else{equipAccessory(profile,animal,item.id);note.textContent='Wearing '+item.name+'!'}
    save();updateHUD();
    if(animal===profile.selected)applyWardrobe(character,profile.wardrobe.equipped[animal]);
    refresh();balance.textContent='💗 '+profile.pinkCash+' pink cash';
   };
   card.append(head,caption,preview,action);list.append(card);
  }
 }
 choose.onchange=()=>{animal=choose.value;refresh();};
 reset.onclick=()=>{dressingPreview={};updatePreview();note.textContent='Preview cleared';};
 refresh();
}

// Five shop sections including the live 3D dressing room.
function showShopTab(tab='characters'){
 const names=['characters','dress','sell','boxes','goals'];
 if(!names.includes(tab))tab='characters';
 const panel=$('economyPanel'),grid=$('charGrid');
 if(tab!=='dress')disposeDressingRoom();
 grid.hidden=tab!=='characters';
 panel.hidden=tab==='characters';
 for(const button of document.querySelectorAll('.shop-tab')){
  button.classList.toggle('active',button.dataset.tab===tab);
  button.setAttribute('aria-pressed',String(button.dataset.tab===tab));
 }
 $('wallet').textContent=profile.coins;
 if($('pinkWallet'))$('pinkWallet').textContent=profile.pinkCash;
 if(tab==='characters'){panel.replaceChildren();floatInCards([...grid.children]);return;}
 if(tab==='dress'){renderDressingRoom(panel);popIn(panel.querySelector('.boutique-room'));return;}
 synchronizeEconomy(profile);save();panel.replaceChildren();
 const heading=(title,description)=>{
  const h=document.createElement('h2');h.textContent=title;panel.append(h);
  const p=document.createElement('p');p.textContent=description;panel.append(p);
 };
 const row=(title,subtitle,actions)=>{
  const item=document.createElement('div');item.className='economy-item';
  const info=document.createElement('div');info.className='economy-info';
  const name=document.createElement('strong');name.textContent=title;
  const details=document.createElement('small');details.textContent=subtitle;
  info.append(name,details);item.append(info);
  const controls=document.createElement('div');controls.className='economy-actions';
  for(const [label,disabled,action] of actions){
   const btn=document.createElement('button');btn.type='button';btn.className='secondary';
   btn.textContent=label;btn.disabled=disabled;btn.onclick=action;controls.append(btn);
  }
  item.append(controls);panel.append(item);
 };
 const notice=(message)=>{$('shopMessage').textContent=message;updateHUD();};
 if(tab==='sell'){
  heading('🧺 Food inventory','Collect your animal’s favorite food while running and sell it for 💗 pink cash to spend in the dressing room. Inventory and cash are saved.');
  for(const food of FOODS){
   const amount=profile.economy.inventory[food.id];
   const sell=(quantity)=>{
    const result=sellFood(profile,food.id,quantity);
    if(!result)return;
    save();showShopTab('sell');
    notice('Sold '+quantity+' '+food.label+' for 💗 '+result.pinkCash+' pink cash!');
   };
   row(food.emoji+' '+food.label,'Owned: '+amount+' · 💗 '+food.price+' pink cash each',[
    ['SELL 1',amount<1,()=>sell(1)],['SELL ALL',amount<1,()=>sell(amount)]
   ]);
  }
 }else if(tab==='boxes'){
  const freeAvailable=profile.economy.freeBoxDay!==dailyKey();
  heading('🎁 Surprise gifts','Claim one free daily gift or spend 55 earned coins for another. All prizes are virtual game rewards, never real money.');
  const open=(free)=>{
   const result=openSurpriseBox(profile,{free,animal:profile.selected});
   if(!result){notice(free?'Today’s free gift was already opened.':'You need 55 coins for this box.');return;}
   save();showShopTab('boxes');notice('SURPRISE! '+result.label);
  };
  row('🎈 Daily free mystery box',freeAvailable?'Ready to open!':'Come back after the daily UTC reset',[
   [freeAvailable?'OPEN FREE':'CLAIMED TODAY',!freeAvailable,()=>open(true)]
  ]);
  row('🎁 Coin mystery box','55 coins · coins or your animal’s food',[
   ['OPEN FOR 55 🪙',profile.coins<55,()=>open(false)]
  ]);
 }else{
  heading('🎯 Daily & weekly goals','Collect food, jump, finish runs and sell treats. Claim rewards after reaching each target. Targets reset on UTC calendar boundaries.');
  for(const [period,goals] of [['daily',DAILY_GOALS],['weekly',WEEKLY_GOALS]]){
   const label=document.createElement('h3');label.textContent=period==='daily'?'☀️ Daily targets':'📅 Weekly targets';panel.append(label);
   for(const goal of goals){
    const progress=goalProgress(profile,period,goal.id);
    const claim=()=>{
     const reward=claimGoal(profile,period,goal.id);
     if(!reward)return;
     save();showShopTab('goals');notice('Target complete! +'+reward.coins+' coins');
    };
    row(goal.label,progress.progress+'/'+goal.target+' · Reward: '+goal.reward+' coins',[
     [progress.claimed?'CLAIMED':progress.complete?'CLAIM REWARD':'IN PROGRESS',
       progress.claimed||!progress.complete,claim]
    ]);
   }
  }
 }
}
for(const button of document.querySelectorAll('.shop-tab')){
 button.onclick=()=>showShopTab(button.dataset.tab);
}
function menu(){
 disposeDressingRoom();
 running=false;paused=false;$('pauseBanner').classList.add('hidden');$('shop').classList.add('hidden');updateHUD();
 showScreen('PAWVERSE DASH','A cute animal adventure across magical worlds. Switch lanes, jump obstacles, collect energy and unlock new animal friends.',[
  {text:'🏃 SOLO RUN',action:start},{text:'🏁 2 FRIEND RACE',action:()=>location.assign('./race.html')},{text:'CHARACTERS & SHOP',secondary:true,action:()=>shop('characters')},{text:'👗 DRESSING ROOM',secondary:true,action:()=>shop('dress')},{text:'🧺 SELL FOOD',secondary:true,action:()=>shop('sell')},{text:'🎯 DAILY & WEEKLY',secondary:true,action:()=>shop('goals')}
 ]);
}
function start(){
 disposeDressingRoom();
 ensureAudio();running=true;paused=false;ended=false;$('pauseBanner').classList.add('hidden');playerLane=1;targetLane=1;playerY=0;velocityY=0;sliding=0;shield=0;magnet=0;boost=0;energy=100;runCoins=0;runFood=0;distance=0;speed=18;spawnNext=26;invincible=1;combo=0;lastCoinDistance=-100;lastMilestone=0;noticeUntil=0;$('speedNotice')?.classList.add('hidden');
 clearObjects();$('overlay').classList.add('hidden');$('shop').classList.add('hidden');$('pauseBtn').textContent='Ⅱ';
 for(let i=0;i<8;i++){row(spawnNext);spawnNext+=17;}
}
function finish(reason){
 if(ended)return;ended=true;running=false;paused=false;$('pauseBanner').classList.add('hidden');
 const points=Math.floor(distance);
 if(points>=20)recordEvent(profile,'run');
 profile.coins+=runCoins;profile.best=Math.max(profile.best,points);save();updateHUD();
 showScreen('RUN COMPLETE',reason+' Distance: '+points+'m · Coins: +'+runCoins+' · Treats: '+runFood+' · Best: '+profile.best+'m',[
  {text:'RUN AGAIN',action:start},{text:'CHARACTER SHOP',secondary:true,action:shop}
 ]);
}
function crash(){
 if(shield>0){shield=0;invincible=1.6;sound(190,.18,'sawtooth');return;}
 sound(140,.22,'sawtooth');finish('You hit an obstacle.');
}
function moveLane(n){if(!running||paused)return;targetLane=THREE.MathUtils.clamp(targetLane+n,0,2);}
function jump(){if(running&&!paused&&playerY<=.02&&sliding<=0){velocityY=10.0;recordEvent(profile,'jump');save();sound(420,.12,'triangle')}}
function slide(){if(running&&!paused&&playerY<=.02){sliding=.8;sound(260,.1,'triangle',.035)}}
function updateHUD(){
 $('distance').textContent=Math.floor(distance);$('coins').textContent=runCoins;$('energy').textContent=Math.ceil(energy);
 $('foodCount').textContent=runFood;
 const food=FOOD_BY_ANIMAL[profile.selected]||FOOD_BY_ANIMAL.bunny;
 const foodHud=$('foodHud');foodHud.firstChild.nodeValue=food.emoji+' ';
 foodHud.title=food.label+' collected during this run';
 $('energyFill').style.width=energy+'%';
 $('walletHud').textContent=profile.coins;
 if($('pinkCashHud'))$('pinkCashHud').textContent=profile.pinkCash;
 $('power').textContent=shield>0?'🛡 '+Math.ceil(shield)+'s':magnet>0?'🧲 '+Math.ceil(magnet)+'s':'';
}
// Temporary visual QA controls: test every animal without purchasing or restarting.
const testSwitcher=document.createElement('div');
testSwitcher.className='character-test-switcher';
testSwitcher.setAttribute('aria-label','Character testing controls');
testSwitcher.innerHTML='<span class="test-heading">🧪 CHARACTER TEST</span><button type="button" data-step="-1" aria-label="Previous animal">◀</button><select aria-label="Choose test animal"></select><button type="button" data-step="1" aria-label="Next animal">▶</button>';
const testSelect=testSwitcher.querySelector('select');
for(const ch of CHARS){const option=document.createElement('option');option.value=ch.id;option.textContent=ch.icon+' '+ch.name;testSelect.appendChild(option)}
testSelect.value=profile.selected;
function testSwitchTo(id){
 if(!validIds.has(id)||profile.selected===id)return;
 profile.selected=id;
 // Testing is free and does not modify unlocks, wallet or saved selection.
 swapCharacter();updateHUD();testSelect.value=id;
}
testSelect.addEventListener('change',()=>testSwitchTo(testSelect.value));
for(const button of testSwitcher.querySelectorAll('button'))button.onclick=()=>{
 const current=CHARS.findIndex(ch=>ch.id===profile.selected);
 const next=(current+Number(button.dataset.step)+CHARS.length)%CHARS.length;
 testSwitchTo(CHARS[next].id);
};
document.getElementById('app').appendChild(testSwitcher);
$('pauseBtn').onclick=()=>{if(!running)return;paused=!paused;$('pauseBtn').textContent=paused?'▶':'Ⅱ';$('pauseBanner').classList.toggle('hidden',!paused)};
$('shopBack').onclick=menu;
$('startFromShop').onclick=start;
$('soundBtn').onclick=()=>{audioEnabled=!audioEnabled;try{localStorage.setItem('polar-dash-sound',audioEnabled?'on':'off')}catch{};$('soundBtn').textContent=audioEnabled?'SOUND: ON':'SOUND: OFF';if(audioEnabled){ensureAudio();sound(580,.12,'triangle')}};
const keys=new Set();
addEventListener('keydown',e=>{
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
 if(keys.has(e.code)&&e.repeat)return;keys.add(e.code);
 if(e.code==='ArrowLeft'||e.code==='KeyA')moveLane(-1);
 if(e.code==='ArrowRight'||e.code==='KeyD')moveLane(1);
 if(e.code==='ArrowUp'||e.code==='KeyW'||e.code==='Space')jump();
 if(e.code==='ArrowDown'||e.code==='KeyS')slide();
 if(e.code==='KeyP'||e.code==='Escape')$('pauseBtn').click();
});
addEventListener('keyup',e=>keys.delete(e.code));
let touch=null;
renderer.domElement.addEventListener('pointerdown',e=>touch={x:e.clientX,y:e.clientY});
renderer.domElement.addEventListener('pointercancel',()=>{touch=null});
renderer.domElement.addEventListener('pointerup',e=>{
 if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;
 if(Math.abs(dx)<25&&Math.abs(dy)<25){jump();return;}
 if(Math.abs(dx)>Math.abs(dy))moveLane(dx>0?1:-1);
 else if(dy<0)jump();else slide();
});
// Soft projected grounding beneath the active character reduces visual floating.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=64;shadowCanvas.height=64;
const ctx=shadowCanvas.getContext('2d');const grd=ctx.createRadialGradient(32,32,2,32,32,31);grd.addColorStop(0,'rgba(5,43,70,0.40)');grd.addColorStop(1,'rgba(5,43,70,0)');
ctx.fillStyle=grd;ctx.fillRect(0,0,64,64);
const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
const projectedShadow=new THREE.Mesh(new THREE.PlaneGeometry(2,1.65),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.82}));
projectedShadow.rotation.x=-Math.PI/2;projectedShadow.position.y=.245;scene.add(projectedShadow);
const snowPos=new Float32Array(350*3);
for(let i=0;i<350;i++){snowPos[i*3]=(Math.random()-.5)*36;snowPos[i*3+1]=Math.random()*19;snowPos[i*3+2]=-Math.random()*85;}
const flakesGeo=new THREE.BufferGeometry();flakesGeo.setAttribute('position',new THREE.BufferAttribute(snowPos,3));
const flakes=new THREE.Points(flakesGeo,new THREE.PointsMaterial({color:0xffffff,size:.075,transparent:true,opacity:.77,depthWrite:false}));scene.add(flakes);
weatherParticles=flakes;
flakes.visible=CHARS.find(c=>c.id===profile.selected)?.biome==='rainbow';
let last=performance.now(),lastMilestone=0,noticeUntil=0,combo=0,lastCoinDistance=-100;
function showSpeedNotice(message){const banner=$('speedNotice');if(banner){banner.textContent=message;banner.classList.remove('hidden');popIn(banner);noticeUntil=clockTime+1.4;}}
function tick(now){
 requestAnimationFrame(tick);
 if(running&&!paused){const r=adaptiveRes.sample(now-last);if(r!==null){renderer.setPixelRatio(r);renderer.setSize(innerWidth,innerHeight)}}
 const dt=Math.min(.043,(now-last)/1000);last=now;
 if(running&&!paused){
  clockTime+=dt;
  speed=Math.min(58,18+distance*.042);
  const previousDistance=distance;
  const previousLane=playerLane,previousPlayerY=playerY,previousSlide=sliding;
  distance+=speed*dt;
  const milestone=Math.floor(distance/240);
  if(milestone>lastMilestone){
   lastMilestone=milestone;
   const chapter=journeyChapter(CHARS.find(c=>c.id===profile.selected)?.biome,distance);
   $('worldName').textContent=currentTheme.name+' · '+chapter.name;
   showSpeedNotice('🌍 NEW AREA: '+chapter.name.toUpperCase());
   sound(790,.15,'triangle',.04);
  }
  energy=Math.max(0,energy-dt*(1.1+speed*.025));if(energy<=0)finish('You ran out of energy.');
  playerLane=THREE.MathUtils.damp(playerLane,targetLane,13,dt);
  if(playerY>.001||velocityY>0){velocityY-=25*dt;playerY=Math.max(0,playerY+velocityY*dt);if(playerY===0)velocityY=0;}
  sliding=Math.max(0,sliding-dt);shield=Math.max(0,shield-dt);magnet=Math.max(0,magnet-dt);invincible=Math.max(0,invincible-dt);
  while(spawnNext<distance+150){row(spawnNext);spawnNext+=Math.max(28,speed*0.9);}
  for(const e of [...entities]){
   e.root.position.z=2-(e.at-distance);
   if(['coin','energy','shield','magnet','food','box'].includes(e.kind)){
     e.root.rotation.y+=dt*2.8;e.root.position.y=Math.sin(clockTime*4+e.at)*.09;
     if(magnet>0&&e.kind==='coin'&&Math.abs(e.at-distance)<3&&Math.abs(e.root.position.x-(laneX[0]+(laneX[2]-laneX[0])*playerLane/2))<1.7)e.root.position.x=THREE.MathUtils.damp(e.root.position.x,laneX[0]+(laneX[2]-laneX[0])*playerLane/2,5,dt);
   } else if(e.kind==='lion') e.root.rotation.y=Math.sin(clockTime*3)*.25;
   const isPick=['coin','energy','shield','magnet','food','box'].includes(e.kind);
   const playerX=laneX[0]+(laneX[2]-laneX[0])*playerLane/2;
   const dx=Math.abs(e.root.position.x-playerX);
   // A pickup requires actual horizontal AND vertical contact; adjacent lanes never auto-collect.
   const dy=Math.abs((e.kind==='coin'?1.12:e.kind==='energy'?1.2:1.27)+e.root.position.y-(playerY+1.12));
   const sameLane=isPick?dx<.43&&dy<.75:dx<1.03;
   // Check all positions swept between rendered frames (including lane
   // changes and jumping). Endpoint-only collision misses fast hazards.
   const hazardContact=!isPick&&!e.taken?sweptHazardContact({
     kind:e.kind,obstacleDistance:e.at,obstacleX:e.root.position.x,
     previousDistance,distance,
     previousX:laneX[0]+(laneX[2]-laneX[0])*previousLane/2,
     x:playerX,previousY:previousPlayerY,y:playerY,
     slideStart:previousSlide,slideEnd:sliding
   }):null;
   if(running&&!ended&&!e.taken&&(
     isPick?(e.at>=previousDistance-.76&&e.at<=distance+.76&&sameLane):Boolean(hazardContact)
   )){
    if(isPick){
      if(e.kind==='coin'){combo=distance-lastCoinDistance<9?combo+1:1;lastCoinDistance=distance;runCoins++;if(combo===1||combo===5||combo===10)rewardPop($('coins'));sound(760+Math.min(combo,8)*35,.07,'sine',.04);if(combo===5||combo===10||combo===20)showSpeedNotice('✨ '+combo+' COIN STREAK!')}
      if(e.kind==='food'){
       const food=collectFood(profile,profile.selected);
       if(food){runFood++;save();sound(700,.08,'triangle',.04);showSpeedNotice(food.emoji+' '+food.label.toUpperCase()+' COLLECTED!')}
      }
      if(e.kind==='box'){
       const prize=openSurpriseBox(profile,{found:true,animal:profile.selected});
       if(prize){save();showSpeedNotice('🎁 '+prize.label);sound(840,.17,'triangle',.06)}
      }
      if(e.kind==='energy'){energy=Math.min(100,energy+29);sound(660,.18,'triangle')}
      if(e.kind==='shield'){shield=13;sound(540,.22,'triangle')}
      if(e.kind==='magnet'){magnet=11;sound(510,.22,'triangle')}
      e.taken=true;e.root.visible=false;
    }else{
      // Consume the obstacle at first physical contact. While a shield's
      // brief immunity is active, it must not appear to phase through props.
      e.taken=true;e.root.visible=false;
      if(invincible<=0){crash();if(ended)break;}
    }
   }
   if(e.at<distance-13){if(e.kind==='coin'&&!e.taken&&magnet<=0)combo=0;scene.remove(e.root);disposeGroup(e.root);entities.splice(entities.indexOf(e),1)}
  }
  // Background scenery and lane dashes wrap ahead of the player, never exposing track gaps.
  // Foreground ground and props stream past at run speed; distant clouds
  // and the stable mountain horizon make it feel like visiting new places.
  for(let i=0;i<scrollItems.length;i++)
   scrollItems[i].position.z=loopZ(i,18,layerTravel(distance,'track'),scrollItems.length,10);
  for(let i=0;i<biomeDecor.length;i++)
   biomeDecor[i].position.z=loopZ(Math.floor(i/2),11.5,layerTravel(distance,'near'),30,14);
  for(let i=0;i<skyClouds.length;i++){
   skyClouds[i].position.set((i%2?-1:1)*(13+(i%4)*2)+Math.sin(clockTime*.25+i)*1.5,
    11+(i%5)*2.2,loopZ(i,19,layerTravel(distance,'far'),15,13));
  }
  for(let i=0;i<butterflies.length;i++){
   const b=butterflies[i];
   b.g.position.set((i%2?-1:1)*(5.6+(i%3)*1.2),1.9+Math.sin(clockTime*2+i)*.32,
    loopZ(i,27,layerTravel(distance,'mid'),10,12));
   b.wings[0].rotation.y=Math.sin(clockTime*11+i)*.9;
   b.wings[1].rotation.y=-Math.sin(clockTime*11+i)*.9;
  }
  roadArt.update(distance);
  meadowDetails?.update(distance);
  skylandDetails?.update(distance,clockTime);
  prairieDetails?.update(distance);
  townDetails?.update(distance,clockTime);
  parkDetails?.update(distance);
  glacierDetails?.update(distance,clockTime);
  farmDetails?.update(distance);
  landmarks?.update(clockTime,distance);
  journeyArt?.update(distance);
  for(let i=0;i<laneDashes.length;i++){
   laneDashes[i].position.z=loopZ(Math.floor(i/2),8,distance,24,11);
  }
  if(flakes.visible)for(let i=0;i<350;i++){
   snowPos[i*3+1]-=dt*(.9+(i%5)*.2);
   snowPos[i*3+2]+=dt*speed*.4;
   if(snowPos[i*3+1]<0)snowPos[i*3+1]=19;
   if(snowPos[i*3+2]>14)snowPos[i*3+2]=-88;
  }
  if(flakes.visible)flakesGeo.attributes.position.needsUpdate=true;
  if(clockTime>noticeUntil)$('speedNotice')?.classList.add('hidden');
  updateHUD();
 }
 character.group.position.set(laneX[0]+(laneX[2]-laneX[0])*playerLane/2,playerY,2);
 projectedShadow.position.x=character.group.position.x;projectedShadow.position.z=2;projectedShadow.material.opacity=.82-Math.min(.65,playerY*.2);
 // Game progression moves toward -Z: orient every animal forward along -Z, not toward the camera.
 character.group.rotation.y=THREE.MathUtils.damp(character.group.rotation.y,Math.PI,13,dt);
 const run=running&&!paused;
 animateAnimal(character,clockTime,run,playerY>.05);
 character.update?.(dt,clockTime,run,playerY>.05);
 // Characters occupy the lower part of the view like the reference art.
 character.group.scale.x=1.03;character.group.scale.z=1.03;
 character.group.scale.y=1.03*(sliding>0?.53:(playerY>.05?1.04:1));
 // Keep the lowest animated foot touching the visible path rather than floating.
 alignAnimalFeetToRoad(character,.29,playerY);
 if(run&&playerY<=.02&&sliding<=0&&clockTime-lastStepSound>.25){lastStepSound=clockTime;sound(165+(Math.floor(clockTime*10)%3)*21,.047,'triangle',.014)}
 // Wider field of view at higher speeds makes acceleration more noticeable.
 const desiredFov=55+(Math.min(58,speed)-18)*.15;
 const newFov=THREE.MathUtils.damp(camera.fov,desiredFov,2.8,dt);
 if(Math.abs(newFov-camera.fov)>.02){camera.fov=newFov;camera.updateProjectionMatrix()}
 const desiredX=character.group.position.x*.28;
 camera.position.x=THREE.MathUtils.damp(camera.position.x,desiredX,2,dt);
 camera.lookAt(camera.position.x*.3,1.38,-21);
 // Keep the 3D sky infinite while road scenery and mountains retain parallax.
 backdrop.update(clockTime,camera);
 renderer.render(scene,camera);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();configureGameRenderer(renderer,browserQualityOptions());adaptiveRes.setMax(renderer.getPixelRatio());renderer.setPixelRatio(adaptiveRes.ratio);renderer.setSize(innerWidth,innerHeight)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)$('pauseBtn').click()});
window.addEventListener('blur',()=>{if(running&&!paused)$('pauseBtn').click();keys.clear()});
try{audioEnabled=localStorage.getItem('polar-dash-sound')==='on'}catch{};
$('soundBtn').textContent=audioEnabled?'SOUND: ON':'SOUND: OFF';
character.group.rotation.y=Math.PI;
// Read-only state snapshot used by automated browser gameplay tests.
// Only enabled with ?qa=1; it cannot change progress or inject obstacles.
if(new URLSearchParams(location.search).has('qa')){
 window.__pawverseQA=()=>Object.freeze({
  graphicsQuality:graphicsQuality.name,
  selected:profile.selected,
  biome:CHARS.find(c=>c.id===profile.selected)?.biome,
  running,paused,ended,distance,energy,lane:playerLane,
  targetLane,playerY,sliding,coins:runCoins,
  meadowFlowerStrips:meadowDetails?.strips.length??0,
  rainbowCrystalStrips:skylandDetails?.strips.length??0,
  prairieWheatStrips:prairieDetails?.strips.length??0,
  catTownStrips:townDetails?.strips.length??0,
  puppyParkStrips:parkDetails?.strips.length??0,
  penguinGlacierStrips:glacierDetails?.strips.length??0,
  mimiFarmStrips:farmDetails?.strips.length??0,
  foodCount:runFood,
  terrainZ:scrollItems[1].position.z,
  nearSceneryZ:biomeDecor[2]?.position.z,
  physicalLandmarkZ:landmarks?.strips[2]?.position.z,
  avatarFeet:character.feet?.length??0,
  avatarHeadWidth:character.group.getObjectByName(profile.selected+'-distinct-head')?.scale.x??null,
  faceStyle:character.group.getObjectByName(profile.selected+'-distinct-head')?.userData?.cuteFace?.eyeStyle??null,
  paintedFaceResolution:character.group.getObjectByName(profile.selected+'-distinct-head')?.material?.map?.image?.width??0,
  coatPattern:character.group.getObjectByName(profile.selected+'-smooth-body')?.userData?.coatPattern??null,
  paintedCoatResolution:character.group.getObjectByName(profile.selected+'-smooth-body')?.material?.map?.image?.width??0,
  hasBunnyCottonTail:profile.selected==='bunny'&&Boolean(character.group.getObjectByName('bunny-cotton-tail')),
  farCloudZ:skyClouds[1].position.z,
  horizonZ:backdrop.horizon.position.z,
  journeyChunks:journeyArt?.groups.length??0,
  inventory:{...profile.economy.inventory},
  dailyProgress:{food:profile.economy.daily.food,jumps:profile.economy.daily.jumps,runs:profile.economy.daily.runs},
  visibleFood:entities.filter(e=>!e.taken&&e.kind==='food').length,
  visibleObstacles:entities.filter(e=>!e.taken&&['rock','log','spike','lion'].includes(e.kind)).length
 });
}
menu();requestAnimationFrame(tick);
