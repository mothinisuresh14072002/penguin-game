import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { fitImportedCharacter,animalAssetUrl,CHARACTER_ASSETS,hasPaintedAppearance,selectAnimalClips } from '../src/modelAssets.js';

test('all seven heroes accept optional textured GLB character assets',()=>{
 const animals=['bunny','unicorn','horse','cat','dog','penguin','cow'];
 assert.deepEqual(Object.keys(CHARACTER_ASSETS),animals);
 for(const id of animals){
  assert.equal(CHARACTER_ASSETS[id],`models/${id}.glb`);
  assert.ok(animalAssetUrl(id).endsWith(`models/${id}.glb`));
 }
 assert.equal(animalAssetUrl('dragon'),null);
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

test('an untextured white Meshy shape never hides the coloured playable bunny',()=>{
 const group=new THREE.Group();
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshStandardMaterial({color:0xffffff}));
 group.add(mesh);
 assert.equal(hasPaintedAppearance(group),false);
 const nose=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshStandardMaterial({color:0xf6aac8}));
 const eye=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshStandardMaterial({color:0x1b1d29}));
 group.add(nose,eye);
 assert.equal(hasPaintedAppearance(group),true);
 for(const item of [mesh,nose,eye]){item.geometry.dispose();item.material.dispose();}
});

test('rigged characters select named run, idle and jump clips',()=>{
 const idle={name:'Idle_Breath'},walk={name:'Walk'},run={name:'Run_Cycle'},jump={name:'Jump'};
 const found=selectAnimalClips([idle,walk,run,jump]);
 assert.equal(found.run,run);
 assert.equal(found.idle,idle);
 assert.equal(found.jump,jump);
 assert.equal(selectAnimalClips([idle]).run,idle);
 assert.equal(selectAnimalClips([]).run,null);
});
