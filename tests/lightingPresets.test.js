import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {LIGHTING_PRESETS,lightingFor,applyLighting,CLOUD_PUFFS,addCloudPuffs} from '../src/lightingPresets.js';
import {HORIZON_STYLES} from '../src/visual3d.js';

test('every biome has a lighting preset with sane values',()=>{
 for(const id of Object.keys(HORIZON_STYLES)){
  const p=LIGHTING_PRESETS[id];assert.ok(p,id);
  assert.ok(p.sunI>1&&p.sunI<4);assert.ok(p.hemiI>1&&p.hemiI<2.5);
  assert.ok(p.exposure>1&&p.exposure<1.5);assert.ok(p.fillI>0&&p.fillI<1.2);
 }
 assert.equal(lightingFor('nope'),LIGHTING_PRESETS.meadow);
});
test('applyLighting updates lights and exposure',()=>{
 const hemi=new THREE.HemisphereLight(),sun=new THREE.DirectionalLight(),fill=new THREE.DirectionalLight();
 const renderer={toneMappingExposure:0};
 const p=applyLighting('arctic',{renderer,hemi,sun,fill});
 assert.equal(sun.color.getHex(),p.sun);assert.equal(fill.intensity,p.fillI);
 assert.equal(renderer.toneMappingExposure,p.exposure);
 assert.doesNotThrow(()=>applyLighting('meadow',{}));
});
test('cloud has several overlapping puffs',()=>{
 assert.ok(CLOUD_PUFFS.length>=5);
 const g=new THREE.Group();let n=0;
 addCloudPuffs(g,()=>{n++});assert.equal(n,CLOUD_PUFFS.length);
});
