import * as THREE from 'three';

// Painted into a repeatable CanvasTexture and lit as a real horizontal
// Three.js surface, not a screenshot or a UI overlay. One material per track.
export const ROAD_STYLES=Object.freeze({
 meadow:{base:'#cba96e',light:'#efd38a',line:'#81b853',name:'Daisy meadow dirt'},
 rainbow:{base:'#c78fea',light:'#f5d7ff',line:'#e8a3f7',name:'Shimmering crystal bridge'},
 grassland:{base:'#ce9b59',light:'#f3ce87',line:'#9abb60',name:'Golden prairie earth'},
 city:{base:'#d9a884',light:'#f5d9b4',line:'#b77e78',name:'Old-town cobblestones'},
 park:{base:'#d4c4a0',light:'#f1e5bf',line:'#7cb573',name:'Park stepping-stone path'},
 arctic:{base:'#86d2ed',light:'#e0fbff',line:'#56bce7',name:'Reflective glacier ice'},
 farm:{base:'#d3a15d',light:'#e9ca80',line:'#9a713e',name:'Sunlit farm track'}
});
export function roadStyle(id){return ROAD_STYLES[id]||ROAD_STYLES.meadow;}
const seeded=(n)=>{const v=Math.sin(n*127.1+13.34)*43758.5453;return v-Math.floor(v);};
function draw(ctx,id,size){
 const p=roadStyle(id),w=size;
 ctx.clearRect(0,0,w,w);
 ctx.fillStyle=p.base;ctx.fillRect(0,0,w,w);
 const grain=(x,y,r,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
 if(id==='city'||id==='park'){
  // Individual staggered, bevel-highlighted slabs create an unmistakable
  // old-town or park-path ground, like the user's reference image.
  const rows=id==='city'?11:9,cols=id==='city'?5:4;
  const rh=w/rows,cw=w/cols;
  for(let y=-1;y<=rows;y++)for(let x=-1;x<=cols;x++){
   const stagger=(y%2)*cw*.5;
   const left=x*cw+stagger+2,top=y*rh+2;
   const varied=seeded(x*32+y*19);
   const inset=id==='park'?5:3;
   ctx.fillStyle=id==='city'
      ?['#edc8a1','#f3d5b0','#d7a287','#e8b999'][Math.floor(varied*4)]
      :['#e6d9b9','#f5e7c7','#d0bc99','#dcca9d'][Math.floor(varied*4)];
   ctx.beginPath();
   if(ctx.roundRect)ctx.roundRect(left+inset,top+inset,cw-2*inset,rh-2*inset,id==='park'?9:5);
   else ctx.rect(left+inset,top+inset,cw-2*inset,rh-2*inset);
   ctx.fill();
   ctx.strokeStyle='rgba(255,255,255,0.32)';ctx.lineWidth=2;ctx.stroke();
  }
 }else if(id==='rainbow'){
  const grad=ctx.createLinearGradient(0,0,w,0);
  grad.addColorStop(0,'#daacff');grad.addColorStop(.5,'#facbf4');grad.addColorStop(1,'#9fcaf7');
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,w);
  for(let i=0;i<12;i++){
   const y=i*w/12;ctx.fillStyle=i%2?'rgba(255,255,255,0.27)':'rgba(202,116,250,0.13)';
   ctx.fillRect(0,y,w,3);
  }
  ctx.strokeStyle='rgba(255,255,255,.52)';ctx.lineWidth=6;
  for(const x of [w*.025,w*.975]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,w);ctx.stroke();}
  for(let i=0;i<65;i++){
   const x=seeded(i*11+2)*w,y=seeded(i*9+1)*w;
   ctx.fillStyle='rgba(255,255,255,.75)';
   ctx.fillRect(x,y,3+seeded(i)*4,3+seeded(i+19)*4);
  }
 }else if(id==='arctic'){
  const grad=ctx.createLinearGradient(0,0,w,0);
  grad.addColorStop(0,'#b3eafe');grad.addColorStop(.35,'#75c9ec');
  grad.addColorStop(.64,'#b7f1fd');grad.addColorStop(1,'#73c3e7');
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,w);
  ctx.strokeStyle='rgba(248,255,255,.56)';ctx.lineWidth=3;
  for(let i=0;i<25;i++){
   const x=seeded(i*41)*w,y=seeded(i*31+4)*w;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+26,y-21);ctx.lineTo(x+63,y-16);ctx.stroke();
  }
  ctx.strokeStyle='rgba(238,255,255,.85)';ctx.lineWidth=4;
  for(const x of [w*.04,w*.96]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,w);ctx.stroke();}
 }else{
  // Earth tracks with softened parallel wheel grooves and grains. Green
  // edges create a natural transition to the grassy side of the trail.
  const grad=ctx.createLinearGradient(0,0,w,0);
  grad.addColorStop(0,p.line);grad.addColorStop(.12,p.light);
  grad.addColorStop(.3,p.base);grad.addColorStop(.5,p.light);
  grad.addColorStop(.7,p.base);grad.addColorStop(.88,p.light);grad.addColorStop(1,p.line);
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,w);
  ctx.strokeStyle='rgba(129,89,50,.18)';ctx.lineWidth=10;
  for(const x of [w*.2,w*.8]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,w);ctx.stroke();}
  for(let i=0;i<520;i++){
   const x=seeded(i*17+6)*w,y=seeded(i*43+1)*w;
   grain(x,y,1+seeded(i+11)*2.4,i%3?'rgba(255,246,196,.26)':'rgba(98,69,35,.13)');
  }
 }
 // Soft irregular edge speckles show motion without a strong lane-dividing
 // stripe that would clash with the reference's organic trail composition.
 if(id==='meadow'||id==='park'||id==='farm'||id==='grassland'){
  for(let i=0;i<120;i++){
   const side=i%2===0?1:-1,x=(side===1?0:w)+(side===1?1:-1)*(3+seeded(i*3)*36);
   const y=seeded(i*49+16)*w;
   grain(x,y,1+seeded(i*83)*3,i%4===0?'#f8f5dc':p.line);
  }
 }
}
export function createRoadArtwork(scene,id,{length=260,centerZ=-107,surfaceY=.29,width=9}={}){
 const geometry=new THREE.PlaneGeometry(width,length);
 const texture=new THREE.CanvasTexture(document.createElement('canvas'));
 // Refill texture in setBiome; the material and GPU texture are reused when
 // changing animal, avoiding new WebGL buffers during character selection.
 const canvas=texture.image;
 canvas.width=1024;canvas.height=1024;
 const ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('Road canvas unavailable');
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.repeat.set(1,length/6);
 texture.anisotropy=8;
 const material=new THREE.MeshStandardMaterial({
  map:texture,bumpMap:texture,bumpScale:.045,roughness:.81,metalness:.02,side:THREE.DoubleSide
 });
 const mesh=new THREE.Mesh(geometry,material);
 mesh.name='painted-3d-runway';
 mesh.rotation.x=-Math.PI/2;
 mesh.position.set(0,surfaceY,centerZ);
 mesh.receiveShadow=true;
 mesh.renderOrder=1;
 scene.add(mesh);
 let style=id;
 function setBiome(next){
  style=ROAD_STYLES[next]?next:'meadow';
  draw(ctx,style,1024);
  texture.needsUpdate=true;
  material.roughness=style==='arctic'||style==='rainbow'?.28:.88;
  material.metalness=style==='arctic'?.19:.02;
  material.bumpScale=style==='arctic'||style==='rainbow'?.013:.055;
  material.emissive.setHex(style==='rainbow'?0x582866:0x000000);
  material.emissiveIntensity=style==='rainbow'?.12:0;
  material.needsUpdate=true;
 }
 function update(distance){
  texture.offset.y=((distance/6)%1+1)%1;
 }
 function dispose(){
  scene.remove(mesh);
  geometry.dispose();material.dispose();texture.dispose();
 }
 setBiome(style);
 return {mesh,setBiome,update,dispose,get biome(){return style;}};
}
