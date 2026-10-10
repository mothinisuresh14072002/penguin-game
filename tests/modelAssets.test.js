import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { fitImportedCharacter,animalAssetUrl,CHARACTER_ASSETS } from '../src/modelAssets.js';

test('only an exported bunny GLB is configured to override a procedural animal',()=>{
 assert.equal(CHARACTER_ASSETS.bunny,'models/bunny.glb');
 assert.equal(animalAssetUrl('unicorn'),null);
 assert.ok(animalAssetUrl('bunny').endsWith('models/bunny.glb'));
});
test('imported GLB geometry is centered on the lane and sits on the road',()=>{
 const object=new THREE.Group();
 const bunny=new THREE.Mesh(new THREE.BoxGeometry(1,2,1),new THREE.MeshStandardMaterial());
 bunny.position.set(5,-1,2);
 object.add(bunny);
 fitImportedCharacter(object,2.55);
 const bounds=new THREE.Box3().setFromObject(object);
 assert.ok(Math.abs(bounds.min.y)<0.0001);
 assert.ok(Math.abs(bounds.max.y-2.55)<0.0001);
 assert.ok(Math.abs(bounds.getCenter(new THREE.Vector3()).x)<0.0001);
 assert.ok(Math.abs(bounds.getCenter(new THREE.Vector3()).z)<0.0001);
 bunny.geometry.dispose();bunny.material.dispose();
});
test('empty GLB meshes are rejected without invalid scaling',()=>{
 assert.throws(()=>fitImportedCharacter(new THREE.Group()),/usable vertical bounds/);
});
