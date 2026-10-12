import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createAnimal,animateAnimal} from '../src/animalArt.js';
import {createSkylandDetails,SKYLAND_STRIPS,SKYLAND_STRIP_LENGTH,
 CRYSTALS_PER_STRIP,SPARKLES_PER_STRIP} from '../src/skylandArt.js';

test('Ula Unicorn has pearlescent fur, golden horn and a long rainbow rear mane',()=>{
 const actor=createAnimal('unicorn');
 assert.ok(actor.group.getObjectByName('unicorn-golden-horn'));
 assert.ok(actor.group.getObjectByName('unicorn-rainbow-mane'));
 assert.ok(actor.group.getObjectByName('unicorn-left-wing'));
 assert.ok(actor.group.getObjectByName('unicorn-right-wing'));
 const strands=[];
 actor.group.traverse(obj=>{
  if(obj.name==='unicorn-mane-strand')strands.push(obj);
 });
 assert.ok(strands.length>=10);
 const mats=new Set(),geos=new Set(),colors=new Set();
 actor.group.traverse(obj=>{
  if(!obj.isMesh)return;
  geos.add(obj.geometry);
  for(const material of Array.isArray(obj.material)?obj.material:[obj.material]){
   mats.add(material);if(material.color)colors.add(material.color.getHex());
  }
 });
 assert.ok([...mats].some(m=>m.isMeshPhysicalMaterial));
 assert.ok(colors.size>12);
 animateAnimal(actor,.19,true,false);
 assert.notEqual(actor.pivotL.rotation.x,0);
 assert.ok(Math.abs(actor.mane.rotation.z)>0);
 assert.ok(Math.abs(actor.wings[0].rotation.z)>0);
 assert.ok(Math.abs(actor.wings[1].rotation.z)>0);
 for(const g of geos)g.dispose();
 for(const m of mats)m.dispose();
});

test('Skyland has performant instanced crystal and glitter strips',()=>{
 const scene=new THREE.Scene();
 const skyland=createSkylandDetails(scene);
 assert.equal(skyland.strips.length,SKYLAND_STRIPS);
 assert.ok(scene.children.includes(skyland.root));
 let instanced=0,instances=0,crystals=0,islands=0;
 skyland.root.traverse(obj=>{
  if(obj.isInstancedMesh){
   instanced++;instances+=obj.count;
   if(obj.geometry?.type==='ConeGeometry')crystals+=obj.count;
  }
  if(obj.name==='floating-pastel-island')islands++;
 });
 assert.equal(instanced,SKYLAND_STRIPS*5);
 assert.equal(crystals,SKYLAND_STRIPS*CRYSTALS_PER_STRIP);
 assert.ok(instances>=SKYLAND_STRIPS*(CRYSTALS_PER_STRIP*2+SPARKLES_PER_STRIP));
 assert.equal(islands,SKYLAND_STRIPS*2);
 const old=skyland.strips.map(s=>s.position.z);
 skyland.update(SKYLAND_STRIP_LENGTH*2+23,5);
 assert.ok(skyland.strips.some((s,i)=>s.position.z!==old[i]));
 for(const distance of [0,112,534,1877,3500]){
  skyland.update(distance,distance*.02);
  assert.ok(skyland.strips.every(s=>Number.isFinite(s.position.z)));
 }
 skyland.dispose();
 assert.ok(!scene.children.includes(skyland.root));
});
