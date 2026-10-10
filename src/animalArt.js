import * as THREE from 'three';

// Shared character design system for solo and split-screen play.
// These are genuine animated Three.js meshes (not flat screenshots or image cards).
export function createAnimal(id, palette = {}) {
  const root = new THREE.Group();
  root.name = 'chibi-' + id;
  const geometries = {
    sphere: new THREE.SphereGeometry(1, 22, 16),
    box: new THREE.BoxGeometry(1, 1, 1),
    cone: new THREE.ConeGeometry(1, 1, 12),
    cylinder: new THREE.CylinderGeometry(1, 1, 10, 12),
    torus: new THREE.TorusGeometry(1, .22, 8, 20)
  };
  const colors = {
    bunny:0xffeef5, unicorn:0xf9f4ff, horse:0xc58b60, cat:0xf5a94f,
    dog:0xf6e2c5, penguin:0x718d9f, cow:0xfffcf5
  };
  const mats = new Map();
  function m(hex, shiny=false) {
    const key = String(hex) + (shiny?'s':'m');
    if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({
      color:hex, roughness:shiny?.19:.76, metalness:shiny?.03:0
    }));
    return mats.get(key);
  }
  const coat=m(palette.coat ?? colors[id] ?? colors.bunny);
  const cream=m(0xffffff), ivory=m(0xfff3e7), blush=m(0xf7a4b2), ink=m(0x191b27,true);
  const nose=m(0xd88391,true), peach=m(0xf0a05f), brown=m(0x956444), gold=m(0xffd970,true);
  function part(parent, geo, material, x,y,z,sx,sy,sz,rotation=0) {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
    mesh.rotation.z=rotation;
    mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  const ell=(p,ma,x,y,z,a,b,c,rotation=0)=>part(p,geometries.sphere,ma,x,y,z,a,b,c,rotation);
  const cube=(p,ma,x,y,z,a,b,c)=>part(p,geometries.box,ma,x,y,z,a,b,c);
  const triangle=(p,ma,x,y,z,r,h,d=1)=>part(p,geometries.cone,ma,x,y,z,r,h,r*d);
  const groupAt=(p,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g};
  const belly = id==='penguin'?m(0xfffcfb):id==='dog'?m(0xfffaf1):ivory;
  // Oversized baby-animal head, pear-shaped body, little paws and rosy cheeks.
  ell(root,coat,0,.96,0,.58,.66,.50);
  ell(root,belly,0,.94,.405,.43,.53,.17);
  if(id==='bunny'){
    // A little pastel flower outfit / skirt like the character reference.
    ell(root,m(0xf8cce4),0,.54,0,.67,.25,.54);
    ell(root,m(0xd8f5bd),0,.77,.44,.35,.10,.08);
  }
  if(id==='dog'){
    ell(root,m(0xffffff),0,.9,.43,.45,.48,.17);
    ell(root,m(0x739cc5),0,1.28,.24,.55,.085,.49);
    ell(root,gold,0,1.19,.64,.13,.13,.07);
  }
  if(id==='cow'){
    ell(root,m(0x33313a),-.28,1.10,.41,.17,.24,.12,.23);
    ell(root,m(0x33313a),.26,.72,.42,.20,.16,.09,-.35);
    ell(root,m(0xeeb7c0),0,.55,.43,.25,.15,.12);
  }
  const face=groupAt(root,0,1.82,.035);
  ell(face,coat,0,0,0,.66,.60,.54);
  if(id==='penguin'){
    ell(face,ivory,0,-.06,.43,.55,.52,.16);
  }else if(id==='dog'){
    ell(face,ivory,0,-.22,.42,.48,.24,.18);
    ell(face,m(0xb78153),-.32,.14,.42,.20,.28,.14,.18);
  }else if(id==='cow'){
    ell(face,m(0x343138),.28,.28,.36,.27,.27,.14,-.35);
  }else if(id==='horse'){
    ell(face,m(0xe8b88c),0,-.29,.48,.37,.26,.29);
  }
  // Large reflective eyes, two eye highlights and eyelashes.
  for(const side of [-1,1]){
    ell(face,cream,side*.285,.10,.492,.183,.228,.09);
    ell(face,ink,side*.285,.095,.566,.134,.174,.061);
    ell(face,m(id==='penguin'?0x328ebc:0x413645,true),side*.277,.105,.616,.077,.117,.025);
    ell(face,cream,side*.24,.169,.65,.044,.055,.024);
    ell(face,cream,side*.32,.046,.657,.019,.025,.013);
    ell(face,blush,side*.45,-.226,.38,.152,.089,.06);
    if(['bunny','unicorn','cat'].includes(id)){
      const lash=ell(face,ink,side*.406,.28,.49,.035,.10,.023);
      lash.rotation.z=side*.45;
    }
  }
  if(id==='penguin'){
    const beak=triangle(face,peach,0,-.18,.605,.145,.26);
    beak.rotation.x=Math.PI/2;
  }else{
    if(id==='cow'){
      ell(face,m(0xf0a6b4),0,-.30,.56,.42,.29,.24);
      for(const side of [-1,1])ell(face,m(0xa96978),side*.19,-.35,.777,.05,.038,.025);
    }else if(id==='horse'||id==='unicorn'){
      ell(face,id==='unicorn'?ivory:m(0xe8bc92),0,-.31,.55,.27,.23,.26);
      for(const side of [-1,1])ell(face,brown,side*.12,-.43,.77,.038,.03,.018);
    }else{
      ell(face,ivory,0,-.30,.50,.29,.20,.18);
      ell(face,id==='dog'?ink:nose,0,-.244,.668,.10,.071,.065);
    }
    // Small smiling mouth and muzzle dimples.
    ell(face,ink,0,-.443,.675,.072,.022,.022);
    for(const side of [-1,1])ell(face,blush,side*.19,-.41,.63,.06,.025,.025);
  }
  const ears=[];
  for(const side of [-1,1]){
    if(id==='bunny'){
      const ear=groupAt(face,side*.43,.49,-.07);
      ell(ear,coat,side*.10,.47,0,.22,.68,.17,-side*.12);
      ell(ear,m(0xf4b5cc),side*.10,.49,.145,.116,.49,.035,-side*.12);
      ears.push(ear);
    }else if(id==='unicorn'||id==='horse'||id==='cat'){
      const ear=groupAt(face,side*.44,.47,-.04);
      const shape=triangle(ear,coat,0,.26,0,.24,.54);
      shape.rotation.z=-side*.18;
      ell(ear,m(0xf6b4c8),0,.26,.13,.095,.17,.05);
      ears.push(ear);
    }else if(id==='dog'){
      const ear=groupAt(face,side*.53,.28,-.02);
      ell(ear,m(0xb6815c),side*.16,-.14,.02,.25,.43,.15,side*.55);
      ears.push(ear);
    }else if(id==='cow'){
      const ear=groupAt(face,side*.61,.27,-.08);
      ell(ear,coat,side*.14,.05,0,.29,.16,.19,side*.18);
      ell(ear,m(0xf5b1c0),side*.16,.05,.17,.18,.09,.04);
      ears.push(ear);
      triangle(face,ivory,side*.28,.62,-.05,.14,.33);
    }else if(id==='penguin'){
      // Soft crown feathers; no mammal ears.
      if(side===1)for(let i=0;i<3;i++)ell(face,coat,(i-1)*.12,.58,-.07,.12,.23,.13,(i-1)*-.2);
    }
  }
  if(id==='unicorn'){
    triangle(face,gold,0,.72,.36,.16,.69);
    const pastel=[0xf79cc7,0xaedbff,0xffdc90,0xcba5f9,0x9bdfd2];
    for(let i=0;i<7;i++){
      const x=-.36+i*.12;
      ell(face,m(pastel[i%5]),x,.52-(i%3)*.06,.17,.15,.24,.21,(i-3)*.1);
    }
    // Cloudlike wings.
    for(const side of [-1,1]){
      ell(root,m(0xfdeafb),side*.54,1.10,-.24,.25,.40,.13,side*.60);
      ell(root,cream,side*.7,1.18,-.30,.21,.26,.1,side*.8);
    }
  }
  if(id==='horse'){
    const mane=m(0x80513d);
    for(let i=0;i<5;i++)ell(face,mane,-.30+i*.15,.56+(i%2)*.13,-.12,.15,.26,.17);
  }
  if(id==='cat'){
    // Small stripy forehead and six visible whiskers.
    const stripe=m(0xc77a36);
    for(const side of [-1,0,1])ell(face,stripe,side*.15,.43,.45,.07,.17,.045,-side*.22);
    const whiskMat=m(0xf4e7d9);
    for(const side of [-1,1])for(let i=-1;i<=1;i++){
      const whisker=part(face,geometries.cylinder,whiskMat,side*.55,-.32+i*.085,.52,.009,.48,.009);
      whisker.rotation.z=Math.PI/2+side*i*.13;
    }
  }
  if(id==='bunny'){
    // Small floral decoration on the dress.
    for(const side of [-1,1]){
      ell(root,m(0xffda84),side*.26,.77,.50,.09,.09,.04);
      for(let i=0;i<5;i++){
        const a=i*Math.PI*2/5;
        ell(root,m(0xffffff),side*.26+Math.cos(a)*.1,.77+Math.sin(a)*.1,.52,.055,.055,.03);
      }
    }
    ell(face,m(0xfae3ed),-.22,.52,.25,.18,.10,.06);
  }
  if(id==='cow'){
    const fringe=m(0xece5d9);
    for(let i=0;i<3;i++)ell(face,fringe,(i-1)*.16,.52,.15,.15,.20,.16);
  }
  if(id==='dog'){
    ell(face,m(0xc7926d),.34,.3,.4,.18,.22,.12);
    ell(face,ink,0,-.43,.71,.1,.036,.016);
  }
  const pivotL=groupAt(root,-.55,1.35,0);
  const pivotR=groupAt(root,.55,1.35,0);
  for(const side of [-1,1]){
    const pivot=side===-1?pivotL:pivotR;
    ell(pivot,coat,side*.07,-.28,.04,.21,.36,.21,-side*.12);
    ell(pivot,id==='penguin'?coat:ivory,side*.08,-.55,.16,.18,.11,.22);
  }
  const feet=[];
  for(const side of [-1,1]){
    const foot=groupAt(root,side*.30,.47,.1);
    ell(foot,coat,0,-.22,0,.23,.28,.22);
    ell(foot,id==='penguin'?peach:id==='cow'?m(0x62505a):id==='horse'?brown:ivory,0,-.39,.20,.27,.12,.30);
    feet.push(foot);
  }
  const tail=groupAt(root,.28,1.04,-.49);
  if(id==='bunny')ell(tail,cream,0,0,0,.25,.25,.23);
  else if(id==='unicorn'||id==='horse'){
    const shades=id==='unicorn'?[0xffaacc,0x9bd7ff,0xd2b8fc]:[0x805340,0x96664c,0xb98a6a];
    for(let i=0;i<3;i++)ell(tail,m(shades[i]),i*.08,-.21-i*.09,-.16,.12,.35,.16,-.3);
  }else if(id==='cat'||id==='dog'){
    ell(tail,coat,.20,.18,-.07,.19,.45,.17,-.45);
    ell(tail,id==='cat'?ivory:coat,.41,.47,-.06,.16,.19,.15);
  }else if(id==='cow')ell(tail,coat,.15,-.17,-.12,.10,.36,.10,-.30);
  else ell(tail,coat,0,-.12,0,.19,.24,.21);
  return {group:root,pivotL,pivotR,feet,ears,tail,face};
}

// Character animation uses bones/groups, not just translating a static drawing.
export function animateAnimal(actor, t, moving=true, airborne=false) {
  const pace=moving?1:0;
  const step=Math.sin(t*14);
  actor.pivotL.rotation.x=step*.44*pace;
  actor.pivotR.rotation.x=-step*.44*pace;
  if(actor.feet)for(let i=0;i<actor.feet.length;i++)actor.feet[i].rotation.x=step*(i===0?-1:1)*.55*pace;
  if(actor.ears)for(let i=0;i<actor.ears.length;i++)actor.ears[i].rotation.z=Math.sin(t*7+i)*.075*pace;
  if(actor.tail)actor.tail.rotation.x=Math.sin(t*9)*.16*pace;
  if(actor.face)actor.face.rotation.z=Math.sin(t*7)*.026*pace;
  actor.group.rotation.z=Math.sin(t*12)*.033*pace;
  actor.group.scale.y=airborne?1.04:1;
}
