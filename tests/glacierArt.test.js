import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createAnimal,animateAnimal} from '../src/animalArt.js';
import {createGlacierDetails,GLACIER_STRIPS,GLACIER_STRIP_LENGTH,ICE_SPIRES_PER_STRIP,SNOWFLAKES} from '../src/glacierArt.js';
import {createWorldLandmarks} from '../src/landmarkArt.js';

test('Pip Penguin has a soft coat, little blue scarf, flippers and snowy badge',()=>{
 const penguin=createAnimal('penguin');
 for(const part of ['penguin-distinct-head','penguin-blue-scarf',
   'penguin-snowflake-badge']){
   assert.ok(penguin.group.getObjectByName(part),part+' is missing');
 }
 const flippers=[];
 let tufts=0;
 const mats=new Set(),geos=new Set();
 penguin.group.traverse(o=>{
  if(!o.isMesh)return;
  if(o.name==='penguin-flipper')flippers.push(o);
  if(o.name==='penguin-crown-tuft')tufts++;
  geos.add(o.geometry);
  for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);
 });
 assert.equal(flippers.length,2);
 assert.equal(tufts,3);
 assert.ok([...mats].some(m=>m.isMeshPhysicalMaterial));
 animateAnimal(penguin,.21,true,false);
 assert.ok(Math.abs(penguin.pivotL.rotation.x)>.04);
 assert.ok(Math.abs(penguin.pivotR.rotation.x)>.04);
 for(const geo of geos)geo.dispose();
 for(const mat of mats)mat.dispose();
});
test('Penguin Glacier uses bounded instanced spires plus dedicated snowflakes',()=>{
 const scene=new THREE.Scene();
 const glacier=createGlacierDetails(scene);
 assert.equal(glacier.strips.length,GLACIER_STRIPS);
 assert.equal(glacier.snowfall.geometry.getAttribute('position').count,SNOWFLAKES);
 assert.equal(glacier.snowfall.name,'glacier-snowfall');
 assert.ok(scene.children.includes(glacier.root));
 let draws=0,spires=0,rocks=0;
 glacier.root.traverse(o=>{
  if(!o.isInstancedMesh)return;
  draws++;
  if(o.geometry.type==='ConeGeometry')spires+=o.count;
  if(o.geometry.type==='IcosahedronGeometry')rocks+=o.count;
 });
 assert.equal(draws,GLACIER_STRIPS*6);
 assert.equal(spires,GLACIER_STRIPS*ICE_SPIRES_PER_STRIP);
 assert.equal(rocks,GLACIER_STRIPS*ICE_SPIRES_PER_STRIP);
 const before=glacier.strips.map(strip=>strip.position.z);
 const yBefore=glacier.snowfall.geometry.getAttribute('position').getY(0);
 glacier.update(GLACIER_STRIPS*GLACIER_STRIP_LENGTH+17,2);
 assert.ok(glacier.strips.some((strip,i)=>strip.position.z!==before[i]));
 assert.notEqual(glacier.snowfall.geometry.getAttribute('position').getY(0),yBefore);
 for(let distance=0;distance<3000;distance+=171){
  glacier.update(distance,distance/30);
  assert.ok(glacier.strips.every(strip=>Number.isFinite(strip.position.z)));
 }
 glacier.dispose();
 assert.ok(!scene.children.includes(glacier.root));
});
test('Penguin world contains glacial portal while Puppy Park stays distinct',()=>{
 const scene=new THREE.Scene();
 const arctic=createWorldLandmarks(scene,'arctic');
 const portal=arctic.root.getObjectByName('glacier-crystal-arch');
 assert.ok(portal);
 assert.ok(arctic.meshCount>80);
 scene.updateMatrixWorld(true);
 assert.equal(portal.getWorldPosition(new THREE.Vector3()).z,-47);
 assert.ok(portal.position.y>=6,'portal should leave clear running space');
 arctic.dispose();
 const park=createWorldLandmarks(scene,'park');
 assert.equal(park.root.getObjectByName('glacier-crystal-arch'),undefined);
 park.dispose();
});
