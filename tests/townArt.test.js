import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createAnimal,animateAnimal} from '../src/animalArt.js';
import {createWorldLandmarks} from '../src/landmarkArt.js';
import {createTownDetails,TOWN_STRIPS,TOWN_STRIP_LENGTH,HOUSES_PER_STRIP} from '../src/townArt.js';

test('Coco Cat has plush orange tabby markings, green irises and an animated tail',()=>{
 const actor=createAnimal('cat');
 assert.ok(actor.group.getObjectByName('cat-tabby-back'));
 assert.ok(actor.group.getObjectByName('cat-lavender-scarf'));
 assert.ok(actor.group.getObjectByName('cat-tail-tip'));
 assert.ok(actor.catTail);
 const mats=new Set(),geos=new Set();
 let stripes=0;
 actor.group.traverse(o=>{
  if(!o.isMesh)return;
  mats.add(o.material);
  geos.add(o.geometry);
  if(o.name==='cat-fur-stripe')stripes++;
 });
 assert.ok(stripes>=5,'Kitten must have clearly visible rear tabby markings');
 assert.ok([...mats].some(m=>m.isMeshPhysicalMaterial));
 assert.ok([...mats].some(m=>m.color?.getHex()===0x54b88e),'Kitten should have green irises');
 animateAnimal(actor,.27,true,false);
 assert.ok(Math.abs(actor.catTail.rotation.z)>0);
 animateAnimal(actor,.27,false,false);
 assert.equal(actor.catTail.rotation.z,0);
 for(const m of mats)m.dispose();
 for(const g of geos)g.dispose();
});
test('Cat Town uses instanced pastel facades and flowers with limited draw calls',()=>{
 const scene=new THREE.Scene();
 const town=createTownDetails(scene);
 assert.equal(town.strips.length,TOWN_STRIPS);
 assert.ok(scene.children.includes(town.root));
 let drawCalls=0,instances=0,houses=0,flowerboxes=0;
 const names=new Set();
 town.root.traverse(o=>{
  if(!o.isInstancedMesh)return;
  drawCalls++;instances+=o.count;
  names.add(o.geometry.type);
  if(o.material.color?.getHex()===0xffffff&&o.count===HOUSES_PER_STRIP)houses++;
  if(o.count===HOUSES_PER_STRIP*2&&o.material.color?.getHex()===0xa16d5e)flowerboxes++;
 });
 assert.equal(drawCalls,TOWN_STRIPS*10);
 assert.ok(instances>TOWN_STRIPS*HOUSES_PER_STRIP*10);
 assert.ok(houses>=TOWN_STRIPS);
 assert.equal(flowerboxes,TOWN_STRIPS);
 assert.ok(names.has('BoxGeometry'));
 const positions=town.strips.map(s=>s.position.z);
 town.update(TOWN_STRIPS*TOWN_STRIP_LENGTH+13,4);
 assert.ok(town.strips.some((s,i)=>s.position.z!==positions[i]));
 for(let d=0;d<3000;d+=193){
  town.update(d,d*.03);
  assert.ok(town.strips.every(s=>Number.isFinite(s.position.z)));
 }
 town.dispose();
 assert.ok(!scene.children.includes(town.root));
});
test('Cat Town landmark clock hands move while the other biomes remain separate',()=>{
 const scene=new THREE.Scene();
 const catWorld=createWorldLandmarks(scene,'city');
 const clock=catWorld.root.getObjectByName('cat-town-clock');
 assert.ok(clock);
 const hands=['clock-minute-hand','clock-hour-hand'].map(name=>clock.getObjectByName(name));
 assert.ok(hands.every(Boolean));
 const angles=hands.map(h=>h.rotation.z);
 catWorld.update(5);
 assert.ok(hands.every((h,i)=>h.rotation.z!==angles[i]));
 catWorld.dispose();
 const meadow=createWorldLandmarks(scene,'meadow');
 assert.equal(meadow.root.getObjectByName('cat-town-clock'),undefined);
 meadow.update(5);
 meadow.dispose();
});
