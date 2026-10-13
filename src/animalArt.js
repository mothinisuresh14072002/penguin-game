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
    // A gently pear-shaped sculpt, not a stack of round puffballs. Bunny
    // shoulders narrow naturally into rounder hips, like the reference.
    bunnyBody: new THREE.LatheGeometry([
      new THREE.Vector2(0,-1),new THREE.Vector2(.48,-.98),
      new THREE.Vector2(.86,-.78),new THREE.Vector2(1,-.45),
      new THREE.Vector2(.96,-.1),new THREE.Vector2(.81,.47),
      new THREE.Vector2(.63,.83),new THREE.Vector2(0,1)
    ],28),
    // Shared clean, pear-like trunk for the remaining chibi animals.
    // Colour, width, height, ears, paws and tails create species identity.
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
    // Single seamless tapered limb surface with a broad shoulder and
    // rounded paw. Avoid adjoining sphere/sphere seams on each front leg.
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
    bunny:0xfffaf5, unicorn:0xf9f4ff, horse:0xc58b60, cat:0xf5a94f,
    dog:0xf4dcac, penguin:0x222936, cow:0xfffcf5
  };
  const mats = new Map();
  function m(hex, shiny=false) {
    const key = String(hex) + (shiny?'s':'m');
    if (!mats.has(key)) mats.set(key,(id==='bunny'||id==='unicorn'||id==='horse'||id==='cat'||id==='dog'||id==='penguin'||id==='cow')&&!shiny
      ? new THREE.MeshPhysicalMaterial({
         color:hex,roughness:.88,metalness:0,
         sheen:.65,sheenRoughness:.85,sheenColor:new THREE.Color(id==='unicorn'?0xeddaff:id==='horse'?0xffdcaa:id==='cat'?0xffd9b2:id==='dog'?0xffedc9:id==='penguin'?0xaac9ea:id==='cow'?0xffecf6:0xffe9e2),
         clearcoat:.02
        })
      : new THREE.MeshStandardMaterial({
         color:hex,roughness:shiny?.19:.76,metalness:shiny?.03:0
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
  // Species-specific proportions prevent seven animals from looking like
  // identical stacks of balls. The camera sees their rear profiles.
  const shapes={
    bunny:{body:[.48,.59,.39],head:[.47,.47,.43],belly:[.33,.43,.11]},
    unicorn:{body:[.50,.67,.44],head:[.53,.52,.46],belly:[.37,.49,.13]},
    horse:{body:[.49,.69,.42],head:[.50,.52,.45],belly:[.35,.48,.14]},
    cat:{body:[.40,.59,.35],head:[.53,.51,.46],belly:[.30,.43,.12]},
    dog:{body:[.51,.61,.43],head:[.57,.55,.49],belly:[.39,.46,.14]},
    penguin:{body:[.48,.75,.43],head:[.54,.50,.46],belly:[.41,.56,.14]},
    cow:{body:[.56,.62,.48],head:[.59,.53,.49],belly:[.45,.49,.14]}
  };
  const shape=shapes[id]||shapes.bunny;
  const torso=part(root,
    id==='bunny'?geometries.bunnyBody:geometries.softBody,
    coat,0,1.02,0,...shape.body);
  torso.name=id+'-smooth-body';
  const coatTexture=createCoatTexture(id,coat.color.getHex());
  if(coatTexture)torso.material=new THREE.MeshPhysicalMaterial({
    color:0xffffff,map:coatTexture,roughness:.9,metalness:0,
    sheen:.55,sheenRoughness:.92
  });
  torso.userData.coatPattern=COAT_PATTERNS[id]||'clean-cream';
  if(id==='dog'){
    // A tiny collar is an intentional accessory, unlike raised fur patches.
    const collar=part(root,geometries.torus,m(0xd95c71),
      0,1.39,0,.45,.45,.34);
    collar.name='dog-red-collar';
    collar.rotation.x=Math.PI/2;
    const tag=ell(root,gold,0,1.26,.46,.092,.10,.055);
    tag.name='dog-collar-tag';
  }
  // Belly is visually part of the torso and no longer a raised plush disc.
  // The coat map gives Cow, Cat, Horse, Dog etc their markings.
  const face=groupAt(root,0,id==='bunny'?1.77:1.82,.035);
  const head=ell(face,coat,0,0,0,...shape.head);
  head.name=id+'-distinct-head';
  // Paint the eyes, cheeks, nose, smile and species markings onto the head.
  // No stacked eyeball or muzzle spheres projecting through one another.
  const cuteFaceStyle=getCuteFaceStyle(id);
  const faceTexture=createCuteFaceTexture(id,coat.color.getHex());
  if(faceTexture){
    head.material=new THREE.MeshPhysicalMaterial({
      color:0xffffff,map:faceTexture,roughness:.86,
      metalness:0,sheen:.48,sheenRoughness:.9,clearcoat:.015
    });
  }
  head.userData.cuteFace={
    eyeStyle:FACE_EYE_STYLE,iris:cuteFaceStyle.iris,
    blush:cuteFaceStyle.blush,painted:!!faceTexture
  };
  if(id==='penguin'){
    // One tiny three-dimensional beak remains a defining silhouette.
    const beak=triangle(face,peach,0,-.22,.44,.115,.18);
    beak.name='penguin-soft-beak';beak.rotation.x=Math.PI/2;
  }
  const ears=[];
  for(const side of [-1,1]){
    if(id==='bunny'){
      // Tall tapered rabbit ears attach to the skull, not a halo of fluff.
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
      // Two tiny, flush inset shapes are readable from the shop and the
      // rear-facing in-game camera without standing off as ear puffs.
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
      const ear=groupAt(face,side*(id==='cat'?.42:.39),.42,-.04);
      ear.name=id+'-'+(side<0?'left':'right')+'-ear';
      const isCat=id==='cat';
      const shape=new THREE.Mesh(createRoundedTriangleGeometry({
        width:isCat?.37:.31,height:isCat?.47:.41,depth:.14
      }),coat);
      shape.rotation.z=-side*.18;
      shape.castShadow=true;ear.add(shape);
      const pink=new THREE.Mesh(createRoundedTriangleGeometry({
        width:isCat?.18:.16,height:isCat?.30:.26,depth:.015
      }),m(0xf6b4c8));
      pink.position.set(0,.085,.11);
      pink.rotation.z=-side*.18;
      ear.add(pink);
      // Rear ear colour helps all three species read from behind.
      const backPink=pink.clone();
      backPink.position.z=-.11;
      ear.add(backPink);
      ears.push(ear);
    }else if(id==='dog'){
      // A single rounded hanging ear on each side, rather than three
      // overlapping circles, stays recognizable in the tiny rear camera.
      const ear=groupAt(face,side*.50,.27,-.02);
      ear.name=side<0?'dog-left-floppy-ear':'dog-right-floppy-ear';
      const outer=new THREE.Mesh(
        createSoftEarGeometry({height:.72,width:.31,depth:.17,flop:side*.05}),
        m(0xb78156)
      );
      outer.rotation.z=Math.PI-side*.27;
      outer.position.set(side*.13,-.015,-.025);
      outer.castShadow=true;ear.add(outer);
      const inner=new THREE.Mesh(
        createSoftEarGeometry({height:.46,width:.14,depth:.027}),
        m(0xe6b18b)
      );
      inner.rotation.z=Math.PI-side*.27;
      inner.position.set(side*.14,-.135,-.115);
      ear.add(inner);
      ears.push(ear);
    }else if(id==='cow'){
      const ear=groupAt(face,side*.61,.27,-.08);
      ear.name=side<0?'cow-left-ear':'cow-right-ear';
      ell(ear,coat,side*.14,.05,0,.30,.18,.19,side*.18);
      ell(ear,m(0xf5b1c0),side*.16,.05,.17,.18,.10,.045);
      // Inner ears are also visible from the runner's rear view.
      ell(ear,m(0xf9c1d0),side*.16,.05,-.18,.18,.10,.048);
      ears.push(ear);
      const horn=triangle(face,ivory,side*.28,.62,-.05,.14,.33);
      horn.name='cow-small-horn';
    }else if(id==='penguin'){
      // The forehead's little feather crest is readable in shop previews.
      if(side===1)for(let i=0;i<3;i++){
        const tuft=ell(face,coat,(i-1)*.13,.61,-.06,.12,.22,.13,(i-1)*-.2);
        tuft.name='penguin-crown-tuft';
      }
    }
  }
  if(id==='unicorn'){
    // Gold horn with subtle pearlescent winding bands visible in the shop
    // and from above in gameplay.
    const horn=triangle(face,gold,0,.84,-.035,.165,.73);
    horn.name='unicorn-golden-horn';
    const tip=triangle(face,m(0xfff3ad,true),0,1.10,-.05,.078,.27);
    tip.rotation.z=.12;
    const pastel=[0xf79cc7,0xaedbff,0xffdc90,0xcba5f9,0x9bdfd2];
    for(let i=0;i<7;i++){
      const x=-.36+i*.12;
      ell(face,m(pastel[i%5]),x,.52-(i%3)*.06,.17,.15,.24,.21,(i-3)*.1);
    }
    // Layered cloudlike wings extend beyond the silhouette from the back.
    for(const side of [-1,1]){
      const wing=groupAt(root,side*.49,1.11,-.25);
      wing.name=side<0?'unicorn-left-wing':'unicorn-right-wing';
      // A single leaf-shaped wing with a narrow coloured inner vane.
      ell(wing,m(0xfbe8ff),side*.23,.10,-.08,.17,.34,.12,side*.52);
      ell(wing,m(0xe7d5ff),side*.34,.13,-.15,.08,.23,.06,side*.63);
    }
  }
  if(id==='horse'){
    // A few flat locks blend into the head; the cream blaze is painted.
    const maneMat=m(0x80513d);
    for(let i=0;i<5;i++)
      ell(face,maneMat,-.26+i*.13,.49+(i%2)*.025,-.10,
        .085,.16,.09,(i-2)*-.09);
  }
  if(id==='cat'){
    // Delicate whiskers provide depth; stripes, irises and blush are
    // pigment on the head surface, not protruding spheres.
    const whiskMat=m(0xf4e7d9);
    for(const side of [-1,1])for(let i=-1;i<=1;i++){
      const whisker=part(face,geometries.cylinder,whiskMat,
        side*.51,-.29+i*.08,.28,.006,.27,.006);
      whisker.rotation.z=Math.PI/2+side*i*.14;
    }
  }
  // Shoulders are inside the body's silhouette: no floating side pom-poms.
  const shoulderWidth={
    bunny:.39,unicorn:.46,horse:.45,cat:.37,dog:.45,penguin:.43,cow:.50
  }[id]??.43;
  const pivotL=groupAt(root,-shoulderWidth,1.32,0);
  const pivotR=groupAt(root,shoulderWidth,1.32,0);
  for(const side of [-1,1]){
    const pivot=side===-1?pivotL:pivotR;
    if(id==='penguin'){
      // One tapered flipper mesh: no second dark round piece at the tip.
      const flipper=part(pivot,geometries.softLimb,coat,
        side*.18,-.31,-.035,.19,.37,.13,-side*.40);
      flipper.name='penguin-flipper';
    }else if(id==='bunny'){
      // Shoulder broadens into one rounded paw with no visible segment
      // joining two ball shapes.
      const paw=part(pivot,geometries.softLimb,coat,
        side*.008,-.24,.025,.135,.29,.135,-side*.13);
      paw.name='bunny-slim-front-leg';
    }else{
      const thickness=id==='cat'?.16:id==='horse'?.16:.18;
      const arm=part(pivot,geometries.softLimb,coat,
        side*.06,-.29,.035,thickness,.35,.17,-side*.12);
      arm.name=id+'-soft-front-leg';
    }
  }
  const feet=[];
  for(const side of [-1,1]){
    const rearFacing=id==='bunny'||id==='horse'||id==='cow'||id==='dog';
    const foot=groupAt(root,side*(id==='bunny'?.285:.31),.46,rearFacing?-.15:.04);
    foot.name=id+'-'+(side<0?'left':'right')+'-hind-foot';
    if(id==='bunny'){
      // Exaggerated *long* bunny hind feet, two clearly separate shapes.
      ell(foot,coat,0,-.18,-.055,.19,.27,.17);
      const toe=ell(foot,m(0xfff4ec),0,-.37,-.33,.22,.095,.30);
      toe.name='bunny-oval-toe';
      for(const dx of [-.11,.11])
        ell(foot,m(0xeebccc),dx,-.375,-.59,.06,.032,.03);
    }else if(id==='penguin'){
      ell(foot,coat,0,-.22,.02,.20,.26,.18);
      const flipperFoot=ell(foot,peach,0,-.40,-.16,.26,.10,.36);
      flipperFoot.name='penguin-orange-foot';
    }else{
      const hoof=id==='cow'?m(0x62505a):id==='horse'?brown:id==='cat'?m(0xffcf91):ivory;
      ell(foot,coat,0,-.22,0,id==='cow'?.245:.21,.29,.20);
      ell(foot,hoof,0,-.40,-.20,id==='cow'?.26:.23,.115,.31);
    }
    feet.push(foot);
  }
  const tail=groupAt(root,id==='bunny'?0:.28,id==='bunny'?.91:1.04,id==='bunny'?-.51:-.49);
  if(id==='bunny'){
    const cotton=ell(tail,m(0xfff3ec),0,.02,-.19,.16,.17,.15);
    cotton.name='bunny-cotton-tail';
  }
  else if(id==='unicorn'||id==='horse'){
    const shades=id==='unicorn'?[0xffaacc,0x9bd7ff,0xffe39d,0xd2b8fc,0x9ae2d4]:[0x805340,0x96664c,0xb98a6a];
    for(let i=0;i<shades.length;i++)
      ell(tail,m(shades[i]),(i-2)*.057,-.18-i*.053,-.14,.10,.36,.13,-.26);
  }else if(id==='cat'){
    // A slender, continuously curving cat tail with a clear hook at the
    // tip. It reads as a cat silhouette rather than an extra rear leg.
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
    ell(tail,coat,.20,.18,-.07,.15,.35,.12,-.45);
    ell(tail,coat,.38,.44,-.06,.12,.16,.12);
  }else if(id==='cow')ell(tail,coat,.15,-.17,-.12,.10,.36,.10,-.30);
  else ell(tail,coat,0,-.12,0,.19,.24,.21);

  // Rear-view artwork matters in an endless runner: the camera looks at -Z
  // because the hero is turned toward -Z. These features sit on the *back*
  // surface, not the forward-facing eyes, so every animal stays identifiable.
  const rear=groupAt(root,0,0,0);
  rear.name='character-rear-design-'+id;
  if(id==='bunny'){
    // One clean pear-shaped back with rounded hips. The user's rear-view
    // reference is a rabbit, not a cloud of overlapping cotton balls.
    // Only a very thin colour-free back contour, not a second bulging
    // torso. The real pear mesh already defines the rabbit's whole back.
    // Pear torso itself forms the rounded rabbit hips, without glued balls.
    // Small, flat pastel waist ribbon, not a scalloped pom-pom dress.
    const dressBack=groupAt(rear,0,.99,-.44);
    dressBack.name='bunny-dress-back';
    ell(dressBack,m(0xffe7ed),0,0,0,.29,.055,.06);
    const flower=groupAt(dressBack,.29,.015,-.095);
    flower.scale.setScalar(.6);
    flower.name='bunny-dress-flower';
    for(let j=0;j<5;j++){
      const angle=j*Math.PI*2/5;
      ell(flower,m(0xfff7ff),Math.cos(angle)*.076,Math.sin(angle)*.076,0,.053,.059,.025);
    }
    ell(flower,m(0xffcd62),0,0,-.03,.043,.043,.026);
  }else if(id==='unicorn'){
    // The camera sees the BACK, so the mane must read like soft
    // cascading pastel hair and not disappear behind the head.
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
    // Five longer hair tips flow rather than stacking another eight blobs.
    for(let i=0;i<5;i++)
      ell(mane,m(rainbow[i]),(i-2)*.14,-.32-(i%2)*.08,-.12,.075,.30,.094,(i-2)*-.10);
    // Tiny iridescent clasp; no extra marshmallow shape under the hair.
    ell(rear,m(0xa587e3,true),0,1.36,-.64,.15,.16,.075);
    ell(rear,m(0xffe0aa,true),0,1.37,-.70,.08,.08,.055);
    // Rear-facing ear insets complement the shop-facing detail.
    // Rear-visible pink ear interiors are already sculpted into the ears.
  }else if(id==='horse'){
    // A recognisable baby pony from behind: cream rump, rounded haunches,
    // long dark mane and soft fetlocks all read at small runner scale.
    // Cream rump and dorsal highlights are painted into the coat texture.
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
    // Decorative saddlecloth in muted pastoral cream and dusty rose.
    const blanket=groupAt(rear,0,.94,-.47);
    blanket.name='horse-pony-blanket';
    ell(blanket,m(0xffe5c9),0,0,0,.46,.19,.14);
    for(const side of [-1,1]){
      ell(blanket,m(0xe0a790),side*.37,-.11,-.07,.10,.27,.12,side*.18);
    }
  }else if(id==='cat'){
    const tabby=groupAt(rear,0,1.65,-.45);
    tabby.name='cat-tabby-back';
    // Orange tabby stripes are painted onto the seamless torso surface.
    // A little lavender scarf with a clear bow on the back.
    const scarf=groupAt(rear,0,1.26,-.49);
    scarf.name='cat-lavender-scarf';
    scarf.scale.setScalar(.55); // Small accent, not a giant accessory around the kitten
    ell(scarf,m(0xceaadf),0,0,0,.47,.14,.23);
    for(const side of [-1,1])ell(scarf,m(0xe5c2ed),side*.18,-.13,-.19,
      .20,.13,.11,side*.35);
    ell(scarf,m(0xffdcb4),0,-.1,-.27,.09,.09,.07);
    // Sculpted kitten ears already have rear pink inner surfaces.
  }else if(id==='dog'){
    // Rounded cream haunches and plush shoulder tufts read well
    // from the small rear-view camera.
    // Cream shoulders and puppy markings are painted, not extra balls.
    const rearCollar=ell(rear,m(0xd95c71),0,1.31,-.48,.53,.11,.17);
    rearCollar.name='dog-collar-back';
    const tag=ell(rear,m(0xffd478),0,1.20,-.64,.12,.13,.065);
    tag.name='dog-gold-tag';
    // Small harness patch and heart make Dodo distinct from other pups.
    const badge=groupAt(rear,0,.92,-.65);
    badge.name='dog-park-heart';
    badge.scale.setScalar(.55);
    for(const side of [-1,1])ell(badge,m(0xf3a2b2),side*.09,.035,0,.10,.11,.06);
    const heart=ell(badge,m(0xeb7795),0,-.09,-.025,.15,.13,.06);
    heart.rotation.z=Math.PI/4;
  }else if(id==='penguin'){
    // Oversized soft charcoal head, pale feather trim and adorable ice-blue
    // scarf are designed for the behind-the-runner camera.
    const trim=m(0xd6f5ff);
    // Feather shading is baked into the coat; the scarf supplies the only
    // meaningful layered rear accessory.
    const scarf=groupAt(rear,0,1.36,-.48);
    scarf.name='penguin-blue-scarf';
    scarf.scale.setScalar(.52); // Keep the clean black-white penguin silhouette
    ell(scarf,m(0x83dafa),0,0,-.015,.51,.14,.18);
    ell(scarf,m(0x60bce8),-.34,-.27,-.15,.17,.34,.14,.11);
    ell(scarf,trim,-.36,-.55,-.17,.17,.08,.14);
    // Single stitched snowflake emblem stands out from the dark coat.
    const badge=groupAt(rear,.20,.81,-.61);
    badge.name='penguin-snowflake-badge';
    ell(badge,trim,0,0,0,.12,.12,.04);
    for(let k=0;k<6;k++){
      const a=k*Math.PI/3;
      ell(badge,m(0xb6ecff),Math.cos(a)*.17,Math.sin(a)*.17,-.015,.068,.067,.04);
    }
  }else if(id==='cow'){
    // Rounded black/charcoal markings arranged asymmetrically across a
    // plush white calf silhouette, all legible from behind.
    // Rounded charcoal calf spots now belong to the torso paint instead
    // of separate dark spheres floating off the white fur.
    const bow=groupAt(rear,0,1.29,-.54);
    bow.name='cow-pink-bow';
    bow.scale.setScalar(.48); // Small charm, not a distracting floating bow
    ell(bow,m(0xf5b4cc),0,0,0,.13,.15,.12);
    for(const side of [-1,1]){
      ell(bow,m(0xffcbdf),side*.19,.02,.018,.22,.16,.10,side*.34);
      ell(bow,m(0xf8abc9),side*.12,-.18,.018,.11,.19,.07,-side*.24);
    }
    const tailTip=ell(tail,m(0x39363e),.16,-.42,-.10,.11,.19,.12,-.34);
    tailTip.name='cow-tail-tuft';
    const tag=ell(rear,m(0xffdf85),0,.54,-.53,.12,.12,.075);
    tag.name='cow-gold-bell';
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
    mane,wings,catTail,dogEars,dogTail,cowTail,cowEars};
}

// Character animation uses bones/groups, not just translating a static drawing.
export function animateAnimal(actor, t, moving=true, airborne=false) {
  const pace=moving?1:0;
  const tempo={
    bunny:11,unicorn:13,horse:15,cat:16,dog:13,penguin:10,cow:11
  }[actor.id]||14;
  const step=Math.sin(t*tempo);
  const bunnyHop=actor.id==='bunny';
  // A rabbit hops with both rear feet, while kittens/ponies alternate.
  // Penguin flippers get a wider but slower little waddle.
  const armSwing=actor.id==='penguin'?.58:actor.id==='bunny'?.24:.39;
  actor.pivotL.rotation.x=step*armSwing*pace;
  actor.pivotR.rotation.x=-step*armSwing*pace;
  if(actor.feet)for(let i=0;i<actor.feet.length;i++){
    actor.feet[i].rotation.x=bunnyHop
      ?step*.32*pace
      :step*(i===0?-1:1)*(actor.id==='penguin'?.28:.49)*pace;
  }
  if(actor.torso)actor.torso.position.y=actor.bodyRestY+
    (bunnyHop?Math.abs(Math.sin(t*tempo*.5))*.042:.015*Math.abs(step))*pace;
  if(actor.face)actor.face.position.y=actor.headRestY+
    (bunnyHop?Math.abs(Math.sin(t*tempo*.5))*.045:.014*Math.abs(step))*pace;
  if(actor.ears)for(let i=0;i<actor.ears.length;i++)actor.ears[i].rotation.z=Math.sin(t*7+i)*.075*pace;
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
  // A little mane sway and wing flutter make the unicorn read as a living
  // character even from the small rear-view runner camera.
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
