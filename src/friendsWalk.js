import * as THREE from 'three';
import {animate} from 'animejs';
import {createAnimal,animateAnimal,alignAnimalFeetToRoad} from './animalArt.js';
import {applyWardrobe,sanitizeWardrobe} from './dressUp.js';

export const WALK_ANIMALS=[
 {id:'bunny',name:'Bella Bunny',emoji:'🐰'},{id:'unicorn',name:'Ula Unicorn',emoji:'🦄'},
 {id:'horse',name:'Hugo Horse',emoji:'🐴'},{id:'cat',name:'Coco Cat',emoji:'🐱'},
 {id:'dog',name:'Dodo Dog',emoji:'🐶'},{id:'penguin',name:'Pip Penguin',emoji:'🐧'},
 {id:'cow',name:'Mimi Cow',emoji:'🐮'}
];
export const WALK_SPEED=2.65;
export const walkDistance=(distance,dt,active)=>active?distance+WALK_SPEED*Math.max(0,Math.min(.08,dt)):distance;
const $=id=>document.getElementById(id);
const profile=(()=>{try{return JSON.parse(localStorage.getItem('penguin-ice-runner-v3')||'{}')}catch{return {}}})();
const wardrobe=sanitizeWardrobe(profile.wardrobe);
const scene=new THREE.Scene();scene.background=new THREE.Color('#aee9f7');scene.fog=new THREE.Fog('#c9effa',38,90);
const camera=new THREE.PerspectiveCamera(51,innerWidth/innerHeight,.1,120);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
renderer.domElement.style.cssText='position:fixed;inset:0;display:block;width:100%;height:100%;touch-action:none';
scene.add(new THREE.HemisphereLight(0xffffff,0x9bc7a1,2.1));
const sunlight=new THREE.DirectionalLight(0xfff3df,2.1);sunlight.position.set(-6,10,7);scene.add(sunlight);
const mat=(color)=>new THREE.MeshLambertMaterial({color});
const grass=mat(0x83cb83),path=mat(0xffddba),trim=mat(0xfff8df),wood=mat(0xa57657),leaves=mat(0x78bd82),flowers=[mat(0xffb2d2),mat(0xffe48d),mat(0xc9b3fa)];
// Reuse the same GPU materials during every scenic strip recycle.
const cottageWall=mat(0xffe1cf),cottageRoof=mat(0xf4a6bb),pond=mat(0x99e9ed),magicStone=mat(0xc9a7ee);
const box=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,9,7);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(250,250),grass);ground.rotation.x=-Math.PI/2;ground.position.y=-.09;scene.add(ground);
const road=new THREE.Mesh(new THREE.PlaneGeometry(7.8,250),path);road.rotation.x=-Math.PI/2;road.position.y=-.045;scene.add(road);
for(const side of [-1,1]){const edge=new THREE.Mesh(new THREE.BoxGeometry(.16,.07,250),trim);edge.position.set(side*3.94,.005,0);scene.add(edge)}
const scenery=new THREE.Group();scene.add(scenery);
const segments=Array.from({length:12},(_,i)=>{const group=new THREE.Group();scenery.add(group);return group});
const geo=(parent,shape,material,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(shape,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;};
const tree=(g,x,z)=>{geo(g,box,wood,x,.8,z,.23,1.6,.25);geo(g,sphere,leaves,x,2.05,z,1.08,.95,.89)};
const bloom=(g,x,z,i)=>{geo(g,box,leaves,x,.24,z,.06,.44,.06);geo(g,sphere,flowers[i%3],x,.52,z,.22,.2,.2)};
const cottage=(g,x,z)=>{geo(g,box,cottageWall,x,.7,z,1.6,1.3,1.5);const roof=geo(g,box,cottageRoof,x,1.49,z,1.85,.32,1.78);roof.rotation.z=.08};
function fillSegment(g,index){g.clear();const theme=Math.floor(index/4)%6;for(const side of [-1,1]){const x=side*(6.5+(index%3));if(theme===0||theme===4)cottage(g,x,-3);if(theme!==2)tree(g,x+side*2.6,-8);if(theme===2){for(let j=0;j<5;j++)bloom(g,x+side*(j%2)*.6,-j*2,j)}else for(let j=0;j<3;j++)bloom(g,x+side*.8,-j*3-2,j+index);if(theme===3||theme===5)geo(g,sphere,theme===5?pond:magicStone,x,.19,-5,1.6,.16,1.5)}}
let distance=0,running=false,paused=false,front=false,time=0,actors=[];
const selectors=[$('friend-one'),$('friend-two')];
for(const select of selectors)for(const animal of WALK_ANIMALS){const option=document.createElement('option');option.value=animal.id;option.textContent=animal.emoji+' '+animal.name;select.append(option)}
selectors[0].value=WALK_ANIMALS.some(a=>a.id===profile.selected)?profile.selected:'bunny';
selectors[1].value=selectors[0].value==='cat'?'dog':'cat';
function removeActors(){for(const actor of actors){scene.remove(actor.group);const seen=new Set();actor.group.traverse(o=>{if(!o.isMesh)return;seen.add(o.geometry);seen.add(o.material)});for(const item of seen)item.dispose?.()}actors=[]}
function start(){
 const ids=selectors.map(s=>s.value);if(ids[0]===ids[1]){selectors[1].value=WALK_ANIMALS[(WALK_ANIMALS.findIndex(a=>a.id===ids[0])+1)%7].id;ids[1]=selectors[1].value}
 removeActors();actors=ids.map((id,i)=>{const actor=createAnimal(id);actor.group.position.set(i===0?-1.25:1.25,0,3);actor.group.rotation.y=Math.PI;applyWardrobe(actor,wardrobe.equipped[id]||{});scene.add(actor.group);return actor});
 distance=0;time=0;running=true;paused=false;
 segments.forEach((g,i)=>{fillSegment(g,i);g.position.z=5-i*17;g.userData.index=i});
 $('friend-setup').hidden=true;$('walk-controls').hidden=false;$('walk-pause').textContent='⏸ Pause';
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)animate(renderer.domElement,{opacity:[.6,1],duration:500,ease:'outCubic'});
}
$('walk-start').onclick=start;
$('walk-pause').onclick=()=>{paused=!paused;$('walk-pause').textContent=paused?'▶ Resume':'⏸ Pause'};
$('walk-camera').onclick=()=>{front=!front};
$('walk-change').onclick=()=>{running=false;removeActors();$('friend-setup').hidden=false;$('walk-controls').hidden=true};
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const clock=new THREE.Clock();
function frame(){
 requestAnimationFrame(frame);
 const dt=Math.min(clock.getDelta(),.08);
 if(running&&!paused){time+=dt;distance=walkDistance(distance,dt,true);$('walk-distance').textContent=Math.floor(distance)+' m';
  for(const actor of actors){animateAnimal(actor,time*.72,true,false);actor.group.position.y=0;alignAnimalFeetToRoad(actor,0);actor.group.position.z=3;actor.group.rotation.y=Math.PI;} // Front camera sees faces; rear camera sees both friends from behind.
  for(const g of segments){g.position.z+=dt*WALK_SPEED; if(g.position.z>22){const smallest=Math.min(...segments.map(x=>x.position.z));g.position.z=smallest-17;g.userData.index+=segments.length;fillSegment(g,g.userData.index)}}
 }
 camera.position.set(0,front?3.2:4.3,front?-4.7:11.5);camera.lookAt(0,1.15,front?3.2:-4);renderer.render(scene,camera);
}
frame();
