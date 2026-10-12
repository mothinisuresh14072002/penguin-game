import * as THREE from 'three';

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
  const torso=id==='bunny'
    ?part(root,geometries.bunnyBody,coat,0,1.02,0,...shape.body)
    :ell(root,coat,0,1.01,0,...shape.body);
  torso.name=id+'-smooth-body';
  ell(root,belly,0,.97,shape.body[2]-.08,...shape.belly);
  if(id==='dog'){
    // Fluffy bib and actual red collar with a visible gold name tag.
    ell(root,m(0xfff8e6),0,.91,.44,.45,.48,.17);
    const collar=ell(root,m(0xd95c71),0,1.28,.20,.55,.085,.49);
    collar.name='dog-red-collar';
    const tag=ell(root,gold,0,1.17,.63,.13,.13,.07);
    tag.name='dog-collar-tag';
    ell(root,m(0xfff8e8),0,.87,-.44,.41,.45,.19);
  }
  if(id==='cow'){
    ell(root,m(0x33313a),-.28,1.10,.41,.17,.24,.12,.23);
    ell(root,m(0x33313a),.26,.72,.42,.20,.16,.09,-.35);
    ell(root,m(0xeeb7c0),0,.55,.43,.25,.15,.12);
  }
  const face=groupAt(root,0,id==='bunny'?1.77:1.82,.035);
  const head=ell(face,coat,0,0,0,...shape.head);
  head.name=id+'-distinct-head';
  if(id==='penguin'){
    // The little penguin has a prominent rounded white mask and gentle
    // powder-blue highlights instead of looking like a featureless dark ball.
    const mask=ell(face,ivory,0,-.06,.43,.55,.52,.16);
    mask.name='penguin-cream-face-mask';
    for(const side of [-1,1]){
      ell(face,m(0xffb5ba),side*.46,-.24,.41,.11,.075,.05);
      ell(face,m(0x47556d),side*.58,-.03,-.08,.15,.35,.20,side*.30);
    }
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
    ell(face,m(id==='penguin'?0x328ebc:id==='cat'?0x54b88e:0x413645,true),side*.277,.105,.616,.077,.117,.025);
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
      // Tall tapered rabbit ears attach to the skull, not a halo of fluff.
      const ear=groupAt(face,side*.32,.37,-.055);
      ear.name=side<0?'bunny-left-ear':'bunny-right-ear';
      ell(ear,coat,side*.025,.48,0,.14,.57,.115,-side*.11);
      ell(ear,m(0xf4b5cc),side*.025,.49,.107,.075,.40,.029,-side*.11);
      // Visible pink inset from the actual rear gameplay camera.
      ell(ear,m(0xecafc4),side*.025,.49,-.107,.080,.41,.032,-side*.11);
      ears.push(ear);
    }else if(id==='unicorn'||id==='horse'||id==='cat'){
      const ear=groupAt(face,side*.44,.47,-.04);
      const shape=triangle(ear,coat,0,.26,0,.24,.54);
      shape.rotation.z=-side*.18;
      ell(ear,m(0xf6b4c8),0,.26,.13,.095,.17,.05);
      ears.push(ear);
    }else if(id==='dog'){
      // Long ears are hinged so they flop and trail during running.
      const ear=groupAt(face,side*.53,.30,-.02);
      ear.name=side<0?'dog-left-floppy-ear':'dog-right-floppy-ear';
      ell(ear,m(0xb78156),side*.20,-.20,-.02,.24,.45,.19,side*.49);
      ell(ear,m(0xe6b18b),side*.28,-.31,-.19,.15,.23,.075,side*.42);
      ell(ear,m(0xf6cfad),side*.33,-.47,-.17,.12,.13,.09);
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
      ell(wing,m(0xfbe8ff),side*.18,.08,-.08,.25,.42,.21,side*.52);
      ell(wing,cream,side*.39,.16,-.13,.22,.34,.16,side*.74);
      ell(wing,m(0xe7d5ff),side*.53,.04,-.14,.16,.21,.11,side*.9);
    }
  }
  if(id==='horse'){
    const mane=m(0x80513d);
    for(let i=0;i<7;i++)ell(face,mane,-.35+i*.12,.55+(i%3)*.09,-.12,.16,.26,.17);
    // Cream blaze and rounded muzzle contrast with the chestnut fur.
    const blaze=ell(face,m(0xffead3),0,.12,.526,.15,.34,.05);
    blaze.name='horse-face-blaze';
    for(const side of [-1,1]){
      ell(face,m(0xffd5b2),side*.48,-.24,.30,.18,.16,.12);
      ell(face,m(0x9a6442),side*.28,-.48,.64,.045,.025,.025);
    }
  }
  if(id==='cat'){
    // Wide kitten cheeks, soft orange tabby stripes and green-glass irises.
    const stripe=m(0xc77a36);
    for(const side of [-1,0,1]){
      const mark=ell(face,stripe,side*.15,.43,.45,.075,.17,.045,-side*.22);
      mark.name='cat-tabby-forehead';
    }
    for(const side of [-1,1]){
      ell(face,m(0xffd69c),side*.50,-.27,.24,.22,.24,.19,-side*.25);
      ell(face,m(0xfff1de),side*.31,-.38,.47,.21,.16,.12);
      ell(face,m(0xe68d9f),side*.53,-.20,.40,.13,.07,.045);
    }
    const whiskMat=m(0xf4e7d9);
    for(const side of [-1,1])for(let i=-1;i<=1;i++){
      const whisker=part(face,geometries.cylinder,whiskMat,side*.57,-.32+i*.085,.52,.009,.48,.009);
      whisker.rotation.z=Math.PI/2+side*i*.13;
    }
  }
  if(id==='bunny'){
    // Two tiny cheek highlights on the face; no piled pom-pom cheeks.
    for(const side of [-1,1])
      ell(face,m(0xfff2e8),side*.38,-.28,.35,.13,.10,.10);
  }
  if(id==='cow'){
    const fringe=m(0xfff8ee);
    for(let i=0;i<3;i++)ell(face,fringe,(i-1)*.16,.52,.15,.16,.21,.16);
    // Rounded cheeks and a broader blushing muzzle make the calf read as
    // a baby animal in the front-facing character shop.
    for(const side of [-1,1]){
      ell(face,m(0xffd9de),side*.50,-.25,.34,.19,.18,.13);
      ell(face,m(0xf9aebe),side*.45,-.27,.48,.12,.08,.04);
    }
  }
  if(id==='dog'){
    ell(face,m(0xc7926d),.34,.3,.4,.18,.22,.12);
    ell(face,ink,0,-.43,.71,.1,.036,.016);
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
      // Dark tapered flippers swing with the existing gait animation.
      const flipper=ell(pivot,coat,side*.21,-.30,-.03,.24,.44,.15,-side*.36);
      flipper.name='penguin-flipper';
      ell(pivot,m(0x41516a),side*.27,-.56,-.08,.18,.21,.09,-side*.38);
    }else if(id==='bunny'){
      // Slim front arms sit beside, not in front of, the cotton tail.
      const paw=ell(pivot,coat,side*.01,-.22,.03,.135,.28,.145,-side*.12);
      paw.name='bunny-slim-front-leg';
    }else{
      const thickness=id==='cat'?.16:id==='horse'?.16:.20;
      ell(pivot,coat,side*.07,-.28,.04,thickness,.36,.18,-side*.12);
      ell(pivot,ivory,side*.08,-.55,.16,.14,.095,.18);
    }
  }
  const feet=[];
  for(const side of [-1,1]){
    const rearFacing=id==='bunny'||id==='horse'||id==='cow'||id==='dog';
    const foot=groupAt(root,side*(id==='bunny'?.25:.31),.46,rearFacing?-.15:.04);
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
  }else if(id==='cat'||id==='dog'){
    ell(tail,coat,.20,.18,-.07,.19,.45,.17,-.45);
    ell(tail,id==='cat'?ivory:coat,.41,.47,-.06,.16,.19,.15);
    if(id==='cat'){
      // A striped upright tail projects beyond the running silhouette.
      const tip=ell(tail,m(0xbb783e),.43,.50,-.09,.17,.19,.18);
      tip.name='cat-tail-tip';
      for(let i=0;i<3;i++)ell(tail,m(0xb8773c),
        .22+i*.075,.15+i*.14,-.236,.175,.062,.07,-.45);
    }
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
    ell(rear,coat,0,.99,-.34,.29,.37,.045);
    for(const side of [-1,1]){
      const thigh=ell(rear,coat,side*.23,.67,-.20,.18,.23,.13,side*.09);
      thigh.name=side<0?'bunny-left-haunch':'bunny-right-haunch';
    }
    // Small, flat pastel waist ribbon, not a scalloped pom-pom dress.
    const dressBack=groupAt(rear,0,.99,-.44);
    dressBack.name='bunny-dress-back';
    ell(dressBack,m(0xffe7ed),0,0,0,.29,.055,.06);
    const flower=groupAt(dressBack,.29,.015,-.095);
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
      const tuft=ell(mane,m(rainbow[stripe]),x,y,-.09,.12,.27+layer*.03,.17,(stripe-2)*-.11);
      tuft.name='unicorn-mane-strand';
    }
    for(let i=0;i<8;i++){
      const stripe=i%5;
      const x=-.25+(i%4)*.17;
      ell(mane,m(rainbow[stripe]),x,-.17-Math.floor(i/4)*.26,-.10,.12,.24,.16,(i%2?-.18:.18));
    }
    // Tiny iridescent ribbons and an amethyst clasp stay visible from afar.
    ell(rear,m(0xfefaff),0,1.08,-.51,.33,.37,.15);
    ell(rear,m(0xa587e3,true),0,1.36,-.64,.15,.16,.075);
    ell(rear,m(0xffe0aa,true),0,1.37,-.70,.08,.08,.055);
    // Rear-facing ear insets complement the shop-facing detail.
    for(const side of [-1,1]){
      ell(face,m(0xf0b7df),side*.45,.72,-.18,.10,.18,.06);
      ell(rear,m(0xfdf4ff),side*.58,1.08,-.30,.23,.30,.17,side*.42);
      ell(rear,m(0xdac8fd),side*.74,1.19,-.40,.20,.26,.12,side*.59);
    }
  }else if(id==='horse'){
    // A recognisable baby pony from behind: cream rump, rounded haunches,
    // long dark mane and soft fetlocks all read at small runner scale.
    const creamCoat=m(0xffedd5);
    ell(rear,creamCoat,0,.99,-.47,.46,.51,.19);
    for(const side of [-1,1]){
      ell(rear,m(0xd7a073),side*.37,.74,-.35,.26,.38,.19,-side*.14);
      ell(rear,creamCoat,side*.37,.47,-.37,.20,.16,.16);
      ell(face,m(0xf6c8a9),side*.45,.72,-.19,.105,.20,.048);
    }
    const mane=groupAt(rear,0,1.81,-.48);
    mane.name='horse-pony-mane';
    const shades=[0x72452f,0x8d5a3c,0xa36b47,0x684230];
    for(let i=0;i<11;i++){
      const x=-.29+(i%5)*.145;
      const y=.35-Math.floor(i/5)*.23;
      const strand=ell(mane,m(shades[i%shades.length]),
        x,y,-.08,.135,.24+Math.floor(i/5)*.035,.16,(i%5-2)*-.11);
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
    const stripes=m(0xba7033);
    const tabby=groupAt(rear,0,1.65,-.45);
    tabby.name='cat-tabby-back';
    for(let i=0;i<6;i++){
      const mark=ell(tabby,stripes,(i%2?-.14:.14),
        -.03-i*.20,-.055,.23,.073,.08,(i%2?-.28:.28));
      mark.name='cat-fur-stripe';
    }
    for(let i=0;i<3;i++)ell(tabby,stripes,0,.65-i*.20,-.07,.22,.07,.065);
    ell(rear,m(0xffdeb5),0,.79,-.47,.29,.33,.16);
    // A little lavender scarf with a clear bow on the back.
    const scarf=groupAt(rear,0,1.26,-.49);
    scarf.name='cat-lavender-scarf';
    ell(scarf,m(0xceaadf),0,0,0,.47,.14,.23);
    for(const side of [-1,1])ell(scarf,m(0xe5c2ed),side*.18,-.13,-.19,
      .20,.13,.11,side*.35);
    ell(scarf,m(0xffdcb4),0,-.1,-.27,.09,.09,.07);
    for(const side of [-1,1]){
      ell(rear,m(0xffcb90),side*.35,.62,-.36,.25,.30,.17,side*.19);
      ell(rear,m(0xffead7),side*.34,.38,-.48,.18,.12,.12);
      // Triangular ears remain recognisable from behind.
      ell(face,m(0xf2a2b4),side*.45,.72,-.18,.11,.15,.065);
    }
  }else if(id==='dog'){
    // Rounded cream haunches and plush shoulder tufts read well
    // from the small rear-view camera.
    const creamFur=m(0xfff5df);
    ell(rear,creamFur,0,1.03,-.48,.43,.50,.16);
    ell(rear,m(0xb98258),0,2.18,-.48,.39,.23,.10);
    for(const side of [-1,1]){
      ell(rear,creamFur,side*.37,.76,-.36,.26,.34,.21,side*.17);
      ell(rear,m(0xf8dbbd),side*.39,.45,-.44,.20,.15,.17);
      ell(rear,creamFur,side*.37,1.20,-.37,.23,.22,.18,side*.32);
      ell(face,m(0xb98661),side*.63,.12,-.17,.20,.33,.16,side*.39);
    }
    const rearCollar=ell(rear,m(0xd95c71),0,1.31,-.48,.53,.11,.17);
    rearCollar.name='dog-collar-back';
    const tag=ell(rear,m(0xffd478),0,1.20,-.64,.12,.13,.065);
    tag.name='dog-gold-tag';
    // Small harness patch and heart make Dodo distinct from other pups.
    const badge=groupAt(rear,0,.92,-.65);
    badge.name='dog-park-heart';
    for(const side of [-1,1])ell(badge,m(0xf3a2b2),side*.09,.035,0,.10,.11,.06);
    const heart=ell(badge,m(0xeb7795),0,-.09,-.025,.15,.13,.06);
    heart.rotation.z=Math.PI/4;
  }else if(id==='penguin'){
    // Oversized soft charcoal head, pale feather trim and adorable ice-blue
    // scarf are designed for the behind-the-runner camera.
    const black=m(0x202c40);
    const feather=m(0x34475f);
    const trim=m(0xd6f5ff);
    ell(rear,black,0,1.12,-.43,.52,.62,.16);
    ell(rear,black,0,2.02,-.44,.56,.54,.16);
    for(const side of [-1,1]){
      ell(rear,feather,side*.43,1.2,-.26,.21,.45,.17,side*.16);
      ell(rear,trim,side*.43,.78,-.32,.13,.22,.10,side*.22);
      ell(rear,m(0xffd38c),side*.26,.36,-.34,.24,.12,.25);
    }
    const scarf=groupAt(rear,0,1.36,-.48);
    scarf.name='penguin-blue-scarf';
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
    const spot=m(0x34343b);
    const fur=m(0xfffdf7);
    for(const side of [-1,1]){
      ell(rear,fur,side*.37,.72,-.37,.27,.38,.18,side*.20);
      ell(rear,m(0xffe5e7),side*.36,.42,-.47,.18,.13,.13);
    }
    const patches=[
      [-.24,1.25,-.51,.34,.36,.10,.25],
      [.32,.78,-.48,.28,.23,.10,-.28],
      [.08,2.21,-.49,.29,.26,.09,.12],
      [-.41,.72,-.37,.15,.16,.11,-.33]
    ];
    for(let i=0;i<patches.length;i++){
      const [x,y,z,w,h,d,tilt]=patches[i];
      const patch=ell(rear,spot,x,y,z,w,h,d,tilt);
      patch.name='cow-spot-'+i;
    }
    for(const side of [-1,1]){
      ell(face,m(0xf2b7c1),side*.77,.30,-.11,.21,.11,.08,side*.2);
    }
    const bow=groupAt(rear,0,1.29,-.54);
    bow.name='cow-pink-bow';
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
  return {group:root,pivotL,pivotR,feet,ears,tail,face,mane,wings,catTail,dogEars,dogTail,cowTail,cowEars};
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
  actor.group.rotation.z=Math.sin(t*12)*.033*pace;
  actor.group.scale.y=airborne?1.04:1;
}
