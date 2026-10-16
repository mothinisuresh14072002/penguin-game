import * as THREE from 'three';

// Decorative pooled chapter accents for the six non-bunny worlds.
// All props are placed beyond the play corridor, use shared assets and change
// only when a scenery strip enters a new chapter.
export const WORLD_STORIES=Object.freeze({
 rainbow:['cloud-nursery','rainbow-gate','star-garden','crystal-castle','moon-market','wish-islands'],
 grassland:['foal-stables','apple-orchard','hay-meadow','windmill-fair','flower-ranch','sunset-corral'],
 city:['kitten-homes','fish-market','yarn-garden','bakery-street','cat-playground','rooftop-parade'],
 park:['puppy-homes','bone-garden','dog-playground','duck-pond','treat-market','puppy-festival'],
 arctic:['penguin-village','snowflake-garden','fish-harbor','crystal-cave','ice-festival','aurora-lake'],
 farm:['calf-cottages','clover-meadow','milk-market','corn-farm','sunflower-fair','barnyard-pond']
});
const colors={
 rainbow:[0xe3bcff,0xffbddd,0xfce69b,0x90ddf7],
 grassland:[0xd49a62,0xffde93,0x9ec870,0xf6a8a5],
 city:[0xffc49a,0xf6a6cb,0xc2a7f2,0xffe0a3],
 park:[0xb4df91,0xffb9cd,0x9acffc,0xfbd18d],
 arctic:[0xb2eaff,0xe9f9ff,0x89c5f4,0xb8b1ee],
 farm:[0xf7dc91,0xb1dd87,0xffbccc,0xd69b73]
};
export function createWorldStory(strips,biome,stripLength=54){
 const chapters=WORLD_STORIES[biome];
 if(!chapters)throw Error('Unknown story biome: '+biome);
 const geo={box:new THREE.BoxGeometry(1,1,1),orb:new THREE.SphereGeometry(1,10,8),cone:new THREE.ConeGeometry(1,1,8)};
 const mats=colors[biome].map(color=>new THREE.MeshLambertMaterial({color}));
 const groups=strips.map((strip,i)=>{const g=new THREE.Group();g.name=biome+'-story-'+i;strip.add(g);return g});
 const last=groups.map(()=>-1);
 const shape=(group,type,color,x,y,z,sx,sy,sz)=>{
  const mesh=new THREE.Mesh(geo[type],mats[color%4]);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);group.add(mesh);return mesh;
 };
 function populate(group,chapter,strip){
  group.clear();
  const variety=Math.floor(chapter/chapters.length);
  const side=strip%2?-1:1;
  const x=side*(9+(chapter+strip)%4);
  const z=-8-(variety*3+strip*5)%18;
  const pick=chapter%6;
  const orb=(dx,y,dz,a,b,c,col=0)=>shape(group,'orb',col,x+side*dx,y,z+dz,a,b,c);
  const box=(dx,y,dz,a,b,c,col=0)=>shape(group,'box',col,x+side*dx,y,z+dz,a,b,c);
  const cone=(dx,y,dz,a,b,c,col=0)=>shape(group,'cone',col,x+side*dx,y,z+dz,a,b,c);
  // Each chapter has its own landmark silhouette; species palettes vary
  // independently and repeat visits shift prop arrangements.
  if(pick===0){ // homes and cozy village gates
   box(0,.9,0,2.6,1.6,2,0);cone(0,2.05,0,1.8,1.1,1.7,1);
   box(0,.48,-1.07,.5,.85,.13,2);orb(2.5,1.7,-3,1.1,1.1,.9,3);
  }else if(pick===1){ // garden arches, flowers, animal treats
   for(let j=0;j<5;j++){const zz=-j*2;orb(j%2?1.5:0,.55,zz,.38,.45,.36,j);cone(j%2?1.5:0,.23,zz,.12,.48,.12,2)}
   orb(2,2,-4,1.1,.8,.6,1);
  }else if(pick===2){ // produce/fish/yarn stalls
   box(0,.85,0,2.5,1.25,1.6,2);box(0,1.66,-.12,3,.24,2,1);
   for(let j=0;j<5;j++)orb(-.9+j*.44,1.12,-.94,.20,.22,.23,j);
  }else if(pick===3){ // taller landmark, cave or windmill
   box(0,1.6,-2,1.3,3.1,1.35,0);cone(0,3.35,-2,1.3,1.2,1.3,3);
   orb(2,1,-5,.8,.7,.8,1);orb(-2,.8,-4,.7,.6,.7,2);
  }else if(pick===4){ // festival booths, flags and balloons
   box(0,.9,0,2.3,1.4,1.4,1);cone(0,1.85,0,1.7,.8,1.2,0);
   for(let j=0;j<4;j++){box(2.5,.9,-j*1.5,.08,1.8,.08,2);orb(2.5,1.95,-j*1.5,.35,.46,.32,j)}
  }else{ // peaceful pond, island, secret reward zone
   orb(0,.22,-2,3,.12,2.6,2);
   for(let j=0;j<5;j++)orb((j-2)*.75,.35,-2+(j%2)*.9,.38,.07,.33,j);
   orb(2.7,1.35,-5,.95,1,.8,3);
  }
  group.userData.chapter=chapters[pick];group.userData.variant=variety;
 }
 function update(distance=0){
  const d=Math.max(0,Number(distance)||0);
  for(let i=0;i<groups.length;i++){
   const segment=Math.floor(d/stripLength)+i;
   const chapter=Math.floor(segment/3);
   if(last[i]===chapter)continue;
   last[i]=chapter;
   populate(groups[i],chapter,i);
  }
 }
 function dispose(){
  groups.forEach((g,i)=>{g.clear();strips[i].remove(g)});
  Object.values(geo).forEach(g=>g.dispose());mats.forEach(m=>m.dispose());
 }
 update(0);
 return {groups,chapters,update,dispose};
}
