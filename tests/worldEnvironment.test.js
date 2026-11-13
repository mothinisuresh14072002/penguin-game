import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TERRAIN_THEMES,terrainThemeFor,terrainSeed} from '../src/worldEnvironment.js';

test('all seven playable worlds have a dedicated 3D terrain material theme',()=>{
 const expected=['meadow','rainbow','grassland','city','park','arctic','farm'];
 assert.deepEqual(Object.keys(TERRAIN_THEMES),expected);
 for(const id of expected){
  const theme=terrainThemeFor(id);
  assert.match(theme.base,/^#[0-9a-f]{6}$/i);
  assert.ok(Number.isInteger(theme.foliage));
  assert.ok(['grass','crystal','stone','ice'].includes(theme.mode));
 }
});

test('terrain theme lookup safely falls back for unknown world ids',()=>{
 assert.equal(terrainThemeFor('unknown'),TERRAIN_THEMES.meadow);
});

test('terrain texture scatter uses stable deterministic seeds',()=>{
 for(const value of [0,1,17,512,9001]){
  assert.equal(terrainSeed(value),terrainSeed(value));
  assert.ok(terrainSeed(value)>=0&&terrainSeed(value)<1);
 }
});
