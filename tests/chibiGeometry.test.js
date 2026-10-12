import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createSoftEarGeometry,createRoundedTriangleGeometry,createHairLockGeometry}
 from '../src/chibiGeometry.js';
import {createAnimal,animateAnimal} from '../src/animalArt.js';

const bounds=g=>new THREE.Box3().setFromBufferAttribute(g.getAttribute('position'));
function disposeActor(actor){
 const materials=new Set(),geometries=new Set();
 actor.group.traverse(o=>{
  if(!o.isMesh)return;
  geometries.add(o.geometry);
  for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);
 });
 for(const g of geometries)g.dispose();
 for(const m of materials)m.dispose();
}
test('a tapered bunny ear has one continuous rounded shape with a slender tip',()=>{
 const g=createSoftEarGeometry({height:1.1,width:.3,depth:.12});
 const box=bounds(g),size=box.getSize(new THREE.Vector3());
 assert.ok(size.y>size.x*2.2,'bunny ear must be taller than it is wide');
 assert.ok(size.z<size.x,'ear should not look like a fat sphere');
 assert.ok(g.attributes.normal.count>0);
 g.dispose();
});
test('cat and pony ears have softly rounded triangular silhouettes',()=>{
 const g=createRoundedTriangleGeometry({width:.38,height:.51,depth:.13});
 const box=bounds(g),size=box.getSize(new THREE.Vector3());
 assert.ok(size.y>.45);
 assert.ok(size.x>.31);
 g.dispose();
 const lock=createHairLockGeometry();
 assert.ok(bounds(lock).getSize(new THREE.Vector3()).y>.5);
 lock.dispose();
});
test('Bunny has flat pink sculpted ears, and Dog has one droopy ear per side',()=>{
 const bunny=createAnimal('bunny'),dog=createAnimal('dog');
 const bunnyOuter=[],dogOuter=[];
 bunny.group.traverse(o=>{if(o.name==='bunny-sculpted-ear')bunnyOuter.push(o)});
 dog.group.traverse(o=>{if(o.name==='dog-left-floppy-ear'||o.name==='dog-right-floppy-ear')
   dogOuter.push(o)});
 assert.equal(bunnyOuter.length,2);
 assert.equal(bunnyOuter[0].geometry.type,'ExtrudeGeometry');
 assert.equal(bunnyOuter[1].geometry.type,'ExtrudeGeometry');
 assert.equal(dogOuter.length,2);
 for(const e of dogOuter)assert.equal(e.children[0].geometry.type,'ExtrudeGeometry');
 animateAnimal(dog,.23,true,false);
 assert.notEqual(dog.ears[0].rotation.z,0);
 disposeActor(bunny);disposeActor(dog);
});
test('Coco kitten has continuous tapered curling tail distinct from Puppy',()=>{
 const cat=createAnimal('cat');
 const dog=createAnimal('dog');
 const tube=cat.group.getObjectByName('cat-curved-tail');
 assert.ok(tube);
 assert.equal(tube.geometry.type,'TubeGeometry');
 assert.ok(cat.group.getObjectByName('cat-tail-tip'));
 assert.equal(dog.group.getObjectByName('cat-curved-tail'),undefined);
 animateAnimal(cat,.3,true,false);
 assert.notEqual(cat.catTail.rotation.z,0);
 disposeActor(cat);disposeActor(dog);
});
