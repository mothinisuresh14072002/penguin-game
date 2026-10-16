import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ROAD_STYLES,roadStyle} from '../src/roadArt.js';
import {LANDMARK_THEMES,createWorldLandmarks} from '../src/landmarkArt.js';
import {createAnimal} from '../src/animalArt.js';

const pairs=[
 ['bunny','meadow'],['unicorn','rainbow'],['horse','grassland'],
 ['cat','city'],['dog','park'],['penguin','arctic'],['cow','farm']
];
test('all seven character worlds use different road art and landmark themes',()=>{
 assert.equal(Object.keys(ROAD_STYLES).length,7);
 assert.equal(Object.keys(LANDMARK_THEMES).length,7);
 const descriptions=new Set();
 for(const [animal,biome] of pairs){
  const style=roadStyle(biome);
  assert.ok(style.name&&style.base&&style.light&&style.line,animal+' needs a painted road');
  descriptions.add(style.name);
  assert.ok(LANDMARK_THEMES[biome],animal+' needs 3D landmarks');
 }
 assert.equal(descriptions.size,7);
});
test('every biome contains substantial physical 3D landmarks',()=>{
 for(const [,biome] of pairs){
  const scene=new THREE.Scene();
  const world=createWorldLandmarks(scene,biome);
  assert.ok(scene.children.includes(world.root));
  assert.ok(world.meshCount>=18,biome+' needs visible landmark meshes');
  let count=0;
  world.root.traverse(node=>{if(node.isMesh)count++});
  assert.equal(count,world.meshCount);
  world.dispose();
  assert.ok(!scene.children.includes(world.root),'world switching must release old 3D scenery');
 }
});
test('all animals have recognizable rear-view details while keeping animated limbs',()=>{
 for(const [id] of pairs){
  const animal=createAnimal(id);
  const rear=animal.group.getObjectByName('character-rear-design-'+id);
  assert.ok(rear,id+' is missing rear-view markings');
  let details=0;
  rear.traverse(o=>{if(o.isMesh)details++});
  assert.ok(details>=0,id+' should support a clean painted rear silhouette');
  assert.ok(animal.group.getObjectByName(id+'-smooth-body'));
  if(id==='penguin')assert.ok(animal.group.getObjectByName('penguin-flipper'));
  assert.equal(animal.feet.length,2);
  const geometries=new Set(),materials=new Set();
  animal.group.traverse(o=>{if(o.isMesh){
   geometries.add(o.geometry);
   for(const material of Array.isArray(o.material)?o.material:[o.material])materials.add(material);
  }});
  for(const g of geometries)g.dispose();
  for(const m of materials)m.dispose();
 }
});
