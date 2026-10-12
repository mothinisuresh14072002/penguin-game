import {test} from 'node:test';
import assert from 'node:assert/strict';
import {QUALITY_PRESETS,chooseGraphicsQuality} from '../src/graphicsQuality.js';
import {surfaceKindForColor,surfaceBump,giveSurfaceDetail} from '../src/hdSurface.js';
import {HORIZON_STYLES,create3DBackdrop} from '../src/visual3d.js';
import * as THREE from 'three';

test('desktop gets the HD quality preset but mobile and multiplayer stay lightweight',()=>{
 assert.equal(chooseGraphicsQuality({width:1920,hardwareConcurrency:12,deviceMemory:16}), 'hd');
 assert.equal(chooseGraphicsQuality({width:1920,hardwareConcurrency:12,deviceMemory:16,multiplayer:true}),'balanced');
 assert.equal(chooseGraphicsQuality({width:420,isMobile:true,hardwareConcurrency:4}),'mobile');
 assert.equal(chooseGraphicsQuality({width:420,isMobile:true,requested:'hd'}),'hd');
 assert.equal(chooseGraphicsQuality({width:1920,requested:'balanced'}),'balanced');
 assert.equal(QUALITY_PRESETS.hd.maxPixelRatio,2);
 assert.equal(QUALITY_PRESETS.hd.shadowSize,2048);
 assert.ok(QUALITY_PRESETS.mobile.maxPixelRatio<=1.25);
});

test('plant colours are classified for shared surface texture without a browser canvas',()=>{
 assert.equal(surfaceKindForColor(0x5cb66b),'foliage');
 assert.equal(surfaceKindForColor(0x986644),'bark');
 assert.equal(surfaceKindForColor(0xffffff),null);
 assert.equal(surfaceBump('foliage'),null);
 const m=new THREE.MeshStandardMaterial({color:0x65be76});
 assert.equal(giveSurfaceDetail(m,'foliage'),m);
 m.dispose();
});

test('every biome retains a genuine 3D sky and distinct stationary horizon',()=>{
 assert.equal(Object.keys(HORIZON_STYLES).length,7);
 for(const biome of Object.keys(HORIZON_STYLES)){
  const scene=new THREE.Scene();
  const art=create3DBackdrop(scene,biome);
  const sky=scene.getObjectByName('3d-sky-dome');
  assert.ok(sky?.isMesh);
  assert.match(sky.material.fragmentShader,/horizonBand/);
  assert.match(sky.material.fragmentShader,/fluff/);
  assert.ok(scene.getObjectByName('biome-3d-horizon'));
  art.dispose();
  assert.equal(scene.getObjectByName('biome-3d-horizon'),undefined);
 }
});
