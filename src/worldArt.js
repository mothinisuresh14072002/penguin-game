import * as THREE from 'three';

// Stylized, fully 3D biome scenery. Artwork stays in the game world and
// responds to motion and lighting; none of these props are flat image cards.
export function populateHabitat(parent, type, index, addMesh) {
  const ball=new THREE.SphereGeometry(1,12,9);
  const box=new THREE.BoxGeometry(1,1,1);
  const cone=new THREE.ConeGeometry(1,1,8);
  const cylinder=new THREE.CylinderGeometry(1,1,1,9);
  const torus=new THREE.TorusGeometry(1,.12,6,28,Math.PI);
  const add=(geometry,color,x,y,z,sx,sy,sz)=>addMesh(parent,geometry,color,x,y,z,sx,sy,sz);
  const orb=(c,x,y,z,sx,sy,sz)=>add(ball,c,x,y,z,sx,sy,sz);
  const brick=(c,x,y,z,sx,sy,sz)=>add(box,c,x,y,z,sx,sy,sz);
  const spike=(c,x,y,z,r,height)=>add(cone,c,x,y,z,r,height,r);
  const trunk=(x=0,y=.85,z=0,h=1.7)=>add(cylinder,0x956947,x,y,z,.18,h,.18);
  const leaf=(x,y,z,sx,sy,sz,c=0x61b987)=>orb(c,x,y,z,sx,sy,sz);
  const shrub=(x,y,z)=>{
    leaf(x,y+.28,z,.55,.42,.45,0x5dac78);
    leaf(x+.33,y+.37,z-.08,.40,.35,.40,0x70c885);
    leaf(x-.27,y+.28,z+.12,.35,.34,.4,0x77be75);
  };
  function flower(x,z,color,scale=1){
    add(cylinder,0x59a768,x,.37*scale,z,.045,.7*scale,.045);
    for(let i=0;i<5;i++){
      const a=Math.PI*2*i/5;
      orb(color,x+Math.sin(a)*.21*scale,(.86+Math.cos(a)*.20)*scale,z,.145*scale,.15*scale,.09*scale);
    }
    orb(0xffd868,x,.86*scale,z+.10,.12*scale,.12*scale,.08*scale);
  }
  const grove=(c=0x67bc86,scale=1)=>{
    trunk(0,.97*scale,0,1.94*scale);
    leaf(0,2.1*scale,0,.8*scale,.88*scale,.76*scale,c);
    leaf(-.49,1.91*scale,.05,.59*scale,.57*scale,.54*scale,c);
    leaf(.51,2.01*scale,-.05,.62*scale,.6*scale,.59*scale,0x83cf83);
    leaf(0,2.66*scale,0,.55*scale,.49*scale,.55*scale,0x77cb93);
  };
  function fence(){
    for(const x of [-1.1,1.1])brick(0xf7e6bf,x,.65,0,.20,1.33,.22);
    for(const y of [.48,.98])brick(0xeecfa4,0,y,0,2.5,.14,.16);
  }
  const seed=index%5;
  if(type==='flower'||type==='flowers'){
    if(seed===0||seed===3){
      grove(0x79c97e,.82);
      flower(-1.03,.35,0xffb6da);
      flower(1.03,.3,0xffe0a0);
      shrub(.55,.03,-.9);
    }else{
      shrub(-.63,0,0);shrub(.6,0,-.3);
      flower(-.7,.52,0xf3aad7,1.4);
      flower(.63,.2,0xffe6a6,1.1);
      flower(.04,-.7,0xfef9f9,.8);
      if(seed===2){
        brick(0xf5f3e9,1.0,.25,.6,.12,.4,.1);
        orb(0xf7a1bc,1,.52,.6,.31,.20,.30);
        orb(0xffffff,1,.53,.75,.11,.08,.08);
      }
    }
  }else if(type==='star'||type==='crystals'){
    if(seed===0||seed===4){
      add(torus,0xffcae0,0,.95,.4,2.5,2.1,1);
      for(let j=0;j<4;j++){
        add(torus,[0x8adbf7,0xfaceff,0xffefb7,0xc2f5de][j],0,.95,.4,.1+(4-j)*.56,.1+(4-j)*.56,1);
      }
      for(const side of [-1,1]){orb(0xffffff,side*1.9,1.25,.6,.8,.36,.61);orb(0xece3ff,side*2.2,1.5,.5,.64,.32,.56)}
    }else{
      spike(0xd6b2ff,-.55,1.12,0,.48,2.23);
      spike(0x86f1e4,.36,.76,.28,.33,1.52);
      spike(0xffc6e8,.91,.56,-.2,.27,1.11);
      orb(0xffffff,0,.22,-.5,1.13,.26,.87);
      orb(0xffefd1,-.8,2.02,.3,.13,.13,.13);
    }
  }else if(type==='hay'){
    if(seed%2){
      fence();
      orb(0xb0d57a,0,.20,-.9,1.65,.30,.8);
      flower(.94,.7,0xffe3aa,.8);
    }else{
      for(let j=0;j<3;j++){
        const x=(j-1)*.73,y=.47+(j===1?.58:0),z=j%2?.22:0;
        const roll=add(cylinder,0xf5cf73,x,y,z,.48,.75,.48);
        roll.rotation.z=Math.PI/2;
        orb(0xe2ac51,x+.39,y,z,.1,.32,.31);
      }
      fence();
    }
    if(seed===4){
      brick(0xeef0d8,-1.45,1.8,-.8,.18,3.6,.18);
      for(let i=0;i<4;i++){
        const blade=brick(0xffffff,-1.45,3.3,-.8,.22,1.05,.13);
        blade.rotation.z=i*Math.PI/2;blade.position.y+=Math.cos(i*Math.PI/2)*.5;blade.position.x+=Math.sin(i*Math.PI/2)*.5;
      }
    }
  }else if(type==='house'||type==='town'){
    if(seed===2){
      grove(0x79c884,.9);
      flower(-.8,.64,0xffc59e);
      shrub(.84,0,0);
    }else{
      const wall=[0xffcfaa,0xf5a4b0,0xffe4a1,0xbac9fa][index%4];
      brick(wall,0,1.34,0,2.35,2.65,1.95);
      const roof=spike([0x9b80c9,0xf39f8e,0x8db9d3][index%3],0,3.13,0,1.8,1.37);roof.rotation.y=Math.PI/4;
      brick(0xffffff,-.58,1.7,1.012,.52,.6,.08);brick(0xa5e5fb,-.58,1.7,1.065,.32,.41,.04);
      brick(0xffffff,.59,1.7,1.012,.52,.6,.08);brick(0xb8ebff,.59,1.7,1.065,.32,.41,.04);
      brick(0x92736b,0,.48,1.02,.53,.96,.10);
      for(const side of [-1,1]){orb(0x59b482,side*1.15,.37,.7,.42,.39,.42);flower(side*1.3,1.15,0xf39fbd,.62)}
    }
  }else if(type==='tree'||type==='trees'){
    if(seed===0){
      orb(0x93d7f4,0,.08,0,1.42,.05,1.13);
      for(const x of [-1,1]){leaf(x,.35,.2,.45,.47,.50);flower(x,.38,0xffe8a0,.8)}
    }else{
      grove(seed%2?0x7acb8a:0x59b47e,1+(seed%3)*.14);
      shrub(-1.0,0,.3);
      if(seed===3)for(let j=0;j<5;j++)orb(0xf4a06f,-.25+j*.14,2.5-(j%2)*.25,.4,.10,.1,.10);
    }
  }else if(type==='ice'){
    if(seed===0){
      const roof=add(torus,0xa9edff,0,2.06,0,1.66,1.7,1);
      roof.rotation.z=Math.PI;
      for(const side of [-1,1]){
        spike(0xa8eafd,side*1.4,1.05,0,.54,2.10);
        orb(0xf0fbff,side*1.8,.28,.4,.64,.32,.56);
      }
    }else{
      spike(0x91def8,-.45,1.48,0,.54,2.85);
      spike(0xd5f9ff,.48,1.05,.2,.37,2.05);
      spike(0x7dcde8,.95,.62,-.3,.30,1.25);
      orb(0xffffff,0,.12,-.45,1.48,.3,.85);
    }
  }else if(type==='barn'||type==='farm'){
    if(seed===1){
      fence();shrub(-1.3,0,-.3);
      for(let j=0;j<4;j++){
        brick(0x74b75e,-.5+j*.38,.23,-.7,.19,.45,.24);
        orb(0xf1d778,-.5+j*.38,.50,-.7,.13,.13,.12);
      }
    }else if(seed===3){
      for(const x of [-.82,.82]){
        const hay=add(cylinder,0xf1d17c,x,.47,0,.53,.82,.53);
        hay.rotation.z=Math.PI/2;
      }
      fence();
    }else{
      brick(0xcb6867,0,1.55,0,2.65,3.1,2.1);
      const roof=spike(0x7c5d68,0,3.42,0,1.92,1.55);roof.rotation.y=Math.PI/4;
      brick(0xf6e3d0,0,.74,1.09,1.06,1.46,.10);
      brick(0xffffff,-.85,1.82,1.09,.46,.55,.11);
      brick(0xffffff,.85,1.82,1.09,.46,.55,.11);
      shrub(1.53,0,.4);
    }
  }
  // Little terrain mound to visually ground every roadside structure.
  orb(type==='ice'?0xebfcff:type==='star'||type==='crystals'?0xf6e8ff:0x97ce83,
      0,-.16,0,1.8,.23,1.25);
}
