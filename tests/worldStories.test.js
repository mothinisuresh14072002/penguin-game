import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD_STORIES,createWorldStory} from '../src/worldStories.js';

test('six themed chapters exist for every non-bunny animal world',()=>{
 assert.equal(Object.keys(WORLD_STORIES).length,6);
 for(const names of Object.values(WORLD_STORIES))assert.equal(new Set(names).size,6);
});
test('recycled strips show all themes and never place props in running lanes',()=>{
 for(const biome of Object.keys(WORLD_STORIES)){
  const strips=Array.from({length:4},()=>new THREE.Group());
  const journey=createWorldStory(strips,biome);
  const names=new Set();
  for(let chapter=0;chapter<6;chapter++){
   journey.update(chapter*3*54);
   const g=journey.groups[0];names.add(g.userData.chapter);
   assert.ok(g.children.length>0&&g.children.length<30);
   for(const obj of g.children)assert.ok(Math.abs(obj.position.x)>5,'props outside lanes');
  }
  assert.equal(names.size,6);
  journey.dispose();
  assert.ok(strips.every(s=>s.children.length===0));
 }
});
