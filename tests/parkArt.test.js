import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createAnimal,animateAnimal} from '../src/animalArt.js';
import {createParkDetails,PARK_STRIPS,PARK_STRIP_LENGTH,PARK_FLOWERS_PER_STRIP} from '../src/parkArt.js';
import {createWorldLandmarks} from '../src/landmarkArt.js';

test('Dodo Dog has soft PBR fur, floppy ears, red collar and wagging tail',()=>{
 const pup=createAnimal('dog');
 assert.ok(pup.group.getObjectByName('dog-red-collar'));
 assert.ok(pup.group.getObjectByName('dog-collar-tag'));
 assert.ok(pup.group.getObjectByName('dog-collar-back'));
 assert.ok(pup.group.getObjectByName('dog-park-heart'));
 assert.equal(pup.dogEars.length,2);
 assert.equal(pup.dogEars[0].name,'dog-left-floppy-ear');
 assert.equal(pup.dogEars[1].name,'dog-right-floppy-ear');
 assert.ok(pup.dogTail);
 const mats=new Set(),geos=new Set(),colors=new Set();
 pup.group.traverse(o=>{
  if(!o.isMesh)return;
  geos.add(o.geometry);
  const all=Array.isArray(o.material)?o.material:[o.material];
  for(const m of all){mats.add(m);if(m.color)colors.add(m.color.getHex());}
 });
 assert.ok([...mats].some(m=>m.isMeshPhysicalMaterial),'Dog fur needs soft sheen');
 assert.ok(colors.size>=5,'The puppy should have readable coat and accessory colour');
 assert.equal(pup.group.getObjectByName('dog-smooth-body').userData.coatPattern,'cream-shoulders');
 animateAnimal(pup,.25,true,false);
 assert.ok(Math.abs(pup.dogEars[0].rotation.x)>.01);
 assert.ok(Math.abs(pup.dogEars[1].rotation.z)>.01);
 assert.ok(Math.abs(pup.dogTail.rotation.y)>.01);
 animateAnimal(pup,.25,false,false);
 assert.equal(pup.dogTail.rotation.y,0);
 for(const g of geos)g.dispose();
 for(const m of mats)m.dispose();
});
test('Puppy Park flows past runner in four instanced garden strips',()=>{
 const scene=new THREE.Scene();
 const park=createParkDetails(scene);
 assert.ok(scene.children.includes(park.root));
 assert.equal(park.strips.length,PARK_STRIPS);
 let drawCalls=0,total=0,petals=0;
 const geos=new Set();
 park.root.traverse(o=>{
  if(!o.isInstancedMesh)return;
  drawCalls++;
  total+=o.count;
  geos.add(o.geometry);
  if(o.geometry.type==='SphereGeometry'&&o.count>PARK_FLOWERS_PER_STRIP)petals+=o.count;
 });
 assert.equal(drawCalls,PARK_STRIPS*8);
 assert.ok(total>=PARK_STRIPS*PARK_FLOWERS_PER_STRIP*7);
 assert.ok(petals>PARK_STRIPS*PARK_FLOWERS_PER_STRIP*4);
 const old=park.strips.map(t=>t.position.z);
 park.update(PARK_STRIPS*PARK_STRIP_LENGTH+17);
 assert.ok(park.strips.some((t,i)=>t.position.z!==old[i]));
 for(let d=0;d<4000;d+=179){
  park.update(d);
  assert.ok(park.strips.every(t=>Number.isFinite(t.position.z)));
 }
 park.dispose();
 assert.ok(!scene.children.includes(park.root));
});
test('Puppy Park has pond, lily blossoms, benches and off-road gazebo',()=>{
 const scene=new THREE.Scene();
 const park=createWorldLandmarks(scene,'park');
 assert.equal(park.theme,'park');
 assert.ok(park.meshCount>130);
 scene.updateMatrixWorld(true);
 const positions=[];
 park.root.traverse(o=>{if(o.isMesh)positions.push(o.getWorldPosition(new THREE.Vector3()));});
 // Gazebo roof is off the roadway, not at x=0 where it was previously.
 const roof=positions.find(v=>Math.abs(v.y-6.75)<.001&&Math.abs(v.z+88)<.001);
 assert.ok(roof);
 assert.equal(roof.x,14);
 park.update(1);
 park.dispose();
 const city=createWorldLandmarks(scene,'city');
 assert.ok(!scene.children.includes(park.root));
 city.dispose();
});
