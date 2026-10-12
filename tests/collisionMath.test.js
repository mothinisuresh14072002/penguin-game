import { test } from 'node:test';
import assert from 'node:assert/strict';
import {HAZARD_HITBOXES,sweptAxisInterval,groundContactInterval,sweptHazardContact} from '../src/collisionMath.js';
const base={kind:'rock',previousDistance:10,distance:14,obstacleDistance:12,
 previousX:0,x:0,obstacleX:0,previousY:0,y:0,slideStart:0,slideEnd:0};
const hit=(overrides={})=>sweptHazardContact({...base,...overrides});

test('each obstacle has defined physical dimensions and safe jump height',()=>{
 assert.deepEqual(Object.keys(HAZARD_HITBOXES).sort(),['lion','log','rock','spike']);
 for(const box of Object.values(HAZARD_HITBOXES)){
  assert.ok(box.x>.6&&box.x<1.4);
  assert.ok(box.z>.5);
  assert.ok(box.height>1);
 }
});
test('swept axis intervals identify collision even when endpoints are outside',()=>{
 assert.deepEqual(sweptAxisInterval(0,10,5,.5),[.45,.55]);
 assert.equal(sweptAxisInterval(0,4,8,.5),null);
 assert.deepEqual(sweptAxisInterval(1,1,1,.2),[0,1]);
 assert.equal(sweptAxisInterval(1,1,2,.2),null);
 assert.equal(sweptAxisInterval(NaN,2,1,1),null);
});
test('a fast runner cannot tunnel through a same-lane rock',()=>{
 assert.ok(hit());
 assert.ok(hit({previousDistance:0,distance:45,obstacleDistance:22}));
 assert.equal(hit({previousDistance:0,distance:5,obstacleDistance:22}),null);
});
test('adjacent lanes are safe, but crossing lanes through a hazard is not',()=>{
 assert.equal(hit({previousX:2.6,x:2.6}),null);
 assert.ok(hit({previousX:-2.6,x:2.6,previousDistance:10,distance:14,obstacleDistance:12}));
 assert.equal(hit({previousX:0,x:2.6,previousDistance:10,distance:14,obstacleDistance:13.95}),null);
});
test('jumping clears a low obstacle only when the feet are above it at contact time',()=>{
 assert.equal(hit({previousY:1.6,y:1.6}),null);
 assert.ok(hit({previousY:0,y:2.2,previousDistance:10,distance:14,obstacleDistance:10.2}));
 assert.equal(hit({previousY:0,y:2.2,previousDistance:10,distance:14,obstacleDistance:13.7}),null);
 assert.ok(hit({previousY:2.2,y:0,previousDistance:10,distance:14,obstacleDistance:13.7}));
});
test('slide lets the animal pass under raised logs but not through rocks or spikes',()=>{
 assert.equal(hit({kind:'log',slideStart:.5,slideEnd:.2}),null);
 assert.ok(hit({kind:'log',slideStart:.5,slideEnd:0}));
 assert.ok(hit({kind:'rock',slideStart:.5,slideEnd:.2}));
 assert.ok(hit({kind:'spike',slideStart:.5,slideEnd:.2}));
});
test('crossing forward and sideways at different moments does not create false contact',()=>{
 // The runner reaches x=2.6 much later than it passes the obstacle in z.
 assert.equal(hit({previousX:0,x:2.6,obstacleX:2.6,
  previousDistance:0,distance:10,obstacleDistance:1}),null);
 assert.ok(hit({previousX:0,x:2.6,obstacleX:2.6,
  previousDistance:0,distance:10,obstacleDistance:9}));
});
test('jump ground contact interval is continuous across a frame',()=>{
 assert.deepEqual(groundContactInterval(0,2,1),[0,.5]);
 assert.deepEqual(groundContactInterval(2,0,1),[.5,1]);
 assert.equal(groundContactInterval(2,3,1),null);
});
