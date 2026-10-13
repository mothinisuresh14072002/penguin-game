import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createAnimal,animateAnimal} from '../src/animalArt.js';
import {createWorldLandmarks} from '../src/landmarkArt.js';
import {createPrairieDetails,PRAIRIE_STRIPS,PRAIRIE_STRIP_LENGTH,WHEAT_PER_STRIP} from '../src/prairieArt.js';

test('Hugo Horse has soft PBR coat, long chestnut mane and pony markings',()=>{
 const pony=createAnimal('horse');
 assert.equal(pony.group.getObjectByName('horse-distinct-head').userData.cuteFace.eyeStyle,'soft-oval-catchlight-v1');
 assert.ok(pony.group.getObjectByName('horse-pony-mane'));
 assert.ok(pony.group.getObjectByName('horse-pony-blanket'));
 assert.equal(pony.ears.length,2);
 let strands=0;
 const mats=new Set(),geos=new Set();
 pony.group.traverse(o=>{
  if(!o.isMesh)return;
  mats.add(o.material);
  geos.add(o.geometry);
  if(o.name==='horse-mane-lock')strands++;
 });
 assert.ok(strands>=10,'The pony needs distinct visible mane locks');
 assert.ok([...mats].some(m=>m.isMeshPhysicalMaterial),'Soft chestnut fur needs sheen');
 animateAnimal(pony,.37,true,false);
 assert.ok(Math.abs(pony.mane.rotation.z)>0);
 assert.ok(Math.abs(pony.feet[0].rotation.x)>0);
 for(const material of mats)material.dispose();
 for(const geometry of geos)geometry.dispose();
});
test('Golden prairie loops 550 stalks and hay in bounded draw calls',()=>{
 const scene=new THREE.Scene();
 const prairie=createPrairieDetails(scene);
 assert.ok(scene.children.includes(prairie.root));
 assert.equal(prairie.strips.length,PRAIRIE_STRIPS);
 let instances=0,drawCalls=0,stalkMeshes=0,hayRolls=0;
 prairie.root.traverse(o=>{
  if(!o.isInstancedMesh)return;
  drawCalls++;instances+=o.count;
  if(o.geometry.type==='CylinderGeometry'){
   if(o.count===WHEAT_PER_STRIP)stalkMeshes++;
   if(o.count===6)hayRolls++;
  }
 });
 assert.equal(drawCalls,PRAIRIE_STRIPS*6);
 assert.equal(stalkMeshes,PRAIRIE_STRIPS);
 assert.equal(hayRolls,PRAIRIE_STRIPS);
 assert.ok(instances>=PRAIRIE_STRIPS*(WHEAT_PER_STRIP*7));
 const first=prairie.strips.map(t=>t.position.z);
 prairie.update(PRAIRIE_STRIPS*PRAIRIE_STRIP_LENGTH+7);
 assert.ok(prairie.strips.some((t,i)=>t.position.z!==first[i]));
 for(let dist=0;dist<4200;dist+=199){
  prairie.update(dist);
  assert.ok(prairie.strips.every(t=>Number.isFinite(t.position.z)));
 }
 prairie.dispose();
 assert.ok(!scene.children.includes(prairie.root));
});
test('Horse Prairie windmills animate while other worlds stay independent',()=>{
 const scene=new THREE.Scene();
 const prairie=createWorldLandmarks(scene,'grassland');
 const rotors=[];
 prairie.root.traverse(o=>{if(o.name==='prairie-windmill-rotor')rotors.push(o)});
 assert.equal(rotors.length,3);
 assert.ok(prairie.meshCount>35);
 const before=rotors.map(r=>r.rotation.z);
 prairie.update(3);
 assert.ok(rotors.every((r,i)=>r.rotation.z!==before[i]));
 prairie.dispose();
 assert.ok(!scene.children.includes(prairie.root));
 const other=createWorldLandmarks(scene,'city');
 assert.ok(!other.root.getObjectByName('prairie-windmill-rotor'));
 other.update(12);
 other.dispose();
});
