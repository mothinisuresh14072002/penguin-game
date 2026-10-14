import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAdaptiveResolution} from '../src/adaptiveResolution.js';
import {applyCurveToShader,curveRequested,curveUniforms} from '../src/curvedWorld.js';

test('slow frames lower resolution step by step and never below the floor',()=>{
 const a=createAdaptiveResolution({maxRatio:2,minRatio:1,step:.25});
 const changes=[];
 for(let i=0;i<600;i++){const r=a.sample(33);if(r!==null)changes.push(r)}
 assert.deepEqual(changes,[1.75,1.5,1.25,1]);
 assert.equal(a.ratio,1);
});

test('sustained headroom restores resolution but never exceeds the maximum',()=>{
 const a=createAdaptiveResolution({maxRatio:1.5,minRatio:1,step:.25});
 for(let i=0;i<300;i++)a.sample(40);
 assert.ok(a.ratio<1.5);
 for(let i=0;i<3000;i++)a.sample(8);
 assert.equal(a.ratio,1.5);
});

test('tab-switch stalls and bad numbers do not trigger a downgrade',()=>{
 const a=createAdaptiveResolution();
 for(let i=0;i<200;i++){a.sample(1000);a.sample(NaN);a.sample(-4)}
 assert.equal(a.ratio,2);
});

test('curve patch injects once into a vertex shader and skips others',()=>{
 const shader={uniforms:{},vertexShader:'void main(){\n#include <project_vertex>\n}'};
 assert.equal(applyCurveToShader(shader),true);
 assert.match(shader.vertexShader,/uCurveStrength/);
 assert.ok(shader.uniforms.uCurveStart===curveUniforms.uCurveStart);
 assert.equal(applyCurveToShader(shader),false);
 assert.equal(applyCurveToShader({uniforms:{},vertexShader:'void main(){}'}),false);
 assert.equal(applyCurveToShader(null),false);
});

test('curve is opt-in via query string',()=>{
 assert.equal(curveRequested(''),false);
 assert.equal(curveRequested('?curve=0'),false);
 assert.equal(curveRequested('?quality=hd&curve=1'),true);
});
