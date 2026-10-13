import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAnimal} from '../src/animalArt.js';
import {CUTE_FACE_STYLES,FACE_EYE_STYLE,getCuteFaceStyle,createCuteFaceTexture} from '../src/cuteFace.js';

const ids=['bunny','unicorn','horse','cat','dog','penguin','cow'];

test('Seven chibi animals use one coordinated eye, highlight and blush design',()=>{
 assert.deepEqual(Object.keys(CUTE_FACE_STYLES),ids);
 assert.equal(FACE_EYE_STYLE,'soft-oval-catchlight-v1');
 for(const id of ids){
  const face=getCuteFaceStyle(id);
  assert.ok(Number.isInteger(face.coat));
  assert.ok(Number.isInteger(face.iris));
  assert.ok(Number.isInteger(face.blush));
  assert.ok(Number.isInteger(face.nose));
  assert.equal(createCuteFaceTexture(id),null,'Node has no browser canvas');
 }
});

test('Facial features are applied to the smooth head rather than floating eyeball spheres',()=>{
 for(const id of ids){
  const actor=createAnimal(id);
  const head=actor.group.getObjectByName(id+'-distinct-head');
  assert.ok(head);
  assert.equal(head.userData.cuteFace.eyeStyle,FACE_EYE_STYLE);
  assert.equal(head.userData.cuteFace.iris,getCuteFaceStyle(id).iris);
  // The front face consists of a single smooth head and optional tiny
  // silhouette features like Penguin beak and Cat whiskers.
  const forbidden=[];
  actor.face.traverse(o=>{
   if(/eyeball|pupil|raised-cheek|face-nose/.test(o.name))forbidden.push(o.name);
  });
  assert.deepEqual(forbidden,[]);
  if(id==='penguin')assert.ok(actor.group.getObjectByName('penguin-soft-beak'));
  const geos=new Set(),mats=new Set();
  actor.group.traverse(o=>{if(o.isMesh){geos.add(o.geometry);mats.add(o.material)}});
  for(const g of geos)g.dispose();
  for(const m of mats)m.dispose();
 }
});
test('Cat keeps mint-green irises; rest share chocolate eye style and each coat remains distinct',()=>{
 assert.equal(getCuteFaceStyle('cat').iris,0x54b88e);
 assert.equal(new Set(ids.map(id=>getCuteFaceStyle(id).coat)).size,7);
 assert.equal(new Set(ids.filter(id=>id!=='cat').map(id=>getCuteFaceStyle(id).iris)).size,1);
});
