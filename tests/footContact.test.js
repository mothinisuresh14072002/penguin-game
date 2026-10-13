import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createAnimal,animateAnimal,alignAnimalFeetToRoad} from '../src/animalArt.js';

for(const id of ['bunny','unicorn','horse','cat','dog','penguin','cow']){
 test(id+' keeps at least one foot in contact with road when running and jumping',()=>{
  const actor=createAnimal(id);
  for(const time of [0,.13,.37,.81]){
   animateAnimal(actor,time,true,false);
   actor.group.scale.set(1.03,1.03,1.03);
   actor.group.position.y=0;
   alignAnimalFeetToRoad(actor,.29,0);
   const ground=Math.min(...actor.feet.map(f=>new THREE.Box3().setFromObject(f).min.y));
   assert.ok(Math.abs(ground-.29)<1e-5, 'foot on road at '+time);
  }
  actor.group.position.y=1.2;
  alignAnimalFeetToRoad(actor,.29,1.2);
  const airborne=Math.min(...actor.feet.map(f=>new THREE.Box3().setFromObject(f).min.y));
  assert.ok(Math.abs(airborne-1.49)<1e-5,'jump remains above road');
 });
}
