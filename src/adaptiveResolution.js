// Keeps frame rate smooth by nudging the render pixel ratio down when frames
// are slow and back up (never above the starting ratio) when there is headroom.
// Pure logic: no THREE/DOM access, so it is unit-testable in Node.
export function createAdaptiveResolution({
  maxRatio = 2,
  minRatio = 0.75,
  step = 0.125,
  slowMs = 21,      // ~47 fps or worse
  fastMs = 15,      // ~66 fps or better
  slowFrames = 45,
  fastFrames = 300,
  smoothing = 0.1
} = {}) {
  let ratio = maxRatio;
  let ema = 16.7;
  let slow = 0;
  let fast = 0;
  return {
    get ratio() { return ratio; },
    get averageMs() { return ema; },
    setMax(value) { maxRatio = value; ratio = Math.min(ratio, maxRatio); },
    // Returns the new ratio when it changed, otherwise null.
    sample(frameMs) {
      // Ignore tab-switch stalls and impossible values.
      if (!Number.isFinite(frameMs) || frameMs <= 0 || frameMs > 250) return null;
      ema += (frameMs - ema) * smoothing;
      slow = ema > slowMs ? slow + 1 : 0;
      fast = ema < fastMs ? fast + 1 : 0;
      if (slow >= slowFrames && ratio > minRatio) {
        ratio = Math.max(minRatio, +(ratio - step).toFixed(3));
        slow = 0; fast = 0;
        return ratio;
      }
      if (fast >= fastFrames && ratio < maxRatio) {
        ratio = Math.min(maxRatio, +(ratio + step).toFixed(3));
        slow = 0; fast = 0;
        return ratio;
      }
      return null;
    }
  };
}
