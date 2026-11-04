import * as THREE from 'three';
import {createSoftEarGeometry,createRoundedTriangleGeometry} from './chibiGeometry.js';
import {createCuteFaceTexture,getCuteFaceStyle,FACE_EYE_STYLE} from './cuteFace.js';
import {createCoatTexture,COAT_PATTERNS} from './cuteCoat.js';

// Shared character design system for solo and split-screen play.
// These are genuine animated Three.js meshes (not flat screenshots or image cards).
export function createAnimal(id, palette = {}) {
  const root = new THREE.Group();
  root.name = 'chibi-' + id;
  const geometries = {
    sphere: new THREE.SphereGeometry(1, 28, 20),
    bunnyBody: new THREE.LatheGeometry([
      new THREE.Vector2(0,-1),new THREE.Vector2(.48,-.98),
      new THREE.Vector2(.86,-.78),new THREE.Vector2(1,-.45),
      new THREE.Vector2(.96,-.1),new THREE.Vector2(.81,.47),
      new THREE.Vector2(.63,.83),new THREE.Vector2(0,1)
    ],28),
    softBody: new THREE.LatheGeometry([
      new THREE.Vector2(0,-1),
      new THREE.Vector2(.48,-.97),
      new THREE.Vector2(.83,-.79),
      new THREE.Vector2(1,-.43),
      new THREE.Vector2(.95,.08),
      new THREE.Vector2(.79,.57),
      new THREE.Vector2(.45,.89),
      new THREE.Vector2(0,1)
    ],28),
    softLimb: new THREE.LatheGeometry([
      new THREE.Vector2(0,-1),new THREE.Vector2(.49,-.98),
      new THREE.Vector2(.69,-.76),new THREE.Vector2(.77,-.46),
      new THREE.Vector2(.66,-.12),new THREE.Vector2(.79,.31),
      new THREE.Vector2(.91,.69),new THREE.Vector2(.70,.91),
      new THREE.Vector2(0,1)
    ],22),
    box: new THREE.BoxGeometry(1, 1, 1),
    cone: new THREE.ConeGeometry(1, 1, 12),
    cylinder: new THREE.CylinderGeometry(1, 1, 10, 12),
    torus: new THREE.TorusGeometry(1, .22, 8, 20)
  };
  const colors = {
    mochi:0x3fcf9f, hop:0xfbf8f4,
    bunny:0xfffaf5, unicorn:0xf9f4ff, horse:0xc58b60, cat:0xf5a94f,
    dog:0xf4dcac, penguin:0x1f2430, cow:0xfffcf5
  };
  const mats = new Map();
  function m(hex, shiny=false) {
    const key = String(hex) + (shiny?'s':'m');
    if (!mats.has(key)) {
      if (id === 'mochi' && !shiny) {
        mats.set(key, new THREE.MeshPhysicalMaterial({
          color: hex, roughness: .16, metalness: .03,
          transmission: .45, ior: 1.34,
          sheen: .85, sheenRoughness: .35, sheenColor: new THREE.Color(0x9effd9),
          clearcoat: .35, clearcoatRoughness: .15
        }));
      } else if (id === 'hop' && !shiny) {
        mats.set(key, new THREE.MeshPhysicalMaterial({
          color: hex, roughness: .85, metalness: 0,
          sheen: .92, sheenRoughness: .82, sheenColor: new THREE.Color(0xffd9e6),
          clearcoat: .02
        }));
      } else if ((id==='bunny'||id==='unicorn'||id==='horse'||id==='cat'||id==='dog'||id==='penguin'||id==='cow') && !shiny) {
        mats.set(key, new THREE.MeshPhysicalMaterial({
          color: hex, roughness: .88, metalness: 0,
          sheen: .65, sheenRoughness: .85,
          sheenColor: new THREE.Color(id==='unicorn'?0xeddaff:id==='horse'?0xffdcaa:id==='cat'?0xffd9b2:id==='dog'?0xffedc9:id==='penguin'?0xaac9ea:id==='cow'?0xffecf6:0xffe9e2),
          clearcoat: .02
        }));
      } else {
        mats.set(key, new THREE.MeshStandardMaterial({
          color: hex, roughness: shiny?.19:.76, metalness: shiny?.03:0
        }));
      }
    }
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
  const shapes={
    mochi:{body:[.46,.48,.44],head:[.44,.42,.42],belly:[.32,.38,.12]},
    hop:{body:[.44,.54,.38],head:[.48,.48,.44],belly:[.32,.42,.11]},
    bunny:{body:[.47,.58,.39],head:[.49,.49,.45],belly:[.33,.43,.11]},
    unicorn:{body:[.49,.62,.43],head:[.59,.56,.50],belly:[.37,.49,.13]},
    horse:{body:[.48,.64,.41],head:[.57,.55,.49],belly:[.35,.48,.14]},
    cat:{body:[.42,.58,.36],head:[.62,.58,.52],belly:[.33,.44,.12]},
    dog:{body:[.50,.58,.42],head:[.65,.61,.56],belly:[.41,.47,.14]},
    penguin:{body:[.52,.68,.47],head:[.66,.62,.58],belly:[.46,.56,.14]},
    cow:{body:[.53,.60,.47],head:[.66,.60,.56],belly:[.47,.50,.14]}
  };
  const shape=shapes[id]||shapes.bunny;
  const torso=part(root,
    (id==='bunny'||id==='hop')?geometries.bunnyBody:geometries.softBody,
    coat,0,1.02,0,...shape.body);
  torso.name=id+'-smooth-body';
  const coatTexture=createCoatTexture(id,coat.color.getHex());
  if(coatTexture){
    torso.material=new THREE.MeshPhysicalMaterial({
      color:id==='mochi'?0x3fcf9f:0xffffff,
      map:coatTexture,
      roughness:id==='mochi'?.18:.9,
      metalness:id==='mochi'?.03:0,
      transmission:id==='mochi'?.42:0,
      ior:1.34,
      sheen:id==='mochi'?.85:.55,
      sheenRoughness:id==='mochi'?.35:.92,
      sheenColor:new THREE.Color(id==='mochi'?0x9effd9:0xffffff),
      clearcoat:id==='mochi'?.35:0
    });
  }
  torso.userData.coatPattern=COAT_PATTERNS[id]||'clean-cream';
  if(id==='dog'){
    const collar=part(root,geometries.torus,m(0xd95c71),0,1.39,0,.45,.45,.34);
    collar.name='dog-red-collar';
    collar.rotation.x=Math.PI/2;
    const tag=ell(root,gold,0,1.26,.46,.092,.10,.055);
    tag.name='dog-collar-tag';
  }
  const face=groupAt(root,0,(id==='bunny'||id==='hop')?1.77:id==='mochi'?1.68:1.82,.035);
  const head=ell(face,coat,0,0,0,...shape.head);
  head.name=id+'-distinct-head';
  const cuteFaceStyle=getCuteFaceStyle(id);
  const faceTexture=createCuteFaceTexture(id,coat.color.getHex());
  if(faceTexture){
    head.material=new THREE.MeshPhysicalMaterial({
      color:id==='mochi'?0x3fcf9f:0xffffff,
      map:faceTexture,
      roughness:id==='mochi'?.16:.86,
      metalness:id==='mochi'?.03:0,
      transmission:id==='mochi'?.40:0,
      ior:1.34,
      sheen:id==='mochi'?.85:.48,
      sheenRoughness:id==='mochi'?.35:.9,
      sheenColor:new THREE.Color(id==='mochi'?0x9effd9:0xffffff),
      clearcoat:id==='mochi'?.4:.015
    });
  }
  head.userData.cuteFace={
    eyeStyle:FACE_EYE_STYLE,iris:cuteFaceStyle.iris,
    blush:cuteFaceStyle.blush,painted:!!faceTexture
  };
  let mochiSprout=null;
  if(id==='mochi'){
    // Wobnimo Mochi signature propeller sprout
    mochiSprout=groupAt(face,0,.46,-.02);
    mochiSprout.name='mochi-sprout';
    part(mochiSprout,geometries.cylinder,m(0x4cb330),0,.07,0,.028,.15,.028);
    const leafL=ell(mochiSprout,m(0x5bbf3a),-.11,.15,0,.11,.026,.055,.28);
    leafL.rotation.y=.35;
    const leafR=ell(mochiSprout,m(0x5bbf3a),.11,.15,0,.11,.026,.055,-.28);
    leafR.rotation.y=-.35;
    // 3D blushing cheek discs for extra cute depth
    ell(face,m(0xff8fa8),-.24,-.06,.34,.065,.04,.022);
    ell(face,m(0xff8fa8),.24,-.06,.34,.065,.04,.022);
  }
  if(id==='penguin'){
    const beak=ell(face,m(0xf5bf54),0,-.20,.575,.13,.085,.075);
    beak.name='penguin-soft-beak';
  }
  const ears=[];
  for(const side of [-1,1]){
    if(id==='hop'){
      // Wobnimo Hop floppy bunny ears
      const ear=groupAt(face,side*.34,.28,-.03);
      ear.name=side<0?'hop-left-floppy-ear':'hop-right-floppy-ear';
      const outer=new THREE.Mesh(
        createSoftEarGeometry({height:1.05,width:.31,depth:.14,flop:side*.14}),
        coat
      );
      outer.rotation.z=Math.PI-side*.25;
      outer.position.set(side*.14,-.22,-.04);
      outer.castShadow=true;ear.add(outer);
      const inner=new THREE.Mesh(
        createSoftEarGeometry({height:.72,width:.17,depth:.03}),
        m(0xffc2d3)
      );
      inner.rotation.z=Math.PI-side*.25;
      inner.position.set(side*.14,-.22,-.01);
      ear.add(inner);
      ears.push(ear);
    }else if(id==='bunny'){
      const ear=groupAt(face,side*.32,.37,-.055);
      ear.name=side<0?'bunny-left-ear':'bunny-right-ear';
      const outer=new THREE.Mesh(
        createSoftEarGeometry({height:1.11,width:.305,depth:.16}),
        coat
      );
      outer.name='bunny-sculpted-ear';
      outer.position.x=side*.02;
      outer.rotation.z=-side*.075;
      outer.castShadow=true;outer.receiveShadow=true;ear.add(outer);
      for(const direction of [-1,1]){
        const inset=new THREE.Mesh(
          createSoftEarGeometry({height:.81,width:.157,depth:.028}),
          m(0xf2b8cb)
        );
        inset.position.set(side*.02,.17,direction*.101);
        inset.rotation.z=-side*.075;
        inset.name='bunny-pink-inner-ear';
        ear.add(inset);
      }
      ears.push(ear);
    }else if(id==='unicorn'||id==='horse'||id==='cat'){
      const ear=groupAt(face,side*(id==='cat'?.46:.39),id==='cat'?.47:.42,-.04);
      ear.name=id+'-'+(side<0?'left':'right')+'-ear';
      const isCat=id==='cat';
      const shape=new THREE.Mesh(createRoundedTriangleGeometry({
        width:isCat?.41:.31,height:isCat?.52:.41,depth:.15
      }),coat);
      shape.rotation.z=-side*.18;
      shape.castShadow=true;ear.add(shape);
      const pink=new THREE.Mesh(createRoundedTriangleGeometry({
        width:isCat?.20:.16,height:isCat?.33:.26,depth:.02
      }),m(0xf6b4c8));
      pink.position.set(0,.085,.11);
      pink.rotation.z=-side*.18;
      ear.add(pink);
      const backPink=pink.clone();
      backPink.position.z=-.11;
      ear.add(backPink);
      ears.push(ear);
    }else if(id==='dog'){
      const ear=groupAt(face,side*.54,.28,-.03);
      ear.name=side<0?'dog-left-floppy-ear':'dog-right-floppy-ear';
      const outer=new THREE.Mesh(createSoftEarGeometry({height:.86,width:.35,depth:.18,flop:side*.08}),m(0xb78156));
      outer.rotation.z=Math.PI-side*.20;
      outer.position.set(side*.15,-.03,-.03);
      outer.castShadow=true;ear.add(outer);
      const inner=new THREE.Mesh(createSoftEarGeometry({height:.54,width:.17,depth:.03}),m(0xe9bb95));
      inner.rotation.z=Math.PI-side*.20;
      inner.position.set(side*.15,-.16,-.11);
      ear.add(inner);
      ears.push(ear);
    }else if(id==='cow'){
      const ear=groupAt(face,side*.58,.30,-.06);
      ear.name=side<0?'cow-left-ear':'cow-right-ear';
      ell(ear,coat,side*.12,.03,0,.26,.17,.18,side*.14);
      ell(ear,m(0xf6bfd0),side*.14,.03,.15,.16,.10,.05);
      ell(ear,m(0xf9cddd),side*.14,.03,-.15,.16,.10,.05);
      ears.push(ear);
      const horn=ell(face,ivory,side*.25,.58,-.03,.08,.13,.08);
      horn.name='cow-small-horn';
    }
  }
  if(id==='hop'){
    ell(face,m(0xffb3c8),-.25,-.08,.36,.06,.038,.02);
    ell(face,m(0xffb3c8),.25,-.08,.36,.06,.038,.02);
  }
  if(id==='unicorn'){
    const horn=triangle(face,gold,0,.84,-.035,.165,.73);
    horn.name='unicorn-golden-horn';
    const tip=triangle(face,m(0xfff3ad,true),0,1.10,-.05,.078,.27);
    tip.rotation.z=.12;
    const pastel=[0xf79cc7,0xaedbff,0xffdc90,0xcba5f9,0x9bdfd2];
    for(let i=0;i<7;i++){
      const x=-.36+i*.12;
      ell(face,m(pastel[i%5]),x,.52-(i%3)*.06,.17,.15,.24,.21,(i-3)*.1);
    }
    for(const side of [-1,1]){
      const wing=groupAt(root,side*.49,1.11,-.25);
      wing.name=side<0?'unicorn-left-wing':'unicorn-right-wing';
      ell(wing,m(0xfbe8ff),side*.23,.10,-.08,.17,.34,.12,side*.52);
      ell(wing,m(0xe7d5ff),side*.34,.13,-.15,.08,.23,.06,side*.63);
    }
  }
  if(id==='horse'){
    const maneMat=m(0x80513d);
    for(let i=0;i<5;i++)
      ell(face,maneMat,-.26+i*.13,.49+(i%2)*.025,-.10,
        .085,.16,.09,(i-2)*-.09);
  }
  if(id==='cat'){
    const whiskMat=m(0xf4e7d9);
    for(const side of [-1,1])for(let i=-1;i<=1;i++){
      const whisker=part(face,geometries.cylinder,whiskMat,
        side*.51,-.29+i*.08,.28,.006,.27,.006);
      whisker.rotation.z=Math.PI/2+side*i*.14;
    }
  }
  const shoulderWidth={
    mochi:.36,hop:.38,bunny:.39,unicorn:.46,horse:.45,cat:.37,dog:.45,penguin:.43,cow:.50
  }[id]??.43;
  const pivotL=groupAt(root,-shoulderWidth,1.32,0);
  const pivotR=groupAt(root,shoulderWidth,1.32,0);
  for(const side of [-1,1]){
    const pivot=side===-1?pivotL:pivotR;
    if(id==='mochi'){
      // Chubby little jelly nubs
      part(pivot,geometries.sphere,coat,side*.02,-.18,.05,.12,.13,.12);
    }else if(id==='penguin'){
      const flipper=part(pivot,geometries.softLimb,coat,
        side*.12,-.26,-.02,.15,.28,.11,-side*.22);
      flipper.name='penguin-flipper';
    }else if(id==='bunny'||id==='hop'){
      const paw=part(pivot,geometries.softLimb,coat,
        side*.008,-.24,.025,.135,.29,.135,-side*.13);
      paw.name=id+'-slim-front-leg';
    }else{
      const thickness=id==='cat'?.15:id==='horse'?.16:id==='dog'?.17:.18;
      const arm=part(pivot,geometries.softLimb,coat,
        side*.05,(id==='dog'||id==='cat')?-.25:-.29,.035,thickness,(id==='dog'||id==='cat')?.30:.35,(id==='dog'||id==='cat')?.16:.17,-side*.10);
      arm.name=id+'-soft-front-leg';
    }
  }
  const feet=[];
  for(const side of [-1,1]){
    const rearFacing=id==='bunny'||id==='hop'||id==='horse'||id==='cow'||id==='dog';
    const foot=groupAt(root,side*(id==='mochi'?.22:id==='bunny'||id==='hop'?.285:.31),.46,rearFacing?-.15:.04);
    foot.name=id+'-'+(side<0?'left':'right')+'-hind-foot';
    if(id==='mochi'){
      ell(foot,coat,0,-.16,.06,.15,.12,.18);
    }else if(id==='bunny'||id==='hop'){
      ell(foot,coat,0,-.18,-.055,.19,.27,.17);
      const toe=ell(foot,m(0xfff4ec),0,-.37,-.33,.22,.095,.30);
      toe.name=id+'-oval-toe';
      for(const dx of [-.11,.11])
        ell(foot,m(0xeebccc),dx,-.375,-.59,.06,.032,.03);
    }else if(id==='penguin'){
      ell(foot,coat,0,-.18,.02,.18,.21,.16);
      const flipperFoot=ell(foot,m(0xf5bf54),0,-.34,-.12,.30,.12,.32);
      flipperFoot.name='penguin-orange-foot';
    }else{
      const hoof=id==='cow'?m(0x74626d):id==='horse'?brown:id==='cat'?m(0xffe0b0):id==='dog'?m(0xfff6ea):ivory;
      ell(foot,coat,0,id==='cow'?-.19:id==='dog'?-.20:-.22,0,id==='cow'?.22:id==='dog'?.22:.21,id==='cow'?.24:id==='dog'?.25:.29,id==='cow'?.18:id==='dog'?.19:.20);
      ell(foot,hoof,0,id==='cow'?-.34:id==='dog'?-.35:-.40,id==='cow'?-.16:id==='dog'?-.17:-.20,id==='cow'?.24:id==='dog'?.24:.23,id==='cow'?.11:id==='dog'?.12:.115,id==='cow'?.24:id==='dog'?.26:.31);
    }
    feet.push(foot);
  }
  const tail=groupAt(root,(id==='bunny'||id==='hop'||id==='mochi')?0:.28,(id==='bunny'||id==='hop'||id==='mochi')?.91:1.04,(id==='bunny'||id==='hop'||id==='mochi')?-.51:-.49);
  if(id==='bunny'||id==='hop'){
    const cotton=ell(tail,m(0xfff3ec),0,.02,-.19,.16,.17,.15);
    cotton.name=id+'-cotton-tail';
  }else if(id==='mochi'){
    const bump=ell(tail,coat,0,-.06,-.08,.11,.11,.09);
    bump.name='mochi-jelly-bump';
  }else if(id==='unicorn'||id==='horse'){
    const shades=id==='unicorn'?[0xffaacc,0x9bd7ff,0xffe39d,0xd2b8fc,0x9ae2d4]:[0x805340,0x96664c,0xb98a6a];
    for(let i=0;i<shades.length;i++)
      ell(tail,m(shades[i]),(i-2)*.057,-.18-i*.053,-.14,.10,.36,.13,-.26);
  }else if(id==='cat'){
    const curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,-.12,-.02),
      new THREE.Vector3(.25,.02,-.12),
      new THREE.Vector3(.42,.36,-.15),
      new THREE.Vector3(.45,.65,-.15),
      new THREE.Vector3(.31,.80,-.15)
    ]);
    const stripeGeo=new THREE.TubeGeometry(curve,28,.107,10,false);
    const catStem=new THREE.Mesh(stripeGeo,coat);
    catStem.name='cat-curved-tail';
    catStem.castShadow=true;tail.add(catStem);
    const tip=ell(tail,m(0xbb783e),.31,.80,-.15,.13,.15,.13);
    tip.name='cat-tail-tip';
    for(let i=0;i<3;i++)
      ell(tail,m(0xb8773c),.30+i*.045,.10+i*.18,-.237,.095,.045,.038,-.28);
  }else if(id==='dog'){
    ell(tail,coat,.16,.10,-.08,.12,.24,.10,-.38);
    ell(tail,coat,.28,.28,-.07,.10,.13,.10);
  }else if(id==='cow')ell(tail,coat,.11,-.11,-.10,.08,.24,.08,-.22);
  else if(id!=='penguin')ell(tail,coat,0,-.12,0,.19,.24,.21);

  const rear=groupAt(root,0,0,0);
  rear.name='character-rear-design-'+id;
  if(id==='bunny'||id==='hop'){
    const dressBack=groupAt(rear,0,.99,-.44);
    dressBack.name=id+'-dress-back';
    ell(dressBack,m(0xffe7ed),0,0,0,.29,.055,.06);
    const flower=groupAt(dressBack,.29,.015,-.095);
    flower.scale.setScalar(.6);
    flower.name=id+'-dress-flower';
    for(let j=0;j<5;j++){
      const angle=j*Math.PI*2/5;
      ell(flower,m(0xfff7ff),Math.cos(angle)*.076,Math.sin(angle)*.076,0,.053,.059,.025);
    }
    ell(flower,m(0xffcd62),0,0,-.03,.043,.043,.026);
  }else if(id==='unicorn'){
    const mane=groupAt(rear,0,1.68,-.44);
    mane.name='unicorn-rainbow-mane';
    const rainbow=[0xffa9d0,0xc4a8fa,0x9bd7fc,0xffe1a3,0xace3cc];
    for(let i=0;i<13;i++){
      const stripe=i%5,layer=Math.floor(i/5);
      const x=-.30+stripe*.15+(layer%2)*.042;
      const y=.58-layer*.23-(i%3)*.023;
      const tuft=ell(mane,m(rainbow[stripe]),x,y,-.09,.079,.25+layer*.022,.102,(stripe-2)*-.11);
      tuft.name='unicorn-mane-strand';
    }
    for(let i=0;i<5;i++)
      ell(mane,m(rainbow[i]),(i-2)*.14,-.32-(i%2)*.08,-.12,.075,.30,.094,(i-2)*-.10);
    ell(rear,m(0xa587e3,true),0,1.36,-.64,.15,.16,.075);
    ell(rear,m(0xffe0aa,true),0,1.37,-.70,.08,.08,.055);
  }else if(id==='horse'){
    const mane=groupAt(rear,0,1.81,-.48);
    mane.name='horse-pony-mane';
    const shades=[0x72452f,0x8d5a3c,0xa36b47,0x684230];
    for(let i=0;i<11;i++){
      const x=-.29+(i%5)*.145;
      const y=.35-Math.floor(i/5)*.23;
      const strand=ell(mane,m(shades[i%shades.length]),
        x,y,-.08,.085,.24+Math.floor(i/5)*.025,.095,(i%5-2)*-.11);
      strand.name='horse-mane-lock';
    }
    const blanket=groupAt(rear,0,.94,-.47);
    blanket.name='horse-pony-blanket';
    ell(blanket,m(0xffe5c9),0,0,0,.46,.19,.14);
    for(const side of [-1,1]){
      ell(blanket,m(0xe0a790),side*.37,-.11,-.07,.10,.27,.12,side*.18);
    }
  }else if(id==='cat'){
    const scarf=groupAt(rear,0,1.25,-.49);
    scarf.name='cat-red-scarf';
    scarf.scale.setScalar(.58);
    ell(scarf,m(0xd82d43),0,0,0,.47,.14,.23);
    for(const side of [-1,1])ell(scarf,m(0xf04b63),side*.18,-.13,-.19,.20,.13,.11,side*.35);
    ell(scarf,m(0xffdcb4),0,-.1,-.27,.09,.09,.07);
  }else if(id==='dog'){
    const rearCollar=ell(rear,m(0xe78cab),0,1.30,-.48,.50,.11,.16);
    rearCollar.name='dog-collar-back';
    const tag=ell(rear,m(0xffd478),0,1.18,-.63,.11,.12,.06);
    tag.name='dog-gold-tag';
    const patch=ell(rear,m(0xfaf3e8),0,.88,-.63,.20,.16,.08);
    patch.name='dog-back-patch';
    const badge=groupAt(rear,0,.70,-.64);
    badge.name='dog-paw-badge';
    ell(badge,m(0xf3a2b2),0,0,0,.08,.08,.04);
    for(const [x,y] of [[-.08,.07],[.08,.07],[-.05,.15],[.05,.15]])ell(badge,m(0xf7bfd0),x,y,.01,.03,.04,.02);
  }else if(id==='cow'){
    const bow=groupAt(face,.25,.57,-.22);
    bow.name='cow-red-head-bow';
    const ribbon=m(0xd92746);
    ell(bow,ribbon,0,0,-.03,.105,.11,.07);
    for(const side of [-1,1]){
      ell(bow,ribbon,side*.15,.03,0,.16,.115,.065,-side*.25);
      ell(bow,m(0xf34b65),side*.11,-.12,0,.075,.13,.045,side*.2);
    }
    const tailTip=ell(tail,m(0x39363e),.10,-.30,-.09,.09,.14,.09,-.24);
    tailTip.name='cow-tail-tuft';
  }
  const mane=id==='unicorn'?root.getObjectByName('unicorn-rainbow-mane')
    :id==='horse'?root.getObjectByName('horse-pony-mane'):null;
  const wings=id==='unicorn'
    ? [root.getObjectByName('unicorn-left-wing'),root.getObjectByName('unicorn-right-wing')]
    : null;
  const catTail=id==='cat'?tail:null;
  const dogEars=id==='dog'?ears:null;
  const dogTail=id==='dog'?tail:null;
  const cowTail=id==='cow'?tail:null;
  const cowEars=id==='cow'?ears:null;
  return {id,group:root,pivotL,pivotR,feet,ears,tail,face,torso,
    headRestY:face.position.y,bodyRestY:torso.position.y,
    sprout:mochiSprout,
    mane,wings,catTail,dogEars,dogTail,cowTail,cowEars};
}

// Character animation uses bones/groups, not just translating a static drawing.
export function animateAnimal(actor, t, moving=true, airborne=false) {
  const pace=moving?1:0;
  const tempo={
    mochi:12,hop:11,bunny:11,unicorn:13,horse:15,cat:16,dog:13,penguin:10,cow:11
  }[actor.id]||14;
  const step=Math.sin(t*tempo);
  const bunnyHop=actor.id==='bunny'||actor.id==='hop'||actor.id==='mochi';
  const armSwing=actor.id==='penguin'?.58:bunnyHop?.24:.39;
  actor.pivotL.rotation.x=step*armSwing*pace;
  actor.pivotR.rotation.x=-step*armSwing*pace;
  if(actor.feet)for(let i=0;i<actor.feet.length;i++){
    actor.feet[i].rotation.x=bunnyHop
      ?step*.32*pace
      :step*(i===0?-1:1)*(actor.id==='penguin'?.28:.49)*pace;
  }
  if(actor.torso)actor.torso.position.y=actor.bodyRestY+
    (bunnyHop?Math.abs(Math.sin(t*tempo*.5))*.045:.015*Math.abs(step))*pace;
  if(actor.face)actor.face.position.y=actor.headRestY+
    (bunnyHop?Math.abs(Math.sin(t*tempo*.5))*.048:.014*Math.abs(step))*pace;
  // Mochi squash-and-stretch and propeller sprout
  if(actor.id==='mochi'){
    const hopScale=Math.sin(t*tempo);
    if(actor.torso){
      actor.torso.scale.y=1+hopScale*.12*pace;
      actor.torso.scale.x=1-hopScale*.06*pace;
      actor.torso.scale.z=1-hopScale*.06*pace;
    }
    if(actor.face){
      actor.face.scale.y=1+hopScale*.10*pace;
      actor.face.scale.x=1-hopScale*.05*pace;
      actor.face.scale.z=1-hopScale*.05*pace;
    }
    if(actor.sprout){
      actor.sprout.rotation.y+=moving?.25:.04;
      actor.sprout.rotation.z=Math.sin(t*8)*.12*pace;
    }
  }
  // Hop ears bounce and swing
  if(actor.id==='hop'&&actor.ears){
    for(let i=0;i<actor.ears.length;i++){
      const side=i===0?-1:1;
      actor.ears[i].rotation.z=side*(.26+Math.sin(t*11+i*.8)*.22*pace);
      actor.ears[i].rotation.x=Math.sin(t*10+i*.7)*.18*pace;
    }
  }
  if(actor.ears&&actor.id!=='hop')for(let i=0;i<actor.ears.length;i++)actor.ears[i].rotation.z=Math.sin(t*7+i)*.075*pace;
  if(actor.tail)actor.tail.rotation.x=Math.sin(t*9)*.16*pace;
  if(actor.catTail)actor.catTail.rotation.z=Math.sin(t*5+.7)*.22*pace;
  if(actor.cowTail){
    actor.cowTail.rotation.y=Math.sin(t*7.6+.3)*.38*pace;
    actor.cowTail.rotation.z=Math.sin(t*6.4)*.13*pace;
  }
  if(actor.cowEars)for(let i=0;i<actor.cowEars.length;i++){
    const side=i===0?-1:1;
    actor.cowEars[i].rotation.z=side*(.04+.065*Math.sin(t*6+i))*pace;
  }
  if(actor.dogTail){
    actor.dogTail.rotation.y=Math.sin(t*12)*.41*pace;
    actor.dogTail.rotation.z=Math.sin(t*8+.9)*.19*pace;
  }
  if(actor.dogEars)for(let i=0;i<actor.dogEars.length;i++){
    const side=i===0?-1:1;
    actor.dogEars[i].rotation.z=side*(.13+Math.sin(t*11+i*.9)*.20*pace);
    actor.dogEars[i].rotation.x=Math.sin(t*10+i*.8)*.11*pace;
  }
  if(actor.face)actor.face.rotation.z=Math.sin(t*7)*.026*pace;
  if(actor.mane){
    actor.mane.rotation.z=Math.sin(t*6)*.052*pace;
    actor.mane.rotation.x=Math.sin(t*8+.7)*.045*pace;
  }
  if(actor.wings)for(let i=0;i<actor.wings.length;i++){
    const wing=actor.wings[i];
    if(wing)wing.rotation.z=(i===0?-1:1)*(.06+.095*Math.sin(t*9))*pace;
  }
  actor.group.rotation.z=Math.sin(t*(actor.id==='penguin'?9:12))*
    (actor.id==='penguin'?.057:.022)*pace;
  actor.group.scale.y=airborne?1.04:1;
}

// Correct the rendered feet against the actual road surface *after* pose and scale.
const contactBounds=new THREE.Box3();
export function alignAnimalFeetToRoad(actor,roadY,jumpHeight=0){
 if(!actor?.feet?.length||!Number.isFinite(roadY))return;
 actor.group.updateMatrixWorld(true);
 let lowest=Infinity;
 for(const foot of actor.feet){
  contactBounds.setFromObject(foot);
  if(Number.isFinite(contactBounds.min.y))lowest=Math.min(lowest,contactBounds.min.y);
 }
 if(Number.isFinite(lowest)){
  actor.group.position.y+=roadY+Math.max(0,jumpHeight)-lowest;
  actor.group.updateMatrixWorld(true);
 }
}
