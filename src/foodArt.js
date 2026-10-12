import * as THREE from 'three';
import {FOOD_BY_ANIMAL} from './gameEconomy.js';

// Readable miniature 3D collectibles, with all meshes safely disposable
// using the normal obstacle-group cleanup. No image packs are required.
export function createPickupArtwork(kind,animal){
 const root=new THREE.Group();
 root.name=kind==='box'?'surprise-reward-box':'animal-food-'+animal;
 const meshes=[];
 const material=(color,metalness=0)=>new THREE.MeshStandardMaterial({
  color,metalness,roughness:metalness?.24:.65
 });
 const sphere=(m,x,y,z,sx,sy,sz)=>{
  const o=new THREE.Mesh(new THREE.SphereGeometry(1,12,9),m);
  o.position.set(x,y,z);o.scale.set(sx,sy,sz);root.add(o);meshes.push(o);return o;
 };
 const cone=(m,x,y,z,r,h)=>{
  const o=new THREE.Mesh(new THREE.ConeGeometry(r,h,10),m);
  o.position.set(x,y,z);root.add(o);meshes.push(o);return o;
 };
 const box=(m,x,y,z,sx,sy,sz)=>{
  const o=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),m);
  o.position.set(x,y,z);o.scale.set(sx,sy,sz);root.add(o);meshes.push(o);return o;
 };
 const ivory=material(0xfff4dc),green=material(0x56b86d),
  yellow=material(0xffd56e),gold=material(0xf7be47,.28);
 if(kind==='box'){
  const chest=box(material(0xb86b9c),0,1.05,0,.79,.76,.71);
  chest.rotation.y=.13;
  box(gold,0,1.05,.38,.13,.72,.10);
  box(gold,0,1.48,0,.86,.15,.77);
  box(ivory,0,1.16,.445,.19,.19,.045);
  sphere(yellow,0,1.16,.476,.12,.12,.06);
  return root;
 }
 const item=FOOD_BY_ANIMAL[animal]||FOOD_BY_ANIMAL.bunny;
 switch(item.id){
  case 'carrot':{
   const carrot=cone(material(0xff943e),0,1.05,0,.32,.82);
   carrot.rotation.z=Math.PI; // thick end is above, root below
   for(const side of [-1,0,1]){
    const leaf=cone(green,side*.15,1.62,0,.15,.37);
    leaf.rotation.z=-side*.47;
   }
   break;
  }
  case 'rainbowFruit':{
   sphere(material(0xeaa6fb),0,1.10,0,.38,.40,.36);
   for(const [i,c] of [0xffbfce,0xffe5a2,0x9bdfce,0xadd2fa].entries()){
    const angle=i*Math.PI/2;
    sphere(material(c),Math.cos(angle)*.23,1.14+Math.sin(angle)*.1,Math.sin(angle)*.23,.15,.23,.13);
   }
   cone(green,0,1.55,0,.17,.3);break;
  }
  case 'apple':{
   sphere(material(0xea565d),0,1.07,0,.39,.36,.36);
   box(material(0x8f653d),0,1.5,0,.075,.24,.07);
   const leaf=sphere(green,.15,1.55,.03,.2,.08,.14);leaf.rotation.z=.46;break;
  }
  case 'catFish':
  case 'penguinFish':{
   const blue=material(item.id==='catFish'?0x78c6de:0xa5e7f5,.08);
   sphere(blue,0,1.08,0,.53,.26,.20);
   const tail=cone(blue,-.50,1.08,0,.27,.44);tail.rotation.z=Math.PI/2;
   sphere(material(0x222e4a),.31,1.16,.17,.055,.055,.045);
   for(let i=-1;i<=1;i++)sphere(ivory,i*.15,1.24,-.06,.025,.04,.14);
   break;
  }
  case 'bone':{
   box(ivory,0,1.11,0,.68,.20,.19);
   for(const x of [-.4,.4])for(const z of [-.13,.13])sphere(ivory,x,1.11,z,.18,.18,.15);
   break;
  }
  case 'corn':{
   const cob=sphere(yellow,0,1.10,0,.23,.45,.24);
   cob.rotation.z=.08;
   for(const side of [-1,1]){
    const husk=cone(green,side*.2,1.0,-.04,.20,.71);husk.rotation.z=-side*.35;
   }
   break;
  }
 }
 return root;
}
