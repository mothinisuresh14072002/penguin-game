import * as THREE from 'three';

// Optional "bending horizon" used by endless runners: geometry drops away
// with distance from the camera so the road curls over the horizon like the
// reference art. Enabled with ?curve=1 (default off until checked on device).
// Implemented by patching the vertex stage of built-in lit/basic materials;
// shadow depth materials are left untouched.
export const curveUniforms = {
  uCurveStrength: { value: 0.0009 },
  uCurveStart: { value: 8 },
  uCurveMax: { value: 70 }
};

const MARKER = '#include <project_vertex>';
const DECL = 'uniform float uCurveStrength;\nuniform float uCurveStart;\nuniform float uCurveMax;\n';

export function applyCurveToShader(shader) {
  if (!shader || typeof shader.vertexShader !== 'string') return false;
  if (!shader.vertexShader.includes(MARKER)) return false;
  if (shader.vertexShader.includes('uCurveStrength')) return false;
  Object.assign(shader.uniforms, curveUniforms);
  shader.vertexShader = DECL + shader.vertexShader.replace(
    MARKER,
    MARKER + `
  {
    float curveZ = clamp(-mvPosition.z - uCurveStart, 0.0, uCurveMax);
    mvPosition.y -= curveZ * curveZ * uCurveStrength;
    gl_Position = projectionMatrix * mvPosition;
  }`
  );
  return true;
}

export function curveRequested(search = typeof location !== 'undefined' ? location.search : '') {
  return new URLSearchParams(search).get('curve') === '1';
}

let installed = false;
export function installCurvedWorld({ strength } = {}) {
  if (typeof strength === 'number') curveUniforms.uCurveStrength.value = strength;
  if (installed) return false;
  installed = true;
  THREE.Material.prototype.onBeforeCompile = function (shader) {
    if (this.isMeshDepthMaterial || this.isMeshDistanceMaterial) return;
    applyCurveToShader(shader);
  };
  return true;
}
