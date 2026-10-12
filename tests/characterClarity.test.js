import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createAnimal,animateAnimal} from '../src/animalArt.js';
import {createWorldLandmarks} from '../src/landmarkArt.js';
import {createMeadowDetails} from '../src/meadowArt.js';

const animals=['bunny','unicorn','horse','cat','dog','penguin','cow'];
const disposeAnimal=actor=>{
 const geometries=new Set(),materials=new Set();
 actor.group.traverse(o=>{
  if(!o.isMesh)return;
  geometries.add(o.geometry);
  for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);
 });
 for(const geometry of geometries)geometry.dispose();
 for(const material of materials)material.dispose();
};

test('Bella has two distinguishable oval hind feet, single cotton tail and slender ears',()=>{
 const bunny=createAnimal('bunny');
 const feet=[
  bunny.group.getObjectByName('bunny-left-hind-foot'),
  bunny.group.getObjectByName('bunny-right-hind-foot')
 ];
 assert.ok(feet.every(Boolean));
 assert.ok(feet.every(foot=>Boolean(foot.getObjectByName('bunny-oval-toe'))));
 assert.ok(bunny.group.getObjectByName('bunny-cotton-tail'));
 assert.ok(bunny.group.getObjectByName('bunny-left-haunch'));
 assert.ok(bunny.group.getObjectByName('bunny-right-haunch'));
 assert.ok(bunny.group.getObjectByName('bunny-left-ear'));
 assert.ok(bunny.group.getObjectByName('bunny-right-ear'));
 assert.equal(bunny.ears.length,2);
 assert.ok(feet[0].position.x<0&&feet[1].position.x>0);
 assert.ok(bunny.tail.position.x===0,'Cotton tail should be centred between feet');
 assert.ok(bunny.ears[0].position.x<0&&bunny.ears[1].position.x>0);
 let count=0;
 bunny.group.traverse(o=>{if(o.isMesh)count++});
 assert.ok(count<75,'Avoid excessive overlapping puff-ball geometry');
 animateAnimal(bunny,.23,true,false);
 assert.ok(Math.abs(feet[0].rotation.x)>.01);
 assert.ok(Math.abs(feet[1].rotation.x)>.01);
 disposeAnimal(bunny);
});

test('Each animal has its own body/head proportions and separated hind feet',()=>{
 const dimensions=[];
 for(const id of animals){
  const actor=createAnimal(id),body=actor.group.getObjectByName(id+'-smooth-body');
  const head=actor.group.getObjectByName(id+'-distinct-head');
  assert.ok(body&&head,id+' needs distinct body and head geometry');
  const left=actor.group.getObjectByName(id+'-left-hind-foot');
  const right=actor.group.getObjectByName(id+'-right-hind-foot');
  assert.ok(left&&right,id+' needs two hind feet');
  assert.ok(left.position.x<-.25&&right.position.x>.25);
  const size=[...body.scale.toArray(),...head.scale.toArray()].map(v=>v.toFixed(2)).join(':');
  dimensions.push(size);
  disposeAnimal(actor);
 }
 assert.equal(new Set(dimensions).size,animals.length,'No reused identical proportions');
});

test('Every nearby landmark strip scrolls with its biome road while far horizon can remain still',()=>{
 for(const biome of ['meadow','rainbow','grassland','city','park','arctic','farm']){
  const scene=new THREE.Scene(),landmarks=createWorldLandmarks(scene,biome);
  assert.equal(landmarks.strips.length,5);
  assert.ok(landmarks.strips.every(s=>s.name.startsWith('physical-landmark-strip')));
  const original=landmarks.strips.map(s=>s.position.z);
  landmarks.update(1,4);
  // Nonwrapping strips advance as though the hero travelled through
  // a stationary physical environment, rather than being frozen in place.
  assert.equal(landmarks.strips[2].position.z-original[2],4,biome);
  landmarks.update(2,8);
  assert.equal(landmarks.strips[2].position.z-original[2],8,biome);
  landmarks.dispose();
  assert.ok(!scene.children.includes(landmarks.root));
 }
 const scene=new THREE.Scene(),meadow=createMeadowDetails(scene);
 const at0=meadow.strips[1].position.z;
 meadow.update(4);
 assert.equal(meadow.strips[1].position.z-at0,4,'Nearby flowers match road speed');
 meadow.dispose();
});
