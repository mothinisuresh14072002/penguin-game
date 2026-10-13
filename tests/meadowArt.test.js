import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
 createMeadowDetails,MEADOW_STRIPS,MEADOW_STRIP_LENGTH,FLOWERS_PER_STRIP
} from '../src/meadowArt.js';
import {createAnimal,animateAnimal} from '../src/animalArt.js';

test('Bella Bunny has soft sculpted ears and a small pastel floral accent',()=>{
 const bunny=createAnimal('bunny');
 assert.ok(bunny.group.getObjectByName('bunny-dress-back'));
 assert.ok(bunny.group.getObjectByName('bunny-dress-flower'));
 assert.equal(bunny.ears.length,2);
 const colors=new Set(),mats=new Set(),geometries=new Set();
 bunny.group.traverse(o=>{
  if(!o.isMesh)return;
  colors.add(o.material.color?.getHexString());
  mats.add(o.material);
  geometries.add(o.geometry);
 });
 assert.ok(colors.size>=5,'Bunny retains gentle complementary colours without piled-on face meshes');
 assert.equal(bunny.group.getObjectByName('bunny-distinct-head').userData.cuteFace.eyeStyle,'soft-oval-catchlight-v1');
 assert.ok([...mats].some(m=>m.isMeshPhysicalMaterial),'Fur should use a soft PBR sheen');
 animateAnimal(bunny,.21,true,false);
 assert.ok(Math.abs(bunny.ears[0].rotation.z)>0);
 for(const m of mats)m.dispose();
 for(const g of geometries)g.dispose();
});
test('flower meadow uses a bounded number of instanced 3D meshes',()=>{
 const scene=new THREE.Scene();
 const field=createMeadowDetails(scene);
 assert.equal(field.strips.length,MEADOW_STRIPS);
 assert.ok(scene.children.includes(field.root));
 let instanced=0,drawCalls=0,instances=0;
 field.root.traverse(o=>{
  if(o.isInstancedMesh){
   instanced++;
   drawCalls++;
   instances+=o.count;
  }
 });
 assert.equal(instanced,MEADOW_STRIPS*8); // Three petal colours + centers/stalks/grass/leaves/stones.
 assert.ok(instances>FLOWERS_PER_STRIP*MEADOW_STRIPS*8);
 assert.ok(drawCalls<=40);
 const before=field.strips.map(t=>t.position.z);
 field.update(MEADOW_STRIPS*MEADOW_STRIP_LENGTH+11);
 assert.ok(field.strips.some((t,i)=>t.position.z!==before[i]));
 for(let distance=0;distance<3500;distance+=217){
  field.update(distance);
  assert.ok(field.strips.every(t=>Number.isFinite(t.position.z)));
 }
 field.dispose();
 assert.ok(!scene.children.includes(field.root));
});
