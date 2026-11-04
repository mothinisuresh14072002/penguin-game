import * as THREE from 'three';

// Stylized, fully 3D biome scenery inspired by Wobnimo's cute aesthetic.
// All props are genuine Three.js geometry with rounded, soft kawaii forms.
// All decorations share just five source geometries to keep draw-calls minimal.
const ball=new THREE.SphereGeometry(1,14,10);
const box=new THREE.BoxGeometry(1,1,1);
const cone=new THREE.ConeGeometry(1,1,10);
const cylinder=new THREE.CylinderGeometry(1,1,1,10);
const torus=new THREE.TorusGeometry(1,.14,8,28,Math.PI*2);
export const WORLD_GEOMETRIES = new Set([ball,box,cone,cylinder,torus]);

export function populateHabitat(parent, type, index, addMesh) {
  const add=(geometry,color,x,y,z,sx,sy,sz)=>addMesh(parent,geometry,color,x,y,z,sx,sy,sz);
  const orb=(c,x,y,z,sx,sy,sz)=>add(ball,c,x,y,z,sx,sy,sz);
  const brick=(c,x,y,z,sx,sy,sz)=>add(box,c,x,y,z,sx,sy,sz);
  const spike=(c,x,y,z,r,height)=>add(cone,c,x,y,z,r,height,r);
  const trunk=(x=0,y=.85,z=0,h=1.7)=>add(cylinder,0x8b5e3c,x,y,z,.20,h,.20);
  const leaf=(x,y,z,sx,sy,sz,c=0x65c48b)=>orb(c,x,y,z,sx,sy,sz);
  
  const shrub=(x,y,z)=>{
    leaf(x,y+.30,z,.60,.48,.50,0x5ebf82);
    leaf(x+.34,y+.40,z-.08,.44,.38,.44,0x78d492);
    leaf(x-.30,y+.30,z+.12,.40,.36,.44,0x88e09f);
    // Tiny berry dots on shrub
    orb(0xff6b8b,x+.22,y+.48,z+.28,.07,.07,.07);
    orb(0xffc2d3,x-.24,y+.42,z+.30,.06,.06,.06);
  };

  function flower(x,z,color,scale=1){
    add(cylinder,0x59a768,x,.38*scale,z,.048,.72*scale,.048);
    for(let i=0;i<5;i++){
      const a=Math.PI*2*i/5;
      orb(color,x+Math.sin(a)*.22*scale,(.88+Math.cos(a)*.22)*scale,z,.16*scale,.16*scale,.09*scale);
    }
    // Cheerful yellow face center
    orb(0xffd868,x,.88*scale,z+.09,.13*scale,.13*scale,.08*scale);
  }

  // Wobnimo signature fluffy marshmallow cloud-tree
  const grove=(c=0x68ce90,scale=1)=>{
    trunk(0,.97*scale,0,1.94*scale);
    // Soft puffy cloud crown
    leaf(0,2.15*scale,0,.92*scale,.96*scale,.88*scale,c);
    leaf(-.52,1.98*scale,.06,.68*scale,.65*scale,.62*scale,c);
    leaf(.54,2.08*scale,-.06,.72*scale,.68*scale,.66*scale,0x8ae09f);
    leaf(0,2.78*scale,0,.64*scale,.56*scale,.62*scale,0x9df0b2);
    // Little blossom fruit dots
    orb(0xff8fa8,-.22*scale,2.35*scale,.72*scale,.11*scale,.11*scale,.11*scale);
    orb(0xff8fa8,.32*scale,2.50*scale,.62*scale,.10*scale,.10*scale,.10*scale);
  };

  function fence(){
    for(const x of [-1.15,1.15])brick(0xfdf1d6,x,.65,0,.20,1.33,.22);
    for(const y of [.48,.98])brick(0xf5dcab,0,y,0,2.5,.14,.16);
  }

  const seed=index%5;
  if(type==='flower'||type==='flowers'){
    if(seed===0||seed===3){
      grove(0x75d48c,.88);
      flower(-1.1,.35,0xff8fb1,1.1);
      flower(1.1,.3,0xffd479,1.1);
      shrub(.6,.03,-.9);
    }else{
      shrub(-.65,0,0);shrub(.65,0,-.3);
      flower(-.75,.52,0xf89dc8,1.4);
      flower(.68,.2,0xffdf88,1.2);
      flower(.04,-.7,0xffffff,.9);
      if(seed===2){
        // Cute spotted red toadstool
        add(cylinder,0xfff6eb,1.05,.35,.6,.14,.55,.14);
        orb(0xff4d6d,1.05,.72,.6,.42,.26,.40);
        // White polka-dots
        orb(0xffffff,1.05,.86,.74,.09,.07,.07);
        orb(0xffffff,1.24,.74,.72,.08,.07,.07);
        orb(0xffffff,.88,.75,.70,.08,.07,.07);
      }
    }
  }else if(type==='star'||type==='crystals'){
    if(seed===0||seed===4){
      // Rainbow arch with soft fluffy clouds
      add(torus,0xffc6e2,0,.95,.4,2.5,2.1,1);
      for(let j=0;j<4;j++){
        add(torus,[0x8adbf7,0xfaceff,0xffefb7,0xbbf5d9][j],0,.95,.4,.1+(4-j)*.56,.1+(4-j)*.56,1);
      }
      for(const side of [-1,1]){
        orb(0xffffff,side*1.9,1.25,.6,.85,.40,.65);
        orb(0xede2ff,side*2.2,1.5,.5,.70,.36,.60);
      }
    }else{
      // Glowing candy crystals with star gems
      spike(0xcca3ff,-.55,1.15,0,.52,2.35);
      spike(0x76eee0,.38,.80,.28,.36,1.60);
      spike(0xffbce3,.92,.60,-.2,.30,1.20);
      orb(0xffffff,0,.24,-.5,1.20,.28,.92);
      orb(0xfff1cf,-.55,2.38,0,.18,.18,.18);
      orb(0xffe088,.38,1.65,.28,.14,.14,.14);
    }
  }else if(type==='hay'){
    if(seed%2){
      fence();
      orb(0xa4d872,0,.22,-.9,1.75,.32,.85);
      flower(.98,.7,0xffdf96,1.0);
    }else{
      for(let j=0;j<3;j++){
        const x=(j-1)*.74,y=.48+(j===1?.60:0),z=j%2?.22:0;
        const roll=add(cylinder,0xf8d474,x,y,z,.50,.78,.50);
        roll.rotation.z=Math.PI/2;
        orb(0xe8b355,x+.40,y,z,.12,.34,.33);
      }
      fence();
    }
    if(seed===4){
      brick(0xf0f2dc,-1.45,1.8,-.8,.20,3.6,.20);
      for(let i=0;i<4;i++){
        const blade=brick(0xffffff,-1.45,3.3,-.8,.24,1.15,.14);
        blade.rotation.z=i*Math.PI/2;blade.position.y+=Math.cos(i*Math.PI/2)*.55;blade.position.x+=Math.sin(i*Math.PI/2)*.55;
      }
    }
  }else if(type==='house'||type==='town'){
    if(seed===2){
      // Cute village grove
      grove(0x78cf88,1.0);
      flower(-.85,.64,0xffb892,1.2);
      shrub(.88,0,0);
    }else if(seed%2===0){
      // Wobnimo Cute Mushroom Cottage!
      // Round cream cottage base
      orb(0xfffaea,0,1.1,0,1.35,1.2,1.30);
      // Big domed red/pink mushroom cap roof with white polka dots
      const roofColor=[0xff4d6d,0xae79f7,0xff708f][index%3];
      orb(roofColor,0,2.35,0,1.75,1.05,1.70);
      // Polka dots
      orb(0xffffff,0,2.95,.65,.19,.17,.12);
      orb(0xffffff,-.95,2.45,.75,.18,.18,.12);
      orb(0xffffff,.95,2.45,.75,.18,.18,.12);
      orb(0xffffff,0,3.35,0,.19,.14,.19);
      // Cute arched wooden door
      brick(0x9a684b,0,.58,1.26,.52,.92,.14);
      orb(0xffd568,.18,.58,1.35,.07,.07,.07);
      // Round glowing window
      orb(0xfff2a8,-.65,1.25,1.15,.25,.25,.12);
      // Chimney with marshmallow cloud smoke
      add(cylinder,0xcc8877,.72,2.5,-.2,.16,.75,.16);
      orb(0xffffff,.72,3.0,-.2,.22,.18,.22);
      orb(0xffffff,.85,3.35,-.2,.28,.24,.28);
      // Shrub and flowers around house
      shrub(-1.4,0,.3);flower(1.3,.8,0xff8fb1,1.1);
    }else{
      // Cute pastel fairy cottage
      const wall=[0xffd5b3,0xf8abb5,0xffe8ab,0xc3d1fb][index%4];
      brick(wall,0,1.34,0,2.35,2.5,1.95);
      const roof=spike([0xa88ed4,0xf8a999,0x9ec7de][index%3],0,3.15,0,1.85,1.45);roof.rotation.y=Math.PI/4;
      brick(0xffffff,-.58,1.7,1.012,.54,.62,.08);brick(0x9ee7fb,-.58,1.7,1.065,.34,.43,.04);
      brick(0xffffff,.59,1.7,1.012,.54,.62,.08);brick(0xabeefe,.59,1.7,1.065,.34,.43,.04);
      brick(0x92736b,0,.52,1.02,.54,.98,.12);
      orb(0xffd568,.20,.52,1.10,.07,.07,.07);
      for(const side of [-1,1]){orb(0x62be8c,side*1.2,.37,.7,.44,.40,.44);flower(side*1.35,1.15,0xf7a4c1,.85)}
    }
  }else if(type==='tree'||type==='trees'){
    if(seed===0){
      // Cute water fountain / crystal pond
      orb(0x8fe2ff,0,.10,0,1.52,.08,1.25);
      for(const x of [-1,1]){leaf(x,.38,.2,.48,.50,.52);flower(x,.40,0xffe8a0,.95)}
    }else{
      grove(seed%2?0x76d588:0x5cc283,1+(seed%3)*.15);
      shrub(-1.05,0,.3);
      if(seed===3)for(let j=0;j<5;j++)orb(0xff8da8,-.28+j*.15,2.55-(j%2)*.25,.42,.12,.12,.12);
    }
  }else if(type==='ice'){
    if(seed===0){
      const roof=add(torus,0xaff2ff,0,2.1,0,1.75,1.75,1);
      roof.rotation.z=Math.PI;
      for(const side of [-1,1]){
        spike(0xb5f2fe,side*1.4,1.10,0,.56,2.20);
        orb(0xf4fcff,side*1.85,.30,.4,.68,.34,.60);
      }
    }else{
      // Cute pastel ice peaks with snow scoops
      spike(0x99e5fc,-.48,1.52,0,.56,2.95);
      spike(0xdefcff,.50,1.10,.2,.40,2.15);
      spike(0x85d8f0,.98,.65,-.3,.32,1.35);
      orb(0xffffff,0,.14,-.45,1.55,.32,.90);
    }
  }else if(type==='barn'||type==='farm'){
    if(seed===1){
      fence();shrub(-1.35,0,-.3);
      for(let j=0;j<4;j++){
        brick(0x7bc266,-.5+j*.38,.24,-.7,.20,.48,.25);
        orb(0xffdc72,-.5+j*.38,.54,-.7,.15,.15,.14);
      }
    }else if(seed===3){
      for(const x of [-.84,.84]){
        const hay=add(cylinder,0xf8d682,x,.48,0,.55,.86,.55);
        hay.rotation.z=Math.PI/2;
      }
      fence();
    }else{
      brick(0xd67272,0,1.55,0,2.65,3.0,2.1);
      const roof=spike(0x8c6674,0,3.42,0,1.95,1.58);roof.rotation.y=Math.PI/4;
      brick(0xfaf0e2,0,.76,1.09,1.1,1.5,.10);
      brick(0xffffff,-.85,1.85,1.09,.48,.58,.11);
      brick(0xffffff,.85,1.85,1.09,.48,.58,.11);
      shrub(1.55,0,.4);
    }
  }
  // Soft, rounded terrain mound grounding every prop
  orb(type==='ice'?0xedfaff:type==='star'||type==='crystals'?0xf8efff:0x9ad688,
      0,-.16,0,1.88,.24,1.32);
}
