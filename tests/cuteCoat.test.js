import {test} from 'node:test';
import assert from 'node:assert/strict';
import {COAT_PATTERNS,createCoatTexture} from '../src/cuteCoat.js';
import {createAnimal} from '../src/animalArt.js';
const ids=['bunny','unicorn','horse','cat','dog','penguin','cow'];
test('Seven animal coats have distinct integrated markings on soft body surfaces',()=>{
 assert.deepEqual(Object.keys(COAT_PATTERNS),ids);
 assert.equal(new Set(Object.values(COAT_PATTERNS)).size,ids.length);
 for(const id of ids){
  assert.equal(createCoatTexture(id,0xfffaf5),null,'Node test has no browser canvas');
  const actor=createAnimal(id);
  const torso=actor.group.getObjectByName(id+'-smooth-body');
  assert.ok(torso,'Each animal needs a smooth pear torso');
  assert.equal(torso.geometry.type,'LatheGeometry');
  assert.equal(torso.userData.coatPattern,COAT_PATTERNS[id]);
  const geometries=new Set(),materials=new Set();
  actor.group.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);materials.add(o.material)}});
  for(const g of geometries)g.dispose();
  for(const m of materials)m.dispose();
 }
});
test('Calf spots, tabby stripes and bunny hips are NOT glued-on rear spheres',()=>{
 const cow=createAnimal('cow'),cat=createAnimal('cat'),bunny=createAnimal('bunny');
 assert.ok(!cow.group.getObjectByName('cow-spot-0'));
 assert.ok(!cat.group.getObjectByName('cat-fur-stripe'));
 assert.ok(!bunny.group.getObjectByName('bunny-left-haunch'));
 for(const actor of [cow,cat,bunny]){
  const geometries=new Set(),materials=new Set();
  actor.group.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);materials.add(o.material)}});
  for(const g of geometries)g.dispose();
  for(const m of materials)m.dispose();
 }
});
