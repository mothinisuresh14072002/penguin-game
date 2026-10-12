import * as THREE from 'three';

// The geometry remains lightweight, but nearby leaves, soil and timber now
// react to light with small-scale surface relief rather than perfectly smooth
// plastic colour. One seeded, reused CanvasTexture per kind keeps GPU memory
// bounded; never embed random URLs or third-party image assets.
const settings=Object.freeze({
 foliage:{seed:41,bump:.085,repeat:3},
 bark:{seed:123,bump:.12,repeat:2},
 soil:{seed:617,bump:.065,repeat:4}
});
const cached=new Map();
function random(x,y,seed){
 let n=(Math.imul(x+seed,374761393)+Math.imul(y+seed,668265263))|0;
 n=Math.imul(n^(n>>>13),1274126177);
 return ((n^(n>>>16))>>>0)/4294967295;
}
export function surfaceKindForColor(hex){
 const c=new THREE.Color(hex);
 const {r,g,b}=c;
 if(g>r*1.16&&g>b*.96)return 'foliage';
 if(r>g*1.13&&g>b*1.06&&g>.13)return 'bark';
 return null;
}
export function surfaceBump(kind){
 if(!settings[kind]||typeof document==='undefined')return null;
 if(cached.has(kind))return cached.get(kind);
 const size=256,canvas=document.createElement('canvas');
 canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d');
 if(!ctx)return null;
 const img=ctx.createImageData(size,size);
 const seed=settings[kind].seed;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const xx=x&255,yy=y&255;
  // Three coherent spatial scales plus subtle micro-grain. Integer grid
  // sampling avoids consuming randomness and remains stable across reloads.
  const coarse=random((xx>>4),yy>>4,seed);
  const medium=random(xx>>2,yy>>2,seed+8);
  const fine=random(xx,yy,seed+19);
  const barkStripe=kind==='bark'?Math.sin(xx*.35+medium*2.3)*20:0;
  const value=Math.round(70+coarse*55+medium*50+fine*30+barkStripe);
  const i=(y*size+x)*4;
  img.data[i]=img.data[i+1]=img.data[i+2]=Math.max(0,Math.min(255,value));
  img.data[i+3]=255;
 }
 ctx.putImageData(img,0,0);
 const tex=new THREE.CanvasTexture(canvas);
 tex.name='pawverse-hd-'+kind;
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
 tex.repeat.set(settings[kind].repeat,settings[kind].repeat);
 tex.anisotropy=8;
 tex.needsUpdate=true;
 cached.set(kind,tex);
 return tex;
}
export function giveSurfaceDetail(material,kind){
 const tex=surfaceBump(kind);
 if(tex && 'bumpMap' in material){
  material.bumpMap=tex;
  material.bumpScale=settings[kind]?.bump??.06;
  material.needsUpdate=true;
 }
 return material;
}
