import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createAnimal, animateAnimal} from '../src/animalArt.js';
import {populateHabitat} from '../src/worldArt.js';

const ids=['bunny','unicorn','horse','cat','dog','penguin','cow'];
const habitats=['flower','star','hay','house','tree','ice','barn'];
test('every playable animal renders a distinct, articulated 3D character',()=>{
 const counts=new Map();
 for(const id of ids){
  const actor=createAnimal(id);
  let meshes=0;
  actor.group.traverse(item=>{if(item.isMesh)meshes++});
  assert.ok(meshes>=25,id+' needs expressive geometry');
  assert.equal(actor.feet.length,2,id+' should have two animated legs');
  assert.ok(actor.pivotL && actor.pivotR && actor.face);
  animateAnimal(actor,0.12,true,false);
  assert.notEqual(actor.pivotL.rotation.x,0);
  counts.set(id,meshes);
  const geos=new Set(),mats=new Set();
  actor.group.traverse(o=>{if(o.isMesh){geos.add(o.geometry);mats.add(o.material)}});
  for(const g of geos)g.dispose();
  for(const m of mats)m.dispose();
 }
 assert.equal(counts.size,7);
});

test('all seven natural habitats create actual Three.js meshes',()=>{
 for(const type of habitats){
  const parent=new THREE.Group();
  populateHabitat(parent,type,0,(target,geometry,color,x,y,z,sx,sy,sz)=>{
   const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color}));
   mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);target.add(mesh);
   return mesh;
  });
  let count=0;
  const geometry=new Set(),materials=new Set();
  parent.traverse(o=>{
   if(o.isMesh){count++;geometry.add(o.geometry);materials.add(o.material)}
  });
  assert.ok(count>=5,type+' should contain 3D scenery objects');
  for(const g of geometry)g.dispose();
  for(const m of materials)m.dispose();
 }
});
