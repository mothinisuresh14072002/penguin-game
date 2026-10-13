import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createAnimal,animateAnimal} from '../src/animalArt.js';
import {createFarmDetails,FARM_STRIPS,FARM_STRIP_LENGTH,CORN_PER_STRIP,
 SUNFLOWERS_PER_STRIP} from '../src/farmArt.js';
import {createWorldLandmarks} from '../src/landmarkArt.js';

test('Mimi Cow has fluffy PBR coat, black spots, pink bow and animated tail',()=>{
 const cow=createAnimal('cow');
 for(const id of ['cow-pink-bow','cow-tail-tuft','cow-gold-bell',
    'cow-left-ear','cow-right-ear']){
  assert.ok(cow.group.getObjectByName(id),'Missing Mimi part: '+id);
 }
 assert.equal(cow.cowEars.length,2);
 assert.ok(cow.cowTail);
 const mats=new Set(),geos=new Set();
 cow.group.traverse(o=>{
  if(!o.isMesh)return;

  geos.add(o.geometry);
  for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);
 });
 assert.equal(cow.group.getObjectByName('cow-smooth-body').userData.coatPattern,'black-calf-spots','Spots should be part of the fur, not floating shapes');
 assert.ok([...mats].some(m=>m.isMeshPhysicalMaterial));
 animateAnimal(cow,.25,true,false);
 assert.ok(Math.abs(cow.cowTail.rotation.y)>.02);
 assert.ok(Math.abs(cow.cowEars[0].rotation.z)>.01);
 animateAnimal(cow,.25,false,false);
 assert.equal(cow.cowTail.rotation.y,0);
 for(const g of geos)g.dispose();
 for(const m of mats)m.dispose();
});

test('Sunflower fields and corn rows recycle through the run using GPU instances',()=>{
 const scene=new THREE.Scene(),farm=createFarmDetails(scene);
 assert.equal(farm.strips.length,FARM_STRIPS);
 assert.ok(scene.children.includes(farm.root));
 let calls=0,instances=0,corn=0,petals=0;
 farm.root.traverse(o=>{
  if(!o.isInstancedMesh)return;
  calls++;instances+=o.count;
  if(o.count===CORN_PER_STRIP)corn++;
  if(o.count===SUNFLOWERS_PER_STRIP*8)petals+=o.count;
 });
 assert.equal(calls,FARM_STRIPS*9);
 assert.ok(instances>FARM_STRIPS*500);
 assert.equal(corn,FARM_STRIPS*2);
 assert.equal(petals,FARM_STRIPS*SUNFLOWERS_PER_STRIP*8);
 const before=farm.strips.map(t=>t.position.z);
 farm.update(FARM_STRIPS*FARM_STRIP_LENGTH+19);
 assert.ok(farm.strips.some((t,i)=>t.position.z!==before[i]));
 for(let d=0;d<4000;d+=127){
  farm.update(d);
  assert.ok(farm.strips.every(t=>Number.isFinite(t.position.z)));
 }
 farm.dispose();
 assert.ok(!scene.children.includes(farm.root));
});

test('Mimi Farm includes animated windmill and keeps it out of other biomes',()=>{
 const scene=new THREE.Scene(),farm=createWorldLandmarks(scene,'farm');
 const mill=farm.root.getObjectByName('mimi-farm-windmill-rotor');
 assert.ok(mill);
 assert.ok(farm.meshCount>100,'Farm should contain meaningful landmark details');
 const before=mill.rotation.z;
 farm.update(4.5);
 assert.notEqual(mill.rotation.z,before);
 farm.dispose();
 assert.ok(!scene.children.includes(farm.root));
 const glacier=createWorldLandmarks(scene,'arctic');
 assert.equal(glacier.root.getObjectByName('mimi-farm-windmill-rotor'),undefined);
 glacier.dispose();
});
