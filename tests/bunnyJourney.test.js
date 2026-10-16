import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createMeadowDetails,MEADOW_STRIPS} from '../src/meadowArt.js';
import {BUNNY_ZONES} from '../src/bunnyJourney.js';

test('Bunny Meadow cycles through six different regions with bounded scenery objects',()=>{
 assert.deepEqual(BUNNY_ZONES,['village','flower-garden','carrot-farm','enchanted-forest','bunny-market','rainbow-pond']);
 const scene=new THREE.Scene(),meadow=createMeadowDetails(scene);
 assert.equal(meadow.strips.length,MEADOW_STRIPS);
 const seen=new Set();
 for(let chapter=0;chapter<6;chapter++){
  meadow.update(chapter*132);
  const current=meadow.journey.objects[0];
  seen.add(current.userData.zone);
  assert.ok(current.children.length>0,'Every zone has visible scenery');
  assert.ok(current.children.length<100,'Scenery stays within the per-strip mesh budget');
 }
 assert.equal(seen.size,6);
 meadow.dispose();
 assert.ok(!scene.children.includes(meadow.root));
});
