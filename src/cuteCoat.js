import * as THREE from 'three';

// Coat patterns belong to the body surface, not to raised blob-like meshes.
// Three.js LatheGeometry's back (-Z) is centred around UV u=.5.
export const COAT_PATTERNS=Object.freeze({
 bunny:'clean-cream',unicorn:'pearlescent-back',horse:'cream-rump',
 cat:'orange-tabby',dog:'cream-shoulders',penguin:'charcoal-feathers',cow:'black-calf-spots'
});
const coatCache=new Map();
const hex=n=>'#'+n.toString(16).padStart(6,'0');
function softOval(ctx,x,y,rx,ry,colour,opacity=.9){
 ctx.save();
 ctx.translate(x,y);
 const radial=ctx.createRadialGradient(0,0,rx*.12,0,0,Math.max(rx,ry));
 radial.addColorStop(0,colour);
 radial.addColorStop(.55,colour);
 radial.addColorStop(1,colour+'00');
 ctx.globalAlpha=opacity;
 ctx.fillStyle=radial;
 ctx.scale(rx,ry);
 ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
export function createCoatTexture(id,color){
 if(typeof document==='undefined')return null;
 const key=id+':'+color;
 if(coatCache.has(key))return coatCache.get(key);
 const canvas=document.createElement('canvas');
 canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d');
 if(!ctx)return null;
 ctx.fillStyle=hex(color);
 ctx.fillRect(0,0,512,512);
 // Minimal, naturally soft transitions for the rear-facing camera.
 switch(id){
  case 'bunny':
   softOval(ctx,256,365,58,75,'#fff3ed',.26);break;
  case 'unicorn':
   softOval(ctx,256,248,80,100,'#eadcf7',.32);break;
  case 'horse':
   softOval(ctx,256,300,94,125,'#ffead0',.90);
   softOval(ctx,201,358,25,48,'#dfae85',.47);
   softOval(ctx,314,358,25,48,'#dfae85',.47);break;
  case 'cat':
   ctx.strokeStyle='#c17e43';ctx.lineCap='round';
   for(let i=0;i<5;i++){
    ctx.globalAlpha=.64;
    ctx.lineWidth=11-i*.55;
    ctx.beginPath();ctx.moveTo(i%2?182:330,175+i*49);
    ctx.quadraticCurveTo(254,193+i*49,i%2?318:194,202+i*49);
    ctx.stroke();
   }
   ctx.globalAlpha=1;break;
  case 'dog':
   softOval(ctx,256,280,90,132,'#fff6e1',.86);
   softOval(ctx,214,159,34,50,'#c89a73',.48);break;
  case 'penguin':
   softOval(ctx,256,292,80,145,'#3b4b65',.32);break;
  case 'cow':
   softOval(ctx,196,226,65,91,'#35323c',.98);
   softOval(ctx,310,345,52,67,'#35323c',.98);
   softOval(ctx,265,143,35,32,'#35323c',.86);
   break;
 }
 const texture=new THREE.CanvasTexture(canvas);
 texture.name='pawverse-soft-coat-'+id;
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=8;
 coatCache.set(key,texture);
 return texture;
}
