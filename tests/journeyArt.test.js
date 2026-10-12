import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createJourneyArt,JOURNEY_CHUNKS,JOURNEY_SPACING} from '../src/journeyArt.js';
import {JOURNEY_CHAPTERS} from '../src/worldMotion.js';

test('each world streams four different mid-distance places safely outside lanes',()=>{
 for(const biome of Object.keys(JOURNEY_CHAPTERS)){
  const scene=new THREE.Scene(),world=createJourneyArt(scene,biome);
  assert.equal(world.groups.length,JOURNEY_CHUNKS);
  assert.ok(scene.children.includes(world.root));
  let meshes=0;
  world.root.traverse(o=>{
   if(!o.isMesh)return;
   meshes++;
   assert.ok(Math.abs(o.getWorldPosition(new THREE.Vector3()).x)>=9,
      biome+' has scene geometry too close to running lanes');
  });
  assert.ok(meshes>=30,biome+' should have recognizable 3D roadside places');
  const positions=world.groups.map(g=>g.position.z);
  world.update(40);
  assert.ok(world.groups.some((g,i)=>g.position.z!==positions[i]));
  for(const d of [0,120,240,960,2500]){
   world.update(d);
   assert.ok(world.groups.every(g=>Number.isFinite(g.position.z)));
  }
  world.dispose();
  assert.equal(scene.children.includes(world.root),false);
 }
});
test('grounded mid-distance landmarks travel at physical road speed',()=>{
 const world=createJourneyArt(new THREE.Scene(),'farm');
 const old=world.groups[1].position.z;
 world.update(4);
 const delta=world.groups[1].position.z-old;
 assert.ok(delta>0&&delta<4,'buildings should pass slower than near track');
 world.dispose();
});
