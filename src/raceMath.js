export const FINISH_DISTANCE = 1000;
export const LANE_POSITIONS = [-2.55, 0, 2.55];
export const clampLane = lane => Math.min(2, Math.max(0, lane));
export const raceSpeed = distance => Math.min(70, 22 + Math.max(0, distance) * 0.065);
export const spawnSpacing = speed => Math.max(29, speed * 0.98);
export const trackLoop = (index, step, distance, count) => {
  const period = step * count;
  return 14 - (((index * step - distance) % period + period) % period);
};
export const rowRandom = (index, salt = 0) => {
  const value = Math.sin((index + 1) * 127.1 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};
export const rowPattern = (index, distance) => {
  const first = Math.floor(rowRandom(index, 1) * 3);
  const second = (first + 1 + Math.floor(rowRandom(index, 2) * 2)) % 3;
  const double = distance > 170 && rowRandom(index, 3) < Math.min(0.62, 0.17 + distance / 1500);
  const blocked = double ? [first, second] : [first];
  const safe = [0, 1, 2].filter(lane => !blocked.includes(lane));
  return { blocked, safe };
};
export const pickupTouch = (pickupX, pickupZ, pickupY, playerX, playerZ, playerY) =>
  Math.abs(pickupX - playerX) < 0.48 &&
  Math.abs(pickupZ - playerZ) < 0.85 &&
  Math.abs(pickupY - (playerY + 1.12)) < 0.83;
