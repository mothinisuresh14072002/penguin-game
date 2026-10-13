import * as THREE from 'three';

// One small, shared chibi-face design for all seven animals. Facial markings
// are PAINTED on the head surface instead of assembling 20+ raised spheres.
// This is a true 3D head with a texture, not a 2D game sprite.
export const CUTE_FACE_STYLES=Object.freeze({
 bunny:   Object.freeze({coat:0xfffaf5,iris:0x413645,blush:0xf6b1c5,nose:0xd8899e}),
 unicorn: Object.freeze({coat:0xf9f4ff,iris:0x413645,blush:0xeab2cc,nose:0xcd99c1}),
 horse:   Object.freeze({coat:0xc58b60,iris:0x413645,blush:0xeeb7a0,nose:0xb27d65}),
 cat:     Object.freeze({coat:0xf5a94f,iris:0x54b88e,blush:0xe99991,nose:0xb67672}),
 dog:     Object.freeze({coat:0xf4dcac,iris:0x413645,blush:0xf0b9a7,nose:0x3a3537}),
 penguin: Object.freeze({coat:0x222936,iris:0x413645,blush:0xf3b6c3,nose:0xf5a75d}),
 cow:     Object.freeze({coat:0xfffcf5,iris:0x413645,blush:0xf3b0be,nose:0xce8da2})
});
export const FACE_EYE_STYLE='soft-oval-catchlight-v1';
const stored=new Map();
const hex=n=>'#'+n.toString(16).padStart(6,'0');
function ellipse(ctx,x,y,rx,ry,color){
 ctx.beginPath();
 ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
 ctx.fillStyle=color;ctx.fill();
}
function softBlush(ctx,x,y,shade){
 const grad=ctx.createRadialGradient(x,y,2,x,y,23);
 grad.addColorStop(0,shade+'95');
 grad.addColorStop(.56,shade+'40');
 grad.addColorStop(1,shade+'00');
 ctx.fillStyle=grad;
 ctx.fillRect(x-25,y-25,50,50);
}
export function getCuteFaceStyle(id){
 return CUTE_FACE_STYLES[id]||CUTE_FACE_STYLES.bunny;
}
export function createCuteFaceTexture(id,coatOverride=null){
 if(typeof document==='undefined')return null;
 const palette=getCuteFaceStyle(id);
 const coat=coatOverride??palette.coat;
 const key=id+':'+coat;
 if(stored.has(key))return stored.get(key);
 const canvas=document.createElement('canvas');
 canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d');
 if(!ctx)return null;
 // A standard Three.js SphereGeometry looks towards +Z at u=.25.
 // The common face occupies only that arc, leaving the back solid-coated.
 ctx.fillStyle=hex(coat);ctx.fillRect(0,0,512,512);
 ctx.save();
 const cx=128;
 // Species markings are subtle pigments instead of thick extra meshes.
 if(id==='penguin'){
  ellipse(ctx,cx,262,79,126,'#fffaf3');
  ellipse(ctx,cx-32,251,38,104,'#ffffff');
  ellipse(ctx,cx+32,251,38,104,'#ffffff');
 }else if(id==='cow'){
  ellipse(ctx,161,176,37,27,'#39333c');
  ellipse(ctx,cx,298,44,29,'#f4c5cf');
 }else if(id==='horse'){
  ellipse(ctx,cx,213,11,73,'#ffe6c8');
  ellipse(ctx,cx,291,44,30,'#eac29e');
 }else if(id==='unicorn'){
  ellipse(ctx,cx,183,43,14,'#e3d1fe');
 }else if(id==='dog'){
  ellipse(ctx,103,191,31,39,'#bb8b69');
  ellipse(ctx,cx,299,43,25,'#fff6e8');
 }else if(id==='cat'){
  ctx.lineCap='round';ctx.strokeStyle='#c17a3b';ctx.lineWidth=6;
  for(const offset of [-22,0,22]){
   ctx.beginPath();ctx.moveTo(cx+offset,154);
   ctx.quadraticCurveTo(cx+offset*.8,171,cx+offset*.7,183);ctx.stroke();
  }
 }else if(id==='bunny'){
  ellipse(ctx,cx,292,39,23,'#fff5ed');
 }
 for(const direction of [-1,1]){
  const x=cx+direction*38;
  softBlush(ctx,cx+direction*67,296,hex(palette.blush));
  // The same eye system is used on ALL seven characters.
  ellipse(ctx,x,233,24,31,'#fffefc');
  ellipse(ctx,x,234,19,26,'#3a2d36');
  ellipse(ctx,x,239,12.5,19,hex(palette.iris));
  ellipse(ctx,x-6,222,7,8,'#ffffff');
  ellipse(ctx,x+7,242,3.1,3.8,'#ffffff');
 }
 if(id!=='penguin'){
  ellipse(ctx,cx,286,id==='cow'?6:9,id==='cow'?4:6,hex(palette.nose));
  ctx.strokeStyle='#66535b';ctx.lineWidth=3.4;ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(cx,294);ctx.lineTo(cx,302);
  ctx.quadraticCurveTo(cx-9,310,cx-16,303);
  ctx.moveTo(cx,302);ctx.quadraticCurveTo(cx+9,310,cx+16,303);
  ctx.stroke();
 }else{
  // A tiny painted triangle matches the solid beak from side angles.
  ctx.beginPath();
  ctx.moveTo(cx,281);ctx.lineTo(cx-10,297);ctx.lineTo(cx+10,297);ctx.closePath();
  ctx.fillStyle='#f4ad68';ctx.fill();
 }
 ctx.restore();
 const texture=new THREE.CanvasTexture(canvas);
 texture.name='pawverse-shared-cute-face-'+id;
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=8;
 texture.needsUpdate=true;
 stored.set(key,texture);
 return texture;
}
