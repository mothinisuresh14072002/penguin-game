import * as THREE from 'three';

// Six rotating, low-draw-call zones alongside Bella's endless meadow road.
// Props remain outside the running corridor (|x| >= 6) and are pooled.
export const BUNNY_ZONES=['village','flower-garden','carrot-farm','enchanted-forest','bunny-market','rainbow-pond'];
export function createBunnyJourney(strips){
 const geo={ball:new THREE.SphereGeometry(1,9,7),box:new THREE.BoxGeometry(1,1,1),cone:new THREE.ConeGeometry(1,1,8),roof:new THREE.ConeGeometry(1,1,4)};
 const palette=[0xffdbdd,0xffd465,0x90cf80,0xb288eb,0x72cdee,0xfaf1c4,0xb37752,0x4d9965,0xffffff,0xfda3c7,0x98e6e8];
 const mats=palette.map(color=>new THREE.MeshLambertMaterial({color}));
 const [pink,yellow,green,purple,blue,cream,wood,leaves,white,rose,water]=mats;
 const objects=strips.map(()=>new THREE.Group());
 const last=Array(strips.length).fill(-1);
 strips.forEach((strip,i)=>{strip.add(objects[i]);objects[i].name='bunny-journey-zone-'+i});
 const mesh=(group,g,m,x,y,z,sx,sy,sz,rot=0)=>{
  const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.z=rot;group.add(o);return o;
 };
 const ball=(g,m,x,y,z,a,b,c)=>mesh(g,geo.ball,m,x,y,z,a,b,c);
 const box=(g,m,x,y,z,a,b,c)=>mesh(g,geo.box,m,x,y,z,a,b,c);
 const cone=(g,m,x,y,z,a,b,c)=>mesh(g,geo.cone,m,x,y,z,a,b,c);
 function tree(g,x,z){
  box(g,wood,x,.85,z,.24,1.55,.27);
  ball(g,leaves,x,2.05,z,1.04,1.04,.78);
  ball(g,green,x+.6,1.86,z,.63,.76,.60);
 }
 function cottage(g,x,z,color=cream){
  box(g,color,x,.82,z,1.65,1.42,1.50);
  cone(g,pink,x,1.75,z,1.4,.90,1.4);
  box(g,wood,x,.42,z-0.8,.45,.73,.12);
  ball(g,yellow,x+.27,.43,z-.89,.08,.08,.05);
 }
 function flowers(g,x,z){
  for(let j=0;j<5;j++){
   const xx=x+(j-2)*.47,zz=z+(j%2)*.75;
   box(g,green,xx,.27,zz,.07,.43,.06);
   ball(g,j%2?pink:white,xx,.56,zz,.20,.20,.13);
   ball(g,yellow,xx,.56,zz-.13,.085,.085,.055);
  }
 }
 function basket(g,x,z){
  box(g,wood,x,.34,z,.88,.56,.66);
  for(let j=0;j<3;j++)cone(g,j%2?green:yellow,x+(j-1)*.24,.75,z,.14,.42,.14);
 }
 const builders={
  village:(g,x,z)=>{cottage(g,x,z);tree(g,x+2.9,z-1.5);flowers(g,x-1.8,z-1.0)},
  'flower-garden':(g,x,z)=>{flowers(g,x,z);flowers(g,x+2.1,z-3);tree(g,x-1.4,z-6);ball(g,pink,x+.9,1.5,z-1,.2,.10,.18)},
  'carrot-farm':(g,x,z)=>{
   for(let j=0;j<7;j++){const zz=z-j*.82;cone(g,yellow,x-.75,.35,zz,.14,.50,.14);cone(g,green,x-.75,.68,zz,.21,.32,.21);cone(g,yellow,x+.3,.35,zz,.14,.5,.14);cone(g,green,x+.3,.68,zz,.21,.32,.21)}
   basket(g,x+1.6,z-1.5);
  },
  'enchanted-forest':(g,x,z)=>{tree(g,x,z);tree(g,x+2.4,z-4);cottage(g,x-2.1,z-4,purple);ball(g,rose,x+1.3,.6,z-2,.36,.28,.36)},
  'bunny-market':(g,x,z)=>{
   box(g,wood,x,.95,z,2.5,1.4,1.4);box(g,pink,x,1.79,z,2.9,.24,1.7);
   box(g,cream,x,.46,z-1,.85,.75,.7);basket(g,x+1.2,z-1);ball(g,yellow,x-1.1,1.05,z-.8,.26,.26,.20);
  },
  'rainbow-pond':(g,x,z)=>{
   ball(g,water,x,.20,z,2.9,.10,2.5);
   for(let j=0;j<5;j++)ball(g,green,x-1.5+j*.64,.30,z+(j%2?-.7:.6),.29,.06,.25);
   tree(g,x+3.2,z-3);flowers(g,x-2.6,z-3);
   for(let j=0;j<3;j++)ball(g,white,x+j*.65-1,.65,z-.3,.35,.10,.27);
  }
 };
 function update(distance=0){
  const travelled=Math.max(0,distance);
  for(let i=0;i<strips.length;i++){
   // A pooled 44m strip changes its contents only as it crosses a zone boundary.
   const segment=Math.max(0,Math.floor(travelled/44)+i);
   const chapter=Math.floor(segment/3);
   if(last[i]===chapter)continue;
   last[i]=chapter;
   objects[i].clear();
   const key=BUNNY_ZONES[chapter%BUNNY_ZONES.length];
   const side=i%2?-1:1;
   const x=side*(8.0+(chapter*7+i*3)%5);
   builders[key](objects[i],x,-10-(chapter*3+i*5)%12);
   objects[i].userData.zone=key;
  }
 }
 function dispose(){
  strips.forEach((strip,i)=>strip.remove(objects[i]));
  Object.values(geo).forEach(g=>g.dispose());mats.forEach(m=>m.dispose());
 }
 update(0);
 return {update,dispose,objects};
}
