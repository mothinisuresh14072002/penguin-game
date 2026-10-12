import * as THREE from 'three';

// Lightweight procedural 3D horizon for both the solo runner and multiplayer.
// The sky is a spherical shader mesh, NOT a flat image or CSS background.
// Only the camera and uniforms move each frame; geometry is reused.
export const HORIZON_STYLES=Object.freeze({
  meadow:{mountain:0x78b599,high:0xb7e0b4,shape:'hills',sun:0xffe6a6},
  rainbow:{mountain:0xa79bd4,high:0xe0c5f3,shape:'islands',sun:0xffdef5},
  grassland:{mountain:0x9bbb83,high:0xdbe7a7,shape:'hills',sun:0xffe5a5},
  city:{mountain:0x8f96bc,high:0xd9bad6,shape:'buildings',sun:0xffd5a9},
  park:{mountain:0x74b78d,high:0xb1ddb3,shape:'hills',sun:0xffe6b0},
  arctic:{mountain:0x69b8d3,high:0xd2f5fb,shape:'peaks',sun:0xeafaff},
  farm:{mountain:0x8fb47e,high:0xc8dba3,shape:'hills',sun:0xffdfae}
});
const getStyle=id=>HORIZON_STYLES[id]||HORIZON_STYLES.meadow;
export function create3DBackdrop(scene,biome='meadow'){
 const uniforms={
  uZenith:{value:new THREE.Color(0x84bce9)},
  uHorizon:{value:new THREE.Color(0xd4edfc)},
  uGroundGlow:{value:new THREE.Color(0xf5efde)},
  uSunColor:{value:new THREE.Color(0xffe3aa)},
  uTime:{value:0}
 };
 const skyMaterial=new THREE.ShaderMaterial({
  uniforms,side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,
  vertexShader:`
    varying vec3 vDirection;
    void main(){
      vDirection=normalize(position);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }`,
  fragmentShader:`
    varying vec3 vDirection;
    uniform vec3 uZenith,uHorizon,uGroundGlow,uSunColor;
    uniform float uTime;
    void main(){
      vec3 dir=normalize(vDirection);
      float h=clamp(dir.y*.5+.5,0.0,1.0);
      vec3 col=mix(uGroundGlow,uHorizon,smoothstep(.09,.49,h));
      col=mix(col,uZenith,smoothstep(.47,.98,h));
      vec3 sunDir=normalize(vec3(.33,.28,-.89));
      float halo=pow(max(dot(dir,sunDir),0.0),12.0)*.13;
      float disc=pow(max(dot(dir,sunDir),0.0),380.0)*.70;
      col+=uSunColor*(halo+disc);
      gl_FragColor=vec4(col,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`
 });
 const skyGeometry=new THREE.SphereGeometry(230,32,16);
 const sky=new THREE.Mesh(skyGeometry,skyMaterial);
 sky.name='3d-sky-dome';
 sky.renderOrder=-100;
 sky.frustumCulled=false;
 scene.add(sky);

 const horizon=new THREE.Group();horizon.name='biome-3d-horizon';
 scene.add(horizon);
 const hillGeometry=new THREE.SphereGeometry(1,14,9);
 const peakGeometry=new THREE.ConeGeometry(1,1,7);
 const houseGeometry=new THREE.BoxGeometry(1,1,1);
 const hillMaterials=[
  new THREE.MeshLambertMaterial({color:0x78b599,depthWrite:true}),
  new THREE.MeshLambertMaterial({color:0xb7e0b4,depthWrite:true})
 ];
 const pieces=[];
 for(let i=0;i<16;i++){
  const level=i%2;
  const mesh=new THREE.Mesh(hillGeometry,hillMaterials[level]);
  mesh.castShadow=false;mesh.receiveShadow=false;
  mesh.userData.ridgeIndex=i;
  horizon.add(mesh);pieces.push(mesh);
 }
 function setBiome(id,skyColor=0x9cdcf9){
  const preset=getStyle(id);
  const base=new THREE.Color(skyColor);
  uniforms.uZenith.value.copy(base).lerp(new THREE.Color(0x4769b5),.22);
  uniforms.uHorizon.value.copy(base).lerp(new THREE.Color(0xfaf0dc),.40);
  uniforms.uGroundGlow.value.copy(base).lerp(new THREE.Color(0xffffff),.68);
  uniforms.uSunColor.value.setHex(preset.sun);
  hillMaterials[0].color.setHex(preset.mountain);
  hillMaterials[1].color.setHex(preset.high);
  for(let i=0;i<pieces.length;i++){
   const mesh=pieces[i];
   const front=i%2===0;
   const x=(i%8-3.5)*17+(front?-3:6);
   const z=(front?-104:-148)-(i%3)*8;
   const tall=13+((i*17)%7)*2.4;
   mesh.position.set(x,0,z);
   mesh.rotation.set(0,0,0);
   if(preset.shape==='peaks'){
    mesh.geometry=peakGeometry;
    mesh.scale.set(8,tall,8);
    mesh.position.y=tall*.45-3;
   }else if(preset.shape==='buildings'){
    mesh.geometry=houseGeometry;
    mesh.scale.set(11,tall*.72,9);
    mesh.position.y=tall*.32-2;
   }else if(preset.shape==='islands'){
    mesh.geometry=hillGeometry;
    mesh.scale.set(11,3.2,10);
    mesh.position.y=4+(i%4)*2;
   }else{
    mesh.geometry=hillGeometry;
    mesh.scale.set(13,tall*.54,13);
    mesh.position.y=-6+((i%3)*1.4);
   }
  }
 }
 function update(time,camera){
  sky.position.copy(camera.position);
  uniforms.uTime.value=time;
 }
 function dispose(){
  scene.remove(sky,horizon);
  skyGeometry.dispose();skyMaterial.dispose();
  hillGeometry.dispose();peakGeometry.dispose();houseGeometry.dispose();
  for(const m of hillMaterials)m.dispose();
 }
 setBiome(biome);
 return {sky,horizon,setBiome,update,dispose};
}
