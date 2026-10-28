import * as THREE from 'three';

// Virtual pink-cash cosmetics: five slots, four choices each.
export const ACCESSORIES=Object.freeze([
 {id:'sunny',name:'Cool Sunglasses',emoji:'😎',slot:'eyes',price:80,color:0x26304b},
 {id:'heart',name:'Heart Glasses',emoji:'💗',slot:'eyes',price:95,color:0xf26ca0},
 {id:'star',name:'Star Glasses',emoji:'⭐',slot:'eyes',price:100,color:0xffcb50},
 {id:'sky',name:'Sky Glasses',emoji:'🩵',slot:'eyes',price:110,color:0x71dafa},
 {id:'red-scarf',name:'Red Scarf',emoji:'🧣',slot:'neck',price:65,color:0xdc354e},
 {id:'blue-scarf',name:'Ocean Scarf',emoji:'🌊',slot:'neck',price:75,color:0x56baf3},
 {id:'pink-scarf',name:'Pink Scarf',emoji:'🌸',slot:'neck',price:75,color:0xf7a3c4},
 {id:'rainbow-scarf',name:'Rainbow Scarf',emoji:'🌈',slot:'neck',price:120,color:0xa892f8},
 {id:'red-bow',name:'Cherry Bow',emoji:'🎀',slot:'head',price:60,color:0xe53e59},
 {id:'pink-bow',name:'Blush Bow',emoji:'🌷',slot:'head',price:70,color:0xf49dbe},
 {id:'flower',name:'Daisy Crown',emoji:'🌼',slot:'head',price:125,color:0xffdf70},
 {id:'cap',name:'Sky Cap',emoji:'🧢',slot:'head',price:135,color:0x70b7fa},
 {id:'berry',name:'Berry Outfit',emoji:'🍓',slot:'outfit',price:180,color:0xe95269},
 {id:'lemon',name:'Lemon Outfit',emoji:'🍋',slot:'outfit',price:170,color:0xf3d16d},
 {id:'mint',name:'Mint Outfit',emoji:'🍃',slot:'outfit',price:185,color:0x88d5b3},
 {id:'lilac',name:'Lilac Outfit',emoji:'💜',slot:'outfit',price:195,color:0xba9def},
 {id:'gold',name:'Golden Charm',emoji:'✨',slot:'charm',price:80,color:0xffd565},
 {id:'heart-charm',name:'Heart Charm',emoji:'💕',slot:'charm',price:85,color:0xff86aa},
 {id:'bell',name:'Tiny Bell',emoji:'🔔',slot:'charm',price:90,color:0xf5c65d},
 {id:'snowflake',name:'Snowflake Charm',emoji:'❄️',slot:'charm',price:95,color:0xbcefff}
]);
export const SLOTS=Object.freeze(['head','eyes','neck','outfit','charm']);
const byId=new Map(ACCESSORIES.map(a=>[a.id,a]));
export const accessoryById=id=>byId.get(id);
export function sanitizeWardrobe(saved){
 const data=saved&&typeof saved==='object'?saved:{};
 const owned=[...new Set(Array.isArray(data.owned)?data.owned:[])].filter(id=>byId.has(id));
 const equipped={};
 if(data.equipped&&typeof data.equipped==='object')for(const [animal,slots] of Object.entries(data.equipped)){
  if(!['bunny','unicorn','horse','cat','dog','penguin','cow'].includes(animal)||!slots||typeof slots!=='object')continue;
  equipped[animal]={};
  for(const slot of SLOTS){
   const item=byId.get(slots[slot]);
   if(item&&item.slot===slot&&owned.includes(item.id))equipped[animal][slot]=item.id;
  }
 }
 return {owned,equipped};
}
export function buyAccessory(profile,id){
 const item=byId.get(id);
 if(!item||profile.wardrobe.owned.includes(id)||(profile.pinkCash||0)<item.price)return false;
 profile.pinkCash-=item.price;
 profile.wardrobe.owned.push(id);
 return true;
}
export function equipAccessory(profile,animal,id){
 const item=byId.get(id);
 if(!item||!profile.wardrobe.owned.includes(id))return false;
 (profile.wardrobe.equipped[animal]??={})[item.slot]=id;
 return true;
}
export function unequipAccessory(profile,animal,slot){
 if(!SLOTS.includes(slot))return false;
 delete (profile.wardrobe.equipped[animal]??={})[slot];
 return true;
}
function ball(parent,mat,x,y,z,sx,sy,sz){
 const o=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),mat);
 o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;
}
export function applyWardrobe(actor,slots={}){
 if(!actor?.group)return;
 const old=actor.group.getObjectByName('wardrobe-cosmetics');
 if(old){
  old.parent?.remove(old);
  old.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});
 }
 const root=new THREE.Group();root.name='wardrobe-cosmetics';actor.group.add(root);
 const material=(hex)=>new THREE.MeshStandardMaterial({color:hex,roughness:.68});
 // Facing game direction is -Z, so rear accessories are readable during running.
 const head=actor.group.getObjectByName(actor.id+'-distinct-head');
 const headRadius=head?.scale?.x??.55;
 const headY=actor.face?.position.y??1.82;
 const body=actor.group.getObjectByName(actor.id+'-smooth-body');
 const bodyRadius=body?.scale?.x??.47;
 for(const slot of SLOTS){
  const item=byId.get(slots[slot]);if(!item||item.slot!==slot)continue;
  const mat=material(item.color);
  if(slot==='eyes'){
   // Glasses on the face (+Z), not the back of the runner.
   for(const side of [-1,1]){
    const lens=ball(root,mat,side*headRadius*.44,headY+.02,head?.scale?.z*.94??.45,.20,.145,.045);
    lens.name='cosmetic-glasses-lens';
   }
   ball(root,mat,0,headY+.02,(head?.scale?.z??.5)*.99,.17,.025,.038);
  }else if(slot==='head'){
   const y=headY+(head?.scale?.y??.5)*.90;
   const x=headRadius*.40;
   ball(root,mat,x,y,-.18,.105,.10,.055);
   for(const side of [-1,1])ball(root,mat,x+side*.14,y+.015,-.18,.14,.09,.06);
  }else if(slot==='neck'){
   // Thin neck ribbon plus a small flowing tip on the visible rear.
   ball(root,mat,0,1.34,-bodyRadius*.88,bodyRadius*.91,.09,.09);
   ball(root,mat,-.23,1.16,-bodyRadius-.13,.105,.22,.06);
  }else if(slot==='outfit'){
   // Delicate fabric-like front-and-back colour accents, leaving species markings visible.
   ball(root,mat,0,.97,-bodyRadius*.97,bodyRadius*.76,.31,.055);
   ball(root,mat,0,.97,bodyRadius*.97,bodyRadius*.76,.31,.055);
  }else if(slot==='charm'){
   ball(root,mat,0,1.15,-bodyRadius-.10,.115,.115,.065);
  }
 }
 return root;
}
