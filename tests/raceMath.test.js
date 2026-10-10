import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FINISH_DISTANCE, clampLane, raceSpeed, spawnSpacing, trackLoop, rowPattern, pickupTouch, crossedDistance } from '../src/raceMath.js';

test('race accelerates and stops at a safe maximum', () => {
  assert.equal(raceSpeed(0), 22);
  assert.ok(raceSpeed(300) > raceSpeed(100));
  assert.equal(raceSpeed(100000), 70);
  assert.equal(FINISH_DISTANCE, 1000);
});
test('spawn spacing scales with higher speed', () => {
  assert.equal(spawnSpacing(22), 29);
  assert.ok(spawnSpacing(70) > spawnSpacing(30));
});
test('three lanes are clamped', () => {
  assert.equal(clampLane(-4), 0);
  assert.equal(clampLane(8), 2);
});
test('all generated obstacle rows keep at least one safe lane', () => {
  for (let i = 0; i < 2000; i++) {
    const row = rowPattern(i, i * 16);
    assert.ok(row.safe.length >= 1);
    assert.ok(row.blocked.length <= 2);
    for (const lane of row.safe) assert.ok(!row.blocked.includes(lane));
  }
});
test('pickups require overlapping lane, distance and player height', () => {
  assert.ok(pickupTouch(0, 2, 1.12, 0, 2, 0));
  assert.equal(pickupTouch(2.55, 2, 1.12, 0, 2, 0), false);
  assert.equal(pickupTouch(0, 5, 1.12, 0, 2, 0), false);
  assert.equal(pickupTouch(0, 2, 1.12, 0, 2, 4), false);
});
test('track elements loop without gaps in the cycle', () => {
  for (let d = 0; d < 1000; d += 23) {
    for (let i = 0; i < 24; i++) {
      const z = trackLoop(i, 8, d, 24);
      assert.ok(z <= 14 && z > 14 - 24 * 8);
    }
  }
});

test('fast movement cannot pass through objects between frames', () => {
 assert.ok(crossedDistance(10, 13.3, 11.8));
 assert.ok(crossedDistance(20, 23.9, 23.7));
 assert.equal(crossedDistance(10, 12, 18), false);
});
