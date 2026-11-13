import {test} from 'node:test';
import assert from 'node:assert/strict';
import {POLYFORK_BIOME_ASSETS,worldLoopZ} from '../src/polyforkScenery.js';

test('Polyfork environment props are mapped to the matching game biomes',()=>{
 const ids=Object.keys(POLYFORK_BIOME_ASSETS);
 assert.deepEqual(ids,['meadow','rainbow','grassland','city','park','arctic','farm']);
 for(const biome of ['meadow','grassland','city','park','arctic','farm']){
  assert.equal(POLYFORK_BIOME_ASSETS[biome].length,2);
  for(const asset of POLYFORK_BIOME_ASSETS[biome]){
   assert.match(asset.id,/^[a-z0-9-]+$/);
   assert.ok(asset.height>0);
  }
 }
 assert.deepEqual(POLYFORK_BIOME_ASSETS.rainbow,[]);
});

test('Polyfork environment props recycle at a stable spacing without jumps',()=>{
 const positions=Array.from({length:4},(_,i)=>worldLoopZ(i,66,0,4,18));
 const sorted=positions.slice().sort((a,b)=>b-a);
 for(let i=1;i<sorted.length;i++)assert.equal(sorted[i-1]-sorted[i],66);
 assert.equal(worldLoopZ(0,66,1,4,18),positions[0]-1);
 assert.equal(worldLoopZ(0,66,264,4,18),positions[0]);
});
