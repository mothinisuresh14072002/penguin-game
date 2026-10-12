import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loopZ,layerTravel,WORLD_LAYERS,JOURNEY_CHAPTERS,journeyChapter} from '../src/worldMotion.js';

test('scene chunks start contiguous across an animal runner track',()=>{
 const positions=Array.from({length:14},(_,i)=>loopZ(i,18,0,14,10));
 assert.equal(positions[0],10);
 for(let i=1;i<positions.length;i++)
  assert.equal(positions[i-1]-positions[i],18);
});
test('ground and near props move smoothly with running, never vanish after first step',()=>{
 const a=loopZ(0,18,0,14,10);
 const b=loopZ(0,18,1,14,10);
 assert.equal(b-a,1);
 const c=loopZ(1,18,1,14,10);
 assert.equal(b-c,18);
 for(const distance of [1,5,17,24,251,252,700]){
  const zs=Array.from({length:14},(_,i)=>loopZ(i,18,distance,14,10));
  assert.equal(zs.length,14);
  const sorted=zs.slice().sort((x,y)=>y-x);
  for(let i=1;i<sorted.length;i++)assert.ok(Math.abs(sorted[i-1]-sorted[i]-18)<1e-7);
 }
});
test('sky stays fixed while near props pass faster than far layers',()=>{
 assert.equal(WORLD_LAYERS.sky,0);
 assert.equal(layerTravel(100,'sky'),0);
 assert.equal(layerTravel(100,'near'),100);
 assert.ok(layerTravel(100,'mid')>layerTravel(100,'far'));
 assert.ok(layerTravel(100,'far')<10);
});
test('each of seven worlds has three named distant journey chapters',()=>{
 assert.equal(Object.keys(JOURNEY_CHAPTERS).length,7);
 for(const [biome,names] of Object.entries(JOURNEY_CHAPTERS)){
  assert.equal(names.length,3);
  assert.equal(journeyChapter(biome,0).name,names[0]);
  assert.equal(journeyChapter(biome,240).name,names[1]);
  assert.equal(journeyChapter(biome,480).name,names[2]);
 }
});
