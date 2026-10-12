import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { create3DBackdrop, HORIZON_STYLES } from '../src/visual3d.js';

test('all seven character habitats have a distinct 3D horizon', () => {
 const names=['meadow','rainbow','grassland','city','park','arctic','farm'];
 for (const name of names) {
  const scene=new THREE.Scene();
  const backdrop=create3DBackdrop(scene,name);
  const meshes=backdrop.horizon.children;
  assert.equal(meshes.length,16,name+' should have a populated 3D horizon');
  assert.ok(backdrop.sky.isMesh);
  assert.equal(backdrop.sky.material.type,'ShaderMaterial');
  assert.ok(HORIZON_STYLES[name]);
  const before=meshes[0].geometry;
  backdrop.setBiome(name,0xabcdef);
  assert.ok(meshes[0].geometry);
  assert.equal(scene.children.includes(backdrop.sky),true);
  assert.equal(before,meshes[0].geometry);
  backdrop.dispose();
  assert.equal(scene.children.includes(backdrop.sky),false);
 }
});
test('a 3D sky follows the active view camera without changing world scenery',()=>{
 const scene=new THREE.Scene();
 const backdrop=create3DBackdrop(scene,'farm');
 const camera=new THREE.PerspectiveCamera();
 camera.position.set(4,8,15);
 backdrop.update(7.5,camera);
 assert.deepEqual(backdrop.sky.position.toArray(),[4,8,15]);
 assert.equal(backdrop.horizon.position.x,0);
 assert.equal(backdrop.sky.material.uniforms.uTime.value,7.5);
 backdrop.dispose();
});
